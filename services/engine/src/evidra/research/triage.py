"""Relevance triage: sequential screening batches, a reviewable queue and decision adoption.

A batch prepares one ordinary research run per study (each with its own persisted preview)
and starts them one at a time after a single explicit start. Runs keep every per-run
guarantee: checkpoint, billing uncertainty, cancellation and immutable artifacts. The batch
pauses instead of continuing when a run ends waiting for the provider, paused or with an
uncertain send. Model proposals never become decisions; adoption records a human decision
from a human-reviewed artifact.
"""

import asyncio
import hashlib
import logging
import secrets
import sqlite3
from collections.abc import Callable

from evidra.domain.errors import EvidraError
from evidra.extraction.forms import fingerprint, now
from evidra.providers.models import ContentCategory
from evidra.research.execution import (
    ArtifactVersion,
    ResearchControl,
    ResearchPrepare,
    ResearchPreview,
    ResearchRun,
    ScreeningBatch,
    ScreeningBatchControl,
    ScreeningBatchItem,
    ScreeningBatchPage,
    ScreeningBatchPrepare,
    ScreeningBatchView,
    ScreeningOutput,
    ScreeningQueuePage,
    ScreeningQueueRequest,
    ScreeningQueueRow,
)
from evidra.research.models import ScreeningAdopt, ScreeningDecision, ScreeningWrite, Stage
from evidra.research.service import ResearchService
from evidra.scope.service import ScopeContext
from evidra.screening.service import ScreeningService

# A run ending in one of these states needs attention before more sends.
PAUSING = {"BILLING_UNKNOWN", "WAITING_PROVIDER", "PAUSED"}
# Refusals caused by configuration, identical for every remaining study.
CONFIGURATION = {
    "PRICE_UNKNOWN",
    "TOKEN_BOUND_REQUIRED",
    "CURRENCY_MISMATCH",
    "CONSENT_REQUIRED",
    "API_BLOCKED",
    "PROVIDER_AUTH_ERROR",
    "CAPABILITY_UNSUPPORTED",
}
CATEGORIES: frozenset[ContentCategory] = frozenset({"excerpts", "metadata"})
STARTABLE = {"PREPARED", "PAUSED", "WAITING_PROVIDER"}


class TriageService:
    def __init__(self, research: ResearchService, screening: ScreeningService) -> None:
        self.research, self.screening = research, screening
        self.planner, self.scopes = research.planner, research.scopes
        self.database = research.database
        self.tasks: dict[str, asyncio.Task[None]] = {}
        self.cancels: dict[str, asyncio.Event] = {}
        self.closed = False
        with self.database.transaction() as conn:
            rows = conn.execute(
                "SELECT b.* FROM screening_batches b JOIN notebooks n ON n.id=b.notebook_id "
                "WHERE n.profile_instance_id=?",
                (self.scopes.principal.profile_instance_id,),
            ).fetchall()
            for row in rows:
                batch = ScreeningBatch.model_validate_json(row["payload"])
                if batch.state == "RUNNING":
                    self.save(
                        conn,
                        batch.model_copy(
                            update={
                                "state": "PAUSED",
                                "reason": "ENGINE_INTERRUPTED",
                                "revision": batch.revision + 1,
                            }
                        ),
                        release=True,
                    )

    @staticmethod
    def save(conn: sqlite3.Connection, batch: ScreeningBatch, *, release: bool = False) -> None:
        conn.execute(
            "UPDATE screening_batches SET payload=? WHERE id=?", (batch.model_dump_json(), batch.id)
        )
        if release:
            conn.execute("UPDATE screening_batches SET claim_token=NULL WHERE id=?", (batch.id,))

    @staticmethod
    def row(conn: sqlite3.Connection, context: ScopeContext, batch_id: str) -> sqlite3.Row:
        row: sqlite3.Row | None = conn.execute(
            "SELECT * FROM screening_batches WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (batch_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Screening batch not found.")
        return row

    # Preparation -----------------------------------------------------------------------

    def human_excluded(
        self, conn: sqlite3.Connection, context: ScopeContext, protocol: str
    ) -> set[str]:
        """Studies whose every reviewer's latest title/abstract decision is EXCLUDE."""
        latest: dict[str, dict[str, str]] = {}
        for row in conn.execute(
            "SELECT payload FROM screening_decisions WHERE notebook_id=? AND snapshot_id=? "
            "AND protocol_version_id=? AND stage='TITLE_ABSTRACT' ORDER BY revision",
            (context.notebook_id, context.snapshot_id, protocol),
        ):
            decision = ScreeningDecision.model_validate_json(row[0])
            latest.setdefault(decision.source_id, {})[decision.reviewer] = decision.decision
        return {s for s, d in latest.items() if d and set(d.values()) == {"EXCLUDE"}}

    def prepare(self, context: ScopeContext, body: ScreeningBatchPrepare) -> ScreeningBatchView:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM screening_batches WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Screening batch changed.")
                return self.view(conn, context, ScreeningBatch.model_validate_json(old["payload"]))
            self.planner.protocols.from_connection(conn, context, body.protocol_version_id)
            sources = [
                self.scopes.content(conn, r)
                for r in self.scopes.members(conn, context.notebook_id, context.snapshot_id)
            ]
            excluded = (
                self.human_excluded(conn, context, body.protocol_version_id)
                if body.selection == "NOT_HUMAN_EXCLUDED"
                else set()
            )
        current = {s.id: s for s in sources if s.id in context.source_ids}
        wanted = body.source_ids or list(current)
        # Stable across replays of the same request, so child runs are found again.
        batch_id = hashlib.sha256(
            f"{context.notebook_id}:{context.snapshot_id}:{body.idempotency_key}".encode()
        ).hexdigest()[:32]
        # Fails before any preparation when the profile lacks consent or is blocked.
        profile = self.research.providers.profiles.authorize(context, body.profile_id, CATEGORIES)
        items: list[ScreeningBatchItem] = []
        estimate = output = 0
        for source_id in dict.fromkeys(wanted):
            source = current.get(source_id)
            if source is None:
                items.append(
                    ScreeningBatchItem(
                        source_id=source_id, title="", run_id=None, skipped="SOURCE_REVOKED"
                    )
                )
                continue
            if source_id in excluded:
                items.append(
                    ScreeningBatchItem(
                        source_id=source_id,
                        title=source.title,
                        run_id=None,
                        skipped="HUMAN_EXCLUDED",
                    )
                )
                continue
            request = ResearchPrepare(
                kind="SCREENING",
                protocol_version_id=body.protocol_version_id,
                profile_id=body.profile_id,
                source_id=source_id,
                stage=body.stage,
                question=body.question,
                context_tokens=body.context_tokens,
                max_output_tokens=body.max_output_tokens,
                ollama_options=body.ollama_options,
                idempotency_key=f"batch:{batch_id}:{source_id}",
            )
            try:
                if not self.planner.inputs(context, request).evidence:
                    items.append(
                        ScreeningBatchItem(
                            source_id=source_id,
                            title=source.title,
                            run_id=None,
                            skipped="NO_CONTENT",
                        )
                    )
                    continue
                run = self.research.prepare(context, request, batch_id=batch_id)
                with self.scopes.guarded(context, capability=context.capability) as conn:
                    preview = ResearchPreview.model_validate_json(
                        self.research.row(conn, context, run.id)["preview"]
                    )
            except EvidraError as exc:
                if exc.code in {"SCOPE_STALE", "BRIDGE_EXPIRED", "SCOPE_DENIED"}:
                    raise
                items.append(
                    ScreeningBatchItem(
                        source_id=source_id, title=source.title, run_id=None, skipped=exc.code
                    )
                )
                continue
            estimate += preview.estimated_input_tokens
            output += request.max_output_tokens
            items.append(ScreeningBatchItem(source_id=source_id, title=source.title, run_id=run.id))
        batch = ScreeningBatch(
            id=batch_id,
            notebook_id=context.notebook_id,
            snapshot_id=context.snapshot_id,
            revision=0,
            protocol_version_id=body.protocol_version_id,
            stage=body.stage,
            profile_id=body.profile_id,
            items=items,
            estimated_input_tokens=estimate,
            max_output_tokens=output,
            created_at=now(),
            destination=f"{profile.adapter} / {profile.model} / {profile.base_url}",
            mode=profile.mode,
            categories=sorted(CATEGORIES),
        )
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM screening_batches WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Screening batch changed.")
                return self.view(conn, context, ScreeningBatch.model_validate_json(old["payload"]))
            conn.execute(
                "INSERT INTO screening_batches VALUES(?,?,?,?,?,?,NULL)",
                (
                    batch.id,
                    batch.notebook_id,
                    batch.snapshot_id,
                    body.idempotency_key,
                    fingerprint(body),
                    batch.model_dump_json(),
                ),
            )
            return self.view(conn, context, batch)

    # Reading ---------------------------------------------------------------------------

    def view(
        self, conn: sqlite3.Connection, context: ScopeContext, batch: ScreeningBatch
    ) -> ScreeningBatchView:
        states: dict[str, int] = {}
        for item in batch.items:
            if item.run_id is None:
                continue
            run = ResearchRun.model_validate_json(
                self.research.row(conn, context, item.run_id)["payload"]
            )
            states[run.state] = states.get(run.state, 0) + 1
        return ScreeningBatchView(batch=batch, run_states=states)

    def read(self, context: ScopeContext, batch_id: str) -> ScreeningBatchView:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            batch = ScreeningBatch.model_validate_json(self.row(conn, context, batch_id)["payload"])
            batch = batch.model_copy(
                update={"items": [i for i in batch.items if i.source_id in context.source_ids]}
            )
            return self.view(conn, context, batch)

    def list(self, context: ScopeContext, offset: int, limit: int) -> ScreeningBatchPage:
        with self.scopes.guarded(context) as conn:
            rows = conn.execute(
                "SELECT payload FROM screening_batches WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY rowid DESC LIMIT ? OFFSET ?",
                (context.notebook_id, context.snapshot_id, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM screening_batches WHERE notebook_id=? AND snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).fetchone()[0]
            items = []
            for row in rows:
                batch = ScreeningBatch.model_validate_json(row[0])
                items.append(
                    batch.model_copy(
                        update={
                            "items": [i for i in batch.items if i.source_id in context.source_ids]
                        }
                    )
                )
            return ScreeningBatchPage(items=items, offset=offset, limit=limit, total=total)

    # Execution -------------------------------------------------------------------------

    def control(
        self, context: ScopeContext, batch_id: str, body: ScreeningBatchControl
    ) -> ScreeningBatchView:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            row = self.row(conn, context, batch_id)
            batch = ScreeningBatch.model_validate_json(row["payload"])
            old = conn.execute(
                "SELECT request FROM screening_batch_commands WHERE batch_id=? "
                "AND idempotency_key=?",
                (batch.id, body.idempotency_key),
            ).fetchone()
            if old:
                if old[0] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Batch command changed.")
                return self.view(conn, context, batch)
            if batch.revision != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Screening batch changed.")
            token = ""
            if body.action == "start":
                if self.closed:
                    raise EvidraError("ENGINE_STOPPING", "Triage worker is stopping.")
                if batch.state not in {"PREPARED", "PAUSED"}:
                    raise EvidraError("INVALID_REQUEST", "Batch cannot start in this state.")
                task = self.tasks.get(batch.id)
                if task is not None and not task.done():
                    raise EvidraError("RUN_BUSY", "Prior batch task is still closing.")
                token = secrets.token_hex(16)
                conn.execute(
                    "UPDATE screening_batches SET claim_token=? WHERE id=?", (token, batch.id)
                )
                batch = batch.model_copy(
                    update={"state": "RUNNING", "reason": None, "revision": batch.revision + 1}
                )
                self.save(conn, batch)
            else:
                if batch.state in {"COMPLETE", "CANCELLED"}:
                    raise EvidraError("INVALID_REQUEST", "Batch already finished.")
                batch = batch.model_copy(
                    update={
                        "state": "CANCELLED",
                        "reason": "USER_CANCELLED",
                        "revision": batch.revision + 1,
                    }
                )
                self.save(conn, batch, release=True)
            conn.execute(
                "INSERT INTO screening_batch_commands VALUES(?,?,?)",
                (batch.id, body.idempotency_key, fingerprint(body)),
            )
            view = self.view(conn, context, batch)
        if body.action == "start":
            cancel = asyncio.Event()
            self.cancels[batch.id] = cancel
            self.tasks[batch.id] = asyncio.create_task(
                self.execute(context, batch.id, token, cancel)
            )
        elif batch.id in self.cancels:
            self.cancels[batch.id].set()
        return view

    def finish(self, batch_id: str, token: str, state: str, reason: str | None) -> None:
        with self.database.transaction() as conn:
            row = conn.execute(
                "SELECT payload FROM screening_batches WHERE id=? AND claim_token=?",
                (batch_id, token),
            ).fetchone()
            if row is None:
                return
            batch = ScreeningBatch.model_validate_json(row[0])
            self.save(
                conn,
                batch.model_copy(
                    update={"state": state, "reason": reason, "revision": batch.revision + 1}
                ),
                release=True,
            )

    async def execute(
        self, context: ScopeContext, batch_id: str, token: str, cancel: asyncio.Event
    ) -> None:
        state, reason = "COMPLETE", None
        try:
            with self.scopes.guarded(context, capability=context.capability) as conn:
                batch = ScreeningBatch.model_validate_json(
                    self.row(conn, context, batch_id)["payload"]
                )
            for item in batch.items:
                if cancel.is_set():
                    state, reason = "CANCELLED", "USER_CANCELLED"
                    break
                if item.run_id is None:
                    continue
                run = self.research.read(context, item.run_id)
                if run.state not in STARTABLE:
                    continue
                try:
                    self.research.control(
                        context,
                        run.id,
                        ResearchControl(
                            action="start",
                            expected_revision=run.revision,
                            idempotency_key=f"batch:{batch_id}:{run.revision}",
                        ),
                    )
                except EvidraError as exc:
                    # A prepared run binds its exact provider revision; a pause for rate
                    # limits or any profile change makes the rest stale until re-prepared.
                    stale = exc.code == "REVISION_CONFLICT"
                    state, reason = "PAUSED", "PREPARED_RUN_STALE" if stale else exc.code
                    break
                task = self.research.tasks.get(run.id)
                if task is not None:
                    waiter = asyncio.create_task(cancel.wait())
                    await asyncio.wait({task, waiter}, return_when=asyncio.FIRST_COMPLETED)
                    waiter.cancel()
                    if cancel.is_set() and not task.done():
                        current = self.research.read(context, run.id)
                        if current.state == "RUNNING":
                            self.research.control(
                                context,
                                run.id,
                                ResearchControl(
                                    action="cancel",
                                    expected_revision=current.revision,
                                    idempotency_key=f"batch-cancel:{batch_id}:{current.revision}",
                                ),
                            )
                        await asyncio.gather(task, return_exceptions=True)
                final = self.research.read(context, run.id)
                if cancel.is_set():
                    state, reason = "CANCELLED", "USER_CANCELLED"
                    break
                if final.state in PAUSING:
                    state, reason = "PAUSED", f"RUN_{final.state}"
                    break
                if final.state == "FAILED" and final.reason in CONFIGURATION:
                    # The same refusal would repeat for every study; stop and explain.
                    state, reason = "PAUSED", f"RUN_{final.reason}"
                    break
        except EvidraError as exc:
            logging.getLogger("evidra.triage").warning("Batch %s paused: %s", batch_id, exc.code)
            state, reason = "PAUSED", exc.code
        except asyncio.CancelledError:
            self.finish(batch_id, token, "PAUSED", "ENGINE_INTERRUPTED")
            raise
        except Exception:
            logging.getLogger("evidra.triage").exception("Batch %s failed", batch_id)
            state, reason = "PAUSED", "TRIAGE_INTERNAL_ERROR"
        finally:
            self.cancels.pop(batch_id, None)
            if self.tasks.get(batch_id) is asyncio.current_task():
                self.tasks.pop(batch_id)
        self.finish(batch_id, token, state, reason)

    async def close(self) -> None:
        self.closed = True
        for cancel in self.cancels.values():
            cancel.set()
        for task in self.tasks.values():
            task.cancel()
        await asyncio.gather(*self.tasks.values(), return_exceptions=True)

    # Queue and adoption ----------------------------------------------------------------

    def queue(self, context: ScopeContext, body: ScreeningQueueRequest) -> ScreeningQueuePage:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            self.planner.protocols.from_connection(conn, context, body.protocol_version_id)
            sources = [
                self.scopes.content(conn, r)
                for r in self.scopes.members(conn, context.notebook_id, context.snapshot_id)
            ]
            sources = [s for s in sources if s.id in context.source_ids]
            latest: dict[str, sqlite3.Row] = {}
            for row in conn.execute(
                "SELECT id,request,payload,preview FROM research_runs "
                "WHERE notebook_id=? AND snapshot_id=? ORDER BY rowid",
                (context.notebook_id, context.snapshot_id),
            ):
                request = ResearchPrepare.model_validate_json(row["request"])
                if (
                    request.kind == "SCREENING"
                    and request.protocol_version_id == body.protocol_version_id
                    and request.stage == body.stage
                    and request.source_id is not None
                ):
                    latest[request.source_id] = row
            human: dict[str, dict[str, ScreeningDecision]] = {}
            for row in conn.execute(
                "SELECT payload FROM screening_decisions WHERE notebook_id=? AND snapshot_id=? "
                "AND protocol_version_id=? AND stage=? ORDER BY revision",
                (context.notebook_id, context.snapshot_id, body.protocol_version_id, body.stage),
            ):
                decision = ScreeningDecision.model_validate_json(row[0])
                human.setdefault(decision.source_id, {})[decision.reviewer] = decision
            rows = [
                self.queue_row(
                    conn,
                    context,
                    source.id,
                    source.title,
                    source.year,
                    latest.get(source.id),
                    human.get(source.id, {}),
                )
                for source in sources
            ]
        rows.sort(key=sort_key(body.sort))
        return ScreeningQueuePage(
            items=rows[body.offset : body.offset + body.limit],
            offset=body.offset,
            limit=body.limit,
            total=len(rows),
        )

    def queue_row(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        source_id: str,
        title: str,
        year: int | None,
        run_row: sqlite3.Row | None,
        human: dict[str, ScreeningDecision],
    ) -> ScreeningQueueRow:
        run = ResearchRun.model_validate_json(run_row["payload"]) if run_row else None
        artifact: ArtifactVersion | None = None
        available = False
        if run_row is not None and run is not None and run.artifact_version_id:
            first = conn.execute(
                "SELECT artifact_id FROM artifact_versions WHERE id=?", (run.artifact_version_id,)
            ).fetchone()
            payload = conn.execute(
                "SELECT payload FROM artifact_versions WHERE artifact_id=? "
                "ORDER BY revision DESC LIMIT 1",
                (first[0],),
            ).fetchone()
            artifact = ArtifactVersion.model_validate_json(payload[0])
            try:
                self.planner.reauthorize(
                    conn, context, ResearchPreview.model_validate_json(run_row["preview"]).inputs
                )
                available = True
            except EvidraError:
                available = False
        output = (
            artifact.output
            if artifact and available and isinstance(artifact.output, ScreeningOutput)
            else None
        )
        decisions = sorted(human.values(), key=lambda d: d.reviewer)
        return ScreeningQueueRow(
            source_id=source_id,
            title=title,
            year=year,
            run_id=run.id if run else None,
            run_state=run.state if run else None,
            run_reason=run.reason if run else None,
            artifact_version_id=artifact.id if artifact else None,
            review_state=artifact.review_state if artifact else None,
            artifact_available=available,
            output=output,
            human=decisions,
            conflict=len({d.decision for d in decisions}) > 1,
        )

    def adopt(self, context: ScopeContext, body: ScreeningAdopt) -> ScreeningDecision:
        """Record a human decision from a screening artifact a human approved or corrected."""
        self.scopes.authorize(context.principal, "manage")
        request_fingerprint = fingerprint(body)
        with self.scopes.guarded(context, capability="commit") as conn:
            # A replay returns its recorded decision even after newer artifact versions.
            replay = self.screening.existing(
                conn, context, body.idempotency_key, request_fingerprint
            )
            if replay is not None:
                return replay
            artifact = self.research.artifact_from_connection(
                conn, context, body.artifact_version_id
            )
            latest = conn.execute(
                "SELECT max(revision) FROM artifact_versions WHERE artifact_id=?",
                (artifact.artifact_id,),
            ).fetchone()[0]
            if artifact.revision != latest:
                raise EvidraError("REVISION_CONFLICT", "A newer artifact version exists.")
            if artifact.review_state not in {"APPROVED", "CORRECTED"}:
                raise EvidraError(
                    "INVALID_REQUEST", "Only a human-approved or corrected proposal can be adopted."
                )
            if not isinstance(artifact.output, ScreeningOutput):
                raise EvidraError("INVALID_REQUEST", "Only screening proposals become decisions.")
            request = ResearchPrepare.model_validate_json(
                self.research.row(conn, context, artifact.run_id)["request"]
            )
            output = artifact.output
            stage: Stage = request.stage or "FULL_TEXT"
            assert request.source_id is not None
            # Validation and the decision write share one transaction: no review can land
            # between them. The idempotent identity includes the adopted artifact version.
            return self.screening.write(
                conn,
                context,
                ScreeningWrite(
                    protocol_version_id=request.protocol_version_id,
                    source_id=request.source_id,
                    stage=stage,
                    reviewer=body.reviewer,
                    decision=output.decision,
                    criterion_ids=output.criterion_ids,
                    rationale=output.rationale,
                    expected_revision=body.expected_revision,
                    idempotency_key=body.idempotency_key,
                ),
                request=request_fingerprint,
                adopted=artifact.id,
            )


def sort_key(sort: str) -> Callable[[ScreeningQueueRow], tuple[object, ...]]:
    def grade(row: ScreeningQueueRow) -> tuple[int, str]:
        value = row.output.relevance_grade if row.output else None
        return (-(value if value is not None else -1), row.title.casefold())

    def attention(row: ScreeningQueueRow) -> tuple[int, int, str]:
        # Unreviewed proposals first (uncertain before others), then undecided, then settled.
        decided = bool(row.human)
        uncertain = bool(row.output and row.output.decision == "UNCERTAIN")
        rank = 3 if decided and not row.conflict else 0 if uncertain else 1 if row.output else 2
        value = row.output.relevance_grade if row.output else None
        return (rank, -(value if value is not None else -1), row.title.casefold())

    if sort == "GRADE":
        return grade
    if sort == "ATTENTION":
        return attention
    return lambda row: (row.title.casefold(), row.source_id)
