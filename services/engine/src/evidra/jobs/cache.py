"""Bounded derived references; clearing them never deletes proposals or decisions."""

import sqlite3

from evidra.extraction.forms import now
from evidra.extraction.runner import ExtractionRunner
from evidra.jobs.models import JobRecord, UnitRecord
from evidra.scope.service import ScopeContext


class ExtractionCache:
    def __init__(self, runner: ExtractionRunner) -> None:
        self.runner = runner

    def read(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        job: JobRecord,
        unit: UnitRecord,
        key: str,
    ) -> UnitRecord | None:
        self.runner.reauthorize(conn, context, job, unit)
        row = conn.execute(
            "SELECT u.payload,r.payload AS result FROM extraction_cache c "
            "JOIN extraction_results r ON r.id=c.result_id "
            "JOIN extraction_units u ON u.id=r.unit_id "
            "WHERE c.key=? AND c.notebook_id=? AND c.snapshot_id=?",
            (key, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if not row:
            return None
        old = UnitRecord.model_validate_json(row[0])
        assert old.proposal_id is not None
        self.runner.matrix.proposal(conn, context, old.proposal_id)
        conn.execute("UPDATE extraction_cache SET used_at=? WHERE key=?", (now(), key))
        return unit.model_copy(
            update={
                "state": "COMPLETE",
                "cache_hit": True,
                "proposal_id": old.proposal_id,
                "coverage": old.coverage,
                "coverage_state": old.coverage_state,
                "batches_processed": old.batches_processed,
            }
        )

    @staticmethod
    def write(conn: sqlite3.Connection, context: ScopeContext, unit: UnitRecord, key: str) -> None:
        row = conn.execute(
            "SELECT id FROM extraction_results WHERE unit_id=?", (unit.id,)
        ).fetchone()
        if row:
            conn.execute(
                "INSERT OR REPLACE INTO extraction_cache VALUES(?,?,?,?,?)",
                (key, context.notebook_id, context.snapshot_id, row[0], now()),
            )
            # These small references alone are reconstructed; original runs remain immutable.
            conn.execute(
                "DELETE FROM extraction_cache WHERE key IN "
                "(SELECT key FROM extraction_cache ORDER BY used_at DESC LIMIT -1 OFFSET 10000)"
            )

    def clear(self, context: ScopeContext) -> int:
        with self.runner.scopes.guarded(context, capability="commit") as conn:
            return conn.execute(
                "DELETE FROM extraction_cache WHERE notebook_id=? AND snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).rowcount
