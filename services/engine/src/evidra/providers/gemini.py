from typing import Any
from urllib.parse import quote

from evidra.providers.base import NativeProvider, fail, usage
from evidra.providers.models import GenerationEvent, GenerationRequest


class GeminiProvider(NativeProvider):
    def headers(self) -> dict[str, str]:
        return {"x-goog-api-key": self._secret or ""}

    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        contents = [
            {
                "role": "model" if m.role == "assistant" else "user",
                "parts": [{"text": m.text}]
                + [{"inlineData": {"mimeType": i.mime_type, "data": i.data}} for i in m.images],
            }
            for m in request.messages
        ]
        config: dict[str, Any] = {"maxOutputTokens": request.max_output_tokens, "candidateCount": 1}
        if schema:
            config.update(responseMimeType="application/json", responseJsonSchema=schema)
        body: dict[str, Any] = {"contents": contents, "generationConfig": config}
        if system:
            body["systemInstruction"] = {"parts": [{"text": system}]}
        model = quote(self.profile.model.removeprefix("models/"), safe="")
        return f"/models/{model}:streamGenerateContent?alt=sse", body

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        events = []
        if frame.get("promptFeedback", {}).get("blockReason"):
            raise fail("GENERATION_INCOMPLETE")
        for candidate in frame.get("candidates", []):
            if candidate.get("index", 0) != 0:
                raise fail("PROVIDER_PROTOCOL_ERROR")
            for part in candidate.get("content", {}).get("parts", []):
                if "text" in part and not part.get("thought", False):
                    events.append(GenerationEvent(kind="delta", text=part["text"]))
            reason = candidate.get("finishReason")
            if reason:
                if reason != "STOP":
                    raise fail("GENERATION_INCOMPLETE")
                state["terminal"] = True
        counts = frame.get("usageMetadata")
        if counts:
            output = counts.get("candidatesTokenCount")
            if output is not None:
                output += counts.get("thoughtsTokenCount", 0)
            events.append(usage(state, counts.get("promptTokenCount"), output))
        return events
