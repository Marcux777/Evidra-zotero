"""External notes are immutable client proposals, never invented research runs."""

import secrets
import sqlite3

from evidra.domain.errors import EvidraError
from evidra.evidence.service import EvidenceService
from evidra.extraction.forms import author, fingerprint, now
from evidra.mcp.models import ExternalNote, ExternalNotePage, ExternalNoteReview, ExternalNoteWrite
from evidra.scope.service import ScopeContext
from evidra.storage.note_html import escaped as escape


class ExternalNoteService:
    def __init__(self, evidence: EvidenceService) -> None:

        self.evidence, self.scopes = evidence, evidence.scopes

    def from_connection(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> ExternalNote:

        row = conn.execute(
            "SELECT payload FROM external_notes WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (identity, context.notebook_id, context.snapshot_id),
        ).fetchone()

        if row is None:
            raise EvidraError("NOT_FOUND", "External note not found.")

        note = ExternalNote.model_validate_json(row[0])

        for original in note.evidence:
            current = self.evidence.from_connection(conn, context, original.id)

            if current.model_dump(exclude={"historical"}) != original.model_dump(
                exclude={"historical"}
            ):
                raise EvidraError("EVIDENCE_INVARIANT", "Original proposal evidence changed.")

        return note

    def propose(self, context: ScopeContext, body: ExternalNoteWrite) -> ExternalNote:

        if context.principal.credential_kind != "mcp":
            raise EvidraError("FORBIDDEN", "An external producer identity is required.")

        with self.scopes.guarded(context, capability="commit") as conn:
            evidence = [
                self.evidence.from_connection(conn, context, identity)
                for identity in dict.fromkeys(body.evidence_ids)
            ]

            old = conn.execute(
                "SELECT * FROM external_notes WHERE connection_id=? AND idempotency_key=?",
                (context.principal.connection_id, body.idempotency_key),
            ).fetchone()

            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "External proposal changed.")

                return self.from_connection(conn, context, old["id"])

            note = ExternalNote(
                id=secrets.token_hex(16),
                artifact_id=secrets.token_hex(16),
                revision=1,
                previous_version_id=None,
                text=body.text,
                evidence=evidence,
                connection_id=str(context.principal.connection_id),
                declared_model=body.declared_model,
                author=author(context),
                created_at=now(),
            )

            self.insert(conn, context, note, body.idempotency_key, fingerprint(body))

            return note

    @staticmethod
    def insert(
        conn: sqlite3.Connection, context: ScopeContext, note: ExternalNote, key: str, request: str
    ) -> None:

        conn.execute(
            "INSERT INTO external_notes VALUES(?,?,?,?,?,?,?,?,?)",
            (
                note.id,
                note.artifact_id,
                note.revision,
                context.notebook_id,
                context.snapshot_id,
                note.connection_id,
                key,
                request,
                note.model_dump_json(),
            ),
        )

    def list(self, context: ScopeContext, offset: int) -> ExternalNotePage:

        with self.scopes.guarded(context) as conn:
            args = (context.notebook_id, context.snapshot_id)

            where = (
                " FROM external_notes n WHERE notebook_id=? AND snapshot_id=? AND revision="
                "(SELECT max(revision) FROM external_notes v WHERE v.artifact_id=n.artifact_id)"
            )

            rows = conn.execute(
                "SELECT id" + where + " ORDER BY rowid DESC LIMIT 1 OFFSET ?", (*args, offset)
            ).fetchall()

            total = conn.execute("SELECT count(*)" + where, args).fetchone()[0]

            return ExternalNotePage(
                items=[self.from_connection(conn, context, row[0]) for row in rows],
                offset=offset,
                limit=1,
                total=total,
            )

    def review(
        self, context: ScopeContext, identity: str, body: ExternalNoteReview
    ) -> ExternalNote:

        self.scopes.authorize(context.principal, "manage")

        with self.scopes.guarded(context, capability="commit") as conn:
            original = self.from_connection(conn, context, identity)

            key = "review:" + body.idempotency_key

            old = conn.execute(
                "SELECT * FROM external_notes WHERE connection_id=? AND idempotency_key=?",
                (original.connection_id, key),
            ).fetchone()

            request = identity + fingerprint(body)

            if old:
                if old["request"] != request:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Review changed.")

                return self.from_connection(conn, context, old["id"])

            latest = conn.execute(
                "SELECT max(revision) FROM external_notes WHERE artifact_id=?",
                (original.artifact_id,),
            ).fetchone()[0]

            if latest != body.expected_revision or original.revision != latest:
                raise EvidraError("REVISION_CONFLICT", "External proposal changed after review.")

            note = original.model_copy(
                update={
                    "id": secrets.token_hex(16),
                    "previous_version_id": identity,
                    "revision": latest + 1,
                    "review_state": body.action,
                    "rationale": body.rationale,
                    "author": author(context),
                    "created_at": now(),
                }
            )

            self.insert(conn, context, note, key, request)

            return note


def external_note_html(uuid: str, title: str, note: ExternalNote, locale: str) -> str:
    provenance = (
        "Modelo declarado pelo cliente; não verificado"
        if locale == "pt-BR"
        else "Client-declared model; unverified"
    )
    html = (
        '<div class="zotero-note znv1">'
        f'<div data-evidra-origin="ai" data-evidra-outbox="{uuid}">'
        f"<h1>{escape(title)}</h1><p>EXTERNAL_CLIENT · {provenance}: "
        f"{escape(note.declared_model or '—')}</p><p>{escape(note.text)}</p>"
    )
    for evidence in note.evidence:
        html += (
            f"<div><p>{escape(evidence.source_identity.item_key)} · "
            f"{escape(evidence.document_version_id)} · "
            f"{escape(evidence.page_label or evidence.source_kind)}</p>"
            f"<blockquote>{escape(evidence.excerpt)}</blockquote></div>"
        )
    return html + "</div></div>"
