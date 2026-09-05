"""Start the owned engine from a private, one-use bridge handshake."""

import argparse
import asyncio
import json
import re
import socket
import subprocess
import sys
from pathlib import Path
from typing import Any

import uvicorn
from pydantic import ValidationError

from evidra.api.app import create_app
from evidra.domain.errors import EvidraError
from evidra.security.handshake import (
    Handshake,
    consume_handshake,
    remove_connection_receipt,
    write_connection_receipt,
)
from evidra.security.runtime import RuntimeSettings


def startup_diagnostic(operation: str, error: BaseException) -> dict[str, Any]:
    """Project the original cause chain onto safe fields; never serialize exception input."""
    causes: list[dict[str, Any]] = []
    current: BaseException | None = error
    visited: set[int] = set()
    while current is not None and id(current) not in visited:
        visited.add(id(current))
        cause: dict[str, Any] = {"type": type(current).__name__}
        if isinstance(current, EvidraError):
            cause["code"] = current.code
            if current.details and current.details.get("operation") in {
                "protect_acl",
                "validate_acl",
            }:
                cause["operation"] = current.details["operation"]
        elif isinstance(current, ValidationError):
            cause["errors"] = [
                {
                    "type": item["type"],
                    "field": item["loc"][0]
                    if item["loc"] and item["loc"][0] in Handshake.model_fields
                    else "<unrecognized-field>",
                }
                for item in current.errors(
                    include_input=False, include_context=False, include_url=False
                )
            ]
        elif isinstance(current, OSError):
            cause["errno"] = current.errno
            cause["winerror"] = getattr(current, "winerror", None)
        elif isinstance(current, subprocess.CalledProcessError):
            cause["returncode"] = current.returncode
            # This fixed producer sends only reason/type/category/position/numeric fields.
            # Raw PowerShell stderr may include paths, commands or inputs and is never emitted.
            stderr = current.stderr
            if isinstance(stderr, bytes):
                stderr = stderr.decode("ascii", errors="replace")
            match = re.fullmatch(
                r"EVIDRA_ACL_DIAGNOSTIC:(ACL_OPERATION_FAILED|REPARSE_POINT|UNEXPECTED_OWNER|"
                r"UNEXPECTED_PRINCIPAL|NO_PRIVATE_ACCESS)\|"
                r"(System\.[A-Za-z0-9_.]{1,160})\|([A-Za-z]{1,40})\|(\d{1,6})\|(-?\d{1,12})",
                stderr.strip() if isinstance(stderr, str) else "",
            )
            if match:
                reason, exception_type, category, line, hresult = match.groups()
                cause["acl"] = {
                    "reason": reason,
                    "exception_type": exception_type,
                    "category": category,
                    "line": int(line),
                    "hresult": int(hresult),
                }
            else:
                cause["stderr_redacted"] = True
        elif isinstance(current, subprocess.TimeoutExpired):
            cause["timeout_seconds"] = current.timeout
        causes.append(cause)
        current = current.__cause__ or (
            current.__context__ if not current.__suppress_context__ else None
        )
    return {"operation": operation, "causes": causes}


def bind_loopback(port: int) -> socket.socket:
    if not 0 <= port <= 65535 or port == 23119:
        raise EvidraError("INVALID_RUNTIME", "Invalid engine port.")
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        listener.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        listener.bind(("127.0.0.1", port))
        if listener.getsockname()[1] == 23119:
            raise EvidraError("RESERVED_PORT", "The operating system selected a reserved port.")
        listener.setblocking(False)
        return listener
    except BaseException:
        listener.close()
        raise


async def serve(handshake: Handshake) -> None:
    with bind_loopback(handshake.port) as listener:
        port = listener.getsockname()[1]
        settings = RuntimeSettings(
            data_dir=handshake.data_dir,
            profile_instance_id=handshake.profile_instance_id,
            session_token=handshake.session_token,
            port=port,
        )
        app = create_app(settings)
        receipt_identity: tuple[int, int] | None = None

        class OwnedServer(uvicorn.Server):
            async def startup(self, sockets: list[socket.socket] | None = None) -> None:
                nonlocal receipt_identity
                await super().startup(sockets=sockets)
                if not self.should_exit:
                    try:
                        receipt_identity = write_connection_receipt(handshake, port)
                    except BaseException:
                        await self.shutdown(sockets=sockets)
                        raise

            async def on_tick(self, counter: int) -> bool:
                if await super().on_tick(counter):
                    return True
                try:
                    app.state.services.session.assert_current()
                except EvidraError as exc:
                    if exc.code != "BRIDGE_EXPIRED":
                        raise
                    return True
                return False

        server = OwnedServer(
            uvicorn.Config(
                app,
                host="127.0.0.1",
                port=port,
                workers=1,
                access_log=False,
                log_level="warning",
                proxy_headers=False,
                server_header=False,
                timeout_graceful_shutdown=5,
            )
        )
        try:
            await server.serve(sockets=[listener])
        finally:
            if receipt_identity is not None:
                remove_connection_receipt(handshake.connection_path, receipt_identity)


def main() -> None:
    parser = argparse.ArgumentParser(prog="evidra-engine")
    commands = parser.add_subparsers(dest="command", required=True)
    serve_parser = commands.add_parser("serve")
    serve_parser.add_argument("--handshake", type=Path, required=True)
    args = parser.parse_args()
    operation = "consume_handshake"
    try:
        handshake = consume_handshake(args.handshake)
        operation = "serve_engine"
        asyncio.run(serve(handshake))
    except (EvidraError, OSError) as exc:
        print(json.dumps(startup_diagnostic(operation, exc)), file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
