import asyncio
import json
import logging
from collections.abc import AsyncGenerator, Iterator
from contextlib import aclosing, contextmanager
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
        self._tasks: set[asyncio.Task[Any]] = set()
        self._closed = False
        self._close_lock = asyncio.Lock()

    @contextmanager
    def _operation(self) -> Iterator[None]:
        if self._closed:
            raise fail("ENGINE_STOPPING")
        task = asyncio.current_task()
        assert task is not None
        self._tasks.add(task)
        try:
            yield
        finally:
            self._tasks.discard(task)

    async def close(self) -> None:
        self._closed = True
        async with self._close_lock:
            for cancel in self._active.values():
                cancel.set()
            tasks = list(self._tasks)
            for task in tasks:
                task.cancel()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            errors = [
                result
                for result in results
                if isinstance(result, BaseException)
                and not isinstance(result, asyncio.CancelledError)
                and (not isinstance(result, EvidraError) or result.code != "CANCELLED")
            ]
            try:
                await self.client.aclose()
            except Exception as exc:
                errors.append(exc)
            finally:
                self.secrets.clear()
            if errors:
                cause = (
                    errors[0]
                    if len(errors) == 1
                    else BaseExceptionGroup("Provider shutdown failures", errors)
                )
                raise fail("PROVIDER_SHUTDOWN_FAILED") from cause

    async def catalog(self, profile_id: str, offset: int, limit: int) -> ModelPage:
        with self._operation():
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
        with self._operation():
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
    ) -> AsyncGenerator[GenerationEvent, None]:
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
            self._tasks.add(task)
        inputs = outputs = None
        confirmed = False
        error = None
        completed = False
        reconciled = False
        final_event: GenerationEvent | None = None
        try:
            if cancel_event.is_set():
                raise fail("CANCELLED")
            current = self.profiles.authorize(context, profile_id, categories)
            if current.revision != profile.revision:
                raise fail("REVISION_CONFLICT")
            self.usage.mark_sent(identity.call_id)
            async with aclosing(provider.generate(request, cancel_event)) as events:
                async for event in events:
                    if event.kind == "usage":
                        inputs, outputs = event.input_tokens, event.output_tokens
                        confirmed = event.usage_confirmed
                    current = self.profiles.authorize(context, profile_id, categories)
                    if current.revision != profile.revision:
                        raise fail("REVISION_CONFLICT")
                    if event.kind == "final":
                        final_event = event
                    else:
                        yield event
            if final_event is None:
                raise fail("STREAM_INCOMPLETE")
            # Cleanup may fail or yield control. Recheck scope before promoting the final result.
            current = self.profiles.authorize(context, profile_id, categories)
            if current.revision != profile.revision:
                raise fail("REVISION_CONFLICT")
            self.scopes.assert_current(context)
            self.usage.finish(identity.call_id, inputs, outputs, confirmed=confirmed)
            reconciled = True
            completed = True
            yield final_event
        except Exception as exc:
            error = exc.code if isinstance(exc, EvidraError) else "PROVIDER_INTERNAL_ERROR"
            causes: list[dict[str, str]] = []
            pending_causes: list[BaseException] = [exc]
            seen: set[int] = set()
            while pending_causes and len(causes) < 8:
                cause = pending_causes.pop(0)
                if id(cause) in seen:
                    continue
                seen.add(id(cause))
                entry = {"type": type(cause).__name__}
                if isinstance(cause, EvidraError):
                    entry["code"] = cause.code
                causes.append(entry)
                if isinstance(cause, BaseExceptionGroup):
                    pending_causes.extend(cause.exceptions)
                if cause.__cause__ is not None:
                    pending_causes.append(cause.__cause__)
                elif cause.__context__ is not None and not cause.__suppress_context__:
                    pending_causes.append(cause.__context__)
            logging.getLogger("evidra.providers").warning(
                json.dumps(
                    {
                        "operation": "generate",
                        "call_id": identity.call_id,
                        "profile_id": profile_id,
                        "adapter": profile.adapter,
                        "model": profile.model,
                        "code": error,
                        "causes": causes,
                    }
                )
            )
            if error == "RATE_LIMITED":
                self.profiles.pause(profile_id, error)
            if isinstance(exc, EvidraError):
                raise
            raise fail(error) from exc
        except (asyncio.CancelledError, GeneratorExit):
            error = "CANCELLED"
            raise
        except BaseException:
            error = "PROVIDER_INTERNAL_ERROR"
            raise
        finally:
            self._active.pop(identity.call_id, None)
            if task is not None:
                self._tasks.discard(task)
            if not reconciled:
                self.usage.finish(
                    identity.call_id,
                    inputs,
                    outputs,
                    error=error or (None if completed else "STREAM_ABANDONED"),
                    confirmed=confirmed,
                )
