from typing import Any

from evidra.providers.base import NativeProvider, fail, frame_object, usage
from evidra.providers.models import GenerationEvent, GenerationRequest


class AnthropicProvider(NativeProvider):
    def headers(self) -> dict[str, str]:
        return {"x-api-key": self._secret or "", "anthropic-version": "2023-06-01"}

    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        messages = [
            {
                "role": m.role,
                "content": [{"type": "text", "text": m.text}]
                + [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": i.mime_type, "data": i.data},
                    }
                    for i in m.images
                ],
            }
            for m in request.messages
        ]
        body: dict[str, Any] = {
            "model": self.profile.model,
            "max_tokens": request.max_output_tokens,
            "messages": messages,
            "stream": True,
        }
        if system:
            body["system"] = system
        if schema:
            body["output_config"] = {"format": {"type": "json_schema", "schema": schema}}
        return "/messages", body

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        kind = frame.get("type")
        if kind == "message_start":
            counts = frame_object(frame_object(frame["message"]).get("usage", {}))
            return [usage(state, counts.get("input_tokens"))]
        if kind == "content_block_delta":
            delta = frame_object(frame["delta"])
            if delta.get("type") == "text_delta":
                return [GenerationEvent(kind="delta", text=delta["text"])]
        if kind == "message_delta":
            state["reason"] = frame_object(frame["delta"]).get("stop_reason")
            counts = frame_object(frame.get("usage", {}))
            return [usage(state, output_tokens=counts.get("output_tokens"))]
        if kind == "message_stop":
            if state.get("reason") not in ["end_turn", "stop_sequence"]:
                raise fail("GENERATION_INCOMPLETE")
            state["terminal"] = True
        return []
