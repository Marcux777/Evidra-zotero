"""Exercise production readers with observable, incrementally delivered HTTP bodies."""

import asyncio

import httpx
import pytest
from test_providers import profile_data, provider_types, stream

from evidra.domain.errors import EvidraError


class CountedBody(httpx.AsyncByteStream):
    def __init__(self, body, chunk_size=65_536, stall=False):
        self.body, self.chunk_size, self.stall = body, chunk_size, stall
        self.consumed = 0
        self.closed = False
        self.waiting = asyncio.Event()

    async def __aiter__(self):
        for offset in range(0, len(self.body), self.chunk_size):
            if self.stall and offset:
                self.waiting.set()
                await asyncio.Event().wait()
            await asyncio.sleep(0)
            chunk = self.body[offset : offset + self.chunk_size]
            self.consumed += len(chunk)
            yield chunk

    async def aclose(self):
        self.closed = True


@pytest.mark.parametrize("case", ["json", "line", "unicode", "sse_event", "total"])
async def test_excessive_response_stops_before_consuming_entire_body(case):
    Request, Profile, adapter = provider_types()
    if case == "json":
        body = b'{"text":"' + b"x" * 16_000_000 + b'"}'
    elif case == "line":
        body = b'{"message":{"content":"' + b"x" * 16_000_000 + b'"}}'
    elif case == "unicode":
        body = ('{"message":{"content":"' + "€" * 2_800_000 + '"}}\n').encode()
    elif case == "sse_event":
        # Each line is bounded; the event as a whole is not.
        body = (b"data: " + b" " * 250_000 + b"\n") * 50 + b"\n"
    else:
        body = (b'{"message":{"content":"' + b"x" * 10_000 + b'"}}\n') * 1_000
    wire = CountedBody(body)
    kind = "openai" if case == "sse_event" else "ollama"
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, stream=wire))
    ) as client:
        provider = adapter(Profile(**profile_data(kind)), client, None)
        with pytest.raises(EvidraError, match="PROVIDER_RESPONSE_TOO_LARGE"):
            if case == "json":
                await provider.json_request("GET", "/models")
            else:
                async for _ in provider.generate(
                    Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                    asyncio.Event(),
                ):
                    pass
    limit = 8_000_000 if case in ["json", "total"] else 1_000_000
    assert wire.consumed <= limit + wire.chunk_size
    assert wire.consumed < len(body)
    assert wire.closed


@pytest.mark.parametrize("kind", ["ollama", "openai"])
@pytest.mark.parametrize("ending", ["\n", "\r\n", "\r"])
async def test_fragmented_utf8_and_protocol_line_endings(kind, ending):
    Request, Profile, adapter = provider_types()
    output = '{"n":"ação €"}'
    # Ensure actual multibyte wire text, split even inside a UTF-8 code point and CRLF.
    text = stream(kind, output).replace("\\u00e7", "ç").replace("\\u00e3", "ã")
    text = text.replace("\\u20ac", "€").replace("\n", ending)
    wire = CountedBody(text.encode(), chunk_size=1)
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, stream=wire))
    ) as client:
        provider = adapter(Profile(**profile_data(kind)), client, None)
        events = [
            e async for e in provider.generate(
                Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                asyncio.Event(),
            )
        ]
    assert events[-1].text == output and wire.closed


@pytest.mark.parametrize("operation", ["json", "generation"])
@pytest.mark.parametrize("stop", ["cancel", "deadline"])
async def test_stalled_body_cancellation_and_total_deadline_close_response(
    operation, stop, monkeypatch
):
    from evidra.providers import base

    Request, Profile, adapter = provider_types()
    wire = CountedBody(b'{"text":"' + b"x" * 1_000, chunk_size=32, stall=True)
    monkeypatch.setattr(base, "JSON_TIMEOUT_SECONDS", 0.05, raising=False)
    monkeypatch.setattr(base, "GENERATION_TIMEOUT_SECONDS", 0.05, raising=False)
    cancel = asyncio.Event()
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, stream=wire))
    ) as client:
        provider = adapter(Profile(**profile_data("ollama")), client, None)

        async def invoke():
            if operation == "json":
                return await provider.json_request("GET", "/models")
            return [e async for e in provider.generate(
                Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                cancel,
            )]

        task = asyncio.create_task(invoke())
        await asyncio.wait_for(wire.waiting.wait(), 1)
        if stop == "cancel":
            if operation == "json":
                task.cancel()
                with pytest.raises(asyncio.CancelledError):
                    await task
            else:
                cancel.set()
                with pytest.raises(EvidraError, match="CANCELLED"):
                    await asyncio.wait_for(task, 1)
        else:
            with pytest.raises(EvidraError, match="PROVIDER_TIMEOUT"):
                await asyncio.wait_for(task, 1)
    assert wire.closed and wire.consumed == 32


@pytest.mark.parametrize("operation", ["json", "generation"])
async def test_unrequested_compression_is_refused_before_body_read(operation):
    Request, Profile, adapter = provider_types()
    wire = CountedBody(b"untrusted encoded body")
    requests = []

    def respond(request):
        requests.append(request)
        return httpx.Response(200, headers={"content-encoding": "gzip"}, stream=wire)

    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as client:
        provider = adapter(Profile(**profile_data("ollama")), client, None)
        with pytest.raises(EvidraError, match="PROVIDER_PROTOCOL_ERROR"):
            if operation == "json":
                await provider.json_request("GET", "/models")
            else:
                async for _ in provider.generate(
                    Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                    asyncio.Event(),
                ):
                    pass
    assert requests[0].headers["accept-encoding"] == "identity"
    assert wire.consumed == 0 and wire.closed


async def test_cancellation_at_header_arrival_still_closes_unread_response():
    Request, Profile, adapter = provider_types()
    wire = CountedBody(b"never read")
    cancel = asyncio.Event()

    def respond(_):
        cancel.set()
        return httpx.Response(200, stream=wire)

    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as client:
        provider = adapter(Profile(**profile_data("ollama")), client, None)
        with pytest.raises(EvidraError, match="CANCELLED"):
            async for _ in provider.generate(
                Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                cancel,
            ):
                pass
    assert wire.closed and wire.consumed == 0


async def test_cancellation_between_frames_already_in_the_same_read():
    Request, Profile, adapter = provider_types()
    body = stream("ollama").encode()
    wire = CountedBody(body, chunk_size=len(body))
    cancel = asyncio.Event()
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, stream=wire))
    ) as client:
        provider = adapter(Profile(**profile_data("ollama")), client, None)
        with pytest.raises(EvidraError, match="CANCELLED"):
            async for event in provider.generate(
                Request(messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32),
                cancel,
            ):
                assert event.kind == "delta"
                cancel.set()
    assert wire.closed
