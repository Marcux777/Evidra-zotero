from typing import Annotated, Literal

from pydantic import Field

from evidra.domain.documents import DocumentCommandScope
from evidra.extraction.models import Id, Write
from evidra.research.execution import ArtifactReview, ResearchControl, ResearchPrepare
from evidra.research.models import ProtocolWrite, ScreeningWrite
from evidra.research.notes import NoteApproval, NotePreviewWrite


class ResearchListCommand(DocumentCommandScope):
    op: Literal["research.protocols", "research.runs", "research.notes.list"]
    offset: int = Field(ge=0, le=1_000_000)


class ProtocolWriteCommand(DocumentCommandScope):
    op: Literal["research.protocol.write"]
    request: ProtocolWrite


class ProtocolReadCommand(DocumentCommandScope):
    op: Literal["research.protocol.read"]
    protocol_id: Id


class ScreeningReadCommand(DocumentCommandScope):
    op: Literal["research.screening"]
    protocol_id: Id
    offset: int = Field(ge=0, le=1_000_000)


class ScreeningWriteCommand(DocumentCommandScope):
    op: Literal["research.screening.decide"]
    request: ScreeningWrite


class ResearchPrepareCommand(DocumentCommandScope):
    op: Literal["research.prepare"]
    request: ResearchPrepare


class ResearchRunCommand(DocumentCommandScope):
    op: Literal["research.run", "research.preview"]
    run_id: Id


class ResearchControlCommand(DocumentCommandScope):
    op: Literal["research.control"]
    run_id: Id
    request: ResearchControl


class ArtifactReadCommand(DocumentCommandScope):
    op: Literal["research.artifact"]
    version_id: Id


class ArtifactVersionsCommand(DocumentCommandScope):
    op: Literal["research.versions"]
    version_id: Id
    offset: int = Field(ge=0, le=1_000_000)


class ArtifactReviewCommand(DocumentCommandScope):
    op: Literal["research.review"]
    version_id: Id
    request: ArtifactReview


class NotePreviewCommand(DocumentCommandScope):
    op: Literal["research.notes.preview"]
    request: NotePreviewWrite


class NoteApproveCommand(DocumentCommandScope):
    op: Literal["research.notes.approve"]
    request: NoteApproval


class NoteReadCommand(DocumentCommandScope):
    op: Literal["research.notes.read"]
    intent_id: Id


class NotePublishCommand(DocumentCommandScope):
    op: Literal["research.notes.publish"]
    intent_id: Id
    request: Write


# No renderer command exposes begin/ack, HTML, native paths or arbitrary note IDs.
ResearchCommand = Annotated[
    ResearchListCommand
    | ProtocolWriteCommand
    | ProtocolReadCommand
    | ScreeningReadCommand
    | ScreeningWriteCommand
    | ResearchPrepareCommand
    | ResearchRunCommand
    | ResearchControlCommand
    | ArtifactReadCommand
    | ArtifactVersionsCommand
    | ArtifactReviewCommand
    | NotePreviewCommand
    | NoteApproveCommand
    | NoteReadCommand
    | NotePublishCommand,
    Field(discriminator="op"),
]
