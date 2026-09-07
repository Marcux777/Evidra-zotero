"""One-attempt bounded HTTP and streaming; adapters only translate native contracts."""

import asyncio
import json
import re
from collections.abc import AsyncGenerator, AsyncIterator, Awaitable
from typing import Any, Protocol
from urllib.parse import quote

import httpx
from jsonschema import Draft202012Validator  # type: ignore[import-untyped]
from jsonschema.exceptions import SchemaError, ValidationError  # type: ignore[import-untyped]

from evidra.domain.errors import EvidraError
from evidra.providers.models import (
    GenerationEvent,
    GenerationRequest,
    ModelInfo,
    ModelPage,
    ProfileSpec,
    SchemaMode,
    SchemaPlan,
)


class GenerationProvider(Protocol):
    def generate(
        self, request: GenerationRequest, cancel_event: asyncio.Event
    ) -> AsyncGenerator[GenerationEvent, None]: ...


async def cancellable[T](work: Awaitable[T], cancel: asyncio.Event) -> T:
    task = asyncio.ensure_future(work)
    stop = asyncio.create_task(cancel.wait())
    original: BaseException | None = None
    try:
        await asyncio.wait([task, stop], return_when=asyncio.FIRST_COMPLETED)
        if cancel.is_set():
            raise EvidraError("CANCELLED", "CANCELLED: provider request cancelled.")
        return await task
    except BaseException as exc:
        original = exc
        raise
    finally:
        for pending in [task, stop]:
            if not pending.done():
                pending.cancel()
        outcomes = await asyncio.gather(task, stop, return_exceptions=True)
        failures = [
            result
            for result in outcomes
            if isinstance(result, BaseException)
            and not isinstance(result, asyncio.CancelledError)
            and result is not original
        ]
        if failures:
            if original is not None and not isinstance(
                original, (asyncio.CancelledError, GeneratorExit)
            ):
                if not isinstance(original, EvidraError) or original.code != "CANCELLED":
                    failures.insert(0, original)
            cause = (
                failures[0]
                if len(failures) == 1
                else BaseExceptionGroup("Provider cancellation cleanup failures", failures)
            )
            raise fail("PROVIDER_CLEANUP_FAILED") from cause


def fail(code: str) -> EvidraError:
    return EvidraError(code, f"{code}: provider operation failed.")


class GenerationIncomplete(EvidraError):
    def __init__(self, reason: object):
        # Keep a bounded protocol identifier, never arbitrary provider text/reasoning.
        self.termination_reason = (
            reason
            if isinstance(reason, str) and re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", reason)
            else "unrecognized"
        )
        super().__init__(
            "GENERATION_INCOMPLETE", "Generation incomplete: " + self.termination_reason
        )


def reject_nonfinite(value: str) -> None:
    raise ValueError("Nonfinite values are not JSON.")


def frame_object(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise TypeError("Provider frame field must be an object.")
    return value


def frame_array(value: Any) -> list[Any]:
    if not isinstance(value, list):
        raise TypeError("Provider frame field must be an array.")
    return value


def status(response: httpx.Response) -> None:
    if response.status_code == 429:
        raise fail("RATE_LIMITED")
    if response.status_code in [401, 403]:
        raise fail("PROVIDER_AUTH_ERROR")
    if response.status_code != 200:
        raise fail("PROVIDER_HTTP_ERROR")


class NativeProvider:
    def __init__(self, profile: ProfileSpec, client: httpx.AsyncClient, secret: str | None):
        self.profile, self.client = profile, client
        self._secret = secret

    def headers(self) -> dict[str, str]:
        return {"Authorization": "Bearer " + self._secret} if self._secret else {}

    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        raise NotImplementedError

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        raise NotImplementedError

    async def catalog(self, offset: int, limit: int) -> ModelPage:
        if not self.profile.supports("catalog"):
            raise fail("CAPABILITY_UNSUPPORTED")
        kind = self.profile.adapter
        path = "/api/tags" if kind == "ollama" else "/models"
        items: list[ModelInfo] = []
        seen_cursors: set[str] = set()
        while True:
            data = await self.json_request("GET", path)
            try:
                records = data["models" if kind in ["ollama", "gemini"] else "data"]
                for row in records:
                    name = row.get("model") or row.get("id") or row["name"]
                    if kind == "gemini":
                        name = name.removeprefix("models/")
                    cloud = bool(
                        row.get("remote_host")
                        or row.get("remote_model")
                        or row.get("cloud")
                        or "cloud" in name.lower()
                        or "remote" in name.lower()
                    )
                    items.append(ModelInfo(model=name, digest=row.get("digest"), cloud=cloud))
                token = data.get("nextPageToken")
                if token:
                    path = "/models?pageToken=" + quote(token, safe="")
                elif kind == "anthropic" and data.get("has_more"):
                    token = data["last_id"]
                    path = "/models?after_id=" + quote(token, safe="")
                else:
                    break
                if token in seen_cursors or len(items) > 10_000:
                    raise fail("PROVIDER_PROTOCOL_ERROR")
                seen_cursors.add(token)
            except (KeyError, TypeError, ValueError, AttributeError) as exc:
                raise fail("PROVIDER_PROTOCOL_ERROR") from exc
        return ModelPage(
            items=items[offset : offset + limit], offset=offset, limit=limit, total=len(items)
        )

    async def json_request(
        self, method: str, path: str, body: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        try:
            response = await self.client.request(
                method,
                self.profile.base_url.rstrip("/") + path,
                json=body,
                headers=self.headers(),
                follow_redirects=False,
                timeout=30,
            )
            status(response)
            if len(response.content) > 8_000_000:
                raise fail("PROVIDER_RESPONSE_TOO_LARGE")
            result = response.json()
            if not isinstance(result, dict):
                raise fail("PROVIDER_PROTOCOL_ERROR")
            return result
        except httpx.TimeoutException as exc:
            raise fail("PROVIDER_TIMEOUT") from exc
        except httpx.HTTPError as exc:
            raise fail("PROVIDER_TRANSPORT_ERROR") from exc
        except ValueError as exc:
            raise fail("PROVIDER_PROTOCOL_ERROR") from exc

    def schema(self, request: GenerationRequest) -> tuple[dict[str, Any] | None, str, SchemaMode]:
        plan = self.plan_schema(self.profile, request.system, request.output_schema)
        system = plan.system
        if request.prepared_schema_mode is not None:
            if request.prepared_schema_mode != plan.mode:
                raise fail("SCHEMA_PLAN_CHANGED")
            if plan.mode == "local_validation" and not request.system.endswith(
                "\nReturn only JSON matching this schema: " + json.dumps(request.output_schema)
            ):
                raise fail("SCHEMA_PLAN_CHANGED")
            system = request.system
        return plan.output_schema if plan.mode == "native" else None, system, plan.mode

    @staticmethod
    def plan_schema(
        profile: ProfileSpec, system: str, original: dict[str, Any] | None
    ) -> SchemaPlan:
        if original is None:
            return SchemaPlan(system=system, output_schema=None, mode="none")
        try:
            Draft202012Validator.check_schema(original)

            # Never allow a local validator to fetch a remote reference.
            def check(value: Any) -> None:
                if isinstance(value, dict):
                    for key, child in value.items():
                        if key in ["$ref", "$dynamicRef"] and (
                            not isinstance(child, str) or not child.startswith("#")
                        ):
                            raise fail("INVALID_SCHEMA")
                        check(child)
                elif isinstance(value, list):
                    for child in value:
                        check(child)

            check(original)
        except SchemaError as exc:
            raise fail("INVALID_SCHEMA") from exc
        # A deliberately conservative common subset. Never strip constraints.
        supported = {
            "type",
            "properties",
            "required",
            "additionalProperties",
            "items",
            "enum",
            "description",
            "title",
            "anyOf",
            "$defs",
            "$ref",
        }

        if profile.adapter == "ollama":
            # Ollama 0.33.3 pins llama.cpp b10760: its schema grammar supports
            # string and array bounds. Keep other adapters' conservative subset.
            supported.update({"minLength", "maxLength", "minItems", "maxItems"})
        strict = profile.adapter in ["openai", "lm_studio", "openai_compatible"]
        closed_objects = strict or profile.adapter == "anthropic"

        def native(value: Any, property_names: bool = False) -> bool:
            if isinstance(value, dict):
                if not property_names:
                    kind = value.get("type")
                    object_schema = (
                        kind == "object"
                        or (isinstance(kind, list) and "object" in kind)
                        or "properties" in value
                    )
                    if object_schema and closed_objects:
                        if value.get("additionalProperties") is not False:
                            return False
                        if strict and set(value.get("required", [])) != set(
                            value.get("properties", {})
                        ):
                            return False
                return all(
                    (property_names or key in supported)
                    and native(child, not property_names and key in ["properties", "$defs"])
                    for key, child in value.items()
                )
            return all(native(x) for x in value) if isinstance(value, list) else True

        root_supported = not strict or (
            original.get("type") == "object" and "anyOf" not in original
        )
        if profile.supports("structured_output") and root_supported and native(original):
            return SchemaPlan(system=system, output_schema=original, mode="native")
        instruction = "\nReturn only JSON matching this schema: " + json.dumps(original)
        return SchemaPlan(
            system=system + instruction, output_schema=original, mode="local_validation"
        )

    async def frames(
        self, response: httpx.Response, cancel: asyncio.Event
    ) -> AsyncIterator[dict[str, Any] | str]:
        buffer = ""
        lines = response.aiter_lines()
        size = 0
        while True:
            try:
                line = await cancellable(anext(lines), cancel)
            except StopAsyncIteration:
                break
            size += len(line)
            if size > 8_000_000:
                raise fail("PROVIDER_RESPONSE_TOO_LARGE")
            if self.profile.adapter == "ollama":
                if line:
                    yield json.loads(line)
            elif line.startswith("data:"):
                buffer += line[5:].lstrip() + "\n"
            elif line == "" and buffer:
                data, buffer = buffer.strip(), ""
                yield data if data == "[DONE]" else json.loads(data)
        if buffer:
            raise fail("STREAM_INCOMPLETE")

    async def generate(
        self, request: GenerationRequest, cancel_event: asyncio.Event
    ) -> AsyncGenerator[GenerationEvent, None]:
        if self.profile.purpose != "generation" or not self.profile.supports("generation"):
            raise fail("CAPABILITY_UNSUPPORTED")
        if not self.profile.supports("streaming"):
            raise fail("CAPABILITY_UNSUPPORTED")
        if any(m.images for m in request.messages) and not self.profile.supports("images"):
            raise fail("VISION_UNSUPPORTED")
        schema, system, mode = self.schema(request)
        path, body = self.payload(request, schema, system)
        if cancel_event.is_set():
            raise fail("CANCELLED")
        response = None
        state: dict[str, Any] = {"terminal": False, "text": "", "input": None, "output": None}
        saw_done = False
        try:
            async with asyncio.timeout(300):
                outbound = self.client.build_request(
                    "POST",
                    self.profile.base_url.rstrip("/") + path,
                    json=body,
                    headers=self.headers(),
                    timeout=30,
                )
                response = await cancellable(
                    self.client.send(outbound, stream=True, follow_redirects=False), cancel_event
                )
                status(response)
                async for frame in self.frames(response, cancel_event):
                    if frame == "[DONE]":
                        if not state["terminal"]:
                            raise fail("STREAM_INCOMPLETE")
                        saw_done = True
                        break
                    if not isinstance(frame, dict):
                        raise fail("PROVIDER_PROTOCOL_ERROR")
                    if "error" in frame or frame.get("type") == "error":
                        raise fail("PROVIDER_STREAM_ERROR")
                    for event in self.parse(frame, state):
                        if event.kind == "delta":
                            state["text"] += event.text or ""
                        yield event
                    if state.get("termination_failure") is not None:
                        break
                if not state["terminal"]:
                    raise fail("STREAM_INCOMPLETE")
                if self.profile.adapter in ["lm_studio", "openai_compatible"] and not saw_done:
                    raise fail("STREAM_INCOMPLETE")
                yield GenerationEvent(
                    kind="usage",
                    input_tokens=state["input"],
                    output_tokens=state["output"],
                    usage_confirmed=True,
                )
                if state.get("termination_failure") is not None:
                    raise GenerationIncomplete(state["termination_failure"])
                if request.output_schema is not None:
                    try:
                        Draft202012Validator(request.output_schema).validate(
                            json.loads(state["text"], parse_constant=reject_nonfinite)
                        )
                    except (ValueError, ValidationError) as exc:
                        raise fail("INVALID_OUTPUT") from exc
                yield GenerationEvent(kind="final", text=state["text"], schema_mode=mode)
        except (httpx.TimeoutException, TimeoutError) as exc:
            raise fail("PROVIDER_TIMEOUT") from exc
        except httpx.HTTPError as exc:
            raise fail("PROVIDER_TRANSPORT_ERROR") from exc
        except (ValueError, KeyError, TypeError, IndexError) as exc:
            raise fail("PROVIDER_PROTOCOL_ERROR") from exc
        finally:
            if response is not None:
                try:
                    await response.aclose()
                except Exception as exc:
                    raise fail("PROVIDER_CLEANUP_FAILED") from exc


def usage(
    state: dict[str, Any], input_tokens: Any = None, output_tokens: Any = None
) -> GenerationEvent:
    for key, value in [("input", input_tokens), ("output", output_tokens)]:
        if value is not None:
            if type(value) is not int or value < 0:
                raise fail("PROVIDER_PROTOCOL_ERROR")
            state[key] = value
    return GenerationEvent(kind="usage", input_tokens=state["input"], output_tokens=state["output"])
