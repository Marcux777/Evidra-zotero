"""Provider contracts. Capability declarations never imply a live probe."""

import base64
import ipaddress
from datetime import date
from decimal import Decimal
from typing import Any, Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, model_validator

Adapter = Literal["ollama", "lm_studio", "openai", "anthropic", "gemini", "openai_compatible"]
ContentCategory = Literal["excerpts", "metadata", "images", "history"]
CapabilityName = Literal[
    "generation",
    "streaming",
    "images",
    "structured_output",
    "embeddings",
    "token_counting",
    "cancellation",
    "catalog",
]
SchemaMode = Literal["native", "local_validation", "none"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class Capability(StrictModel):
    supported: bool
    provenance: Literal["PROVIDER_REPORTED", "PROBED", "USER_DECLARED", "UNSUPPORTED"]
    source: str | None = None


class ProfileSpec(StrictModel):
    adapter: Adapter
    mode: Literal["LOCAL", "API"]
    purpose: Literal["generation", "embedding"]
    base_url: str = Field(max_length=2000)
    model: str = Field(min_length=1, max_length=200, pattern=r"^[\w.\-:/]+$")
    digest: str | None = None
    cloud: bool = False
    capabilities: dict[
        Literal[
            "generation",
            "streaming",
            "images",
            "structured_output",
            "embeddings",
            "token_counting",
            "cancellation",
            "catalog",
        ],
        Capability,
    ]

    @model_validator(mode="after")
    def validate_endpoint(self) -> "ProfileSpec":
        url = urlsplit(self.base_url)
        if url.username or url.password or url.query or url.fragment or not url.hostname:
            raise ValueError("Endpoint must have no credentials, query or fragment.")
        if "%" in url.netloc or ".." in url.path or url.port == 23119:
            raise ValueError("Invalid endpoint.")
        if self.mode == "LOCAL":
            try:
                loopback = ipaddress.ip_address(url.hostname).is_loopback
            except ValueError:
                loopback = False
            if not loopback or url.scheme not in ["http", "https"]:
                raise ValueError("LOCAL requires an explicit loopback IP.")
            if self.cloud or "cloud" in self.model.lower() or "remote" in self.model.lower():
                raise ValueError("Cloud models cannot use LOCAL.")
            if self.adapter not in ["ollama", "lm_studio", "openai_compatible"]:
                raise ValueError("Native cloud adapter cannot use LOCAL.")
        elif url.scheme != "https":
            raise ValueError("API endpoints require HTTPS.")
        official = {
            "openai": "https://api.openai.com/v1",
            "anthropic": "https://api.anthropic.com/v1",
            "gemini": "https://generativelanguage.googleapis.com/v1beta",
        }
        if self.adapter in official and self.base_url.rstrip("/") != official[self.adapter]:
            raise ValueError("Native adapter requires its official endpoint.")
        if self.adapter in ["ollama", "lm_studio"] and self.mode != "LOCAL":
            raise ValueError("Local runner adapters require LOCAL.")
        if self.purpose == "embedding" and (
            self.mode != "LOCAL" or self.adapter not in ["ollama", "lm_studio"]
        ):
            raise ValueError("Embeddings require local Ollama or LM Studio.")
        return self

    def supports(self, name: CapabilityName) -> bool:
        value = self.capabilities.get(name)
        return value is not None and value.supported and value.provenance != "UNSUPPORTED"


class ProviderProfile(ProfileSpec):
    id: str
    revision: int
    paused_code: str | None = None


class ProfileWrite(StrictModel):
    spec: ProfileSpec
    expected_revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)


class ProfilePage(StrictModel):
    items: list[ProviderProfile]
    offset: int
    limit: int
    total: int


class ImageInput(StrictModel):
    mime_type: Literal["image/png", "image/jpeg", "image/webp"]
    data: str = Field(max_length=8_000_000, repr=False)

    @model_validator(mode="after")
    def valid_data(self) -> "ImageInput":
        base64.b64decode(self.data, validate=True)
        return self


class Message(StrictModel):
    role: Literal["user", "assistant"]
    text: str = Field(max_length=500_000, repr=False)
    images: list[ImageInput] = Field(default_factory=list, max_length=10, repr=False)


class GenerationRequest(StrictModel):
    messages: list[Message] = Field(min_length=1, max_length=200, repr=False)
    system: str = Field(default="", max_length=100_000, repr=False)
    max_output_tokens: int = Field(gt=0, le=1_000_000)
    output_schema: dict[str, Any] | None = Field(default=None, repr=False)
    categories: frozenset[ContentCategory] = frozenset({"excerpts"})
    ollama_options: "OllamaOptions | None" = None


class OllamaOptions(StrictModel):
    num_ctx: int | None = Field(default=None, gt=0)
    temperature: float | None = Field(default=None, ge=0, le=2, allow_inf_nan=False)
    seed: int | None = None
    think: bool | None = None


GenerationRequest.model_rebuild()


class GenerationEvent(StrictModel):
    kind: Literal["delta", "usage", "final", "error"]
    text: str | None = Field(default=None, repr=False)
    input_tokens: int | None = Field(default=None, ge=0)
    output_tokens: int | None = Field(default=None, ge=0)
    code: str | None = None
    usage_confirmed: bool = False
    schema_mode: Literal["native", "local_validation", "none"] = "none"


class ModelInfo(StrictModel):
    model: str
    digest: str | None = None
    cloud: bool = False


class ModelPage(StrictModel):
    items: list[ModelInfo]
    offset: int
    limit: int
    total: int


class PriceConfig(StrictModel):
    version: str = Field(min_length=1, max_length=200)
    adapter: Adapter
    model: str
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    effective_date: date
    source: str = Field(min_length=1, max_length=2000)
    input_per_million: Decimal = Field(ge=0, allow_inf_nan=False)
    output_per_million: Decimal = Field(ge=0, allow_inf_nan=False)


class EmbeddingBatch(StrictModel):
    model: str
    digest: str | None
    dimensions: int
    normalized: bool
    vectors: list[list[float]]
