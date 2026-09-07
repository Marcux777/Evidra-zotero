"""Provider-native HTTP contracts; no runner or credential is accessed."""

import asyncio
import importlib.util
import json

import httpx
import pytest

ADAPTERS = ["ollama", "lm_studio", "openai", "anthropic", "gemini", "openai_compatible"]
SCHEMA = {
    "type": "object",
    "properties": {"n": {"type": "integer"}},
    "required": ["n"],
    "additionalProperties": False,
}


def provider_types():
    assert importlib.util.find_spec("evidra.providers"), "provider subsystem missing"
    from evidra.providers.models import GenerationRequest, ProfileSpec
    from evidra.providers.registry import adapter

    return GenerationRequest, ProfileSpec, adapter


def profile_data(kind):
    local = kind in ["ollama", "lm_studio"]
    urls = {
        "ollama": "http://127.0.0.1:11434",
        "lm_studio": "http://127.0.0.1:1234/v1",
        "openai": "https://api.openai.com/v1",
        "anthropic": "https://api.anthropic.com/v1",
        "gemini": "https://generativelanguage.googleapis.com/v1beta",
        "openai_compatible": "https://example.test/v1",
    }
    return dict(
        adapter=kind,
        mode="LOCAL" if local else "API",
        base_url=urls[kind],
        model="fixture-model",
        purpose="generation",
        capabilities={
            x: {"supported": True, "provenance": "USER_DECLARED"}
            for x in ["generation", "streaming", "structured_output", "images", "catalog"]
        },
    )


def stream(kind, output='{"n":7}', terminal=True):
    if kind == "ollama":
        frames = [{"message": {"role": "assistant", "content": output}, "done": False}]
        if terminal:
            frames += [
                {
                    "done": True,
                    "done_reason": "stop",
                    "prompt_eval_count": 8,
                    "eval_count": 4,
                    "message": {"content": ""},
                }
            ]
        return "".join(json.dumps(x) + "\n" for x in frames)
    if kind == "openai":
        frames = [{"type": "response.output_text.delta", "delta": output}]
        if terminal:
            frames += [
                {
                    "type": "response.completed",
                    "response": {
                        "status": "completed",
                        "usage": {"input_tokens": 8, "output_tokens": 4},
                    },
                }
            ]
    elif kind == "anthropic":
        frames = [
            {"type": "message_start", "message": {"usage": {"input_tokens": 8}}},
            {"type": "content_block_delta", "delta": {"type": "text_delta", "text": output}},
        ]
        if terminal:
            frames += [
                {
                    "type": "message_delta",
                    "delta": {"stop_reason": "end_turn"},
                    "usage": {"output_tokens": 4},
                },
                {"type": "message_stop"},
            ]
    elif kind == "gemini":
        frames = [{"candidates": [{"index": 0, "content": {"parts": [{"text": output}]}}]}]
        if terminal:
            frames += [
                {
                    "candidates": [{"index": 0, "finishReason": "STOP"}],
                    "usageMetadata": {"promptTokenCount": 8, "candidatesTokenCount": 4},
                }
            ]
    else:
        frames = [{"choices": [{"index": 0, "delta": {"content": output}, "finish_reason": None}]}]
        if terminal:
            frames += [
                {"choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]},
                {"choices": [], "usage": {"prompt_tokens": 8, "completion_tokens": 4}},
            ]
    data = "".join("data: " + json.dumps(x) + "\n\n" for x in frames)
    return data + (
        "data: [DONE]\n\n" if terminal and kind in ["lm_studio", "openai_compatible"] else ""
    )


@pytest.mark.parametrize("kind", ADAPTERS)
@pytest.mark.parametrize(
    "case",
    [
        "success",
        "truncated",
        "invalid_json",
        "invalid_schema",
        "rate_limit",
        "timeout",
        "cancel",
        "redirect",
    ],
)
async def test_native_wire_and_terminal_fail_closed(kind, case):
    Request, Profile, adapter = provider_types()
    calls = []
    cancel = asyncio.Event()

    async def boundary(request):
        calls.append(request)
        if case == "timeout":
            raise httpx.ReadTimeout("sensitive-content", request=request)
        if case == "cancel":
            cancel.set()
            await asyncio.Event().wait()
        if case == "rate_limit":
            return httpx.Response(429, text="sensitive-content")
        if case == "redirect":
            return httpx.Response(307, headers={"location": "https://other.test"})
        output = (
            "broken"
            if case == "invalid_json"
            else '{"n":"bad"}'
            if case == "invalid_schema"
            else '{"n":7}'
        )
        return httpx.Response(200, text=stream(kind, output, terminal=case != "truncated"))

    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        provider = adapter(Profile(**profile_data(kind)), client, "fixture-key")
        request = Request(
            messages=[{"role": "user", "text": "synthetic"}],
            max_output_tokens=32,
            output_schema=SCHEMA,
        )
        if case == "success":
            events = [x async for x in provider.generate(request, cancel)]
            assert events[-1].kind == "final" and events[-1].text == '{"n":7}'
            usage = [x for x in events if x.kind == "usage"][-1]
            assert (usage.input_tokens, usage.output_tokens) == (8, 4)
        else:
            from evidra.domain.errors import EvidraError

            expected = {
                "truncated": "STREAM_INCOMPLETE",
                "invalid_json": "INVALID_OUTPUT",
                "invalid_schema": "INVALID_OUTPUT",
                "rate_limit": "RATE_LIMITED",
                "timeout": "PROVIDER_TIMEOUT",
                "cancel": "CANCELLED",
                "redirect": "PROVIDER_HTTP_ERROR",
            }[case]
            with pytest.raises(EvidraError) as exc:
                await asyncio.wait_for(collect(provider.generate(request, cancel)), 2)
            assert exc.value.code == expected
            assert "sensitive-content" not in str(exc.value)
        assert len(calls) == 1
        body = json.loads(calls[0].content)
        paths = {
            "ollama": "/api/chat",
            "lm_studio": "/v1/chat/completions",
            "openai": "/v1/responses",
            "anthropic": "/v1/messages",
            "gemini": "/v1beta/models/fixture-model:streamGenerateContent",
            "openai_compatible": "/v1/chat/completions",
        }
        assert calls[0].url.path == paths[kind]
        if kind == "openai":
            assert body["store"] is False and body["max_output_tokens"] == 32
            assert body["text"]["format"]["schema"] == SCHEMA
            assert body["input"][0]["content"][0]["text"] == "synthetic"
        elif kind == "anthropic":
            assert calls[0].headers["anthropic-version"] == "2023-06-01"
            assert body["output_config"]["format"]["schema"] == SCHEMA
            assert body["max_tokens"] == 32
        elif kind == "gemini":
            assert body["generationConfig"]["responseJsonSchema"] == SCHEMA
            assert body["generationConfig"]["maxOutputTokens"] == 32
            assert calls[0].headers["x-goog-api-key"] == "fixture-key"
            assert calls[0].url.query == b"alt=sse"
        elif kind == "ollama":
            assert body["format"] == SCHEMA and body["options"]["num_predict"] == 32
        else:
            assert body["response_format"]["json_schema"]["schema"] == SCHEMA
            assert body["max_tokens"] == 32


async def collect(iterator):
    return [event async for event in iterator]


@pytest.mark.parametrize("kind", ADAPTERS)
async def test_images_and_schema_uncertainty_preserve_original_constraints(kind):
    Request, Profile, adapter = provider_types()
    sent = []

    async def boundary(request):
        sent.append(json.loads(request.content))
        return httpx.Response(200, text=stream(kind, '{"n":1}'))

    original = {"type": "object", "properties": {"n": {"type": "integer", "minimum": 5}}}
    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        provider = adapter(Profile(**profile_data(kind)), client, "fixture")
        from evidra.conversations.models import Answer
        from evidra.domain.errors import EvidraError

        # Actual conversation bounds are native only on the verified Ollama converter.
        plan = provider.plan_schema(provider.profile, "system", Answer.model_json_schema())
        assert plan.mode == ("native" if kind == "ollama" else "local_validation")
        assert plan.output_schema == Answer.model_json_schema()

        with pytest.raises(EvidraError) as exc:
            await collect(
                provider.generate(
                    Request(
                        messages=[
                            {
                                "role": "user",
                                "text": "synthetic",
                                "images": [{"mime_type": "image/png", "data": "eA=="}],
                            }
                        ],
                        max_output_tokens=32,
                        output_schema=original,
                    ),
                    asyncio.Event(),
                )
            )
        assert exc.value.code == "INVALID_OUTPUT" and len(sent) == 1
        # Explicit format instruction retains the otherwise unsupported minimum.
        assert "minimum" in json.dumps(sent[0]) and "image" in json.dumps(sent[0]).lower()


async def test_ollama_explicit_controls_and_local_embedding_vector_integrity():
    Request, Profile, adapter = provider_types()
    assert "ollama_options" in Request.model_fields, "explicit Ollama controls missing"
    from evidra.providers.embeddings import LocalEmbeddingProvider

    calls = []

    async def boundary(request):
        calls.append(request)
        if request.url.path == "/api/chat":
            return httpx.Response(200, text=stream("ollama"))
        return httpx.Response(
            200, json={"model": "fixture-embedding", "embeddings": [[1.0, 0.0], [0.0, 1.0]]}
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        provider = adapter(Profile(**profile_data("ollama")), client, None)
        await collect(
            provider.generate(
                Request(
                    messages=[{"role": "user", "text": "synthetic"}],
                    max_output_tokens=128,
                    ollama_options={"num_ctx": 4096, "temperature": 0, "seed": 7, "think": False},
                ),
                asyncio.Event(),
            )
        )
        body = json.loads(calls[0].content)
        assert body["options"] == {"num_ctx": 4096, "temperature": 0, "seed": 7, "num_predict": 128}
        assert body["think"] is False
        embed_profile = Profile(
            **(
                profile_data("ollama")
                | {
                    "purpose": "embedding",
                    "model": "fixture-embedding",
                    "capabilities": {
                        "embeddings": {"supported": True, "provenance": "USER_DECLARED"}
                    },
                }
            )
        )
        batch = await LocalEmbeddingProvider(adapter(embed_profile, client, None)).embed(
            ["a", "b"], "fixture-embedding"
        )
        assert batch.dimensions == 2 and batch.normalized and batch.model == "fixture-embedding"
        assert json.loads(calls[1].content) == {
            "model": "fixture-embedding",
            "input": ["a", "b"],
            "truncate": False,
        }


@pytest.mark.parametrize("kind", ["ollama", "lm_studio"])
@pytest.mark.parametrize("fault", ["dimension", "count", "nonfinite", "model"])
async def test_embedding_failure_cannot_mix_model_dimension_or_missing_vectors(kind, fault):
    Request, Profile, adapter = provider_types()
    import importlib.util

    assert importlib.util.find_spec("evidra.providers.embeddings"), "embedding adapter missing"
    from evidra.domain.errors import EvidraError
    from evidra.providers.embeddings import LocalEmbeddingProvider

    vectors = (
        [[1.0, 0.0], [1.0]]
        if fault == "dimension"
        else [[1.0, 0.0]]
        if fault == "count"
        else [[1.0, 0.0], [0.0, 1.0]]
    )
    if fault == "nonfinite":
        vectors = [[float("inf"), 0.0], [0.0, 1.0]]
    result = {"model": "wrong" if fault == "model" else "fixture-model"}
    result.update(
        {"embeddings": vectors}
        if kind == "ollama"
        else {"data": [{"index": i, "embedding": v} for i, v in enumerate(vectors)]}
    )

    def boundary(request):
        return httpx.Response(200, content=json.dumps(result).encode())

    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        spec = profile_data(kind) | {
            "purpose": "embedding",
            "capabilities": {"embeddings": {"supported": True, "provenance": "USER_DECLARED"}},
        }
        with pytest.raises(EvidraError) as exc:
            await LocalEmbeddingProvider(adapter(Profile(**spec), client, None)).embed(
                ["a", "b"], "fixture-model"
            )
        assert exc.value.code == "INVALID_EMBEDDINGS"


@pytest.mark.parametrize("kind", ADAPTERS)
async def test_catalog_is_explicit_read_and_rejects_cloud_local_records(kind):
    Request, Profile, adapter = provider_types()
    assert hasattr(adapter(Profile(**profile_data(kind)), None, None), "catalog"), "catalog missing"
    calls = []

    def boundary(request):
        calls.append(request)
        records = [
            {
                "name": "fixture-model",
                "model": "fixture-model",
                "id": "fixture-model",
                "digest": "sha256:fixture",
            }
        ]
        return httpx.Response(200, json={"models": records, "data": records})

    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        provider = adapter(Profile(**profile_data(kind)), client, "fixture")
        assert not calls
        page = await provider.catalog(0, 50)
        assert page.items[0].model == "fixture-model" and page.total == 1
        assert len(calls) == 1 and calls[0].method == "GET" and not calls[0].content


@pytest.mark.parametrize("kind", ["lm_studio", "openai_compatible"])
async def test_chat_requires_done_after_finish_reason(kind):
    Request, Profile, adapter = provider_types()
    from evidra.domain.errors import EvidraError

    with_stream = stream(kind).replace("data: [DONE]\n\n", "")
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda req: httpx.Response(200, text=with_stream))
    ) as client:
        with pytest.raises(EvidraError) as exc:
            await collect(
                adapter(Profile(**profile_data(kind)), client, None).generate(
                    Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                    asyncio.Event(),
                )
            )
        assert exc.value.code == "STREAM_INCOMPLETE"


@pytest.mark.parametrize("kind", ADAPTERS)
@pytest.mark.parametrize("malformation", ["syntax", "nested_shape"])
async def test_malformed_native_frames_preserve_cause_without_exposing_payload(kind, malformation):
    Request, Profile, adapter = provider_types()
    from evidra.domain.errors import EvidraError

    wire = "sensitive-invalid-json\n" if kind == "ollama" else "data: sensitive-invalid-json\n\n"
    if malformation == "nested_shape":
        frame = {
            "ollama": {"message": None, "done": True},
            "openai": {"type": "response.completed", "response": None},
            "anthropic": {"type": "content_block_delta", "delta": None},
            "gemini": {"candidates": [{"content": None}]},
            "lm_studio": {"choices": [{"delta": None}]},
            "openai_compatible": {"choices": [{"delta": None}]},
        }[kind]
        wire = (
            json.dumps(frame) + "\n" if kind == "ollama" else "data: " + json.dumps(frame) + "\n\n"
        )
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda req: httpx.Response(200, text=wire))
    ) as client:
        with pytest.raises(EvidraError) as exc:
            await collect(
                adapter(Profile(**profile_data(kind)), client, None).generate(
                    Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                    asyncio.Event(),
                )
            )
        assert exc.value.code == "PROVIDER_PROTOCOL_ERROR"
        assert isinstance(
            exc.value.__cause__, json.JSONDecodeError if malformation == "syntax" else TypeError
        )
        assert "sensitive-invalid-json" not in str(exc.value)


async def test_nonfinite_json_is_not_a_valid_structured_result():
    Request, Profile, adapter = provider_types()
    from evidra.domain.errors import EvidraError

    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda req: httpx.Response(200, text=stream("ollama", "NaN")))
    ) as client:
        with pytest.raises(EvidraError) as exc:
            await collect(
                adapter(Profile(**profile_data("ollama")), client, None).generate(
                    Request(
                        messages=[{"role": "user", "text": "synthetic"}],
                        max_output_tokens=32,
                        output_schema={"type": "number"},
                    ),
                    asyncio.Event(),
                )
            )
        assert exc.value.code == "INVALID_OUTPUT"


@pytest.mark.parametrize("kind", ["openai", "lm_studio", "openai_compatible", "anthropic"])
@pytest.mark.parametrize(
    "shape", ["optional", "open_object", "nested", "root_union", "keyword_property"]
)
async def test_strict_schema_structures_select_local_validation_without_rewriting(kind, shape):
    Request, Profile, adapter = provider_types()
    original = {
        "optional": {
            "type": "object",
            "properties": {"n": {"type": "integer"}},
            "additionalProperties": False,
        },
        "open_object": {
            "type": "object",
            "properties": {"n": {"type": "integer"}},
            "required": ["n"],
        },
        "nested": {
            "type": "object",
            "properties": {
                "values": {
                    "type": "array",
                    "items": {"type": "object", "properties": {"n": {"type": "integer"}}},
                }
            },
            "required": ["values"],
            "additionalProperties": False,
        },
        "root_union": {"anyOf": [SCHEMA, {"type": "null"}]},
        "keyword_property": {
            "type": "object",
            "properties": {
                "properties": {
                    "type": "object",
                    "properties": {"n": {"type": "integer"}},
                    "required": ["n"],
                }
            },
            "required": ["properties"],
            "additionalProperties": False,
        },
    }[shape]
    unchanged = json.dumps(original)
    output = '{"values":[{"n":7}]}' if shape == "nested" else '{"n":7}'
    if shape == "keyword_property":
        output = '{"properties":{"n":7}}'
    sent = []

    def boundary(request):
        sent.append(json.loads(request.content))
        return httpx.Response(200, text=stream(kind, output))

    async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as client:
        events = await collect(
            adapter(Profile(**profile_data(kind)), client, "synthetic").generate(
                Request(
                    messages=[{"role": "user", "text": "synthetic"}],
                    max_output_tokens=32,
                    output_schema=original,
                ),
                asyncio.Event(),
            )
        )
        mode = (
            "native"
            if kind == "anthropic" and shape in ["optional", "root_union"]
            else "local_validation"
        )
        assert events[-1].kind == "final" and events[-1].schema_mode == mode
        assert len(sent) == 1
        body = sent[0]
        if mode == "native":
            assert body["output_config"]["format"]["schema"] == original
            assert json.dumps(original) == unchanged
            return
        if kind == "openai":
            assert "text" not in body
            instruction = body["instructions"]
        elif kind == "anthropic":
            assert "output_config" not in body
            instruction = body["system"]
        else:
            assert "response_format" not in body
            instruction = body["messages"][0]["content"]
        assert instruction.endswith(unchanged) and json.dumps(original) == unchanged
