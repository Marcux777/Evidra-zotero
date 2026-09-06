from typing import Annotated, Literal

from pydantic import Field

from evidra.domain.documents import DocumentCommandScope
from evidra.extraction.models import (
    BulkApprove,
    BulkPreviewWrite,
    CellQuery,
    DecisionWrite,
    FormWrite,
    MatrixQuery,
    ProposalWrite,
)


class FormListCommand(DocumentCommandScope):
    op: Literal["matrix.forms"]
    offset: int = Field(ge=0, le=1_000_000)


class FormTemplateCommand(DocumentCommandScope):
    op: Literal["matrix.template"]


class FormWriteCommand(DocumentCommandScope):
    op: Literal["matrix.form.write"]
    request: FormWrite


class MatrixQueryCommand(DocumentCommandScope):
    op: Literal["matrix.query"]
    request: MatrixQuery


class MatrixHistoryCommand(DocumentCommandScope):
    op: Literal["matrix.proposals", "matrix.history"]
    request: CellQuery


class MatrixProposeCommand(DocumentCommandScope):
    op: Literal["matrix.propose"]
    request: ProposalWrite


class MatrixDecideCommand(DocumentCommandScope):
    op: Literal["matrix.decide"]
    request: DecisionWrite


class MatrixPreviewCommand(DocumentCommandScope):
    op: Literal["matrix.preview"]
    request: BulkPreviewWrite


class MatrixApproveCommand(DocumentCommandScope):
    op: Literal["matrix.approve"]
    request: BulkApprove


MatrixCommand = Annotated[
    FormListCommand
    | FormTemplateCommand
    | FormWriteCommand
    | MatrixQueryCommand
    | MatrixHistoryCommand
    | MatrixProposeCommand
    | MatrixDecideCommand
    | MatrixPreviewCommand
    | MatrixApproveCommand,
    Field(discriminator="op"),
]
