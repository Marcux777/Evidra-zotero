"""Private bridge staging for exact native text, committed only after its complete hash verifies."""

import hashlib
import secrets
from datetime import UTC, datetime

from evidra.documents.chunking import POLICY_VERSION
from evidra.documents.ingestion import persist_pages
from evidra.documents.registry import DocumentRegistry
from evidra.domain.documents import (
    ParsedPage,
    RegisteredDocument,
    TextPart,
    TextRegister,
    TextStage,
)
from evidra.domain.errors import EvidraError
from evidra.domain.sources import content_version
from evidra.scope.service import ScopeContext

TEXT_PARSER_VERSION = "zotero-native-text-v1"


class TextIngestion:
    def __init__(self, registry: DocumentRegistry) -> None:
        self.registry, self.scopes = registry, registry.scopes

    def start(self, context: ScopeContext, body: TextRegister) -> TextStage:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(
            context, source_id=body.source_id, content_key=body.content_key, capability="commit"
        ) as connection:
            _, content = self.registry.content(
                connection, context, body.source_id, body.content_key, current=True
            )
            if content.kind not in {"abstract", "human_note", "human_annotation"}:
                raise EvidraError(
                    "UNSUPPORTED_DOCUMENT", "This content kind cannot use native text staging."
                )
            stage_id = secrets.token_hex(16)
            connection.execute(
                "INSERT INTO document_text_stages (id,notebook_id,snapshot_id,source_id,"
                "content_key,content_version,session_id,scope_signature,total_characters,"
                "sha256,offset) VALUES (?,?,?,?,?,?,?,?,?,?,0)",
                (
                    stage_id,
                    context.notebook_id,
                    context.snapshot_id,
                    body.source_id,
                    content.key,
                    content_version(content),
                    self.scopes.session_id,
                    context.signature,
                    body.total_characters,
                    body.sha256,
                ),
            )
            return TextStage(id=stage_id, offset=0, total_characters=body.total_characters)

    def append(self, context: ScopeContext, stage_id: str, body: TextPart) -> TextStage:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as connection:
            stage = connection.execute(
                "SELECT * FROM document_text_stages WHERE id=? AND notebook_id=? "
                "AND snapshot_id=? AND session_id=?",
                (stage_id, context.notebook_id, context.snapshot_id, self.scopes.session_id),
            ).fetchone()
            if stage is None or stage["scope_signature"] != context.signature:
                raise EvidraError("SCOPE_STALE", "The text staging scope has changed.")
            _, content = self.registry.content(
                connection, context, stage["source_id"], stage["content_key"], current=True
            )
            if content_version(content) != stage["content_version"]:
                raise EvidraError("DOCUMENT_STALE", "The staged native text version changed.")
            prior = connection.execute(
                "SELECT * FROM document_text_parts WHERE stage_id=? AND start_offset=?",
                (stage_id, body.offset),
            ).fetchone()
            document_id = stage["document_id"]
            offset = stage["offset"]
            if prior:
                if prior["text"] != body.text or bool(prior["final"]) != body.final:
                    raise EvidraError(
                        "IDEMPOTENCY_CONFLICT",
                        "The text part differs from its previous submission.",
                    )
            else:
                end = body.offset + len(body.text)
                if (
                    document_id
                    or body.offset != offset
                    or end > stage["total_characters"]
                    or body.final != (end == stage["total_characters"])
                    or not body.text
                    and not body.final
                ):
                    raise EvidraError(
                        "INVALID_TEXT_PART", "The text part has an invalid offset or final marker."
                    )
                connection.execute(
                    "INSERT INTO document_text_parts VALUES (?,?,?,?)",
                    (stage_id, body.offset, body.text, int(body.final)),
                )
                offset = end
                if body.final:
                    text = "".join(
                        row[0]
                        for row in connection.execute(
                            "SELECT text FROM document_text_parts WHERE stage_id=? "
                            "ORDER BY start_offset",
                            (stage_id,),
                        )
                    )
                    encoded = text.encode("utf-8", errors="strict")
                    digest = hashlib.sha256(encoded).hexdigest()
                    if len(text) != stage["total_characters"] or digest != stage["sha256"]:
                        raise EvidraError(
                            "TEXT_HASH_MISMATCH",
                            "The complete native text does not match its declared hash.",
                        )
                    existing = connection.execute(
                        "SELECT * FROM documents WHERE source_id=? AND content_key=? "
                        "AND content_version=?",
                        (stage["source_id"], content.key, stage["content_version"]),
                    ).fetchone()
                    document_id = existing["id"] if existing else secrets.token_hex(16)
                    if existing is None:
                        connection.execute(
                            "INSERT INTO documents (id,source_id,content_key,content_version,"
                            "source_kind,path,file_identity,revision,coverage) "
                            "VALUES (?,?,?,?,?,'',?,1,'METADATA_ONLY')",
                            (
                                document_id,
                                stage["source_id"],
                                content.key,
                                stage["content_version"],
                                content.kind,
                                digest,
                            ),
                        )
                    version_id = hashlib.sha256(
                        f"{document_id}:{digest}:{TEXT_PARSER_VERSION}:{POLICY_VERSION}".encode()
                    ).hexdigest()
                    coverage = "FULL_TEXT_PARSED" if text.strip() else "METADATA_ONLY"
                    if not connection.execute(
                        "SELECT 1 FROM document_versions WHERE id=?", (version_id,)
                    ).fetchone():
                        connection.execute(
                            "INSERT INTO document_versions VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                            (
                                version_id,
                                document_id,
                                digest,
                                TEXT_PARSER_VERSION,
                                POLICY_VERSION,
                                digest,
                                coverage,
                                1,
                                1,
                                len(encoded),
                                datetime.now(UTC).isoformat(),
                            ),
                        )
                        persist_pages(
                            connection,
                            version_id,
                            [
                                ParsedPage(
                                    page_index=0,
                                    page_label=None,
                                    original_text=text,
                                    quality="TEXT" if text.strip() else "EMPTY",
                                    crop_box=None,
                                    media_box=None,
                                    bbox=None,
                                    rotation=None,
                                    char_boxes=[],
                                    mapping_verified=False,
                                )
                            ],
                        )
                    connection.execute(
                        "UPDATE documents SET file_identity=?,current_version_id=?,coverage=?,"
                        "reason=NULL WHERE id=?",
                        (digest, version_id, coverage, document_id),
                    )
                connection.execute(
                    "UPDATE document_text_stages SET offset=?,document_id=? WHERE id=?",
                    (offset, document_id, stage_id),
                )
            document = None
            if document_id:
                row = self.registry.require(connection, context, document_id)
                document = RegisteredDocument(
                    id=document_id,
                    source_id=row["source_id"],
                    content_key=content.key,
                    source_kind=content.kind,
                    revision=row["revision"],
                    coverage=row["coverage"],
                )
            return TextStage(
                id=stage_id,
                offset=offset,
                total_characters=stage["total_characters"],
                document=document,
            )
