import asyncio
import json
import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx

from evidra.domain.errors import EvidraError
from evidra.providers.anthropic import AnthropicProvider
from evidra.providers.base import NativeProvider, fail
from evidra.providers.embeddings import LocalEmbeddingProvider
from evidra.providers.gemini import GeminiProvider
from evidra.providers.models import (
    EmbeddingBatch,
    GenerationEvent,
    GenerationRequest,
    ModelPage,
    ProfileSpec,
)
from evidra.providers.ollama import OllamaProvider
from evidra.providers.openai import CompatibleProvider, LMStudioProvider, OpenAIProvider
from evidra.providers.profiles import ProfileService
from evidra.providers.usage import CallIdentity, InputBound, UsageService
from evidra.scope.service import ScopeContext, ScopeService
from evidra.security.secrets import SecretStore


def adapter(profile: ProfileSpec, client: httpx.AsyncClient, secret: str | None) -> NativeProvider:
    adapters = {
        "ollama": OllamaProvider,
        "lm_studio": LMStudioProvider,
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "gemini": GeminiProvider,
        "openai_compatible": CompatibleProvider,
    }
    return adapters[profile.adapter](profile, client, secret)


class ProviderRegistry:
    def __init__(self, scopes: ScopeService):
        self.scopes = scopes
        self.profiles = ProfileService(scopes)
        self.usage = UsageService(self.profiles)
        self.secrets = SecretStore(self.profiles.owner, scopes.database)
        self.client = httpx.AsyncClient(
            trust_env=False,
            follow_redirects=False,
            timeout=httpx.Timeout(30, connect=10),
            limits=httpx.Limits(max_connections=8),
            transport=httpx.AsyncHTTPTransport(
                retries=0, trust_env=False, verify=True, limits=httpx.Limits(max_connections=8)
            ),
        )
        self._active: dict[str, asyncio.Event] = {}
        self._tasks: dict[str, asyncio.Task[Any]] = {}
        self._closed = False

    async def close(self) -> None:
        self._closed = True
        for cancel in self._active.values():
            cancel.set()
        tasks = list(self._tasks.values())
        for task in tasks:
            task.cancel()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, BaseException) and not isinstance(result, asyncio.CancelledError):
                if not isinstance(result, EvidraError) or result.code != "CANCELLED":
                    raise fail("PROVIDER_SHUTDOWN_FAILED") from result
        await self.client.aclose()
        self.secrets.clear()

    async def catalog(self, profile_id: str, offset: int, limit: int) -> ModelPage:
        profile = self.profiles.get(profile_id)
        secret = self.secrets.get(profile_id)
        if profile.mode == "API" and not secret:
            raise fail("PROVIDER_SECRET_REQUIRED")
        result = await adapter(profile, self.client, secret).catalog(0, 10_000)
        if self.profiles.get(profile_id).revision != profile.revision:
            raise fail("REVISION_CONFLICT")
        with self.scopes.database.transaction() as connection:
            for model in result.items:
                connection.execute(
                    "INSERT INTO provider_model_observations VALUES(?,?,?,?,?) "
                    "ON CONFLICT(profile_id,base_url,model) DO UPDATE SET cloud=excluded.cloud,"
                    "digest=excluded.digest",
                    (profile_id, profile.base_url, model.model, int(model.cloud), model.digest),
                )
        return ModelPage(
            items=result.items[offset : offset + limit],
            offset=offset,
            limit=limit,
            total=result.total,
        )

    async def embed(
        self, context: ScopeContext, profile_id: str, texts: list[str]
    ) -> EmbeddingBatch:
        profile = self.profiles.authorize(context, profile_id, frozenset({"excerpts"}))
        provider = LocalEmbeddingProvider(
            adapter(profile, self.client, self.secrets.get(profile_id))
        )
        result = await provider.embed(texts, profile.model)
        current = self.profiles.authorize(context, profile_id, frozenset({"excerpts"}))
        if current.revision != profile.revision:
            raise fail("REVISION_CONFLICT")
        return result

    async def generate(
        self,
        context: ScopeContext,
        profile_id: str,
        request: GenerationRequest,
        cancel_event: asyncio.Event,
        *,
        identity: CallIdentity,
        input_bound: InputBound | None = None,
    ) -> AsyncIterator[GenerationEvent]:
        if self._closed:
            raise fail("ENGINE_STOPPING")
        # Images and conversation history cannot be hidden by underdeclared categories.
        categories = request.categories
        if any(m.images for m in request.messages):
            categories |= {"images"}
        if len(request.messages) > 1:
            categories |= {"history"}
        profile = self.profiles.authorize(context, profile_id, categories)
        secret = self.secrets.get(profile_id)
        if profile.mode == "API" and not secret:
            raise fail("PROVIDER_SECRET_REQUIRED")
        provider = adapter(profile, self.client, secret)
        # Validate schema/capabilities before reserving or marking a call sent.
        provider.schema(request)
        if (
            profile.purpose != "generation"
            or not profile.supports("generation")
            or not profile.supports("streaming")
        ):
            raise fail("CAPABILITY_UNSUPPORTED")
        if any(m.images for m in request.messages) and not profile.supports("images"):
            raise fail("VISION_UNSUPPORTED")
        self.usage.reserve(context, profile_id, identity, request.max_output_tokens, input_bound)
        self._active[identity.call_id] = cancel_event
        task = asyncio.current_task()
        if task is not None:
            self._tasks[identity.call_id] = task
        inputs = outputs = None
        confirmed = False
        error = None
        completed = False
        reconciled = False
        try:
            if cancel_event.is_set():
                raise fail("CANCELLED")
            current = self.profiles.authorize(context, profile_id, categories)
            if current.revision != profile.revision:
                raise fail("REVISION_CONFLICT")
            self.usage.mark_sent(identity.call_id)
            async for event in provider.generate(request, cancel_event):
                if event.kind == "usage":
                    inputs, outputs = event.input_tokens, event.output_tokens
                    confirmed = event.usage_confirmed
                current = self.profiles.authorize(context, profile_id, categories)
                if current.revision != profile.revision:
                    raise fail("REVISION_CONFLICT")
                if event.kind == "final":
                    self.scopes.assert_current(context)
                    self.usage.finish(identity.call_id, inputs, outputs, confirmed=confirmed)
                    reconciled = True
                    completed = True
                yield event
        except EvidraError as exc:
            error = exc.code
            causes: list[dict[str, str]] = []
            cause: BaseException | None = exc
            while cause is not None and len(causes) < 8:
                entry = {"type": type(cause).__name__}
                if isinstance(cause, EvidraError):
                    entry["code"] = cause.code
                causes.append(entry)
                cause = cause.__cause__
            logging.getLogger("evidra.providers").warning(
                json.dumps(
                    {
                        "operation": "generate",
                        "call_id": identity.call_id,
                        "profile_id": profile_id,
                        "adapter": profile.adapter,
                        "model": profile.model,
                        "code": exc.code,
                        "causes": causes,
                    }
                )
            )
            if exc.code == "RATE_LIMITED":
                self.profiles.pause(profile_id, exc.code)
            raise
        except BaseException:
            error = "CANCELLED"
            raise
        finally:
            self._active.pop(identity.call_id, None)
            self._tasks.pop(identity.call_id, None)
            if not reconciled:
                self.usage.finish(
                    identity.call_id,
                    inputs,
                    outputs,
                    error=error or (None if completed else "STREAM_ABANDONED"),
                    confirmed=confirmed,
                )
