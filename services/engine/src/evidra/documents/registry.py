"""Bridge-only file registrations, bound to authorized immutable content observations."""

import hashlib
import json
import logging
import os
import secrets
import sqlite3
import sys
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

from evidra.domain.documents import (
    AttachmentRegister,
    Coverage,
    DocumentTargetRequest,
    RegisteredDocument,
)
from evidra.domain.errors import EvidraError
from evidra.domain.sources import Source, SourceContent, content_version, metadata_version
from evidra.scope.service import ScopeContext, ScopeService

if sys.platform == "win32":
    from evidra.documents._registry_windows import (
        OPEN_ERRORS,
        classify_error,
        file_identity,
        open_stream,
        validate_components,
    )
else:
    from evidra.documents._registry_posix import (
        OPEN_ERRORS,
        classify_error,
        file_identity,
        open_stream,
        validate_components,
    )

logger = logging.getLogger(__name__)
FILE_OBSERVATION_ERRORS = {
    "MISSING_FILE",
    "INVALID_DOCUMENT_TYPE",
    "DOCUMENT_FILE_ERROR",
    "INVALID_DOCUMENT_PATH",
    "REPARSE_POINT",
    "NOT_REGULAR_FILE",
    "LINKED_FILE",
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


@contextmanager
def open_verified(path: Path, expected: str | None = None) -> Iterator[VerifiedFile]:
    try:
        validate_components(path)
        with open_stream(path) as stream:
            identity = file_identity(stream, path)
            if expected is not None and expected != identity:
                raise EvidraError("DOCUMENT_STALE", "The registered file changed.")
            opened = VerifiedFile(stream, path, identity, os.fstat(stream.fileno()).st_size)
            yield opened
            opened.recheck()
    except FileNotFoundError as exc:
        raise EvidraError("MISSING_FILE", "The local attachment is missing.") from exc
    except OPEN_ERRORS as exc:
        raise classify_error(exc) from exc


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
