from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.research.models import (
    ProtocolPage,
    ProtocolVersion,
    ProtocolWrite,
    ScreeningDecision,
    ScreeningPage,
    ScreeningWrite,
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
