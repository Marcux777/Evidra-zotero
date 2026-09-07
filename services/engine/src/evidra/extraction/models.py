import json
from typing import Annotated, Literal, Self

from pydantic import Field, StrictBool, model_validator

from evidra.conversations.models import VisualProvenance
from evidra.providers.models import StrictModel

Id = Annotated[str, Field(pattern=r"^[a-f0-9]{32}$")]
SourceId = Annotated[str, Field(pattern=r"^[a-f0-9]{64}$")]
Key = Annotated[str, Field(pattern=r"^[a-z][a-z0-9_]{0,63}$")]
Text = Annotated[str, Field(min_length=1, max_length=2000, pattern=r"\S")]
ValueState = Literal[
    "FOUND",
    "NOT_FOUND_IN_SEARCH",
    "NOT_REPORTED_CANDIDATE",
    "NOT_APPLICABLE",
    "UNREADABLE",
    "CONFLICTING",
]
ReviewState = Literal["UNREVIEWED", "APPROVED", "CORRECTED", "REJECTED"]
FieldKind = Literal["text", "number", "boolean", "enum", "list", "experimental_result"]


class NumericValue(StrictModel):
    original: Text
    normalized: float = Field(strict=True, allow_inf_nan=False)


class ExperimentalResult(StrictModel):
    metric: Text
    number: NumericValue
    dataset: Text | None
    condition: Text | None
    unit: Text | None
    baseline: Text | None
    direction: Literal["HIGHER_BETTER", "LOWER_BETTER", "UNSPECIFIED"]


Value = (
    Text
    | StrictBool
    | NumericValue
    | Annotated[list[Text], Field(min_length=1, max_length=50)]
    | Annotated[list[ExperimentalResult], Field(min_length=1, max_length=50)]
    | None
)


class FieldDefinition(StrictModel):
    key: Key
    label: Annotated[str, Field(min_length=1, max_length=200, pattern=r"\S")]
    kind: FieldKind
    question: Text
    definition: Text
    unit: Text | None = None
    rules: list[Text] = Field(default_factory=list, max_length=10)
    required: bool = False
    options: list[Annotated[str, Field(min_length=1, max_length=200, pattern=r"\S")]] = Field(
        default_factory=list, max_length=50
    )

    @model_validator(mode="after")
    def options_match(self) -> Self:
        if (self.kind == "enum") != bool(self.options) or len(set(self.options)) != len(
            self.options
        ):
            raise ValueError("Only enum fields require unique options")
        return self


class Write(StrictModel):
    idempotency_key: str = Field(min_length=1, max_length=200)


class FormWrite(Write):
    name: Annotated[str, Field(min_length=1, max_length=200, pattern=r"\S")]
    expected_revision: int = Field(ge=0)
    fields: list[FieldDefinition] = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def unique(self) -> Self:
        if len({f.key for f in self.fields}) != len(self.fields):
            raise ValueError("Duplicate field keys")
        return self


class FormVersion(StrictModel):
    id: str
    notebook_id: str
    revision: int
    name: str
    fields: list[FieldDefinition]
    field_origins: dict[str, str]
    author: str
    created_at: str


class FormPage(StrictModel):
    items: list[FormVersion]
    offset: int
    limit: int
    total: int


class CellValue(StrictModel):
    value: Value
    value_state: ValueState

    @model_validator(mode="after")
    def missing(self) -> Self:
        if (self.value_state == "FOUND") != (self.value is not None):
            raise ValueError("FOUND requires a value; absent states require null")
        if len(json.dumps(self.model_dump(mode="json")["value"], ensure_ascii=False)) > 8000:
            raise ValueError("Cell value exceeds the bounded review envelope")
        return self


class ProposalWrite(CellValue, Write):
    form_version_id: Id
    source_id: SourceId
    field_key: Key
    evidence_ids: list[SourceId] = Field(max_length=12)
    run_id: Id | None = None
    rationale: Text


class ExtractionProposal(CellValue):
    id: str
    form_version_id: str
    field_origin_form_version_id: str
    source_id: str
    field_key: str
    evidence_ids: list[str]
    run_id: str | None
    rationale: str
    origin: Literal["HUMAN_CLIENT", "MODEL_RUN", "COVERAGE_CHECK", "EXTERNAL_CLIENT"]
    declared_model: str | None = None
    principal: str
    model: str | None
    coverage: Literal["CITED_EVIDENCE_ONLY", "SEARCH", "PARTIAL_SCAN", "FULL_SCAN"]
    source_kinds: list[str]
    visual: VisualProvenance | None
    created_at: str
    review_state: ReviewState = "UNREVIEWED"


class MatrixCell(StrictModel):
    value: Value
    value_state: ValueState | None
    form_version_id: str
    field_origin_form_version_id: str
    decision_form_version_id: str | None = None
    source_id: str
    source_title: str
    field_key: str
    revision: int = 0
    review_state: ReviewState = "UNREVIEWED"
    proposal_id: str | None = None

    @model_validator(mode="after")
    def result_or_unprocessed(self) -> Self:
        if self.value_state is None:
            if (
                self.value is not None
                or self.revision != 0
                or self.review_state != "UNREVIEWED"
                or self.proposal_id is not None
            ):
                raise ValueError("Only an unprocessed cell has no value state")
        else:
            CellValue(value=self.value, value_state=self.value_state)
        return self


class MatrixPage(StrictModel):
    items: list[MatrixCell]
    offset: int
    limit: int
    total: int


class CellQuery(StrictModel):
    form_version_id: Id
    source_id: SourceId
    field_key: Key
    offset: int = Field(ge=0, le=1_000_000)


class MatrixQuery(StrictModel):
    form_version_id: Id
    offset: int = Field(ge=0, le=1_000_000)
    source_id: SourceId | None = None
    review_state: ReviewState | None = None
    value_state: ValueState | None = None


class ProposalPage(StrictModel):
    items: list[ExtractionProposal]
    offset: int
    limit: int
    total: int


class DecisionWrite(Write):
    proposal_id: Id
    expected_revision: int = Field(ge=0)
    action: Literal["APPROVED", "CORRECTED", "REJECTED"]
    value: Value = None
    value_state: ValueState | None = None
    rationale: Text | None = None

    @model_validator(mode="after")
    def correction(self) -> Self:
        if self.action == "CORRECTED":
            if self.value_state is None or self.rationale is None:
                raise ValueError("Correction requires state and rationale")
            CellValue(value=self.value, value_state=self.value_state)
        elif self.value is not None or self.value_state is not None:
            raise ValueError("Only a correction carries a replacement value")
        return self


class CellDecision(StrictModel):
    id: str
    proposal_id: str
    author: str
    created_at: str
    action: Literal["APPROVED", "CORRECTED", "REJECTED"]
    rationale: str | None
    old: MatrixCell
    new: MatrixCell


class DecisionPage(StrictModel):
    items: list[CellDecision]
    offset: int
    limit: int
    total: int


class BulkItem(StrictModel):
    proposal_id: Id
    expected_revision: int = Field(ge=0)


class BulkPreviewWrite(Write):
    items: list[BulkItem] = Field(min_length=1, max_length=20)


class BulkChange(StrictModel):
    old: MatrixCell
    proposal: ExtractionProposal


class BulkPreview(StrictModel):
    id: str
    changes: list[BulkChange]
    count: int


class BulkApprove(Write):
    preview_id: Id


class BulkReceipt(StrictModel):
    items: list[CellDecision]
