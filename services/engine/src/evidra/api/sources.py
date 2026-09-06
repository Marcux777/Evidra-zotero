from fastapi import APIRouter, Query, Request

from evidra.domain.sources import (
    IdentityPage,
    Invalidation,
    InvalidationResult,
    PreviewPage,
    PreviewRequest,
    Revocation,
    Snapshot,
    SnapshotCreate,
    SnapshotPage,
    SnapshotSourcePage,
    SourceChange,
    SourcePage,
    SourceSync,
)
from evidra.notebooks.snapshots import SnapshotService
from evidra.scope.service import Principal

router = APIRouter(prefix="/v1", tags=["sources"])


def services(request: Request) -> tuple[SnapshotService, Principal]:
    # SessionGuard authenticated this request. No body/header chooses its principal.
    return request.app.state.services.snapshots, request.app.state.services.scopes.principal


@router.post("/notebooks/{notebook_id}/sources/sync", response_model=SourcePage)
def sync_sources(notebook_id: str, body: SourceSync, request: Request) -> SourcePage:
    service, principal = services(request)
    return service.sync_sources(principal, notebook_id, body)


@router.post("/sources/invalidate", response_model=InvalidationResult)
def invalidate_sources(body: Invalidation, request: Request) -> InvalidationResult:
    service, principal = services(request)
    return service.invalidate(principal, body)


@router.post("/notebooks/{notebook_id}/sources/preview", response_model=PreviewPage)
def preview_selection(notebook_id: str, body: PreviewRequest, request: Request) -> PreviewPage:
    service, principal = services(request)
    return service.preview_selection(principal, notebook_id, body)


@router.get("/notebooks/{notebook_id}/sources/previews/{preview_id}", response_model=PreviewPage)
def read_preview(
    notebook_id: str,
    preview_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> PreviewPage:
    service, principal = services(request)
    return service.read_preview(principal, notebook_id, preview_id, offset, limit)


@router.post("/notebooks/{notebook_id}/snapshots", response_model=Snapshot, status_code=201)
def create_snapshot(notebook_id: str, body: SnapshotCreate, request: Request) -> Snapshot:
    service, principal = services(request)
    return service.create_snapshot(principal, notebook_id, body)


@router.get("/notebooks/{notebook_id}/snapshots", response_model=SnapshotPage)
def list_snapshots(
    notebook_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> SnapshotPage:
    service, principal = services(request)
    return service.list(principal, notebook_id, offset, limit)


@router.get(
    "/notebooks/{notebook_id}/snapshots/{snapshot_id}/sources", response_model=SnapshotSourcePage
)
def read_sources(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> SnapshotSourcePage:
    service, principal = services(request)
    return service.read_sources(principal, notebook_id, snapshot_id, offset, limit)


@router.get(
    "/notebooks/{notebook_id}/snapshots/{snapshot_id}/identities", response_model=IdentityPage
)
def source_identities(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> IdentityPage:
    service, principal = services(request)
    return service.identities(principal, notebook_id, snapshot_id, offset, limit)


@router.post("/notebooks/{notebook_id}/sources/{source_id}/revoke", response_model=SourceChange)
def revoke_source(
    notebook_id: str, source_id: str, body: Revocation, request: Request
) -> SourceChange:
    service, principal = services(request)
    service.scopes.authorize(principal, "manage")
    return SourceChange(
        revision=service.scopes.revoke_access(
            source_id, notebook_id=notebook_id, expected_revision=body.expected_revision
        )
    )
