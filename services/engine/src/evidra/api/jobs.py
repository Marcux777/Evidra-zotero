from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.jobs.models import (
    BatchPreview,
    JobAccessPage,
    JobControl,
    JobPage,
    JobRecord,
    JobWrite,
    UnitPage,
)

router = APIRouter(prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["jobs"])


@router.post("/jobs", response_model=JobRecord, status_code=201)
def prepare(notebook_id: str, snapshot_id: str, body: JobWrite, request: Request) -> JobRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.jobs.prepare(context, body)


@router.get("/jobs", response_model=JobPage)
def listing(
    notebook_id: str, snapshot_id: str, request: Request, offset: int = Query(0, ge=0, le=1_000_000)
) -> JobPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.jobs.list(context, offset)


@router.get("/jobs/{job_id}", response_model=JobRecord)
def read(notebook_id: str, snapshot_id: str, job_id: str, request: Request) -> JobRecord:
    service, context = services(request, notebook_id, snapshot_id)
    return service.jobs.get(context, job_id)


@router.get("/jobs/{job_id}/access", response_model=JobAccessPage)
def access(
    notebook_id: str,
    snapshot_id: str,
    job_id: str,
    request: Request,
    offset: int = Query(0, ge=0, le=1_000_000),
) -> JobAccessPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.jobs.access(context, job_id, offset)


@router.get("/jobs/{job_id}/units", response_model=UnitPage)
def units(
    notebook_id: str,
    snapshot_id: str,
    job_id: str,
    request: Request,
    offset: int = Query(0, ge=0, le=1_000_000),
) -> UnitPage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.jobs.units(context, job_id, offset)


@router.get("/jobs/{job_id}/units/{unit_id}/batches/{batch_index}", response_model=BatchPreview)
def preview(
    notebook_id: str,
    snapshot_id: str,
    job_id: str,
    unit_id: str,
    batch_index: int,
    request: Request,
) -> BatchPreview:
    service, context = services(request, notebook_id, snapshot_id)
    return service.jobs.preview(context, job_id, unit_id, batch_index)


@router.post("/jobs/{job_id}/control", response_model=JobRecord)
async def control(
    notebook_id: str, snapshot_id: str, job_id: str, body: JobControl, request: Request
) -> JobRecord:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    result = service.jobs.control(context, job_id, body)
    if body.action == "resume" and result.state in {"QUEUED", "RUNNING"}:
        service.job_worker.start(context, job_id)
    elif body.action in {"pause", "cancel"}:
        service.job_worker.stop(job_id)
    return result


@router.post("/job-cache/clear", response_model=int)
def clear_cache(notebook_id: str, snapshot_id: str, request: Request) -> int:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.jobs.cache.clear(context)
