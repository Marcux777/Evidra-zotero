"""Append-only human decisions. Scope and CAS share the final SQLite transaction."""

import json
import secrets
import sqlite3
from typing import Literal, overload

from evidra.conversations.models import RunRecord
from evidra.conversations.service import ConversationService
from evidra.domain.documents import Evidence
from evidra.domain.errors import EvidraError
from evidra.domain.sources import Source
from evidra.evidence.service import EvidenceService
from evidra.extraction.forms import FormService, author, fingerprint, now
from evidra.extraction.models import (
    BulkApprove,
    BulkChange,
    BulkPreview,
    BulkPreviewWrite,
    BulkReceipt,
    CellDecision,
    CellQuery,
    DecisionPage,
    DecisionWrite,
    ExperimentalResult,
    ExtractionProposal,
    FieldDefinition,
    MatrixCell,
    MatrixPage,
    MatrixQuery,
    NumericValue,
    ProposalPage,
    ProposalWrite,
    Value,
    ValueState,
)
from evidra.scope.service import ScopeContext


def validate_value(field: FieldDefinition, value: Value) -> None:
    if value is None:
        return
    valid = {
        "text": lambda: isinstance(value, str),
        "number": lambda: isinstance(value, NumericValue),
        "boolean": lambda: isinstance(value, bool),
        "enum": lambda: isinstance(value, str) and value in field.options,
        "list": lambda: isinstance(value, list) and all(isinstance(x, str) for x in value),
        "experimental_result": lambda: (
            isinstance(value, list) and all(isinstance(x, ExperimentalResult) for x in value)
        ),
    }[field.kind]()
    if not valid:
        raise EvidraError("INVALID_REQUEST", "Value does not match the versioned field.")


class MatrixService:
    def __init__(
        self, forms: FormService, evidence: EvidenceService, conversations: ConversationService
    ) -> None:
        self.forms, self.evidence, self.conversations = forms, evidence, conversations
        self.scopes = forms.scopes

    @staticmethod
    def scope(context: ScopeContext) -> tuple[str, str]:
        return context.notebook_id, context.snapshot_id

    def target(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        form_id: str,
        source_id: str,
        field_key: str,
    ) -> tuple[FieldDefinition, Source]:
        form = self.forms.from_connection(conn, context, form_id)
        field = next((f for f in form.fields if f.key == field_key), None)
        if field is None:
            raise EvidraError("NOT_FOUND", "Field not found in this form version.")
        member = next(
            (
                r
                for r in self.scopes.members(conn, *self.scope(context))
                if r["source_id"] == source_id
            ),
            None,
        )
        if member is None:
            raise EvidraError("SOURCE_REVOKED", "Study is outside current scope.")
        source = self.scopes.content(conn, member)
        return field, source

    def provenance(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        proposal: ProposalWrite | ExtractionProposal,
    ) -> tuple[list[Evidence], RunRecord | None]:
        self.target(conn, context, proposal.form_version_id, proposal.source_id, proposal.field_key)
        evidence = [
            self.evidence.from_connection(conn, context, identity)
            for identity in proposal.evidence_ids
        ]
        if any(e.source_id != proposal.source_id for e in evidence):
            raise EvidraError("FORBIDDEN", "Evidence belongs to a different study.")
        run = None
        if proposal.run_id:
            run = self.conversations.read_from_connection(conn, context, proposal.run_id)
            if run.state != "COMPLETE" or run.output is None:
                raise EvidraError(
                    "INVALID_OUTPUT", "Only a complete domain run can support a proposal."
                )
            if not set(proposal.evidence_ids) <= {e.id for e in run.context.evidence}:
                raise EvidraError("FORBIDDEN", "Proposal evidence was not in this run.")
            if run.visual:
                document = conn.execute(
                    "SELECT d.source_id FROM document_versions v "
                    "JOIN documents d ON d.id=v.document_id WHERE v.id=?",
                    (run.visual.document_version_id,),
                ).fetchone()
                if document is None or document[0] != proposal.source_id:
                    raise EvidraError("FORBIDDEN", "Visual run belongs to a different study.")
        if not evidence and not (run and run.visual):
            raise EvidraError(
                "NO_EVIDENCE", "A proposal requires real text evidence or an authorized visual run."
            )
        return evidence, run

    def proposal(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> ExtractionProposal:
        row = conn.execute(
            "SELECT payload FROM extraction_proposals "
            "WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (identity, *self.scope(context)),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Proposal not found.")
        value = ExtractionProposal.model_validate_json(row[0])
        self.provenance(conn, context, value)
        return value

    def propose_extractions(self, context: ScopeContext, body: ProposalWrite) -> ExtractionProposal:
        with self.scopes.guarded(context, capability="commit") as conn:
            field, _ = self.target(
                conn, context, body.form_version_id, body.source_id, body.field_key
            )
            validate_value(field, body.value)
            evidence, run = self.provenance(conn, context, body)
            old = conn.execute(
                "SELECT * FROM extraction_proposals WHERE notebook_id=? "
                "AND snapshot_id=? AND idempotency_key=?",
                (*self.scope(context), body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Proposal request changed.")
                return self.proposal(conn, context, old["id"])
            proposal = ExtractionProposal(
                **body.model_dump(exclude={"idempotency_key"}),
                id=secrets.token_hex(16),
                # A cited conversation proves support, not authorship of caller-entered values.
                origin="HUMAN_CLIENT",
                principal=author(context),
                model=run.profile.model if run else None,
                coverage="CITED_EVIDENCE_ONLY",
                source_kinds=sorted({e.source_kind for e in evidence}),
                visual=run.visual if run else None,
                created_at=now(),
            )
            conn.execute(
                "INSERT INTO extraction_proposals VALUES(?,?,?,?,?,?,?,?,?)",
                (
                    proposal.id,
                    *self.scope(context),
                    body.form_version_id,
                    body.source_id,
                    body.field_key,
                    body.idempotency_key,
                    fingerprint(body),
                    proposal.model_dump_json(),
                ),
            )
            return proposal

    def cell(
        self,
        conn: sqlite3.Connection,
        context: ScopeContext,
        form_id: str,
        source_id: str,
        field_key: str,
    ) -> MatrixCell:
        _, source = self.target(conn, context, form_id, source_id, field_key)
        row = conn.execute(
            "SELECT payload FROM cell_decisions WHERE notebook_id=? AND snapshot_id=? "
            "AND form_version_id=? AND source_id=? AND field_key=? ORDER BY revision DESC LIMIT 1",
            (*self.scope(context), form_id, source_id, field_key),
        ).fetchone()
        if row:
            cell = CellDecision.model_validate_json(row[0]).new
            if cell.proposal_id:
                self.proposal(conn, context, cell.proposal_id)
            return cell
        return MatrixCell(
            form_version_id=form_id,
            source_id=source_id,
            source_title=source.title or source_id,
            field_key=field_key,
            value=None,
            value_state="NOT_FOUND_IN_SEARCH",
        )

    def get_matrix(self, context: ScopeContext, query: MatrixQuery, limit: int = 50) -> MatrixPage:
        with self.scopes.guarded(context) as conn:
            form = self.forms.from_connection(conn, context, query.form_version_id)
            # Restrict before counting/paging. Never materialize the entire source × field grid.
            source_ids = [
                m["source_id"]
                for m in self.scopes.members(conn, *self.scope(context))
                if query.source_id is None or m["source_id"] == query.source_id
            ]
            joins = (
                " FROM json_each(?) s CROSS JOIN json_each(?) f LEFT JOIN cell_decisions d "
                "ON d.rowid=(SELECT rowid FROM cell_decisions x WHERE x.notebook_id=? "
                "AND x.snapshot_id=? AND x.form_version_id=? AND x.source_id=s.value "
                "AND x.field_key=f.value ORDER BY x.revision DESC LIMIT 1) "
                "WHERE (? IS NULL OR coalesce(json_extract(d.payload,'$.new.review_state'),"
                "'UNREVIEWED')=?) AND (? IS NULL OR coalesce("
                "json_extract(d.payload,'$.new.value_state'),'NOT_FOUND_IN_SEARCH')=?)"
            )
            args = (
                json.dumps(source_ids),
                json.dumps([f.key for f in form.fields]),
                *self.scope(context),
                form.id,
                query.review_state,
                query.review_state,
                query.value_state,
                query.value_state,
            )
            total = conn.execute("SELECT count(*)" + joins, args).fetchone()[0]
            rows = conn.execute(
                "SELECT s.value AS source_id,f.value AS field_key"
                + joins
                + " ORDER BY s.key,f.key LIMIT ? OFFSET ?",
                (*args, limit, query.offset),
            ).fetchall()
            items = [
                self.cell(conn, context, form.id, r["source_id"], r["field_key"]) for r in rows
            ]
            return MatrixPage(items=items, offset=query.offset, limit=limit, total=total)

    @overload
    def history(
        self, context: ScopeContext, query: CellQuery, *, decisions: Literal[False] = False
    ) -> ProposalPage: ...

    @overload
    def history(
        self, context: ScopeContext, query: CellQuery, *, decisions: Literal[True]
    ) -> DecisionPage: ...

    def history(
        self, context: ScopeContext, query: CellQuery, *, decisions: bool = False
    ) -> ProposalPage | DecisionPage:
        with self.scopes.guarded(context) as conn:
            self.target(conn, context, query.form_version_id, query.source_id, query.field_key)
            table = "cell_decisions" if decisions else "extraction_proposals"
            where = (
                " WHERE notebook_id=? AND snapshot_id=? AND form_version_id=? "
                "AND source_id=? AND field_key=?"
            )
            args = (*self.scope(context), query.form_version_id, query.source_id, query.field_key)
            total = conn.execute("SELECT count(*) FROM " + table + where, args).fetchone()[0]
            rows = conn.execute(
                "SELECT id,payload FROM "
                + table
                + where
                + " ORDER BY rowid DESC LIMIT 20 OFFSET ?",
                (*args, query.offset),
            ).fetchall()
            decision_items = []
            proposal_items = []
            for row in rows:
                if decisions:
                    value = CellDecision.model_validate_json(row["payload"])
                    for cell in (value.old, value.new):
                        if cell.proposal_id:
                            self.proposal(conn, context, cell.proposal_id)
                    decision_items.append(value)
                else:
                    proposal_items.append(self.proposal(conn, context, row["id"]))
            if decisions:
                return DecisionPage(
                    items=decision_items, offset=query.offset, limit=20, total=total
                )
            return ProposalPage(items=proposal_items, offset=query.offset, limit=20, total=total)

    def decide_cell(self, context: ScopeContext, body: DecisionWrite) -> CellDecision:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            return self.decide(conn, context, body)

    def decide(
        self, conn: sqlite3.Connection, context: ScopeContext, body: DecisionWrite
    ) -> CellDecision:
        proposal = self.proposal(conn, context, body.proposal_id)
        previous = conn.execute(
            "SELECT * FROM cell_decisions WHERE notebook_id=? "
            "AND snapshot_id=? AND idempotency_key=?",
            (*self.scope(context), body.idempotency_key),
        ).fetchone()
        if previous:
            if previous["request"] != fingerprint(body):
                raise EvidraError("IDEMPOTENCY_CONFLICT", "Decision request changed.")
            receipt = CellDecision.model_validate_json(previous["payload"])
            for cell in (receipt.old, receipt.new):
                if cell.proposal_id:
                    self.proposal(conn, context, cell.proposal_id)
            return receipt
        old = self.cell(
            conn, context, proposal.form_version_id, proposal.source_id, proposal.field_key
        )
        if old.revision != body.expected_revision:
            raise EvidraError("REVISION_CONFLICT", "Cell changed after review.")
        value = (
            proposal.value
            if body.action == "APPROVED"
            else body.value
            if body.action == "CORRECTED"
            else None
        )
        state: ValueState | None = (
            proposal.value_state
            if body.action == "APPROVED"
            else body.value_state
            if body.action == "CORRECTED"
            else "NOT_FOUND_IN_SEARCH"
        )
        field, _ = self.target(
            conn, context, proposal.form_version_id, proposal.source_id, proposal.field_key
        )
        validate_value(field, value)
        if state is None:
            raise EvidraError("INVALID_REQUEST", "Correction requires a value state.")
        new = MatrixCell(
            **old.model_dump(
                exclude={"value", "value_state", "revision", "review_state", "proposal_id"}
            ),
            value=value,
            value_state=state,
            revision=old.revision + 1,
            review_state=body.action,
            proposal_id=proposal.id,
        )
        decision = CellDecision(
            id=secrets.token_hex(16),
            author=author(context),
            created_at=now(),
            action=body.action,
            rationale=body.rationale,
            old=old,
            new=new,
        )
        conn.execute(
            "INSERT INTO cell_decisions VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (
                decision.id,
                *self.scope(context),
                new.form_version_id,
                new.source_id,
                new.field_key,
                new.revision,
                proposal.id,
                body.idempotency_key,
                fingerprint(body),
                decision.model_dump_json(),
            ),
        )
        return decision

    def preview(self, context: ScopeContext, body: BulkPreviewWrite) -> BulkPreview:
        with self.scopes.guarded(context, capability="commit") as conn:
            previous = conn.execute(
                "SELECT * FROM matrix_bulk_previews WHERE notebook_id=? "
                "AND snapshot_id=? AND idempotency_key=?",
                (*self.scope(context), body.idempotency_key),
            ).fetchone()
            if previous and previous["request"] != fingerprint(body):
                raise EvidraError("IDEMPOTENCY_CONFLICT", "Preview request changed.")
            changes, seen = [], set()
            for item in body.items:
                proposal = self.proposal(conn, context, item.proposal_id)
                cell = self.cell(
                    conn, context, proposal.form_version_id, proposal.source_id, proposal.field_key
                )
                identity = (cell.form_version_id, cell.source_id, cell.field_key)
                if identity in seen:
                    raise EvidraError("INVALID_REQUEST", "Select only one proposal per cell.")
                seen.add(identity)
                if cell.revision != item.expected_revision:
                    raise EvidraError("REVISION_CONFLICT", "Cell changed before preview.")
                changes.append(BulkChange(old=cell, proposal=proposal))
            preview = BulkPreview(
                id=previous["id"] if previous else secrets.token_hex(16),
                changes=changes,
                count=len(changes),
            )
            if not previous:
                conn.execute(
                    "INSERT INTO matrix_bulk_previews VALUES(?,?,?,?,?,?)",
                    (
                        preview.id,
                        *self.scope(context),
                        body.idempotency_key,
                        fingerprint(body),
                        preview.model_dump_json(),
                    ),
                )
            return preview

    def approve_bulk(self, context: ScopeContext, body: BulkApprove) -> BulkReceipt:
        self.scopes.authorize(context.principal, "manage")
        with self.scopes.guarded(context, capability="commit") as conn:
            previous = conn.execute(
                "SELECT request FROM matrix_bulk_commits WHERE notebook_id=? "
                "AND snapshot_id=? AND idempotency_key=?",
                (*self.scope(context), body.idempotency_key),
            ).fetchone()
            if previous and previous[0] != fingerprint(body):
                raise EvidraError("IDEMPOTENCY_CONFLICT", "Bulk approval request changed.")
            row = conn.execute(
                "SELECT payload FROM matrix_bulk_previews "
                "WHERE id=? AND notebook_id=? AND snapshot_id=?",
                (body.preview_id, *self.scope(context)),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Bulk preview not found.")
            preview = BulkPreview.model_validate_json(row[0])
            receipts = []
            for index, change in enumerate(preview.changes):
                # Keys bind the immutable preview and item. A retry can only replay this batch.
                request = DecisionWrite(
                    proposal_id=change.proposal.id,
                    expected_revision=change.old.revision,
                    action="APPROVED",
                    idempotency_key=f"bulk:{preview.id}:{index}",
                )
                receipts.append(self.decide(conn, context, request))
            conn.execute(
                "INSERT OR IGNORE INTO matrix_bulk_commits VALUES(?,?,?,?,?)",
                (*self.scope(context), body.idempotency_key, fingerprint(body), body.preview_id),
            )
            return BulkReceipt(items=receipts)
