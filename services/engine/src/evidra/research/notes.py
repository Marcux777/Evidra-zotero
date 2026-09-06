from typing import Literal

from pydantic import Field

from evidra.domain.sources import SourceIdentity
from evidra.extraction.models import Id, SourceId, Write
from evidra.providers.models import StrictModel


class NotePreviewWrite(Write):
    artifact_version_id: Id
    source_id: SourceId
    title: str = Field(min_length=1, max_length=200, pattern=r"\S")
    locale: Literal["pt-BR", "en-US"] = "pt-BR"


class NotePreview(StrictModel):
    id: str
    uuid: str
    artifact_version_id: str
    artifact_revision: int
    run_id: str
    source_id: str
    destination: SourceIdentity
    title: str
    html: str
    html_sha256: str
    created_at: str
    native_undo_verified: Literal[False] = False


class NoteApproval(Write):
    preview_id: Id
    expected_artifact_revision: int = Field(ge=1)


class ApprovedWriteOutbox(NotePreview):
    preview_id: str
    state: Literal["APPROVED", "APPLYING", "COMPLETE"]
    author: str
    approved_at: str
    note_key: str | None = None


class OutboxBegin(StrictModel):
    intent: ApprovedWriteOutbox
    may_create: bool


class NoteReadback(Write):
    uuid: str = Field(
        pattern=r"^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
    )
    library_id: int = Field(ge=1)
    parent_key: str = Field(min_length=1, max_length=200)
    note_key: str = Field(pattern=r"^[A-Z0-9]{8}$")
    html_sha256: SourceId
    origin: Literal["ai"]
    tag: Literal["evidra:ai"]


class OutboxPage(StrictModel):
    items: list[ApprovedWriteOutbox]
    offset: int
    limit: int
    total: int
