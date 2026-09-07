"""Strict allowlisted ZIP data format. Import never extracts or executes archive paths."""

import hashlib
import io
import json
import re
import stat
import zipfile

from pydantic import BaseModel, ValidationError

from evidra.domain.documents import Evidence
from evidra.domain.errors import EvidraError
from evidra.domain.sources import SourceIdentity
from evidra.exports.models import (
    MAX_ARCHIVE_BYTES,
    MAX_DATA_BYTES,
    BackupManifest,
    ManifestFile,
    PortableNotebook,
)


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def strict_json(value: bytes) -> object:
    def unique(pairs: list[tuple[str, object]]) -> dict[str, object]:
        result = {}
        for key, child in pairs:
            if key in result:
                raise ValueError("Duplicate JSON key")
            result[key] = child
        return result

    def finite(value: str) -> None:
        raise ValueError("Non-finite JSON number")

    return json.loads(value, object_pairs_hook=unique, parse_constant=finite)


def make_backup(notebook: PortableNotebook, pdfs: list[tuple[ManifestFile, bytes]]) -> bytes:
    payload = notebook.model_dump_json().encode()
    if len(payload) > MAX_DATA_BYTES:
        raise EvidraError("BODY_TOO_LARGE", "Notebook exceeds the 64 MiB portable data limit.")
    entries = [
        (ManifestFile(path="notebook.json", bytes=len(payload), sha256=digest(payload)), payload),
        *pdfs,
    ]
    if sum(len(data) for _, data in entries) > MAX_ARCHIVE_BYTES:
        raise EvidraError("BODY_TOO_LARGE", "Backup exceeds the 128 MiB uncompressed limit.")
    manifest = BackupManifest(files=[item for item, _ in entries])
    stream = io.BytesIO()
    # Stored entries avoid creating highly compressible but self-rejected backups and
    # make preview sizes predictable. Reader still safely accepts bounded DEFLATE.
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_STORED) as archive:
        archive.writestr("manifest.json", manifest.model_dump_json().encode())
        for item, data in entries:
            if len(data) != item.bytes or digest(data) != item.sha256:
                raise EvidraError("DOCUMENT_STALE", "Backup input changed after preview.")
            archive.writestr(item.path, data)
    result = stream.getvalue()
    if len(result) > MAX_ARCHIVE_BYTES:
        raise EvidraError("BODY_TOO_LARGE", "Backup exceeds the 128 MiB archive limit.")
    return result


def read_backup(value: bytes) -> tuple[PortableNotebook, list[tuple[ManifestFile, bytes]]]:
    try:
        if not 1 <= len(value) <= MAX_ARCHIVE_BYTES:
            raise ValueError("Archive size limit")
        with zipfile.ZipFile(io.BytesIO(value)) as archive:
            entries = archive.infolist()
            if not 2 <= len(entries) <= 2002:
                raise ValueError("Archive entry count")
            names = set()
            total = 0
            for entry in entries:
                name = entry.filename
                mode = entry.external_attr >> 16
                if not re.fullmatch(
                    r"(?:manifest\.json|notebook\.json|pdfs/[a-f0-9]{64}\.pdf)", name
                ):
                    raise ValueError("Unrecognized archive path")
                if name.casefold() in names or stat.S_IFMT(mode) not in {0, stat.S_IFREG}:
                    raise ValueError("Duplicate or non-regular archive entry")
                names.add(name.casefold())
                if entry.flag_bits & 1 or entry.compress_type not in {
                    zipfile.ZIP_STORED,
                    zipfile.ZIP_DEFLATED,
                }:
                    raise ValueError("Unsupported archive encoding")
                if entry.file_size > MAX_ARCHIVE_BYTES or entry.file_size > max(
                    1024, entry.compress_size * 200
                ):
                    raise ValueError("Archive expansion limit")
                total += entry.file_size
                if total > MAX_ARCHIVE_BYTES:
                    raise ValueError("Archive aggregate size limit")
                if name == "manifest.json" and entry.file_size > 1_000_000:
                    raise ValueError("Manifest size limit")
                if name == "notebook.json" and entry.file_size > MAX_DATA_BYTES:
                    raise ValueError("Notebook size limit")
            if "manifest.json" not in names or "notebook.json" not in names:
                raise ValueError("Missing manifest or notebook")
            manifest = BackupManifest.model_validate(strict_json(archive.read("manifest.json")))
            declared = {f.path for f in manifest.files}
            if len(declared) != len(manifest.files) or declared != names - {"manifest.json"}:
                raise ValueError("Manifest entry set differs")
            files = []
            notebook = None
            for declared_file in manifest.files:
                info = archive.getinfo(declared_file.path)
                if info.file_size != declared_file.bytes:
                    raise ValueError("Manifest size differs")
                # Reading is bounded by both validated central-directory sizes and a
                # hard streaming limit; no filesystem paths are ever materialized.
                output = bytearray()
                with archive.open(info) as stream:
                    while part := stream.read(
                        min(1024 * 1024, declared_file.bytes - len(output) + 1)
                    ):
                        output.extend(part)
                        if len(output) > declared_file.bytes:
                            raise ValueError("Expanded declared_file size differs")
                content = bytes(output)
                if len(content) != declared_file.bytes or digest(content) != declared_file.sha256:
                    raise ValueError("Manifest checksum differs")
                if declared_file.path == "notebook.json":
                    if (
                        declared_file.source_identity is not None
                        or declared_file.content_key is not None
                        or declared_file.content_version is not None
                    ):
                        raise ValueError("Notebook manifest identity is invalid")
                    notebook = PortableNotebook.model_validate(strict_json(content))
                else:
                    if (
                        not content.startswith(b"%PDF-")
                        or declared_file.source_identity is None
                        or not declared_file.content_key
                        or not declared_file.content_version
                    ):
                        raise ValueError("PDF provenance or signature missing")
                    files.append((declared_file, content))
            if notebook is None:
                raise ValueError("Notebook missing")
            validate_references(notebook)
            for declared_file, _ in files:
                if declared_file.source_identity is None:
                    raise ValueError("PDF source identity missing")
                if not any(
                    r.kind == "document_version"
                    and r.data.sha256 == declared_file.sha256
                    and r.data.bytes_processed == declared_file.bytes
                    and r.data.source_id == declared_file.source_identity.source_id
                    and r.data.content_key == declared_file.content_key
                    and r.data.content_version == declared_file.content_version
                    for r in notebook.records
                ):
                    raise ValueError("PDF does not match a portable document version")
            return notebook, files
    except (
        ValueError,
        TypeError,
        KeyError,
        OSError,
        UnicodeError,
        RecursionError,
        zipfile.BadZipFile,
        NotImplementedError,
        ValidationError,
    ) as exc:
        raise EvidraError(
            "INVALID_BACKUP", "Backup failed path, size, checksum, version or schema validation."
        ) from exc


def validate_references(notebook: PortableNotebook) -> None:
    """Check identity, immutable original text/offsets and research version relationships."""
    groups: dict[tuple[str, str, str | None], list] = {}
    for record in notebook.records:
        groups.setdefault(
            (record.origin_profile_id, record.origin_notebook_id, record.origin_group_id), []
        ).append(record)
    for (profile, book, _), records in groups.items():
        sources = {r.data.id: r.data for r in records if r.kind == "source"}
        forms = {r.data.id: r.data for r in records if r.kind == "form"}
        protocols = {r.data.id: r.data for r in records if r.kind == "protocol"}
        proposals = {r.data.id: r.data for r in records if r.kind == "proposal"}
        documents = {r.data.id: r.data for r in records if r.kind == "document_version"}
        evidences = {r.data.id: r.data for r in records if r.kind == "evidence"}
        pages: dict[tuple[str, int], list] = {}

        def nested(
            value: object, sources=sources, evidences=evidences, forms=forms, protocols=protocols
        ) -> None:
            # Embedded external-note/research-input evidence is just as original as
            # top-level evidence. A syntactically valid nested quotation is not proof.
            if isinstance(value, Evidence):
                original = evidences.get(value.id)
                if original is None or value.model_dump(
                    exclude={"historical"}
                ) != original.model_dump(exclude={"historical"}):
                    raise ValueError("Nested original evidence differs from its immutable record")
            elif isinstance(value, SourceIdentity):
                if value.source_id not in sources or sources[value.source_id].identity != value:
                    raise ValueError("Nested compound source has no portable source record")
            if isinstance(value, BaseModel):
                for name in type(value).model_fields:
                    child = getattr(value, name)
                    if name == "source_id" and child is not None and child not in sources:
                        raise ValueError("Nested source reference is absent")
                    if name == "evidence_ids" and any(
                        identity not in evidences for identity in child
                    ):
                        raise ValueError("Nested evidence reference is absent")
                    if (
                        name
                        in {
                            "form_version_id",
                            "field_origin_form_version_id",
                            "decision_form_version_id",
                        }
                        and child is not None
                        and child not in forms
                    ):
                        raise ValueError("Nested immutable form reference is absent")
                    if name == "protocol_version_id" and child not in protocols:
                        raise ValueError("Nested immutable protocol reference is absent")
                    nested(child)
            elif isinstance(value, (list, tuple)):
                for child in value:
                    nested(child)

        for record in records:
            nested(record.data)
            for access in record.access:
                if (
                    access.identity.source_id not in sources
                    or access.identity.profile_instance_id != profile
                ):
                    raise ValueError("Unresolved source dependency")
                source_contents = {
                    (c.key, c.kind)
                    for r in records
                    if r.kind == "source" and r.data.id == access.identity.source_id
                    for c in r.data.contents
                }
                if any((c.key, c.kind) not in source_contents for c in access.contents):
                    raise ValueError("Unresolved content dependency")
            if record.kind == "source" and (
                record.data.id != record.data.identity.source_id
                or record.data.identity.profile_instance_id != profile
            ):
                raise ValueError("Compound source identity differs")
            if record.kind == "page_part":
                data = record.data
                if data.document_version_id not in documents:
                    raise ValueError("Unresolved document page version")
                pages.setdefault((data.document_version_id, data.page_index), []).append(data)
            if record.kind == "form":
                if record.data.notebook_id != book or any(
                    origin not in forms for origin in record.data.field_origins.values()
                ):
                    raise ValueError("Unresolved form lineage")
            if record.kind == "protocol" and record.data.form_version_id not in forms:
                raise ValueError("Unresolved protocol form")
            if record.kind == "proposal":
                data = record.data
                if (
                    data.form_version_id not in forms
                    or data.field_origin_form_version_id not in forms
                    or data.source_id not in sources
                    or any(e not in evidences for e in data.evidence_ids)
                ):
                    raise ValueError("Unresolved proposal dependency")
            if record.kind == "decision":
                data = record.data
                # Rejecting a competing proposal preserves the already reviewed cell.
                # Both the event target and retained cell must resolve independently.
                if data.proposal_id not in proposals or any(
                    state.proposal_id is not None and state.proposal_id not in proposals
                    for state in (data.old, data.new)
                ):
                    raise ValueError("Unresolved decision proposal")
            if record.kind == "screening" and (
                record.data.protocol_version_id not in protocols
                or record.data.source_id not in sources
            ):
                raise ValueError("Unresolved screening dependency")
        original = {}
        for key, parts in pages.items():
            parts.sort(key=lambda p: p.start)
            offset, text_parts = 0, []
            for index, part in enumerate(parts):
                if part.start != offset or part.final != (index == len(parts) - 1):
                    raise ValueError("Original page parts are not contiguous")
                text_parts.append(part.original_text)
                offset += len(part.original_text)
            original[key] = "".join(text_parts)
        for item in evidences.values():
            version = documents.get(item.document_version_id)
            text = original.get((item.document_version_id, item.page_index or 0))
            if (
                version is None
                or text is None
                or version.sha256 != item.document_sha256
                or version.source_id != item.source_id
                or item.source_identity.source_id != item.source_id
                or version.content_key != item.content_key
                or not 0 <= item.start < item.end <= len(text)
                or text[item.start : item.end] != item.excerpt
            ):
                raise ValueError("Original evidence identity or excerpt does not verify")
