from typing import TYPE_CHECKING

from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.domain.documents import Evidence, SearchPage, SearchRequest
from evidra.domain.sources import SnapshotSourcePage
from evidra.extraction.models import ExtractionProposal, FormVersion, MatrixPage, MatrixQuery, Write
from evidra.mcp.models import (
    ConnectionCreate,
    ConnectionPage,
    ConnectionReceipt,
    ConnectionRecord,
    EmptyArgs,
    ExternalExtraction,
    ExternalNote,
    ExternalNotePage,
    ExternalNoteReview,
    ExternalNoteWrite,
    ReadArgs,
    SourceArgs,
)
from evidra.providers.models import StrictModel
from evidra.research.models import ProtocolVersion
from evidra.scope.service import ScopeContext

if TYPE_CHECKING:
    from evidra.api.app import Services


def engine(request: Request) -> "Services":
    service: Services = request.app.state.services
    return service


router = APIRouter(tags=["mcp"])
BASE = "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/mcp"
GATEWAY = "/v1/mcp/gateway"


class McpNotebookStatus(StrictModel):
    notebook_id: str
    snapshot_id: str
    name: str
    revision: int
    available_sources: int
    snapshot_members: int
    capabilities: list[str]
    evidence_max_characters: int = 4000
    request_max_bytes: int = 65536


class McpProtocol(StrictModel):
    protocol: ProtocolVersion | None
    form: FormVersion | None


@router.post(BASE + "/connections", response_model=ConnectionReceipt, status_code=201)
def create(
    notebook_id: str, snapshot_id: str, body: ConnectionCreate, request: Request
) -> ConnectionReceipt:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.mcp.create(context, body)


@router.get(BASE + "/connections", response_model=ConnectionPage)
def connections(
    notebook_id: str, snapshot_id: str, request: Request, offset: int = Query(0, ge=0, le=1_000_000)
) -> ConnectionPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.mcp.list(context, offset)


@router.post(BASE + "/connections/{identity}/revoke", response_model=ConnectionRecord)
def revoke(
    notebook_id: str, snapshot_id: str, identity: str, body: Write, request: Request
) -> ConnectionRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.mcp.revoke(context, identity)


@router.get(BASE + "/notes", response_model=ExternalNotePage)
def notes(
    notebook_id: str, snapshot_id: str, request: Request, offset: int = Query(0, ge=0, le=1_000_000)
) -> ExternalNotePage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.external_notes.list(context, offset)


@router.post(BASE + "/notes/{identity}/review", response_model=ExternalNote)
def review(
    notebook_id: str, snapshot_id: str, identity: str, body: ExternalNoteReview, request: Request
) -> ExternalNote:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.external_notes.review(context, identity, body)


def context_for(request: Request, commit: bool = False) -> ScopeContext:
    principal = request.state.mcp_principal
    return engine(request).scopes.resolve(
        principal, principal.notebook_id, principal.snapshot_id, "commit" if commit else "read"
    )


@router.post(GATEWAY + "/get_notebook_status", response_model=McpNotebookStatus)
def status(body: EmptyArgs, request: Request) -> McpNotebookStatus:
    context = context_for(request)
    scopes = engine(request).scopes
    with scopes.guarded(context) as conn:
        notebook = scopes.notebook(conn, context.principal, context.notebook_id)
        count = conn.execute(
            "SELECT count(*) FROM snapshot_members WHERE snapshot_id=?", (context.snapshot_id,)
        ).fetchone()[0]
        return McpNotebookStatus(
            notebook_id=context.notebook_id,
            snapshot_id=context.snapshot_id,
            name=notebook["name"],
            revision=notebook["revision"],
            available_sources=len(context.source_ids),
            snapshot_members=count,
            capabilities=[
                "read",
                *(["propose"] if "commit" in context.principal.capabilities else []),
            ],
        )


@router.post(GATEWAY + "/list_sources", response_model=SnapshotSourcePage)
def sources(body: SourceArgs, request: Request) -> SnapshotSourcePage:
    context = context_for(request)
    return engine(request).snapshots.read_sources(
        context.principal, context.notebook_id, context.snapshot_id, body.offset, body.limit
    )


@router.post(GATEWAY + "/search_evidence", response_model=SearchPage)
def search(body: SearchRequest, request: Request) -> SearchPage:
    return engine(request).lexical.search(context_for(request), body)


@router.post(GATEWAY + "/read_evidence", response_model=Evidence)
def read(body: ReadArgs, request: Request) -> Evidence:
    return engine(request).evidence.read(context_for(request), body.evidence_id)


@router.post(GATEWAY + "/get_protocol", response_model=McpProtocol)
def protocol(body: EmptyArgs, request: Request) -> McpProtocol:
    context = context_for(request)
    service = engine(request)
    active = service.protocols.list(context, 0, 1).items
    if active:
        return McpProtocol(
            protocol=active[0], form=service.forms.read(context, active[0].form_version_id)
        )
    forms = service.forms.list(context, 0, 1).items
    return McpProtocol(protocol=None, form=forms[0] if forms else None)


@router.post(GATEWAY + "/get_matrix", response_model=MatrixPage)
def matrix(body: MatrixQuery, request: Request) -> MatrixPage:
    return engine(request).matrix.get_matrix(context_for(request), body)


@router.post(GATEWAY + "/propose_extractions", response_model=ExtractionProposal)
def extractions(body: ExternalExtraction, request: Request) -> ExtractionProposal:
    return engine(request).matrix.propose_extractions(
        context_for(request, True), body.proposal, declared_model=body.declared_model
    )


@router.post(GATEWAY + "/propose_note", response_model=ExternalNote)
def note(body: ExternalNoteWrite, request: Request) -> ExternalNote:
    return engine(request).external_notes.propose(context_for(request, True), body)
