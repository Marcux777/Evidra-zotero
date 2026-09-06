"""Authorized source metadata ingestion, selection previews and immutable captures."""

import hashlib
import json
import secrets
import sqlite3
from datetime import UTC, datetime

from evidra.domain.errors import EvidraError
from evidra.domain.sources import (
    IdentityPage,
    Invalidation,
    InvalidationResult,
    PreviewPage,
    PreviewRequest,
    RemovedSource,
    SelectionPreview,
    SelectionSpec,
    Snapshot,
    SnapshotCreate,
    SnapshotPage,
    SnapshotSource,
    SnapshotSourcePage,
    Source,
    SourcePage,
    SourceSync,
    filtered,
)
from evidra.scope.service import Principal, ScopeService


class SnapshotService:
    def __init__(self, scopes: ScopeService) -> None:
        self.scopes = scopes
        self.database = scopes.database

    def sync_sources(
        self, principal: Principal, notebook_id: str, request: SourceSync
    ) -> SourcePage:
        with self.database.transaction() as connection:
            self.scopes.authorize(principal, "manage")
            self.scopes.notebook(connection, principal, notebook_id)
            stage_id = request.stage_id
            versions: dict[str, str] = {}
            if request.purpose == "selection":
                if stage_id is None:
                    stage_id = secrets.token_hex(16)
                    connection.execute(
                        "DELETE FROM selection_previews WHERE notebook_id=?", (notebook_id,)
                    )
                    connection.execute(
                        "INSERT INTO selection_stages VALUES (?,?,?,?,0) "
                        "ON CONFLICT(notebook_id) DO UPDATE SET id=excluded.id, "
                        "session_id=excluded.session_id,versions=excluded.versions,complete=0",
                        (notebook_id, stage_id, self.scopes.session_id, "{}"),
                    )
                else:
                    stage = self.scopes.selection_stage(
                        connection, notebook_id, stage_id, complete=False
                    )
                    versions = json.loads(stage["versions"])
            elif not request.final:
                raise EvidraError("INVALID_REQUEST", "Revalidation batches must be atomic.")
            elif stage_id is not None:
                stage = self.scopes.selection_stage(connection, notebook_id, stage_id)
                versions = json.loads(stage["versions"])
            result: dict[str, Source] = {}
            for item in request.items:
                if item.identity.profile_instance_id != principal.profile_instance_id:
                    raise EvidraError("FORBIDDEN", "Source belongs to another profile.")
                source_id = item.identity.source_id
                if request.purpose == "revalidation":
                    grant = connection.execute(
                        "SELECT 1 FROM notebook_grants WHERE notebook_id=? AND source_id=?",
                        (notebook_id, source_id),
                    ).fetchone()
                    if grant is None and source_id not in versions:
                        raise EvidraError(
                            "FORBIDDEN", "Revalidation requires existing source authority."
                        )
                version_id = hashlib.sha256(item.model_dump_json().encode()).hexdigest()
                value = Source(
                    **item.model_dump(),
                    id=source_id,
                    version_id=version_id,
                    year_state="missing" if item.year is None else "known",
                )
                if source_id in result and result[source_id] != value:
                    raise EvidraError("INVALID_REQUEST", "Conflicting duplicate source metadata.")
                connection.execute(
                    "INSERT INTO source_libraries VALUES (?,?,1) "
                    "ON CONFLICT(profile_instance_id,library_id) DO UPDATE SET available=1",
                    (principal.profile_instance_id, item.identity.library_id),
                )
                connection.execute(
                    "INSERT INTO sources VALUES (?,?,?,?,?,1,1,NULL) "
                    "ON CONFLICT(id) DO UPDATE SET version_id=excluded.version_id,available=1, "
                    "access_revision=sources.access_revision + CASE WHEN sources.available=0 "
                    "OR sources.version_id!=excluded.version_id THEN 1 ELSE 0 END,reason=NULL",
                    (
                        source_id,
                        principal.profile_instance_id,
                        item.identity.library_id,
                        item.identity.item_key,
                        version_id,
                    ),
                )
                connection.execute(
                    "INSERT OR IGNORE INTO source_versions VALUES (?,?,?)",
                    (source_id, version_id, value.model_dump_json()),
                )
                result[source_id] = value
                if request.purpose == "selection":
                    versions[source_id] = version_id
            if request.purpose == "selection":
                if len(versions) > 10000:
                    raise EvidraError("INVALID_REQUEST", "Selection exceeds 10000 sources.")
                connection.execute(
                    "UPDATE selection_stages SET versions=?,complete=? WHERE notebook_id=?",
                    (json.dumps(versions), int(request.final), notebook_id),
                )
            return SourcePage(
                items=list(result.values()), limit=len(result), total=len(result), stage_id=stage_id
            )

    def invalidate(self, principal: Principal, request: Invalidation) -> InvalidationResult:
        with self.database.transaction() as connection:
            self.scopes.authorize(principal, "manage")
            affected: set[str] = set()
            libraries: set[int] = set()
            for identity in request.identities:
                if identity.profile_instance_id != principal.profile_instance_id:
                    raise EvidraError("FORBIDDEN", "Source belongs to another profile.")
                if request.reason in {"archived", "library_missing"}:
                    if identity.library_id in libraries:
                        continue
                    libraries.add(identity.library_id)
                    rows = connection.execute(
                        "SELECT id FROM sources WHERE profile_instance_id=? AND library_id=?",
                        (principal.profile_instance_id, identity.library_id),
                    ).fetchall()
                    affected.update(row[0] for row in rows)
                    connection.execute(
                        "UPDATE sources SET available=0,access_revision=access_revision+1, "
                        "reason=? WHERE profile_instance_id=? AND library_id=?",
                        (request.reason, principal.profile_instance_id, identity.library_id),
                    )
                    connection.execute(
                        "UPDATE source_libraries SET available=0 "
                        "WHERE profile_instance_id=? AND library_id=?",
                        (principal.profile_instance_id, identity.library_id),
                    )
                elif identity.source_id not in affected:
                    changed = connection.execute(
                        "UPDATE sources SET available=0, "
                        "access_revision=access_revision+1,reason=? WHERE id=?",
                        (request.reason, identity.source_id),
                    ).rowcount
                    if changed:
                        affected.add(identity.source_id)
            self.scopes.invalidate_staging(connection, source_ids=affected)
            return InvalidationResult(invalidated_count=len(affected))

    def preview_selection(
        self, principal: Principal, notebook_id: str, request: PreviewRequest
    ) -> PreviewPage:
        with self.database.transaction() as connection:
            self.scopes.authorize(principal, "manage")
            notebook = self.scopes.notebook(connection, principal, notebook_id)
            stage = self.scopes.selection_stage(connection, notebook_id, request.stage_id)
            versions = json.loads(stage["versions"])
            candidates = set(versions)
            items, removed = [], []
            for source_id in versions:
                row = connection.execute(
                    "SELECT v.payload,s.available,s.version_id,l.available AS library_access "
                    "FROM sources s JOIN source_versions v ON v.source_id=s.id "
                    "AND v.version_id=s.version_id JOIN source_libraries l "
                    "ON l.profile_instance_id=s.profile_instance_id AND l.library_id=s.library_id "
                    "WHERE s.id=? AND s.profile_instance_id=?",
                    (source_id, principal.profile_instance_id),
                ).fetchone()
                if row is None:
                    raise EvidraError("NOT_FOUND", "Selected source not found.")
                if row["version_id"] != versions[source_id]:
                    raise EvidraError("SCOPE_STALE", "The staged source version has changed.")
                source = Source.model_validate_json(row["payload"])
                value, reason = filtered(source, request.selection)
                if not row["available"] or not row["library_access"]:
                    value, reason = None, "unavailable"
                if value is not None:
                    items.append(value)
                else:
                    removed.append(
                        RemovedSource.model_validate(
                            dict(
                                identity=source.identity,
                                title=None if reason == "unavailable" else source.title,
                                reason=reason,
                            )
                        )
                    )
            latest = connection.execute(
                "SELECT id FROM snapshots WHERE notebook_id=? ORDER BY revision DESC LIMIT 1",
                (notebook_id,),
            ).fetchone()
            previous = {
                r["source_id"]: r["payload"]
                for r in connection.execute(
                    "SELECT source_id,payload FROM snapshot_members WHERE snapshot_id=?",
                    (latest[0],),
                )
            }
            current = {s.id: s.model_dump_json() for s in items}
            duplicates: dict[str, list[str]] = {}
            for item in items:
                if item.doi:
                    duplicates.setdefault(item.doi.strip().lower(), []).append(item.id)
            preview = SelectionPreview(
                id=secrets.token_hex(16),
                notebook_id=notebook_id,
                stage_id=request.stage_id,
                expected_revision=notebook["revision"],
                selection=request.selection,
                items=items,
                removed=removed,
                added=sorted(current.keys() - previous.keys()),
                dropped=sorted(previous.keys() - current.keys()),
                changed=sorted(
                    k for k in current.keys() & previous.keys() if current[k] != previous[k]
                ),
                possible_duplicates=[ids for ids in duplicates.values() if len(ids) > 1],
            )
            connection.execute("DELETE FROM selection_previews WHERE notebook_id=?", (notebook_id,))
            connection.execute(
                "INSERT INTO selection_previews VALUES (?,?,?,?,?,?)",
                (
                    preview.id,
                    notebook_id,
                    preview.model_dump_json(),
                    self.scopes.fingerprint(connection, list(candidates)),
                    request.stage_id,
                    json.dumps(sorted(candidates)),
                ),
            )
            return self._preview_page(preview, 0, 50)

    @staticmethod
    def _fits_page(page: PreviewPage | SnapshotSourcePage | SnapshotPage) -> bool:
        # UTF-8 bounds the JSON's UTF-16 character count. Reserve room below the
        # renderer's 1,000,000-character cap for the native result/envelope fields.
        return len(page.model_dump_json().encode()) <= 900000

    def _preview_page(self, preview: SelectionPreview, offset: int, limit: int) -> PreviewPage:
        page = PreviewPage(
            id=preview.id,
            stage_id=preview.stage_id,
            notebook_id=preview.notebook_id,
            expected_revision=preview.expected_revision,
            items=[],
            removed=[],
            offset=offset,
            limit=0,
            total=len(preview.items) + len(preview.removed),
            included_count=len(preview.items),
            removed_count=len(preview.removed),
            added_count=len(preview.added),
            dropped_count=len(preview.dropped),
            changed_count=len(preview.changed),
            possible_duplicate_count=len(preview.possible_duplicates),
        )
        for index in range(offset, min(offset + limit, page.total)):
            if index < len(preview.items):
                candidate = page.model_copy(
                    update={"items": [*page.items, preview.items[index]], "limit": page.limit + 1}
                )
            else:
                candidate = page.model_copy(
                    update={
                        "removed": [*page.removed, preview.removed[index - len(preview.items)]],
                        "limit": page.limit + 1,
                    }
                )
            if not self._fits_page(candidate):
                if page.limit == 0:
                    raise EvidraError(
                        "BODY_TOO_LARGE", "Source metadata exceeds the response budget."
                    )
                break
            page = candidate
        return page

    def read_preview(
        self, principal: Principal, notebook_id: str, preview_id: str, offset: int, limit: int
    ) -> PreviewPage:
        with self.database.transaction() as connection:
            notebook = self.scopes.notebook(connection, principal, notebook_id)
            row = connection.execute(
                "SELECT * FROM selection_previews WHERE id=? AND notebook_id=?",
                (preview_id, notebook_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Preview not found.")
            preview = SelectionPreview.model_validate_json(row["payload"])
            self.scopes.selection_stage(connection, notebook_id, row["stage_id"])
            if preview.expected_revision != notebook["revision"] or row[
                "fingerprint"
            ] != self.scopes.fingerprint(connection, json.loads(row["candidate_ids"])):
                raise EvidraError("SCOPE_STALE", "Selection changed; request a new preview.")
            return self._preview_page(preview, offset, limit)

    def _snapshot(self, connection: sqlite3.Connection, row: sqlite3.Row) -> Snapshot:
        selection = connection.execute(
            "SELECT selection FROM snapshot_selections WHERE snapshot_id=?", (row["id"],)
        ).fetchone()
        count = connection.execute(
            "SELECT COUNT(*) FROM snapshot_members WHERE snapshot_id=?", (row["id"],)
        ).fetchone()[0]
        return Snapshot(
            id=row["id"],
            notebook_id=row["notebook_id"],
            revision=row["revision"],
            created_at=row["created_at"],
            member_count=count,
            selection=SelectionSpec.model_validate_json(selection[0])
            if selection
            else SelectionSpec(),
        )

    def create_snapshot(
        self, principal: Principal, notebook_id: str, request: SnapshotCreate
    ) -> Snapshot:
        with self.database.transaction() as connection:
            self.scopes.authorize(principal, "manage")
            notebook = self.scopes.notebook(connection, principal, notebook_id)
            existing = connection.execute(
                "SELECT * FROM snapshot_selections WHERE notebook_id=? AND idempotency_key=?",
                (notebook_id, request.idempotency_key),
            ).fetchone()
            if existing:
                if existing["request"] != request.model_dump_json():
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Snapshot key already used.")
                return self._snapshot(
                    connection,
                    connection.execute(
                        "SELECT * FROM snapshots WHERE id=?", (existing["snapshot_id"],)
                    ).fetchone(),
                )
            row = connection.execute(
                "SELECT * FROM selection_previews WHERE id=? AND notebook_id=?",
                (request.preview_id, notebook_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Preview not found.")
            preview = SelectionPreview.model_validate_json(row["payload"])
            self.scopes.selection_stage(connection, notebook_id, row["stage_id"])
            ids = json.loads(row["candidate_ids"])
            if (
                request.expected_revision != notebook["revision"]
                or preview.expected_revision != notebook["revision"]
                or row["fingerprint"] != self.scopes.fingerprint(connection, ids)
            ):
                raise EvidraError("SCOPE_STALE", "Selection changed; request a new preview.")
            snapshot_id, now = secrets.token_hex(16), datetime.now(UTC).isoformat()
            revision = notebook["revision"] + 1
            connection.execute(
                "INSERT INTO snapshots VALUES (?,?,?,?,?)",
                (snapshot_id, principal.profile_instance_id, notebook_id, now, revision),
            )
            connection.execute(
                "INSERT INTO snapshot_selections VALUES (?,?,?,?,?)",
                (
                    snapshot_id,
                    preview.selection.model_dump_json(),
                    request.idempotency_key,
                    notebook_id,
                    request.model_dump_json(),
                ),
            )
            connection.execute("DELETE FROM notebook_grants WHERE notebook_id=?", (notebook_id,))
            for source in preview.items:
                connection.execute(
                    "INSERT INTO snapshot_members VALUES (?,?,?,?)",
                    (snapshot_id, source.id, source.version_id, source.model_dump_json()),
                )
                connection.execute(
                    "INSERT INTO notebook_grants VALUES (?,?,?)",
                    (
                        notebook_id,
                        source.id,
                        json.dumps([(c.key, c.kind) for c in source.contents]),
                    ),
                )
            connection.execute(
                "UPDATE notebooks SET revision=?,updated_at=? WHERE id=?",
                (revision, now, notebook_id),
            )
            return self._snapshot(
                connection,
                connection.execute("SELECT * FROM snapshots WHERE id=?", (snapshot_id,)).fetchone(),
            )

    def list(self, principal: Principal, notebook_id: str, offset: int, limit: int) -> SnapshotPage:
        with self.database.transaction() as connection:
            self.scopes.notebook(connection, principal, notebook_id)
            rows = connection.execute(
                "SELECT * FROM snapshots WHERE notebook_id=? "
                "ORDER BY revision DESC LIMIT ? OFFSET ?",
                (notebook_id, limit, offset),
            ).fetchall()
            total = connection.execute(
                "SELECT COUNT(*) FROM snapshots WHERE notebook_id=?", (notebook_id,)
            ).fetchone()[0]
            page = SnapshotPage(
                items=[],
                offset=offset,
                limit=0,
                total=total,
            )
            for row in rows:
                candidate = page.model_copy(
                    update={
                        "items": [*page.items, self._snapshot(connection, row)],
                        "limit": page.limit + 1,
                    }
                )
                if not self._fits_page(candidate):
                    if page.limit == 0:
                        raise EvidraError(
                            "BODY_TOO_LARGE", "Snapshot metadata exceeds the response budget."
                        )
                    break
                page = candidate
            return page

    def read_sources(
        self, principal: Principal, notebook_id: str, snapshot_id: str, offset: int, limit: int
    ) -> SnapshotSourcePage:
        context = self.scopes.resolve(principal, notebook_id, snapshot_id)
        with self.scopes.guarded(context) as connection:
            rows = self.scopes.members(connection, notebook_id, snapshot_id)
            count = connection.execute(
                "SELECT COUNT(*) FROM snapshot_members WHERE snapshot_id=?", (snapshot_id,)
            ).fetchone()[0]
            # Authorization intersection precedes pagination (and later retrieval top-k).
            page = SnapshotSourcePage(
                items=[],
                offset=offset,
                limit=0,
                total=len(rows),
                unavailable_count=count - len(rows),
            )
            for row in rows[offset : offset + limit]:
                source = SnapshotSource(
                    source=self.scopes.content(row),
                    state="current" if row["version_id"] == row["current_version"] else "stale",
                )
                candidate = page.model_copy(
                    update={"items": [*page.items, source], "limit": page.limit + 1}
                )
                if not self._fits_page(candidate):
                    if page.limit == 0:
                        raise EvidraError(
                            "BODY_TOO_LARGE", "Source metadata exceeds the response budget."
                        )
                    break
                page = candidate
            return page

    def identities(
        self, principal: Principal, notebook_id: str, snapshot_id: str, offset: int, limit: int
    ) -> IdentityPage:
        with self.database.transaction() as connection:
            self.scopes.authorize(principal, "manage")
            self.scopes.notebook(connection, principal, notebook_id)
            if (
                connection.execute(
                    "SELECT 1 FROM snapshots WHERE notebook_id=? AND id=?",
                    (notebook_id, snapshot_id),
                ).fetchone()
                is None
            ):
                raise EvidraError("NOT_FOUND", "Snapshot not found.")
            rows = connection.execute(
                "SELECT s.profile_instance_id,s.library_id,s.item_key "
                "FROM snapshot_members m JOIN notebook_grants g ON g.source_id=m.source_id "
                "AND g.notebook_id=? JOIN sources s ON s.id=m.source_id "
                "WHERE m.snapshot_id=? ORDER BY s.id",
                (notebook_id, snapshot_id),
            ).fetchall()
            # Deliberately no title/content and no availability filter: temporary revocation
            # must be recheckable, whereas removed notebook grants never appear here.
            return IdentityPage.model_validate(
                dict(
                    items=[dict(r) for r in rows[offset : offset + limit]],
                    offset=offset,
                    limit=limit,
                    total=len(rows),
                )
            )
