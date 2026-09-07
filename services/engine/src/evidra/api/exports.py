from fastapi import APIRouter, Query, Request

from evidra.api.documents import services
from evidra.domain.documents import Evidence
from evidra.exports.models import (
    ExportArtifact,
    ExportCreate,
    ExportData,
    ExportOptions,
    ExportPreview,
    ImportCommit,
    ImportedNotebook,
    ImportedRecordDetail,
    ImportedRecordPage,
    ImportMappingPart,
    ImportMappingState,
    ImportPage,
    ImportPreview,
    ImportReference,
    ImportSourcePage,
    ImportVisibility,
    UploadCreate,
    UploadPart,
    UploadReceipt,
)

router = APIRouter(prefix="/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}", tags=["exports"])


@router.post("/exports/previews", response_model=ExportPreview, status_code=201)
def preview(
    notebook_id: str, snapshot_id: str, body: ExportOptions, request: Request
) -> ExportPreview:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.preview(context, body)


@router.post("/exports", response_model=ExportArtifact, status_code=201)
def create(
    notebook_id: str, snapshot_id: str, body: ExportCreate, request: Request
) -> ExportArtifact:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.create(context, body)


@router.post("/exports/{identity}/validate", response_model=ExportPreview)
def validate(notebook_id: str, snapshot_id: str, identity: str, request: Request) -> ExportPreview:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.validate_preview(context, identity)


@router.get("/exports/{identity}/data", response_model=ExportData)
def data(
    notebook_id: str,
    snapshot_id: str,
    identity: str,
    request: Request,
    offset: int = Query(0, ge=0, le=134217728),
) -> ExportData:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.data(context, identity, offset)


@router.post("/transfers/{identity}/discard", response_model=None)
def discard(notebook_id: str, snapshot_id: str, identity: str, request: Request) -> None:
    engine, context = services(request, notebook_id, snapshot_id)
    engine.exports.discard(context, identity)


@router.post("/imports/uploads", response_model=UploadReceipt, status_code=201)
def upload(
    notebook_id: str, snapshot_id: str, body: UploadCreate, request: Request
) -> UploadReceipt:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.upload(context, body)


@router.post("/imports/uploads/{identity}", response_model=UploadReceipt)
def part(
    notebook_id: str, snapshot_id: str, identity: str, body: UploadPart, request: Request
) -> UploadReceipt:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.part(context, identity, body)


@router.post("/imports/uploads/{identity}/inspect", response_model=ImportPreview, status_code=201)
def inspect(notebook_id: str, snapshot_id: str, identity: str, request: Request) -> ImportPreview:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.inspect(context, identity)


@router.post("/imports", response_model=ImportedNotebook, status_code=201)
def restore(
    notebook_id: str, snapshot_id: str, body: ImportCommit, request: Request
) -> ImportedNotebook:
    engine, context = services(request, notebook_id, snapshot_id, commit=True)
    return engine.exports.commit_import(context, body)


@router.get("/imports/uploads/{identity}/sources", response_model=ImportSourcePage)
def original_sources(
    notebook_id: str,
    snapshot_id: str,
    identity: str,
    request: Request,
    offset: int = Query(0, ge=0, le=1000000),
    limit: int = Query(20, ge=20, le=20),
) -> ImportSourcePage:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.import_sources(context, identity, offset)


@router.post("/imports/uploads/{identity}/mappings", response_model=ImportMappingState)
def mapping(
    notebook_id: str, snapshot_id: str, identity: str, body: ImportMappingPart, request: Request
) -> ImportMappingState:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.map_import(context, identity, body)


@router.get("/imports", response_model=ImportPage)
def imports(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0, le=1000000),
    limit: int = Query(20, ge=1, le=20),
) -> ImportPage:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.imports(context, offset, limit)


@router.get("/imports/{identity}/records", response_model=ImportedRecordPage)
def records(
    notebook_id: str,
    snapshot_id: str,
    identity: str,
    request: Request,
    offset: int = Query(0, ge=0, le=1000000),
    limit: int = Query(20, ge=1, le=20),
) -> ImportedRecordPage:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.records(context, identity, offset, limit)


@router.get("/imports/{identity}/status", response_model=ImportVisibility)
def visibility(
    notebook_id: str, snapshot_id: str, identity: str, request: Request
) -> ImportVisibility:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.visibility(context, identity)


@router.post("/imports/{identity}/reference", response_model=ImportedRecordDetail)
def reference(
    notebook_id: str, snapshot_id: str, identity: str, body: ImportReference, request: Request
) -> ImportedRecordDetail:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.reference(context, identity, body)


@router.get("/imports/{identity}/evidence/{evidence_id}", response_model=Evidence)
def evidence(
    notebook_id: str, snapshot_id: str, identity: str, evidence_id: str, request: Request
) -> Evidence:
    engine, context = services(request, notebook_id, snapshot_id)
    return engine.exports.mapped_evidence(context, identity, evidence_id)
