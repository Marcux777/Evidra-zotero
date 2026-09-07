"""Literal excerpts with immutable offsets and current authorization."""

import os
import sqlite3
from pathlib import Path

from evidra.documents.registry import DocumentRegistry, open_verified
from evidra.domain.documents import (
    DocumentPage,
    DocumentStatus,
    Evidence,
    EvidenceFileCheck,
    EvidenceTextRequest,
    EvidenceTextView,
    Operation,
    ParsedPage,
)
from evidra.domain.errors import EvidraError
from evidra.domain.sources import content_version
from evidra.scope.service import ScopeContext


class EvidenceService:
    def __init__(self, registry: DocumentRegistry) -> None:
        self.registry, self.scopes = registry, registry.scopes

    def read(self, context: ScopeContext, evidence_id: str) -> Evidence:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            return self.from_connection(connection, context, evidence_id)

    def from_connection(
        self, connection: sqlite3.Connection, context: ScopeContext, evidence_id: str
    ) -> Evidence:
        row = connection.execute(
            "SELECT c.*,v.document_id,v.parser_version,v.sha256,v.bytes_processed "
            "FROM document_chunks c "
            "JOIN document_versions v "
            "ON v.id=c.version_id WHERE c.id=?",
            (evidence_id,),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Evidence not found.")
        document = self.registry.require(connection, context, row["document_id"])
        source, content = self.registry.content(
            connection, context, document["source_id"], document["content_key"]
        )
        page_row = connection.execute(
            "SELECT payload FROM document_pages WHERE version_id=? AND page_index=?",
            (row["version_id"], row["page_index"]),
        ).fetchone()
        page = ParsedPage.model_validate_json(page_row[0])
        start, end = row["start_offset"], row["end_offset"]
        if page.original_text[start:end] != row["original_text"] or not 0 <= start < end <= len(
            page.original_text
        ):
            raise EvidraError("EVIDENCE_INVARIANT", "The stored excerpt no longer verifies.")
        rectangles = []
        if page.mapping_verified:
            if len(page.char_boxes) != len(page.original_text):
                raise EvidraError("EVIDENCE_INVARIANT", "The stored geometry no longer verifies.")
            rectangles = [box for box in page.char_boxes[start:end] if box is not None]
        pdf = document["source_kind"] == "pdf"
        return Evidence(
            id=evidence_id,
            source_id=source.id,
            source_identity=source.identity,
            content_key=document["content_key"],
            source_kind=document["source_kind"],
            document_version_id=row["version_id"],
            excerpt=row["original_text"],
            start=start,
            end=end,
            document_sha256=row["sha256"],
            document_bytes=row["bytes_processed"],
            page_index=page.page_index if pdf else None,
            page_label=page.page_label if pdf else None,
            precision="rectangles" if pdf and rectangles else "page" if pdf else "text",
            rectangles=rectangles if pdf else [],
            historical=not self.scopes.source_current(
                connection, source.model_copy(update={"contents": [content]})
            )
            or document["coverage"] == "STALE"
            or document["current_version_id"] != row["version_id"],
            parser_version=row["parser_version"],
        )

    def verify_file(self, context: ScopeContext, body: EvidenceFileCheck) -> Evidence:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context) as connection:
            evidence = self.from_connection(connection, context, body.evidence_id)
            version = connection.execute(
                "SELECT * FROM document_versions WHERE id=?", (evidence.document_version_id,)
            ).fetchone()
            document = dict(self.registry.require(connection, context, version["document_id"]))
            if evidence.source_kind not in {"pdf", "text_attachment"} or os.path.normcase(
                str(Path(body.path))
            ) != os.path.normcase(document["path"]):
                raise EvidraError(
                    "DOCUMENT_STALE",
                    "The current native path differs from the registered attachment.",
                )
            expected_identity = document["file_identity"]
        with open_verified(Path(body.path), expected_identity) as opened:
            if (
                opened.digest(lambda: self.scopes.assert_current(context))
                != evidence.document_sha256
            ):
                raise EvidraError(
                    "DOCUMENT_STALE", "The native file differs from the cited immutable version."
                )
            with self.scopes.guarded(context) as connection:
                current = self.registry.require(connection, context, document["id"])
                if current["revision"] != document["revision"]:
                    raise EvidraError("DOCUMENT_STALE", "The registered attachment changed.")
                return self.from_connection(connection, context, body.evidence_id)

    def text_view(self, context: ScopeContext, body: EvidenceTextRequest) -> EvidenceTextView:
        """Native-only bounded view of original extraction, after actual file verification."""
        evidence = self.verify_file(
            context, EvidenceFileCheck(evidence_id=body.evidence_id, path=body.path)
        )
        if evidence.source_kind != "text_attachment":
            raise EvidraError("UNSUPPORTED_DOCUMENT", "This attachment is not unpaginated text.")
        with self.scopes.guarded(context) as connection:
            current = self.from_connection(connection, context, body.evidence_id)
            if current != evidence:
                raise EvidraError("DOCUMENT_STALE", "The cited attachment changed.")
            source, content = self.registry.content(
                connection, context, evidence.source_id, evidence.content_key
            )
            if not content.media_type:
                raise EvidraError("SCOPE_STALE", "The attachment MIME provenance is missing.")
            # SQLite substr counts Unicode code points, matching immutable excerpt offsets.
            # Text attachments have one unpaginated unit; these are text segments, not pages.
            offset = body.offset if body.offset is not None else max(0, evidence.start - 1000)
            row = connection.execute(
                "SELECT length(json_extract(payload,'$.original_text')) AS total,"
                "substr(json_extract(payload,'$.original_text'),?,16000) AS text "
                "FROM document_pages WHERE version_id=? AND page_index=0",
                (offset + 1, evidence.document_version_id),
            ).fetchone()
            if row is None or not 0 <= offset < row["total"]:
                raise EvidraError("INVALID_TEXT_OFFSET", "The original text offset is unavailable.")
            return EvidenceTextView(
                evidence=evidence,
                title=content.title or source.title or evidence.content_key,
                media_type=content.media_type,
                text=row["text"],
                offset=offset,
                total=row["total"],
            )

    def documents(self, context: ScopeContext, offset: int, limit: int) -> DocumentPage:
        with self.scopes.guarded(context) as connection:
            allowed = []
            for row in self.scopes.members(connection, context.notebook_id, context.snapshot_id):
                source = self.scopes.content(connection, row)
                for content in source.contents:
                    allowed.append((source, content))
            result = []
            for source, content in allowed[offset : offset + limit]:
                document = connection.execute(
                    "SELECT d.*,v.coverage AS parsed_coverage,v.page_count,"
                    "v.pages_processed,v.bytes_processed "
                    "FROM documents d LEFT JOIN document_versions v ON v.id=d.current_version_id "
                    "WHERE d.source_id=? AND d.content_key=? AND d.content_version=?",
                    (source.id, content.key, content_version(content)),
                ).fetchone()
                historical = not self.scopes.source_current(
                    connection, source.model_copy(update={"contents": [content]})
                )
                latest = (
                    connection.execute(
                        "SELECT payload FROM document_operations WHERE document_id=? "
                        "AND notebook_id=? AND snapshot_id=? "
                        "ORDER BY json_extract(payload,'$.created_at') DESC,id DESC LIMIT 1",
                        (document["id"], context.notebook_id, context.snapshot_id),
                    ).fetchone()
                    if document
                    else None
                )
                result.append(
                    DocumentStatus(
                        document_id=document["id"] if document else None,
                        source_id=source.id,
                        content_key=content.key,
                        source_kind=content.kind,
                        title=content.title or source.title or content.key,
                        coverage="MISSING_FILE"
                        if document and document["coverage"] == "MISSING_FILE"
                        else "STALE"
                        if historical
                        else document["coverage"]
                        if document
                        else "METADATA_ONLY",
                        parsed_coverage=(document["parsed_coverage"] or "METADATA_ONLY")
                        if document
                        else "METADATA_ONLY",
                        historical=historical,
                        document_version_id=document["current_version_id"] if document else None,
                        page_count=document["page_count"] if document else None,
                        pages_processed=(document["pages_processed"] or 0) if document else 0,
                        bytes_processed=(document["bytes_processed"] or 0) if document else 0,
                        reason=document["reason"] if document else None,
                        operation=Operation.model_validate_json(latest[0]) if latest else None,
                    )
                )
            page = DocumentPage(items=result, offset=offset, limit=len(result), total=len(allowed))
            # Match the source-page contract: reserve space for the privileged envelope,
            # preserve each complete title, and advance by the actual number of rows.
            while len(page.model_dump_json().encode()) > 900_000:
                if len(page.items) <= 1:
                    raise EvidraError(
                        "BODY_TOO_LARGE", "Document metadata exceeds the display budget."
                    )
                page = page.model_copy(update={"items": page.items[:-1], "limit": page.limit - 1})
            return page
