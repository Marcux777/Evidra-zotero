"""Persisted preparation, one admitted call, validated checkpoint and immutable artifact.

No SQLite lock spans I/O. An uncheckpointed send is never retried. Explicit start
can finish a durable checkpoint after restart without another model call.
"""

import asyncio
import logging
import secrets
import sqlite3
from contextlib import aclosing

from evidra.domain.errors import EvidraError
from evidra.domain.sources import SourceAccess
from evidra.extraction.forms import author, fingerprint, now
from evidra.jobs.worker import WAITING
from evidra.providers.registry import ProviderRegistry
from evidra.providers.usage import CallIdentity
from evidra.research.execution import (
    ArtifactPage,
    ArtifactReview,
    ArtifactVersion,
    ResearchAccessPage,
    ResearchControl,
    ResearchPrepare,
    ResearchPreview,
    ResearchRun,
    ResearchRunPage,
)
from evidra.research.planner import ResearchPlanner
from evidra.scope.service import ScopeContext


class ResearchService:
    def __init__(self, planner: ResearchPlanner, providers: ProviderRegistry) -> None:
        self.planner, self.providers = planner, providers
        self.scopes, self.database = planner.scopes, planner.scopes.database
        self.tasks: dict[str, asyncio.Task[None]] = {}
        self.cancels: dict[str, asyncio.Event] = {}
        self.closed = False
        with self.database.transaction() as conn:
            rows = conn.execute(
                "SELECT r.* FROM research_runs r JOIN notebooks n ON n.id=r.notebook_id "
                "WHERE n.profile_instance_id=?",
                (self.scopes.principal.profile_instance_id,),
            ).fetchall()
            for row in rows:
                run = ResearchRun.model_validate_json(row["payload"])
                if run.state != "RUNNING":
                    continue
                uncertain = not row["checkpoint"] and self.sent(conn, run)
                self.save(
                    conn,
                    run.model_copy(
                        update={
                            "state": "BILLING_UNKNOWN" if uncertain else "PAUSED",
                            "reason": "ENGINE_INTERRUPTED",
                            "revision": run.revision + 1,
                        }
                    ),
                    release=True,
                )

    @staticmethod
    def sent(conn: sqlite3.Connection, run: ResearchRun) -> bool:
        if not run.call_ids:
            return False
        row = conn.execute(
            "SELECT state FROM provider_calls WHERE call_id=?", (run.call_ids[-1],)
        ).fetchone()
        return row is not None and row[0] != "NOT_SENT"

    @staticmethod
    def save(conn: sqlite3.Connection, run: ResearchRun, *, release: bool = False) -> None:
        conn.execute(
            "UPDATE research_runs SET payload=? WHERE id=?", (run.model_dump_json(), run.id)
        )
        if release:
            conn.execute("UPDATE research_runs SET claim_token=NULL WHERE id=?", (run.id,))

    @staticmethod
    def row(conn: sqlite3.Connection, context: ScopeContext, run_id: str) -> sqlite3.Row:
        row: sqlite3.Row | None = conn.execute(
            "SELECT * FROM research_runs WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (run_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Research run not found.")
        return row

    def read(self, context: ScopeContext, run_id: str) -> ResearchRun:
        # Status-only: safe cancellation/recovery does not require native document registration.
        with self.scopes.guarded(context, capability=context.capability) as conn:
            return ResearchRun.model_validate_json(self.row(conn, context, run_id)["payload"])

    def list(self, context: ScopeContext, offset: int, limit: int) -> ResearchRunPage:
        with self.scopes.guarded(context) as conn:
            rows = conn.execute(
                "SELECT payload FROM research_runs WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY rowid DESC LIMIT ? OFFSET ?",
                (context.notebook_id, context.snapshot_id, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM research_runs WHERE notebook_id=? AND snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).fetchone()[0]
            return ResearchRunPage(
                items=[ResearchRun.model_validate_json(r[0]) for r in rows],
                offset=offset,
                limit=limit,
                total=total,
            )

    def prepare(self, context: ScopeContext, body: ResearchPrepare) -> ResearchRun:
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM research_runs WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Research preparation changed.")
                self.planner.reauthorize(
                    conn, context, ResearchPreview.model_validate_json(old["preview"]).inputs
                )
                return ResearchRun.model_validate_json(old["payload"])
        inputs = self.planner.inputs(context, body)
        profile = self.providers.profiles.authorize(
            context, body.profile_id, frozenset({"excerpts", "metadata"})
        )
        run = ResearchRun(
            id=secrets.token_hex(16),
            notebook_id=context.notebook_id,
            snapshot_id=context.snapshot_id,
            kind=body.kind,
            profile_id=profile.id,
            created_at=now(),
        )
        preview = self.planner.preview(run.id, body, inputs, profile)
        with self.scopes.guarded(context, capability="commit") as conn:
            self.planner.reauthorize(conn, context, inputs)
            if self.providers.profiles.load(conn, profile.id) != profile:
                raise EvidraError("REVISION_CONFLICT", "Provider changed during preparation.")
            old = conn.execute(
                "SELECT * FROM research_runs WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Research preparation changed.")
                return ResearchRun.model_validate_json(old["payload"])
            conn.execute(
                "INSERT INTO research_runs VALUES(?,?,?,?,?,?,?,NULL,NULL)",
                (
                    run.id,
                    run.notebook_id,
                    run.snapshot_id,
                    body.idempotency_key,
                    fingerprint(body),
                    preview.model_dump_json(),
                    run.model_dump_json(),
                ),
            )
            return run

    def preview(self, context: ScopeContext, run_id: str) -> ResearchPreview:
        with self.scopes.guarded(context) as conn:
            preview = ResearchPreview.model_validate_json(
                self.row(conn, context, run_id)["preview"]
            )
            self.planner.reauthorize(conn, context, preview.inputs)
            return preview

    def access(
        self, context: ScopeContext, run_id: str, offset: int, limit: int
    ) -> ResearchAccessPage:
        with self.scopes.guarded(context) as conn:
            preview = ResearchPreview.model_validate_json(
                self.row(conn, context, run_id)["preview"]
            )
            current = {
                a.identity.source_id: a
                for a in self.scopes.snapshot_access(conn, context.notebook_id, context.snapshot_id)
            }
            accesses: list[SourceAccess] = []
            for original in preview.inputs.access:
                candidate = current.get(original.identity.source_id)
                if candidate is None or not {(c.key, c.kind) for c in original.contents} <= {
                    (c.key, c.kind) for c in candidate.contents
                }:
                    raise EvidraError(
                        "SOURCE_REVOKED", "Research dependencies were removed from scope."
                    )
                accesses.append(candidate)
            selected = accesses[offset : offset + limit]
            ids = {a.identity.source_id for a in selected}
            documents = sorted(
                {
                    (e.source_id, e.content_key)
                    for e in preview.inputs.evidence
                    if e.source_kind == "pdf" and e.source_id in ids
                }
            )
            result = ResearchAccessPage(
                items=selected,
                documents=documents,
                offset=offset,
                limit=len(selected),
                total=len(accesses),
            )
            if len(result.model_dump_json()) > 850000:
                raise EvidraError("BODY_TOO_LARGE", "Research access page exceeds the envelope.")
            return result

    def control(self, context: ScopeContext, run_id: str, body: ResearchControl) -> ResearchRun:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            row = self.row(conn, context, run_id)
            run = ResearchRun.model_validate_json(row["payload"])
            old = conn.execute(
                "SELECT request FROM research_commands WHERE run_id=? AND idempotency_key=?",
                (run.id, body.idempotency_key),
            ).fetchone()
            if old:
                if old[0] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Research command changed.")
                return run
            if run.revision != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Research run changed.")
            if body.action == "start":
                if self.closed:
                    raise EvidraError("ENGINE_STOPPING", "Research worker is stopping.")
                if run.state not in {"PREPARED", "PAUSED", "WAITING_PROVIDER"}:
                    raise EvidraError("INVALID_REQUEST", "Run cannot start in this state.")
                if self.tasks.get(run.id) is not None and not self.tasks[run.id].done():
                    raise EvidraError("RUN_BUSY", "Prior research task is still closing.")
                if not row["checkpoint"] and self.sent(conn, run):
                    raise EvidraError(
                        "BILLING_UNKNOWN", "An uncheckpointed send cannot be retried."
                    )
                preview = ResearchPreview.model_validate_json(row["preview"])
                self.planner.reauthorize(conn, context, preview.inputs)
                if self.providers.profiles.load(conn, preview.profile.id) != preview.profile:
                    raise EvidraError(
                        "REVISION_CONFLICT", "Prepared provider changed; prepare a new run."
                    )
                if conn.execute(
                    "SELECT 1 FROM research_runs WHERE json_extract(payload,'$.state')='RUNNING'"
                ).fetchone():
                    raise EvidraError("RUN_BUSY", "Another research run is active.")
                if (
                    conn.execute(
                        "SELECT 1 FROM extraction_units WHERE lease_owner IS NOT NULL"
                    ).fetchone()
                    or conn.execute(
                        "SELECT 1 FROM conversation_runs "
                        "WHERE json_extract(payload,'$.state')='RUNNING'"
                    ).fetchone()
                ):
                    raise EvidraError("RUN_BUSY", "Another generator is active.")
                token = secrets.token_hex(16)
                conn.execute("UPDATE research_runs SET claim_token=? WHERE id=?", (token, run.id))
                run = run.model_copy(
                    update={"state": "RUNNING", "reason": None, "revision": run.revision + 1}
                )
                self.save(conn, run)
            elif body.action == "cancel":
                if run.state in {"COMPLETE", "PARTIAL", "FAILED", "CANCELLED"}:
                    raise EvidraError("INVALID_REQUEST", "Run already finished.")
                run = run.model_copy(
                    update={
                        "state": "CANCELLED",
                        "reason": "USER_CANCELLED",
                        "revision": run.revision + 1,
                    }
                )
                self.save(conn, run)
            else:
                if run.state != "BILLING_UNKNOWN":
                    raise EvidraError(
                        "INVALID_REQUEST", "No uncertain call awaits acknowledgement."
                    )
                run = run.model_copy(
                    update={
                        "state": "FAILED",
                        "reason": "UNCERTAIN_CALL_ACKNOWLEDGED_NO_RESEND",
                        "revision": run.revision + 1,
                    }
                )
                self.save(conn, run, release=True)
            conn.execute(
                "INSERT INTO research_commands VALUES(?,?,?)",
                (run.id, body.idempotency_key, fingerprint(body)),
            )
        if body.action == "start":
            cancel = asyncio.Event()
            self.cancels[run.id] = cancel
            self.tasks[run.id] = asyncio.create_task(self.execute(context, run.id, token, cancel))
        elif run.id in self.cancels:
            self.cancels[run.id].set()
        return run

    def require(
        self, conn: sqlite3.Connection, context: ScopeContext, run_id: str, token: str
    ) -> sqlite3.Row:
        row = self.row(conn, context, run_id)
        if (
            row["claim_token"] != token
            or ResearchRun.model_validate_json(row["payload"]).state != "RUNNING"
        ):
            raise EvidraError("CANCELLED", "Research claim is no longer active.")
        return row

    async def execute(
        self, context: ScopeContext, run_id: str, token: str, cancel: asyncio.Event
    ) -> None:
        try:
            with self.scopes.guarded(context, capability="commit") as conn:
                row = self.require(conn, context, run_id, token)
                run = ResearchRun.model_validate_json(row["payload"])
                body = ResearchPrepare.model_validate_json(row["request"])
                preview = ResearchPreview.model_validate_json(row["preview"])
                self.planner.reauthorize(conn, context, preview.inputs)
                checkpoint = row["checkpoint"]
                if not checkpoint:
                    if self.sent(conn, run):
                        raise EvidraError(
                            "BILLING_UNKNOWN", "Prior send has no validated checkpoint."
                        )
                    call_id = secrets.token_hex(16)
                    run = run.model_copy(update={"call_ids": [*run.call_ids, call_id]})
                    self.save(conn, run)
            if not checkpoint:
                text, final = "", False
                async with aclosing(
                    self.providers.generate(
                        context,
                        preview.profile.id,
                        self.planner.request(body, preview),
                        cancel,
                        identity=CallIdentity(call_id=call_id, job_id=run.id, session_id=run.id),
                    )
                ) as events:
                    async for event in events:
                        if event.kind == "error":
                            raise EvidraError(
                                event.code or "STREAM_INCOMPLETE", "Research generation failed."
                            )
                        if event.kind == "delta" and event.text:
                            text += event.text
                            if len(text.encode()) > 100000:
                                raise EvidraError(
                                    "OUTPUT_LIMIT", "Research output exceeds the bounded limit."
                                )
                        if event.kind == "final":
                            final = True
                if not final:
                    raise EvidraError(
                        "STREAM_INCOMPLETE", "Research generation ended without final output."
                    )
                output = self.planner.validate(text, body, preview.inputs)
                with self.scopes.guarded(context, capability="commit") as conn:
                    row = self.require(conn, context, run_id, token)
                    self.planner.reauthorize(conn, context, preview.inputs)
                    if cancel.is_set():
                        raise EvidraError("CANCELLED", "Research was cancelled before checkpoint.")
                    if self.providers.profiles.load(conn, preview.profile.id) != preview.profile:
                        raise EvidraError(
                            "REVISION_CONFLICT", "Provider changed before checkpoint."
                        )
                    checkpoint = output.model_dump_json()
                    conn.execute(
                        "UPDATE research_runs SET checkpoint=? WHERE id=?", (checkpoint, run.id)
                    )
                    self.save(conn, run.model_copy(update={"checkpointed": True}))
            # Explicit scheduling boundary makes a checkpoint useful across cancellation/restart.
            await asyncio.sleep(0)
            with self.scopes.guarded(context, capability="commit") as conn:
                row = self.require(conn, context, run_id, token)
                run = ResearchRun.model_validate_json(row["payload"])
                self.planner.reauthorize(conn, context, preview.inputs)
                if cancel.is_set():
                    raise EvidraError("CANCELLED", "Research cancelled before artifact commit.")
                output = self.planner.validate(checkpoint, body, preview.inputs)
                artifact = ArtifactVersion(
                    id=secrets.token_hex(16),
                    artifact_id=secrets.token_hex(16),
                    revision=1,
                    previous_version_id=None,
                    run_id=run.id,
                    output=output,
                    coverage=preview.inputs.coverage,
                    review_state="UNREVIEWED",
                    rationale=None,
                    author="model:" + preview.profile.model,
                    created_at=now(),
                )
                conn.execute(
                    "INSERT INTO artifact_versions VALUES(?,?,?,?,?)",
                    (artifact.id, artifact.artifact_id, 1, run.id, artifact.model_dump_json()),
                )
                self.save(
                    conn,
                    run.model_copy(
                        update={
                            "state": "COMPLETE" if artifact.coverage.complete else "PARTIAL",
                            "artifact_version_id": artifact.id,
                            "revision": run.revision + 1,
                        }
                    ),
                    release=True,
                )
        except EvidraError as exc:
            logging.getLogger("evidra.research").warning("Research %s failed: %s", run_id, exc.code)
            self.failure(run_id, token, exc.code)
        except asyncio.CancelledError:
            self.failure(run_id, token, "ENGINE_INTERRUPTED")
            raise
        except Exception:
            logging.getLogger("evidra.research").exception("Research %s failed", run_id)
            self.failure(run_id, token, "RESEARCH_INTERNAL_ERROR")
        finally:
            self.cancels.pop(run_id, None)

    def failure(self, run_id: str, token: str, code: str) -> None:
        # Status/accounting cleanup survives source revocation; it contains no research text.
        with self.database.transaction() as conn:
            row = conn.execute(
                "SELECT * FROM research_runs WHERE id=? AND claim_token=?", (run_id, token)
            ).fetchone()
            if row is None:
                return
            run = ResearchRun.model_validate_json(row["payload"])
            uncertain = not row["checkpoint"] and self.sent(conn, run)
            state = (
                "CANCELLED"
                if run.state == "CANCELLED"
                else "BILLING_UNKNOWN"
                if uncertain
                else (
                    "WAITING_PROVIDER"
                    if code in WAITING
                    else "PAUSED"
                    if code
                    in {
                        "ENGINE_INTERRUPTED",
                        "SCOPE_STALE",
                        "BRIDGE_EXPIRED",
                        "SOURCE_REVOKED",
                        "DOCUMENT_STALE",
                    }
                    else "FAILED"
                )
            )
            self.save(
                conn,
                run.model_copy(
                    update={"state": state, "reason": code, "revision": run.revision + 1}
                ),
                release=True,
            )

    async def close(self) -> None:
        self.closed = True
        for cancel in self.cancels.values():
            cancel.set()
        for task in self.tasks.values():
            task.cancel()
        await asyncio.gather(*self.tasks.values(), return_exceptions=True)

    def artifact_from_connection(
        self, conn: sqlite3.Connection, context: ScopeContext, version_id: str
    ) -> ArtifactVersion:
        row = conn.execute(
            "SELECT a.payload,r.preview FROM artifact_versions a "
            "JOIN research_runs r ON r.id=a.run_id "
            "WHERE a.id=? AND r.notebook_id=? AND r.snapshot_id=?",
            (version_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Artifact version not found.")
        self.planner.reauthorize(
            conn, context, ResearchPreview.model_validate_json(row["preview"]).inputs
        )
        return ArtifactVersion.model_validate_json(row["payload"])

    def artifact(self, context: ScopeContext, version_id: str) -> ArtifactVersion:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            return self.artifact_from_connection(conn, context, version_id)

    def versions(
        self, context: ScopeContext, version_id: str, offset: int, limit: int
    ) -> ArtifactPage:
        with self.scopes.guarded(context) as conn:
            artifact = self.artifact_from_connection(conn, context, version_id)
            rows = conn.execute(
                "SELECT id FROM artifact_versions WHERE artifact_id=? "
                "ORDER BY revision DESC LIMIT ? OFFSET ?",
                (artifact.artifact_id, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM artifact_versions WHERE artifact_id=?",
                (artifact.artifact_id,),
            ).fetchone()[0]
            return ArtifactPage(
                items=[self.artifact_from_connection(conn, context, r[0]) for r in rows],
                offset=offset,
                limit=limit,
                total=total,
            )

    def review(
        self, context: ScopeContext, version_id: str, body: ArtifactReview
    ) -> ArtifactVersion:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            original = self.artifact_from_connection(conn, context, version_id)
            old = conn.execute(
                "SELECT * FROM artifact_reviews WHERE artifact_id=? AND idempotency_key=?",
                (original.artifact_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Artifact review changed.")
                return self.artifact_from_connection(conn, context, old["version_id"])
            latest = conn.execute(
                "SELECT max(revision) FROM artifact_versions WHERE artifact_id=?",
                (original.artifact_id,),
            ).fetchone()[0]
            if original.revision != body.expected_revision or latest != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Artifact changed after review.")
            row = self.row(conn, context, original.run_id)
            preview = ResearchPreview.model_validate_json(row["preview"])
            output = body.corrected_output or original.output
            self.planner.validate(
                output.model_dump_json(),
                ResearchPrepare.model_validate_json(row["request"]),
                preview.inputs,
            )
            artifact = original.model_copy(
                update={
                    "id": secrets.token_hex(16),
                    "revision": original.revision + 1,
                    "previous_version_id": original.id,
                    "output": output,
                    "review_state": body.action,
                    "rationale": body.rationale,
                    "author": author(context),
                    "created_at": now(),
                }
            )
            conn.execute(
                "INSERT INTO artifact_versions VALUES(?,?,?,?,?)",
                (
                    artifact.id,
                    artifact.artifact_id,
                    artifact.revision,
                    artifact.run_id,
                    artifact.model_dump_json(),
                ),
            )
            conn.execute(
                "INSERT INTO artifact_reviews VALUES(?,?,?,?)",
                (artifact.artifact_id, body.idempotency_key, fingerprint(body), artifact.id),
            )
            return artifact
