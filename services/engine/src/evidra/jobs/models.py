from typing import Annotated, Literal

from pydantic import Field, model_validator

from evidra.conversations.models import RunAccess
from evidra.domain.documents import DocumentCommandScope
from evidra.extraction.models import CellValue, Id, Key, SourceId, Text, Write
from evidra.providers.models import OllamaOptions, ProviderProfile, SchemaPlan, StrictModel

JobState = Literal[
    "QUEUED", "RUNNING", "PAUSED", "WAITING_PROVIDER", "PARTIAL", "SUCCEEDED", "FAILED", "CANCELLED"
]
Method = Literal["SEARCH", "FULL_SCAN"]
UnitState = Literal["QUEUED", "RUNNING", "COMPLETE", "FAILED", "BILLING_UNKNOWN"]


class JobWrite(Write):
    form_version_id: Id
    field_keys: list[Key] = Field(min_length=1, max_length=30)
    profile_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")
    method: Method
    max_chunks_per_unit: int = Field(default=500, ge=1, le=10000)
    context_tokens: int = Field(default=32768, ge=1024, le=1_000_000)
    max_output_tokens: int = Field(default=2048, ge=1, le=32768)
    ollama_options: OllamaOptions | None = None
    force_new: bool = False

    @model_validator(mode="after")
    def unique_fields(self) -> "JobWrite":
        if len(set(self.field_keys)) != len(self.field_keys):
            raise ValueError("Duplicate fields")
        return self


class JobControl(Write):
    action: Literal["resume", "pause", "cancel", "skip_uncertain"]
    expected_revision: int = Field(ge=0)


class JobRecord(StrictModel):
    id: str
    notebook_id: str
    snapshot_id: str
    revision: int = 0
    state: JobState = "PAUSED"
    reason: str | None = None
    request: JobWrite
    profile: ProviderProfile
    schema_plan: SchemaPlan
    total_units: int
    completed_units: int = 0
    failed_units: int = 0
    cached_units: int = 0
    created_at: str


class AttachmentCoverage(StrictModel):
    content_key: str
    source_kind: str
    document_version_id: str | None = None
    pages_total: int | None = None
    pages_processed: int = 0
    chunks_total: int = 0
    chunks_selected: int = 0
    chunks_processed: int = 0
    failed_pages: int = 0
    reason: str | None = None


class UnitRecord(StrictModel):
    id: str
    job_id: str
    source_id: str
    field_key: str
    field_origin_form_version_id: str
    state: UnitState = "QUEUED"
    reason: str | None = None
    coverage: list[AttachmentCoverage]
    coverage_state: Literal["SEARCH", "PARTIAL_SCAN", "FULL_SCAN"]
    batches_total: int
    batches_processed: int = 0
    proposal_id: str | None = None
    cache_hit: bool = False
    call_ids: list[str] = Field(default_factory=list)


class BatchOutput(CellValue):
    evidence_ids: list[SourceId] = Field(max_length=12)
    rationale: Text


class BatchPreview(StrictModel):
    unit_id: str
    batch_index: int
    prompt: str
    estimated_input_tokens: int
    estimate_method: Literal["utf8-bytes-plus-overhead-v1"] = "utf8-bytes-plus-overhead-v1"
    schema_plan: SchemaPlan
    profile: ProviderProfile


class JobPage(StrictModel):
    items: list[JobRecord]
    offset: int
    limit: int
    total: int


class UnitPage(StrictModel):
    items: list[UnitRecord]
    offset: int
    limit: int
    total: int


class JobAccessPage(RunAccess):
    offset: int
    limit: int
    total: int


class JobListCommand(DocumentCommandScope):
    op: Literal["jobs.list"]
    offset: int = Field(ge=0, le=1_000_000)


class JobWriteCommand(DocumentCommandScope):
    op: Literal["jobs.prepare"]
    request: JobWrite


class JobReadCommand(DocumentCommandScope):
    op: Literal["jobs.read"]
    job_id: Id


class JobAccessCommand(DocumentCommandScope):
    op: Literal["jobs.access"]
    job_id: Id
    offset: int = Field(default=0, ge=0, le=1_000_000)


class JobUnitsCommand(DocumentCommandScope):
    op: Literal["jobs.units"]
    job_id: Id
    offset: int = Field(ge=0, le=1_000_000)


class JobPreviewCommand(DocumentCommandScope):
    op: Literal["jobs.preview"]
    job_id: Id
    unit_id: Id
    batch_index: int = Field(ge=0, le=10000)


class JobControlCommand(DocumentCommandScope):
    op: Literal["jobs.control"]
    job_id: Id
    request: JobControl


class JobCacheCommand(DocumentCommandScope):
    op: Literal["jobs.cache.clear"]


JobCommand = Annotated[
    JobListCommand
    | JobWriteCommand
    | JobReadCommand
    | JobAccessCommand
    | JobUnitsCommand
    | JobPreviewCommand
    | JobControlCommand
    | JobCacheCommand,
    Field(discriminator="op"),
]
