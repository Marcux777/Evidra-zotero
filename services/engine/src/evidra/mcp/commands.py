from typing import Annotated, Literal

from pydantic import Field

from evidra.domain.documents import DocumentCommandScope
from evidra.extraction.models import Id, Write
from evidra.mcp.models import ConnectionReceipt, ConnectionWrite, ExternalNoteReview


class McpSetup(ConnectionReceipt):
    executable: str


class McpListCommand(DocumentCommandScope):
    op: Literal["mcp.connections", "mcp.notes"]
    offset: int = Field(ge=0, le=1_000_000)


class McpCreateCommand(DocumentCommandScope):
    op: Literal["mcp.create"]
    request: ConnectionWrite


class McpRevokeCommand(DocumentCommandScope):
    op: Literal["mcp.revoke"]
    connection_id: Id
    request: Write


class McpReviewCommand(DocumentCommandScope):
    op: Literal["mcp.review"]
    version_id: Id
    request: ExternalNoteReview


McpCommand = Annotated[
    McpListCommand | McpCreateCommand | McpRevokeCommand | McpReviewCommand,
    Field(discriminator="op"),
]
