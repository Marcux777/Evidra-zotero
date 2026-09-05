"""Domain failures; public details are intentionally restricted to safe metadata."""

from typing import Any

from pydantic import BaseModel


class EvidraError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.retryable = retryable
        self.details = details


class ErrorResponse(BaseModel):
    code: str
    message: str
    retryable: bool = False
    run_id: str | None = None
    details: dict[str, int | str] | None = None


def public_error(error: EvidraError) -> ErrorResponse:
    # Do not serialize arbitrary exception details (which may contain user input/secrets).
    return ErrorResponse(code=error.code, message=error.message, retryable=error.retryable)


STATUS_CODES = {
    "FORBIDDEN": 403,
    "UNAUTHENTICATED": 401,
    "BRIDGE_EXPIRED": 503,
    "BODY_TOO_LARGE": 413,
    "INVALID_REQUEST": 422,
    "NOT_FOUND": 404,
    "IDEMPOTENCY_CONFLICT": 409,
}
