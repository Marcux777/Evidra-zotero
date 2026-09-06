from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from evidra.api.notebooks import router
from evidra.api.sources import router as sources_router
from evidra.domain.errors import STATUS_CODES, ErrorResponse, EvidraError, public_error
from evidra.domain.models import HealthStatus, RuntimeStatus
from evidra.notebooks.service import NotebookService
from evidra.notebooks.snapshots import SnapshotService
from evidra.scope.service import ScopeService
from evidra.security.runtime import BridgeSession, RuntimeSettings, SessionGuard
from evidra.storage.database import Database


@dataclass(frozen=True)
class Services:
    database: Database
    session: BridgeSession
    notebooks: NotebookService
    scopes: ScopeService
    snapshots: SnapshotService


def create_app(settings: RuntimeSettings) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        database = Database(settings.data_dir / "evidra.sqlite3")
        try:
            session = BridgeSession(settings)
            scopes = ScopeService(database, session)
            app.state.services = Services(
                database, session, NotebookService(database, session, settings.profile_instance_id),
                scopes, SnapshotService(scopes)
            )
            yield
        finally:
            database.close()

    app = FastAPI(
        title="Evidra Engine",
        version="0.1.0",
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
        responses={
            code: {"model": ErrorResponse} for code in (401, 403, 404, 409, 413, 422, 500, 503)
        },
    )
    app.add_middleware(SessionGuard, settings=settings)
    app.include_router(router)
    app.include_router(sources_router)

    @app.exception_handler(Exception)
    async def internal_error(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            ErrorResponse(code="INTERNAL_ERROR", message="The operation failed.").model_dump(),
            status_code=500,
        )

    @app.exception_handler(EvidraError)
    async def domain_error(request: Request, exc: EvidraError) -> JSONResponse:
        return JSONResponse(
            public_error(exc).model_dump(), status_code=STATUS_CODES.get(exc.code, 500)
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            ErrorResponse(code="INVALID_REQUEST", message="Invalid request body.").model_dump(),
            status_code=422,
        )

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            ErrorResponse(code="HTTP_ERROR", message="Request cannot be served.").model_dump(),
            status_code=exc.status_code,
        )

    @app.get("/health", response_model=HealthStatus)
    def health() -> HealthStatus:
        return HealthStatus()

    @app.get("/v1/status", response_model=RuntimeStatus)
    def status() -> RuntimeStatus:
        return RuntimeStatus(profile_instance_id=settings.profile_instance_id)

    @app.post("/v1/bridge/heartbeat", response_model=RuntimeStatus)
    def heartbeat() -> RuntimeStatus:
        app.state.services.session.heartbeat()
        return status()

    return app
