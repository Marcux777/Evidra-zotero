from typing import Annotated, Literal, Self

from pydantic import Field, model_validator

from evidra.domain.documents import Evidence
from evidra.domain.sources import SourceAccess, SourceIdentity
from evidra.extraction.models import Id, Key, MatrixCell, SourceId, Text, Write
from evidra.providers.models import OllamaOptions, ProviderProfile, SchemaPlan, StrictModel
from evidra.research.models import (
    ProtocolVersion,
    ReuseKind,
    ScreeningChoice,
    ScreeningDecision,
    Stage,
)

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


class CriterionVerdict(StrictModel):
    criterion_id: Key
    verdict: Literal["MET", "NOT_MET", "UNCLEAR"]
    evidence_ids: list[SourceId] = Field(default_factory=list, max_length=6)


class ReusableItem(StrictModel):
    """Something the researcher's project could adopt, and how, with its anchor."""

    kind: ReuseKind
    text: Text
    use: Text
    evidence_ids: list[SourceId] = Field(min_length=1, max_length=6)


class AnchoredPoint(StrictModel):
    text: Text
    evidence_ids: list[SourceId] = Field(min_length=1, max_length=6)


class Concern(StrictModel):
    """Why the study may not serve this project; anchors are optional for absences."""

    text: Text
    evidence_ids: list[SourceId] = Field(default_factory=list, max_length=6)


class PaperCard(StrictModel):
    """Source guide generated with full-text screening; every point is a proposal."""

    summary: Text
    contributions: list[AnchoredPoint] = Field(max_length=8)
    strengths: list[AnchoredPoint] = Field(max_length=8)
    limitations: list[AnchoredPoint] = Field(max_length=8)
    questions: list[Text] = Field(max_length=5)


class ScreeningOutput(StrictModel):
    kind: Literal["SCREENING"]
    decision: ScreeningChoice
    criterion_ids: list[Key] = Field(min_length=1, max_length=30)
    evidence_ids: list[SourceId] = Field(max_length=12)
    rationale: Text
    # Relevance triage (protocols with a rubric). Empty on screenings made without one.
    verdicts: list[CriterionVerdict] = Field(default_factory=list, max_length=30)
    relevance_grade: int | None = Field(default=None, ge=0, le=5)
    reusable: list[ReusableItem] = Field(default_factory=list, max_length=12)
    concerns: list[Concern] = Field(default_factory=list, max_length=8)
    card: PaperCard | None = None


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
    reason: Literal[
        "MATRIX_COVERAGE", "STAGE_EXCERPTS_ONLY", "RETRIEVED_CHUNKS_ONLY", "DIRECTED_EXCERPTS"
    ]


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


class ScreeningBatchPrepare(Write):
    """One consent for sequential screening: each study gets its own inspectable run."""

    protocol_version_id: Id
    profile_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")
    stage: Stage
    question: Text
    # NOT_HUMAN_EXCLUDED skips studies every human reviewer excluded at title/abstract.
    selection: Literal["ALL", "NOT_HUMAN_EXCLUDED"] = "ALL"
    source_ids: list[SourceId] | None = Field(default=None, min_length=1, max_length=1000)
    context_tokens: int = Field(default=32768, ge=1024, le=1_000_000)
    max_output_tokens: int = Field(default=4096, ge=1, le=32768)
    ollama_options: OllamaOptions | None = None


class ScreeningBatchItem(StrictModel):
    source_id: str
    title: str
    run_id: str | None
    # NO_CONTENT, HUMAN_EXCLUDED or the preparation error code; no model call was made.
    skipped: str | None = None


BatchState = Literal["PREPARED", "RUNNING", "PAUSED", "COMPLETE", "CANCELLED"]


class ScreeningBatch(StrictModel):
    id: str
    notebook_id: str
    snapshot_id: str
    revision: int
    protocol_version_id: str
    stage: Stage
    profile_id: str
    state: BatchState = "PREPARED"
    reason: str | None = None
    items: list[ScreeningBatchItem]
    estimated_input_tokens: int
    max_output_tokens: int
    created_at: str


class ScreeningBatchView(StrictModel):
    batch: ScreeningBatch
    # Current state of every prepared run, counted from the run records themselves.
    run_states: dict[str, int]


class ScreeningBatchPage(StrictModel):
    items: list[ScreeningBatch]
    offset: int
    limit: int
    total: int


class ScreeningBatchControl(Write):
    action: Literal["start", "cancel"]
    expected_revision: int = Field(ge=0)


class ScreeningQueueRequest(StrictModel):
    protocol_version_id: Id
    stage: Stage
    sort: Literal["GRADE", "ATTENTION", "TITLE"] = "ATTENTION"
    offset: int = Field(default=0, ge=0, le=1_000_000)
    limit: int = Field(default=20, ge=1, le=50)


class ScreeningQueueRow(StrictModel):
    source_id: str
    title: str
    year: int | None
    run_id: str | None
    run_state: ResearchState | None
    run_reason: str | None
    # Latest artifact version; content is omitted when its prepared evidence no longer verifies.
    artifact_version_id: str | None
    review_state: Literal["UNREVIEWED", "APPROVED", "CORRECTED", "REJECTED"] | None
    artifact_available: bool
    output: ScreeningOutput | None
    human: list[ScreeningDecision]
    conflict: bool


class ScreeningQueuePage(StrictModel):
    items: list[ScreeningQueueRow]
    offset: int
    limit: int
    total: int
