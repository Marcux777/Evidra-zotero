from typing import Annotated, Literal, Self

from pydantic import Field, model_validator

from evidra.conversations.models import RunRecord
from evidra.domain.documents import Coverage, Evidence, Rectangle
from evidra.domain.sources import SelectionSpec, Source, SourceAccess, SourceIdentity, SourceKind
from evidra.extraction.models import CellDecision, ExtractionProposal, FormVersion, Id, Write
from evidra.jobs.models import JobRecord, UnitRecord
from evidra.mcp.models import ExternalNote
from evidra.providers.models import StrictModel
from evidra.research.execution import ArtifactVersion, ResearchPreview, ResearchRun
from evidra.research.models import ProtocolVersion, ScreeningDecision
from evidra.research.notes import ApprovedWriteOutbox, NotePreview

MAX_ARCHIVE_BYTES = 128 * 1024 * 1024
MAX_DATA_BYTES = 64 * 1024 * 1024
CHUNK_BYTES = 24000
Hash = Annotated[str, Field(pattern=r"^[a-f0-9]{64}$")]


class PortableSnapshot(StrictModel):
    id: str
    notebook_id: str
    revision: int
    created_at: str
    member_ids: list[str]
    selection: SelectionSpec | None


class PortableDocumentVersion(StrictModel):
    id: str
    document_id: str
    source_id: str
    content_key: str
    content_version: str
    source_kind: SourceKind
    sha256: Hash
    parser_version: str
    policy_version: str
    coverage: Coverage
    page_count: int = Field(ge=0)
    pages_processed: int = Field(ge=0)
    bytes_processed: int = Field(ge=0)
    created_at: str


class PortablePagePart(StrictModel):
    document_version_id: str
    page_index: int = Field(ge=0)
    page_label: str | None
    start: int = Field(ge=0)
    original_text: str = Field(max_length=4000)
    final: bool
    quality: Literal["TEXT", "EMPTY", "UNMAPPABLE", "ERROR"]
    diagnostic: str | None
    crop_box: Rectangle | None
    media_box: Rectangle | None
    bbox: Rectangle | None
    rotation: int | None
    char_boxes: list[Rectangle | None] = Field(max_length=4000)
    mapping_verified: bool

    @model_validator(mode="after")
    def geometry(self) -> Self:
        if self.mapping_verified and len(self.char_boxes) != len(self.original_text):
            raise ValueError("Original geometry length differs")
        return self


class ImportEvent(StrictModel):
    import_id: Id
    imported_at: str


class PortableRecordBase(StrictModel):
    id: str = Field(min_length=1, max_length=300)
    origin: Literal["LOCAL", "IMPORTED"] = "LOCAL"
    origin_profile_id: str
    origin_notebook_id: str
    snapshot_id: str | None
    access: list[SourceAccess]
    import_id: str | None = None
    imported_at: str | None = None
    original_record_id: str | None = None
    origin_group_id: Hash | None = None
    import_chain: list[ImportEvent] = Field(default_factory=list, max_length=32)

    @model_validator(mode="after")
    def imported_lineage(self) -> Self:
        if self.origin == "IMPORTED" and (self.origin_group_id is None or not self.import_chain):
            raise ValueError("Imported history requires its original group and import chain")
        if self.origin == "LOCAL" and (self.origin_group_id is not None or self.import_chain):
            raise ValueError("Local history cannot claim an import chain")
        return self


class SourceRecord(PortableRecordBase):
    kind: Literal["source"] = "source"
    data: Source


class SnapshotRecord(PortableRecordBase):
    kind: Literal["snapshot"] = "snapshot"
    data: PortableSnapshot


class DocumentVersionRecord(PortableRecordBase):
    kind: Literal["document_version"] = "document_version"
    data: PortableDocumentVersion


class PagePartRecord(PortableRecordBase):
    kind: Literal["page_part"] = "page_part"
    data: PortablePagePart


class EvidenceRecord(PortableRecordBase):
    kind: Literal["evidence"] = "evidence"
    data: Evidence


class FormRecord(PortableRecordBase):
    kind: Literal["form"] = "form"
    data: FormVersion


class ProtocolRecord(PortableRecordBase):
    kind: Literal["protocol"] = "protocol"
    data: ProtocolVersion


class ProposalRecord(PortableRecordBase):
    kind: Literal["proposal"] = "proposal"
    data: ExtractionProposal


class DecisionRecord(PortableRecordBase):
    kind: Literal["decision"] = "decision"
    data: CellDecision


class ScreeningRecord(PortableRecordBase):
    kind: Literal["screening"] = "screening"
    data: ScreeningDecision


class ConversationRunRecord(PortableRecordBase):
    kind: Literal["conversation_run"] = "conversation_run"
    data: RunRecord


class JobHistoryRecord(PortableRecordBase):
    kind: Literal["job"] = "job"
    data: JobRecord


class UnitHistoryRecord(PortableRecordBase):
    kind: Literal["unit"] = "unit"
    data: UnitRecord


class ResearchHistoryRecord(PortableRecordBase):
    kind: Literal["research_run"] = "research_run"
    data: ResearchRun


class ResearchPreviewRecord(PortableRecordBase):
    kind: Literal["research_preview"] = "research_preview"
    data: ResearchPreview


class ArtifactRecord(PortableRecordBase):
    kind: Literal["artifact"] = "artifact"
    data: ArtifactVersion


class ExternalNoteRecord(PortableRecordBase):
    kind: Literal["external_note"] = "external_note"
    data: ExternalNote


class NotePreviewRecord(PortableRecordBase):
    kind: Literal["note_preview"] = "note_preview"
    data: NotePreview


class OutboxHistoryRecord(PortableRecordBase):
    kind: Literal["outbox_history"] = "outbox_history"
    data: ApprovedWriteOutbox


PortableRecord = Annotated[
    SourceRecord
    | SnapshotRecord
    | DocumentVersionRecord
    | PagePartRecord
    | EvidenceRecord
    | FormRecord
    | ProtocolRecord
    | ProposalRecord
    | DecisionRecord
    | ScreeningRecord
    | ConversationRunRecord
    | JobHistoryRecord
    | UnitHistoryRecord
    | ResearchHistoryRecord
    | ResearchPreviewRecord
    | ArtifactRecord
    | ExternalNoteRecord
    | NotePreviewRecord
    | OutboxHistoryRecord,
    Field(discriminator="kind"),
]


class Omission(StrictModel):
    kind: str = Field(max_length=80)
    id: str = Field(max_length=300)
    reason: Literal["CURRENT_ACCESS_UNAVAILABLE", "DEPENDENCY_OMITTED"]


class PortableNotebook(StrictModel):
    schema_version: Literal[1] = 1
    profile_instance_id: str
    notebook_id: str
    snapshot_id: str
    name: str = Field(max_length=200)
    exported_at: str
    records: list[PortableRecord] = Field(max_length=100000)
    omissions: list[Omission] = Field(max_length=100000)
    conventions: Literal["evidra-portable-v1"] = "evidra-portable-v1"

    @model_validator(mode="after")
    def unique_records(self) -> Self:
        keys = [(r.origin_profile_id, r.origin_notebook_id, r.id) for r in self.records]
        if len(keys) != len(set(keys)):
            raise ValueError("Duplicate portable record identity")
        return self


ExportFormat = Literal[
    "json", "markdown", "csv_studies", "csv_results", "backup", "bibtex", "ris", "csl_json"
]


class ExportOptions(StrictModel):
    format: ExportFormat
    excel: bool = False
    include_pdfs: bool = False
    source_ids: list[Hash] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def applicable(self) -> Self:
        if self.excel and not self.format.startswith("csv_"):
            raise ValueError("Excel encoding applies only to CSV")
        if self.include_pdfs and self.format != "backup":
            raise ValueError("PDF inclusion applies only to backup")
        bibliography = self.format in {"bibtex", "ris", "csl_json"}
        if bibliography != bool(self.source_ids) or len(self.source_ids) != len(
            set(self.source_ids)
        ):
            raise ValueError("Bibliography requires an explicit unique study selection")
        return self


class ExportPreview(StrictModel):
    id: Id
    format: ExportFormat
    bytes: int = Field(ge=0)
    pdf_bytes: int = Field(ge=0)
    records: int = Field(ge=0)
    counts: dict[str, int]
    omitted_records: int = Field(ge=0)
    sensitivity: Literal["EXCERPTS_AND_RESEARCH_MAY_BE_SENSITIVE"] = (
        "EXCERPTS_AND_RESEARCH_MAY_BE_SENSITIVE"
    )
    bibliography_scope: Literal["METADATA_ONLY_NO_ABSTRACT_NOTES_OR_ATTACHMENTS"] | None = None
    bibliography: list[Source] = Field(default_factory=list, max_length=100)
    incomplete_sources: list[str] = Field(default_factory=list, max_length=100)


class ExportCreate(Write):
    preview_id: Id


class ExportArtifact(StrictModel):
    id: Id
    filename: str
    media_type: str
    bytes: int = Field(ge=0)
    sha256: Hash


class ExportData(StrictModel):
    offset: int
    total: int
    data_base64: str


class ManifestFile(StrictModel):
    path: str = Field(pattern=r"^(?:notebook\.json|pdfs/[a-f0-9]{64}\.pdf)$")
    bytes: int = Field(ge=0, le=MAX_ARCHIVE_BYTES)
    sha256: Hash
    source_identity: SourceIdentity | None = None
    content_key: str | None = None
    content_version: str | None = None


class BackupManifest(StrictModel):
    schema_version: Literal[1] = 1
    format: Literal["evidra-notebook-backup"] = "evidra-notebook-backup"
    files: list[ManifestFile] = Field(min_length=1, max_length=2001)


class UploadCreate(StrictModel):
    bytes: int = Field(ge=1, le=MAX_ARCHIVE_BYTES)
    sha256: Hash


class UploadPart(StrictModel):
    offset: int = Field(ge=0, le=MAX_ARCHIVE_BYTES)
    data_base64: str = Field(min_length=1, max_length=32000)


class UploadReceipt(StrictModel):
    id: Id
    offset: int
    bytes: int


class ImportPreview(StrictModel):
    id: Id
    name: str
    profile_instance_id: str
    records: int
    pdf_bytes: int
    source_count: int
    mapping_revision: int = 0
    authority: Literal["IMPORTED_HISTORY_ONLY"] = "IMPORTED_HISTORY_ONLY"


class ContentRemap(StrictModel):
    original_key: str = Field(min_length=1, max_length=200)
    target_key: str = Field(min_length=1, max_length=200)
    kind: SourceKind


class SourceRemap(StrictModel):
    original: SourceIdentity
    target: SourceIdentity
    contents: list[ContentRemap] = Field(max_length=1000)


class ImportSourcePage(StrictModel):
    items: list[SourceAccess]
    offset: int
    limit: int
    total: int


class ImportMappingPart(Write):
    original: SourceIdentity
    target: SourceIdentity
    contents: list[ContentRemap] = Field(max_length=50)
    offset: int = Field(ge=0, le=1000)
    final: bool
    expected_revision: int = Field(ge=0)


class ImportMappingState(StrictModel):
    revision: int
    mapped_sources: int
    total_sources: int


class ImportCommit(Write):
    preview_id: Id
    confirmed: Literal[True]
    expected_mapping_revision: int = Field(ge=0)


class ImportedNotebook(StrictModel):
    id: Id
    name: str
    origin_profile_id: str
    origin_notebook_id: str
    imported_at: str
    record_count: int
    origin: Literal["IMPORTED"] = "IMPORTED"
    authority: Literal["HISTORY_ONLY_NO_LOCAL_APPROVAL"] = "HISTORY_ONLY_NO_LOCAL_APPROVAL"


class ImportPage(StrictModel):
    items: list[ImportedNotebook]
    offset: int
    limit: int
    total: int


class ImportedRecordPage(StrictModel):
    items: list[PortableRecord]
    offset: int
    limit: int
    total: int
    omitted_records: int


class ImportVisibility(StrictModel):
    visible: bool
    records: int
    omitted_records: int


class ImportReference(StrictModel):
    kind: Literal["form", "protocol", "proposal", "evidence", "artifact"]
    identity: str = Field(pattern=r"^[a-f0-9]{32,64}$")
    origin_group_id: Hash


class ImportEvidenceReference(StrictModel):
    evidence_id: Hash
    origin_group_id: Hash


class ImportedRecordDetail(StrictModel):
    record: PortableRecord
