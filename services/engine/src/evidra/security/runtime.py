"""Loopback session authorization. Browser origins have no privileges."""

import hmac
import re
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from threading import Lock

from pydantic import SecretStr
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from evidra.domain.errors import STATUS_CODES, EvidraError, public_error
from evidra.storage.cache import CacheLimits


@dataclass(frozen=True)
class RuntimeSettings:
    data_dir: Path
    profile_instance_id: str
    session_token: SecretStr = field(repr=False)
    port: int
    monotonic_clock: Callable[[], float] = field(default=time.monotonic, repr=False)
    cache_limits: CacheLimits = field(default_factory=CacheLimits)

    def __post_init__(self) -> None:
        if not self.data_dir.is_absolute():
            raise EvidraError("INVALID_RUNTIME", "An absolute data directory is required.")
        if not self.profile_instance_id or len(self.profile_instance_id) > 200:
            raise EvidraError("INVALID_RUNTIME", "Invalid profile identity.")
        if not 1 <= self.port <= 65535 or self.port == 23119:
            raise EvidraError("INVALID_RUNTIME", "Invalid engine port.")
        if not re.fullmatch(r"[0-9a-f]{64}", self.session_token.get_secret_value()):
            raise EvidraError("INVALID_RUNTIME", "A 256-bit session credential is required.")


class BridgeSession:
    def __init__(self, settings: RuntimeSettings) -> None:
        self.settings = settings
        self._lock = Lock()
        self._last_heartbeat = settings.monotonic_clock()

    def assert_current(self) -> None:
        with self._lock:
            self._check()

    def _check(self) -> None:
        if self.settings.monotonic_clock() - self._last_heartbeat > 30:
            raise EvidraError("BRIDGE_EXPIRED", "The bridge session has expired.")

    def heartbeat(self) -> None:
        with self._lock:
            self._check()
            self._last_heartbeat = self.settings.monotonic_clock()


class SessionGuard:
    def __init__(self, app: ASGIApp, settings: RuntimeSettings) -> None:
        self.app = app
        self.settings = settings

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        try:
            headers: dict[bytes, list[bytes]] = {}
            for key, value in scope["headers"]:
                headers.setdefault(key.lower(), []).append(value)
            host = f"127.0.0.1:{self.settings.port}".encode()
            if headers.get(b"host") != [host] or b"origin" in headers:
                raise EvidraError("FORBIDDEN", "Request origin is not permitted.")
            if scope["path"] != "/health":
                credential = headers.get(b"authorization", [])
                if scope["path"].startswith("/v1/mcp/gateway/"):
                    if headers.get(b"x-evidra-client") != [b"mcp"] or len(credential) != 1:
                        raise EvidraError("FORBIDDEN", "A scoped MCP credential is required.")
                    scope.setdefault("state", {})["mcp_principal"] = scope[
                        "app"
                    ].state.services.mcp.authenticate(credential[0])
                else:
                    if headers.get(b"x-evidra-client") != [b"bridge"]:
                        raise EvidraError("FORBIDDEN", "A bridge client is required.")
                    expected = b"Bearer " + self.settings.session_token.get_secret_value().encode()
                    if len(credential) != 1 or not hmac.compare_digest(credential[0], expected):
                        raise EvidraError("UNAUTHENTICATED", "Invalid session credential.")
                scope["app"].state.services.session.assert_current()
            lengths = headers.get(b"content-length", [])
            if lengths and (len(lengths) != 1 or not lengths[0].isdigit()):
                raise EvidraError("INVALID_REQUEST", "Invalid request framing.")
            if lengths and int(lengths[0]) > 65536:
                raise EvidraError("BODY_TOO_LARGE", "Request body exceeds the permitted size.")
            body = bytearray()
            while True:
                message = await receive()
                if message["type"] == "http.disconnect":
                    return
                body.extend(message.get("body", b""))
                if len(body) > 65536:
                    raise EvidraError("BODY_TOO_LARGE", "Request body exceeds the permitted size.")
                if not message.get("more_body", False):
                    break
            delivered = False

            async def bounded_receive() -> Message:
                nonlocal delivered
                if delivered:
                    return await receive()
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}

            if scope["path"] != "/health":
                scope["app"].state.services.session.assert_current()
            await self.app(scope, bounded_receive, send)
        except EvidraError as exc:
            await JSONResponse(
                public_error(exc).model_dump(), status_code=STATUS_CODES.get(exc.code, 500)
            )(scope, receive, send)
