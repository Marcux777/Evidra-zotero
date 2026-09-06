"""Document, operation and evidence contracts; paths are confined to bridge registration."""

from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import ConfigDict, Field, model_validator

from evidra.domain.sources import SourceIdentity, SourceKind, StrictModel

Coverage = Literal[
    "METADATA_ONLY",
    "PARTIAL_TEXT",
    "FULL_TEXT_PARSED",
    "NEEDS_OCR",
    "UNREADABLE",
    "MISSING_FILE",
    "STALE",
]
OperationState = Literal["QUEUED", "RUNNING", "COMPLETE", "PAUSED", "CANCELLED", "FAILED"]
Rectangle = tuple[float, float, float, float]


class ParserLimits(StrictModel):
    # Decimal source bytes; memory uses binary MiB. Bounds are part of the public contract.
    max_file_bytes: int = Field(default=200_000_000, ge=1, le=2_000_000_000)
    max_pages: int = Field(default=1000, ge=1, le=10000)
    memory_bytes: int = Field(
        default=512 * 1024 * 1024, ge=64 * 1024 * 1024, le=4 * 1024 * 1024 * 1024
    )
    timeout_seconds: float = Field(default=120, ge=0.1, le=1800, allow_inf_nan=False)


class AttachmentRegister(StrictModel):
    source_id: str = Field(pattern=r"^[a-f0-9]{64}$")
    content_key: str = Field(min_length=1, max_length=200)
    path: str = Field(min_length=1, max_length=32767, repr=False)


class RegisteredDocument(StrictModel):
    id: str
    source_id: str
    content_key: str
    source_kind: SourceKind
    revision: int
    coverage: Coverage
    reason: str | None = None


class IngestRequest(StrictModel):
    document_id: str = Field(pattern=r"^[a-f0-9]{32}$")
    idempotency_key: str = Field(min_length=1, max_length=200)
    limits: ParserLimits = Field(default_factory=ParserLimits)


class Operation(StrictModel):
    model_config = ConfigDict(extra="forbid", frozen=False, validate_assignment=True)
    id: str
    document_id: str
    state: OperationState
    kind: Literal["ingest", "preview"]
    coverage: Coverage
    reason: str | None = None
    document_version_id: str | None = None
    sha256: str | None = None
    page_count: int | None = None
    pages_processed: int = 0
    bytes_processed: int = 0
    cache_hit: bool = False
    created_at: datetime


class ParsedPage(StrictModel):
    page_index: int = Field(ge=0)
    page_label: str | None
    original_text: str
    quality: Literal["TEXT", "EMPTY", "UNMAPPABLE", "ERROR"]
    diagnostic: str | None = None
    crop_box: Rectangle | None
    media_box: Rectangle | None
    bbox: Rectangle | None
    rotation: int | None
    # One entry per original Python code point, null where no verified rectangle exists.
    char_boxes: list[Rectangle | None]
    mapping_verified: bool


class Evidence(StrictModel):
    id: str
    source_id: str
    source_identity: SourceIdentity
    content_key: str
    source_kind: SourceKind
    document_version_id: str
    document_sha256: str
    document_bytes: int = Field(ge=0)
    excerpt: str
    start: int
    end: int
    page_index: int | None
    page_label: str | None
    precision: Literal["rectangles", "page", "text"]
    rectangles: list[Rectangle]
    historical: bool
    parser_version: str


class SearchRequest(StrictModel):
    query: str = Field(min_length=1, max_length=2000)
    offset: int = Field(default=0, ge=0, le=1_000_000)
    limit: int = Field(default=40, ge=1, le=100)


class SearchHit(StrictModel):
    evidence_id: str
    source_id: str
    content_key: str
    source_kind: SourceKind
    excerpt: str
    page_index: int | None
    page_label: str | None
    historical: bool
    score: float


class SearchPage(StrictModel):
    items: list[SearchHit]
    offset: int
    limit: int
    total: int
    documents_retrieved: int


class DocumentStatus(StrictModel):
    document_id: str | None
    source_id: str
    content_key: str
    source_kind: SourceKind
    title: str
    coverage: Coverage
    parsed_coverage: Coverage
    historical: bool
    document_version_id: str | None = None
    page_count: int | None = None
    pages_processed: int = 0
    bytes_processed: int = 0
    reason: str | None = None
    operation: Operation | None = None


class DocumentPage(StrictModel):
    items: list[DocumentStatus]
    offset: int
    limit: int
    total: int


class PagePreviewRequest(StrictModel):
    document_version_id: str = Field(pattern=r"^[a-f0-9]{64}$")
    page_index: int = Field(ge=0, le=9999)
    region: Rectangle | None = None
    scale: float = Field(default=1, gt=0, le=4, allow_inf_nan=False)
    idempotency_key: str = Field(min_length=1, max_length=200)
    limits: ParserLimits = Field(default_factory=ParserLimits)

    @model_validator(mode="after")
    def finite_region(self) -> Self:
        import math

        if self.region is not None:
            left, bottom, right, top = self.region
            if not all(math.isfinite(v) for v in self.region) or left >= right or bottom >= top:
                raise ValueError("Invalid selected region")
        return self


class PagePreview(StrictModel):
    document_version_id: str
    page_index: int
    region: Rectangle
    width: int
    height: int
    sha256: str
    mime_type: Literal["image/png"] = "image/png"
    data_base64: str
    destination: Literal["local_preview"] = "local_preview"


class TextRegister(StrictModel):
    source_id: str = Field(pattern=r"^[a-f0-9]{64}$")
    content_key: str = Field(min_length=1, max_length=200)
    total_characters: int = Field(ge=0, le=20_000_000)
    sha256: str = Field(pattern=r"^[a-f0-9]{64}$")


class TextPart(StrictModel):
    offset: int = Field(ge=0, le=20_000_000)
    text: str = Field(max_length=8000, repr=False)
    final: bool


class TextStage(StrictModel):
    id: str
    offset: int
    total_characters: int
    document: RegisteredDocument | None = None


class DocumentTargetRequest(StrictModel):
    source_id: str = Field(pattern=r"^[a-f0-9]{64}$")
    content_key: str = Field(min_length=1, max_length=200)


class EvidenceFileCheck(StrictModel):
    evidence_id: str = Field(pattern=r"^[a-f0-9]{64}$")
    path: str = Field(min_length=1, max_length=32767, repr=False)


class DocumentCommandScope(StrictModel):
    notebook_id: str = Field(
        pattern=r"^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"
    )
    snapshot_id: str = Field(
        pattern=r"^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"
    )


class DocumentListCommand(DocumentCommandScope):
    op: Literal["documents.list"]
    offset: int = Field(ge=0, le=1_000_000)


class DocumentIndexCommand(DocumentCommandScope, DocumentTargetRequest):
    op: Literal["documents.index"]
    limits: ParserLimits
    idempotency_key: str = Field(min_length=1, max_length=200)


class DocumentSearchCommand(DocumentCommandScope):
    op: Literal["documents.search"]
    request: SearchRequest


class DocumentEvidenceCommand(DocumentCommandScope):
    op: Literal["documents.evidence", "documents.open"]
    evidence_id: str = Field(pattern=r"^[a-f0-9]{64}$")


class DocumentOperationCommand(DocumentCommandScope):
    op: Literal["documents.operation", "documents.cancel", "documents.preview.read"]
    operation_id: str = Field(pattern=r"^[a-f0-9]{32}$")


class DocumentPreviewCommand(DocumentCommandScope):
    op: Literal["documents.preview"]
    request: PagePreviewRequest


DocumentCommand = Annotated[
    DocumentListCommand
    | DocumentIndexCommand
    | DocumentSearchCommand
    | DocumentEvidenceCommand
    | DocumentOperationCommand
    | DocumentPreviewCommand,
    Field(discriminator="op"),
]
