"""Jev (TypeSafe System One) adapter: the single analysis provider of v1 (ADR 0005).

Scope: transport, protocol validation, error policy, usage and price. The persisted accounting
(profile admission, budgets, consent per notebook) belongs to the provider registry and is wired
separately.

Rules taken from the ADR:

* the model is pinned (`jev-1.13.0`); an alias is refused at construction and a response that
  names another model is refused (`PROVIDER_MODEL_MISMATCH`);
* 401 and 422 are never retried; 429 and 529 back off with a ceiling and then fail so the batch
  can pause; there is no other provider and no other credential;
* a failure after the request left the process leaves `billing_state = BILLING_UNKNOWN` (usage and
  cost are never estimated); a failure before it leaves `NOT_SENT`;
* the request is checked against the planning budget (97 000 characters for the state plus the
  longest question, and the 64k-token request ceiling) before anything is sent;
* the API key comes from a callable (the Secret Service, never the environment), is attached only
  to the request, and appears in no error, detail or `repr`.

The per-criterion form is the one that won J1a: a `MET / NOT_MET / NOT_REPORTED` choice plus an
anchor choice over the prepared excerpt IDs and `NONE`. Instructions and options are English and
are part of the protocol version (`CRITERION_PROTOCOL`).
"""

import asyncio
import json
import math
import subprocess
import time
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal
from email.utils import parsedate_to_datetime
from typing import Any, Literal, TypeGuard
from urllib.parse import urlsplit

import httpx

from evidra.domain.errors import EvidraError
from evidra.providers.base import bounded_bytes, cancellable, close_response

MODEL = "jev-1.13.0"
DEFAULT_BASE_URL = "https://api.typesafe.ai"
ENDPOINT = "/v1/systemone"
PRICE_PER_MTOK_INPUT = Decimal("0.042")  # US$; configurable, output is free
CRITERION_PROTOCOL = "jev-criterion-a/1"
NONE_ANCHOR = "NONE"

TOKENS_FIXED = 178  # ADR 0005 / J0: input_tokens ~= 178 + 0.278 * characters
TOKENS_PER_CHAR = 0.278
PLANNING_CHARACTERS = 97_000  # state + the longest question (32k-token ceiling, 15% margin)
REQUEST_TOKEN_CEILING = 64_000
REQUEST_TOKEN_MARGIN = 0.85
MAX_RESPONSE_BYTES = 1_000_000
REQUEST_TIMEOUT_SECONDS = 60.0
BACKOFF_STATUSES = frozenset({429, 529})
PROBABILITY_SUM_TOLERANCE = 0.02  # |sum(p) - 1|
CONFIDENCE_SLACK = 1e-6  # confidence may not exceed p[choice] by more than this
MAX_KEY_LENGTH = 4096
MAX_ATTEMPTS = 10
MAX_TIMEOUT_SECONDS = 600.0
MAX_BACKOFF_SECONDS = 3600.0

BillingState = Literal["NOT_SENT", "BILLING_UNKNOWN", "CONFIRMED"]
Outcome = Literal["MET", "NOT_MET", "UNCLEAR"]

VERDICT_CRITERIA = {
    "MET": "The excerpts explicitly support the statement.",
    "NOT_MET": "An excerpt explicitly contradicts the statement or states the opposite.",
    "NOT_REPORTED": "No excerpt addresses the statement.",
}


@dataclass(frozen=True)
class NoulQuestion:
    instructions: str
    criteria: Mapping[str, str] | None = None

    def wire(self) -> dict[str, Any]:
        body: dict[str, Any] = {"type": "noul", "instructions": self.instructions}
        if self.criteria is not None:
            body["criteria"] = dict(self.criteria)
        return body


@dataclass(frozen=True)
class ChoiceQuestion:
    instructions: str
    options: Mapping[str, str | None]  # option id -> optional description

    def wire(self) -> dict[str, Any]:
        return {
            "type": "choice",
            "instructions": self.instructions,
            "criteria": dict(self.options),
        }


Question = NoulQuestion | ChoiceQuestion


@dataclass(frozen=True)
class NoulAnswer:
    probability: float


@dataclass(frozen=True)
class ChoiceAnswer:
    choice: str
    confidence: float
    probabilities: Mapping[str, float]


@dataclass(frozen=True)
class Usage:
    input_tokens: int
    output_tokens: int


@dataclass(frozen=True)
class JevResult:
    model: str
    answers: Mapping[str, NoulAnswer | ChoiceAnswer]
    usage: Usage
    cost_usd: Decimal  # exact, never rounded per call
    request_id: str | None
    attempts: int
    billing_state: BillingState = "CONFIRMED"

    @property
    def cost_display(self) -> str:
        return str(self.cost_usd.quantize(Decimal("0.000001")))


@dataclass
class CallRecord:
    """What the caller must know about one call even if `ask` never returns normally.

    Pass one to `ask` to learn the billing state after an asyncio cancellation, which propagates
    as `CancelledError` (the semantics of task cancellation are preserved).
    """

    billing_state: BillingState = "NOT_SENT"
    attempts_sent: int = 0
    usage: Usage | None = None
    cleanup_failed: bool = False


@dataclass(frozen=True)
class CriterionAssessment:
    outcome: Outcome
    reason: str  # why the outcome is not firm, or "FIRM"
    verdict: str
    verdict_confidence: float
    anchor: str
    anchor_confidence: float
    c_min: float
    anchor_c_min: float
    protocol: str  # CRITERION_PROTOCOL plus the thresholds: a change invalidates old decisions
    result: JevResult | None = field(default=None, repr=False)


def criterion_protocol_id(c_min: float, anchor_c_min: float) -> str:
    return f"{CRITERION_PROTOCOL};c_min={c_min:g};anchor_c_min={anchor_c_min:g}"


def estimate_tokens(characters: int) -> int:
    return math.ceil(round(TOKENS_FIXED + TOKENS_PER_CHAR * characters, 6))


def secret_service_api_key() -> str:
    """The key lives only in the Secret Service (`service=typesafe`); no environment fallback."""
    try:
        done = subprocess.run(
            ["secret-tool", "lookup", "service", "typesafe"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise EvidraError(
            "KEYRING_UNAVAILABLE", "The Secret Service could not be queried."
        ) from exc
    key = done.stdout.strip()
    if done.returncode != 0 or not key:
        raise EvidraError("PROVIDER_SECRET_REQUIRED", "The Jev API key is not in the keyring.")
    return key


def _failure(
    code: str,
    message: str,
    *,
    billing: BillingState,
    retryable: bool = False,
    **details: Any,
) -> EvidraError:
    """Built, never raised here: an error raised outside any handler carries no chained cause."""
    return EvidraError(
        code,
        message,
        retryable=retryable,
        details={"billing_state": billing, "provider": "jev", "model": MODEL, **details},
    )


def _checked_base_url(value: str) -> str:
    parts = urlsplit(value)
    loopback = parts.hostname in {"127.0.0.1", "localhost", "::1"}
    if parts.scheme != "https" and not (parts.scheme == "http" and loopback):
        raise EvidraError(
            "INVALID_REQUEST", "The Jev endpoint must be https (http only for loopback)."
        )
    if parts.username or parts.password or parts.query or parts.fragment:
        raise EvidraError("INVALID_REQUEST", "The Jev endpoint must be a plain origin.")
    return value.rstrip("/")


def _bounded(value: Any, low: float, high: float, *, open_low: bool = False) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
        and (value > low if open_low else value >= low)
        and value <= high
    )


def _threshold(name: str, value: Any) -> float:
    if not _bounded(value, 0.0, 1.0, open_low=True):
        raise EvidraError("INVALID_REQUEST", f"{name} must be finite with 0 < value <= 1.")
    return float(value)


def _usable_key(key: Any) -> bool:
    return (
        isinstance(key, str)
        and 1 <= len(key) <= MAX_KEY_LENGTH
        and all(0x21 <= ord(c) <= 0x7E for c in key)
    )


# connect-phase failures: the request bytes cannot have left the process
_NEVER_SENT = (
    httpx.ConnectError,
    httpx.ConnectTimeout,
    httpx.PoolTimeout,
    httpx.UnsupportedProtocol,
)


class JevClient:
    def __init__(
        self,
        api_key: Callable[[], str],
        *,
        base_url: str = DEFAULT_BASE_URL,
        model: str = MODEL,
        price_per_mtok: Decimal = PRICE_PER_MTOK_INPUT,
        client: httpx.AsyncClient | None = None,
        timeout: float = REQUEST_TIMEOUT_SECONDS,
        max_attempts: int = 4,
        backoff_base: float = 1.0,
        backoff_cap: float = 30.0,
        sleep: Callable[[float], Any] = asyncio.sleep,
    ) -> None:
        if model != MODEL:
            raise EvidraError(
                "INVALID_REQUEST", f"Only the pinned model {MODEL} is allowed, never an alias."
            )
        if not isinstance(price_per_mtok, Decimal) or not price_per_mtok.is_finite():
            raise EvidraError("INVALID_REQUEST", "The Jev price must be a finite Decimal.")
        if price_per_mtok < 0:
            raise EvidraError("INVALID_REQUEST", "The Jev price cannot be negative.")
        if (
            not isinstance(max_attempts, int)
            or isinstance(max_attempts, bool)
            or not 1 <= max_attempts <= MAX_ATTEMPTS
        ):
            raise EvidraError("INVALID_REQUEST", f"max_attempts must be 1..{MAX_ATTEMPTS}.")
        if not _bounded(timeout, 0.0, MAX_TIMEOUT_SECONDS, open_low=True):
            raise EvidraError(
                "INVALID_REQUEST", f"timeout must be finite and in (0, {MAX_TIMEOUT_SECONDS:g}]."
            )
        for name, value in (("backoff_base", backoff_base), ("backoff_cap", backoff_cap)):
            if not _bounded(value, 0.0, MAX_BACKOFF_SECONDS):
                raise EvidraError(
                    "INVALID_REQUEST", f"{name} must be finite and in [0, {MAX_BACKOFF_SECONDS:g}]."
                )
        self._api_key = api_key
        self._base_url = _checked_base_url(base_url)
        self._price = price_per_mtok
        self._timeout, self._attempts = float(timeout), max_attempts
        self._backoff_base, self._backoff_cap, self._sleep = backoff_base, backoff_cap, sleep
        self._owned = client is None
        self._http = client or httpx.AsyncClient(
            trust_env=False,
            follow_redirects=False,
            timeout=httpx.Timeout(timeout, connect=10),
            limits=httpx.Limits(max_connections=4),
            transport=httpx.AsyncHTTPTransport(retries=0, trust_env=False, verify=True),
        )

    def __repr__(self) -> str:  # never show the key supplier or any credential
        return f"JevClient(model={MODEL!r}, base_url={self._base_url!r})"

    async def aclose(self) -> None:
        if self._owned:
            await self._http.aclose()

    # ---- budget -----------------------------------------------------------------------------
    @staticmethod
    def check_budget(state: Any, questions: Mapping[str, Question]) -> int:
        """Return the estimated input tokens, or refuse before anything is sent."""
        try:
            state_chars = len(json.dumps(state, ensure_ascii=False, allow_nan=False))
            sizes = [
                len(json.dumps(q.wire(), ensure_ascii=False, allow_nan=False))
                for q in questions.values()
            ]
        except (TypeError, ValueError, RecursionError):
            raise _failure(
                "INVALID_REQUEST",
                "The state or a question is not JSON serializable.",
                billing="NOT_SENT",
            ) from None
        total_chars = state_chars + sum(sizes)
        if state_chars + max(sizes, default=0) > PLANNING_CHARACTERS:
            raise _failure(
                "JEV_CONTEXT_LIMIT",
                "The state plus the longest question exceed the planning limit.",
                billing="NOT_SENT",
                characters=state_chars + max(sizes, default=0),
                limit=PLANNING_CHARACTERS,
            )
        estimate = estimate_tokens(total_chars)
        if estimate > REQUEST_TOKEN_CEILING * REQUEST_TOKEN_MARGIN:
            raise _failure(
                "JEV_CONTEXT_LIMIT",
                "The request exceeds the per-request token budget.",
                billing="NOT_SENT",
                estimated_tokens=estimate,
                limit=int(REQUEST_TOKEN_CEILING * REQUEST_TOKEN_MARGIN),
            )
        return estimate

    # ---- transport --------------------------------------------------------------------------
    async def ask(
        self,
        state: Any,
        questions: Mapping[str, Question],
        cancel: asyncio.Event | None = None,
        record: CallRecord | None = None,
    ) -> JevResult:
        if not questions:
            raise EvidraError("INVALID_REQUEST", "At least one question is required.")
        record = record if record is not None else CallRecord()
        self.check_budget(state, questions)
        cancel = cancel or asyncio.Event()
        payload = json.dumps(
            {
                "state": state,
                "model": MODEL,
                "questions": {name: q.wire() for name, q in questions.items()},
            },
            ensure_ascii=False,
            allow_nan=False,
        ).encode()
        for attempt in range(1, self._attempts + 1):
            if cancel.is_set():
                raise _failure(
                    "CANCELLED",
                    "The Jev request was cancelled before it was sent.",
                    billing=record.billing_state,
                    attempts=attempt - 1,
                )
            outcome = await self._send(payload, questions, cancel, attempt, record)
            if isinstance(outcome, JevResult):
                record.billing_state = "CONFIRMED"
                record.usage = outcome.usage
                return outcome
            if isinstance(outcome, EvidraError):
                raise outcome
            status, retry_after = outcome
            if attempt == self._attempts:
                code = "RATE_LIMITED" if status == 429 else "PROVIDER_OVERLOADED"
                raise _failure(
                    code,
                    "The Jev service is limiting requests; the batch should pause.",
                    billing=record.billing_state,
                    retryable=True,
                    attempts=attempt,
                    status=status,
                    retry_after_seconds=retry_after,
                )
            wait = (
                retry_after if retry_after is not None else self._backoff_base * 2 ** (attempt - 1)
            )
            failure = await self._wait(min(self._backoff_cap, wait), cancel, record, attempt)
            if failure is not None:
                raise failure
        raise AssertionError("unreachable")  # pragma: no cover

    async def _wait(
        self, delay: float, cancel: asyncio.Event, record: CallRecord, attempt: int
    ) -> EvidraError | None:
        try:
            await cancellable(self._sleep(delay), cancel)
        except EvidraError as exc:
            if exc.code != "CANCELLED":
                return _failure(exc.code, exc.message, billing=record.billing_state)
            return _failure(
                "CANCELLED",
                "The Jev request was cancelled while backing off.",
                billing=record.billing_state,
                attempts=attempt,
            )
        return None

    async def _send(
        self,
        payload: bytes,
        questions: Mapping[str, Question],
        cancel: asyncio.Event,
        attempt: int,
        record: CallRecord,
    ) -> JevResult | tuple[int, float | None] | EvidraError:
        """One attempt. Failures are returned, so that no cause or context is chained."""
        box: dict[str, httpx.Response] = {}
        try:
            return await self._exchange(payload, questions, cancel, attempt, record, box)
        finally:
            response = box.get("response")
            if response is not None:
                try:
                    await close_response(response)
                except Exception:  # a cleanup failure never replaces a classified outcome
                    record.cleanup_failed = True

    async def _exchange(
        self,
        payload: bytes,
        questions: Mapping[str, Question],
        cancel: asyncio.Event,
        attempt: int,
        record: CallRecord,
        box: dict[str, httpx.Response],
    ) -> JevResult | tuple[int, float | None] | EvidraError:
        previous = (record.billing_state, record.attempts_sent)
        marked = False

        def mark_sent() -> None:
            nonlocal marked
            if not marked:
                marked = True
                record.billing_state = "BILLING_UNKNOWN"
                record.attempts_sent += 1

        async def trace(name: str, _info: Any) -> None:
            if name.endswith("send_request_headers.started"):
                mark_sent()  # the first request byte is about to leave

        try:
            key = self._api_key()
        except EvidraError as exc:
            return _failure(exc.code, exc.message, billing=record.billing_state)
        except Exception:  # the supplier's own exception may hold the secret: drop it
            return _failure(
                "PROVIDER_SECRET_REQUIRED",
                "The Jev API key could not be obtained.",
                billing=record.billing_state,
            )
        if not _usable_key(key):
            return _failure(
                "PROVIDER_SECRET_INVALID",
                "The Jev API key is empty or has characters not allowed in a header.",
                billing=record.billing_state,
            )
        request = self._http.build_request(
            "POST",
            self._base_url + ENDPOINT,
            content=payload,
            headers={
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "identity",
            },
            timeout=self._timeout,
            extensions={"trace": trace} if self._owned else None,
        )
        del key
        if not self._owned:
            mark_sent()  # an injected client gives no trace: assume the bytes may leave
        started = time.monotonic()
        try:
            async with asyncio.timeout(self._timeout):
                response = await cancellable(
                    self._http.send(request, stream=True, follow_redirects=False), cancel
                )
                box["response"] = response
                if response.status_code in BACKOFF_STATUSES:
                    return response.status_code, _retry_after(response)
                problem = self._status(response, record)
                if problem is not None:
                    return problem
                body = bytearray()
                async for chunk in bounded_bytes(response, cancel):
                    body.extend(chunk)
                    if len(body) > MAX_RESPONSE_BYTES:
                        return _failure(
                            "PROVIDER_RESPONSE_TOO_LARGE",
                            "The Jev response exceeds its bound.",
                            billing=record.billing_state,
                        )
                return self._parse(
                    bytes(body),
                    questions,
                    response.headers.get("x-typesafe-request-id"),
                    attempt,
                    record,
                    round((time.monotonic() - started) * 1000),
                )
        except EvidraError as exc:
            if exc.details and "billing_state" in exc.details:
                return exc
            return _failure(exc.code, exc.message, billing=record.billing_state)
        except (httpx.TimeoutException, TimeoutError) as exc:
            if isinstance(exc, _NEVER_SENT) and not self._owned and marked:
                record.billing_state, record.attempts_sent = previous  # connect-phase: unsent
            return _failure(
                "PROVIDER_TIMEOUT", "The Jev request timed out.", billing=record.billing_state
            )
        except httpx.HTTPError as exc:
            if isinstance(exc, _NEVER_SENT) and not self._owned and marked:
                record.billing_state, record.attempts_sent = previous
            return _failure(
                "PROVIDER_TRANSPORT_ERROR",
                "The Jev request failed in transport.",
                billing=record.billing_state,
            )
        # asyncio.CancelledError is not caught: it propagates, and `record` already says
        # BILLING_UNKNOWN whenever the first byte was (or may have been) sent.

    @staticmethod
    def _status(response: httpx.Response, record: CallRecord) -> EvidraError | None:
        code = response.status_code
        if code == 200:
            return None
        billing = record.billing_state
        if code == 401:  # never retried, never another credential or provider
            return _failure(
                "PROVIDER_AUTH_ERROR", "The Jev key was refused.", billing=billing, status=code
            )
        if code == 422:  # never retried: the request itself is invalid
            return _failure(
                "PROVIDER_REQUEST_INVALID",
                "The Jev service rejected the request.",
                billing=billing,
                status=code,
            )
        return _failure(
            "PROVIDER_HTTP_ERROR",
            "The Jev service answered with an unexpected status.",
            billing=billing,
            status=code,
        )

    def _parse(
        self,
        body: bytes,
        questions: Mapping[str, Question],
        request_id: str | None,
        attempt: int,
        record: CallRecord,
        latency_ms: int,
    ) -> JevResult | EvidraError:
        usage_details: dict[str, Any] = {}

        def protocol(reason: str) -> EvidraError:
            return _failure(
                "PROVIDER_PROTOCOL_ERROR",
                "The Jev response does not follow its protocol.",
                billing=record.billing_state,
                reason=reason,
                **usage_details,
            )

        try:
            data = json.loads(body, parse_constant=_reject_constant)
        except (ValueError, UnicodeDecodeError):
            return protocol("not_json")
        if not isinstance(data, dict):
            return protocol("not_object")
        usage = _usage(data.get("usage"))
        if usage is not None:  # a valid usage is kept even when the rest is refused
            record.usage = usage
            usage_details["usage"] = {
                "input_tokens": usage.input_tokens,
                "output_tokens": usage.output_tokens,
            }
        model = data.get("model")
        if not isinstance(model, str):
            return protocol("model_missing")
        if model != MODEL:
            return _failure(
                "PROVIDER_MODEL_MISMATCH",
                "The Jev service answered with a model other than the pinned one.",
                billing=record.billing_state,
                answered=model[:80],
                **usage_details,
            )
        raw_answers = data.get("answers")
        if not isinstance(raw_answers, dict) or set(raw_answers) != set(questions):
            return protocol("answers_keys")
        if usage is None:
            return protocol("usage_values")
        answers: dict[str, NoulAnswer | ChoiceAnswer] = {}
        for name, question in questions.items():
            raw = raw_answers[name]
            if not isinstance(raw, dict):
                return protocol("answer_shape")
            if isinstance(question, NoulQuestion):
                value = raw.get("noul")
                if raw.get("type") != "noul" or not _is_probability(value):
                    return protocol("noul_value")
                answers[name] = NoulAnswer(float(value))
                continue
            parsed = _choice(raw, question)
            if parsed is None:
                return protocol("choice_value")
            answers[name] = parsed
        cost = Decimal(usage.input_tokens) * self._price / Decimal(1_000_000)
        return JevResult(
            model=model,
            answers=answers,
            usage=usage,
            cost_usd=cost,
            request_id=request_id[:128] if request_id else None,
            attempts=attempt,
        )

    # ---- per-criterion form (J1a winner) ----------------------------------------------------
    async def assess_criterion(
        self,
        statement: str,
        excerpts: Mapping[str, str],
        *,
        c_min: float = 0.70,
        anchor_c_min: float | None = None,
        cancel: asyncio.Event | None = None,
        record: CallRecord | None = None,
    ) -> CriterionAssessment:
        """`c_min` is provisional (J0/J1a) and belongs to the protocol version."""
        verdict_min = _threshold("c_min", c_min)
        anchor_min = _threshold("anchor_c_min", c_min if anchor_c_min is None else anchor_c_min)
        if not excerpts or NONE_ANCHOR in excerpts:
            raise EvidraError(
                "INVALID_REQUEST", "Prepared excerpts are required and ids are opaque."
            )
        options: dict[str, str | None] = {identifier: None for identifier in excerpts}
        options[NONE_ANCHOR] = "No excerpt addresses the statement."
        questions: dict[str, Question] = {
            "verdict": ChoiceQuestion(
                "Based only on the excerpts, is the following statement met (MET), contradicted "
                f"(NOT_MET) or not addressed (NOT_REPORTED)? Statement: {statement}",
                VERDICT_CRITERIA,
            ),
            "anchor": ChoiceQuestion(
                "Which excerpt states whether the following statement holds? "
                f"Statement: {statement} Answer with the excerpt ID, or NONE if no excerpt "
                "addresses the statement.",
                options,
            ),
        }
        result = await self.ask({"excerpts": dict(excerpts)}, questions, cancel, record)
        verdict, anchor = result.answers["verdict"], result.answers["anchor"]
        assert isinstance(verdict, ChoiceAnswer) and isinstance(anchor, ChoiceAnswer)
        return decide(verdict, anchor, set(excerpts), verdict_min, anchor_min, result)


def decide(
    verdict: ChoiceAnswer,
    anchor: ChoiceAnswer,
    prepared: set[str],
    c_min: float,
    anchor_c_min: float,
    result: JevResult | None = None,
) -> CriterionAssessment:
    """ADR 0005: NOT_REPORTED or NONE is UNCLEAR; only an anchored, confident verdict is firm.

    Comparisons are written `not (value >= threshold)` so that a NaN is UNCLEAR, never firm.
    """
    c_min = _threshold("c_min", c_min)
    anchor_c_min = _threshold("anchor_c_min", anchor_c_min)

    def outcome(kind: Outcome, reason: str) -> CriterionAssessment:
        return CriterionAssessment(
            outcome=kind,
            reason=reason,
            verdict=verdict.choice,
            verdict_confidence=verdict.confidence,
            anchor=anchor.choice,
            anchor_confidence=anchor.confidence,
            c_min=c_min,
            anchor_c_min=anchor_c_min,
            protocol=criterion_protocol_id(c_min, anchor_c_min),
            result=result,
        )

    if verdict.choice == "NOT_REPORTED":
        return outcome("UNCLEAR", "NOT_REPORTED")
    if verdict.choice not in {"MET", "NOT_MET"}:
        return outcome("UNCLEAR", "UNKNOWN_VERDICT")
    if anchor.choice == NONE_ANCHOR:
        return outcome("UNCLEAR", "NO_ANCHOR")
    if anchor.choice not in prepared:
        return outcome("UNCLEAR", "ANCHOR_NOT_PREPARED")
    if not (verdict.confidence >= c_min):
        return outcome("UNCLEAR", "LOW_VERDICT_CONFIDENCE")
    if not (anchor.confidence >= anchor_c_min):
        return outcome("UNCLEAR", "LOW_ANCHOR_CONFIDENCE")
    return outcome("MET" if verdict.choice == "MET" else "NOT_MET", "FIRM")


def _choice(raw: dict[str, Any], question: ChoiceQuestion) -> ChoiceAnswer | None:
    """A choice answer must be internally consistent, or it is not an answer at all."""
    picked, confidence, probabilities = (
        raw.get("choice"),
        raw.get("confidence"),
        raw.get("probabilities"),
    )
    if (
        raw.get("type") != "choice"
        or not isinstance(picked, str)
        or picked not in question.options
        or not _is_probability(confidence)
        or not isinstance(probabilities, dict)
        or set(probabilities) != set(question.options)  # exactly the offered options
        or not all(_is_probability(p) for p in probabilities.values())
    ):
        return None
    if abs(sum(probabilities.values()) - 1.0) > PROBABILITY_SUM_TOLERANCE:
        return None
    if probabilities[picked] < max(probabilities.values()) - 1e-9:  # not the most probable
        return None
    # Measured on 393 real answers: `confidence` is a separate, more conservative figure
    # (13% are below p[choice] by up to 0.17) and is never above it. Only the dangerous
    # direction is inconsistent.
    if confidence > probabilities[picked] + CONFIDENCE_SLACK:
        return None
    return ChoiceAnswer(picked, float(confidence), {k: float(v) for k, v in probabilities.items()})


def _usage(raw: Any) -> Usage | None:
    if not isinstance(raw, dict):
        return None
    tokens_in = raw.get("input_tokens")
    tokens_out = raw.get("output_tokens", 0)  # an absent output count is zero (it is free)
    if not _is_count(tokens_in) or tokens_in < 1 or not _is_count(tokens_out):
        return None
    return Usage(int(tokens_in), int(tokens_out))


def _reject_constant(value: str) -> None:
    raise ValueError("Nonfinite values are not JSON.")


def _is_probability(value: Any) -> TypeGuard[float]:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
        and 0.0 <= value <= 1.0
    )


def _is_count(value: Any) -> TypeGuard[int]:
    return isinstance(value, int) and not isinstance(value, bool) and 0 <= value < 10**9


def _retry_after(response: httpx.Response) -> float | None:
    """Seconds to wait, or None if the header is absent or unusable (0 is a real value)."""
    raw = response.headers.get("retry-after", "").strip()
    if not raw:
        return None
    try:
        seconds = float(raw)
    except ValueError:
        try:
            when = parsedate_to_datetime(raw)
        except (TypeError, ValueError, IndexError):
            return None
        if when.tzinfo is None:
            when = when.replace(tzinfo=UTC)
        return max(0.0, (when - datetime.now(UTC)).total_seconds())
    return seconds if math.isfinite(seconds) and seconds >= 0 else None
