"""Projection of immutable history through current snapshot/content authorization.

SQL first selects identities and dependency coordinates, never entire database rows.
Operational tables/requests, file paths, token hashes and scheduler authority are not
part of this format. Derived records are withheld as a whole when their input scope
is incomplete: retaining an answer while merely removing its citations is unsafe.
"""

import json
import sqlite3
from collections.abc import Callable

from pydantic import TypeAdapter

from evidra.domain.documents import ParsedPage
from evidra.domain.sources import (
    ContentIdentity,
    Source,
    SourceAccess,
    SourceContent,
    content_version,
)
from evidra.evidence.service import EvidenceService
from evidra.exports.models import (
    Omission,
    PortableNotebook,
    PortableRecord,
)
from evidra.extraction.forms import now
from evidra.scope.service import ScopeContext

RECORD: TypeAdapter[PortableRecord] = TypeAdapter(PortableRecord)


def collect(evidence: EvidenceService, context: ScopeContext) -> PortableNotebook:
    scopes = evidence.scopes
    records: dict[str, PortableRecord] = {}
    omissions: list[Omission] = []

    def omit(kind: str, identity: str) -> None:
        omissions.append(Omission(kind=kind, id=identity, reason="CURRENT_ACCESS_UNAVAILABLE"))

    def add(
        kind: str, identity: str, snapshot: str | None, access: list[SourceAccess], data: object
    ) -> None:
        key = f"{kind}:{identity}"
        if key not in records:
            records[key] = RECORD.validate_python(
                {
                    "id": key,
                    "kind": kind,
                    "origin_profile_id": context.principal.profile_instance_id,
                    "origin_notebook_id": context.notebook_id,
                    "snapshot_id": snapshot,
                    "access": access,
                    "data": data,
                }
            )

    with scopes.guarded(context) as conn:
        name = scopes.notebook(conn, context.principal, context.notebook_id)["name"]
        # Only authorized child descriptors cross the SQL/content boundary. In particular,
        # an excluded child title cannot travel inside an otherwise allowed parent JSON.
        allowed: dict[str, set[tuple[str, str]]] = {}
        for sid in context.source_ids:
            pairs = conn.execute(
                "SELECT c.key,c.kind FROM source_contents c JOIN notebook_grants g "
                "ON g.source_id=c.source_id AND g.notebook_id=? JOIN snapshot_members m "
                "ON m.source_id=c.source_id AND m.snapshot_id=? "
                "WHERE c.source_id=? AND c.available=1 "
                "AND EXISTS(SELECT 1 FROM json_each(g.contents) j "
                "WHERE json_extract(j.value,'$[0]')=c.key AND json_extract(j.value,'$[1]')=c.kind) "
                "AND EXISTS(SELECT 1 FROM json_each(m.payload,'$.contents') j "
                "WHERE json_extract(j.value,'$.key')=c.key AND "
                "json_extract(j.value,'$.kind')=c.kind)",
                (context.notebook_id, context.snapshot_id, sid),
            ).fetchall()
            allowed[sid] = {(r[0], r[1]) for r in pairs}

        snapshots = conn.execute(
            "SELECT id,revision,created_at FROM snapshots WHERE notebook_id=? ORDER BY revision,id",
            (context.notebook_id,),
        ).fetchall()
        complete: dict[str, bool] = {}
        access_by_snapshot: dict[str, list[SourceAccess]] = {}
        sources_by_snapshot: dict[tuple[str, str], Source] = {}
        for snap in snapshots:
            snapshot = snap["id"]
            members = conn.execute(
                "SELECT source_id,version_id FROM snapshot_members WHERE snapshot_id=? "
                "ORDER BY source_id",
                (snapshot,),
            ).fetchall()
            complete[snapshot] = True
            access_by_snapshot[snapshot] = []
            # Reuse the selected, authenticated context with the historical snapshot only
            # through the resolver. No request-supplied context/signature is trusted.
            # resolve() opens its own transaction, so create historical contexts outside
            # this transaction below; authorization here uses explicit metadata predicates.
            for member in members:
                sid, version = member["source_id"], member["version_id"]
                if sid not in allowed:
                    complete[snapshot] = False
                    omit("source", sid + ":" + version)
                    continue
                header = conn.execute(
                    "SELECT json_remove(payload,'$.contents') FROM snapshot_members WHERE "
                    "snapshot_id=? AND source_id=?",
                    (snapshot, sid),
                ).fetchone()[0]
                contents = []
                source_complete = True
                keys = conn.execute(
                    "SELECT json_extract(j.value,'$.key'),json_extract(j.value,'$.kind') "
                    "FROM snapshot_members m,json_each(m.payload,'$.contents') j WHERE "
                    "m.snapshot_id=? AND m.source_id=?",
                    (snapshot, sid),
                ).fetchall()
                for key, kind in keys:
                    if (key, kind) not in allowed[sid]:
                        source_complete = False
                        omit("content", sid + ":" + key)
                        continue
                    raw = conn.execute(
                        "SELECT j.value FROM snapshot_members "
                        "m,json_each(m.payload,'$.contents') j WHERE m.snapshot_id=? AND "
                        "m.source_id=? AND json_extract(j.value,'$.key')=? AND "
                        "json_extract(j.value,'$.kind')=?",
                        (snapshot, sid, key, kind),
                    ).fetchone()[0]
                    content = SourceContent.model_validate_json(raw)
                    document = conn.execute(
                        "SELECT id,coverage,file_identity FROM documents WHERE source_id=? AND "
                        "content_key=? AND content_version=?",
                        (sid, key, content_version(content)),
                    ).fetchone()
                    if document and (
                        document["coverage"] == "MISSING_FILE"
                        or kind in {"pdf", "text_attachment"}
                        and not document["file_identity"]
                    ):
                        source_complete = False
                        omit("content", sid + ":" + key)
                        continue
                    contents.append(content)
                source = Source.model_validate({**json.loads(header), "contents": contents})
                sources_by_snapshot[snapshot, sid] = source
                source_access = SourceAccess(
                    identity=source.identity,
                    contents=[ContentIdentity(key=c.key, kind=c.kind) for c in contents],
                )
                access_by_snapshot[snapshot].append(source_access)
                # Membership in each snapshot is needed to select the exact source
                # version in flat exports, even when the payload is unchanged.
                add(
                    "source",
                    sid + ":" + version + ":" + snapshot,
                    snapshot,
                    [source_access],
                    source,
                )
                if not source_complete:
                    complete[snapshot] = False
            selection = None
            if complete[snapshot]:
                row = conn.execute(
                    "SELECT selection FROM snapshot_selections WHERE snapshot_id=?", (snapshot,)
                ).fetchone()
                selection = json.loads(row[0]) if row else None
            add(
                "snapshot",
                snapshot,
                snapshot,
                access_by_snapshot[snapshot],
                {
                    "id": snapshot,
                    "notebook_id": context.notebook_id,
                    "revision": snap["revision"],
                    "created_at": snap["created_at"],
                    "selection": selection,
                    "member_ids": [a.identity.source_id for a in access_by_snapshot[snapshot]],
                },
            )

        def payloads(
            table: str,
            kind: str,
            snapshot: str | None,
            access: list[SourceAccess],
            permitted: bool,
            where: str,
            params: tuple[object, ...],
            *,
            column: str = "payload",
            predicate: Callable[[sqlite3.Row], bool] | None = None,
        ) -> None:
            # Table/column/where are static developer-owned declarations below.
            for row in conn.execute(
                f"SELECT id FROM {table} WHERE {where} ORDER BY id", params
            ).fetchall():
                if not permitted or predicate and not predicate(row):
                    omit(kind, row["id"])
                    continue
                value = conn.execute(
                    f"SELECT {column} FROM {table} WHERE id=?", (row["id"],)
                ).fetchone()[0]
                if value is not None:
                    add(kind, row["id"], snapshot, access, json.loads(value))

        all_access = merge_access([a for group in access_by_snapshot.values() for a in group])
        for table, kind in [("form_versions", "form"), ("protocol_versions", "protocol")]:
            payloads(
                table,
                kind,
                None,
                all_access,
                all(complete.values()),
                "notebook_id=?",
                (context.notebook_id,),
            )
        # Free text in runs can derive from uncited input/history, so use the entire
        # frozen snapshot dependency envelope, not only evidence IDs in final output.
        scoped = [
            ("extraction_proposals", "proposal"),
            ("cell_decisions", "decision"),
            ("screening_decisions", "screening"),
            ("extraction_jobs", "job"),
            ("research_runs", "research_run"),
            ("external_notes", "external_note"),
            ("note_previews", "note_preview"),
            ("approved_write_outbox", "outbox_history"),
        ]
        for snapshot in complete:
            # These records refer to notebook-wide form/protocol versions. When those
            # versions are omitted, withhold dependent records rather than emit dangling
            # immutable lineage or let free-text fields recover unavailable content.
            permitted, access = (
                complete[snapshot] and all(complete.values()),
                access_by_snapshot[snapshot],
            )
            for table, kind in scoped:
                payloads(
                    table,
                    kind,
                    snapshot,
                    access,
                    permitted,
                    "notebook_id=? AND snapshot_id=?",
                    (context.notebook_id, snapshot),
                )
            payloads(
                "research_runs",
                "research_preview",
                snapshot,
                access,
                permitted,
                "notebook_id=? AND snapshot_id=?",
                (context.notebook_id, snapshot),
                column="preview",
            )
            payloads(
                "conversation_runs",
                "conversation_run",
                snapshot,
                access,
                permitted,
                "conversation_id IN (SELECT id FROM conversations WHERE notebook_id=? "
                "AND snapshot_id=?)",
                (context.notebook_id, snapshot),
            )
            payloads(
                "artifact_versions",
                "artifact",
                snapshot,
                access,
                permitted,
                "run_id IN (SELECT id FROM research_runs WHERE notebook_id=? AND snapshot_id=?)",
                (context.notebook_id, snapshot),
            )
            payloads(
                "extraction_units",
                "unit",
                snapshot,
                access,
                permitted,
                "job_id IN (SELECT id FROM extraction_jobs WHERE notebook_id=? AND snapshot_id=?)",
                (context.notebook_id, snapshot),
            )

        # Original page parts and document versions are independent of derived history.
        # They can survive an unrelated source's revocation.
        seen_documents: set[str] = set()
        for snapshot, access in access_by_snapshot.items():
            for source_access in access:
                sid = source_access.identity.source_id
                source = sources_by_snapshot[snapshot, sid]
                for content in source.contents:
                    doc = conn.execute(
                        "SELECT id FROM documents WHERE source_id=? AND content_key=? AND "
                        "content_version=?",
                        (sid, content.key, content_version(content)),
                    ).fetchone()
                    if not doc or doc[0] in seen_documents:
                        continue
                    seen_documents.add(doc[0])
                    dep = [SourceAccess(identity=source.identity, contents=[content])]
                    versions = conn.execute(
                        "SELECT "
                        "id,document_id,sha256,parser_version,policy_version,coverage,page_count,"
                        "pages_processed,bytes_processed,created_at FROM document_versions "
                        "WHERE document_id=? ORDER BY created_at,id",
                        (doc[0],),
                    ).fetchall()
                    for version in versions:
                        add(
                            "document_version",
                            version["id"],
                            snapshot,
                            dep,
                            {
                                **dict(version),
                                "source_id": sid,
                                "content_key": content.key,
                                "content_version": content_version(content),
                                "source_kind": content.kind,
                            },
                        )
                        for page_row in conn.execute(
                            "SELECT payload FROM document_pages WHERE version_id=? ORDER BY "
                            "page_index",
                            (version["id"],),
                        ):
                            page = ParsedPage.model_validate_json(page_row[0])
                            for start in range(0, max(1, len(page.original_text)), 4000):
                                data = page.model_dump()
                                data.update(
                                    document_version_id=version["id"],
                                    start=start,
                                    original_text=page.original_text[start : start + 4000],
                                    char_boxes=page.char_boxes[start : start + 4000],
                                    final=start + 4000 >= len(page.original_text),
                                )
                                add(
                                    "page_part",
                                    f"{version['id']}:{page.page_index}:{start}",
                                    snapshot,
                                    dep,
                                    data,
                                )
                        # Defer original EvidenceService checks to separately resolved
                        # historical contexts. The IDs themselves contain no research text.
        result = PortableNotebook(
            profile_instance_id=context.principal.profile_instance_id,
            notebook_id=context.notebook_id,
            snapshot_id=context.snapshot_id,
            name=name,
            exported_at=now(),
            records=list(records.values()),
            omissions=omissions,
        )

    for record in list(result.records):
        if record.kind != "document_version":
            continue
        assert record.snapshot_id is not None
        historical = scopes.resolve(context.principal, context.notebook_id, record.snapshot_id)
        with scopes.guarded(historical) as conn:
            # Also recheck the original export boundary before every historical read.
            scopes._assert(conn, context, "read")
            for row in conn.execute(
                "SELECT id FROM document_chunks WHERE version_id=? ORDER BY "
                "page_index,start_offset,id",
                (record.data.id,),
            ).fetchall():
                item = evidence.from_connection(conn, historical, row[0])
                add("evidence", item.id, record.snapshot_id, record.access, item)
    scopes.assert_current(context)
    return result.model_copy(update={"records": list(records.values())})


def merge_access(items: list[SourceAccess]) -> list[SourceAccess]:
    merged: dict[str, SourceAccess] = {}
    for item in items:
        key = item.identity.source_id
        if key not in merged:
            merged[key] = item
        else:
            contents = {(c.key, c.kind): c for c in merged[key].contents}
            contents.update({(c.key, c.kind): c for c in item.contents})
            merged[key] = SourceAccess(identity=item.identity, contents=list(contents.values()))
    return sorted(merged.values(), key=lambda a: a.identity.source_id)


def archive_access(notebook: PortableNotebook) -> list[SourceAccess]:
    # Access envelopes in an external archive are untrusted declarations. Source
    # records themselves also require remapping, even if every envelope was erased.
    return merge_access(
        [a for r in notebook.records for a in r.access]
        + [
            SourceAccess(
                identity=r.data.identity,
                contents=[ContentIdentity(key=c.key, kind=c.kind) for c in r.data.contents],
            )
            for r in notebook.records
            if r.kind == "source"
        ]
    )
