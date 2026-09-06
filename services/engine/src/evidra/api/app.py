from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from evidra.api.conversations import router as conversations_router
from evidra.api.documents import router as documents_router
from evidra.api.extraction import router as extraction_router
from evidra.api.jobs import router as jobs_router
from evidra.api.notebooks import router
from evidra.api.providers import router as providers_router
from evidra.api.research import router as research_router
from evidra.api.sources import router as sources_router
from evidra.conversations.service import ConversationService
from evidra.documents.ingestion import IngestionService
from evidra.documents.registry import DocumentRegistry
from evidra.documents.text import TextIngestion
from evidra.domain.errors import STATUS_CODES, ErrorResponse, EvidraError, public_error
from evidra.domain.models import HealthStatus, RuntimeStatus
from evidra.evidence.service import EvidenceService
from evidra.extraction.forms import FormService
from evidra.extraction.matrix import MatrixService
from evidra.extraction.runner import ExtractionRunner
from evidra.jobs.queue import JobQueue
from evidra.jobs.worker import JobWorker
from evidra.notebooks.protocol import ProtocolService
from evidra.notebooks.service import NotebookService
from evidra.notebooks.snapshots import SnapshotService
from evidra.providers.registry import ProviderRegistry
from evidra.retrieval.lexical import LexicalSearch
from evidra.retrieval.vectors import VectorSearch
from evidra.scope.service import ScopeService
from evidra.screening.service import ScreeningService
from evidra.security.runtime import BridgeSession, RuntimeSettings, SessionGuard
from evidra.storage.database import Database


@dataclass(frozen=True)
class Services:
    database: Database
    session: BridgeSession
    notebooks: NotebookService
    scopes: ScopeService
    snapshots: SnapshotService
    registry: DocumentRegistry
    ingestion: IngestionService
    evidence: EvidenceService
    lexical: LexicalSearch
    text: TextIngestion
    providers: ProviderRegistry
    vectors: VectorSearch
    conversations: ConversationService
    forms: FormService
    matrix: MatrixService
    jobs: JobQueue
    job_worker: JobWorker
    protocols: ProtocolService
    screening: ScreeningService


def create_app(settings: RuntimeSettings) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        database = Database(settings.data_dir / "evidra.sqlite3")
        ingestion = None
        providers = None
        conversations = None
        vectors = None
        job_worker = None
        try:
            session = BridgeSession(settings)
            scopes = ScopeService(database, session)
            registry = DocumentRegistry(scopes)
            ingestion = IngestionService(registry)
            evidence = EvidenceService(registry)
            providers = ProviderRegistry(scopes)
            lexical = LexicalSearch(evidence)
            vectors = VectorSearch(evidence, providers)
            conversations = ConversationService(lexical, vectors, providers, ingestion)
            forms = FormService(scopes)
            matrix = MatrixService(forms, evidence, conversations)
            jobs = JobQueue(ExtractionRunner(matrix, lexical), providers)
            job_worker = JobWorker(jobs)
            protocols = ProtocolService(forms)
            app.state.services = Services(
                database,
                session,
                NotebookService(database, session, settings.profile_instance_id),
                scopes,
                SnapshotService(scopes),
                registry,
                ingestion,
                evidence,
                lexical,
                TextIngestion(registry),
                providers,
                vectors,
                conversations,
                forms,
                matrix,
                jobs,
                job_worker,
                protocols,
                ScreeningService(protocols),
            )
            yield
        finally:
            if job_worker is not None:
                await job_worker.close()
            if conversations is not None:
                await conversations.close()
            if vectors is not None:
                await vectors.close()
            try:
                if ingestion is not None:
                    ingestion.close()
            finally:
                try:
                    if providers is not None:
                        await providers.close()
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
    app.include_router(documents_router)
    app.include_router(providers_router)
    app.include_router(conversations_router)
    app.include_router(extraction_router)
    app.include_router(jobs_router)
    app.include_router(research_router)

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
