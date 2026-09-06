from pydantic import ValidationError

from evidra.conversations.models import Answer, RunRecord
from evidra.domain.errors import EvidraError
from evidra.evidence.service import EvidenceService
from evidra.scope.service import ScopeContext


def validate_answer(
    text: str, run: RunRecord, context: ScopeContext, evidence: EvidenceService
) -> Answer:
    try:
        answer = Answer.model_validate_json(text)
        allowed = {value.id: value for value in run.context.evidence}
        for claim in answer.claims:
            if claim.kind == "source" and not claim.evidence:
                raise ValueError("Source claims require evidence")
            if claim.kind == "general" and claim.evidence:
                raise ValueError("General claims cannot masquerade as sourced claims")
            if claim.kind == "visual_proposal" and run.visual is None:
                raise ValueError("Visual claims require server image provenance")
            for citation in claim.evidence:
                if citation.evidence_id not in allowed:
                    raise ValueError("Invented or unselected evidence ID")
                current = evidence.read(context, citation.evidence_id)
                original = allowed[citation.evidence_id]
                if (
                    current.document_version_id != original.document_version_id
                    or current.excerpt != original.excerpt
                    or citation.excerpt not in current.excerpt
                ):
                    raise ValueError("Unverifiable literal excerpt")
        return answer
    except (ValidationError, ValueError) as exc:
        raise EvidraError(
            "INVALID_MODEL_OUTPUT", "Model output failed schema/evidence validation."
        ) from exc
