from typing import Annotated, Literal, Self

from pydantic import Field, model_validator

from evidra.extraction.models import Id, Key, SourceId, Text, Write
from evidra.providers.models import StrictModel

Stage = Literal["TITLE_ABSTRACT", "FULL_TEXT"]
ScreeningChoice = Literal["INCLUDE", "EXCLUDE", "UNCERTAIN"]
ReuseKind = Literal[
    "METHOD", "DATASET", "BASELINE", "METRIC", "CODE", "ARGUMENT", "FINDING", "OTHER"
]
Label = Annotated[str, Field(min_length=1, max_length=100, pattern=r"\S")]


class Criterion(StrictModel):
    id: Key
    text: Text
    kind: Literal["INCLUSION", "EXCLUSION"]
    applicability: Literal["TITLE_ABSTRACT", "FULL_TEXT", "BOTH"]


class ProjectContext(StrictModel):
    """The researcher's own work, against which relevance and reuse are judged."""

    description: Text
    methods: list[Text] = Field(default_factory=list, max_length=20)
    data: list[Text] = Field(default_factory=list, max_length=20)
    constraints: list[Text] = Field(default_factory=list, max_length=20)
    seeking: list[ReuseKind] = Field(default_factory=list, max_length=8)


class RubricLevel(StrictModel):
    """One explicit relevance grade; the only rule by which studies may be ordered."""

    grade: int = Field(ge=0, le=5)
    label: Label
    definition: Text


class ProtocolWrite(Write):
    question: Text
    objective: Text
    review_type: Literal["EXPLORATORY", "SYSTEMATIC"]
    form_version_id: Id
    criteria: list[Criterion] = Field(min_length=1, max_length=30)
    expected_revision: int = Field(ge=0)
    project: ProjectContext | None = None
    rubric: list[RubricLevel] = Field(default_factory=list, max_length=6)

    @model_validator(mode="after")
    def unique(self) -> Self:
        if len({c.id for c in self.criteria}) != len(self.criteria):
            raise ValueError("Duplicate criterion IDs")
        if len({r.grade for r in self.rubric}) != len(self.rubric):
            raise ValueError("Duplicate rubric grades")
        if self.rubric and len(self.rubric) < 2:
            raise ValueError("A relevance rubric needs at least two grades")
        return self


class ProtocolVersion(StrictModel):
    id: str
    notebook_id: str
    revision: int
    question: str
    objective: str
    review_type: Literal["EXPLORATORY", "SYSTEMATIC"]
    form_version_id: str
    criteria: list[Criterion]
    author: str
    created_at: str
    # Absent on protocols saved before relevance triage; screening then keeps its original form.
    project: ProjectContext | None = None
    rubric: list[RubricLevel] = Field(default_factory=list)


class ProtocolPage(StrictModel):
    items: list[ProtocolVersion]
    offset: int
    limit: int
    total: int


class ScreeningWrite(Write):
    protocol_version_id: Id
    source_id: SourceId
    stage: Stage
    reviewer: str = Field(min_length=1, max_length=100, pattern=r"\S")
    decision: ScreeningChoice
    criterion_ids: list[Key] = Field(min_length=1, max_length=30)
    rationale: Text
    expected_revision: int = Field(ge=0)


class ScreeningDecision(StrictModel):
    id: str
    protocol_version_id: str
    source_id: str
    stage: Stage
    reviewer: str
    decision: ScreeningChoice
    criterion_ids: list[str]
    rationale: str
    revision: int
    previous_decision: ScreeningChoice | None
    author: str
    created_at: str
    # Human decision adopted from a human-reviewed model proposal; provenance, not authority.
    adopted_artifact_version_id: str | None = None


class ScreeningAdopt(Write):
    """Record a human screening decision from an APPROVED/CORRECTED screening artifact."""

    artifact_version_id: Id
    reviewer: str = Field(min_length=1, max_length=100, pattern=r"\S")
    expected_revision: int = Field(ge=0)


class ScreeningRow(StrictModel):
    source_id: str
    stage: Stage
    decisions: list[ScreeningDecision]
    conflict: bool


class ScreeningPage(StrictModel):
    items: list[ScreeningRow]
    offset: int
    limit: int
    total: int
    snapshot_members: int
    currently_available_members: int
    observed_decision_events: int
    historical_search_count: None = None
