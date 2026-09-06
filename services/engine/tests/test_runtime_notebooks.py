"""Real HTTP/SQLite checks for session isolation and durable notebook identity."""

import importlib.util
import json
import sqlite3
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from contextlib import ExitStack
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

TOKEN = "ab" * 32
HEADERS = {"Authorization": f"Bearer {TOKEN}", "X-Evidra-Client": "bridge"}


def make_app(path: Path, clock: Any, profile: str = "profile-a") -> Any:
    # Assert missing owned behavior, rather than treating a missing dependency as RED.
    assert importlib.util.find_spec("evidra.api") is not None, "engine API is not implemented"
    from evidra.api.app import create_app
    from evidra.security.runtime import RuntimeSettings

    return create_app(
        RuntimeSettings(
            data_dir=path,
            profile_instance_id=profile,
            session_token=SecretStr(TOKEN),
            port=49200,
            monotonic_clock=lambda: clock[0],
        )
    )


@pytest.mark.parametrize(
    ("extra", "remove", "elapsed", "expected"),
    [
        ({}, None, 0, 200),
        ({"Host": "attacker.test"}, None, 0, 403),
        ({"Host": "127.0.0.1:23119"}, None, 0, 403),
        ({"Host": "127.0.0.1.attacker.test:49200"}, None, 0, 403),
        ({"Origin": "https://attacker.test"}, None, 0, 403),
        ({"Origin": "null"}, None, 0, 403),
        ({"Origin": "http://127.0.0.1:49200"}, None, 0, 403),
        ({"Authorization": "Bearer wrong"}, None, 0, 401),
        ({}, "Authorization", 0, 401),
        ({}, "X-Evidra-Client", 0, 403),
        ({"X-Evidra-Client": "mcp"}, None, 0, 403),
        ({}, None, 30, 200),
        ({}, None, 30.001, 503),
        pytest.param({}, None, (0, 31), 503, id="expires-during-body"),
    ],
)
def test_auth_boundary(
    tmp_path: Path,
    extra: dict[str, str],
    remove: str | None,
    elapsed: float | tuple[float, float],
    expected: int,
) -> None:
    clock = [0.0]
    with TestClient(make_app(tmp_path, clock), base_url="http://127.0.0.1:49200") as client:
        headers = HEADERS | extra
        if remove:
            del headers[remove]
        before_body, after_body = elapsed if isinstance(elapsed, tuple) else (elapsed, elapsed)
        clock[0] = before_body

        def incoming_body() -> Any:
            clock[0] = after_body
            yield b"{}"

        response = client.request("GET", "/v1/status", headers=headers, content=incoming_body())
        assert response.status_code == expected
        assert TOKEN not in response.text
        if expected != 200:
            assert set(response.json()) == {"code", "message", "retryable", "run_id", "details"}
        else:
            assert response.json()["profile_instance_id"] == "profile-a"


def test_notebooks_persist_idempotently_and_isolate_profiles(tmp_path: Path) -> None:
    clock = [0.0]
    with TestClient(make_app(tmp_path, clock), base_url="http://127.0.0.1:49200") as client:
        assert client.get("/health").json() == {"status": "ok", "protocol_version": 1}
        body = {"name": "Revisão", "idempotency_key": "create-1"}
        created = client.post("/v1/notebooks", headers=HEADERS, json=body)
        assert created.status_code == 201
        notebook = created.json()
        assert notebook["revision"] == 1
        assert notebook["initial_snapshot_id"]
        assert notebook["created_at"].endswith("Z")
        assert client.post("/v1/notebooks", headers=HEADERS, json=body).json() == notebook
        conflict = client.post("/v1/notebooks", headers=HEADERS, json=body | {"name": "Different"})
        assert conflict.status_code == 409
        clock[0] = 25
        assert client.post("/v1/bridge/heartbeat", headers=HEADERS).status_code == 200
        clock[0] = 50
        assert client.get("/v1/status", headers=HEADERS).status_code == 200
        clock[0] = 56
        assert client.post("/v1/bridge/heartbeat", headers=HEADERS).status_code == 503
        assert client.get("/health").json() == {"status": "ok", "protocol_version": 1}
    clock[0] = 0
    with TestClient(make_app(tmp_path, clock), base_url="http://127.0.0.1:49200") as reopened:
        assert reopened.get(f"/v1/notebooks/{notebook['id']}", headers=HEADERS).json() == notebook
        assert reopened.get("/v1/notebooks?offset=0&limit=5", headers=HEADERS).json() == {
            "items": [notebook],
            "offset": 0,
            "limit": 5,
            "total": 1,
        }
    with TestClient(
        make_app(tmp_path, clock, "profile-b"), base_url="http://127.0.0.1:49200"
    ) as other:
        assert other.get(f"/v1/notebooks/{notebook['id']}", headers=HEADERS).status_code == 404
        assert other.get("/v1/notebooks", headers=HEADERS).json()["total"] == 0
        assert (
            other.post("/v1/notebooks", headers=HEADERS, json=body).json()["id"] != notebook["id"]
        )


def test_body_limit_and_sanitized_validation(tmp_path: Path) -> None:
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        for body in [b"x" * 65537, iter([b"x" * 40000, b"x" * 40000])]:
            assert client.post("/v1/notebooks", headers=HEADERS, content=body).status_code == 413
        invalid = client.post(
            "/v1/notebooks", headers=HEADERS, json={"name": TOKEN, "idempotency_key": ""}
        )
        assert invalid.status_code == 422
        assert TOKEN not in invalid.text
        assert set(invalid.json()) == {"code", "message", "retryable", "run_id", "details"}


def test_storage_failure_has_sanitized_error_contract(tmp_path: Path) -> None:
    app = make_app(tmp_path, [0.0])
    with TestClient(
        app, base_url="http://127.0.0.1:49200", raise_server_exceptions=False
    ) as client:
        with app.state.services.database.transaction() as connection:
            connection.execute("DROP TABLE snapshots")
        response = client.post(
            "/v1/notebooks",
            headers=HEADERS,
            json={"name": TOKEN, "idempotency_key": "broken-storage"},
        )
        assert response.status_code == 500
        assert response.headers["content-type"] == "application/json"
        assert response.json()["code"] == "INTERNAL_ERROR"
        assert TOKEN not in response.text
        with app.state.services.database.transaction() as connection:
            assert connection.execute("SELECT count(*) FROM notebooks").fetchone()[0] == 0


@pytest.mark.parametrize("legacy_version", [1, 2, 3, 4])
def test_database_backup_rollback_future_schema_and_close(
    tmp_path: Path, monkeypatch: Any, legacy_version: int
) -> None:
    from evidra.domain.errors import EvidraError
    from evidra.storage import database as storage

    path = tmp_path / "db.sqlite3"
    # Start from the previously shipped v1 schema, with durable user notebook identity.
    with sqlite3.connect(path) as legacy:
        legacy.executescript(
            storage.files("evidra.storage.migrations").joinpath("001_initial.sql").read_text()
        )
        legacy.execute(
            "INSERT INTO notebooks VALUES ('legacy','p','Review','key','now','now',1,'old')"
        )
        legacy.execute("INSERT INTO snapshots VALUES ('old','p','legacy','now',1)")
        legacy.execute("PRAGMA user_version=1")
        if legacy_version >= 2:
            from evidra.domain.sources import Source, SourceContent, SourceIdentity

            legacy.executescript(
                storage.files("evidra.storage.migrations").joinpath("002_initial.sql").read_text()
            )
            source = Source(
                identity=SourceIdentity(profile_instance_id="p", library_id=1, item_key="LEGACY"),
                version="1",
                title="Historical title",
                item_type="journalArticle",
                id="legacy-source",
                version_id="legacy-view",
                year_state="missing",
                contents=[SourceContent(key="P", kind="pdf")],
            )
            legacy.execute("INSERT INTO source_libraries VALUES ('p',1,1)")
            legacy.execute(
                "INSERT INTO sources VALUES ('legacy-source','p',1,'LEGACY','legacy-view',1,1,NULL)"
            )
            legacy.execute(
                "INSERT INTO source_versions VALUES ('legacy-source','legacy-view',?)",
                (source.model_dump_json(),),
            )
            legacy.execute(
                "INSERT INTO snapshot_members VALUES ('old','legacy-source','legacy-view',?)",
                (source.model_dump_json(),),
            )
            legacy.execute(
                "INSERT INTO notebook_grants VALUES ('legacy','legacy-source',?)",
                (json.dumps([["P", "pdf"]]),),
            )
            legacy.execute(
                "INSERT INTO snapshot_selections VALUES ('old','{}','capture','legacy','{}')"
            )
            legacy.execute("PRAGMA user_version=2")
            if legacy_version >= 3:
                legacy.executescript(
                    storage.files("evidra.storage.migrations").joinpath("003_initial.sql").read_text()
                )
                legacy.execute("PRAGMA user_version=3")
            if legacy_version == 4:
                legacy.executescript(
                    storage.files("evidra.storage.migrations").joinpath("004_initial.sql").read_text()
                )
                legacy.execute("PRAGMA user_version=4")
        preserved = {
            table: legacy.execute(f"SELECT * FROM {table}").fetchall()
            for table in (
                "notebooks",
                "snapshots",
                *(
                    (
                        "source_versions",
                        "snapshot_members",
                        "notebook_grants",
                        "snapshot_selections",
                    )
                    if legacy_version >= 2
                    else ()
                ),
            )
        }
    database = storage.Database(path)
    with database.transaction() as connection:
        assert connection.execute("PRAGMA foreign_keys").fetchone()[0] == 1
        assert connection.execute("PRAGMA journal_mode").fetchone()[0] == "wal"
        assert connection.execute("PRAGMA user_version").fetchone()[0] == 5
        initial = connection.execute("SELECT initial_snapshot_id FROM notebooks WHERE id='legacy'")
        assert initial.fetchone()[0] == "old"
        for table, expected in preserved.items():
            assert [tuple(row) for row in connection.execute(f"SELECT * FROM {table}")] == expected
        assert connection.execute("SELECT COUNT(*) FROM source_contents").fetchone()[0] == 0
    from evidra.scope.service import ScopeService
    from evidra.security.runtime import BridgeSession, RuntimeSettings

    ScopeService(
        database,
        BridgeSession(
            RuntimeSettings(
                data_dir=tmp_path,
                profile_instance_id="p",
                session_token=SecretStr(TOKEN),
                port=49200,
            )
        ),
    )
    with database.transaction() as connection:
        assert (
            connection.execute("SELECT COUNT(*) FROM sources WHERE available=1").fetchone()[0] == 0
        )
    with sqlite3.connect(tmp_path / "db.before-v5.sqlite3") as before:
        assert before.execute("PRAGMA user_version").fetchone()[0] == legacy_version
        assert before.execute("SELECT COUNT(*) FROM notebooks").fetchone()[0] == 1
    with pytest.raises(sqlite3.IntegrityError), database.transaction() as connection:
        connection.execute("INSERT INTO snapshots VALUES ('s','p','missing','now',1)")
    database.backup(tmp_path / "copy.sqlite3")
    with sqlite3.connect(tmp_path / "copy.sqlite3") as backup:
        assert backup.execute("PRAGMA user_version").fetchone()[0] == 5
    database.close()
    with pytest.raises(EvidraError, match="closed"), database.transaction():
        pass
    migration_dir = tmp_path / "migrations"
    migration_dir.mkdir()
    (migration_dir / "006_initial.sql").write_text(
        "CREATE TABLE should_rollback (id TEXT);\nINVALID SQL;\n", encoding="utf-8"
    )
    with monkeypatch.context() as patch:
        patch.setattr(storage, "SCHEMA_VERSION", 6)
        patch.setattr(storage, "files", lambda package: migration_dir)
        with pytest.raises(sqlite3.OperationalError):
            storage.Database(path)
    with sqlite3.connect(path) as connection:
        assert connection.execute("PRAGMA user_version").fetchone()[0] == 5
        assert (
            connection.execute(
                "SELECT name FROM sqlite_master WHERE name='should_rollback'"
            ).fetchone()
            is None
        )
        connection.execute("PRAGMA user_version=999")
    assert (tmp_path / "db.before-v5.sqlite3").exists()
    with pytest.raises(EvidraError, match="newer engine"):
        storage.Database(path)


def test_concurrent_creation_is_one_transaction(tmp_path: Path) -> None:
    from evidra.domain.models import NotebookCreate

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200"), ThreadPoolExecutor(8) as workers:
        results = list(
            workers.map(
                lambda _: app.state.services.notebooks.create(
                    NotebookCreate(name="Concurrent", idempotency_key="same")
                ),
                range(8),
            )
        )
        assert len({notebook.id for notebook in results}) == 1
        with app.state.services.database.transaction() as connection:
            assert connection.execute("SELECT count(*) FROM notebooks").fetchone()[0] == 1
            assert connection.execute("SELECT count(*) FROM snapshots").fetchone()[0] == 1


def test_windows_handshake_claim_acl_and_receipt(tmp_path: Path) -> None:
    assert importlib.util.find_spec("evidra.security.handshake") is not None, "handshake missing"
    from evidra.domain.errors import EvidraError
    from evidra.security.handshake import (
        consume_handshake,
        protect_path,
        validate_private_path,
        write_connection_receipt,
    )

    private = tmp_path / "session"
    private.mkdir()
    protect_path(private)
    handshake = private / "handshake.json"
    body = {
        "protocol_version": 1,
        "profile_instance_id": "profile-a",
        "session_token": TOKEN,
        "data_dir": str(tmp_path / "data"),
        "port": 0,
        "connection_path": str(private / "connection.json"),
    }
    handshake.write_text(json.dumps(body), encoding="utf-8")
    # Directory inheritance is the bridge contract: own-user inherited ACEs are valid.
    validate_private_path(handshake)
    parsed = consume_handshake(handshake)
    assert not handshake.exists()
    assert parsed.session_token.get_secret_value() == TOKEN
    with pytest.raises(EvidraError):
        consume_handshake(handshake)
    write_connection_receipt(parsed, 49200)
    receipt = Path(parsed.connection_path)
    validate_private_path(receipt)
    assert json.loads(receipt.read_text()) == {
        "protocol_version": 1,
        "host": "127.0.0.1",
        "port": 49200,
        "profile_instance_id": "profile-a",
    }
    assert TOKEN not in receipt.read_text()
    with pytest.raises(EvidraError):
        write_connection_receipt(parsed, 49200)
    public = tmp_path / "public.json"
    public.write_text(json.dumps(body), encoding="utf-8")
    with pytest.raises(EvidraError):
        consume_handshake(public)
    malformed = private / "malformed.json"
    malformed.write_text(json.dumps(body | {"port": 23119}), encoding="utf-8")
    with pytest.raises(EvidraError) as failure:
        consume_handshake(malformed)
    assert TOKEN not in str(failure.value)
    assert not malformed.exists()


def test_loopback_socket_is_prebound_and_reserved_port_rejected() -> None:
    import socket

    assert importlib.util.find_spec("evidra.__main__") is not None, "engine CLI missing"
    from evidra.__main__ import bind_loopback
    from evidra.domain.errors import EvidraError

    with bind_loopback(0) as listener:
        host, port = listener.getsockname()
        assert host == "127.0.0.1" and port != 23119
        with socket.socket() as competing, pytest.raises(OSError):
            competing.bind((host, port))
    with pytest.raises(EvidraError):
        bind_loopback(23119)


def test_receipt_cleanup_rejects_substitution(tmp_path: Path) -> None:
    from evidra.domain.errors import EvidraError
    from evidra.security import handshake as security

    assert hasattr(security, "remove_connection_receipt"), "owned receipt cleanup missing"
    private = tmp_path / "session"
    private.mkdir()
    security.protect_path(private)
    receipt = private / "connection.json"
    receipt.write_text("original")
    original = receipt.stat()
    receipt.rename(private / "old-receipt.json")
    receipt.write_text("replacement")
    with pytest.raises(EvidraError):
        security.remove_connection_receipt(receipt, (original.st_dev, original.st_ino))
    assert receipt.read_text() == "replacement"
    current = receipt.stat()
    security.remove_connection_receipt(receipt, (current.st_dev, current.st_ino))
    assert not receipt.exists()


@pytest.mark.parametrize("failure", ["missing-handshake", "invalid-handshake", "occupied-port"])
def test_cli_failure_diagnostics_are_causal_and_secret_safe(tmp_path: Path, failure: str) -> None:
    from evidra.__main__ import bind_loopback
    from evidra.security.handshake import protect_path

    private = tmp_path / "session"
    private.mkdir()
    protect_path(private)
    handshake = private / "handshake.json"
    invalid_secret = "sensitive-invalid-session"
    provider_secret = "sensitive-provider-value"
    with ExitStack() as resources:
        body = {
            "protocol_version": 1,
            "profile_instance_id": "disposable-failure-profile",
            "session_token": TOKEN,
            "data_dir": str(tmp_path / "data"),
            "port": 0,
            "connection_path": str(private / "connection.json"),
        }
        if failure == "occupied-port":
            listener = resources.enter_context(bind_loopback(0))
            body["port"] = listener.getsockname()[1]
        if failure == "invalid-handshake":
            body["session_token"] = invalid_secret
            body[provider_secret] = provider_secret
        if failure != "missing-handshake":
            handshake.write_text(json.dumps(body), encoding="utf-8")
        process = subprocess.run(
            [sys.executable, "-m", "evidra", "serve", "--handshake", str(handshake)],
            capture_output=True,
            timeout=15,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
    assert process.returncode != 0
    assert process.stdout == b""
    for secret in (TOKEN, invalid_secret, provider_secret, str(private)):
        assert secret.encode() not in process.stderr
    assert process.stderr.startswith(b"{"), "CLI must retain structured causal diagnostics"
    diagnostic = json.loads(process.stderr)
    assert diagnostic["operation"] == (
        "serve_engine" if failure == "occupied-port" else "consume_handshake"
    )
    if failure == "missing-handshake":
        assert diagnostic["causes"][0]["code"] == "ACL_ERROR"
        cause = diagnostic["causes"][-1]
        assert cause["type"] == "CalledProcessError" and cause["returncode"] != 0
        assert cause["acl"]["category"] == "ObjectNotFound"
        assert cause["acl"]["line"] > 0
        assert cause["acl"]["exception_type"].endswith("ItemNotFoundException")
    elif failure == "invalid-handshake":
        assert diagnostic["causes"][0]["code"] == "INVALID_HANDSHAKE"
        cause = diagnostic["causes"][-1]
        assert cause["type"] == "ValidationError"
        assert {error["field"] for error in cause["errors"]} == {
            "session_token",
            "<unrecognized-field>",
        }
    else:
        cause = diagnostic["causes"][-1]
        assert cause["type"] == "OSError"
        assert cause["errno"] != 0 and cause["winerror"] == 10048
    print(json.dumps({"case": failure, "exit_code": process.returncode, "diagnostic": diagnostic}))
