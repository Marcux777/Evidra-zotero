from fastapi import APIRouter, Query, Request
from fastapi.responses import Response

from evidra.api.documents import services
from evidra.conversations.models import (
    ConversationCreate,
    ConversationPage,
    ConversationRecord,
    RunPage,
    RunPrepare,
    RunRecord,
    VectorBuild,
    VectorJob,
)

router = APIRouter(
    prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["conversations"]
)


@router.post("/conversations", response_model=ConversationRecord, status_code=201)
def create(
    notebook_id: str, snapshot_id: str, body: ConversationCreate, request: Request
) -> ConversationRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.conversations.create(context, body)


@router.get("/conversations", response_model=ConversationPage)
def listing(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=50),
) -> ConversationPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.conversations.list(context, offset, limit)


@router.get("/conversations/{conversation_id}", response_model=ConversationRecord)
def conversation(
    notebook_id: str, snapshot_id: str, conversation_id: str, request: Request
) -> ConversationRecord:
    service, context = services(request, notebook_id, snapshot_id)
    return service.conversations.conversation(context, conversation_id)


@router.get("/conversations/{conversation_id}/runs", response_model=RunPage)
def history(
    notebook_id: str,
    snapshot_id: str,
    conversation_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=50),
) -> RunPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.conversations.runs(context, conversation_id, offset, limit)


@router.post("/conversations/{conversation_id}/runs", response_model=RunRecord, status_code=201)
async def prepare(
    notebook_id: str, snapshot_id: str, conversation_id: str, body: RunPrepare, request: Request
) -> RunRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return await service.conversations.prepare(context, conversation_id, body)


@router.get("/runs/{run_id}", response_model=RunRecord)
def run(notebook_id: str, snapshot_id: str, run_id: str, request: Request) -> RunRecord:
    service, context = services(request, notebook_id, snapshot_id)
    return service.conversations.read(context, run_id)


@router.post("/runs/{run_id}/start", response_model=RunRecord)
async def start(notebook_id: str, snapshot_id: str, run_id: str, request: Request) -> RunRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.conversations.start(context, run_id)


@router.post("/runs/{run_id}/cancel", response_model=RunRecord)
async def cancel(notebook_id: str, snapshot_id: str, run_id: str, request: Request) -> RunRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.conversations.cancel(context, run_id)


@router.get("/runs/{run_id}/events", response_class=Response)
def events(
    notebook_id: str, snapshot_id: str, run_id: str, request: Request, cursor: int = Query(0, ge=0)
) -> Response:
    service, context = services(request, notebook_id, snapshot_id)
    page = service.conversations.events(context, run_id, cursor)
    # Finite SSE batches make native transport bounded and reconnects explicit/no replayed send.
    return Response(
        f"id: {page.cursor}\nevent: batch\ndata: {page.model_dump_json()}\n\n",
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store"},
    )


@router.post("/vectors", response_model=VectorJob, status_code=202)
async def build(
    notebook_id: str, snapshot_id: str, body: VectorBuild, request: Request
) -> VectorJob:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.vectors.start(context, body)


@router.get("/vectors/{job_id}", response_model=VectorJob)
def vector_job(notebook_id: str, snapshot_id: str, job_id: str, request: Request) -> VectorJob:
    service, context = services(request, notebook_id, snapshot_id)
    return service.vectors.read(context, job_id)


@router.post("/vectors/{job_id}/cancel", response_model=VectorJob)
async def cancel_vector(
    notebook_id: str, snapshot_id: str, job_id: str, request: Request
) -> VectorJob:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.vectors.read(context, job_id, cancel=True)
