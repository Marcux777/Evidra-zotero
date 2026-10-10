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
from decimal import Decimal
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
    cost_usd: Decimal
    request_id: str | None
    attempts: int
    billing_state: BillingState = "CONFIRMED"


@dataclass(frozen=True)
class CriterionAssessment:
    outcome: Outcome
    reason: str  # why the outcome is not firm, or "FIRM"
    verdict: str
    verdict_confidence: float
    anchor: str
    anchor_confidence: float
    protocol: str = CRITERION_PROTOCOL
    result: JevResult | None = field(default=None, repr=False)


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
        if price_per_mtok < 0 or max_attempts < 1:
            raise EvidraError("INVALID_REQUEST", "Invalid Jev price or retry configuration.")
        self._api_key = api_key
        self._base_url = _checked_base_url(base_url)
        self._price = price_per_mtok
        self._timeout, self._attempts = timeout, max_attempts
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
        state_chars = len(json.dumps(state, ensure_ascii=False))
        sizes = [len(json.dumps(q.wire(), ensure_ascii=False)) for q in questions.values()]
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
    ) -> JevResult:
        if not questions:
            raise EvidraError("INVALID_REQUEST", "At least one question is required.")
        self.check_budget(state, questions)
        cancel = cancel or asyncio.Event()
        payload = json.dumps(
            {
                "state": state,
                "model": MODEL,
                "questions": {name: q.wire() for name, q in questions.items()},
            },
            ensure_ascii=False,
        ).encode()
        for attempt in range(1, self._attempts + 1):
            if cancel.is_set():
                raise _failure(
                    "CANCELLED",
                    "The Jev request was cancelled before it was sent.",
                    billing="NOT_SENT",
                )
            outcome = await self._send(payload, questions, cancel, attempt)
            if isinstance(outcome, JevResult):
                return outcome
            status, retry_after = outcome
            if attempt == self._attempts:
                code = "RATE_LIMITED" if status == 429 else "PROVIDER_OVERLOADED"
                raise _failure(
                    code,
                    "The Jev service is limiting requests; the batch should pause.",
                    billing="BILLING_UNKNOWN",
                    retryable=True,
                    attempts=attempt,
                    status=status,
                    retry_after_seconds=retry_after,
                )
            delay = min(self._backoff_cap, retry_after or self._backoff_base * 2 ** (attempt - 1))
            await self._wait(delay, cancel)
        raise AssertionError("unreachable")  # pragma: no cover

    async def _wait(self, delay: float, cancel: asyncio.Event) -> None:
        try:
            await cancellable(self._sleep(delay), cancel)
        except EvidraError as exc:
            if exc.code != "CANCELLED":
                raise
            raise _failure(
                "CANCELLED",
                "The Jev request was cancelled while backing off.",
                billing="BILLING_UNKNOWN",
            ) from None

    async def _send(
        self,
        payload: bytes,
        questions: Mapping[str, Question],
        cancel: asyncio.Event,
        attempt: int,
    ) -> JevResult | tuple[int, float | None]:
        response: httpx.Response | None = None
        started = time.monotonic()
        sent = False
        try:
            outbound = self._http.build_request(
                "POST",
                self._base_url + ENDPOINT,
                content=payload,
                headers={
                    "Authorization": "Bearer " + self._api_key(),
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Accept-Encoding": "identity",
                },
                timeout=self._timeout,
            )
            sent = True
            async with asyncio.timeout(self._timeout):
                response = await cancellable(
                    self._http.send(outbound, stream=True, follow_redirects=False), cancel
                )
                if response.status_code in BACKOFF_STATUSES:
                    return response.status_code, _retry_after(response)
                self._status(response)
                body = bytearray()
                async for chunk in bounded_bytes(response, cancel):
                    body.extend(chunk)
                    if len(body) > MAX_RESPONSE_BYTES:
                        raise _failure(
                            "PROVIDER_RESPONSE_TOO_LARGE",
                            "The Jev response exceeds its bound.",
                            billing="BILLING_UNKNOWN",
                        )
                latency = round((time.monotonic() - started) * 1000)
                return self._parse(
                    bytes(body),
                    questions,
                    response.headers.get("x-typesafe-request-id"),
                    attempt,
                    latency,
                )
        except EvidraError as exc:
            if exc.code == "CANCELLED" and not (exc.details or {}).get("billing_state"):
                raise _failure(
                    "CANCELLED",
                    "The Jev request was cancelled after it was sent.",
                    billing="BILLING_UNKNOWN" if sent else "NOT_SENT",
                ) from None
            if exc.details and "billing_state" in exc.details:
                raise
            raise _failure(
                exc.code, exc.message, billing="BILLING_UNKNOWN" if sent else "NOT_SENT"
            ) from exc
        except (httpx.TimeoutException, TimeoutError) as exc:
            raise _failure(
                "PROVIDER_TIMEOUT", "The Jev request timed out.", billing="BILLING_UNKNOWN"
            ) from exc
        except httpx.HTTPError as exc:
            raise _failure(
                "PROVIDER_TRANSPORT_ERROR",
                "The Jev request failed in transport.",
                billing="BILLING_UNKNOWN" if sent else "NOT_SENT",
            ) from exc
        finally:
            if response is not None:
                await close_response(response)

    @staticmethod
    def _status(response: httpx.Response) -> None:
        code = response.status_code
        if code == 200:
            return
        if code == 401:  # never retried, never another credential or provider
            raise _failure(
                "PROVIDER_AUTH_ERROR",
                "The Jev key was refused.",
                billing="BILLING_UNKNOWN",
                status=code,
            )
        if code == 422:  # never retried: the request itself is invalid
            raise _failure(
                "PROVIDER_REQUEST_INVALID",
                "The Jev service rejected the request.",
                billing="BILLING_UNKNOWN",
                status=code,
            )
        raise _failure(
            "PROVIDER_HTTP_ERROR",
            "The Jev service answered with an unexpected status.",
            billing="BILLING_UNKNOWN",
            status=code,
        )

    def _parse(
        self,
        body: bytes,
        questions: Mapping[str, Question],
        request_id: str | None,
        attempt: int,
        latency_ms: int,
    ) -> JevResult:
        def protocol(reason: str) -> EvidraError:
            return _failure(
                "PROVIDER_PROTOCOL_ERROR",
                "The Jev response does not follow its protocol.",
                billing="BILLING_UNKNOWN",
                reason=reason,
            )

        try:
            data = json.loads(body, parse_constant=_reject_constant)
        except (ValueError, UnicodeDecodeError) as exc:
            raise protocol("not_json") from exc
        if not isinstance(data, dict):
            raise protocol("not_object")
        model = data.get("model")
        if not isinstance(model, str):
            raise protocol("model_missing")
        if model != MODEL:
            raise _failure(
                "PROVIDER_MODEL_MISMATCH",
                "The Jev service answered with a model other than the pinned one.",
                billing="BILLING_UNKNOWN",
                answered=model[:80],
            )
        raw_answers, raw_usage = data.get("answers"), data.get("usage")
        if not isinstance(raw_answers, dict) or set(raw_answers) != set(questions):
            raise protocol("answers_keys")
        if not isinstance(raw_usage, dict):
            raise protocol("usage_missing")
        tokens_in, tokens_out = raw_usage.get("input_tokens"), raw_usage.get("output_tokens")
        if not _is_count(tokens_in) or not _is_count(tokens_out):
            raise protocol("usage_values")
        answers: dict[str, NoulAnswer | ChoiceAnswer] = {}
        for name, question in questions.items():
            raw = raw_answers[name]
            if not isinstance(raw, dict):
                raise protocol("answer_shape")
            if isinstance(question, NoulQuestion):
                value = raw.get("noul")
                if raw.get("type") != "noul" or not _is_probability(value):
                    raise protocol("noul_value")
                answers[name] = NoulAnswer(float(value))
                continue
            choice, confidence = raw.get("choice"), raw.get("confidence")
            probabilities = raw.get("probabilities")
            if (
                raw.get("type") != "choice"
                or not isinstance(choice, str)
                or choice not in question.options
                or not _is_probability(confidence)
                or not isinstance(probabilities, dict)
                or not set(probabilities) <= set(question.options)
                or not all(_is_probability(p) for p in probabilities.values())
            ):
                raise protocol("choice_value")
            answers[name] = ChoiceAnswer(
                choice, float(confidence), {k: float(v) for k, v in probabilities.items()}
            )
        cost = (Decimal(tokens_in) * self._price / Decimal(1_000_000)).quantize(Decimal("0.000001"))
        return JevResult(
            model=model,
            answers=answers,
            usage=Usage(int(tokens_in), int(tokens_out)),
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
    ) -> CriterionAssessment:
        """`c_min` is provisional (J0/J1a) and belongs to the protocol version."""
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
        result = await self.ask({"excerpts": dict(excerpts)}, questions, cancel)
        verdict, anchor = result.answers["verdict"], result.answers["anchor"]
        assert isinstance(verdict, ChoiceAnswer) and isinstance(anchor, ChoiceAnswer)
        return decide(
            verdict,
            anchor,
            set(excerpts),
            c_min,
            c_min if anchor_c_min is None else anchor_c_min,
            result,
        )


def decide(
    verdict: ChoiceAnswer,
    anchor: ChoiceAnswer,
    prepared: set[str],
    c_min: float,
    anchor_c_min: float,
    result: JevResult | None = None,
) -> CriterionAssessment:
    """ADR 0005: NOT_REPORTED or NONE is UNCLEAR; only an anchored, confident verdict is firm."""

    def outcome(kind: Outcome, reason: str) -> CriterionAssessment:
        return CriterionAssessment(
            outcome=kind,
            reason=reason,
            verdict=verdict.choice,
            verdict_confidence=verdict.confidence,
            anchor=anchor.choice,
            anchor_confidence=anchor.confidence,
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
    if verdict.confidence < c_min:
        return outcome("UNCLEAR", "LOW_VERDICT_CONFIDENCE")
    if anchor.confidence < anchor_c_min:
        return outcome("UNCLEAR", "LOW_ANCHOR_CONFIDENCE")
    return outcome("MET" if verdict.choice == "MET" else "NOT_MET", "FIRM")


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
    raw = response.headers.get("retry-after", "").strip()
    try:
        seconds = float(raw)
    except ValueError:
        return None
    return seconds if math.isfinite(seconds) and seconds >= 0 else None
