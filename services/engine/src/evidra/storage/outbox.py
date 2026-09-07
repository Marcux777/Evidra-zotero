"""Human-approved, immutable new-note intents with readback-only completion."""

import hashlib
import secrets
import sqlite3
from uuid import uuid4

from evidra.domain.errors import EvidraError
from evidra.domain.sources import Source
from evidra.extraction.forms import author, fingerprint, now
from evidra.extraction.models import Write
from evidra.mcp.models import ExternalNote
from evidra.mcp.proposals import ExternalNoteService, external_note_html
from evidra.research.execution import ArtifactVersion, ResearchPreview
from evidra.research.notes import (
    ApprovedWriteOutbox,
    NoteApproval,
    NotePreview,
    NotePreviewWrite,
    NoteReadback,
    OutboxBegin,
    OutboxPage,
)
from evidra.research.service import ResearchService
from evidra.scope.service import ScopeContext
from evidra.storage.note_html import note_html


class OutboxService:
    def __init__(
        self, research: ResearchService, external: ExternalNoteService
    ) -> None:
        self.research, self.scopes = research, research.scopes
        self.external = external

    def artifact(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> ArtifactVersion | ExternalNote:
        if conn.execute("SELECT 1 FROM external_notes WHERE id=?", (identity,)).fetchone():
            return self.external.from_connection(conn, context, identity)
        return self.research.artifact_from_connection(conn, context, identity)

    def destination(
        self, conn: sqlite3.Connection, context: ScopeContext, source_id: str
    ) -> Source:
        row = next(
            (
                r
                for r in self.scopes.members(conn, context.notebook_id, context.snapshot_id)
                if r["source_id"] == source_id
            ),
            None,
        )
        if row is None:
            raise EvidraError("SOURCE_REVOKED", "Note parent is outside the current scope.")
        source = self.scopes.content(conn, row)
        if source.item_type in {"note", "attachment", "annotation", "feedItem"}:
            raise EvidraError("FORBIDDEN", "Notes must be new children of a regular scoped study.")
        return source

    def validate(
        self, conn: sqlite3.Connection, context: ScopeContext, preview: NotePreview
    ) -> None:
        artifact = self.artifact(conn, context, preview.artifact_version_id)
        if isinstance(artifact, ExternalNote) and artifact.review_state != "APPROVED":
            raise EvidraError("FORBIDDEN", "An external note requires human review.")
        source = self.destination(conn, context, preview.source_id)
        if source.identity != preview.destination:
            raise EvidraError("SOURCE_REVOKED", "Note destination changed.")

    def preview(self, context: ScopeContext, body: NotePreviewWrite) -> NotePreview:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM note_previews WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Note preview changed.")
                result = NotePreview.model_validate_json(old["payload"])
                self.validate(conn, context, result)
                return result
            artifact = self.artifact(conn, context, body.artifact_version_id)
            source = self.destination(conn, context, body.source_id)
            uuid = str(uuid4())
            if isinstance(artifact, ExternalNote):
                if artifact.review_state != "APPROVED":
                    raise EvidraError("FORBIDDEN", "An external note requires human review.")
                html = external_note_html(uuid, body.title, artifact, body.locale)
            else:
                row = self.research.row(conn, context, artifact.run_id)
                inputs = ResearchPreview.model_validate_json(row["preview"]).inputs
                html = note_html(uuid, body.title, artifact, inputs, body.locale)
            if len(html.encode()) > 48000:
                raise EvidraError("BODY_TOO_LARGE", "Note exceeds the bounded preview size.")
            result = NotePreview(
                id=secrets.token_hex(16),
                uuid=uuid,
                artifact_version_id=artifact.id,
                artifact_revision=artifact.revision,
                run_id=artifact.run_id,
                source_id=source.id,
                destination=source.identity,
                title=body.title,
                html=html,
                html_sha256=hashlib.sha256(html.encode()).hexdigest(),
                created_at=now(),
            )
            conn.execute(
                "INSERT INTO note_previews VALUES(?,?,?,?,?,?)",
                (
                    result.id,
                    context.notebook_id,
                    context.snapshot_id,
                    body.idempotency_key,
                    fingerprint(body),
                    result.model_dump_json(),
                ),
            )
            return result

    def approve(self, context: ScopeContext, body: NoteApproval) -> ApprovedWriteOutbox:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            row = conn.execute(
                "SELECT payload FROM note_previews WHERE id=? AND notebook_id=? AND snapshot_id=?",
                (body.preview_id, context.notebook_id, context.snapshot_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Concrete note preview not found.")
            preview = NotePreview.model_validate_json(row[0])
            self.validate(conn, context, preview)
            old = conn.execute(
                "SELECT * FROM approved_write_outbox WHERE notebook_id=? AND snapshot_id=? "
                "AND approval_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["approval"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Note approval changed.")
                return self.from_connection(conn, context, old["id"])
            artifact = self.artifact(conn, context, preview.artifact_version_id)
            latest = conn.execute(
                "SELECT max(revision) FROM "
                + ("external_notes" if isinstance(artifact, ExternalNote) else "artifact_versions")
                + " WHERE artifact_id=?",
                (artifact.artifact_id,),
            ).fetchone()[0]
            if (
                preview.artifact_revision != body.expected_artifact_revision
                or latest != body.expected_artifact_revision
            ):
                raise EvidraError("REVISION_CONFLICT", "Artifact changed after this note preview.")
            existing = conn.execute(
                "SELECT id FROM approved_write_outbox WHERE preview_id=?", (preview.id,)
            ).fetchone()
            if existing:
                return self.from_connection(conn, context, existing[0])
            result = ApprovedWriteOutbox(
                **preview.model_dump(exclude={"id"}),
                id=secrets.token_hex(16),
                preview_id=preview.id,
                state="APPROVED",
                author=author(context),
                approved_at=now(),
            )
            conn.execute(
                "INSERT INTO approved_write_outbox VALUES(?,?,?,?,?,?,?,?,NULL)",
                (
                    result.id,
                    context.notebook_id,
                    context.snapshot_id,
                    result.preview_id,
                    result.uuid,
                    body.idempotency_key,
                    fingerprint(body),
                    result.model_dump_json(),
                ),
            )
            return result

    def from_connection(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> ApprovedWriteOutbox:
        row = conn.execute(
            "SELECT payload FROM approved_write_outbox WHERE id=? AND notebook_id=? "
            "AND snapshot_id=?",
            (identity, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Approved note intent not found.")
        intent = ApprovedWriteOutbox.model_validate_json(row[0])
        self.validate(conn, context, intent)
        return intent

    def read(self, context: ScopeContext, identity: str) -> ApprovedWriteOutbox:
        with self.scopes.guarded(context, capability=context.capability) as conn:
            return self.from_connection(conn, context, identity)

    def list(self, context: ScopeContext, offset: int, limit: int) -> OutboxPage:
        with self.scopes.guarded(context) as conn:
            rows = conn.execute(
                "SELECT id FROM approved_write_outbox WHERE notebook_id=? AND snapshot_id=? "
                "ORDER BY rowid DESC LIMIT ? OFFSET ?",
                (context.notebook_id, context.snapshot_id, limit, offset),
            ).fetchall()
            total = conn.execute(
                "SELECT count(*) FROM approved_write_outbox WHERE notebook_id=? AND snapshot_id=?",
                (context.notebook_id, context.snapshot_id),
            ).fetchone()[0]
            return OutboxPage(
                items=[self.from_connection(conn, context, r[0]) for r in rows],
                offset=offset,
                limit=limit,
                total=total,
            )

    def begin(self, context: ScopeContext, identity: str, body: Write) -> OutboxBegin:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            intent = self.from_connection(conn, context, identity)
            # Only the first successful response grants creation. Replays reconcile UUID first.
            may_create = intent.state == "APPROVED"
            if may_create:
                intent = intent.model_copy(update={"state": "APPLYING"})
                conn.execute(
                    "UPDATE approved_write_outbox SET payload=?,begin_key=? WHERE id=?",
                    (intent.model_dump_json(), body.idempotency_key, identity),
                )
            return OutboxBegin(intent=intent, may_create=may_create)

    def ack(self, context: ScopeContext, identity: str, body: NoteReadback) -> ApprovedWriteOutbox:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            intent = self.from_connection(conn, context, identity)
            if (
                intent.state == "APPROVED"
                or body.uuid != intent.uuid
                or body.library_id != intent.destination.library_id
                or body.parent_key != intent.destination.item_key
                or body.note_key == body.parent_key
                or body.html_sha256 != intent.html_sha256
                or (intent.note_key is not None and intent.note_key != body.note_key)
            ):
                raise EvidraError(
                    "REVISION_CONFLICT", "Native note readback does not match the approved intent."
                )
            result = intent.model_copy(update={"state": "COMPLETE", "note_key": body.note_key})
            conn.execute(
                "UPDATE approved_write_outbox SET payload=? WHERE id=?",
                (result.model_dump_json(), identity),
            )
            return result
