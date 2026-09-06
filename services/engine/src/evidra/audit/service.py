"""Literal claim spans and anchors are structural checks, not semantic support validation."""

from evidra.domain.errors import EvidraError
from evidra.research.execution import AuditOutput, ResearchInputs


def validate_audit(output: AuditOutput, pasted_text: str, inputs: ResearchInputs) -> None:
    evidence = {e.id: e for e in inputs.evidence}
    studies = {s.source_id: s for s in inputs.studies}
    end = 0
    for claim in sorted(output.claims, key=lambda c: c.start):
        if (
            claim.start < end
            or claim.end <= claim.start
            or pasted_text[claim.start : claim.end] != claim.text
        ):
            raise EvidraError(
                "INVALID_OUTPUT", "Audit claim does not match a distinct pasted span."
            )
        end = claim.end
        if not set(claim.evidence_ids) <= evidence.keys():
            raise EvidraError("INVALID_OUTPUT", "Audit anchor was not in the prepared input.")
        if claim.support != "INSUFFICIENT_EVIDENCE" and not claim.evidence_ids:
            raise EvidraError("INVALID_OUTPUT", "A support proposal requires an original anchor.")
        cited_sources = {evidence[e].source_id for e in claim.evidence_ids}
        for reference in claim.references:
            if reference.source_id is not None and reference.source_id not in studies:
                raise EvidraError("INVALID_OUTPUT", "Referenced source is outside this notebook.")
            if reference.relationship == "DIRECT" and reference.source_id not in cited_sources:
                raise EvidraError(
                    "INVALID_OUTPUT", "Indirect or unavailable work cannot be read evidence."
                )
            if reference.relationship == "NOT_IN_NOTEBOOK" and reference.source_id is not None:
                raise EvidraError(
                    "INVALID_OUTPUT", "An available source cannot be labelled absent."
                )
            if reference.source_id is None and reference.citation.casefold().strip() in {
                value.casefold().strip()
                for study in studies.values()
                for value in (study.title, study.doi)
                if value
            }:
                raise EvidraError(
                    "INVALID_OUTPUT", "An exact notebook reference was marked unavailable."
                )
