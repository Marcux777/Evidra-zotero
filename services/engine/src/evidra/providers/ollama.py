from typing import Any

from evidra.providers.base import NativeProvider, fail, usage
from evidra.providers.models import GenerationEvent, GenerationRequest


class OllamaProvider(NativeProvider):
    def payload(
        self, request: GenerationRequest, schema: dict[str, Any] | None, system: str
    ) -> tuple[str, dict[str, Any]]:
        messages = [
            {
                "role": m.role,
                "content": m.text,
                **({"images": [i.data for i in m.images]} if m.images else {}),
            }
            for m in request.messages
        ]
        if system:
            messages.insert(0, {"role": "system", "content": system})
        options = (
            request.ollama_options.model_dump(exclude_none=True, exclude={"think"})
            if request.ollama_options
            else {}
        )
        think = request.ollama_options.think if request.ollama_options else None
        return "/api/chat", {
            "model": self.profile.model,
            "messages": messages,
            "stream": True,
            "options": {**options, "num_predict": request.max_output_tokens},
            **({"think": think} if think is not None else {}),
            **({"format": schema} if schema else {}),
        }

    def parse(self, frame: dict[str, Any], state: dict[str, Any]) -> list[GenerationEvent]:
        events = []
        text = frame.get("message", {}).get("content", "")
        if text:
            events.append(GenerationEvent(kind="delta", text=text))
        if frame.get("done") is True:
            if frame.get("done_reason") not in [None, "stop"]:
                raise fail("GENERATION_INCOMPLETE")
            state["terminal"] = True
            events.append(usage(state, frame.get("prompt_eval_count"), frame.get("eval_count")))
        return events
