"""Hardening of the Jev adapter after the independent review of 732abae (each test failed first)."""

import asyncio
import gzip
import json
import math
import time
from decimal import Decimal
from email.utils import formatdate
from typing import Any

import httpx
import pytest
from test_jev_adapter import (
    EXCERPTS,
    KEY,
    QUESTIONS,
    FakeJev,
    choice,
    client,
    criterion_script,
    ok_body,
    refused,
    run,
)

from evidra.domain.errors import EvidraError
from evidra.providers import jev
from evidra.providers.jev import ChoiceAnswer, ChoiceQuestion, JevClient, NoulQuestion, decide

pytest_plugins: list[str] = []


@pytest.fixture
def fake() -> Any:
    server = FakeJev()
    server.script = [{"status": 200, "body": ok_body({"a": {"type": "noul", "noul": 0.9}})}]
    yield server
    server.close()


def verdict_answer(value: str, confidence: float) -> ChoiceAnswer:
    return ChoiceAnswer(value, confidence, {value: confidence})


def chain(error: BaseException) -> list[BaseException]:
    seen: list[BaseException] = []
    pending: list[BaseException | None] = [error]
    while pending:
        item = pending.pop()
        if item is None or any(item is s for s in seen):
            continue
        seen.append(item)
        pending += [item.__cause__, item.__context__]
    return seen


def assert_no_key(error: BaseException) -> None:
    for item in chain(error):
        assert KEY not in str(item) and KEY not in repr(item), type(item)
        assert KEY not in json.dumps(getattr(item, "details", None) or {}, default=str)
        request = getattr(item, "_request", None)
        assert request is None, "an httpx error with its request (and Authorization) is kept"
        traceback = item.__traceback__
        while traceback is not None:
            for value in traceback.tb_frame.f_locals.values():
                assert not isinstance(value, httpx.Request | httpx.Headers)
                assert not (isinstance(value, str) and KEY in value)
            traceback = traceback.tb_next


# --- I1: thresholds ---------------------------------------------------------------------------
@pytest.mark.parametrize("bad", [math.nan, -1.0, 0.0, 1.5, math.inf, -math.inf])
def test_invalid_thresholds_are_refused_not_silently_firm(fake: FakeJev, bad: float) -> None:
    fake.script = criterion_script(("NOT_MET", 0.99), ("e1", 0.99))
    with pytest.raises(EvidraError) as failure:
        run(client(fake).assess_criterion("x", EXCERPTS, c_min=bad))
    assert failure.value.code == "INVALID_REQUEST"
    with pytest.raises(EvidraError) as anchor_failure:
        run(client(fake).assess_criterion("x", EXCERPTS, anchor_c_min=bad))
    assert anchor_failure.value.code == "INVALID_REQUEST"
    with pytest.raises(EvidraError):
        decide(verdict_answer("MET", 0.9), verdict_answer("e1", 0.9), {"e1"}, bad, 0.7)
    assert fake.requests == []


def test_nan_confidence_can_never_be_firm() -> None:
    nan = float("nan")
    result = decide(
        ChoiceAnswer("NOT_MET", nan, {"NOT_MET": nan}),
        verdict_answer("e1", 0.99),
        {"e1"},
        0.7,
        0.7,
    )
    assert result.outcome == "UNCLEAR"
    anchor = decide(
        verdict_answer("NOT_MET", 0.99), ChoiceAnswer("e1", nan, {"e1": nan}), {"e1"}, 0.7, 0.7
    )
    assert anchor.outcome == "UNCLEAR"


def test_explicit_anchor_threshold_is_applied(fake: FakeJev) -> None:
    fake.script = criterion_script(("NOT_MET", 0.99), ("e1", 0.8))
    assert run(client(fake).assess_criterion("x", EXCERPTS, anchor_c_min=0.7)).outcome == "NOT_MET"
    strict = run(client(fake).assess_criterion("x", EXCERPTS, anchor_c_min=0.9))
    assert (strict.outcome, strict.reason) == ("UNCLEAR", "LOW_ANCHOR_CONFIDENCE")


# --- I2: a choice answer must be internally consistent ----------------------------------------
def anchor_response(probabilities: dict[str, float], picked: str, confidence: float) -> bytes:
    return ok_body(
        {
            "verdict": choice("NOT_MET", 0.99, NOT_MET=0.99, MET=0.01, NOT_REPORTED=0.0),
            "anchor": {
                "type": "choice",
                "choice": picked,
                "confidence": confidence,
                "probabilities": probabilities,
            },
        }
    )


@pytest.mark.parametrize(
    "probabilities, picked, confidence",
    [
        ({"NONE": 0.99}, "e1", 0.99),  # the mandatory case: choice contradicts the distribution
        ({}, "e1", 0.99),  # empty probabilities
        ({"e1": 0.5, "e2": 0.5}, "e1", 0.5),  # the NONE option is missing
        ({"e1": 0.5, "e2": 0.3, "NONE": 0.2, "ghost": 0.0}, "e1", 0.5),  # an unoffered key
        ({"e1": 0.9, "e2": 0.9, "NONE": 0.9}, "e1", 0.9),  # sums to 2.7
        ({"e1": 0.3, "e2": 0.2, "NONE": 0.1}, "e1", 0.3),  # sums to 0.6
        ({"e1": 0.2, "e2": 0.7, "NONE": 0.1}, "e1", 0.2),  # not the most probable option
        ({"e1": 0.6, "e2": 0.3, "NONE": 0.1}, "e1", 0.95),  # confidence above its probability
    ],
)
def test_inconsistent_choice_answers_are_protocol_errors(
    fake: FakeJev, probabilities: dict[str, float], picked: str, confidence: float
) -> None:
    fake.script = [{"body": anchor_response(probabilities, picked, confidence)}]
    with pytest.raises(EvidraError) as failure:
        run(client(fake).assess_criterion("x", EXCERPTS))
    assert failure.value.code == "PROVIDER_PROTOCOL_ERROR"
    assert failure.value.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_a_confidence_below_its_probability_is_accepted_as_measured(fake: FakeJev) -> None:
    """Real responses (13% in the J0/J1a ledgers) report confidence < p[choice], never above."""
    body = anchor_response({"e1": 0.83, "e2": 0.0, "NONE": 0.17}, "e1", 0.66)
    fake.script = [{"body": body}]
    result = run(client(fake).assess_criterion("x", EXCERPTS))
    assert result.anchor == "e1" and result.anchor_confidence == 0.66


def test_probability_sum_tolerance_is_two_percent(fake: FakeJev) -> None:
    fake.script = [{"body": anchor_response({"e1": 0.99, "e2": 0.0, "NONE": 0.0}, "e1", 0.99)}]
    run(client(fake).assess_criterion("x", EXCERPTS))  # 0.99: inside 1 +/- 0.02
    fake.script = [{"body": anchor_response({"e1": 0.95, "e2": 0.0, "NONE": 0.0}, "e1", 0.95)}]
    with pytest.raises(EvidraError):
        run(client(fake).assess_criterion("x", EXCERPTS))  # 0.95: outside it


# --- I3: thresholds are recorded with the decision -------------------------------------------
def test_the_assessment_records_its_thresholds_and_the_protocol_id_includes_them(
    fake: FakeJev,
) -> None:
    fake.script = criterion_script(("MET", 0.98), ("e1", 0.99))
    first = run(client(fake).assess_criterion("x", EXCERPTS, c_min=0.7, anchor_c_min=0.8))
    assert (first.c_min, first.anchor_c_min) == (0.7, 0.8)  # type: ignore[attr-defined]
    second = run(client(fake).assess_criterion("x", EXCERPTS, c_min=0.9))
    assert second.c_min == 0.9 and second.anchor_c_min == 0.9  # type: ignore[attr-defined]
    assert first.protocol != second.protocol, "a threshold change must change the protocol id"
    assert jev.CRITERION_PROTOCOL in first.protocol and "0.7" in first.protocol


# --- I4: the key can not be recovered from an exception ----------------------------------------
@pytest.mark.parametrize(
    "bad", ["", "has space", "tab\tkey", "line\nbreak", "chave-ç", "k\x7f", " "]
)
def test_unusable_keys_fail_before_the_request_is_built(fake: FakeJev, bad: str) -> None:
    error = refused(lambda: JevClient(lambda: bad, base_url=fake.url).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_SECRET_INVALID"
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]
    assert fake.requests == []
    assert bad.strip() == "" or bad not in str(error)


def test_the_key_is_not_recoverable_from_transport_errors() -> None:
    server = FakeJev()
    url = server.url
    server.close()
    refused_conn = refused(lambda: JevClient(lambda: KEY, base_url=url).ask({}, QUESTIONS))
    assert refused_conn.code == "PROVIDER_TRANSPORT_ERROR"
    assert_no_key(refused_conn)


def test_the_key_is_not_recoverable_from_timeouts(fake: FakeJev) -> None:
    fake.script = [{"delay": 1.5, "body": ok_body({"a": {"type": "noul", "noul": 0.5}})}]
    slow = refused(lambda: client(fake, timeout=0.3).ask({}, QUESTIONS))
    assert slow.code == "PROVIDER_TIMEOUT"
    assert_no_key(slow)


def test_the_key_is_not_recoverable_from_http_and_protocol_errors(fake: FakeJev) -> None:
    for step in ({"status": 401, "body": b"{}"}, {"body": b"not json"}):
        fake.script = [step]
        assert_no_key(refused(lambda: client(fake).ask({}, QUESTIONS)))


def test_a_transport_error_from_a_custom_client_does_not_keep_the_request() -> None:
    def explode(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadError("boom", request=request)

    custom = httpx.AsyncClient(transport=httpx.MockTransport(explode))
    error = refused(
        lambda: JevClient(lambda: KEY, base_url="http://127.0.0.1:9", client=custom).ask(
            {}, QUESTIONS
        )
    )
    assert error.code == "PROVIDER_TRANSPORT_ERROR"
    assert_no_key(error)


# --- billing state --------------------------------------------------------------------------
def test_connection_refused_was_never_sent() -> None:
    server = FakeJev()
    url = server.url
    server.close()
    error = refused(lambda: JevClient(lambda: KEY, base_url=url).ask({}, QUESTIONS))
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]


def test_connect_timeout_was_never_sent() -> None:
    def too_slow(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectTimeout("no route", request=request)

    custom = httpx.AsyncClient(transport=httpx.MockTransport(too_slow))
    error = refused(
        lambda: JevClient(lambda: KEY, base_url="http://127.0.0.1:9", client=custom).ask(
            {}, QUESTIONS
        )
    )
    assert error.code in {"PROVIDER_TIMEOUT", "PROVIDER_TRANSPORT_ERROR"}
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]


def test_a_read_timeout_after_the_send_is_billing_unknown() -> None:
    def stalled(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("stalled", request=request)

    custom = httpx.AsyncClient(transport=httpx.MockTransport(stalled))
    error = refused(
        lambda: JevClient(lambda: KEY, base_url="http://127.0.0.1:9", client=custom).ask(
            {}, QUESTIONS
        )
    )
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_task_cancellation_after_the_send_is_recorded_as_billing_unknown(fake: FakeJev) -> None:
    fake.script = [{"delay": 2, "body": ok_body({"a": {"type": "noul", "noul": 0.5}})}]

    async def scenario() -> Any:
        record = jev.CallRecord()
        task = asyncio.create_task(client(fake).ask({}, QUESTIONS, record=record))
        for _ in range(200):
            if fake.requests:
                break
            await asyncio.sleep(0.01)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):  # asyncio semantics are preserved
            await task
        return record

    record = run(scenario())
    assert record.billing_state == "BILLING_UNKNOWN"


def test_cancel_right_after_a_backoff_keeps_the_earlier_sends_unknown(fake: FakeJev) -> None:
    fake.script = [{"status": 429, "body": b"{}"}]
    cancel = asyncio.Event()

    async def set_and_return(_delay: float) -> None:
        cancel.set()  # the wait itself finishes normally

    error = refused(lambda: client(fake, sleep=set_and_return).ask({}, QUESTIONS, cancel))
    assert error.code == "CANCELLED" and len(fake.requests) == 1
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_a_cleanup_failure_never_replaces_a_result_or_a_classified_error(
    fake: FakeJev, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def broken_close(_response: Any) -> None:
        raise EvidraError("PROVIDER_CLEANUP_FAILED", "close failed")

    monkeypatch.setattr(jev, "close_response", broken_close)
    assert run(client(fake).ask({}, QUESTIONS)).attempts == 1
    fake.script = [{"status": 401, "body": b"{}"}]
    assert refused(lambda: client(fake).ask({}, QUESTIONS)).code == "PROVIDER_AUTH_ERROR"


# --- Retry-After ----------------------------------------------------------------------------------
async def _record(delays: list[float]) -> Any:
    async def sleep(delay: float) -> None:
        delays.append(delay)

    return sleep


def delays_for(fake: FakeJev, header: str | None) -> list[float]:
    delays: list[float] = []

    async def sleep(delay: float) -> None:
        delays.append(delay)

    headers = {} if header is None else {"Retry-After": header}
    fake.script = [
        {"status": 429, "headers": headers, "body": b"{}"},
        {"body": ok_body({"a": {"type": "noul", "noul": 0.5}})},
    ]
    run(client(fake, sleep=sleep, backoff_base=5, backoff_cap=60).ask({}, QUESTIONS))
    return delays


def test_retry_after_zero_means_zero(fake: FakeJev) -> None:
    assert delays_for(fake, "0") == [0]


def test_retry_after_http_date(fake: FakeJev) -> None:
    future = delays_for(fake, formatdate(time.time() + 20, usegmt=True))
    assert len(future) == 1 and 10 <= future[0] <= 20
    assert delays_for(fake, formatdate(time.time() - 3600, usegmt=True)) == [0]


@pytest.mark.parametrize("header", ["inf", "-5", "nan", "-inf", "soon", "1e999"])
def test_unusable_retry_after_falls_back_to_the_backoff(fake: FakeJev, header: str) -> None:
    assert delays_for(fake, header) == [5]  # backoff_base, never a negative or infinite wait


def test_missing_retry_after_uses_the_backoff(fake: FakeJev) -> None:
    assert delays_for(fake, None) == [5]


@pytest.mark.parametrize(
    "options",
    [
        {"max_attempts": 0},
        {"max_attempts": 100},
        {"timeout": 0},
        {"timeout": -1},
        {"timeout": math.nan},
        {"timeout": 1e9},
        {"backoff_cap": -1},
        {"backoff_cap": math.nan},
        {"backoff_cap": 1e9},
        {"backoff_base": -1},
        {"price_per_mtok": Decimal("-0.01")},
        {"price_per_mtok": Decimal("NaN")},
    ],
)
def test_configuration_is_validated_and_bounded(options: dict[str, Any]) -> None:
    with pytest.raises(EvidraError) as failure:
        JevClient(lambda: KEY, **options)
    assert failure.value.code == "INVALID_REQUEST"


# --- cost and usage ---------------------------------------------------------------------
def test_cost_is_kept_exact_and_rounded_only_for_display(fake: FakeJev) -> None:
    fake.script = [{"body": ok_body({"a": {"type": "noul", "noul": 0.5}}, tokens=123)}]
    result = run(client(fake, price_per_mtok=Decimal("0.0421")).ask({}, QUESTIONS))
    assert result.cost_usd == Decimal(123) * Decimal("0.0421") / Decimal(1_000_000)
    assert result.cost_usd != Decimal("0.000005")  # not rounded per call
    assert result.cost_display == "0.000005"


def test_a_missing_output_count_is_zero_and_a_zero_input_is_invalid(fake: FakeJev) -> None:
    answers = {"a": {"type": "noul", "noul": 0.5}}
    fake.script = [
        {
            "body": json.dumps(
                {"model": "jev-1.13.0", "answers": answers, "usage": {"input_tokens": 9}}
            ).encode()
        }
    ]
    assert run(client(fake).ask({}, QUESTIONS)).usage.output_tokens == 0
    fake.script = [
        {
            "body": json.dumps(
                {
                    "model": "jev-1.13.0",
                    "answers": answers,
                    "usage": {"input_tokens": 0, "output_tokens": 5},
                }
            ).encode()
        }
    ]
    assert refused(lambda: client(fake).ask({}, QUESTIONS)).code == "PROVIDER_PROTOCOL_ERROR"


def test_a_valid_usage_survives_a_protocol_or_model_error(fake: FakeJev) -> None:
    fake.script = [{"body": ok_body({"a": {"type": "noul", "noul": 7}}, tokens=321)}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_PROTOCOL_ERROR"
    assert error.details["usage"] == {"input_tokens": 321, "output_tokens": 42}  # type: ignore[index]
    fake.script = [
        {"body": ok_body({"a": {"type": "noul", "noul": 0.5}}, model="jev-9", tokens=654)}
    ]
    mismatch = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert mismatch.code == "PROVIDER_MODEL_MISMATCH"
    assert mismatch.details["usage"] == {"input_tokens": 654, "output_tokens": 42}  # type: ignore[index]


# --- budget with a state that is not JSON -------------------------------------------------------
@pytest.mark.parametrize("state", [{"x": object()}, {"x": {1, 2}}, {"x": float("nan")}])
def test_a_state_that_is_not_json_is_an_explicit_error_before_any_send(
    fake: FakeJev, state: Any
) -> None:
    error = refused(lambda: client(fake).ask(state, QUESTIONS))
    assert error.code in {"INVALID_REQUEST", "JEV_CONTEXT_LIMIT"}
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]
    assert fake.requests == []


# --- the missing integration cases ---------------------------------------------------------------
def test_a_429_followed_by_a_401_stops_at_the_401(fake: FakeJev) -> None:
    fake.script = [{"status": 429, "body": b"{}"}, {"status": 401, "body": b"{}"}]
    error = refused(lambda: client(fake, max_attempts=5).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_AUTH_ERROR" and len(fake.requests) == 2
    assert error.retryable is False


def test_a_compressed_response_is_refused(fake: FakeJev) -> None:
    packed = gzip.compress(ok_body({"a": {"type": "noul", "noul": 0.5}}))
    fake.script = [{"headers": {"Content-Encoding": "gzip"}, "body": packed}]
    error = refused(lambda: client(fake).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_PROTOCOL_ERROR"


def test_cancellation_while_the_body_is_being_read(fake: FakeJev) -> None:
    fake.script = [{"slow_body": {"total": 2000, "pieces": 20, "delay": 0.2}}]

    async def scenario() -> None:
        cancel = asyncio.Event()
        task = asyncio.create_task(client(fake, timeout=30).ask({}, QUESTIONS, cancel))
        for _ in range(200):
            if fake.requests:
                break
            await asyncio.sleep(0.01)
        await asyncio.sleep(0.3)  # headers are in, the body is still arriving
        started = time.monotonic()
        cancel.set()
        try:
            await task
        finally:
            assert time.monotonic() - started < 2, "cancellation did not interrupt the read"

    error = refused(scenario)
    assert error.code == "CANCELLED"
    assert error.details["billing_state"] == "BILLING_UNKNOWN"  # type: ignore[index]


def test_the_size_bound_is_applied_while_a_chunked_body_streams(fake: FakeJev) -> None:
    """No Content-Length and an endless body: only a streaming check can stop it."""
    fake.script = [{"chunked": {"total": 200_000_000, "chunk": 65_536, "delay": 0.002}}]
    started = time.monotonic()
    error = refused(lambda: client(fake, timeout=30).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_RESPONSE_TOO_LARGE"
    assert time.monotonic() - started < 10
    assert fake.written < 20_000_000, "the whole body was read before the check"


def test_a_chunked_response_without_content_length_parses(fake: FakeJev) -> None:
    body = ok_body({"a": {"type": "noul", "noul": 0.42}})
    # HTTP/1.1 chunked framing is produced by the fake for the endless case; here a plain body
    # with the connection closed (no Content-Length) must also parse.
    fake.script = [{"body": body, "headers": {}}]
    assert run(client(fake).ask({}, QUESTIONS)).answers["a"].probability == 0.42  # type: ignore[union-attr]


def test_unused_helpers_stay_importable() -> None:
    assert NoulQuestion and ChoiceQuestion


def test_a_key_supplier_that_raises_with_the_key_leaves_no_trace(fake: FakeJev) -> None:
    def leaking() -> str:
        raise RuntimeError("lookup failed for " + KEY)

    error = refused(lambda: JevClient(leaking, base_url=fake.url).ask({}, QUESTIONS))
    assert error.code == "PROVIDER_SECRET_REQUIRED"
    assert error.details["billing_state"] == "NOT_SENT"  # type: ignore[index]
    assert_no_key(error)
    assert fake.requests == []
