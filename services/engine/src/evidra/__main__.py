"""Start the owned engine from a private, one-use bridge handshake."""

import argparse
import asyncio
import socket
import sys
from pathlib import Path

import uvicorn

from evidra.api.app import create_app
from evidra.domain.errors import EvidraError
from evidra.security.handshake import (
    Handshake,
    consume_handshake,
    remove_connection_receipt,
    write_connection_receipt,
)
from evidra.security.runtime import RuntimeSettings


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
    try:
        handshake = consume_handshake(args.handshake)
        asyncio.run(serve(handshake))
    except (EvidraError, OSError) as exc:
        # ValidationError and nested OS diagnostics are kept as causes, never printed with input.
        code = exc.code if isinstance(exc, EvidraError) else "ENGINE_START_FAILED"
        print(f"Evidra engine failed: {code}", file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
