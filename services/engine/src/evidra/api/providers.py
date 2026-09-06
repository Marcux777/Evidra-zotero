"""Privileged typed configuration; generation is an internal scoped Task6 consumer."""

from typing import TYPE_CHECKING, Annotated, cast

from fastapi import APIRouter, Path, Query, Request

from evidra.api.documents import services
from evidra.providers.models import (
    ModelPage,
    PriceConfig,
    ProfilePage,
    ProfileWrite,
    ProviderProfile,
)
from evidra.providers.profiles import Consent, ConsentWrite, ResumeWrite, Settings, SettingsWrite
from evidra.providers.registry import ProviderRegistry
from evidra.providers.usage import Budget, BudgetWrite, UsagePage, UsageRecord
from evidra.security.secrets import SecretDelete, SecretReceipt, SecretWrite

if TYPE_CHECKING:
    from evidra.api.app import Services

router = APIRouter(prefix="/v1", tags=["providers"])
ProfileId = Annotated[str, Path(pattern=r"^[a-zA-Z0-9_-]{1,100}$")]


def registry(request: Request) -> ProviderRegistry:
    return cast("Services", request.app.state.services).providers


@router.get("/providers/profiles", response_model=ProfilePage)
def profiles(
    request: Request, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)
) -> ProfilePage:
    return registry(request).profiles.list(offset, limit)


@router.put("/providers/profiles/{profile_id}", response_model=ProviderProfile)
def write_profile(profile_id: ProfileId, body: ProfileWrite, request: Request) -> ProviderProfile:
    return registry(request).profiles.write(profile_id, body)


@router.post("/providers/profiles/{profile_id}/resume", response_model=ProviderProfile)
def resume_profile(profile_id: ProfileId, body: ResumeWrite, request: Request) -> ProviderProfile:
    return registry(request).profiles.resume(profile_id, body)


@router.get("/providers/profiles/{profile_id}/models", response_model=ModelPage)
async def catalog(
    profile_id: ProfileId,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> ModelPage:
    return await registry(request).catalog(profile_id, offset, limit)


@router.get("/providers/settings", response_model=Settings)
def settings(request: Request) -> Settings:
    return registry(request).profiles.read_settings()


@router.put("/providers/settings", response_model=Settings)
def write_settings(body: SettingsWrite, request: Request) -> Settings:
    return registry(request).profiles.write_settings(body)


@router.put("/providers/profiles/{profile_id}/secret", response_model=SecretReceipt)
def write_secret(profile_id: ProfileId, body: SecretWrite, request: Request) -> SecretReceipt:
    service = registry(request)
    service.profiles.get(profile_id)
    return service.secrets.set(
        profile_id,
        body.value.get_secret_value(),
        memory_only=body.memory_only,
        expected_revision=body.expected_revision,
        idempotency_key=body.idempotency_key,
    )


@router.delete("/providers/profiles/{profile_id}/secret", response_model=SecretReceipt)
def delete_secret(profile_id: ProfileId, body: SecretDelete, request: Request) -> SecretReceipt:
    service = registry(request)
    service.profiles.get(profile_id)
    return service.secrets.delete(
        profile_id, expected_revision=body.expected_revision, idempotency_key=body.idempotency_key
    )


@router.get("/providers/profiles/{profile_id}/secret", response_model=SecretReceipt)
def secret_status(profile_id: ProfileId, request: Request) -> SecretReceipt:
    service = registry(request)
    service.profiles.get(profile_id)
    return service.secrets.status(profile_id)


@router.put("/notebooks/{notebook_id}/providers/{profile_id}/consent", response_model=Consent)
def consent(
    notebook_id: str, profile_id: ProfileId, body: ConsentWrite, request: Request
) -> Consent:
    return registry(request).profiles.consent(notebook_id, profile_id, body)


@router.get("/notebooks/{notebook_id}/providers/{profile_id}/consent", response_model=Consent)
def read_consent(notebook_id: str, profile_id: ProfileId, request: Request) -> Consent:
    return registry(request).profiles.read_consent(notebook_id, profile_id)


@router.post("/providers/prices", response_model=PriceConfig)
def price(body: PriceConfig, request: Request) -> PriceConfig:
    return registry(request).usage.add_price(body)


@router.put(
    "/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-budgets", response_model=Budget
)
def budget(notebook_id: str, snapshot_id: str, body: BudgetWrite, request: Request) -> Budget:
    service, context = services(request, notebook_id, snapshot_id, commit=True)
    return service.providers.usage.set_budget(context, body)


@router.get(
    "/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-calls", response_model=UsagePage
)
def calls(
    notebook_id: str,
    snapshot_id: str,
    request: Request,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> UsagePage:
    service, context = services(request, notebook_id, snapshot_id)
    return service.providers.usage.list(context, offset, limit)


@router.get(
    "/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-calls/{call_id}",
    response_model=UsageRecord,
)
def call(notebook_id: str, snapshot_id: str, call_id: str, request: Request) -> UsageRecord:
    service, context = services(request, notebook_id, snapshot_id)
    return service.providers.usage.read(context, call_id)
