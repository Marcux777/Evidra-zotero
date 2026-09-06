import secrets
import sqlite3

from evidra.domain.errors import EvidraError
from evidra.extraction.forms import FormService, author, fingerprint, now
from evidra.research.models import ProtocolPage, ProtocolVersion, ProtocolWrite
from evidra.scope.service import ScopeContext


class ProtocolService:
    def __init__(self, forms: FormService) -> None:
        self.forms, self.scopes = forms, forms.scopes

    def from_connection(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> ProtocolVersion:
        row = conn.execute(
            "SELECT payload FROM protocol_versions WHERE id=? AND notebook_id=?",
            (identity, context.notebook_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Protocol version not found.")
        return ProtocolVersion.model_validate_json(row[0])

    def read(self, context: ScopeContext, identity: str) -> ProtocolVersion:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            return self.from_connection(conn, context, identity)

    def list(self, context: ScopeContext, offset: int, limit: int) -> ProtocolPage:
        with self.scopes.guarded(context) as conn:
            rows = conn.execute(
                "SELECT payload FROM protocol_versions WHERE notebook_id=? "
                "ORDER BY revision DESC LIMIT ? OFFSET ?",
                (context.notebook_id, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM protocol_versions WHERE notebook_id=?", (context.notebook_id,)
            ).fetchone()[0]
            return ProtocolPage(
                items=[ProtocolVersion.model_validate_json(r[0]) for r in rows],
                offset=offset,
                limit=limit,
                total=total,
            )

    def create(self, context: ScopeContext, body: ProtocolWrite) -> ProtocolVersion:
        with self.scopes.guarded(context, capability="commit") as conn:
            self.forms.from_connection(conn, context, body.form_version_id)
            old = conn.execute(
                "SELECT * FROM protocol_versions WHERE notebook_id=? AND idempotency_key=?",
                (context.notebook_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Protocol request changed.")
                return ProtocolVersion.model_validate_json(old["payload"])
            revision = conn.execute(
                "SELECT coalesce(max(revision),0) FROM protocol_versions WHERE notebook_id=?",
                (context.notebook_id,),
            ).fetchone()[0]
            if revision != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Active protocol changed.")
            result = ProtocolVersion(
                **body.model_dump(exclude={"idempotency_key", "expected_revision"}),
                id=secrets.token_hex(16),
                notebook_id=context.notebook_id,
                revision=revision + 1,
                author=author(context),
                created_at=now(),
            )
            conn.execute(
                "INSERT INTO protocol_versions VALUES(?,?,?,?,?,?)",
                (
                    result.id,
                    context.notebook_id,
                    result.revision,
                    body.idempotency_key,
                    fingerprint(body),
                    result.model_dump_json(),
                ),
            )
            return result
