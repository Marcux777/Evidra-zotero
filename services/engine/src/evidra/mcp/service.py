import hashlib
import hmac
import secrets
import sqlite3
from datetime import UTC, datetime, timedelta
from typing import Literal

from evidra.domain.errors import EvidraError
from evidra.extraction.forms import fingerprint, now
from evidra.mcp.connection import ConnectionFile, read_connection, write_connection
from evidra.mcp.models import ConnectionCreate, ConnectionPage, ConnectionReceipt, ConnectionRecord
from evidra.scope.service import Principal, ScopeContext, ScopeService


class ConnectionService:
    def __init__(self, scopes: ScopeService) -> None:
        self.scopes = scopes

    def record(self, row: sqlite3.Row) -> ConnectionRecord:
        state: Literal["ACTIVE", "EXPIRED", "REVOKED", "SESSION_CLOSED"] = (
            "REVOKED"
            if row["revoked_at"]
            else "EXPIRED"
            if row["expires_at"] <= now()
            else "SESSION_CLOSED"
            if row["session_id"] != self.scopes.session_id
            else "ACTIVE"
        )
        return ConnectionRecord(
            **{key: row[key] for key in ConnectionRecord.model_fields if key != "state"},
            state=state,
        )

    def create(self, context: ScopeContext, body: ConnectionCreate) -> ConnectionReceipt:
        self.scopes.authorize(context.principal, "manage")
        token = body.token.get_secret_value()
        if hmac.compare_digest(
            token, self.scopes.session.settings.session_token.get_secret_value()
        ):
            raise EvidraError("FORBIDDEN", "A separate external credential is required.")
        digest = hashlib.sha256(token.encode()).hexdigest()
        request = fingerprint(body) + digest  # SecretStr is redacted; persist only its hash.
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM mcp_connections WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old and old["request"] != request:
                raise EvidraError("IDEMPOTENCY_CONFLICT", "Connection request changed.")
            identity = old["id"] if old else secrets.token_hex(16)
            if not old:
                if conn.execute(
                    "SELECT 1 FROM mcp_connections WHERE token_hash=?", (digest,)
                ).fetchone():
                    raise EvidraError("FORBIDDEN", "Connection credential was already used.")
                conn.execute(
                    "INSERT INTO mcp_connections VALUES(?,?,?,?,?,?,?,NULL,NULL,?,?,?,?)",
                    (
                        identity,
                        context.notebook_id,
                        context.snapshot_id,
                        self.scopes.session_id,
                        digest,
                        body.allow_proposals,
                        (
                            datetime.now(UTC) + timedelta(seconds=body.expires_in_seconds)
                        ).isoformat(),
                        body.label,
                        now(),
                        body.idempotency_key,
                        request,
                    ),
                )
        # Private file/ACL I/O never runs under SQLite locks. An interrupted create is replayable.
        path = self.scopes.session.settings.data_dir / "mcp" / identity / "connection.json"
        value = ConnectionFile(port=self.scopes.session.settings.port, token=body.token)
        if path.exists():
            if read_connection(path) != value:
                raise EvidraError("UNSAFE_PATH", "Connection file changed.")
        else:
            write_connection(path, value)
        with self.scopes.guarded(context, capability="commit") as conn:
            row = conn.execute("SELECT * FROM mcp_connections WHERE id=?", (identity,)).fetchone()
            return ConnectionReceipt(connection=self.record(row), connection_file=str(path))

    def authenticate(self, credential: bytes) -> Principal:
        if not credential.startswith(b"Bearer "):
            raise EvidraError("UNAUTHENTICATED", "Invalid external credential.")
        digest = hashlib.sha256(credential[7:]).hexdigest()
        with self.scopes.database.transaction() as conn:
            row = conn.execute(
                "SELECT * FROM mcp_connections WHERE token_hash=?", (digest,)
            ).fetchone()
            if row is None:
                raise EvidraError("UNAUTHENTICATED", "Invalid external credential.")
            principal = self.scopes.mcp_principal(row)
            conn.execute("UPDATE mcp_connections SET last_used_at=? WHERE id=?", (now(), row["id"]))
            return principal

    def list(self, context: ScopeContext, offset: int) -> ConnectionPage:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context) as conn:
            args = (context.notebook_id, context.snapshot_id)
            rows = conn.execute(
                "SELECT * FROM mcp_connections WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY rowid DESC LIMIT 20 OFFSET ?",
                (*args, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM mcp_connections WHERE notebook_id=? AND snapshot_id=?", args
            ).fetchone()[0]
            return ConnectionPage(
                items=[self.record(row) for row in rows], offset=offset, limit=20, total=total
            )

    def revoke(self, context: ScopeContext, identity: str) -> ConnectionRecord:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            row = conn.execute(
                "SELECT * FROM mcp_connections WHERE id=? AND notebook_id=? AND snapshot_id=?",
                (identity, context.notebook_id, context.snapshot_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Connection not found.")
            conn.execute(
                "UPDATE mcp_connections SET revoked_at=coalesce(revoked_at,?) WHERE id=?",
                (now(), identity),
            )
            return self.record(
                conn.execute("SELECT * FROM mcp_connections WHERE id=?", (identity,)).fetchone()
            )
