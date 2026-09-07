"""Preview-bound bounded transfers and inert, explicitly remapped notebook imports."""

import base64
import binascii
import json
import secrets
import sqlite3
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from threading import RLock

from pydantic import TypeAdapter

from evidra.documents.registry import open_verified
from evidra.domain.errors import EvidraError
from evidra.domain.sources import SourceAccess, content_version
from evidra.evidence.service import EvidenceService
from evidra.exports.backup import digest, make_backup, read_backup
from evidra.exports.csv import render_csv
from evidra.exports.markdown import render_markdown
from evidra.exports.models import (
    CHUNK_BYTES,
    MAX_ARCHIVE_BYTES,
    ExportArtifact,
    ExportCreate,
    ExportData,
    ExportOptions,
    ExportPreview,
    ImportCommit,
    ImportedNotebook,
    ImportedRecordDetail,
    ImportedRecordPage,
    ImportMappingPart,
    ImportMappingState,
    ImportPage,
    ImportPreview,
    ImportReference,
    ImportSourcePage,
    ImportVisibility,
    ManifestFile,
    Omission,
    PortableNotebook,
    SourceRemap,
    UploadCreate,
    UploadPart,
    UploadReceipt,
)
from evidra.exports.notebook import RECORD, archive_access, collect
from evidra.extraction.forms import now
from evidra.scope.service import ScopeContext

ACCESS = TypeAdapter(list[SourceAccess])
MAPPINGS = TypeAdapter(list[SourceRemap])
BIBLIOGRAPHY = {"bibtex", "ris", "csl_json"}
FORMATS = {
    "json": ("notebook.json", "application/json"),
    "markdown": ("notebook.md", "text/markdown"),
    "csv_studies": ("studies.csv", "text/csv"),
    "csv_results": ("results.csv", "text/csv"),
    "backup": ("notebook.evidra.zip", "application/zip"),
}


@dataclass
class PreparedExport:
    context: ScopeContext
    notebook: PortableNotebook
    options: ExportOptions
    preview: ExportPreview
    pdfs: list[tuple[ManifestFile, str, str]]
    imported_pdfs: list[tuple[ManifestFile, bytes]]
    artifact: ExportArtifact | None = None
    data: bytes | None = None
    create_key: str | None = None


@dataclass
class Upload:
    context: ScopeContext
    spec: UploadCreate
    data: bytearray
    notebook: PortableNotebook | None = None
    files: list[tuple[ManifestFile, bytes]] | None = None
    mapping_revision: int = 0
    mappings: dict[str, SourceRemap] = field(default_factory=dict)
    complete_mappings: set[str] = field(default_factory=set)
    mapping_writes: dict[str, tuple[str, ImportMappingState]] = field(default_factory=dict)


class ExportService:
    def __init__(self, evidence: EvidenceService) -> None:
        self.evidence, self.scopes = evidence, evidence.scopes
        self._exports: dict[str, PreparedExport] = {}
        self._uploads: dict[str, Upload] = {}
        self._lock = RLock()

    def _reserve(self, mapping: dict) -> None:
        # Bounded per-engine staging, with explicit discard UI; do not evict a pending
        # idempotent operation silently. Restart drops these ephemeral bytes.
        if len(mapping) >= 8:
            raise EvidraError(
                "BODY_TOO_LARGE", "Discard an existing transfer before starting another (limit 8)."
            )

    def _lookup(self, mapping: dict, identity: str, context: ScopeContext):
        value = mapping.get(identity)
        if (
            value is None
            or value.context.notebook_id != context.notebook_id
            or value.context.snapshot_id != context.snapshot_id
        ):
            raise EvidraError("NOT_FOUND", "Transfer not found in this notebook and snapshot.")
        self.scopes.assert_current(value.context)
        self.scopes.assert_current(context)
        return value

    def _current_documents(self, prepared: PreparedExport) -> None:
        self.scopes.assert_current(prepared.context)
        # File availability can change without a content-version change. Cache hits
        # therefore check registry availability too, on every artifact chunk read.
        for record in prepared.notebook.records:
            if record.origin != "LOCAL" or record.kind != "document_version":
                continue
            historical = self.scopes.resolve(
                prepared.context.principal, prepared.context.notebook_id, record.snapshot_id
            )
            with self.scopes.guarded(historical) as conn:
                self.scopes._assert(conn, prepared.context, "read")
                self.evidence.registry.require(conn, historical, record.data.document_id)
        # Revalidate imported dependencies before replaying cached bytes as well.
        with self.scopes.guarded(prepared.context) as conn:
            for row in conn.execute(
                "SELECT access FROM imported_records WHERE import_id IN (SELECT id "
                "FROM imported_notebooks WHERE notebook_id=? AND snapshot_id=?)",
                (prepared.context.notebook_id, prepared.context.snapshot_id),
            ):
                if not self._allowed(conn, prepared.context, ACCESS.validate_json(row[0])):
                    if any(r.origin == "IMPORTED" for r in prepared.notebook.records):
                        raise EvidraError(
                            "SCOPE_STALE", "Imported history access changed after preview."
                        )

    def preview(self, context: ScopeContext, options: ExportOptions) -> ExportPreview:
        self.scopes.authorize(context.principal, "manage")
        notebook = collect(self.evidence, context)
        imported, omitted = self._history(context)
        notebook = notebook.model_copy(
            update={
                "records": notebook.records + imported,
                "omissions": notebook.omissions + omitted,
            }
        )
        pdfs: list[tuple[ManifestFile, str, str]] = []
        bibliography = []
        if options.format in BIBLIOGRAPHY:
            # Bibliography always uses the actual selected current snapshot, independent
            # of imported history. Imported IDs are never native lookup authority.
            native_sources = collect(self.evidence, context)
            sources = {
                r.data.id: r.data
                for r in native_sources.records
                if r.kind == "source" and r.snapshot_id == context.snapshot_id
            }
            if any(identity not in sources for identity in options.source_ids):
                raise EvidraError(
                    "SOURCE_REVOKED", "A bibliography study is outside current access."
                )
            bibliography = [
                sources[identity].model_copy(update={"contents": []})
                for identity in options.source_ids
            ]
        if options.include_pdfs:
            for record in notebook.records:
                if (
                    record.origin != "LOCAL"
                    or record.kind != "document_version"
                    or record.data.source_kind != "pdf"
                ):
                    continue
                historical = self.scopes.resolve(
                    context.principal, context.notebook_id, record.snapshot_id
                )
                with self.scopes.guarded(historical) as conn:
                    row = self.evidence.registry.require(conn, historical, record.data.document_id)
                    path, identity = row["path"], row["file_identity"]
                with open_verified(Path(path), identity) as opened:
                    if (
                        opened.size != record.data.bytes_processed
                        or opened.digest(lambda: self.scopes.assert_current(context))
                        != record.data.sha256
                    ):
                        raise EvidraError(
                            "DOCUMENT_STALE",
                            "A selected PDF differs from its immutable document version.",
                        )
                    item = ManifestFile(
                        path=f"pdfs/{record.data.id}.pdf",
                        bytes=opened.size,
                        sha256=record.data.sha256,
                        source_identity=record.access[0].identity,
                        content_key=record.data.content_key,
                        content_version=record.data.content_version,
                    )
                    pdfs.append((item, path, identity))
        imported_pdfs = []
        if options.include_pdfs:
            paths = {item.path: item for item, _, _ in pdfs}
            for item, data in self._imported_files(context):
                if item.path in paths:
                    if paths[item.path] != item:
                        raise EvidraError(
                            "INVALID_BACKUP", "PDF paths have conflicting original provenance."
                        )
                    continue
                paths[item.path] = item
                imported_pdfs.append((item, data))
        pdf_bytes = sum(p.bytes for p, _, _ in pdfs) + sum(p.bytes for p, _ in imported_pdfs)
        raw = (
            self._render(notebook, options)
            if options.format not in BIBLIOGRAPHY | {"backup"}
            else notebook.model_dump_json().encode()
        )
        if len(raw) + pdf_bytes > MAX_ARCHIVE_BYTES:
            raise EvidraError("BODY_TOO_LARGE", "Export exceeds the 128 MiB limit.")
        identity = secrets.token_hex(16)
        result = ExportPreview(
            id=identity,
            format=options.format,
            bytes=len(raw) + pdf_bytes,
            pdf_bytes=pdf_bytes,
            records=len(notebook.records),
            counts=dict(Counter(r.kind for r in notebook.records)),
            omitted_records=len(notebook.omissions),
            bibliography_scope="METADATA_ONLY_NO_ABSTRACT_NOTES_OR_ATTACHMENTS"
            if bibliography
            else None,
            bibliography=bibliography,
            incomplete_sources=[
                s.id for s in bibliography if not s.title or not s.year or not s.doi
            ],
        )
        with self._lock:
            self._reserve(self._exports)
            self._exports[identity] = PreparedExport(
                context, notebook, options, result, pdfs, imported_pdfs
            )
        return result

    @staticmethod
    def _render(notebook: PortableNotebook, options: ExportOptions) -> bytes:
        if options.format == "json":
            return notebook.model_dump_json(indent=2).encode()
        if options.format == "markdown":
            return render_markdown(notebook)
        if options.format in {"csv_studies", "csv_results"}:
            return render_csv(
                notebook, per_study=options.format == "csv_studies", excel=options.excel
            )
        raise EvidraError("INVALID_REQUEST", "This format requires its dedicated export adapter.")

    def validate_preview(self, context: ScopeContext, identity: str) -> ExportPreview:
        with self._lock:
            prepared = self._lookup(self._exports, identity, context)
            self._current_documents(prepared)
            return prepared.preview

    def create(self, context: ScopeContext, body: ExportCreate) -> ExportArtifact:
        with self._lock:
            prepared = self._lookup(self._exports, body.preview_id, context)
            self._current_documents(prepared)
            if prepared.create_key is not None:
                if prepared.create_key != body.idempotency_key:
                    raise EvidraError(
                        "IDEMPOTENCY_CONFLICT", "This preview already has an export operation."
                    )
                return prepared.artifact
            if prepared.options.format in BIBLIOGRAPHY:
                raise EvidraError(
                    "INVALID_REQUEST", "Bibliography requires the native Zotero translator bridge."
                )
            if prepared.options.format == "backup":
                pdfs = []
                for item, path, identity in prepared.pdfs:
                    with open_verified(Path(path), identity) as opened:
                        chunks = bytearray()
                        while block := opened.stream.read(1024 * 1024):
                            self.scopes.assert_current(context)
                            chunks.extend(block)
                            if len(chunks) > item.bytes:
                                raise EvidraError("DOCUMENT_STALE", "A selected PDF changed.")
                        pdfs.append((item, bytes(chunks)))
                pdfs.extend(prepared.imported_pdfs)
                data = make_backup(prepared.notebook, pdfs)
            else:
                data = self._render(prepared.notebook, prepared.options)
            if len(data) > MAX_ARCHIVE_BYTES:
                raise EvidraError("BODY_TOO_LARGE", "Export exceeds the 128 MiB limit.")
            self._current_documents(prepared)
            filename, media_type = FORMATS[prepared.options.format]
            artifact = ExportArtifact(
                id=body.preview_id,
                filename=filename,
                media_type=media_type,
                bytes=len(data),
                sha256=digest(data),
            )
            prepared.data, prepared.artifact, prepared.create_key = (
                data,
                artifact,
                body.idempotency_key,
            )
            return artifact

    def data(self, context: ScopeContext, identity: str, offset: int) -> ExportData:
        with self._lock:
            prepared = self._lookup(self._exports, identity, context)
            self._current_documents(prepared)
            if prepared.data is None or not 0 <= offset <= len(prepared.data):
                raise EvidraError("INVALID_REQUEST", "Export data or offset is unavailable.")
            return ExportData(
                offset=offset,
                total=len(prepared.data),
                data_base64=base64.b64encode(prepared.data[offset : offset + CHUNK_BYTES]).decode(),
            )

    def discard(self, context: ScopeContext, identity: str) -> None:
        self.scopes.authorize(context.principal, "manage")
        with self._lock:
            for mapping in (self._exports, self._uploads):
                value = mapping.get(identity)
                if (
                    value
                    and value.context.notebook_id == context.notebook_id
                    and value.context.snapshot_id == context.snapshot_id
                ):
                    del mapping[identity]

    def upload(self, context: ScopeContext, spec: UploadCreate) -> UploadReceipt:
        self.scopes.authorize(context.principal, "manage")
        self.scopes.assert_current(context)
        with self._lock:
            self._reserve(self._uploads)
            if sum(s.spec.bytes for s in self._uploads.values()) + spec.bytes > MAX_ARCHIVE_BYTES:
                raise EvidraError(
                    "BODY_TOO_LARGE", "Discard a staged import before uploading another."
                )
            identity = secrets.token_hex(16)
            self._uploads[identity] = Upload(context, spec, bytearray())
            return UploadReceipt(id=identity, offset=0, bytes=spec.bytes)

    def part(self, context: ScopeContext, identity: str, body: UploadPart) -> UploadReceipt:
        with self._lock:
            stage = self._lookup(self._uploads, identity, context)
            try:
                value = base64.b64decode(body.data_base64, validate=True)
            except binascii.Error as exc:
                raise EvidraError("INVALID_BACKUP", "Invalid transfer encoding.") from exc
            if not value or len(value) > CHUNK_BYTES or body.offset + len(value) > stage.spec.bytes:
                raise EvidraError("INVALID_BACKUP", "Import transfer exceeds its declared bounds.")
            if body.offset < len(stage.data):
                if bytes(stage.data[body.offset : body.offset + len(value)]) != value:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Import retry bytes differ.")
            elif body.offset != len(stage.data) or stage.notebook is not None:
                raise EvidraError(
                    "INVALID_BACKUP", "Import parts must be contiguous and immutable."
                )
            else:
                stage.data.extend(value)
            return UploadReceipt(id=identity, offset=len(stage.data), bytes=stage.spec.bytes)

    def inspect(self, context: ScopeContext, identity: str) -> ImportPreview:
        with self._lock:
            stage = self._lookup(self._uploads, identity, context)
            if len(stage.data) != stage.spec.bytes or digest(stage.data) != stage.spec.sha256:
                raise EvidraError("INVALID_BACKUP", "Import transfer size or checksum differs.")
            notebook, files = read_backup(bytes(stage.data))
            access = archive_access(notebook)
            stage.notebook, stage.files = notebook, files
            return ImportPreview(
                id=identity,
                name=notebook.name,
                profile_instance_id=notebook.profile_instance_id,
                records=len(notebook.records),
                pdf_bytes=sum(f.bytes for f, _ in files),
                source_count=len(access),
                mapping_revision=stage.mapping_revision,
            )

    def import_sources(self, context: ScopeContext, identity: str, offset: int) -> ImportSourcePage:
        with self._lock:
            stage = self._lookup(self._uploads, identity, context)
            if stage.notebook is None:
                raise EvidraError("INVALID_BACKUP", "Inspect the backup before mapping sources.")
            items = archive_access(stage.notebook)
            page = ImportSourcePage(
                items=items[offset : offset + 20],
                offset=offset,
                limit=len(items[offset : offset + 20]),
                total=len(items),
            )
            while len(page.model_dump_json().encode()) > 900000:
                if len(page.items) <= 1:
                    raise EvidraError(
                        "BODY_TOO_LARGE", "Source mapping exceeds the display envelope."
                    )
                page = page.model_copy(update={"items": page.items[:-1], "limit": page.limit - 1})
            return page

    def map_import(
        self, context: ScopeContext, identity: str, body: ImportMappingPart
    ) -> ImportMappingState:
        with self._lock:
            stage = self._lookup(self._uploads, identity, context)
            if stage.notebook is None:
                raise EvidraError("INVALID_BACKUP", "Inspect the backup before mapping sources.")
            request = body.model_dump_json()
            prior = stage.mapping_writes.get(body.idempotency_key)
            if prior:
                if prior[0] != request:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Mapping retry differs.")
                return prior[1]
            if stage.mapping_revision != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Import mapping revision changed.")
            originals = archive_access(stage.notebook)
            original = next((a for a in originals if a.identity == body.original), None)
            if original is None:
                raise EvidraError("SCOPE_DENIED", "Original source is outside this backup.")
            existing = stage.mappings.get(body.original.source_id)
            if body.offset:
                if (
                    existing is None
                    or existing.target != body.target
                    or len(existing.contents) != body.offset
                    or body.original.source_id in stage.complete_mappings
                ):
                    raise EvidraError("INVALID_REQUEST", "Mapping parts must be contiguous.")
                contents = existing.contents + body.contents
            else:
                contents = body.contents
            pairs = {(c.original_key, c.kind) for c in contents}
            expected = {(c.key, c.kind) for c in original.contents}
            if (
                len(pairs) != len(contents)
                or not pairs <= expected
                or len({c.target_key for c in contents}) != len(contents)
                or body.final
                and pairs != expected
            ):
                raise EvidraError(
                    "SCOPE_DENIED", "Map each original content identity exactly once."
                )
            target_access = SourceAccess(
                identity=body.target,
                contents=[{"key": c.target_key, "kind": c.kind} for c in contents],
            )
            with self.scopes.guarded(context) as conn:
                if not self._allowed(conn, context, [target_access]):
                    raise EvidraError(
                        "SCOPE_DENIED", "Mapping requires current destination access."
                    )
            stage.mappings[body.original.source_id] = SourceRemap(
                original=body.original, target=body.target, contents=contents
            )
            stage.complete_mappings.discard(body.original.source_id)
            if body.final:
                stage.complete_mappings.add(body.original.source_id)
            stage.mapping_revision += 1
            result = ImportMappingState(
                revision=stage.mapping_revision,
                mapped_sources=len(stage.complete_mappings),
                total_sources=len(originals),
            )
            if len(stage.mapping_writes) >= 100000:
                raise EvidraError("BODY_TOO_LARGE", "Import mapping command limit reached.")
            stage.mapping_writes[body.idempotency_key] = (request, result)
            return result

    def _allowed(
        self, conn: sqlite3.Connection, context: ScopeContext, access: list[SourceAccess]
    ) -> bool:
        for item in access:
            if (
                item.identity.profile_instance_id != context.principal.profile_instance_id
                or item.identity.source_id not in context.source_ids
            ):
                return False
            for content in item.contents:
                try:
                    _, observed = self.evidence.registry.content(
                        conn, context, item.identity.source_id, content.key
                    )
                    if observed.kind != content.kind:
                        return False
                    doc = conn.execute(
                        "SELECT id FROM documents WHERE source_id=? AND content_key=? AND "
                        "content_version=?",
                        (item.identity.source_id, content.key, content_version(observed)),
                    ).fetchone()
                    if doc:
                        self.evidence.registry.require(conn, context, doc[0])
                except EvidraError as exc:
                    if exc.code in {"SOURCE_REVOKED", "MISSING_FILE", "DOCUMENT_STALE"}:
                        return False
                    raise
        return True

    def commit_import(self, context: ScopeContext, body: ImportCommit) -> ImportedNotebook:
        self.scopes.authorize(context.principal, "manage")
        with self._lock:
            stage = self._lookup(self._uploads, body.preview_id, context)
            if stage.notebook is None or stage.files is None:
                raise EvidraError(
                    "INVALID_BACKUP", "Inspect the complete backup before confirming remapping."
                )
            original = archive_access(stage.notebook)
            remaps = stage.mappings
            mappings = list(remaps.values())
            if body.expected_mapping_revision != stage.mapping_revision:
                raise EvidraError(
                    "REVISION_CONFLICT", "Review the current mapping revision before importing."
                )
            if (
                stage.complete_mappings != {a.identity.source_id for a in original}
                or set(remaps) != stage.complete_mappings
                or len({m.target.source_id for m in mappings}) != len(mappings)
            ):
                raise EvidraError(
                    "SCOPE_DENIED", "Confirm a one-to-one mapping for every original source."
                )
            mapped = []
            for item in original:
                remap = remaps[item.identity.source_id]
                pairs = {(c.original_key, c.kind) for c in remap.contents}
                if (
                    pairs != {(c.key, c.kind) for c in item.contents}
                    or len(pairs) != len(remap.contents)
                    or len({c.target_key for c in remap.contents}) != len(remap.contents)
                ):
                    raise EvidraError(
                        "SCOPE_DENIED",
                        "Confirm a one-to-one content mapping for every original source.",
                    )
                mapped.append(
                    SourceAccess(
                        identity=remap.target,
                        contents=[{"key": c.target_key, "kind": c.kind} for c in remap.contents],
                    )
                )
            request = json.dumps(
                {"sha256": stage.spec.sha256, "mappings": [m.model_dump() for m in mappings]},
                sort_keys=True,
            )
            with self.scopes.guarded(context, capability="commit") as conn:
                if not self._allowed(conn, context, mapped):
                    raise EvidraError(
                        "SCOPE_DENIED",
                        "Destination mappings require current profile, library, item and "
                        "content access.",
                    )
                prior = conn.execute(
                    "SELECT request,payload FROM imported_notebooks WHERE notebook_id=? "
                    "AND snapshot_id=? AND idempotency_key=?",
                    (context.notebook_id, context.snapshot_id, body.idempotency_key),
                ).fetchone()
                if prior:
                    if prior[0] != request:
                        raise EvidraError(
                            "IDEMPOTENCY_CONFLICT",
                            "Import command differs from the recorded operation.",
                        )
                    return ImportedNotebook.model_validate_json(prior[1])
                result = ImportedNotebook(
                    id=secrets.token_hex(16),
                    name=stage.notebook.name,
                    origin_profile_id=stage.notebook.profile_instance_id,
                    origin_notebook_id=stage.notebook.notebook_id,
                    imported_at=now(),
                    record_count=len(stage.notebook.records),
                )
                conn.execute(
                    "INSERT INTO imported_notebooks VALUES(?,?,?,?,?,?,?)",
                    (
                        result.id,
                        context.notebook_id,
                        context.snapshot_id,
                        body.idempotency_key,
                        request,
                        result.model_dump_json(),
                        MAPPINGS.dump_json(mappings).decode(),
                    ),
                )
                # Imported free text is untrusted. Bind every record to the complete
                # confirmed dependency envelope, regardless of its self-declared access.
                mapped_json = ACCESS.dump_json(mapped).decode()
                for ordinal, record in enumerate(stage.notebook.records):
                    imported = record.model_copy(
                        update={
                            "origin": "IMPORTED",
                            "id": f"import:{result.id}:{ordinal}",
                            "import_id": result.id,
                            "imported_at": result.imported_at,
                            "original_record_id": record.original_record_id or record.id,
                        }
                    )
                    conn.execute(
                        "INSERT INTO imported_records VALUES(?,?,?,?,?,?)",
                        (
                            result.id,
                            ordinal,
                            record.kind,
                            record.id,
                            mapped_json,
                            imported.model_dump_json(),
                        ),
                    )
                for file, data in stage.files:
                    conn.execute(
                        "INSERT INTO imported_files VALUES(?,?,?,?,?)",
                        (result.id, file.path, file.model_dump_json(), mapped_json, data),
                    )
                return result

    def _history(self, context: ScopeContext, identity: str | None = None):
        records, omissions = [], []
        with self.scopes.guarded(context) as conn:
            query = (
                "SELECT r.import_id,r.ordinal,r.kind,r.original_record_id,r.access "
                "FROM imported_records r JOIN imported_notebooks i ON i.id=r.import_id "
                "WHERE i.notebook_id=? AND i.snapshot_id=?"
            )
            args: tuple = (context.notebook_id, context.snapshot_id)
            if identity is not None:
                self._import(conn, context, identity)
                query += " AND i.id=?"
                args += (identity,)
            seen = set()
            for row in conn.execute(query + " ORDER BY i.id,r.ordinal", args).fetchall():
                if not self._allowed(conn, context, ACCESS.validate_json(row["access"])):
                    omissions.append(
                        Omission(
                            kind=row["kind"],
                            id=row["original_record_id"],
                            reason="CURRENT_ACCESS_UNAVAILABLE",
                        )
                    )
                    continue
                value = conn.execute(
                    "SELECT payload FROM imported_records WHERE import_id=? AND ordinal=?",
                    (row["import_id"], row["ordinal"]),
                ).fetchone()[0]
                record = RECORD.validate_json(value)
                key = (record.origin_profile_id, record.origin_notebook_id, record.id)
                if key not in seen:
                    records.append(record)
                    seen.add(key)
        return records, omissions

    def _imported_files(self, context: ScopeContext):
        files = []
        with self.scopes.guarded(context) as conn:
            for row in conn.execute(
                "SELECT f.import_id,f.path,f.access FROM imported_files f JOIN "
                "imported_notebooks i ON i.id=f.import_id WHERE i.notebook_id=? AND "
                "i.snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).fetchall():
                if self._allowed(conn, context, ACCESS.validate_json(row["access"])):
                    value = conn.execute(
                        "SELECT manifest,data FROM imported_files WHERE import_id=? AND path=?",
                        (row["import_id"], row["path"]),
                    ).fetchone()
                    files.append((ManifestFile.model_validate_json(value[0]), value[1]))
        return files

    def _import(self, conn: sqlite3.Connection, context: ScopeContext, identity: str):
        row = conn.execute(
            "SELECT payload,mappings FROM imported_notebooks WHERE id=? AND "
            "notebook_id=? AND snapshot_id=?",
            (identity, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Imported history not found.")
        return row

    def imports(self, context: ScopeContext, offset: int, limit: int) -> ImportPage:
        with self.scopes.guarded(context) as conn:
            total = conn.execute(
                "SELECT count(*) FROM imported_notebooks WHERE notebook_id=? AND snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).fetchone()[0]
            rows = conn.execute(
                "SELECT payload FROM imported_notebooks WHERE notebook_id=? AND "
                "snapshot_id=? ORDER BY id LIMIT ? OFFSET ?",
                (context.notebook_id, context.snapshot_id, limit, offset),
            ).fetchall()
            return ImportPage(
                items=[ImportedNotebook.model_validate_json(r[0]) for r in rows],
                offset=offset,
                limit=len(rows),
                total=total,
            )

    def records(
        self, context: ScopeContext, identity: str, offset: int, limit: int
    ) -> ImportedRecordPage:
        records, omissions = self._history(context, identity)
        page = ImportedRecordPage(
            items=records[offset : offset + limit],
            offset=offset,
            limit=len(records[offset : offset + limit]),
            total=len(records),
            omitted_records=len(omissions),
        )
        while len(page.model_dump_json().encode()) > 900000:
            if len(page.items) <= 1:
                raise EvidraError(
                    "BODY_TOO_LARGE",
                    "This historical record exceeds the display envelope; use a scoped export.",
                )
            page = page.model_copy(update={"items": page.items[:-1], "limit": page.limit - 1})
        return page

    def visibility(self, context: ScopeContext, identity: str) -> ImportVisibility:
        with self.scopes.guarded(context) as conn:
            self._import(conn, context, identity)
            rows = conn.execute(
                "SELECT access FROM imported_records WHERE import_id=?", (identity,)
            ).fetchall()
            count = sum(self._allowed(conn, context, ACCESS.validate_json(row[0])) for row in rows)
            return ImportVisibility(
                visible=count == len(rows), records=count, omitted_records=len(rows) - count
            )

    def reference(
        self, context: ScopeContext, identity: str, body: ImportReference
    ) -> ImportedRecordDetail:
        with self.scopes.guarded(context) as conn:
            self._import(conn, context, identity)
            rows = conn.execute(
                "SELECT ordinal,access FROM imported_records WHERE import_id=? AND "
                "kind=? AND json_extract(payload,'$.data.id')=? ORDER BY ordinal",
                (identity, body.kind, body.identity),
            ).fetchall()
            if not rows:
                raise EvidraError(
                    "NOT_FOUND", "Original referenced version is absent from this import."
                )
            row = rows[0]
            if not self._allowed(conn, context, ACCESS.validate_json(row["access"])):
                raise EvidraError(
                    "SOURCE_REVOKED", "Original referenced version is outside current access."
                )
            result = ImportedRecordDetail(
                record=RECORD.validate_json(
                    conn.execute(
                        "SELECT payload FROM imported_records WHERE import_id=? AND ordinal=?",
                        (identity, row["ordinal"]),
                    ).fetchone()[0]
                )
            )
            if len(result.model_dump_json().encode()) > 900000:
                raise EvidraError(
                    "BODY_TOO_LARGE", "Original referenced version exceeds the display envelope."
                )
            return result

    def mapped_evidence(self, context: ScopeContext, identity: str, evidence_id: str):
        records, _ = self._history(context, identity)
        item = next(
            (r.data for r in records if r.kind == "evidence" and r.data.id == evidence_id), None
        )
        if item is None:
            raise EvidraError(
                "SOURCE_REVOKED", "Imported evidence is outside current mapping access."
            )
        with self.scopes.guarded(context) as conn:
            mappings = MAPPINGS.validate_json(self._import(conn, context, identity)["mappings"])
            remap = next(m for m in mappings if m.original == item.source_identity)
            mapped = next(
                c
                for c in remap.contents
                if c.original_key == item.content_key and c.kind == item.source_kind
            )
            # A mapping alone does not prove that the original excerpt is present in a
            # different study. Match actual indexed immutable bytes and offsets first.
            candidates = conn.execute(
                "SELECT c.id FROM document_chunks c JOIN document_versions v ON "
                "v.id=c.version_id JOIN documents d ON d.id=v.document_id WHERE "
                "d.source_id=? AND d.content_key=? AND v.sha256=? AND c.start_offset=? "
                "AND c.end_offset=?",
                (
                    remap.target.source_id,
                    mapped.target_key,
                    item.document_sha256,
                    item.start,
                    item.end,
                ),
            ).fetchall()
            for row in candidates:
                candidate = self.evidence.from_connection(conn, context, row[0])
                if (
                    candidate.excerpt == item.excerpt
                    and candidate.source_kind == item.source_kind
                    and candidate.page_index == item.page_index
                ):
                    return candidate
        raise EvidraError(
            "DOCUMENT_STALE",
            "Mapped source does not contain the verified original evidence. Index "
            "and review the destination source first.",
        )
