"""Platform-neutral parser worker protocol: child codes and the causal diagnostic envelope."""

import hashlib
import json
from typing import Any

from evidra.domain.errors import EvidraError

CHILD_CODES = {
    "INCOMPLETE_TEXT",
    "TEXT_LIMIT",
    "TEXT_ENCODING_ERROR",
    "INVALID_TEXT_DOCUMENT",
    "UNSUPPORTED_TEXT_FORMAT",
    "PAGE_LIMIT",
    "INVALID_PAGE",
    "INVALID_REGION",
    "PREVIEW_PIXEL_LIMIT",
    "PREVIEW_TRANSPORT_LIMIT",
    "FILE_LIMIT",
    "PARSER_VERSION_MISMATCH",
    "EVIDENCE_INVARIANT",
    "INVALID_TEXT_OFFSET",
    "INVALID_ORIGINAL_UNIT",
}


def diagnostic(error: BaseException) -> dict[str, Any]:
    causes: list[dict[str, str | int | None]] = []
    seen: set[int] = set()
    current: BaseException | None = error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        causes.append(
            {
                "type": type(current).__name__,
                "code": current.code if isinstance(current, EvidraError) else None,
                "errno": getattr(current, "errno", None),
                "winerror": getattr(current, "winerror", None),
                "pdfium_error": getattr(current, "err_code", None),
            }
        )
        current = current.__cause__ or (
            current.__context__ if not current.__suppress_context__ else None
        )
    return {"causes": causes}


def child_diagnostic(output: bytes) -> dict[str, Any]:
    """Only the structured causal protocol reaches logs; unexpected stderr is hashed."""
    try:
        value = json.loads(output)
    except (ValueError, UnicodeDecodeError):
        return {"stderr_bytes": len(output), "stderr_sha256": hashlib.sha256(output).hexdigest()}
    causes = value.get("causes") if isinstance(value, dict) else None
    allowed = {"type", "code", "errno", "winerror", "pdfium_error"}
    if (
        not isinstance(causes, list)
        or len(causes) > 32
        or any(
            not isinstance(cause, dict)
            or set(cause) != allowed
            or any(
                v is not None
                and not isinstance(v, int)
                and (not isinstance(v, str) or not v.isidentifier() or len(v) > 80)
                for v in cause.values()
            )
            for cause in causes
        )
    ):
        return {"stderr_bytes": len(output), "stderr_sha256": hashlib.sha256(output).hexdigest()}
    return {"causes": causes}
