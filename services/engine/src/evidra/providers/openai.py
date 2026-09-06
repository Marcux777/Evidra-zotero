from typing import Any

from evidra.providers.base import NativeProvider, fail, frame_array, frame_object, usage
from evidra.providers.models import GenerationEvent, GenerationRequest


def image_url(mime: str, data: str) -> str:
    return f"data:{mime};base64,{data}"


class OpenAIProvider(NativeProvider):
    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        messages = [
            {
                "role": m.role,
                "content": [{"type": "input_text", "text": m.text}]
                + [
                    {"type": "input_image", "image_url": image_url(i.mime_type, i.data)}
                    for i in m.images
                ],
            }
            for m in request.messages
        ]
        body: dict[str, Any] = {
            "model": self.profile.model,
            "input": messages,
            "stream": True,
            "store": False,
            "max_output_tokens": request.max_output_tokens,
        }
        if system:
            body["instructions"] = system
        if schema:
            body["text"] = {
                "format": {
                    "type": "json_schema",
                    "name": "evidra_output",
                    "strict": True,
                    "schema": schema,
                }
            }
        return "/responses", body

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        kind = frame.get("type")
        if kind in ["response.failed", "response.incomplete", "response.refusal.delta"]:
            raise fail("GENERATION_INCOMPLETE")
        if kind == "response.output_text.delta":
            return [GenerationEvent(kind="delta", text=frame["delta"])]
        if kind == "response.completed":
            response = frame_object(frame["response"])
            if response.get("status") != "completed":
                raise fail("GENERATION_INCOMPLETE")
            state["terminal"] = True
            counts = frame_object(response["usage"]) if response.get("usage") is not None else {}
            return [usage(state, counts.get("input_tokens"), counts.get("output_tokens"))]
        return []


class CompatibleProvider(NativeProvider):
    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        messages: list[dict[str, Any]] = []
        if system:
            messages.append({"role": "system", "content": system})
        for m in request.messages:
            content: Any = m.text
            if m.images:
                content = [{"type": "text", "text": m.text}] + [
                    {"type": "image_url", "image_url": {"url": image_url(i.mime_type, i.data)}}
                    for i in m.images
                ]
            messages.append({"role": m.role, "content": content})
        body: dict[str, Any] = {
            "model": self.profile.model,
            "messages": messages,
            "stream": True,
            "stream_options": {"include_usage": True},
            "max_tokens": request.max_output_tokens,
        }
        if schema:
            body["response_format"] = {
                "type": "json_schema",
                "json_schema": {"name": "evidra_output", "strict": True, "schema": schema},
            }
        return "/chat/completions", body

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        events = []
        for raw_choice in frame_array(frame.get("choices", [])):
            choice = frame_object(raw_choice)
            if choice.get("index", 0) != 0:
                raise fail("PROVIDER_PROTOCOL_ERROR")
            delta = frame_object(choice.get("delta", {}))
            if delta.get("refusal") or delta.get("tool_calls"):
                raise fail("GENERATION_INCOMPLETE")
            text = delta.get("content")
            if text:
                events.append(GenerationEvent(kind="delta", text=text))
            reason = choice.get("finish_reason")
            if reason:
                if reason != "stop":
                    raise fail("GENERATION_INCOMPLETE")
                state["terminal"] = True
        counts = frame.get("usage")
        if counts is not None:
            counts = frame_object(counts)
            events.append(
                usage(state, counts.get("prompt_tokens"), counts.get("completion_tokens"))
            )
        return events


class LMStudioProvider(CompatibleProvider):
    """Explicit local OpenAI-compatible protocol; no automatic model loading."""
