from typing import Annotated, Literal

from pydantic import Field

from evidra.domain.documents import DocumentCommandScope
from evidra.exports.models import (
    ExportCreate,
    ExportOptions,
    ImportCommit,
    ImportMappingPart,
    ImportReference,
)
from evidra.extraction.models import Id, SourceId


class ExportPreviewCommand(DocumentCommandScope):
    op: Literal["exports.preview"]
    request: ExportOptions


class ExportCreateCommand(DocumentCommandScope):
    op: Literal["exports.create"]
    request: ExportCreate


class ExportSaveCommand(DocumentCommandScope):
    op: Literal["exports.save"]
    artifact_id: Id


class TransferDiscardCommand(DocumentCommandScope):
    op: Literal["exports.discard"]
    transfer_id: Id


class ImportChooseCommand(DocumentCommandScope):
    op: Literal["imports.choose"]


class ImportCommitCommand(DocumentCommandScope):
    op: Literal["imports.commit"]
    request: ImportCommit


class ImportSourcesCommand(DocumentCommandScope):
    op: Literal["imports.sources"]
    preview_id: Id
    offset: int = Field(ge=0, le=1000000)


class ImportMapCommand(DocumentCommandScope):
    op: Literal["imports.map"]
    preview_id: Id
    request: ImportMappingPart


class ImportListCommand(DocumentCommandScope):
    op: Literal["imports.list"]
    offset: int = Field(ge=0, le=1000000)


class ImportRecordsCommand(DocumentCommandScope):
    op: Literal["imports.records"]
    import_id: Id
    offset: int = Field(ge=0, le=1000000)


class ImportOpenCommand(DocumentCommandScope):
    op: Literal["imports.open"]
    import_id: Id
    evidence_id: SourceId


class ImportStatusCommand(DocumentCommandScope):
    op: Literal["imports.status"]
    import_id: Id


class ImportReferenceCommand(DocumentCommandScope):
    op: Literal["imports.reference"]
    import_id: Id
    request: ImportReference


ExportCommand = Annotated[
    ExportPreviewCommand
    | ExportCreateCommand
    | ExportSaveCommand
    | TransferDiscardCommand
    | ImportChooseCommand
    | ImportCommitCommand
    | ImportListCommand
    | ImportRecordsCommand
    | ImportOpenCommand
    | ImportSourcesCommand
    | ImportMapCommand
    | ImportStatusCommand
    | ImportReferenceCommand,
    Field(discriminator="op"),
]
