"""Collect every scoped matrix page; human cell state owns the default selection."""

from evidra.domain.errors import EvidraError
from evidra.extraction.matrix import MatrixService
from evidra.extraction.models import CellQuery, MatrixQuery
from evidra.research.execution import ResearchCell
from evidra.scope.service import ScopeContext


class SynthesisService:
    def __init__(self, matrix: MatrixService) -> None:
        self.matrix, self.scopes = matrix, matrix.scopes

    def cells(
        self, context: ScopeContext, form_id: str, include_unreviewed: bool
    ) -> tuple[list[ResearchCell], int, int]:
        offset, total, excluded = 0, 0, 0
        selected: list[ResearchCell] = []
        while True:
            page = self.matrix.get_matrix(
                context, MatrixQuery(form_version_id=form_id, offset=offset)
            )
            total = page.total
            if total > 30000:
                raise EvidraError(
                    "BODY_TOO_LARGE", "Matrix exceeds this synthesis preparation limit."
                )
            for cell in page.items:
                if cell.review_state in {"APPROVED", "CORRECTED"} and cell.proposal_id:
                    with self.scopes.guarded(context) as conn:
                        proposal = self.matrix.proposal(conn, context, cell.proposal_id)
                    selected.append(
                        ResearchCell(
                            id=f"{cell.source_id}:{cell.field_key}:review:{cell.revision}",
                            cell=cell,
                            evidence_ids=proposal.evidence_ids,
                            basis="REVIEWED",
                        )
                    )
                    # A rejected competitor must not displace this accepted/corrected value.
                    continue
                included = False
                if include_unreviewed:
                    proposal_offset = 0
                    while True:
                        proposals = self.matrix.history(
                            context,
                            CellQuery(
                                form_version_id=form_id,
                                source_id=cell.source_id,
                                field_key=cell.field_key,
                                offset=proposal_offset,
                            ),
                        )
                        for proposal in proposals.items:
                            if proposal.review_state != "UNREVIEWED":
                                continue
                            included = True
                            selected.append(
                                ResearchCell(
                                    id=f"{cell.source_id}:{cell.field_key}:proposal:{proposal.id}",
                                    cell=cell.model_copy(
                                        update={
                                            "value": proposal.value,
                                            "value_state": proposal.value_state,
                                            "proposal_id": proposal.id,
                                        }
                                    ),
                                    evidence_ids=proposal.evidence_ids,
                                    basis="UNREVIEWED",
                                )
                            )
                        proposal_offset += len(proposals.items)
                        if proposal_offset >= proposals.total:
                            break
                        if not proposals.items:
                            raise EvidraError(
                                "INVALID_OUTPUT", "Proposal pagination made no progress."
                            )
                if not included:
                    excluded += 1
                if len(selected) > 30000:
                    raise EvidraError("BODY_TOO_LARGE", "Synthesis input exceeds the cell limit.")
            offset += len(page.items)
            if offset >= total:
                break
            if not page.items:
                raise EvidraError("INVALID_OUTPUT", "Matrix pagination made no progress.")
        if not selected:
            raise EvidraError(
                "NO_EVIDENCE", "No eligible matrix cells; review cells or opt in explicitly."
            )
        self.scopes.assert_current(context)
        return selected, total, excluded
