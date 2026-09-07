from typing import TYPE_CHECKING, cast

from fastapi import APIRouter, Query, Request

from evidra.domain.documents import (
    AttachmentRegister,
    DocumentPage,
    DocumentTargetRequest,
    Evidence,
    EvidenceFileCheck,
    EvidenceTextRequest,
    EvidenceTextView,
    IngestRequest,
    Operation,
    OriginalViewChunk,
    OriginalViewRequest,
    PagePreview,
    PagePreviewRequest,
    RegisteredDocument,
    SearchPage,
    SearchRequest,
    TextPart,
    TextRegister,
    TextStage,
)
from evidra.scope.service import ScopeContext

if TYPE_CHECKING:
    from evidra.api.app import Services

router = APIRouter(prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["documents"])


def services(
    request: Request, notebook_id: str, snapshot_id: str, *, commit: bool = False
) -> tuple["Services", ScopeContext]:
    service = cast("Services", request.app.state.services)
    context = service.scopes.resolve(
        service.scopes.principal, notebook_id, snapshot_id, "commit" if commit else "read"
    )
    return service, context


@router.post("/documents/register", response_model=RegisteredDocument, status_code=201)
def register_attachment(
    notebook_id: str, snapshot_id: str, body: AttachmentRegister, request: Request
) -> RegisteredDocument:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.registry.register_attachment(context, body)


@router.post("/documents/missing", response_model=RegisteredDocument)
def missing_attachment(
    notebook_id: str, snapshot_id: str, body: DocumentTargetRequest, request: Request
) -> RegisteredDocument:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.registry.missing(context, body)


@router.get("/documents", response_model=DocumentPage)
def list_documents(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> DocumentPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.evidence.documents(context, offset, limit)


@router.post("/documents/ingest", response_model=Operation, status_code=202)
def ingest_document(
    notebook_id: str, snapshot_id: str, body: IngestRequest, request: Request
) -> Operation:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.ingestion.start(context, body)


@router.get("/operations/{operation_id}", response_model=Operation)
def read_operation(
    notebook_id: str, snapshot_id: str, operation_id: str, request: Request
) -> Operation:
    service, context = services(request, notebook_id, snapshot_id)
    return service.ingestion.read(context, operation_id)


@router.post("/operations/{operation_id}/cancel", response_model=Operation)
def cancel_operation(
    notebook_id: str, snapshot_id: str, operation_id: str, request: Request
) -> Operation:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.ingestion.cancel(context, operation_id)


@router.get("/evidence/{evidence_id}", response_model=Evidence)
def read_evidence(
    notebook_id: str, snapshot_id: str, evidence_id: str, request: Request
) -> Evidence:
    service, context = services(request, notebook_id, snapshot_id)
    return service.evidence.read(context, evidence_id)


@router.post("/documents/verify", response_model=Evidence)
def verify_evidence_file(
    notebook_id: str, snapshot_id: str, body: EvidenceFileCheck, request: Request
) -> Evidence:
    service, context = services(request, notebook_id, snapshot_id)
    return service.evidence.verify_file(context, body)


@router.post("/documents/text-view", response_model=EvidenceTextView)
def read_original_attachment_text(
    notebook_id: str, snapshot_id: str, body: EvidenceTextRequest, request: Request
) -> EvidenceTextView:
    service, context = services(request, notebook_id, snapshot_id)
    return service.evidence.text_view(context, body)


@router.post("/documents/original-view", response_model=OriginalViewChunk)
def read_original_attachment(
    notebook_id: str, snapshot_id: str, body: OriginalViewRequest, request: Request
) -> OriginalViewChunk:
    service, context = services(request, notebook_id, snapshot_id)
    return service.evidence.original_view(context, body)


@router.post("/search", response_model=SearchPage)
def search(notebook_id: str, snapshot_id: str, body: SearchRequest, request: Request) -> SearchPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.lexical.search(context, body)


@router.post("/documents/text", response_model=TextStage, status_code=201)
def stage_text(
    notebook_id: str, snapshot_id: str, body: TextRegister, request: Request
) -> TextStage:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.text.start(context, body)


@router.post("/documents/text/{stage_id}", response_model=TextStage)
def append_text(
    notebook_id: str, snapshot_id: str, stage_id: str, body: TextPart, request: Request
) -> TextStage:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.text.append(context, stage_id, body)


@router.post("/documents/preview", response_model=Operation, status_code=202)
def render_preview(
    notebook_id: str, snapshot_id: str, body: PagePreviewRequest, request: Request
) -> Operation:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.ingestion.start_preview(context, body)


@router.get("/operations/{operation_id}/preview", response_model=PagePreview)
def read_preview(
    notebook_id: str, snapshot_id: str, operation_id: str, request: Request
) -> PagePreview:
    service, context = services(request, notebook_id, snapshot_id)
    return service.ingestion.preview(context, operation_id)
