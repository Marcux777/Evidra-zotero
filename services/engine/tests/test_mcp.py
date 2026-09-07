"""Synthetic real HTTP/SQLite and official SDK stdio security acceptance."""

import asyncio
import json
import secrets
import sys
import threading
import time
from pathlib import Path

import httpx
import uvicorn
from fastapi.testclient import TestClient
from mcp.client import Client
from mcp.client.stdio import StdioServerParameters
from test_conversations import indexed
from test_matrix import setup
from test_runtime_notebooks import HEADERS, make_app


def test_official_stdio_real_http_sqlite_scope_lifecycle(tmp_path, monkeypatch, capfd):
    from mcp.client import stdio
    from pydantic import SecretStr
    from test_runtime_notebooks import TOKEN

    from evidra.__main__ import bind_loopback
    from evidra.api.app import create_app
    from evidra.security.runtime import RuntimeSettings

    frames = []
    parse = stdio._parse_line

    def observe(line):
        frames.append(json.loads(line))  # Observe actual wire lines before the SDK parses them.
        return parse(line)

    monkeypatch.setattr(stdio, "_parse_line", observe)
    clock = [0.0]
    with bind_loopback(0) as listener:
        port = listener.getsockname()[1]
        app = create_app(
            RuntimeSettings(tmp_path, "profile-a", SecretStr(TOKEN), port, lambda: clock[0])
        )
        server = uvicorn.Server(
            uvicorn.Config(app, log_level="warning", access_log=False, proxy_headers=False)
        )
        thread = threading.Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
        thread.start()
        try:
            deadline = time.monotonic() + 10
            while not server.started and thread.is_alive() and time.monotonic() < deadline:
                time.sleep(0.01)
            assert server.started
            with httpx.Client(base_url=f"http://127.0.0.1:{port}", trust_env=False) as http:
                prefix, form, proposal = setup(http)
                _, _, foreign_prefix = indexed(
                    http,
                    key="foreign",
                    item_key="FOREIGN1",
                    text="reported foreign private evidence",
                )
                foreign = http.post(
                    foreign_prefix + "/search", headers=HEADERS, json={"query": "foreign"}
                ).json()["items"][0]
                token = secrets.token_hex(32)
                created = http.post(
                    prefix + "/mcp/connections",
                    headers=HEADERS,
                    json={
                        "label": "stdio",
                        "allow_proposals": True,
                        "expires_in_seconds": 3600,
                        "token": token,
                        "idempotency_key": "stdio",
                    },
                )
                assert created.status_code == 201, created.text
                record = created.json()
                params = StdioServerParameters(
                    command=sys.executable,
                    args=["-m", "evidra", "mcp", "--connection-file", record["connection_file"]],
                    cwd=str(Path(__file__).resolve().parents[3]),
                )

                async def exercise():
                    async with Client(
                        params, mode="legacy", cache=None, read_timeout_seconds=15
                    ) as client:
                        listing = await client.list_tools()
                        assert {tool.name for tool in listing.tools} == {
                            "get_notebook_status",
                            "list_sources",
                            "search_evidence",
                            "read_evidence",
                            "get_protocol",
                            "get_matrix",
                            "propose_extractions",
                            "propose_note",
                        }
                        for tool in listing.tools:
                            assert tool.input_schema.get("additionalProperties") is False
                        assert not (await client.call_tool("get_notebook_status", {})).is_error
                        assert not (
                            await client.call_tool("list_sources", {"offset": 0, "limit": 1})
                        ).is_error
                        assert not (
                            await client.call_tool("search_evidence", {"query": "reported"})
                        ).is_error
                        assert (
                            await client.call_tool("search_evidence", {"query": "foreign"})
                        ).structured_content["items"] == []
                        assert (
                            await client.call_tool(
                                "read_evidence", {"evidence_id": foreign["evidence_id"]}
                            )
                        ).is_error
                        assert (
                            await client.call_tool(
                                "propose_note",
                                {
                                    "text": "Foreign draft",
                                    "evidence_ids": [foreign["evidence_id"]],
                                    "idempotency_key": "foreign",
                                },
                            )
                        ).is_error
                        assert not (
                            await client.call_tool(
                                "read_evidence", {"evidence_id": proposal["evidence_ids"][0]}
                            )
                        ).is_error
                        assert not (await client.call_tool("get_protocol", {})).is_error
                        assert not (
                            await client.call_tool(
                                "get_matrix", {"form_version_id": form["id"], "offset": 0}
                            )
                        ).is_error
                        assert (
                            await client.call_tool("get_notebook_status", {"notebook_id": "other"})
                        ).is_error
                        assert (
                            await client.call_tool("read_evidence", {"evidence_id": "f" * 64})
                        ).is_error
                        assert (
                            await client.call_tool(
                                "propose_note",
                                {
                                    "text": "Draft",
                                    "evidence_ids": ["f" * 64],
                                    "idempotency_key": "bad",
                                },
                            )
                        ).is_error
                        note = await client.call_tool(
                            "propose_note",
                            {
                                "text": "Original external draft",
                                "evidence_ids": proposal["evidence_ids"],
                                "declared_model": "client claim",
                                "idempotency_key": "draft",
                            },
                        )
                        assert not note.is_error
                        assert not (
                            await client.call_tool("propose_extractions", {"proposal": proposal})
                        ).is_error
                        with app.state.services.database.transaction() as conn:
                            assert (
                                conn.execute("SELECT count(*) FROM external_notes").fetchone()[0]
                                == 1
                            )
                            assert (
                                conn.execute("SELECT count(*) FROM cell_decisions").fetchone()[0]
                                == 0
                            )
                            assert (
                                conn.execute(
                                    "SELECT count(*) FROM approved_write_outbox"
                                ).fetchone()[0]
                                == 0
                            )
                            assert (
                                conn.execute("SELECT last_used_at FROM mcp_connections").fetchone()[
                                    0
                                ]
                                is not None
                            )
                            conn.execute(
                                "UPDATE mcp_connections SET expires_at='2000-01-01T00:00:00+00:00'"
                            )
                        assert (
                            await client.call_tool(
                                "read_evidence", {"evidence_id": proposal["evidence_ids"][0]}
                            )
                        ).is_error
                        # Restore this synthetic row for the independent heartbeat/revocation cases.
                        with app.state.services.database.transaction() as conn:
                            conn.execute(
                                "UPDATE mcp_connections SET expires_at='2099-01-01T00:00:00+00:00'"
                            )
                        clock[0] = 31
                        assert (await client.call_tool("get_notebook_status", {})).is_error
                        clock[0] = 0
                        app.state.services.scopes.revoke_access(proposal["source_id"])
                        assert (
                            await client.call_tool(
                                "read_evidence", {"evidence_id": proposal["evidence_ids"][0]}
                            )
                        ).is_error
                        revoked = http.post(
                            prefix + "/mcp/connections/" + record["connection"]["id"] + "/revoke",
                            headers=HEADERS,
                            json={"idempotency_key": "revoke"},
                        )
                        assert revoked.status_code == 200
                        assert (await client.call_tool("get_notebook_status", {})).is_error
                    readonly = http.post(
                        prefix + "/mcp/connections",
                        headers=HEADERS,
                        json={
                            "label": "readonly",
                            "token": secrets.token_hex(32),
                            "idempotency_key": "readonly",
                        },
                    ).json()
                    async with Client(
                        params.model_copy(
                            update={
                                "args": [
                                    "-m",
                                    "evidra",
                                    "mcp",
                                    "--connection-file",
                                    readonly["connection_file"],
                                ]
                            }
                        ),
                        mode="legacy",
                        cache=None,
                        read_timeout_seconds=15,
                    ) as client:
                        assert (
                            await client.call_tool(
                                "propose_note",
                                {
                                    "text": "Draft",
                                    "evidence_ids": proposal["evidence_ids"],
                                    "idempotency_key": "read-only",
                                },
                            )
                        ).is_error
                        assert (
                            await client.call_tool("propose_extractions", {"proposal": proposal})
                        ).is_error

                asyncio.run(exercise())
                assert len(frames) >= 20
                assert all(frame.get("jsonrpc") == "2.0" for frame in frames)
                captured = capfd.readouterr()
                assert token not in captured.out + captured.err + json.dumps(frames)
                assert TOKEN not in captured.out + captured.err + json.dumps(frames)
                (tmp_path / "stdio-wire.json").write_text(
                    json.dumps(frames, ensure_ascii=False, indent=2), encoding="utf-8"
                )
                (tmp_path / "stdio-diagnostics.txt").write_text(captured.err, encoding="utf-8")
        finally:
            server.should_exit = True
            thread.join(timeout=10)
            assert not thread.is_alive(), "Owned synthetic HTTP server did not stop"


def test_connection_boundary_and_external_provenance(tmp_path):
    clock = [0.0]
    app = make_app(tmp_path, clock)
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, proposal = setup(client)
        token = secrets.token_hex(32)
        response = client.post(
            prefix + "/mcp/connections",
            headers=HEADERS,
            json={
                "label": "Synthetic client",
                "allow_proposals": True,
                "expires_in_seconds": 3600,
                "idempotency_key": "connection",
                "token": token,
            },
        )
        assert response.status_code == 201, response.text
        created = response.json()
        headers = {"x-evidra-client": "mcp", "Authorization": "Bearer " + token}

        def call(tool, arguments):
            return client.post("/v1/mcp/gateway/" + tool, headers=headers, json=arguments)

        assert client.get("/v1/status", headers=headers).status_code == 403
        assert token not in response.text
        status = call("get_notebook_status", {}).json()
        assert status["snapshot_id"] == prefix.split("/")[-1]
        assert call("get_notebook_status", {"notebook_id": "other"}).status_code == 422
        extraction = call(
            "propose_extractions", {"proposal": proposal, "declared_model": "client claim"}
        )
        assert extraction.status_code == 200, extraction.text
        assert extraction.json()["origin"] == "EXTERNAL_CLIENT"
        assert extraction.json()["model"] is None
        assert extraction.json()["declared_model"] == "client claim"
        assert extraction.json()["run_id"] is None
        assert (
            call(
                "propose_extractions",
                {"proposal": dict(proposal, evidence_ids=["f" * 64]), "declared_model": None},
            ).status_code
            == 404
        )
        assert (
            call("get_matrix", {"form_version_id": form["id"], "offset": 0}).json()["items"][0][
                "revision"
            ]
            == 0
        )
        note = call(
            "propose_note",
            {
                "text": "Draft <script>untrusted</script>",
                "evidence_ids": proposal["evidence_ids"],
                "declared_model": "unverified",
                "idempotency_key": "note",
            },
        )
        assert note.status_code == 200, note.text
        assert note.json()["origin"] == "EXTERNAL_CLIENT"
        assert note.json()["review_state"] == "UNREVIEWED"
        original = note.json()
        preview_body = {
            "artifact_version_id": original["id"],
            "source_id": proposal["source_id"],
            "title": "External draft",
            "locale": "en-US",
            "idempotency_key": "preview",
        }
        assert (
            client.post(prefix + "/notes/previews", headers=HEADERS, json=preview_body).status_code
            == 403
        )
        review_body = {
            "expected_revision": 1,
            "action": "APPROVED",
            "rationale": "Checked original excerpts",
            "idempotency_key": "review",
        }
        reviewed = client.post(
            prefix + "/mcp/notes/" + original["id"] + "/review", headers=HEADERS, json=review_body
        )
        assert reviewed.status_code == 200, reviewed.text
        assert reviewed.json()["revision"] == 2
        assert reviewed.json()["origin"] == "EXTERNAL_CLIENT"
        assert reviewed.json()["run_id"] is None
        assert (
            client.post(
                prefix + "/mcp/notes/" + original["id"] + "/review",
                headers=HEADERS,
                json=review_body,
            ).json()
            == reviewed.json()
        )
        preview_body["artifact_version_id"] = reviewed.json()["id"]
        preview = client.post(prefix + "/notes/previews", headers=HEADERS, json=preview_body)
        assert preview.status_code == 201, preview.text
        assert "<script>" not in preview.json()["html"]
        assert 'data-evidra-origin="ai"' in preview.json()["html"]
        assert "client" in preview.json()["html"].lower()
        intent = client.post(
            prefix + "/notes/approve",
            headers=HEADERS,
            json={
                "preview_id": preview.json()["id"],
                "expected_artifact_revision": 2,
                "idempotency_key": "approve",
            },
        )
        assert intent.status_code == 201, intent.text
        assert intent.json()["state"] == "APPROVED"
        with app.state.services.database.transaction() as conn:
            assert conn.execute(
                "SELECT payload FROM external_notes WHERE id=?", (original["id"],)
            ).fetchone()[0] == json.dumps(original, ensure_ascii=False, separators=(",", ":"))
            assert conn.execute("SELECT count(*) FROM research_runs").fetchone()[0] == 0
        assert (
            call(
                "propose_note",
                {"text": "Draft", "evidence_ids": ["f" * 64], "idempotency_key": "bad"},
            ).status_code
            == 404
        )
        revoke = client.post(
            prefix + "/mcp/connections/" + created["connection"]["id"] + "/revoke",
            headers=HEADERS,
            json={"idempotency_key": "revoke"},
        )
        assert revoke.status_code == 200, revoke.text
        assert (
            call("read_evidence", {"evidence_id": proposal["evidence_ids"][0]}).status_code == 403
        )
