"""Local embedding protocols; vectors never share a generation model implicitly."""

import math
from typing import Any, Protocol

from evidra.providers.base import NativeProvider, fail
from evidra.providers.models import EmbeddingBatch


class EmbeddingProvider(Protocol):
    async def embed(self, texts: list[str], model: str) -> EmbeddingBatch: ...


class LocalEmbeddingProvider:
    def __init__(self, provider: NativeProvider):
        self.provider = provider

    async def embed(self, texts: list[str], model: str) -> EmbeddingBatch:
        profile = self.provider.profile
        if (
            profile.mode != "LOCAL"
            or profile.purpose != "embedding"
            or profile.adapter not in ["ollama", "lm_studio"]
            or not profile.supports("embeddings")
            or model != profile.model
        ):
            raise fail("CAPABILITY_UNSUPPORTED")
        if not texts or len(texts) > 256 or sum(len(t) for t in texts) > 500_000:
            raise fail("INVALID_REQUEST")
        ollama = profile.adapter == "ollama"
        body: dict[str, Any] = {"model": model, "input": texts}
        if ollama:
            body["truncate"] = False
        result = await self.provider.json_request(
            "POST", "/api/embed" if ollama else "/embeddings", body
        )
        try:
            effective = result.get("model")
            if effective is not None and effective != model:
                raise fail("INVALID_EMBEDDINGS")
            if ollama:
                vectors = result["embeddings"]
            else:
                data = sorted(result["data"], key=lambda entry: entry["index"])
                if [e["index"] for e in data] != list(range(len(texts))):
                    raise fail("INVALID_EMBEDDINGS")
                vectors = [e["embedding"] for e in data]
            if len(vectors) != len(texts) or not vectors or not vectors[0]:
                raise fail("INVALID_EMBEDDINGS")
            dimension = len(vectors[0])
            if any(
                len(v) != dimension
                or any(type(n) not in [int, float] or not math.isfinite(n) for n in v)
                for v in vectors
            ):
                raise fail("INVALID_EMBEDDINGS")
            normalized = all(abs(math.sqrt(sum(n * n for n in v)) - 1) < 1e-5 for v in vectors)
            return EmbeddingBatch(
                model=model,
                digest=profile.digest,
                dimensions=dimension,
                normalized=normalized,
                vectors=vectors,
            )
        except (ValueError, KeyError, TypeError, IndexError) as exc:
            raise fail("INVALID_EMBEDDINGS") from exc
