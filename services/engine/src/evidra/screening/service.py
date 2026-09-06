import secrets

from evidra.domain.errors import EvidraError
from evidra.extraction.forms import author, fingerprint, now
from evidra.notebooks.protocol import ProtocolService
from evidra.research.models import (
    ScreeningDecision,
    ScreeningPage,
    ScreeningRow,
    ScreeningWrite,
    Stage,
)
from evidra.scope.service import ScopeContext


class ScreeningService:
    def __init__(self, protocols: ProtocolService) -> None:
        self.protocols, self.scopes = protocols, protocols.scopes

    def decide(self, context: ScopeContext, body: ScreeningWrite) -> ScreeningDecision:
        with self.scopes.guarded(context, source_id=body.source_id, capability="commit") as conn:
            protocol = self.protocols.from_connection(conn, context, body.protocol_version_id)
            allowed = {c.id for c in protocol.criteria if c.applicability in ("BOTH", body.stage)}
            if not set(body.criterion_ids) <= allowed:
                raise EvidraError("INVALID_REQUEST", "Criterion does not apply to this stage.")
            old = conn.execute(
                "SELECT * FROM screening_decisions WHERE notebook_id=? AND idempotency_key=?",
                (context.notebook_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Screening request changed.")
                return ScreeningDecision.model_validate_json(old["payload"])
            prior = conn.execute(
                "SELECT payload FROM screening_decisions WHERE notebook_id=? AND snapshot_id=? "
                "AND protocol_version_id=? AND source_id=? AND stage=? AND reviewer=? "
                "ORDER BY revision DESC LIMIT 1",
                (
                    context.notebook_id,
                    context.snapshot_id,
                    body.protocol_version_id,
                    body.source_id,
                    body.stage,
                    body.reviewer,
                ),
            ).fetchone()
            previous = ScreeningDecision.model_validate_json(prior[0]) if prior else None
            revision = previous.revision if previous else 0
            if body.expected_revision != revision:
                raise EvidraError("REVISION_CONFLICT", "Reviewer decision changed.")
            result = ScreeningDecision(
                **body.model_dump(exclude={"idempotency_key", "expected_revision"}),
                id=secrets.token_hex(16),
                revision=revision + 1,
                previous_decision=previous.decision if previous else None,
                author=author(context),
                created_at=now(),
            )
            conn.execute(
                "INSERT INTO screening_decisions VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                (
                    result.id,
                    context.notebook_id,
                    context.snapshot_id,
                    result.protocol_version_id,
                    result.source_id,
                    result.stage,
                    result.reviewer,
                    result.revision,
                    body.idempotency_key,
                    fingerprint(body),
                    result.created_at,
                    result.model_dump_json(),
                ),
            )
            return result

    def list(
        self, context: ScopeContext, protocol_id: str, offset: int, limit: int
    ) -> ScreeningPage:
        with self.scopes.guarded(context) as conn:
            self.protocols.from_connection(conn, context, protocol_id)
            rows = conn.execute(
                "SELECT payload FROM screening_decisions WHERE notebook_id=? AND snapshot_id=? "
                "AND protocol_version_id=? ORDER BY revision DESC,created_at DESC,id DESC",
                (context.notebook_id, context.snapshot_id, protocol_id),
            ).fetchall()
            current: dict[tuple[str, Stage], dict[str, ScreeningDecision]] = {}
            events = 0
            for row in rows:
                decision = ScreeningDecision.model_validate_json(row[0])
                if decision.source_id not in context.source_ids:
                    continue
                events += 1
                current.setdefault((decision.source_id, decision.stage), {}).setdefault(
                    decision.reviewer, decision
                )
            items = [
                ScreeningRow(
                    source_id=source,
                    stage=stage,
                    decisions=list(reviewers.values()),
                    conflict=len({d.decision for d in reviewers.values()}) > 1,
                )
                for (source, stage), reviewers in sorted(current.items())
            ]
            members = conn.execute(
                "SELECT count(*) FROM snapshot_members WHERE snapshot_id=?", (context.snapshot_id,)
            ).fetchone()[0]
            return ScreeningPage(
                items=items[offset : offset + limit],
                offset=offset,
                limit=limit,
                total=len(items),
                snapshot_members=members,
                currently_available_members=len(context.source_ids),
                observed_decision_events=events,
            )
