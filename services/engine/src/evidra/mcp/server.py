"""Official SDK stdio transport forwarding only the eight typed private routes."""

import json
import logging
import sys
from pathlib import Path
from typing import Any

import httpx
import mcp_types as types
from mcp.server import Server, ServerRequestContext
from mcp.server.stdio import stdio_server
from pydantic import ValidationError

from evidra.domain.errors import EvidraError
from evidra.mcp.connection import read_connection
from evidra.mcp.models import TOOL_INPUTS

DESCRIPTIONS = {
    "get_notebook_status": "Read authorized notebook identity, revision, coverage and limits.",
    "list_sources": "Page authorized sources. Advance by returned limit until total.",
    "search_evidence": "Search authorized snapshot excerpts with offline lexical retrieval.",
    "read_evidence": "Read one bounded original excerpt and its immutable version and locator.",
    "get_protocol": "Read the active authorized protocol and form; absent values are null.",
    "get_matrix": "Page the authorized matrix, with human states and versioned fields.",
    "propose_extractions": "Create an EXTERNAL_CLIENT proposal. Never approves cells. "
    "Declared model is unverified.",
    "propose_note": "Create a pending EXTERNAL_CLIENT note with original evidence for review. "
    "Never writes to Zotero. Declared model is unverified.",
}


async def serve_mcp(path: Path) -> None:
    connection = read_connection(path)
    # Third-party diagnostics may interpolate untrusted tool arguments. Emit only our safe causes.
    logging.getLogger("mcp").setLevel(logging.CRITICAL)
    logging.getLogger("httpx").setLevel(logging.CRITICAL)
    async with httpx.AsyncClient(
        base_url=f"http://127.0.0.1:{connection.port}",
        headers={
            "Authorization": "Bearer " + connection.token.get_secret_value(),
            "X-Evidra-Client": "mcp",
        },
        trust_env=False,
        follow_redirects=False,
        timeout=10,
    ) as client:

        async def forward(name: str, arguments: dict[str, Any]) -> Any:
            model = TOOL_INPUTS.get(name)
            if model is None:
                raise EvidraError("FORBIDDEN", "Tool is not exposed.")
            body = model.model_validate(arguments).model_dump(mode="json")
            serialized = json.dumps(body, ensure_ascii=False).encode()
            if len(serialized) > 65536:
                raise EvidraError("BODY_TOO_LARGE", "Request exceeds the bounded gateway size.")
            try:
                async with client.stream(
                    "POST",
                    "/v1/mcp/gateway/" + name,
                    content=serialized,
                    headers={"Content-Type": "application/json"},
                ) as response:
                    payload = bytearray()
                    async for chunk in response.aiter_bytes():
                        payload.extend(chunk)
                        if len(payload) > 1_000_000:
                            raise EvidraError(
                                "BODY_TOO_LARGE", "Gateway response exceeds its limit."
                            )
                    data = json.loads(payload)
                    if response.status_code != 200:
                        code = data.get("code", "ENGINE_HTTP_ERROR")
                        if (
                            not isinstance(code, str)
                            or not code.replace("_", "").isupper()
                            or len(code) > 80
                        ):
                            code = "ENGINE_HTTP_ERROR"
                        raise EvidraError(code, "The engine refused this external operation.")
                    return data
            except (httpx.HTTPError, ValueError) as exc:
                raise EvidraError(
                    "ENGINE_UNAVAILABLE",
                    "The local engine did not complete the operation.",
                    retryable=True,
                ) from exc

        async def list_tools(
            ctx: ServerRequestContext[None], params: types.PaginatedRequestParams | None
        ) -> types.ListToolsResult:
            await forward("get_notebook_status", {})
            return types.ListToolsResult(
                tools=[
                    types.Tool(
                        name=name,
                        description=DESCRIPTIONS[name],
                        input_schema=model.model_json_schema(),
                        annotations=types.ToolAnnotations(
                            read_only_hint=not name.startswith("propose_"),
                            destructive_hint=False,
                            open_world_hint=False,
                        ),
                    )
                    for name, model in TOOL_INPUTS.items()
                ]
            )

        async def call_tool(
            ctx: ServerRequestContext[None], params: types.CallToolRequestParams
        ) -> types.CallToolResult:
            try:
                result = await forward(params.name, params.arguments or {})
                return types.CallToolResult(
                    content=[
                        types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False))
                    ],
                    structured_content=result,
                )
            except ValidationError:
                return types.CallToolResult(
                    is_error=True,
                    content=[
                        types.TextContent(
                            type="text",
                            text="INVALID_REQUEST: Arguments do not match the explicit schema.",
                        )
                    ],
                )
            except EvidraError as exc:
                return types.CallToolResult(
                    is_error=True,
                    content=[types.TextContent(type="text", text=exc.code + ": " + exc.message)],
                )
            except Exception as exc:
                print(
                    json.dumps({"operation": "mcp_call", "cause": type(exc).__name__}),
                    file=sys.stderr,
                )
                return types.CallToolResult(
                    is_error=True,
                    content=[
                        types.TextContent(
                            type="text", text="INTERNAL_ERROR: The gateway operation failed."
                        )
                    ],
                )

        server: Server[None] = Server(
            "evidra", version="0.1.0", on_list_tools=list_tools, on_call_tool=call_tool
        )
        async with stdio_server() as (read_stream, write_stream):
            await server.run(read_stream, write_stream, server.create_initialization_options())
