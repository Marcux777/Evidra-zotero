from typing import Annotated, Literal, Self

from pydantic import Field, model_validator

from evidra.domain.documents import Evidence
from evidra.domain.sources import SourceAccess, SourceIdentity
from evidra.extraction.models import Id, Key, MatrixCell, SourceId, Text, Write
from evidra.providers.models import OllamaOptions, ProviderProfile, SchemaPlan, StrictModel
from evidra.research.models import ProtocolVersion, ScreeningChoice, Stage

ResearchKind = Literal["SCREENING", "SYNTHESIS", "AUDIT"]
SupportState = Literal[
    "SUPPORTED_PROPOSAL",
    "PARTIALLY_SUPPORTED_PROPOSAL",
    "CONTRADICTED_PROPOSAL",
    "INSUFFICIENT_EVIDENCE",
]


class ResearchPrepare(Write):
    kind: ResearchKind
    protocol_version_id: Id
    profile_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")
    source_id: SourceId | None = None
    stage: Stage | None = None
    question: Text
    pasted_text: str = Field(default="", max_length=12000)
    retrieval_query: str = Field(default="", max_length=2000)
    include_unreviewed: bool = False
    context_tokens: int = Field(default=32768, ge=1024, le=1_000_000)
    max_output_tokens: int = Field(default=4096, ge=1, le=32768)
    ollama_options: OllamaOptions | None = None

    @model_validator(mode="after")
    def applicable(self) -> Self:
        if (self.kind == "SCREENING") != (self.source_id is not None and self.stage is not None):
            raise ValueError("Screening requires a source and stage")
        if self.kind != "SCREENING" and (self.source_id is not None or self.stage is not None):
            raise ValueError("Only screening has a source and stage")
        if self.kind == "AUDIT" and (
            not self.pasted_text.strip() or not self.retrieval_query.strip()
        ):
            raise ValueError("Audit requires pasted claims and explicit retrieval query")
        if self.kind != "AUDIT" and (self.pasted_text or self.retrieval_query):
            raise ValueError("Only audit has pasted claims and retrieval query")
        if self.include_unreviewed and self.kind != "SYNTHESIS":
            raise ValueError("Unreviewed matrix inputs apply only to synthesis")
        return self


class ScreeningOutput(StrictModel):
    kind: Literal["SCREENING"]
    decision: ScreeningChoice
    criterion_ids: list[Key] = Field(min_length=1, max_length=30)
    evidence_ids: list[SourceId] = Field(max_length=12)
    rationale: Text


class SynthesisSection(StrictModel):
    heading: Text
    text: Text
    cell_ids: list[str] = Field(min_length=1, max_length=50)
    evidence_ids: list[SourceId] = Field(max_length=12)
    basis: Literal["REVIEWED", "UNREVIEWED", "MIXED"]
    comparability: Text


class SynthesisOutput(StrictModel):
    kind: Literal["SYNTHESIS"]
    sections: list[SynthesisSection] = Field(min_length=1, max_length=20)
    limitations: list[Text] = Field(min_length=1, max_length=20)


class AuditReference(StrictModel):
    citation: Text
    source_id: SourceId | None
    relationship: Literal["DIRECT", "INDIRECT_MENTION", "NOT_IN_NOTEBOOK"]


class AuditClaim(StrictModel):
    text: Text
    start: int = Field(ge=0, le=12000)
    end: int = Field(ge=1, le=12000)
    support: SupportState
    evidence_ids: list[SourceId] = Field(max_length=12)
    explanation: Text
    references: list[AuditReference] = Field(max_length=12)


class AuditOutput(StrictModel):
    kind: Literal["AUDIT"]
    claims: list[AuditClaim] = Field(min_length=1, max_length=30)
    collection_limitations: Text


ResearchOutput = Annotated[
    ScreeningOutput | SynthesisOutput | AuditOutput, Field(discriminator="kind")
]


class ResearchStudy(StrictModel):
    source_id: str
    identity: SourceIdentity
    title: str
    doi: str | None
    year: int | None


class ResearchCell(StrictModel):
    id: str
    cell: MatrixCell
    evidence_ids: list[str]
    basis: Literal["REVIEWED", "UNREVIEWED"]


class ResearchCoverage(StrictModel):
    snapshot_members: int
    available_studies: int
    included_studies: int
    matrix_cells_total: int = 0
    reviewed_cells: int = 0
    unreviewed_cells: int = 0
    excluded_cells: int = 0
    evidence_chunks: int
    candidate_chunks: int
    complete: bool = False
    reason: Literal["MATRIX_COVERAGE", "STAGE_EXCERPTS_ONLY", "RETRIEVED_CHUNKS_ONLY"]


class ResearchInputs(StrictModel):
    protocol: ProtocolVersion
    studies: list[ResearchStudy]
    access: list[SourceAccess]
    cells: list[ResearchCell]
    evidence: list[Evidence]
    coverage: ResearchCoverage


class ResearchPreview(StrictModel):
    run_id: str
    request: ResearchPrepare
    prompt: str
    schema_plan: SchemaPlan
    profile: ProviderProfile
    inputs: ResearchInputs
    estimated_input_tokens: int
    estimate_method: Literal["utf8-bytes-plus-overhead-v1"] = "utf8-bytes-plus-overhead-v1"


ResearchState = Literal[
    "PREPARED",
    "RUNNING",
    "PAUSED",
    "WAITING_PROVIDER",
    "BILLING_UNKNOWN",
    "COMPLETE",
    "PARTIAL",
    "FAILED",
    "CANCELLED",
]


class ResearchRun(StrictModel):
    id: str
    notebook_id: str
    snapshot_id: str
    revision: int = 0
    kind: ResearchKind
    state: ResearchState = "PREPARED"
    reason: str | None = None
    profile_id: str
    call_ids: list[str] = Field(default_factory=list)
    checkpointed: bool = False
    artifact_version_id: str | None = None
    created_at: str


class ResearchRunPage(StrictModel):
    items: list[ResearchRun]
    offset: int
    limit: int
    total: int


class ResearchAccessPage(StrictModel):
    items: list[SourceAccess]
    documents: list[tuple[str, str]]
    offset: int
    limit: int
    total: int


class ResearchControl(Write):
    action: Literal["start", "cancel", "acknowledge_uncertain"]
    expected_revision: int = Field(ge=0)


class ArtifactVersion(StrictModel):
    id: str
    artifact_id: str
    revision: int
    previous_version_id: str | None
    run_id: str
    output: ResearchOutput
    coverage: ResearchCoverage
    review_state: Literal["UNREVIEWED", "APPROVED", "CORRECTED", "REJECTED"]
    rationale: str | None
    author: str
    created_at: str
    anchor_validation: Literal["VERIFIED_ORIGINAL_EXCERPTS"] = "VERIFIED_ORIGINAL_EXCERPTS"
    support_validation: Literal["MODEL_PROPOSAL_REQUIRES_HUMAN_REVIEW"] = (
        "MODEL_PROPOSAL_REQUIRES_HUMAN_REVIEW"
    )


class ArtifactReview(Write):
    expected_revision: int = Field(ge=1)
    action: Literal["APPROVED", "CORRECTED", "REJECTED"]
    rationale: Text
    corrected_output: ResearchOutput | None = None

    @model_validator(mode="after")
    def correction(self) -> Self:
        if (self.action == "CORRECTED") != (self.corrected_output is not None):
            raise ValueError("Only CORRECTED requires a replacement output")
        return self


class ArtifactPage(StrictModel):
    items: list[ArtifactVersion]
    offset: int
    limit: int
    total: int
