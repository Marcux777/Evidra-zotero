from typing import Literal

from pydantic import BaseModel, Field, SecretStr, field_validator

from evidra.domain.documents import Evidence, SearchRequest
from evidra.extraction.models import MatrixQuery, ProposalWrite, SourceId, Write
from evidra.providers.models import StrictModel


class ConnectionWrite(Write):
    label: str = Field(min_length=1, max_length=100, pattern=r"\S")
    allow_proposals: bool = False
    expires_in_seconds: int = Field(ge=60, le=86400, default=3600)


class ConnectionCreate(ConnectionWrite):
    token: SecretStr

    @field_validator("token")
    @classmethod
    def token_shape(cls, value: SecretStr) -> SecretStr:
        import re

        if not re.fullmatch(r"[a-f0-9]{64}", value.get_secret_value()):
            raise ValueError("A distinct 256-bit credential is required")
        return value


class ConnectionRecord(StrictModel):
    id: str
    label: str
    notebook_id: str
    snapshot_id: str
    allow_proposals: bool
    created_at: str
    expires_at: str
    revoked_at: str | None
    last_used_at: str | None
    state: Literal["ACTIVE", "EXPIRED", "REVOKED", "SESSION_CLOSED"]


class ConnectionReceipt(StrictModel):
    connection: ConnectionRecord
    connection_file: str


class ConnectionPage(StrictModel):
    items: list[ConnectionRecord]
    offset: int
    limit: int
    total: int


class EmptyArgs(StrictModel):
    pass


class SourceArgs(StrictModel):
    offset: int = Field(default=0, ge=0, le=1_000_000)
    limit: int = Field(default=20, ge=1, le=20)


class ReadArgs(StrictModel):
    evidence_id: SourceId


class ExternalProposalWrite(ProposalWrite):
    run_id: None = None


class ExternalExtraction(StrictModel):
    proposal: ExternalProposalWrite
    declared_model: str | None = Field(default=None, min_length=1, max_length=200)


class ExternalNoteWrite(Write):
    text: str = Field(min_length=1, max_length=12000, pattern=r"\S")
    evidence_ids: list[SourceId] = Field(min_length=1, max_length=12)
    declared_model: str | None = Field(default=None, min_length=1, max_length=200)


class ExternalNote(StrictModel):
    id: str
    artifact_id: str
    revision: int
    previous_version_id: str | None
    run_id: None = None
    text: str
    evidence: list[Evidence]
    origin: Literal["EXTERNAL_CLIENT"] = "EXTERNAL_CLIENT"
    connection_id: str
    declared_model: str | None
    model_validation: Literal["CLIENT_DECLARED_UNVERIFIED"] = "CLIENT_DECLARED_UNVERIFIED"
    review_state: Literal["UNREVIEWED", "APPROVED", "REJECTED"] = "UNREVIEWED"
    rationale: str | None = None
    author: str
    created_at: str


class ExternalNoteReview(Write):
    expected_revision: int = Field(ge=1)
    action: Literal["APPROVED", "REJECTED"]
    rationale: str = Field(min_length=1, max_length=2000, pattern=r"\S")


class ExternalNotePage(StrictModel):
    items: list[ExternalNote]
    offset: int
    limit: int
    total: int


TOOL_INPUTS: dict[str, type[BaseModel]] = {
    "get_notebook_status": SourceArgs,
    "list_sources": SourceArgs,
    "search_evidence": SearchRequest,
    "read_evidence": ReadArgs,
    "get_protocol": EmptyArgs,
    "get_matrix": MatrixQuery,
    "propose_extractions": ExternalExtraction,
    "propose_note": ExternalNoteWrite,
}
