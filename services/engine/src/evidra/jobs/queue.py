"""SQLite queue/CAS/lease ownership. No database lock is held across provider I/O."""

import json
import secrets
import sqlite3
import time
from collections.abc import Callable

from evidra.domain.errors import EvidraError
from evidra.extraction.forms import fingerprint, now
from evidra.extraction.runner import SYSTEM, ExtractionRunner
from evidra.jobs.cache import ExtractionCache
from evidra.jobs.models import (
    BatchOutput,
    BatchPreview,
    JobAccessPage,
    JobControl,
    JobPage,
    JobRecord,
    JobWrite,
    UnitPage,
    UnitRecord,
)
from evidra.providers.base import NativeProvider
from evidra.providers.registry import ProviderRegistry
from evidra.scope.service import ScopeContext


class JobQueue:
    def __init__(
        self,
        runner: ExtractionRunner,
        providers: ProviderRegistry,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.runner, self.providers, self.clock = runner, providers, clock
        self.scopes, self.database = runner.scopes, runner.scopes.database
        self.cache = ExtractionCache(runner)
        with self.database.transaction() as conn:
            rows = conn.execute(
                "SELECT j.* FROM extraction_jobs j JOIN notebooks n ON n.id=j.notebook_id "
                "WHERE n.profile_instance_id=?",
                (self.scopes.principal.profile_instance_id,),
            ).fetchall()
            for row in rows:
                job = JobRecord.model_validate_json(row["payload"])
                uncertain = False
                for entry in conn.execute(
                    "SELECT * FROM extraction_units WHERE job_id=?", (job.id,)
                ).fetchall():
                    unit = UnitRecord.model_validate_json(entry["payload"])
                    if unit.state != "RUNNING":
                        continue
                    sent = conn.execute(
                        "SELECT p.state FROM extraction_batches b "
                        "JOIN provider_calls p ON p.call_id=b.call_id "
                        "WHERE b.unit_id=? AND b.output IS NULL AND p.state!='NOT_SENT'",
                        (unit.id,),
                    ).fetchone()
                    uncertain |= bool(sent)
                    unit = unit.model_copy(
                        update={
                            "state": "BILLING_UNKNOWN" if sent else "QUEUED",
                            "reason": "ENGINE_INTERRUPTED",
                        }
                    )
                    self.save_unit(conn, unit, release=True)
                if job.state in {"QUEUED", "RUNNING"}:
                    self.save_job(
                        conn,
                        job.model_copy(
                            update={
                                "state": "WAITING_PROVIDER" if uncertain else "PAUSED",
                                "reason": "BILLING_UNKNOWN" if uncertain else "ENGINE_INTERRUPTED",
                                "revision": job.revision + 1,
                            }
                        ),
                    )

    @staticmethod
    def save_job(conn: sqlite3.Connection, job: JobRecord) -> None:
        conn.execute(
            "UPDATE extraction_jobs SET payload=? WHERE id=?", (job.model_dump_json(), job.id)
        )

    @staticmethod
    def save_unit(conn: sqlite3.Connection, unit: UnitRecord, *, release: bool = False) -> None:
        conn.execute(
            "UPDATE extraction_units SET payload=?"
            + (",lease_owner=NULL,lease_until=NULL" if release else "")
            + " WHERE id=?",
            (unit.model_dump_json(), unit.id),
        )

    @staticmethod
    def read(conn: sqlite3.Connection, context: ScopeContext, job_id: str) -> JobRecord:
        row = conn.execute(
            "SELECT payload FROM extraction_jobs WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (job_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if not row:
            raise EvidraError("NOT_FOUND", "Extraction job not found.")
        return JobRecord.model_validate_json(row[0])

    def get(self, context: ScopeContext, job_id: str) -> JobRecord:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            return self.read(conn, context, job_id)

    def list(self, context: ScopeContext, offset: int) -> JobPage:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            args = (context.notebook_id, context.snapshot_id)
            total = conn.execute(
                "SELECT count(*) FROM extraction_jobs WHERE notebook_id=? AND snapshot_id=?", args
            ).fetchone()[0]
            rows = conn.execute(
                "SELECT payload FROM extraction_jobs WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY rowid DESC LIMIT 10 OFFSET ?",
                (*args, offset),
            ).fetchall()
            return JobPage(
                items=[JobRecord.model_validate_json(r[0]) for r in rows],
                offset=offset,
                limit=10,
                total=total,
            )

    def prepare(self, context: ScopeContext, body: JobWrite) -> JobRecord:
        with self.scopes.guarded(context, capability="commit") as conn:
            previous = conn.execute(
                "SELECT request,payload FROM extraction_jobs WHERE notebook_id=? "
                "AND snapshot_id=? AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if previous:
                if previous[0] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Prepared extraction changed.")
                return JobRecord.model_validate_json(previous[1])
            count = conn.execute("SELECT count(*) FROM extraction_units").fetchone()[0]
            if count >= 100000:
                raise EvidraError("QUEUE_LIMIT", "Durable extraction unit limit reached.")
        profile = self.providers.profiles.authorize(
            context, body.profile_id, frozenset({"excerpts"})
        )
        if profile.purpose != "generation":
            raise EvidraError("CAPABILITY_UNSUPPORTED", "Extraction requires a generation profile.")
        job_id = secrets.token_hex(16)
        plans = self.runner.plan(context, body, profile, job_id)
        job = JobRecord(
            id=job_id,
            notebook_id=context.notebook_id,
            snapshot_id=context.snapshot_id,
            request=body,
            profile=profile,
            total_units=len(plans),
            created_at=now(),
            schema_plan=NativeProvider.plan_schema(
                profile, SYSTEM, BatchOutput.model_json_schema()
            ),
        )
        with self.scopes.guarded(context, capability="commit") as conn:
            if self.providers.profiles.load(conn, profile.id) != profile:
                raise EvidraError("REVISION_CONFLICT", "Provider changed during preparation.")
            if (
                conn.execute("SELECT count(*) FROM extraction_units").fetchone()[0] + len(plans)
                > 100000
            ):
                raise EvidraError("QUEUE_LIMIT", "Durable extraction unit limit reached.")
            # Concurrent retries are resolved before any insert, in the same transaction.
            old = conn.execute(
                "SELECT payload,request FROM extraction_jobs WHERE notebook_id=? "
                "AND snapshot_id=? AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old[1] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Prepared extraction changed.")
                return JobRecord.model_validate_json(old[0])
            conn.execute(
                "INSERT INTO extraction_jobs VALUES(?,?,?,?,?,?)",
                (
                    job.id,
                    context.notebook_id,
                    context.snapshot_id,
                    body.idempotency_key,
                    fingerprint(body),
                    job.model_dump_json(),
                ),
            )
            prepared_bytes = conn.execute(
                "SELECT coalesce(sum(length(CAST(preview AS BLOB))),0) FROM extraction_batches"
            ).fetchone()[0]
            for plan in plans:
                if len(plan.unit.model_dump_json().encode()) > 400000:
                    raise EvidraError(
                        "BODY_TOO_LARGE", "Study attachment coverage exceeds the display budget."
                    )
                conn.execute(
                    "INSERT INTO extraction_units VALUES(?,?,?,?,?,?,?,?,?)",
                    (
                        plan.unit.id,
                        job.id,
                        plan.unit.source_id,
                        plan.unit.field_key,
                        plan.unit.model_dump_json(),
                        json.dumps(plan.evidence_ids),
                        plan.cache_key,
                        None,
                        None,
                    ),
                )
                for index, ids in enumerate(plan.batches):
                    conn.execute(
                        "INSERT INTO extraction_batches "
                        "(unit_id,batch_index,evidence_ids,call_id,output) VALUES(?,?,?,?,NULL)",
                        (plan.unit.id, index, json.dumps(ids), secrets.token_hex(16)),
                    )
                self.runner.reauthorize(conn, context, job, plan.unit)
                # Every exact batch is prepared/size-checked before explicit user start.
                for index in range(plan.unit.batches_total):
                    preview = self.runner.preview(conn, context, job, plan.unit, index)
                    prepared_bytes += len(preview.model_dump_json().encode())
                    if prepared_bytes > 128 * 1024 * 1024:
                        raise EvidraError(
                            "QUEUE_LIMIT", "Prepared extraction input storage limit reached."
                        )
                    conn.execute(
                        "UPDATE extraction_batches SET preview=? WHERE unit_id=? AND batch_index=?",
                        (preview.model_dump_json(), plan.unit.id, index),
                    )
        return job

    def units(self, context: ScopeContext, job_id: str, offset: int) -> UnitPage:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            job = self.read(conn, context, job_id)
            rows = conn.execute(
                "SELECT payload FROM extraction_units WHERE job_id=? "
                "ORDER BY rowid LIMIT 20 OFFSET ?",
                (job.id, offset),
            ).fetchall()
            items: list[UnitRecord] = []
            size = 0
            for row in rows:
                unit = UnitRecord.model_validate_json(row[0])
                self.runner.matrix.target(
                    conn, context, job.request.form_version_id, unit.source_id, unit.field_key
                )
                size += len(row[0].encode())
                if size > 800000 and items:
                    break
                items.append(unit)
            return UnitPage(items=items, offset=offset, limit=len(items), total=job.total_units)

    def preview(self, context: ScopeContext, job_id: str, unit_id: str, index: int) -> BatchPreview:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            job = self.read(conn, context, job_id)
            row = conn.execute(
                "SELECT payload FROM extraction_units WHERE id=? AND job_id=?", (unit_id, job.id)
            ).fetchone()
            if not row:
                raise EvidraError("NOT_FOUND", "Extraction unit not found.")
            return self.runner.preview(
                conn, context, job, UnitRecord.model_validate_json(row[0]), index
            )

    def access(self, context: ScopeContext, job_id: str, offset: int = 0) -> JobAccessPage:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            self.read(conn, context, job_id)
            ids = {
                row[0]
                for row in conn.execute(
                    "SELECT source_id FROM extraction_units WHERE job_id=?", (job_id,)
                )
            }
            items = [
                item
                for item in self.scopes.snapshot_access(
                    conn, context.notebook_id, context.snapshot_id
                )
                if item.identity.source_id in ids
            ]
            selected = items[offset : offset + 50]
            documents = sorted(
                {
                    (unit.source_id, c.content_key)
                    for row in conn.execute(
                        "SELECT payload FROM extraction_units WHERE job_id=?", (job_id,)
                    )
                    for unit in [UnitRecord.model_validate_json(row[0])]
                    for c in unit.coverage
                    if c.source_kind == "pdf"
                    and unit.source_id in {item.identity.source_id for item in selected}
                }
            )
            result = JobAccessPage(
                items=selected,
                documents=documents,
                offset=offset,
                limit=len(selected),
                total=len(items),
            )
            while len(result.model_dump_json().encode()) > 800000:
                if len(result.items) <= 1:
                    raise EvidraError("BODY_TOO_LARGE", "Source access exceeds the display budget.")
                selected = result.items[:-1]
                ids = {item.identity.source_id for item in selected}
                result = result.model_copy(
                    update={
                        "items": selected,
                        "limit": len(selected),
                        "documents": [
                            (source, key) for source, key in result.documents if source in ids
                        ],
                    }
                )
            return result

    def control(self, context: ScopeContext, job_id: str, body: JobControl) -> JobRecord:
        with self.scopes.guarded(context, capability="commit") as conn:
            job = self.read(conn, context, job_id)
            old = conn.execute(
                "SELECT request FROM extraction_job_commands WHERE job_id=? AND idempotency_key=?",
                (job_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old[0] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Job command changed.")
                return job
            # Worker progress must not defeat a user's restrictive stop command.
            # Resume/reconciliation still require the exact displayed revision;
            # no command may claim a revision that has not existed.
            if body.expected_revision > job.revision or (
                job.revision != body.expected_revision and body.action not in {"pause", "cancel"}
            ):
                raise EvidraError("REVISION_CONFLICT", "Job changed after display.")
            if job.state in {"CANCELLED", "SUCCEEDED"}:
                raise EvidraError("INVALID_REQUEST", "This job is terminal.")
            state, reason = job.state, job.reason
            if body.action == "resume":
                if job.state in {"RUNNING", "QUEUED"}:
                    raise EvidraError("RUN_BUSY", "This job is already admitted.")
                if conn.execute(
                    "SELECT 1 FROM extraction_units WHERE job_id=? AND "
                    "json_extract(payload,'$.state')='BILLING_UNKNOWN'",
                    (job.id,),
                ).fetchone():
                    raise EvidraError(
                        "BILLING_UNKNOWN", "Reconcile uncertain units explicitly before continuing."
                    )
                current = self.providers.profiles.load(conn, job.profile.id)
                if current.paused_code:
                    raise EvidraError("PROVIDER_PAUSED", "Resume the provider explicitly first.")
                if current.model_dump(
                    exclude={"revision", "paused_code"}
                ) != job.profile.model_dump(exclude={"revision", "paused_code"}):
                    raise EvidraError(
                        "REVISION_CONFLICT", "Prepared provider changed; prepare a new job."
                    )
                job = job.model_copy(update={"profile": current})
                for row in conn.execute(
                    "SELECT payload FROM extraction_units WHERE job_id=?", (job.id,)
                ):
                    self.runner.reauthorize(
                        conn, context, job, UnitRecord.model_validate_json(row[0])
                    )
                state, reason = "QUEUED", None
            elif body.action == "pause":
                state, reason = "PAUSED", "USER_PAUSED"
            elif body.action == "cancel":
                state, reason = "CANCELLED", "USER_CANCELLED"
            else:
                if job.state != "WAITING_PROVIDER":
                    raise EvidraError(
                        "INVALID_REQUEST", "No uncertain units await acknowledgement."
                    )
                for row in conn.execute(
                    "SELECT payload FROM extraction_units WHERE job_id=?", (job.id,)
                ).fetchall():
                    unit = UnitRecord.model_validate_json(row[0])
                    if unit.state == "BILLING_UNKNOWN":
                        self.save_unit(
                            conn,
                            unit.model_copy(
                                update={
                                    "state": "FAILED",
                                    "reason": "BILLING_UNKNOWN_ACKNOWLEDGED_SKIP",
                                }
                            ),
                            release=True,
                        )
                state, reason = "PAUSED", "UNCERTAIN_UNITS_SKIPPED"
            job = job.model_copy(
                update={"state": state, "reason": reason, "revision": job.revision + 1}
            )
            self.save_job(conn, job)
            conn.execute(
                "INSERT INTO extraction_job_commands VALUES(?,?,?)",
                (job.id, body.idempotency_key, fingerprint(body)),
            )
            return job

    def claim(self, context: ScopeContext, job_id: str, lease: str) -> UnitRecord | None:
        with self.scopes.guarded(context, capability="commit") as conn:
            self.expire(conn)
            job = self.read(conn, context, job_id)
            if job.state not in {"QUEUED", "RUNNING"}:
                return None
            if conn.execute(
                "SELECT 1 FROM extraction_units WHERE lease_owner IS NOT NULL"
            ).fetchone():
                return None
            if conn.execute(
                "SELECT 1 FROM extraction_jobs WHERE id!=? AND "
                "json_extract(payload,'$.state')='RUNNING'",
                (job.id,),
            ).fetchone():
                return None
            if conn.execute(
                "SELECT 1 FROM conversation_runs WHERE json_extract(payload,'$.state')='RUNNING'"
            ).fetchone():
                return None
            row = conn.execute(
                "SELECT * FROM extraction_units WHERE job_id=? AND "
                "json_extract(payload,'$.state')='QUEUED' ORDER BY rowid LIMIT 1",
                (job.id,),
            ).fetchone()
            if not row:
                self.summarize(conn, job)
                return None
            unit = UnitRecord.model_validate_json(row["payload"])
            self.runner.reauthorize(conn, context, job, unit)
            unit = unit.model_copy(update={"state": "RUNNING", "reason": None})
            conn.execute(
                "UPDATE extraction_units SET payload=?,lease_owner=?,lease_until=? WHERE id=?",
                (unit.model_dump_json(), lease, self.clock() + 120, unit.id),
            )
            if job.state != "RUNNING":
                self.save_job(
                    conn, job.model_copy(update={"state": "RUNNING", "revision": job.revision + 1})
                )
            return unit

    def expire(self, conn: sqlite3.Connection) -> None:
        """An expired lease pauses; it never authorizes an automatic resend."""
        rows = conn.execute(
            "SELECT u.payload,j.payload AS job FROM extraction_units u "
            "JOIN extraction_jobs j ON j.id=u.job_id JOIN notebooks n ON n.id=j.notebook_id "
            "WHERE u.lease_owner IS NOT NULL AND u.lease_until<=? AND n.profile_instance_id=?",
            (self.clock(), self.scopes.principal.profile_instance_id),
        ).fetchall()
        for row in rows:
            unit = UnitRecord.model_validate_json(row["payload"])
            job = JobRecord.model_validate_json(row["job"])
            prior = conn.execute(
                "SELECT 1 FROM extraction_batches b JOIN provider_calls p ON p.call_id=b.call_id "
                "WHERE b.unit_id=? AND b.output IS NULL AND p.state!='NOT_SENT'",
                (unit.id,),
            ).fetchone()
            unit = unit.model_copy(
                update={
                    "state": "BILLING_UNKNOWN" if prior else "QUEUED",
                    "reason": "LEASE_EXPIRED",
                }
            )
            self.save_unit(conn, unit, release=True)
            if job.state not in {"CANCELLED", "SUCCEEDED"}:
                self.save_job(
                    conn,
                    job.model_copy(
                        update={
                            "state": "WAITING_PROVIDER" if prior else "PAUSED",
                            "reason": "BILLING_UNKNOWN" if prior else "LEASE_EXPIRED",
                            "revision": job.revision + 1,
                        }
                    ),
                )

    def require_lease(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        job_id: str,
        unit_id: str,
        lease: str,
    ) -> tuple[JobRecord, UnitRecord]:
        job = self.read(conn, context, job_id)
        row = conn.execute(
            "SELECT * FROM extraction_units WHERE id=? AND job_id=?", (unit_id, job_id)
        ).fetchone()
        if (
            job.state != "RUNNING"
            or not row
            or row["lease_owner"] != lease
            or row["lease_until"] <= self.clock()
        ):
            raise EvidraError("CANCELLED", "Extraction lease is no longer active.")
        return job, UnitRecord.model_validate_json(row["payload"])

    def renew(self, context: ScopeContext, job_id: str, unit_id: str, lease: str) -> None:
        with self.scopes.guarded(context, capability="commit") as conn:
            self.require_lease(conn, context, job_id, unit_id, lease)
            conn.execute(
                "UPDATE extraction_units SET lease_until=? WHERE id=?",
                (self.clock() + 120, unit_id),
            )

    def summarize(self, conn: sqlite3.Connection, job: JobRecord) -> JobRecord:
        units = [
            UnitRecord.model_validate_json(r[0])
            for r in conn.execute("SELECT payload FROM extraction_units WHERE job_id=?", (job.id,))
        ]
        complete = sum(u.state == "COMPLETE" for u in units)
        failed = sum(u.state == "FAILED" for u in units)
        state = job.state
        if state in {"QUEUED", "RUNNING"} and complete + failed == len(units):
            state = (
                "SUCCEEDED"
                if not failed and all(u.coverage_state != "PARTIAL_SCAN" for u in units)
                else "PARTIAL"
                if complete
                else "FAILED"
            )
        result = job.model_copy(
            update={
                "state": state,
                "completed_units": complete,
                "failed_units": failed,
                "cached_units": sum(u.cache_hit for u in units),
                "revision": job.revision + 1,
            }
        )
        self.save_job(conn, result)
        return result
