"""Renderer allowlist derived from Pydantic; no generic method, URL or image bytes."""

from typing import Annotated, Literal

from pydantic import Field

from evidra.conversations.models import ConversationCreate, RunPrepare, VectorBuild
from evidra.domain.documents import DocumentCommandScope
from evidra.providers.models import PriceConfig, ProfileWrite, StrictModel
from evidra.providers.profiles import ConsentWrite, ResumeWrite, SettingsWrite
from evidra.providers.usage import BudgetWrite
from evidra.security.secrets import SecretDelete, SecretWrite

Id = Annotated[str, Field(pattern=r"^[a-f0-9]{32}$")]
ProfileId = Annotated[str, Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")]


class ConversationListCommand(DocumentCommandScope):
    op: Literal["conversation.list"]
    offset: int = Field(ge=0, le=1_000_000)


class ConversationCreateCommand(DocumentCommandScope):
    op: Literal["conversation.create"]
    request: ConversationCreate


class ConversationReadCommand(DocumentCommandScope):
    op: Literal["conversation.read"]
    conversation_id: Id


class ConversationHistoryCommand(DocumentCommandScope):
    op: Literal["conversation.history"]
    conversation_id: Id
    offset: int = Field(ge=0, le=1_000_000)


class ConversationPrepareCommand(DocumentCommandScope):
    op: Literal["conversation.prepare"]
    conversation_id: Id
    request: RunPrepare


class ConversationRunCommand(DocumentCommandScope):
    op: Literal["conversation.run", "conversation.start", "conversation.cancel"]
    run_id: Id


class ConversationEventsCommand(DocumentCommandScope):
    op: Literal["conversation.events"]
    run_id: Id
    cursor: int = Field(ge=0, le=1_000_000)


class VectorBuildCommand(DocumentCommandScope):
    op: Literal["conversation.vectors.build"]
    request: VectorBuild


class VectorJobCommand(DocumentCommandScope):
    op: Literal["conversation.vectors.read", "conversation.vectors.cancel"]
    job_id: Id


ConversationCommand = Annotated[
    ConversationListCommand
    | ConversationCreateCommand
    | ConversationReadCommand
    | ConversationHistoryCommand
    | ConversationPrepareCommand
    | ConversationRunCommand
    | ConversationEventsCommand
    | VectorBuildCommand
    | VectorJobCommand,
    Field(discriminator="op"),
]


class ProviderListCommand(StrictModel):
    op: Literal["provider.list"]
    offset: int = Field(ge=0, le=1_000_000)


class ProviderWriteCommand(StrictModel):
    op: Literal["provider.write"]
    profile_id: ProfileId
    request: ProfileWrite


class ProviderModelsCommand(StrictModel):
    op: Literal["provider.models"]
    profile_id: ProfileId
    offset: int = Field(ge=0, le=1_000_000)


class ProviderResumeCommand(StrictModel):
    op: Literal["provider.resume"]
    profile_id: ProfileId
    request: ResumeWrite


class ProviderSettingsReadCommand(StrictModel):
    op: Literal["provider.settings"]


class ProviderSettingsWriteCommand(StrictModel):
    op: Literal["provider.settings.write"]
    request: SettingsWrite


class ProviderSecretReadCommand(StrictModel):
    op: Literal["provider.secret"]
    profile_id: ProfileId


class ProviderSecretWriteCommand(StrictModel):
    op: Literal["provider.secret.write"]
    profile_id: ProfileId
    request: SecretWrite


class ProviderSecretDeleteCommand(StrictModel):
    op: Literal["provider.secret.delete"]
    profile_id: ProfileId
    request: SecretDelete


class ProviderConsentReadCommand(DocumentCommandScope):
    op: Literal["provider.consent"]
    profile_id: ProfileId


class ProviderConsentWriteCommand(DocumentCommandScope):
    op: Literal["provider.consent.write"]
    profile_id: ProfileId
    request: ConsentWrite


class ProviderBudgetCommand(DocumentCommandScope):
    op: Literal["provider.budget"]
    request: BudgetWrite


class ProviderPriceCommand(StrictModel):
    op: Literal["provider.price"]
    request: PriceConfig


class ProviderCallsCommand(DocumentCommandScope):
    op: Literal["provider.calls"]
    offset: int = Field(ge=0, le=1_000_000)


ProviderCommand = Annotated[
    ProviderListCommand
    | ProviderWriteCommand
    | ProviderModelsCommand
    | ProviderResumeCommand
    | ProviderSettingsReadCommand
    | ProviderSettingsWriteCommand
    | ProviderSecretReadCommand
    | ProviderSecretWriteCommand
    | ProviderSecretDeleteCommand
    | ProviderConsentReadCommand
    | ProviderConsentWriteCommand
    | ProviderBudgetCommand
    | ProviderPriceCommand
    | ProviderCallsCommand,
    Field(discriminator="op"),
]
