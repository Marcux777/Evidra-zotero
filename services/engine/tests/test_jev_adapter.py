"""Jev adapter against a local fake server. The real API is never contacted from these tests."""

import asyncio
import json
import threading
import time
from collections.abc import Iterator
from decimal import Decimal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

import pytest

from evidra.domain.errors import EvidraError
from evidra.providers import jev
from evidra.providers.jev import (
    ChoiceAnswer,
    ChoiceQuestion,
    JevClient,
    NoulQuestion,
    decide,
)

KEY = "apikey_FAKE_0123456789abcdef_do_not_leak"


def ok_body(answers: dict[str, Any], *, model: str = "jev-1.13.0", tokens: int = 1000) -> bytes:
    return json.dumps(
        {"model": model, "answers": answers, "usage": {"input_tokens": tokens, "output_tokens": 42}}
    ).encode()


def choice(
    value: str,
    confidence: float,
    *,
    options: tuple[str, ...] | None = None,
    **probabilities: float,
) -> dict[str, Any]:
    """A well-formed answer: probabilities over exactly the offered options, summing to 1."""
    if not probabilities:
        others = [o for o in (options or (value,)) if o != value]
        share = (1 - confidence) / len(others) if others else 0.0
        probabilities = {value: confidence, **{o: share for o in others}}
    return {
        "type": "choice",
        "choice": value,
        "confidence": confidence,
        "probabilities": probabilities,
    }


class FakeJev:
    """A scripted server: each request consumes one step; the last step repeats."""

    def __init__(self) -> None:
        self.requests: list[dict[str, Any]] = []
        self.written = 0
        self.script: list[dict[str, Any]] = []
        self.lock = threading.Lock()
        fake = self

        class Handler(BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def log_message(self, *_args: object) -> None:
                pass

            def do_POST(self) -> None:
                size = int(self.headers.get("content-length", "0"))
                raw = self.rfile.read(size)
                with fake.lock:
                    fake.requests.append(
                        {
                            "path": self.path,
                            "headers": {k.lower(): v for k, v in self.headers.items()},
                            "body": json.loads(raw) if raw else None,
                        }
                    )
                    step = fake.script.pop(0) if len(fake.script) > 1 else fake.script[0]
                time.sleep(step.get("delay", 0))
                body = step.get("body", b"")
                self.send_response(step.get("status", 200))
                self.send_header("Connection", "close")
                for name, value in step.get("headers", {}).items():
                    self.send_header(name, value)
                if step.get("chunked"):  # no Content-Length: the bound must apply while streaming
                    spec = step["chunked"]
                    self.send_header("Transfer-Encoding", "chunked")
                    self.end_headers()
                    try:
                        while fake.written < spec["total"]:
                            piece = b"x" * spec["chunk"]
                            self.wfile.write(b"%x\r\n" % len(piece) + piece + b"\r\n")
                            self.wfile.flush()
                            fake.written += len(piece)
                            time.sleep(spec.get("delay", 0))
                        self.wfile.write(b"0\r\n\r\n")
                    except OSError:
                        pass
                    return
                if step.get("slow_body"):
                    spec = step["slow_body"]
                    self.send_header("Content-Length", str(spec["total"]))
                    self.end_headers()
                    try:
                        for _ in range(spec["pieces"]):
                            self.wfile.write(b" " * (spec["total"] // spec["pieces"]))
                            self.wfile.flush()
                            time.sleep(spec["delay"])
                    except OSError:
                        pass
                    return
                if step.get("stream_bytes"):
                    self.send_header("Content-Length", str(step["stream_bytes"]))
                    self.end_headers()
                    try:
                        sent = 0
                        while sent < step["stream_bytes"]:
                            self.wfile.write(b"x" * min(65536, step["stream_bytes"] - sent))
                            sent += 65536
                    except OSError:
                        pass
                    return
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self) -> None:
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture
def fake() -> Iterator[FakeJev]:
    server = FakeJev()
    server.script = [{"status": 200, "body": ok_body({"a": {"type": "noul", "noul": 0.9}})}]
    yield server
    server.close()


def client(fake: FakeJev, **options: Any) -> JevClient:
    options.setdefault("sleep", _instant)
    return JevClient(lambda: KEY, base_url=fake.url, **options)


async def _instant(_delay: float) -> None:
    return None


def run(coro: Any) -> Any:
    return asyncio.run(coro)


QUESTIONS = {"a": NoulQuestion("Is the statement true? Statement: x")}


def refused(call: Any) -> EvidraError:
    with pytest.raises(EvidraError) as failure:
        run(call())
    return failure.value


# --- request and success ------------------------------------------------------------------------
def test_request_shape_headers_and_pinned_model(fake: FakeJev) -> None:
    result = run(client(fake).ask({"excerpts": {"e1": "text"}}, QUESTIONS))
    request = fake.requests[0]
    assert request["path"] == "/v1/systemone"
    assert request["headers"]["authorization"] == "Bearer " + KEY
    assert request["headers"]["content-type"] == "application/json"
    assert request["headers"]["accept-encoding"] == "identity"
    assert request["body"] == {
        "state": {"excerpts": {"e1": "text"}},
        "model": "jev-1.13.0",
        "questions": {"a": {"type": "noul", "instructions": "Is the statement true? Statement: x"}},
    }
    assert result.model == "jev-1.13.0" and result.answers["a"].probability == 0.9  # type: ignore[union-attr]
    assert result.usage.input_tokens == 1000 and result.attempts == 1


def test_cost_uses_the_configurable_price_and_ignores_output(fake: FakeJev) -> None:
    fake.script = [{"body": ok_body({"a": {"type": "noul", "noul": 0.5}}, tokens=2_000_000)}]
    default = run(client(fake).ask({}, QUESTIONS))
    assert default.cost_usd == Decimal("0.084000")  # 2 Mtok x US$ 0.042 per Mtok
    custom = run(client(fake, price_per_mtok=Decimal("0.1")).ask({}, QUESTIONS))
    assert custom.cost_usd == Decimal("0.200000")


def test_choice_question_wire_and_answer(fake: FakeJev) -> None:
    question = ChoiceQuestion("Pick", {"e1": None, "NONE": "Nothing."})
    fake.script = [{"body": ok_body({"c": choice("e1", 0.97, e1=0.97, NONE=0.03)})}]
    result = run(client(fake).ask({"x": 1}, {"c": question}))
    assert fake.requests[0]["body"]["questions"]["c"] == {
        "type": "choice",
        "instructions": "Pick",
        "criteria": {"e1": None, "NONE": "Nothing."},
    }
    answer = result.answers["c"]
    assert isinstance(answer, ChoiceAnswer) and answer.choice == "e1"


# --- pinning --------------------------------------------------------------------------------------
@pytest.mark.parametrize("alias", ["jev-latest", "jev-preview", "jev-1.14.0", ""])
def test_aliases_and_other_versions_are_refused_at_construction(alias: str) -> None:
    with pytest.raises(EvidraError) as failure:
        JevClient(lambda: KEY, model=alias)
    assert failure.value.code == "INVALID_REQUEST"


def test_a_response_from_another_model_is_refused(fake: FakeJev) -> None:
    fake.script = [{"body": ok_body({"a": {"type": "noul", "noul": 0.5}}, model="jev-1.14.0")}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_MODEL_MISMATCH"
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_endpoint_must_be_https_except_loopback() -> None:
    for bad in ("http://api.typesafe.ai", "ftp://x", "https://user:pw@api.typesafe.ai"):
        with pytest.raises(EvidraError):
            JevClient(lambda: KEY, base_url=bad)
    JevClient(lambda: KEY, base_url="https://api.typesafe.ai")
    JevClient(lambda: KEY, base_url="http://127.0.0.1:8000")


# --- error policy ---------------------------------------------------------------------------------
@pytest.mark.parametrize(
    ("status", "code"), [(401, "PROVIDER_AUTH_ERROR"), (422, "PROVIDER_REQUEST_INVALID")]
)
def test_401_and_422_are_never_retried(fake: FakeJev, status: int, code: str) -> None:
    fake.script = [{"status": status, "body": b'{"error": "nope"}'}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == code and len(fake.requests) == 1
    assert error.retryable is False
    assert KEY not in json.dumps(error.details) and KEY not in str(error)


@pytest.mark.parametrize(("status", "code"), [(429, "RATE_LIMITED"), (529, "PROVIDER_OVERLOADED")])
def test_429_and_529_back_off_with_a_ceiling_then_fail_retryably(
    fake: FakeJev, status: int, code: str
) -> None:
    delays: list[float] = []

    async def record(delay: float) -> None:
        delays.append(delay)

    fake.script = [{"status": status, "body": b"{}"}]
    error = refused(
        lambda: client(fake, sleep=record, max_attempts=4, backoff_base=1, backoff_cap=3).ask(
            {}, QUESTIONS
        )
    )
    assert error.code == code and error.retryable is True
    assert len(fake.requests) == 4
    assert delays == [1, 2, 3]  # doubling, capped at 3
    assert error.details["attempts"] == 4  # type: ignore[index]


def test_retry_after_is_honoured_but_capped(fake: FakeJev) -> None:
    delays: list[float] = []

    async def record(delay: float) -> None:
        delays.append(delay)

    fake.script = [
        {"status": 429, "headers": {"Retry-After": "7"}, "body": b"{}"},
        {"status": 429, "headers": {"Retry-After": "9999"}, "body": b"{}"},
        {"body": ok_body({"a": {"type": "noul", "noul": 0.4}})},
    ]
    result = run(client(fake, sleep=record, backoff_cap=10).ask({}, QUESTIONS))
    assert delays == [7, 10] and result.attempts == 3


def test_other_statuses_are_not_retried(fake: FakeJev) -> None:
    fake.script = [{"status": 500, "body": b"{}"}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_HTTP_ERROR" and len(fake.requests) == 1


def test_redirects_are_not_followed(fake: FakeJev) -> None:
    fake.script = [{"status": 302, "headers": {"Location": "http://127.0.0.1:1/x"}, "body": b""}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_HTTP_ERROR" and len(fake.requests) == 1


@pytest.mark.parametrize(
    "body",
    [
        b"not json",
        b"[]",
        b'{"model": "jev-1.13.0"}',
        json.dumps({"model": "jev-1.13.0", "answers": {}, "usage": {}}).encode(),
        ok_body({"a": {"type": "noul", "noul": 1.5}}),
        ok_body({"a": {"type": "noul", "noul": "0.5"}}),
        ok_body({"a": {"type": "choice", "choice": "x", "confidence": 1, "probabilities": {}}}),
        ok_body({"a": {"type": "noul", "noul": 0.5}, "extra": {"type": "noul", "noul": 0.5}}),
        b'{"model":"jev-1.13.0","answers":{"a":{"type":"noul","noul":NaN}},"usage":'
        b'{"input_tokens":1,"output_tokens":1}}',
        ok_body({"a": {"type": "noul", "noul": 0.5}}, tokens=-3),
    ],
)
def test_malformed_responses_are_protocol_errors(fake: FakeJev, body: bytes) -> None:
    fake.script = [{"body": body}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_PROTOCOL_ERROR"
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]
    assert len(fake.requests) == 1


def test_choice_outside_the_offered_options_is_a_protocol_error(fake: FakeJev) -> None:
    fake.script = [{"body": ok_body({"c": choice("e9", 0.9, e9=0.9, e1=0.1)})}]
    error = refused(lambda: client(fake).ask({}, {"c": ChoiceQuestion("Pick", {"e1": None})}))
    assert error.code == "PROVIDER_PROTOCOL_ERROR"


def test_oversized_response_is_refused(fake: FakeJev) -> None:
    fake.script = [{"stream_bytes": 3_000_000}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_RESPONSE_TOO_LARGE"


def test_timeout_leaves_billing_unknown(fake: FakeJev) -> None:
    fake.script = [{"delay": 1.5, "body": ok_body({"a": {"type": "noul", "noul": 0.5}})}]
    error = refused(lambda: client(fake, timeout=0.3).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_TIMEOUT"
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_connection_failure_to_a_closed_port_is_a_transport_error() -> None:
    server = FakeJev()
    url = server.url
    server.close()
    error = refused(lambda: JevClient(lambda: KEY, base_url=url).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_TRANSPORT_ERROR"


def test_cancellation_after_send_is_billing_unknown(fake: FakeJev) -> None:
    fake.script = [{"delay": 2, "body": ok_body({"a": {"type": "noul", "noul": 0.5}})}]

    async def scenario() -> None:
        cancel = asyncio.Event()
        task = asyncio.create_task(client(fake).ask({}, QUESTIONS, cancel))
        for _ in range(100):
            if fake.requests:
                break
            await asyncio.sleep(0.01)
        cancel.set()
        await task

    error = refused(scenario)
    assert error.code == "CANCELLED"
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_cancellation_before_send_is_not_sent(fake: FakeJev) -> None:
    cancel = asyncio.Event()
    cancel.set()
    error = refused(lambda: client(fake).ask({}, QUESTIONS, cancel))
    assert error.code == "CANCELLED"
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]
    assert fake.requests == []


def test_cancellation_while_backing_off_is_billing_unknown(fake: FakeJev) -> None:
    fake.script = [{"status": 429, "body": b"{}"}]
    cancel = asyncio.Event()

    async def hold(_delay: float) -> None:
        cancel.set()
        await asyncio.sleep(5)

    error = refused(lambda: client(fake, sleep=hold).ask({}, QUESTIONS, cancel))
    assert error.code == "CANCELLED" and len(fake.requests) == 1
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


# --- budget before the network --------------------------------------------------------------------
def test_planning_limit_is_enforced_before_anything_is_sent(fake: FakeJev) -> None:
    state = {"excerpts": {"e1": "x" * 97_000}}
    error = refused(lambda: client(fake).ask(state, QUESTIONS))
    assert error.code == "JEV_CONTEXT_LIMIT"
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]
    assert fake.requests == []


def test_a_request_inside_the_limit_is_sent(fake: FakeJev) -> None:
    state = {"excerpts": {"e1": "x" * 90_000}}
    assert run(client(fake).ask(state, QUESTIONS)).attempts == 1


def test_token_estimate_follows_the_adr_formula() -> None:
    assert jev.estimate_tokens(0) == 178
    assert jev.estimate_tokens(10_000) == 178 + 2780


def test_many_questions_hit_the_request_ceiling_not_the_single_question_limit(
    fake: FakeJev,
) -> None:
    long = "q" * 6000  # each question is far below the 97k single-question planning limit
    questions = {f"q{n}": NoulQuestion(long) for n in range(30)}
    state = {"excerpts": {"e1": "x" * 20_000}}
    error = refused(lambda: client(fake).ask(state, questions))
    assert error.code == "JEV_CONTEXT_LIMIT" and "estimated_tokens" in error.details  # type: ignore[operator]
    assert fake.requests == []


# --- the credential ------------------------------------------------------------------------
def test_the_key_is_read_per_request_and_never_appears_in_errors_or_repr(fake: FakeJev) -> None:
    calls: list[int] = []

    def supplier() -> str:
        calls.append(1)
        return KEY

    instance = JevClient(supplier, base_url=fake.url)
    assert KEY not in repr(instance) and "supplier" not in repr(instance)
    run(instance.ask({}, QUESTIONS))
    run(instance.ask({}, QUESTIONS))
    assert len(calls) == 2


def test_missing_key_fails_before_sending(fake: FakeJev) -> None:
    def missing() -> str:
        raise EvidraError("PROVIDER_SECRET_REQUIRED", "The Jev API key is not in the keyring.")

    error = refused(lambda: JevClient(missing, base_url=fake.url).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_SECRET_REQUIRED" and fake.requests == []


def test_secret_service_lookup_has_no_environment_fallback(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import subprocess

    monkeypatch.setenv("TYPESAFE_API_KEY", KEY)

    def absent(*_a: Any, **_k: Any) -> Any:
        return subprocess.CompletedProcess([], 1, stdout="", stderr="")

    monkeypatch.setattr(subprocess, "run", absent)
    with pytest.raises(EvidraError) as failure:
        jev.secret_service_api_key()
    assert failure.value.code == "PROVIDER_SECRET_REQUIRED"


# --- the per-criterion form and its ADR rules ----------------------------------------------
EXCERPTS = {"e1": "The trial was randomized.", "e2": "Other text."}


VERDICT_OPTIONS = ("MET", "NOT_MET", "NOT_REPORTED")
ANCHOR_OPTIONS = ("e1", "e2", "NONE")


def criterion_script(verdict: tuple[str, float], anchor: tuple[str, float]) -> list[dict[str, Any]]:
    return [
        {
            "body": ok_body(
                {
                    "verdict": choice(verdict[0], verdict[1], options=VERDICT_OPTIONS),
                    "anchor": choice(anchor[0], anchor[1], options=ANCHOR_OPTIONS),
                }
            )
        }
    ]


def assess(fake: FakeJev, **kw: Any) -> Any:
    return run(client(fake).assess_criterion("The trial was randomized.", EXCERPTS, **kw))


def test_firm_met_and_not_met_need_confidence_and_a_prepared_anchor(fake: FakeJev) -> None:
    fake.script = criterion_script(("MET", 0.98), ("e1", 0.99))
    met = assess(fake)
    assert (met.outcome, met.reason, met.anchor) == ("MET", "FIRM", "e1")
    fake.script = criterion_script(("NOT_MET", 0.95), ("e2", 0.9))
    not_met = assess(fake)
    assert (not_met.outcome, not_met.reason, not_met.anchor) == ("NOT_MET", "FIRM", "e2")


@pytest.mark.parametrize(
    ("verdict", "anchor", "reason"),
    [
        (("NOT_REPORTED", 0.99), ("NONE", 0.99), "NOT_REPORTED"),
        (("NOT_REPORTED", 0.99), ("e1", 0.99), "NOT_REPORTED"),
        (("NOT_MET", 0.99), ("NONE", 0.99), "NO_ANCHOR"),
        (("MET", 0.99), ("NONE", 0.99), "NO_ANCHOR"),
        (("NOT_MET", 0.55), ("e1", 0.99), "LOW_VERDICT_CONFIDENCE"),
        (("MET", 0.69), ("e1", 0.99), "LOW_VERDICT_CONFIDENCE"),
        (("MET", 0.99), ("e1", 0.4), "LOW_ANCHOR_CONFIDENCE"),
    ],
)
def test_everything_else_is_unclear(
    fake: FakeJev, verdict: tuple[str, float], anchor: tuple[str, float], reason: str
) -> None:
    fake.script = criterion_script(verdict, anchor)
    result = assess(fake)
    assert result.outcome == "UNCLEAR" and result.reason == reason


def test_an_anchor_outside_the_prepared_ids_never_supports_a_verdict() -> None:
    verdict = ChoiceAnswer("NOT_MET", 0.99, {"NOT_MET": 0.99})
    anchor = ChoiceAnswer("e7", 0.99, {"e7": 0.99})
    assert decide(verdict, anchor, {"e1", "e2"}, 0.7, 0.7).reason == "ANCHOR_NOT_PREPARED"


def test_c_min_is_a_parameter_of_the_protocol_not_a_constant(fake: FakeJev) -> None:
    fake.script = criterion_script(("NOT_MET", 0.8), ("e2", 0.99))
    assert assess(fake, c_min=0.7).outcome == "NOT_MET"
    assert assess(fake, c_min=0.9).outcome == "UNCLEAR"


def test_criterion_request_carries_the_measured_protocol_text(fake: FakeJev) -> None:
    fake.script = criterion_script(("MET", 0.98), ("e1", 0.99))
    assess(fake)
    body = fake.requests[0]["body"]
    assert body["state"] == {"excerpts": EXCERPTS}
    verdict, anchor = body["questions"]["verdict"], body["questions"]["anchor"]
    assert verdict["criteria"] == jev.VERDICT_CRITERIA
    assert list(anchor["criteria"]) == ["e1", "e2", "NONE"]
    assert anchor["criteria"]["e1"] is None
    assert "NONE" in anchor["instructions"]
    assert body["model"] == "jev-1.13.0"


def test_none_is_not_an_allowed_excerpt_id(fake: FakeJev) -> None:
    with pytest.raises(EvidraError):
        run(client(fake).assess_criterion("x", {"NONE": "text"}))
    assert fake.requests == []


def test_no_second_provider_is_tried_after_a_failure(fake: FakeJev) -> None:
    fake.script = [{"status": 401, "body": b"{}"}]
    refused(lambda: client(fake).assess_criterion("x", EXCERPTS))
    assert len(fake.requests) == 1  # one attempt, one endpoint, no alternative credential
