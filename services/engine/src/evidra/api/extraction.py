from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.extraction.forms import computing_template
from evidra.extraction.models import (
    BulkApprove,
    BulkPreview,
    BulkPreviewWrite,
    BulkReceipt,
    CellDecision,
    CellQuery,
    DecisionPage,
    DecisionWrite,
    ExtractionProposal,
    FieldDefinition,
    FormPage,
    FormVersion,
    FormWrite,
    MatrixPage,
    MatrixQuery,
    ProposalPage,
    ProposalWrite,
)

router = APIRouter(
    prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["extraction"]
)


@router.get("/forms/template", response_model=list[FieldDefinition])
def template(notebook_id: str, snapshot_id: str, request: Request) -> list[FieldDefinition]:
    service, context = services(request, notebook_id, snapshot_id)
    with service.scopes.guarded(context):
        return computing_template()


@router.get("/forms", response_model=FormPage)
def forms(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(1, ge=1, le=1),
) -> FormPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.forms.list(context, offset, limit)


@router.get("/forms/{form_id}", response_model=FormVersion)
def form(notebook_id: str, snapshot_id: str, form_id: str, request: Request) -> FormVersion:
    service, context = services(request, notebook_id, snapshot_id)
    return service.forms.read(context, form_id)


@router.post("/forms", response_model=FormVersion, status_code=201)
def create_form(
    notebook_id: str, snapshot_id: str, body: FormWrite, request: Request
) -> FormVersion:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.forms.create(context, body)


@router.get("/matrix/{form_id}", response_model=MatrixPage)
def matrix(
    notebook_id: str,
    snapshot_id: str,
    form_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=50),
) -> MatrixPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.matrix.get_matrix(
        context, MatrixQuery(form_version_id=form_id, offset=offset), limit
    )


@router.post("/matrix/query", response_model=MatrixPage)
def matrix_query(
    notebook_id: str, snapshot_id: str, body: MatrixQuery, request: Request
) -> MatrixPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.matrix.get_matrix(context, body)


@router.post("/matrix/proposals/query", response_model=ProposalPage)
def proposals(
    notebook_id: str, snapshot_id: str, body: CellQuery, request: Request
) -> ProposalPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.matrix.history(context, body)


@router.post("/matrix/decisions/query", response_model=DecisionPage)
def decisions(
    notebook_id: str, snapshot_id: str, body: CellQuery, request: Request
) -> DecisionPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.matrix.history(context, body, decisions=True)


@router.post("/matrix/proposals", response_model=ExtractionProposal, status_code=201)
def propose(
    notebook_id: str, snapshot_id: str, body: ProposalWrite, request: Request
) -> ExtractionProposal:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.matrix.propose_extractions(context, body)


@router.post("/matrix/decisions", response_model=CellDecision, status_code=201)
def decide(
    notebook_id: str, snapshot_id: str, body: DecisionWrite, request: Request
) -> CellDecision:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.matrix.decide_cell(context, body)


@router.post("/matrix/bulk-preview", response_model=BulkPreview)
def preview(
    notebook_id: str, snapshot_id: str, body: BulkPreviewWrite, request: Request
) -> BulkPreview:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.matrix.preview(context, body)


@router.post("/matrix/bulk-approve", response_model=BulkReceipt)
def bulk(notebook_id: str, snapshot_id: str, body: BulkApprove, request: Request) -> BulkReceipt:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.matrix.approve_bulk(context, body)
