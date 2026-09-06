from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.extraction.models import Write
from evidra.research.execution import (
    ArtifactPage,
    ArtifactReview,
    ArtifactVersion,
    ResearchAccessPage,
    ResearchControl,
    ResearchPrepare,
    ResearchPreview,
    ResearchRun,
    ResearchRunPage,
)
from evidra.research.models import (
    ProtocolPage,
    ProtocolVersion,
    ProtocolWrite,
    ScreeningDecision,
    ScreeningPage,
    ScreeningWrite,
)
from evidra.research.notes import (
    ApprovedWriteOutbox,
    NoteApproval,
    NotePreview,
    NotePreviewWrite,
    NoteReadback,
    OutboxBegin,
    OutboxPage,
)

router = APIRouter(prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["research"])


@router.post("/protocols", response_model=ProtocolVersion, status_code=201)
def create_protocol(
    notebook_id: str, snapshot_id: str, body: ProtocolWrite, request: Request
) -> ProtocolVersion:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.protocols.create(context, body)


@router.get("/protocols", response_model=ProtocolPage)
def protocols(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(1, ge=1, le=1),
) -> ProtocolPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.protocols.list(context, offset, limit)


@router.get("/protocols/{protocol_id}", response_model=ProtocolVersion)
def protocol(
    notebook_id: str, snapshot_id: str, protocol_id: str, request: Request
) -> ProtocolVersion:
    service, context = services(request, notebook_id, snapshot_id)
    return service.protocols.read(context, protocol_id)


@router.post("/screening/decisions", response_model=ScreeningDecision, status_code=201)
def decide(
    notebook_id: str, snapshot_id: str, body: ScreeningWrite, request: Request
) -> ScreeningDecision:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.screening.decide(context, body)


@router.get("/screening/{protocol_id}", response_model=ScreeningPage)
def screening(
    notebook_id: str,
    snapshot_id: str,
    protocol_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=20),
) -> ScreeningPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.screening.list(context, protocol_id, offset, limit)


@router.post("/research/runs", response_model=ResearchRun, status_code=201)
def prepare_run(
    notebook_id: str, snapshot_id: str, body: ResearchPrepare, request: Request
) -> ResearchRun:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.research.prepare(context, body)


@router.get("/research/runs", response_model=ResearchRunPage)
def research_runs(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=20),
) -> ResearchRunPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.list(context, offset, limit)


@router.get("/research/runs/{run_id}", response_model=ResearchRun)
def research_run(notebook_id: str, snapshot_id: str, run_id: str, request: Request) -> ResearchRun:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.read(context, run_id)


@router.get("/research/runs/{run_id}/preview", response_model=ResearchPreview)
def research_preview(
    notebook_id: str, snapshot_id: str, run_id: str, request: Request
) -> ResearchPreview:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.preview(context, run_id)


@router.get("/research/runs/{run_id}/access", response_model=ResearchAccessPage)
def research_access(
    notebook_id: str,
    snapshot_id: str,
    run_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=20),
) -> ResearchAccessPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.access(context, run_id, offset, limit)


@router.post("/research/runs/{run_id}/control", response_model=ResearchRun)
async def research_control(
    notebook_id: str, snapshot_id: str, run_id: str, body: ResearchControl, request: Request
) -> ResearchRun:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.research.control(context, run_id, body)


@router.get("/artifacts/{version_id}", response_model=ArtifactVersion)
def artifact(
    notebook_id: str, snapshot_id: str, version_id: str, request: Request
) -> ArtifactVersion:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.artifact(context, version_id)


@router.get("/artifacts/{version_id}/versions", response_model=ArtifactPage)
def artifact_versions(
    notebook_id: str,
    snapshot_id: str,
    version_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(1, ge=1, le=1),
) -> ArtifactPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.research.versions(context, version_id, offset, limit)


@router.post("/artifacts/{version_id}/review", response_model=ArtifactVersion, status_code=201)
def artifact_review(
    notebook_id: str, snapshot_id: str, version_id: str, body: ArtifactReview, request: Request
) -> ArtifactVersion:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.research.review(context, version_id, body)


@router.post("/notes/previews", response_model=NotePreview, status_code=201)
def note_preview(
    notebook_id: str, snapshot_id: str, body: NotePreviewWrite, request: Request
) -> NotePreview:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.outbox.preview(context, body)


@router.post("/notes/approve", response_model=ApprovedWriteOutbox, status_code=201)
def note_approve(
    notebook_id: str, snapshot_id: str, body: NoteApproval, request: Request
) -> ApprovedWriteOutbox:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.outbox.approve(context, body)


@router.get("/notes/outbox", response_model=OutboxPage)
def note_outbox(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(1, ge=1, le=1),
) -> OutboxPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.outbox.list(context, offset, limit)


@router.get("/notes/outbox/{intent_id}", response_model=ApprovedWriteOutbox)
def note_intent(
    notebook_id: str, snapshot_id: str, intent_id: str, request: Request
) -> ApprovedWriteOutbox:
    service, context = services(request, notebook_id, snapshot_id)
    return service.outbox.read(context, intent_id)


@router.post("/notes/outbox/{intent_id}/begin", response_model=OutboxBegin)
def note_begin(
    notebook_id: str, snapshot_id: str, intent_id: str, body: Write, request: Request
) -> OutboxBegin:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.outbox.begin(context, intent_id, body)


@router.post("/notes/outbox/{intent_id}/ack", response_model=ApprovedWriteOutbox)
def note_ack(
    notebook_id: str, snapshot_id: str, intent_id: str, body: NoteReadback, request: Request
) -> ApprovedWriteOutbox:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.outbox.ack(context, intent_id, body)
