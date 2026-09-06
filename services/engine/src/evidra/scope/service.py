"""Server-issued scopes. Hold guarded() across every content read or final write.

Never hold the transaction across external work. Resolve first, release, then use
guarded(context, capability='commit') before committing its result. A new explicit
resolve can read an old snapshot, intersected with current grants and content access.
"""

import hashlib
import hmac
import json
import secrets
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass, field, replace
from typing import Literal

from evidra.domain.errors import EvidraError
from evidra.domain.sources import (
    ContentIdentity,
    Source,
    SourceAccess,
    content_version,
    metadata_version,
)
from evidra.security.runtime import BridgeSession
from evidra.storage.database import Database

Capability = Literal["read", "commit", "manage"]


@dataclass(frozen=True)
class Principal:
    profile_instance_id: str
    credential_kind: Literal["bridge"] = "bridge"
    capabilities: frozenset[Capability] = frozenset({"read", "commit", "manage"})


@dataclass(frozen=True)
class ScopeContext:
    principal: Principal
    notebook_id: str
    snapshot_id: str
    capability: Capability
    notebook_revision: int
    source_ids: frozenset[str]
    fingerprint: str
    signature: str = field(repr=False)


class ScopeService:
    def __init__(self, database: Database, session: BridgeSession) -> None:
        self.database, self.session = database, session
        self.principal = Principal(session.settings.profile_instance_id)
        self._key = secrets.token_bytes(32)
        self.session_id = secrets.token_hex(32)
        # Persisted availability is not an authorization receipt for a new bridge session.
        with database.transaction() as connection:
            connection.execute(
                "UPDATE sources SET available=0,access_revision=access_revision+1, "
                "reason='revalidation_required' WHERE profile_instance_id=?",
                (self.principal.profile_instance_id,),
            )
            connection.execute(
                "UPDATE source_contents SET available=0,access_revision=access_revision+1 "
                "WHERE source_id IN (SELECT id FROM sources WHERE profile_instance_id=?)",
                (self.principal.profile_instance_id,),
            )
            for table in ("selection_previews", "selection_stages"):
                connection.execute(
                    f"DELETE FROM {table} WHERE notebook_id IN "
                    "(SELECT id FROM notebooks WHERE profile_instance_id=?)",
                    (self.principal.profile_instance_id,),
                )

    def selection_stage(
        self,
        connection: sqlite3.Connection,
        notebook_id: str,
        stage_id: str,
        *,
        complete: bool = True,
    ) -> sqlite3.Row:
        row: sqlite3.Row | None = connection.execute(
            "SELECT * FROM selection_stages WHERE notebook_id=? AND id=? AND session_id=?",
            (notebook_id, stage_id, self.session_id),
        ).fetchone()
        if row is None or bool(row["complete"]) != complete:
            raise EvidraError("SCOPE_STALE", "Selection staging is stale or incomplete.")
        return row

    def invalidate_staging(
        self,
        connection: sqlite3.Connection,
        *,
        notebook_id: str | None = None,
        source_ids: set[str] | None = None,
    ) -> None:
        rows = connection.execute(
            "SELECT notebook_id,versions FROM selection_stages WHERE session_id=?",
            (self.session_id,),
        ).fetchall()
        for row in rows:
            if row["notebook_id"] == notebook_id or set(json.loads(row["versions"])) & (
                source_ids or set()
            ):
                connection.execute(
                    "DELETE FROM selection_previews WHERE notebook_id=?", (row["notebook_id"],)
                )
                connection.execute(
                    "DELETE FROM selection_stages WHERE notebook_id=?", (row["notebook_id"],)
                )

    def authorize(self, principal: Principal, capability: Capability = "read") -> None:
        self.session.assert_current()
        # Authentication, never a request body, owns principal identity/capabilities.
        if principal is not self.principal or capability not in principal.capabilities:
            raise EvidraError("FORBIDDEN", "The principal is not authorized.")

    def notebook(
        self, connection: sqlite3.Connection, principal: Principal, notebook_id: str
    ) -> sqlite3.Row:
        self.authorize(principal)
        row: sqlite3.Row | None = connection.execute(
            "SELECT * FROM notebooks WHERE id=? AND profile_instance_id=?",
            (notebook_id, principal.profile_instance_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Notebook not found.")
        return row

    def members(
        self, connection: sqlite3.Connection, notebook_id: str, snapshot_id: str
    ) -> list[sqlite3.Row]:
        return connection.execute(
            "SELECT m.*, s.metadata_version, s.access_revision, "
            "g.contents AS granted_contents FROM snapshot_members m "
            "JOIN notebook_grants g ON g.source_id=m.source_id AND g.notebook_id=? "
            "JOIN sources s ON s.id=m.source_id JOIN source_libraries l "
            "ON l.profile_instance_id=s.profile_instance_id AND l.library_id=s.library_id "
            "WHERE m.snapshot_id=? AND s.available=1 AND l.available=1 ORDER BY m.source_id",
            (notebook_id, snapshot_id),
        ).fetchall()

    @staticmethod
    def frozen_content(row: sqlite3.Row) -> Source:
        frozen = Source.model_validate_json(row["payload"])
        granted = {tuple(c) for c in json.loads(row["granted_contents"])}
        return frozen.model_copy(
            update={"contents": [c for c in frozen.contents if (c.key, c.kind) in granted]}
        )

    def content(self, connection: sqlite3.Connection, row: sqlite3.Row) -> Source:
        frozen = self.frozen_content(row)
        current = connection.execute(
            "SELECT key,kind FROM source_contents WHERE source_id=? AND available=1", (frozen.id,)
        ).fetchall()
        allowed = {(c["key"], c["kind"]) for c in current}
        return frozen.model_copy(
            update={"contents": [c for c in frozen.contents if (c.key, c.kind) in allowed]}
        )

    @staticmethod
    def source_current(connection: sqlite3.Connection, source: Source) -> bool:
        row = connection.execute(
            "SELECT metadata_version FROM sources WHERE id=?", (source.id,)
        ).fetchone()
        if row is None or row[0] != metadata_version(source):
            return False
        for content in source.contents:
            current = connection.execute(
                "SELECT kind,version_id,available FROM source_contents WHERE source_id=? AND key=?",
                (source.id, content.key),
            ).fetchone()
            if (
                current is None
                or not current["available"]
                or current["kind"] != content.kind
                or current["version_id"] != content_version(content)
            ):
                return False
        return True

    def member_access(self, rows: list[sqlite3.Row]) -> dict[str, list[ContentIdentity]]:
        access = {}
        for row in rows:
            source = self.frozen_content(row)
            access[source.id] = [ContentIdentity(key=c.key, kind=c.kind) for c in source.contents]
        return access

    def snapshot_access(
        self, connection: sqlite3.Connection, notebook_id: str, snapshot_id: str
    ) -> list[SourceAccess]:
        if (
            connection.execute(
                "SELECT 1 FROM snapshots WHERE notebook_id=? AND id=?", (notebook_id, snapshot_id)
            ).fetchone()
            is None
        ):
            raise EvidraError("NOT_FOUND", "Snapshot not found.")
        rows = connection.execute(
            "SELECT m.*,g.contents AS granted_contents FROM snapshot_members m JOIN "
            "notebook_grants g "
            "ON g.source_id=m.source_id AND g.notebook_id=? WHERE m.snapshot_id=? ORDER BY "
            "m.source_id",
            (notebook_id, snapshot_id),
        ).fetchall()
        access = self.member_access(rows)
        return [
            SourceAccess(
                identity=Source.model_validate_json(row["payload"]).identity,
                contents=access[row["source_id"]],
            )
            for row in rows
        ]

    def stage_access(
        self, connection: sqlite3.Connection, stage: sqlite3.Row
    ) -> dict[str, list[ContentIdentity]]:
        access = {}
        for source_id, version in json.loads(stage["versions"]).items():
            row = connection.execute(
                "SELECT payload FROM source_versions WHERE source_id=? AND version_id=?",
                (source_id, version),
            ).fetchone()
            source = Source.model_validate_json(row[0])
            access[source_id] = [ContentIdentity(key=c.key, kind=c.kind) for c in source.contents]
        return access

    def fingerprint(
        self,
        connection: sqlite3.Connection,
        source_ids: list[str],
        content_access: dict[str, list[ContentIdentity]],
    ) -> str:
        state = []
        for source_id in sorted(set(source_ids)):
            row = connection.execute(
                "SELECT s.id,s.metadata_version,s.access_revision,s.available,"
                "l.available AS library_access FROM sources s JOIN source_libraries l "
                "ON l.profile_instance_id=s.profile_instance_id "
                "AND l.library_id=s.library_id WHERE s.id=?",
                (source_id,),
            ).fetchone()
            value = dict(row) if row else {"id": source_id}
            content_state = []
            for content in sorted(content_access[source_id], key=lambda c: (c.key, c.kind)):
                current = connection.execute(
                    "SELECT kind,version_id,available,access_revision FROM source_contents WHERE "
                    "source_id=? AND key=?",
                    (source_id, content.key),
                ).fetchone()
                content_state.append(
                    [content.key, content.kind, dict(current) if current else None]
                )
            value["contents"] = content_state
            state.append(value)
        return hmac.new(
            self._key, json.dumps(state, sort_keys=True).encode(), hashlib.sha256
        ).hexdigest()

    def _signature(self, context: ScopeContext) -> str:
        data = [
            context.principal.profile_instance_id,
            context.notebook_id,
            context.snapshot_id,
            context.capability,
            context.notebook_revision,
            sorted(context.source_ids),
            context.fingerprint,
        ]
        return hmac.new(self._key, json.dumps(data).encode(), hashlib.sha256).hexdigest()

    def resolve(
        self,
        principal: Principal,
        notebook_id: str,
        snapshot_id: str,
        capability: Capability = "read",
    ) -> ScopeContext:
        with self.database.transaction() as connection:
            self.authorize(principal, capability)
            notebook = self.notebook(connection, principal, notebook_id)
            if (
                connection.execute(
                    "SELECT 1 FROM snapshots WHERE id=? AND notebook_id=?",
                    (snapshot_id, notebook_id),
                ).fetchone()
                is None
            ):
                raise EvidraError("NOT_FOUND", "Snapshot not found.")
            rows = self.members(connection, notebook_id, snapshot_id)
            ids = frozenset(row["source_id"] for row in rows)
            context = ScopeContext(
                principal,
                notebook_id,
                snapshot_id,
                capability,
                notebook["revision"],
                ids,
                self.fingerprint(connection, list(ids), self.member_access(rows)),
                "",
            )
            return replace(context, signature=self._signature(context))

    def _assert(
        self, connection: sqlite3.Connection, context: ScopeContext, capability: Capability
    ) -> None:
        self.authorize(context.principal, capability)
        if context.capability != capability or not hmac.compare_digest(
            context.signature, self._signature(context)
        ):
            raise EvidraError("FORBIDDEN", "Invalid server scope.")
        notebook = self.notebook(connection, context.principal, context.notebook_id)
        rows = self.members(connection, context.notebook_id, context.snapshot_id)
        ids = frozenset(row["source_id"] for row in rows)
        if (
            notebook["revision"] != context.notebook_revision
            or ids != context.source_ids
            or self.fingerprint(connection, list(ids), self.member_access(rows))
            != context.fingerprint
        ):
            raise EvidraError("SCOPE_STALE", "SCOPE_STALE: resolve the current scope again.")

    @contextmanager
    def guarded(
        self,
        context: ScopeContext,
        *,
        source_id: str | None = None,
        content_key: str | None = None,
        capability: Capability = "read",
    ) -> Iterator[sqlite3.Connection]:
        with self.database.transaction() as connection:
            self._assert(connection, context, capability)
            if source_id is not None and source_id not in context.source_ids:
                raise EvidraError(
                    "SOURCE_REVOKED", "SOURCE_REVOKED: source is outside current scope."
                )
            if content_key is not None:
                row = next(
                    (
                        r
                        for r in self.members(connection, context.notebook_id, context.snapshot_id)
                        if r["source_id"] == source_id
                    ),
                    None,
                )
                if row is None or content_key not in {
                    c.key for c in self.content(connection, row).contents
                }:
                    raise EvidraError("SOURCE_REVOKED", "Content is outside current scope.")
            yield connection
            self._assert(connection, context, capability)

    def assert_current(self, context: ScopeContext) -> None:
        with self.guarded(context, capability=context.capability):
            pass

    def revoke_access(
        self,
        source_id: str,
        *,
        notebook_id: str | None = None,
        expected_revision: int | None = None,
        reason: str = "removed",
    ) -> int:
        with self.database.transaction() as connection:
            self.authorize(self.principal, "manage")
            source = connection.execute(
                "SELECT 1 FROM sources WHERE id=? AND profile_instance_id=?",
                (source_id, self.principal.profile_instance_id),
            ).fetchone()
            if source is None:
                raise EvidraError("NOT_FOUND", "Source not found.")
            if notebook_id:
                notebook = self.notebook(connection, self.principal, notebook_id)
                if expected_revision is not None and expected_revision != notebook["revision"]:
                    raise EvidraError("SCOPE_STALE", "Notebook revision changed.")
                removed = connection.execute(
                    "DELETE FROM notebook_grants WHERE notebook_id=? AND source_id=?",
                    (notebook_id, source_id),
                ).rowcount
                if removed:
                    connection.execute(
                        "UPDATE notebooks SET revision=revision+1 WHERE id=?", (notebook_id,)
                    )
                self.invalidate_staging(connection, notebook_id=notebook_id)
                return int(notebook["revision"]) + int(bool(removed))
            connection.execute(
                "UPDATE sources SET available=0,access_revision=access_revision+1, "
                "reason=? WHERE id=?",
                (reason, source_id),
            )
            connection.execute(
                "UPDATE source_contents SET available=0,access_revision=access_revision+1 WHERE "
                "source_id=?",
                (source_id,),
            )
            self.invalidate_staging(connection, source_ids={source_id})
            return 0
