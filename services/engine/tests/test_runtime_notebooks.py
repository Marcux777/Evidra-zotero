"""Real HTTP/SQLite checks for session isolation and durable notebook identity."""

import importlib.util
import json
import sqlite3
from concurrent.futures import ThreadPoolExecutor
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
    ],
)
def test_auth_boundary(
    tmp_path: Path, extra: dict[str, str], remove: str | None, elapsed: float, expected: int
) -> None:
    clock = [0.0]
    with TestClient(make_app(tmp_path, clock), base_url="http://127.0.0.1:49200") as client:
        headers = HEADERS | extra
        if remove:
            del headers[remove]
        clock[0] = elapsed
        response = client.get("/v1/status", headers=headers)
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


def test_database_backup_rollback_future_schema_and_close(tmp_path: Path, monkeypatch: Any) -> None:
    from evidra.domain.errors import EvidraError
    from evidra.storage import database as storage

    path = tmp_path / "db.sqlite3"
    database = storage.Database(path)
    with database.transaction() as connection:
        assert connection.execute("PRAGMA foreign_keys").fetchone()[0] == 1
        assert connection.execute("PRAGMA journal_mode").fetchone()[0] == "wal"
        assert connection.execute("PRAGMA user_version").fetchone()[0] == 1
    with pytest.raises(sqlite3.IntegrityError), database.transaction() as connection:
        connection.execute("INSERT INTO snapshots VALUES ('s','p','missing','now',1)")
    database.backup(tmp_path / "copy.sqlite3")
    with sqlite3.connect(tmp_path / "copy.sqlite3") as backup:
        assert backup.execute("PRAGMA user_version").fetchone()[0] == 1
    database.close()
    with pytest.raises(EvidraError, match="closed"), database.transaction():
        pass
    migration_dir = tmp_path / "migrations"
    migration_dir.mkdir()
    (migration_dir / "002_initial.sql").write_text(
        "CREATE TABLE should_rollback (id TEXT);\nINVALID SQL;\n", encoding="utf-8"
    )
    with monkeypatch.context() as patch:
        patch.setattr(storage, "SCHEMA_VERSION", 2)
        patch.setattr(storage, "files", lambda package: migration_dir)
        with pytest.raises(sqlite3.OperationalError):
            storage.Database(path)
    with sqlite3.connect(path) as connection:
        assert connection.execute("PRAGMA user_version").fetchone()[0] == 1
        assert (
            connection.execute(
                "SELECT name FROM sqlite_master WHERE name='should_rollback'"
            ).fetchone()
            is None
        )
        connection.execute("PRAGMA user_version=999")
    assert (tmp_path / "db.before-v2.sqlite3").exists()
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
