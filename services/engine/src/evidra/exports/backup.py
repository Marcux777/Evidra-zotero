"""Strict allowlisted ZIP data format. Import never extracts or executes archive paths."""

import hashlib
import io
import json
import re
import stat
import zipfile

from pydantic import ValidationError

from evidra.domain.errors import EvidraError
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
            for entry in manifest.files:
                info = archive.getinfo(entry.path)
                if info.file_size != entry.bytes:
                    raise ValueError("Manifest size differs")
                # Reading is bounded by both validated central-directory sizes and a
                # hard streaming limit; no filesystem paths are ever materialized.
                output = bytearray()
                with archive.open(info) as stream:
                    while part := stream.read(min(1024 * 1024, entry.bytes - len(output) + 1)):
                        output.extend(part)
                        if len(output) > entry.bytes:
                            raise ValueError("Expanded entry size differs")
                content = bytes(output)
                if len(content) != entry.bytes or digest(content) != entry.sha256:
                    raise ValueError("Manifest checksum differs")
                if entry.path == "notebook.json":
                    if (
                        entry.source_identity is not None
                        or entry.content_key is not None
                        or entry.content_version is not None
                    ):
                        raise ValueError("Notebook manifest identity is invalid")
                    notebook = PortableNotebook.model_validate(strict_json(content))
                else:
                    if (
                        not content.startswith(b"%PDF-")
                        or entry.source_identity is None
                        or not entry.content_key
                        or not entry.content_version
                    ):
                        raise ValueError("PDF provenance or signature missing")
                    files.append((entry, content))
            if notebook is None:
                raise ValueError("Notebook missing")
            validate_references(notebook)
            for entry, _ in files:
                if not any(
                    r.kind == "document_version"
                    and r.data.sha256 == entry.sha256
                    and r.data.bytes_processed == entry.bytes
                    and r.data.source_id == entry.source_identity.source_id
                    and r.data.content_key == entry.content_key
                    and r.data.content_version == entry.content_version
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
            (record.origin_profile_id, record.origin_notebook_id, record.import_id), []
        ).append(record)
    for (profile, book, _), records in groups.items():
        sources = {r.data.id: r.data for r in records if r.kind == "source"}
        forms = {r.data.id: r.data for r in records if r.kind == "form"}
        protocols = {r.data.id: r.data for r in records if r.kind == "protocol"}
        proposals = {r.data.id: r.data for r in records if r.kind == "proposal"}
        documents = {r.data.id: r.data for r in records if r.kind == "document_version"}
        evidences = {r.data.id: r.data for r in records if r.kind == "evidence"}
        pages: dict[tuple[str, int], list] = {}
        for record in records:
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
                if data.proposal_id not in proposals or data.new.proposal_id != data.proposal_id:
                    raise ValueError("Unresolved decision proposal")
            if record.kind == "screening" and (
                record.data.protocol_version_id not in protocols
                or record.data.source_id not in sources
            ):
                raise ValueError("Unresolved screening dependency")
        original = {}
        for key, parts in pages.items():
            parts.sort(key=lambda p: p.start)
            offset, text = 0, []
            for index, part in enumerate(parts):
                if part.start != offset or part.final != (index == len(parts) - 1):
                    raise ValueError("Original page parts are not contiguous")
                text.append(part.original_text)
                offset += len(part.original_text)
            original[key] = "".join(text)
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
