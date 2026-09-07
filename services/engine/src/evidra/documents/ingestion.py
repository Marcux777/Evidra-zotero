"""Durable document operations and atomic publication of immutable extraction versions."""

import hashlib
import json
import logging
import secrets
import sqlite3
import threading
from collections.abc import Iterator
from concurrent.futures import Future, ThreadPoolExecutor
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, BinaryIO

from evidra.documents.chunking import POLICY_VERSION, chunks, normalize
from evidra.documents.parser_worker import PARSER_VERSION, diagnostic, run_worker
from evidra.documents.registry import DocumentRegistry, open_verified
from evidra.documents.text_parser import TEXT_FILE_PARSER_VERSION
from evidra.domain.documents import (
    IngestRequest,
    Operation,
    PagePreview,
    PagePreviewRequest,
    ParsedPage,
)
from evidra.domain.errors import EvidraError
from evidra.scope.service import ScopeContext
from evidra.storage.cache import prune_derived, remember_preview

logger = logging.getLogger(__name__)
TERMINAL = {"COMPLETE", "PAUSED", "CANCELLED", "FAILED"}


def persist_pages(connection: sqlite3.Connection, version_id: str, pages: Any) -> None:
    for page in pages:
        normalized, positions = normalize(page.original_text)
        connection.execute(
            "INSERT INTO document_pages VALUES (?,?,?,?,?)",
            (
                version_id,
                page.page_index,
                page.model_dump_json(),
                normalized,
                json.dumps(positions),
            ),
        )
        for chunk in chunks(page.original_text):
            chunk_id = hashlib.sha256(
                f"{version_id}:{page.page_index}:{chunk.start}:{chunk.end}".encode()
            ).hexdigest()
            connection.execute(
                "INSERT INTO document_chunks VALUES (?,?,?,?,?,?,?,?)",
                (
                    chunk_id,
                    version_id,
                    page.page_index,
                    chunk.start,
                    chunk.end,
                    chunk.original,
                    chunk.normalized,
                    json.dumps(chunk.normalization_map),
                ),
            )
            connection.execute(
                "INSERT INTO document_fts VALUES (?,?)", (chunk_id, chunk.normalized)
            )


class IngestionService:
    def __init__(self, registry: DocumentRegistry) -> None:
        self.registry, self.scopes = registry, registry.scopes
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="evidra-document")
        self._lock = threading.RLock()
        self._cancel: dict[str, threading.Event] = {}
        self._errors: dict[str, Exception] = {}
        self._closed = False
        # A process cannot survive this supervisor session. No document content is published here.
        with self.scopes.database.transaction() as connection:
            for row in connection.execute("SELECT id,payload FROM document_operations").fetchall():
                operation = Operation.model_validate_json(row["payload"])
                if operation.state not in TERMINAL:
                    operation.state, operation.reason = "PAUSED", "ENGINE_RESTARTED"
                    self._save(connection, operation)

    def close(self) -> None:
        with self._lock:
            self._closed = True
            for event in self._cancel.values():
                event.set()
        self._executor.shutdown(wait=True, cancel_futures=False)
        if self._errors:
            raise EvidraError(
                "DOCUMENT_SUPERVISOR_FAILED", "A document operation could not finalize."
            ) from next(iter(self._errors.values()))

    def _observe(self, operation_id: str, future: Future[None]) -> None:
        try:
            future.result()
        except Exception as error:
            with self._lock:
                self._errors[operation_id] = error
            logger.error(
                "Document supervisor %s failed: %s", operation_id, json.dumps(diagnostic(error))
            )

    @staticmethod
    def _save(connection: sqlite3.Connection, operation: Operation) -> None:
        connection.execute(
            "UPDATE document_operations SET payload=? WHERE id=?",
            (operation.model_dump_json(), operation.id),
        )

    def _require_operation(
        self, connection: sqlite3.Connection, context: ScopeContext, operation_id: str
    ) -> Operation:
        row = connection.execute(
            "SELECT * FROM document_operations WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (operation_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Document operation not found.")
        self.registry.require(connection, context, row["document_id"])
        if operation_id in self._errors:
            raise EvidraError(
                "DOCUMENT_SUPERVISOR_FAILED", "This document operation could not finalize."
            ) from self._errors[operation_id]
        return Operation.model_validate_json(row["payload"])

    def read(self, context: ScopeContext, operation_id: str) -> Operation:
        with self.scopes.guarded(context) as connection:
            return self._require_operation(connection, context, operation_id)

    def cancel(self, context: ScopeContext, operation_id: str) -> Operation:
        with self._lock, self.scopes.guarded(context, capability="commit") as connection:
            operation = self._require_operation(connection, context, operation_id)
            if operation.state not in TERMINAL:
                self._cancel[operation_id].set()
            return operation

    def start(self, context: ScopeContext, body: IngestRequest) -> Operation:
        with self._lock, self.scopes.guarded(context, capability="commit") as connection:
            if self._closed:
                raise EvidraError("ENGINE_STOPPING", "The engine is stopping.")
            document = self.registry.require(connection, context, body.document_id, current=True)
            if document["source_kind"] not in {"pdf", "text_attachment"}:
                raise EvidraError(
                    "UNSUPPORTED_DOCUMENT", "This operation requires a file attachment."
                )
            _, content = self.registry.content(
                connection, context, document["source_id"], document["content_key"], current=True
            )
            if content.kind == "text_attachment" and not content.media_type:
                raise EvidraError(
                    "SCOPE_STALE", "Recapture the textual attachment with its native MIME type."
                )
            request = body.model_dump_json()
            prior = connection.execute(
                "SELECT * FROM document_operations WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if prior:
                if prior["request"] != request:
                    raise EvidraError(
                        "IDEMPOTENCY_CONFLICT", "Operation key belongs to another request."
                    )
                return Operation.model_validate_json(prior["payload"])
            operation = Operation(
                id=secrets.token_hex(16),
                document_id=body.document_id,
                state="QUEUED",
                kind="ingest",
                coverage=document["coverage"],
                created_at=datetime.now(UTC),
            )
            connection.execute(
                "INSERT INTO document_operations (id,notebook_id,snapshot_id,document_id,"
                "idempotency_key,request,payload) "
                "VALUES (?,?,?,?,?,?,?)",
                (
                    operation.id,
                    context.notebook_id,
                    context.snapshot_id,
                    body.document_id,
                    body.idempotency_key,
                    request,
                    operation.model_dump_json(),
                ),
            )
            event = self._cancel[operation.id] = threading.Event()
            frozen = dict(document)
            frozen["media_type"] = content.media_type
            self._executor.submit(
                self._ingest, context, body, operation, frozen, event
            ).add_done_callback(lambda future: self._observe(operation.id, future))
            receipt = operation.model_copy()
        return receipt

    def _check(
        self,
        context: ScopeContext,
        operation: Operation,
        frozen: dict[str, Any],
        event: threading.Event,
        *,
        current: bool = True,
    ) -> None:
        if event.is_set():
            raise EvidraError("CANCELLED", "The document operation was cancelled.")
        with self.scopes.guarded(context, capability="commit") as connection:
            observed = self.registry.require(
                connection, context, operation.document_id, current=current
            )
            if observed["revision"] != frozen["revision"]:
                raise EvidraError(
                    "DOCUMENT_STALE", "The registered file changed during processing."
                )

    @staticmethod
    def _pages(output: BinaryIO) -> Iterator[ParsedPage]:
        output.seek(0)
        for line in output:
            record = json.loads(line)
            if record["type"] == "page":
                yield ParsedPage.model_validate(record["page"])

    @staticmethod
    def _validate_output(output: BinaryIO, operation: Operation, parser_version: str) -> str:
        header = json.loads(output.readline())
        if header["type"] == "limit":
            operation.page_count = header["page_count"]
            raise EvidraError("PAGE_LIMIT", "The PDF exceeds its configured page limit.")
        if header["type"] != "header" or header["parser_version"] != parser_version:
            raise EvidraError("PARSER_PROTOCOL", "The parser header is invalid.")
        operation.page_count = header["page_count"]
        qualities = []
        for index in range(operation.page_count):
            record = json.loads(output.readline())
            page = ParsedPage.model_validate(record["page"])
            if record["type"] != "page" or page.page_index != index:
                raise EvidraError("PARSER_PROTOCOL", "The parser page sequence is incomplete.")
            qualities.append(page.quality)
        done = json.loads(output.readline())
        if done != {"type": "done", "page_count": operation.page_count} or output.read(1):
            raise EvidraError("PARSER_PROTOCOL", "The parser did not account for every page.")
        operation.pages_processed = len(qualities)
        if qualities and all(q == "TEXT" for q in qualities):
            return "FULL_TEXT_PARSED"
        if "TEXT" in qualities:
            return "PARTIAL_TEXT"
        if "ERROR" in qualities or "UNMAPPABLE" in qualities:
            return "UNREADABLE"
        return "NEEDS_OCR"

    def _ingest(
        self,
        context: ScopeContext,
        body: IngestRequest,
        operation: Operation,
        frozen: dict[str, Any],
        event: threading.Event,
    ) -> None:
        try:

            def check() -> None:
                self._check(context, operation, frozen, event)

            check()
            operation.state = "RUNNING"
            with self.scopes.guarded(context, capability="commit") as connection:
                self._save(connection, operation)
            with open_verified(Path(frozen["path"]), frozen["file_identity"]) as opened:
                if opened.size > body.limits.max_file_bytes:
                    raise EvidraError("FILE_LIMIT", "The file exceeds its configured byte limit.")
                operation.sha256 = opened.digest(check)
                operation.bytes_processed = opened.size
                parser_version = (
                    TEXT_FILE_PARSER_VERSION
                    if frozen["source_kind"] == "text_attachment"
                    else PARSER_VERSION
                )
                version_id = hashlib.sha256(
                    f"{operation.document_id}:{operation.sha256}:{parser_version}:{POLICY_VERSION}".encode()
                ).hexdigest()
                with self.scopes.guarded(context, capability="commit") as connection:
                    current = self.registry.require(
                        connection, context, operation.document_id, current=True
                    )
                    if current["revision"] != frozen["revision"]:
                        raise EvidraError("DOCUMENT_STALE", "The registered attachment changed.")
                    cached = connection.execute(
                        "SELECT * FROM document_versions WHERE id=?", (version_id,)
                    ).fetchone()
                    # EPUB's spine bound is not its unpaginated storage unit count;
                    # rerun textual parsing to honor the caller's current limits.
                    if cached and frozen["source_kind"] == "pdf":
                        if cached["page_count"] > body.limits.max_pages:
                            operation.page_count = cached["page_count"]
                            raise EvidraError(
                                "PAGE_LIMIT", "The PDF exceeds its configured page limit."
                            )
                        opened.recheck()
                        self._complete(connection, operation, cached, cache_hit=True)
                        return
                    self._save(connection, operation)
                opened.stream.seek(0)
                with run_worker(
                    opened.stream,
                    {
                        "kind": "ingest",
                        "source_kind": frozen["source_kind"],
                        "media_type": frozen["media_type"],
                    },
                    body.limits,
                    check,
                    lambda _: None,
                ) as output:
                    coverage = self._validate_output(output, operation, parser_version)
                    if frozen["source_kind"] == "text_attachment" and coverage == "NEEDS_OCR":
                        coverage = "METADATA_ONLY"
                    check()
                    opened.recheck()
                    with self.scopes.guarded(context, capability="commit") as connection:
                        current = self.registry.require(
                            connection, context, operation.document_id, current=True
                        )
                        if current["revision"] != frozen["revision"]:
                            raise EvidraError(
                                "DOCUMENT_STALE", "The registered attachment changed."
                            )
                        if cached:
                            self._complete(connection, operation, cached, cache_hit=True)
                            return
                        connection.execute(
                            "INSERT INTO document_versions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                            (
                                version_id,
                                operation.document_id,
                                operation.sha256,
                                parser_version,
                                POLICY_VERSION,
                                opened.identity,
                                coverage,
                                operation.page_count,
                                operation.pages_processed,
                                operation.bytes_processed,
                                datetime.now(UTC).isoformat(),
                            ),
                        )
                        persist_pages(connection, version_id, self._pages(output))
                        opened.recheck()
                        self._complete(
                            connection,
                            operation,
                            {
                                "id": version_id,
                                "coverage": coverage,
                                "page_count": operation.page_count,
                                "pages_processed": operation.pages_processed,
                            },
                        )
        except Exception as exc:
            self._failure(context, operation, exc, frozen["revision"])
        finally:
            # A terminal receipt is visible only after the source handle and owned worker
            # have closed. The caller can then replace/reindex its local attachment safely.
            if operation.state == "COMPLETE":
                try:
                    with self.scopes.guarded(context, capability="commit") as connection:
                        self.registry.require(connection, context, operation.document_id)
                        self._save(connection, operation)
                except Exception as exc:
                    self._failure(context, operation, exc, frozen["revision"])
            with self._lock:
                self._cancel.pop(operation.id, None)

    def _complete(
        self,
        connection: sqlite3.Connection,
        operation: Operation,
        version: Any,
        *,
        cache_hit: bool = False,
    ) -> None:
        operation.state, operation.coverage = "COMPLETE", version["coverage"]
        operation.document_version_id = version["id"]
        operation.page_count, operation.pages_processed = (
            version["page_count"],
            version["pages_processed"],
        )
        operation.cache_hit = cache_hit
        operation.reason = None if operation.coverage == "FULL_TEXT_PARSED" else operation.coverage
        connection.execute(
            "UPDATE documents SET current_version_id=?,coverage=?,reason=? WHERE id=?",
            (version["id"], operation.coverage, operation.reason, operation.document_id),
        )

    def _failure(
        self, context: ScopeContext, operation: Operation, error: Exception, revision: int
    ) -> None:
        reason = error.code if isinstance(error, EvidraError) else "PARSER_PROTOCOL"
        paused = {
            "TEXT_LIMIT",
            "FILE_LIMIT",
            "PAGE_LIMIT",
            "PARSER_TIMEOUT",
            "PARSER_OUTPUT_LIMIT",
            "PARSER_MEMORY_LIMIT",
            "PREVIEW_PIXEL_LIMIT",
            "PREVIEW_TRANSPORT_LIMIT",
            "BRIDGE_EXPIRED",
            "SCOPE_STALE",
            "DOCUMENT_STALE",
        }
        operation.state = (
            "CANCELLED" if reason == "CANCELLED" else "PAUSED" if reason in paused else "FAILED"
        )
        operation.reason = reason
        if reason in {"MISSING_FILE", "DOCUMENT_STALE"}:
            operation.coverage = "MISSING_FILE" if reason == "MISSING_FILE" else "STALE"
        elif operation.kind == "ingest" and reason in {
            "PARSER_FAILED",
            "PARSER_PROTOCOL",
            "TEXT_ENCODING_ERROR",
            "INVALID_TEXT_DOCUMENT",
            "UNSUPPORTED_TEXT_FORMAT",
            "INCOMPLETE_TEXT",
        }:
            operation.coverage = "UNREADABLE"
        logger.error(
            "Document operation %s failed: %s",
            operation.id,
            json.dumps(
                {
                    **diagnostic(error),
                    "details": error.details if isinstance(error, EvidraError) else None,
                }
            ),
        )
        # Operational receipt only: revocation may prevent content writes, but must not leave a
        # dead operation labelled RUNNING. Reads remain guarded by its exact source and snapshot.
        with self.scopes.database.transaction() as connection:
            self._save(connection, operation)
        if operation.kind == "preview":
            return
        try:
            with self.scopes.guarded(context, capability="commit") as connection:
                current = self.registry.require(connection, context, operation.document_id)
                if current["revision"] != revision:
                    return
                connection.execute(
                    "UPDATE documents SET coverage=?,reason=? WHERE id=?",
                    (operation.coverage, reason, operation.document_id),
                )
        except EvidraError as exc:
            if exc.code not in {
                "BRIDGE_EXPIRED",
                "SCOPE_STALE",
                "SOURCE_REVOKED",
                "MISSING_FILE",
                "FORBIDDEN",
            }:
                raise

    def start_preview(self, context: ScopeContext, body: PagePreviewRequest) -> Operation:
        with self._lock, self.scopes.guarded(context, capability="commit") as connection:
            if self._closed:
                raise EvidraError("ENGINE_STOPPING", "The engine is stopping.")
            version = connection.execute(
                "SELECT * FROM document_versions WHERE id=?", (body.document_version_id,)
            ).fetchone()
            if version is None:
                raise EvidraError("NOT_FOUND", "Document version not found.")
            document = self.registry.require(connection, context, version["document_id"])
            if document["source_kind"] != "pdf":
                raise EvidraError("UNSUPPORTED_DOCUMENT", "A page preview requires a PDF document.")
            request = body.model_dump_json()
            prior = connection.execute(
                "SELECT * FROM document_operations WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if prior:
                if prior["request"] != request:
                    raise EvidraError(
                        "IDEMPOTENCY_CONFLICT", "Operation key belongs to another request."
                    )
                return Operation.model_validate_json(prior["payload"])
            operation = Operation(
                id=secrets.token_hex(16),
                document_id=document["id"],
                state="QUEUED",
                kind="preview",
                coverage=version["coverage"],
                created_at=datetime.now(UTC),
                document_version_id=version["id"],
                sha256=version["sha256"],
            )
            connection.execute(
                "INSERT INTO document_operations (id,notebook_id,snapshot_id,document_id,"
                "idempotency_key,request,payload) "
                "VALUES (?,?,?,?,?,?,?)",
                (
                    operation.id,
                    context.notebook_id,
                    context.snapshot_id,
                    document["id"],
                    body.idempotency_key,
                    request,
                    operation.model_dump_json(),
                ),
            )
            event = self._cancel[operation.id] = threading.Event()
            frozen, frozen_version = dict(document), dict(version)
            self._executor.submit(
                self._render, context, body, operation, frozen, frozen_version, event
            ).add_done_callback(lambda future: self._observe(operation.id, future))
            receipt = operation.model_copy()
        return receipt

    def _render(
        self,
        context: ScopeContext,
        body: PagePreviewRequest,
        operation: Operation,
        frozen: dict[str, Any],
        version: dict[str, Any],
        event: threading.Event,
    ) -> None:
        try:

            def check() -> None:
                self._check(context, operation, frozen, event, current=False)

            check()
            operation.state = "RUNNING"
            with self.scopes.guarded(context, capability="commit") as connection:
                self._save(connection, operation)
            with open_verified(Path(frozen["path"]), frozen["file_identity"]) as opened:
                if opened.size > body.limits.max_file_bytes:
                    raise EvidraError("FILE_LIMIT", "The PDF exceeds its configured byte limit.")
                if opened.digest(check) != version["sha256"]:
                    raise EvidraError(
                        "DOCUMENT_STALE", "The current file differs from the cited version."
                    )
                operation.bytes_processed = opened.size
                with run_worker(
                    opened.stream,
                    {"kind": "preview", "preview": body.model_dump()},
                    body.limits,
                    check,
                    lambda _: None,
                ) as output:
                    result = json.load(output)
                    if result.get("type") == "limit" and result.get("reason") == "PAGE_LIMIT":
                        operation.page_count = result["page_count"]
                        raise EvidraError(
                            "PAGE_LIMIT", "The PDF exceeds its configured page limit."
                        )
                    image = PagePreview.model_validate(result)
                    if (
                        image.document_version_id != version["id"]
                        or image.page_index != body.page_index
                    ):
                        raise EvidraError(
                            "PARSER_PROTOCOL", "The renderer returned another page or version."
                        )
                    opened.recheck()
                    check()
                    with self.scopes.guarded(context, capability="commit") as connection:
                        current = self.registry.require(connection, context, operation.document_id)
                        if current["revision"] != frozen["revision"]:
                            raise EvidraError(
                                "DOCUMENT_STALE", "The registered attachment changed."
                            )
                        connection.execute(
                            "UPDATE document_operations SET preview=? WHERE id=?",
                            (image.model_dump_json(), operation.id),
                        )
                        remember_preview(connection, operation.id, image.model_dump_json())
                        prune_derived(connection, self.scopes.session.settings.cache_limits)
            operation.state = "COMPLETE"
            operation.page_count = version["page_count"]
            operation.pages_processed = 1
            with self.scopes.guarded(context, capability="commit") as connection:
                self.registry.require(connection, context, operation.document_id)
                self._save(connection, operation)
        except Exception as exc:
            self._failure(context, operation, exc, frozen["revision"])
        finally:
            with self._lock:
                self._cancel.pop(operation.id, None)

    def preview(self, context: ScopeContext, operation_id: str) -> PagePreview:
        with self.scopes.guarded(context) as connection:
            operation = self._require_operation(connection, context, operation_id)
            if operation.kind != "preview" or operation.state != "COMPLETE":
                raise EvidraError("PREVIEW_NOT_READY", "The page preview is not complete.")
            document = dict(self.registry.require(connection, context, operation.document_id))
            identity = document["file_identity"]
        with open_verified(Path(document["path"]), identity) as opened:
            if opened.digest(lambda: self.scopes.assert_current(context)) != operation.sha256:
                raise EvidraError(
                    "DOCUMENT_STALE", "The current file differs from the preview version."
                )
            with self.scopes.guarded(context) as connection:
                current = self.registry.require(connection, context, operation.document_id)
                if current["revision"] != document["revision"]:
                    raise EvidraError("DOCUMENT_STALE", "The registered attachment changed.")
                payload = connection.execute(
                    "SELECT preview FROM document_operations WHERE id=?", (operation_id,)
                ).fetchone()[0]
                if payload is None:
                    raise EvidraError(
                        "PREVIEW_EVICTED", "The derived preview was evicted; render it again."
                    )
                remember_preview(connection, operation_id, payload)
                prune_derived(connection, self.scopes.session.settings.cache_limits)
                return PagePreview.model_validate_json(payload)
