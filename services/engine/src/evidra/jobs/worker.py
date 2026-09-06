"""One generator pump; parsing remains owned by IngestionService."""

import asyncio
import json
import logging
import secrets
from contextlib import aclosing

from evidra.domain.errors import EvidraError
from evidra.jobs.models import JobRecord, UnitRecord
from evidra.jobs.queue import JobQueue
from evidra.providers.usage import CallIdentity
from evidra.scope.service import ScopeContext

WAITING = {
    "RATE_LIMITED",
    "PROVIDER_PAUSED",
    "BUDGET_EXCEEDED",
    "PRICE_UNKNOWN",
    "TOKEN_BOUND_REQUIRED",
    "PROVIDER_SECRET_REQUIRED",
    "CONSENT_REQUIRED",
    "API_BLOCKED",
    "RUN_BUSY",
}


class JobWorker:
    def __init__(self, queue: JobQueue) -> None:
        self.queue = queue
        self.contexts: dict[str, ScopeContext] = {}
        self.task: asyncio.Task[None] | None = None
        self.active: tuple[str, asyncio.Event] | None = None
        self.closed = False

    def start(self, context: ScopeContext, job_id: str) -> None:
        if self.closed:
            raise EvidraError("ENGINE_STOPPING", "Extraction worker is stopping.")
        self.contexts[job_id] = context
        if self.task is None or self.task.done():
            self.task = asyncio.create_task(self.run())

    def stop(self, job_id: str) -> None:
        self.contexts.pop(job_id, None)
        if self.active and self.active[0] == job_id:
            self.active[1].set()

    async def close(self) -> None:
        self.closed = True
        if self.active:
            self.active[1].set()
        if self.task:
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)

    async def run(self) -> None:
        while self.contexts and not self.closed:
            progressed = False
            for job_id, context in list(self.contexts.items()):
                try:
                    job = self.queue.get(context, job_id)
                    if job.state not in {"QUEUED", "RUNNING"}:
                        self.contexts.pop(job_id, None)
                        continue
                    progressed |= await self.step(context, job_id)
                except EvidraError as exc:
                    self.failure(job_id, None, exc.code)
                    self.contexts.pop(job_id, None)
                except Exception:
                    logging.getLogger("evidra.jobs").exception("Extraction job failed: %s", job_id)
                    self.failure(job_id, None, "JOB_INTERNAL_ERROR")
                    self.contexts.pop(job_id, None)
            if not progressed and self.contexts:
                await asyncio.sleep(0.1)

    async def renew(
        self, context: ScopeContext, job_id: str, unit_id: str, cancel: asyncio.Event
    ) -> None:
        while not cancel.is_set():
            try:
                await asyncio.wait_for(cancel.wait(), timeout=10)
            except TimeoutError:
                try:
                    self.queue.renew(context, job_id, unit_id)
                except EvidraError as exc:
                    self.failure(job_id, unit_id, exc.code)
                    cancel.set()

    async def step(self, context: ScopeContext, job_id: str) -> bool:
        queue = self.queue
        unit = queue.claim(context, job_id)
        if unit is None:
            return False
        cancel = asyncio.Event()
        self.active = (job_id, cancel)
        renewal = asyncio.create_task(self.renew(context, job_id, unit.id, cancel))
        try:
            with queue.scopes.guarded(context, capability="commit") as conn:
                job, unit = queue.require_lease(conn, context, job_id, unit.id)
                row = conn.execute(
                    "SELECT cache_key FROM extraction_units WHERE id=?", (unit.id,)
                ).fetchone()
                cached = (
                    None
                    if job.request.force_new
                    else queue.cache.read(conn, context, job, unit, row[0])
                )
                if cached:
                    queue.save_unit(conn, cached, release=True)
                    queue.summarize(conn, job)
                    return True
            for index in range(unit.batches_total):
                with queue.scopes.guarded(context, capability="commit") as conn:
                    job, unit = queue.require_lease(conn, context, job_id, unit.id)
                    batch = conn.execute(
                        "SELECT * FROM extraction_batches WHERE unit_id=? AND batch_index=?",
                        (unit.id, index),
                    ).fetchone()
                    if batch["output"] is not None:
                        continue
                    if cancel.is_set():
                        raise EvidraError("CANCELLED", "Extraction cancelled before dispatch.")
                    if queue.providers.profiles.load(conn, job.profile.id) != job.profile:
                        raise EvidraError("REVISION_CONFLICT", "Prepared provider changed.")
                    previous = conn.execute(
                        "SELECT state FROM provider_calls WHERE call_id=?", (batch["call_id"],)
                    ).fetchone()
                    call_id = batch["call_id"]
                    if previous:
                        if previous[0] != "NOT_SENT":
                            raise EvidraError(
                                "BILLING_UNKNOWN",
                                "Prior send has no committed output; reconcile explicitly.",
                            )
                        # Only explicit resume reaches this path; NOT_SENT proves no dispatch.
                        call_id = secrets.token_hex(16)
                        conn.execute(
                            "UPDATE extraction_batches SET call_id=?,prior_call_ids=? "
                            "WHERE unit_id=? AND batch_index=?",
                            (
                                call_id,
                                json.dumps(
                                    [*json.loads(batch["prior_call_ids"]), batch["call_id"]]
                                ),
                                unit.id,
                                index,
                            ),
                        )
                    preview = queue.runner.preview(conn, context, job, unit, index)
                    field, _ = queue.runner.matrix.target(
                        conn, context, job.request.form_version_id, unit.source_id, unit.field_key
                    )
                    evidence = [
                        queue.runner.evidence.from_connection(conn, context, e)
                        for e in json.loads(batch["evidence_ids"])
                    ]
                    if call_id not in unit.call_ids:
                        unit = unit.model_copy(update={"call_ids": [*unit.call_ids, call_id]})
                        queue.save_unit(conn, unit)
                # No await separates the above cancellation/lease check from registry reservation.
                text, final = "", False
                async with aclosing(
                    queue.providers.generate(
                        context,
                        job.profile.id,
                        queue.runner.request(job, preview),
                        cancel,
                        identity=CallIdentity(call_id=call_id, job_id=job.id, session_id=job.id),
                    )
                ) as events:
                    async for event in events:
                        if event.kind == "error":
                            raise EvidraError(
                                event.code or "STREAM_INCOMPLETE", "Provider rejected extraction."
                            )
                        if event.kind == "delta" and event.text:
                            text += event.text
                            if len(text.encode()) > 100000:
                                raise EvidraError(
                                    "OUTPUT_LIMIT", "Extraction output exceeds the bounded size."
                                )
                        if event.kind == "final":
                            final = True
                if not final:
                    raise EvidraError("STREAM_INCOMPLETE", "Provider ended without a final result.")
                output = queue.runner.validate(text, field, evidence)
                with queue.scopes.guarded(context, capability="commit") as conn:
                    job, unit = queue.require_lease(conn, context, job_id, unit.id)
                    if cancel.is_set():
                        raise EvidraError("CANCELLED", "Extraction cancelled before checkpoint.")
                    queue.runner.reauthorize(conn, context, job, unit)
                    if queue.providers.profiles.load(conn, job.profile.id) != job.profile:
                        raise EvidraError(
                            "REVISION_CONFLICT", "Provider changed before checkpoint."
                        )
                    conn.execute(
                        "UPDATE extraction_batches SET output=? WHERE unit_id=? AND batch_index=? "
                        "AND output IS NULL",
                        (output.model_dump_json(), unit.id, index),
                    )
                    unit = unit.model_copy(
                        update={
                            "batches_processed": index + 1,
                            "coverage": queue.runner.progress(conn, context, unit),
                        }
                    )
                    queue.save_unit(conn, unit)
                    queue.summarize(conn, job)
            with queue.scopes.guarded(context, capability="commit") as conn:
                job, unit = queue.require_lease(conn, context, job_id, unit.id)
                if cancel.is_set():
                    raise EvidraError("CANCELLED", "Extraction cancelled before proposal commit.")
                completed = queue.runner.complete(conn, context, job, unit)
                queue.save_unit(conn, completed, release=True)
                cache_key = conn.execute(
                    "SELECT cache_key FROM extraction_units WHERE id=?", (unit.id,)
                ).fetchone()[0]
                queue.cache.write(conn, context, completed, cache_key)
                queue.summarize(conn, job)
            return True
        except EvidraError as exc:
            logging.getLogger("evidra.jobs").warning(
                "Extraction unit %s failed: %s", unit.id, exc.code
            )
            self.failure(job_id, unit.id, exc.code)
            return True
        except asyncio.CancelledError:
            self.failure(job_id, unit.id, "ENGINE_INTERRUPTED")
            raise
        except Exception:
            logging.getLogger("evidra.jobs").exception("Extraction unit failed: %s", unit.id)
            self.failure(job_id, unit.id, "JOB_INTERNAL_ERROR")
            return True
        finally:
            cancel.set()
            await renewal
            self.active = None

    def failure(self, job_id: str, unit_id: str | None, code: str) -> None:
        # Accounting/status cleanup must survive scope revocation; it writes no research output.
        queue = self.queue
        with queue.database.transaction() as conn:
            row = conn.execute(
                "SELECT j.payload FROM extraction_jobs j JOIN notebooks n ON n.id=j.notebook_id "
                "WHERE j.id=? AND n.profile_instance_id=?",
                (job_id, queue.scopes.principal.profile_instance_id),
            ).fetchone()
            if not row:
                return
            job = JobRecord.model_validate_json(row[0])
            uncertain = False
            if unit_id:
                entry = conn.execute(
                    "SELECT payload,lease_owner FROM extraction_units WHERE id=? AND job_id=?",
                    (unit_id, job.id),
                ).fetchone()
                if not entry or entry[1] != queue.owner:
                    return
                unit = UnitRecord.model_validate_json(entry[0])
                sent = conn.execute(
                    "SELECT p.state FROM extraction_batches b "
                    "JOIN provider_calls p ON p.call_id=b.call_id "
                    "WHERE b.unit_id=? AND b.output IS NULL",
                    (unit_id,),
                ).fetchall()
                uncertain = (
                    any(r[0] in {"SENT", "BILLING_UNKNOWN"} for r in sent)
                    or code == "BILLING_UNKNOWN"
                )
                not_sent = all(r[0] == "NOT_SENT" for r in sent)
                state = (
                    "BILLING_UNKNOWN"
                    if uncertain
                    else "QUEUED"
                    if not_sent and (code in WAITING or code in {"CANCELLED", "ENGINE_INTERRUPTED"})
                    else "FAILED"
                )
                queue.save_unit(
                    conn, unit.model_copy(update={"state": state, "reason": code}), release=True
                )
            if job.state not in {"CANCELLED", "PAUSED"}:
                state = (
                    "WAITING_PROVIDER"
                    if uncertain or code in WAITING
                    else "PAUSED"
                    if code
                    in {
                        "SCOPE_STALE",
                        "BRIDGE_EXPIRED",
                        "SOURCE_REVOKED",
                        "ENGINE_INTERRUPTED",
                        "DOCUMENT_STALE",
                    }
                    else "RUNNING"
                    if unit_id
                    else "FAILED"
                )
                job = job.model_copy(
                    update={"state": state, "reason": "BILLING_UNKNOWN" if uncertain else code}
                )
            elif uncertain and job.state == "PAUSED":
                job = job.model_copy(
                    update={"state": "WAITING_PROVIDER", "reason": "BILLING_UNKNOWN"}
                )
            queue.summarize(conn, job)
