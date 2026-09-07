"""Bridge-only file registrations, bound to authorized immutable content observations."""

import hashlib
import json
import logging
import msvcrt
import os
import secrets
import sqlite3
import stat
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

import pywintypes  # type: ignore[import-untyped]
import win32con  # type: ignore[import-untyped]
import win32file  # type: ignore[import-untyped]

from evidra.domain.documents import (
    AttachmentRegister,
    Coverage,
    DocumentTargetRequest,
    RegisteredDocument,
)
from evidra.domain.errors import EvidraError
from evidra.domain.sources import Source, SourceContent, content_version, metadata_version
from evidra.scope.service import ScopeContext, ScopeService

logger = logging.getLogger(__name__)
FILE_OBSERVATION_ERRORS = {
    "MISSING_FILE",
    "INVALID_DOCUMENT_TYPE",
    "DOCUMENT_FILE_ERROR",
    "INVALID_DOCUMENT_PATH",
    "REPARSE_POINT",
    "NOT_REGULAR_FILE",
}


@dataclass
class VerifiedFile:
    stream: BinaryIO
    path: Path
    identity: str
    size: int

    def recheck(self) -> None:
        validate_components(self.path)
        if file_identity(self.stream, self.path) != self.identity:
            raise EvidraError("DOCUMENT_STALE", "The registered file changed.")

    def digest(self, check: Callable[[], None]) -> str:
        self.stream.seek(0)
        digest = hashlib.sha256()
        while block := self.stream.read(1024 * 1024):
            check()
            digest.update(block)
        self.recheck()
        self.stream.seek(0)
        return digest.hexdigest()


def validate_components(path: Path) -> None:
    # No alternate streams, device namespace, network path or relative path resolution.
    if not path.is_absolute() or len(path.drive) != 2 or path.drive[1] != ":":
        raise EvidraError("INVALID_DOCUMENT_PATH", "A local absolute file is required.")
    if any(":" in p or p in {".", ".."} for p in path.parts[1:]):
        raise EvidraError("INVALID_DOCUMENT_PATH", "The attachment path is invalid.")
    for component in [*reversed(path.parents), path]:
        value = component.lstat()
        if value.st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
            raise EvidraError(
                "REPARSE_POINT", "Linked or redirected attachments are not permitted."
            )
        if component != path and not stat.S_ISDIR(value.st_mode):
            raise EvidraError("INVALID_DOCUMENT_PATH", "An attachment parent is not a directory.")
    if not stat.S_ISREG(value.st_mode):
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular file.")


def file_identity(stream: BinaryIO, path: Path) -> str:
    handle = msvcrt.get_osfhandle(stream.fileno())
    if win32file.GetFileType(handle) != win32file.FILE_TYPE_DISK:
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular disk file.")
    info = win32file.GetFileInformationByHandle(handle)
    if info[0] & stat.FILE_ATTRIBUTE_REPARSE_POINT:
        raise EvidraError("REPARSE_POINT", "The opened attachment is redirected.")
    final = win32file.GetFinalPathNameByHandle(handle, 0)
    if not final.startswith("\\\\?\\") or os.path.normcase(final[4:]) != os.path.normcase(
        str(path)
    ):
        raise EvidraError("DOCUMENT_STALE", "The attachment path changed while opening it.")
    value = os.fstat(stream.fileno())
    return json.dumps(
        [info[4], info[8], info[9], value.st_size, value.st_mtime_ns], separators=(",", ":")
    )


@contextmanager
def open_verified(path: Path, expected: str | None = None) -> Iterator[VerifiedFile]:
    try:
        validate_components(path)
        handle = win32file.CreateFile(
            str(path),
            win32con.GENERIC_READ,
            win32con.FILE_SHARE_READ,
            None,
            win32con.OPEN_EXISTING,
            win32file.FILE_FLAG_OPEN_REPARSE_POINT | win32con.FILE_FLAG_SEQUENTIAL_SCAN,
            None,
        )
        try:
            fd = msvcrt.open_osfhandle(int(handle), os.O_RDONLY | os.O_BINARY)
        except BaseException:
            handle.Close()
            raise
        handle.Detach()  # The CRT file descriptor now owns this exact handle.
        with os.fdopen(fd, "rb") as stream:
            identity = file_identity(stream, path)
            if expected is not None and expected != identity:
                raise EvidraError("DOCUMENT_STALE", "The registered file changed.")
            opened = VerifiedFile(stream, path, identity, os.fstat(fd).st_size)
            yield opened
            opened.recheck()
    except FileNotFoundError as exc:
        raise EvidraError("MISSING_FILE", "The local attachment is missing.") from exc
    except (OSError, pywintypes.error) as exc:
        if getattr(exc, "winerror", None) in {2, 3}:
            raise EvidraError("MISSING_FILE", "The local attachment is missing.") from exc
        raise EvidraError(
            "DOCUMENT_FILE_ERROR",
            "The attachment could not be opened safely.",
            details={"winerror": getattr(exc, "winerror", None)},
        ) from exc


class DocumentRegistry:
    def __init__(self, scopes: ScopeService) -> None:
        self.scopes = scopes

    def content(
        self,
        connection: sqlite3.Connection,
        context: ScopeContext,
        source_id: str,
        content_key: str,
        *,
        current: bool = False,
    ) -> tuple[Source, SourceContent]:
        row = next(
            (
                row
                for row in self.scopes.members(connection, context.notebook_id, context.snapshot_id)
                if row["source_id"] == source_id
            ),
            None,
        )
        if row is None:
            raise EvidraError("SOURCE_REVOKED", "Source is outside the current scope.")
        source = self.scopes.content(connection, row)
        content = next((c for c in source.contents if c.key == content_key), None)
        if content is None:
            raise EvidraError("SOURCE_REVOKED", "Content is outside the current scope.")
        if current:
            observed = connection.execute(
                "SELECT version_id FROM source_contents WHERE source_id=? AND key=?",
                (source_id, content_key),
            ).fetchone()
            if row["metadata_version"] != metadata_version(source) or observed[
                0
            ] != content_version(content):
                raise EvidraError(
                    "DOCUMENT_STALE", "Capture the current source version before indexing."
                )
        return source, content

    def require(
        self,
        connection: sqlite3.Connection,
        context: ScopeContext,
        document_id: str,
        *,
        current: bool = False,
    ) -> sqlite3.Row:
        row: sqlite3.Row | None = connection.execute(
            "SELECT * FROM documents WHERE id=?",
            (document_id,),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Document not found.")
        _, content = self.content(
            connection, context, row["source_id"], row["content_key"], current=current
        )
        if content.kind != row["source_kind"] or content_version(content) != row["content_version"]:
            raise EvidraError("SOURCE_REVOKED", "This document version is outside the snapshot.")
        if row["coverage"] == "MISSING_FILE":
            raise EvidraError("MISSING_FILE", "The authorized local attachment is missing.")
        if row["source_kind"] in {"pdf", "text_attachment"} and not row["file_identity"]:
            raise EvidraError(
                row["reason"], "The authorized attachment has no verified local file."
            )
        return row

    def register_attachment(
        self, context: ScopeContext, body: AttachmentRegister
    ) -> RegisteredDocument:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(
            context, source_id=body.source_id, content_key=body.content_key, capability="commit"
        ) as connection:
            # File availability belongs to the current exact content identity. An old
            # snapshot may observe it, while start() separately rejects stale ingestion.
            _, content = self.content(connection, context, body.source_id, body.content_key)
            if content.kind not in {"pdf", "text_attachment"}:
                raise EvidraError(
                    "UNSUPPORTED_DOCUMENT",
                    "Only authorized file attachments use file registration.",
                )
        try:
            with open_verified(Path(body.path)) as opened:
                if content.kind == "pdf" and opened.stream.read(5) != b"%PDF-":
                    raise EvidraError(
                        "INVALID_DOCUMENT_TYPE", "The attachment does not have a PDF header."
                    )
                with self.scopes.guarded(
                    context,
                    source_id=body.source_id,
                    content_key=body.content_key,
                    capability="commit",
                ) as connection:
                    self.content(connection, context, body.source_id, body.content_key)
                    return self._register(connection, body.source_id, content, opened)
        except EvidraError as error:
            if error.code not in FILE_OBSERVATION_ERRORS:
                raise
            # A failed observation belongs to this exact content identity. No verified file
            # or extraction is published; other authorized documents remain independently usable.
            with self.scopes.guarded(
                context, source_id=body.source_id, content_key=body.content_key, capability="commit"
            ) as connection:
                _, content = self.content(connection, context, body.source_id, body.content_key)
                result = self._unavailable(
                    connection,
                    body.source_id,
                    content,
                    "MISSING_FILE" if error.code == "MISSING_FILE" else "UNREADABLE",
                    error.code,
                )
            from evidra.documents.parser_worker import diagnostic

            logger.error(
                "Document observation %s failed: %s", result.id, json.dumps(diagnostic(error))
            )
            return result

    def missing(self, context: ScopeContext, body: DocumentTargetRequest) -> RegisteredDocument:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(
            context, source_id=body.source_id, content_key=body.content_key, capability="commit"
        ) as connection:
            _, content = self.content(connection, context, body.source_id, body.content_key)
            if content.kind not in {"pdf", "text_attachment"}:
                raise EvidraError(
                    "UNSUPPORTED_DOCUMENT", "Only file attachments have a local file observation."
                )
            return self._unavailable(
                connection, body.source_id, content, "MISSING_FILE", "MISSING_FILE"
            )

    @staticmethod
    def _unavailable(
        connection: sqlite3.Connection,
        source_id: str,
        content: SourceContent,
        coverage: Coverage,
        reason: str,
    ) -> RegisteredDocument:
        row = connection.execute(
            "SELECT * FROM documents WHERE source_id=? AND content_key=? AND content_version=?",
            (source_id, content.key, content_version(content)),
        ).fetchone()
        document_id, revision = (row["id"], row["revision"]) if row else (secrets.token_hex(16), 1)
        if row is None:
            connection.execute(
                "INSERT INTO documents (id,source_id,content_key,content_version,source_kind,"
                "path,file_identity,revision,coverage,reason) VALUES (?,?,?,?,?,'','',1,?,?)",
                (
                    document_id,
                    source_id,
                    content.key,
                    content_version(content),
                    content.kind,
                    coverage,
                    reason,
                ),
            )
        elif row["coverage"] != coverage or row["reason"] != reason or row["file_identity"]:
            revision += 1
            connection.execute(
                "UPDATE documents SET path='',file_identity='',revision=?,coverage=?,reason=? "
                "WHERE id=?",
                (revision, coverage, reason, document_id),
            )
        return RegisteredDocument(
            id=document_id,
            source_id=source_id,
            content_key=content.key,
            source_kind=content.kind,
            revision=revision,
            coverage=coverage,
            reason=reason,
        )

    @staticmethod
    def _register(
        connection: sqlite3.Connection, source_id: str, content: SourceContent, opened: VerifiedFile
    ) -> RegisteredDocument:
        version = content_version(content)
        row = connection.execute(
            "SELECT * FROM documents WHERE source_id=? AND content_key=? AND content_version=?",
            (source_id, content.key, version),
        ).fetchone()
        if row is None:
            document_id, revision = secrets.token_hex(16), 1
            connection.execute(
                "INSERT INTO documents (id,source_id,content_key,content_version,source_kind,path,"
                "file_identity,revision,coverage) VALUES (?,?,?,?,?,?,?,?,?)",
                (
                    document_id,
                    source_id,
                    content.key,
                    version,
                    content.kind,
                    str(opened.path),
                    opened.identity,
                    revision,
                    "METADATA_ONLY",
                ),
            )
        else:
            document_id, revision = row["id"], row["revision"]
            if row["path"] != str(opened.path) or row["file_identity"] != opened.identity:
                revision += 1
                connection.execute(
                    "UPDATE documents SET path=?,file_identity=?,revision=?,coverage='STALE',"
                    "reason='file_changed' WHERE id=?",
                    (str(opened.path), opened.identity, revision, document_id),
                )
        return RegisteredDocument(
            id=document_id,
            source_id=source_id,
            content_key=content.key,
            source_kind=content.kind,
            revision=revision,
            coverage=connection.execute(
                "SELECT coverage FROM documents WHERE id=?", (document_id,)
            ).fetchone()[0],
        )
