"""Task4 boundaries: actual files, PDFium child processes, SQLite FTS and scopes."""

import hashlib
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pdf_fixtures import pdf_bytes, write_pdf
from test_runtime_notebooks import HEADERS, make_app
from test_scopes import capture, setup, source


def document_scope(client, sources=None, *, name="Review", key="n", spec=None):
    if key == "n":
        notebook = setup(client)
    else:
        notebook = client.post(
            "/v1/notebooks", headers=HEADERS, json={"name": name, "idempotency_key": key}
        ).json()["id"]
    snap, preview, _ = capture(client, notebook, sources or [source()], spec=spec)
    return notebook, snap, preview, f"/v1/notebooks/{notebook}/snapshots/{snap['id']}"


def register(client, prefix, source_id, path, content_key="SAMEKEY1PDF"):
    response = client.post(
        prefix + "/documents/register",
        headers=HEADERS,
        json={"source_id": source_id, "content_key": content_key, "path": str(path)},
    )
    assert response.status_code == 201, response.text
    assert "path" not in response.json()
    return response.json()


def ingest(client, prefix, document, *, key="index-1", limits=None):
    response = client.post(
        prefix + "/documents/ingest",
        headers=HEADERS,
        json={"document_id": document["id"], "idempotency_key": key, "limits": limits or {}},
    )
    assert response.status_code == 202, response.text
    return response.json()


def finished(client, prefix, operation):
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        response = client.get(prefix + "/operations/" + operation["id"], headers=HEADERS)
        assert response.status_code == 200, response.text
        result = response.json()
        if result["state"] not in {"QUEUED", "RUNNING"}:
            return result
        time.sleep(0.02)
    raise AssertionError("Owned parser did not finish within the bounded test wait")


def test_registered_pdf_becomes_verifiable_scoped_evidence(tmp_path: Path):
    """Missing indexing/FTS or altered excerpt offsets would break the literal evidence read."""
    path = tmp_path / "study.pdf"
    data = write_pdf(path)
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, preview, prefix = document_scope(client)
        source_id = preview["items"][0]["id"]
        registered = register(client, prefix, source_id, path)
        operation = ingest(client, prefix, registered)
        result = finished(client, prefix, operation)
        assert result["state"] == "COMPLETE", result
        assert result["coverage"] == "FULL_TEXT_PARSED"
        assert result["page_count"] == result["pages_processed"] == 1
        assert result["bytes_processed"] == len(data)
        assert result["sha256"] == hashlib.sha256(data).hexdigest()
        search = client.post(
            prefix + "/search",
            headers=HEADERS,
            json={"query": "decisive finding", "offset": 0, "limit": 1},
        )
        assert search.status_code == 200, search.text
        hits = search.json()
        assert [hit["source_id"] for hit in hits["items"]] == [source_id]
        evidence = client.get(
            prefix + "/evidence/" + hits["items"][0]["evidence_id"], headers=HEADERS
        )
        assert evidence.status_code == 200, evidence.text
        value = evidence.json()
        assert value["excerpt"] == "decisive finding"
        assert (value["start"], value["end"], value["page_index"], value["page_label"]) == (
            0,
            16,
            0,
            None,
        )
        assert value["source_identity"] == source()["identity"]
        assert value["source_kind"] == "pdf"
        assert value["document_version_id"] == result["document_version_id"]
        assert value["precision"] == "rectangles"
        assert value["rectangles"] and all(r[0] >= 39 and r[2] <= 140 for r in value["rectangles"])
        # Cache reuse still traverses the current notebook grant, not merely a hash lookup.
        again = finished(client, prefix, ingest(client, prefix, registered, key="cache-2"))
        assert again["document_version_id"] == value["document_version_id"]
        revoked = client.post(
            f"/v1/notebooks/{notebook}/sources/{source_id}/revoke",
            headers=HEADERS,
            json={"expected_revision": snap["revision"]},
        )
        assert revoked.status_code == 200
        assert client.get(prefix + "/evidence/" + value["id"], headers=HEADERS).status_code == 403
        assert (
            client.post(
                prefix + "/documents/ingest",
                headers=HEADERS,
                json={"document_id": registered["id"], "idempotency_key": "revoked", "limits": {}},
            ).status_code
            == 403
        )


def test_limits_geometry_coverage_and_replacement(tmp_path: Path):
    """All pages are accounted for; limits and changed bytes cannot publish partial success."""
    path = tmp_path / "pages.pdf"
    path.write_bytes(
        pdf_bytes(
            [
                {
                    "lines": [(60, 420, "left column"), (230, 420, "right column")],
                    "crop": [20, 30, 380, 470],
                    "rotation": 90,
                },
                {"operations": ["0 0 0 rg 30 30 200 200 re f"]},
            ],
            labels=True,
        )
    )
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, preview, prefix = document_scope(client)
        document = register(client, prefix, preview["items"][0]["id"], path)
        for key, limits, reason in [
            ("bytes", {"max_file_bytes": 1}, "FILE_LIMIT"),
            ("pages", {"max_pages": 1}, "PAGE_LIMIT"),
        ]:
            result = finished(
                client, prefix, ingest(client, prefix, document, key=key, limits=limits)
            )
            assert (result["state"], result["reason"], result["document_version_id"]) == (
                "PAUSED",
                reason,
                None,
            )
        with app.state.services.database.transaction() as connection:
            assert connection.execute("SELECT count(*) FROM document_versions").fetchone()[0] == 0
        result = finished(client, prefix, ingest(client, prefix, document, key="adjusted"))
        assert result["coverage"] == "PARTIAL_TEXT", result
        assert result["pages_processed"] == result["page_count"] == 2
        with app.state.services.database.transaction() as connection:
            import json

            rows = connection.execute(
                "SELECT payload FROM document_pages ORDER BY page_index"
            ).fetchall()
            pages = [json.loads(row[0]) for row in rows]
        assert [p["page_label"] for p in pages] == ["i", "7"]
        assert pages[0]["rotation"] == 90 and pages[0]["crop_box"] == [20, 30, 380, 470]
        assert (
            "left column" in pages[0]["original_text"]
            and "right column" in pages[0]["original_text"]
        )
        assert pages[1]["quality"] == "EMPTY"
        old = result["document_version_id"]
        path.write_bytes(pdf_bytes([{"lines": [(40, 440, "replacement")]}]))
        changed = finished(client, prefix, ingest(client, prefix, document, key="changed"))
        assert changed["reason"] == "DOCUMENT_STALE" and changed["document_version_id"] is None
        with app.state.services.database.transaction() as connection:
            assert connection.execute("SELECT id FROM document_versions").fetchall()[0][0] == old


def test_text_staging_and_version_verified_preview(tmp_path: Path):
    """Only complete native text is indexed; selected pixels are bound to the indexed PDF hash."""
    path = tmp_path / "study.pdf"
    write_pdf(path)
    item = source()
    item["contents"].append({"key": "NOTEKEY1", "kind": "human_note", "role": "unassigned"})
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, preview, prefix = document_scope(client, [item], spec={"include_notes": True})
        source_id = preview["items"][0]["id"]
        text = "literal note " + "x" * 8000 + " final evidence"
        stage = client.post(
            prefix + "/documents/text",
            headers=HEADERS,
            json={
                "source_id": source_id,
                "content_key": "NOTEKEY1",
                "total_characters": len(text),
                "sha256": hashlib.sha256(text.encode()).hexdigest(),
            },
        )
        assert stage.status_code == 201, stage.text
        part_path = prefix + "/documents/text/" + stage.json()["id"]
        partial = client.post(
            part_path, headers=HEADERS, json={"offset": 0, "text": text[:8000], "final": False}
        )
        assert partial.status_code == 200 and partial.json()["document"] is None
        assert (
            client.post(prefix + "/search", headers=HEADERS, json={"query": "literal"}).json()[
                "total"
            ]
            == 0
        )
        end = client.post(
            part_path, headers=HEADERS, json={"offset": 8000, "text": text[8000:], "final": True}
        )
        assert end.status_code == 200, end.text
        hits = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "literal note"}
        ).json()
        evidence = client.get(
            prefix + "/evidence/" + hits["items"][0]["evidence_id"], headers=HEADERS
        ).json()
        assert evidence["source_kind"] == "human_note" and evidence["page_index"] is None
        assert (
            evidence["precision"] == "text"
            and evidence["excerpt"] == text[evidence["start"] : evidence["end"]]
        )
        document = register(client, prefix, source_id, path)
        result = finished(client, prefix, ingest(client, prefix, document))
        body = {
            "document_version_id": result["document_version_id"],
            "page_index": 0,
            "region": [30, 410, 200, 470],
            "scale": 1,
            "idempotency_key": "preview",
        }
        rendered = client.post(prefix + "/documents/preview", headers=HEADERS, json=body)
        assert rendered.status_code == 202, rendered.text
        operation = finished(client, prefix, rendered.json())
        assert operation["state"] == "COMPLETE", operation
        image = client.get(prefix + "/operations/" + operation["id"] + "/preview", headers=HEADERS)
        assert image.status_code == 200, image.text
        import base64

        pixels = base64.b64decode(image.json()["data_base64"])
        assert (
            pixels.startswith(b"\x89PNG")
            and hashlib.sha256(pixels).hexdigest() == image.json()["sha256"]
        )
        assert image.json()["width"] == 170 and image.json()["height"] == 60
        identical = tmp_path / "identical.pdf"
        identical.write_bytes(path.read_bytes())
        identical.replace(path)
        registered_copy = register(client, prefix, source_id, path)
        reused = finished(client, prefix, ingest(client, prefix, registered_copy, key="same-bytes"))
        assert (
            reused["cache_hit"] and reused["document_version_id"] == result["document_version_id"]
        )
        assert (
            client.get(
                prefix + "/operations/" + operation["id"] + "/preview", headers=HEADERS
            ).status_code
            == 200
        )
        pdf_hits = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "decisive"}
        ).json()
        verified = client.post(
            prefix + "/documents/verify",
            headers=HEADERS,
            json={"evidence_id": pdf_hits["items"][0]["evidence_id"], "path": str(path)},
        )
        assert verified.status_code == 200, verified.text
        write_pdf(path, "other bytes")
        assert (
            client.get(
                prefix + "/operations/" + operation["id"] + "/preview", headers=HEADERS
            ).status_code
            == 409
        )


def test_file_error_and_reparse_boundary_preserve_cause(tmp_path: Path):
    """Real Windows share denial and symlink redirection never become arbitrary file reads."""
    import win32con
    import win32file

    from evidra.documents.registry import open_verified
    from evidra.domain.errors import EvidraError

    path = tmp_path / "locked.pdf"
    write_pdf(path)
    handle = win32file.CreateFile(
        str(path), win32con.GENERIC_READ, 0, None, win32con.OPEN_EXISTING, 0, None
    )
    try:
        with pytest.raises(EvidraError) as error, open_verified(path):
            pytest.fail("An exclusively held attachment opened")
        assert error.value.code == "DOCUMENT_FILE_ERROR"
        assert error.value.__cause__.winerror == 32
    finally:
        handle.Close()
    import _winapi

    directory = tmp_path / "original"
    directory.mkdir()
    nested = directory / "nested.pdf"
    write_pdf(nested)
    junction = tmp_path / "junction"
    _winapi.CreateJunction(str(directory), str(junction))
    with pytest.raises(EvidraError) as error, open_verified(junction / "nested.pdf"):
        pytest.fail("Redirected attachment opened")
    assert error.value.code == "REPARSE_POINT"


def test_file_symlink_is_rejected_when_os_permits(tmp_path: Path):
    from evidra.documents.registry import open_verified
    from evidra.domain.errors import EvidraError

    path, linked = tmp_path / "original.pdf", tmp_path / "linked.pdf"
    write_pdf(path)
    try:
        linked.symlink_to(path)
    except OSError as error:
        if error.winerror == 1314:
            pytest.skip("Actual file symlink unavailable: Windows privilege error 1314")
        raise
    with pytest.raises(EvidraError) as error, open_verified(linked):
        pytest.fail("File symlink opened")
    assert error.value.code == "REPARSE_POINT"


def test_preview_limit_preserves_extraction_and_rotated_region(tmp_path: Path):
    """A render failure preserves text coverage; crop/rotation select actual colored pixels."""
    import base64
    import io

    from PIL import Image

    path = tmp_path / "rotated.pdf"
    path.write_bytes(
        pdf_bytes(
            [
                {
                    "lines": [(60, 420, "verified text")],
                    "crop": [20, 30, 380, 470],
                    "rotation": 90,
                    "operations": ["1 0 0 rg 100 100 40 60 re f"],
                },
                {"lines": [(40, 440, "second page text")]},
            ]
        )
    )
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, preview, prefix = document_scope(client)
        document = register(client, prefix, preview["items"][0]["id"], path)
        result = finished(client, prefix, ingest(client, prefix, document))
        body = {
            "document_version_id": result["document_version_id"],
            "page_index": 0,
            "region": [100, 100, 140, 160],
            "scale": 1,
            "idempotency_key": "pixels",
        }
        limited = client.post(
            prefix + "/documents/preview",
            headers=HEADERS,
            json=body | {"limits": {"max_pages": 1}, "idempotency_key": "page-limit"},
        ).json()
        paused = finished(client, prefix, limited)
        assert (paused["state"], paused["reason"], paused["page_count"]) == (
            "PAUSED", "PAGE_LIMIT", 2
        ), paused
        listing = client.get(prefix + "/documents", headers=HEADERS).json()
        assert listing["items"][0]["coverage"] == "FULL_TEXT_PARSED"
        rendered = client.post(
            prefix + "/documents/preview",
            headers=HEADERS,
            json=body | {"limits": {"max_pages": 2}},
        ).json()
        operation = finished(client, prefix, rendered)
        assert operation["state"] == "COMPLETE", operation
        image = client.get(
            prefix + "/operations/" + operation["id"] + "/preview", headers=HEADERS
        ).json()
        with Image.open(io.BytesIO(base64.b64decode(image["data_base64"]))) as selected:
            assert selected.size == (60, 40)
            assert selected.convert("RGB").getpixel((30, 20)) == (255, 0, 0)
        rejected = client.post(
            prefix + "/documents/preview",
            headers=HEADERS,
            json=body | {"page_index": 2, "idempotency_key": "invalid-page"},
        ).json()
        failure = finished(client, prefix, rejected)
        assert failure["state"] == "FAILED" and failure["reason"] == "INVALID_PAGE", failure
        listing = client.get(prefix + "/documents", headers=HEADERS).json()
        assert listing["items"][0]["coverage"] == "FULL_TEXT_PARSED"


def test_fts_scope_precedes_limit_and_historical_reads_require_availability(tmp_path: Path):
    """A higher-scoring sibling cannot crowd out permitted hits or leak through old snapshots."""
    from test_scopes import sync

    path, sibling = tmp_path / "permitted.pdf", tmp_path / "sibling.pdf"
    write_pdf(path, "needle " + "unrelated " * 100)
    write_pdf(sibling, "needle needle needle")
    permitted = source() | {
        "contents": [
            {"key": "MAINPDF", "kind": "pdf", "version": "1"},
            {"key": "BADPDF", "kind": "pdf", "version": "1"},
        ]
    }
    foreign = source() | {"contents": [{"key": "SIDEPDF", "kind": "pdf", "version": "1"}]}
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, preview, prefix = document_scope(client, [permitted])
        _, _, foreign_preview, foreign_prefix = document_scope(client, [foreign], key="foreign")
        source_id = preview["items"][0]["id"]
        broken_path = tmp_path / "bad-header.pdf"
        broken_path.write_bytes(b"not a PDF")
        broken = register(client, prefix, source_id, broken_path, "BADPDF")
        assert broken["coverage"] == "UNREADABLE" and broken["reason"] == "INVALID_DOCUMENT_TYPE"
        rejected = client.post(
            prefix + "/documents/ingest",
            headers=HEADERS,
            json={"document_id": broken["id"], "idempotency_key": "bad"},
        )
        assert rejected.status_code == 422 and rejected.json()["code"] == "INVALID_DOCUMENT_TYPE"
        for scope, row, file, key in [
            (prefix, preview, path, "MAINPDF"),
            (foreign_prefix, foreign_preview, sibling, "SIDEPDF"),
        ]:
            doc = register(client, scope, row["items"][0]["id"], file, key)
            assert finished(client, scope, ingest(client, scope, doc))["state"] == "COMPLETE"
        hits = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "needle", "limit": 1}
        ).json()
        assert hits["total"] == 1 and hits["items"][0]["content_key"] == "MAINPDF", hits
        foreign_hit = client.post(
            foreign_prefix + "/search", headers=HEADERS, json={"query": "needle", "limit": 1}
        ).json()["items"][0]
        assert (
            client.get(
                prefix + "/evidence/" + foreign_hit["evidence_id"], headers=HEADERS
            ).status_code
            == 403
        )
        assert (
            client.post(
                prefix + "/search",
                headers=HEADERS,
                json={"query": '" OR *; DROP TABLE documents; --'},
            ).status_code
            == 200
        )
        revised = permitted | {"version": "2", "title": "Updated metadata"}
        assert (
            sync(
                client, notebook, [revised], purpose="revalidation", snapshot_id=snap["id"]
            ).status_code
            == 200
        )
        evidence_path = prefix + "/evidence/" + hits["items"][0]["evidence_id"]
        historical = client.get(evidence_path, headers=HEADERS)
        assert historical.status_code == 200 and historical.json()["historical"] is True
        missing = client.post(
            prefix + "/documents/missing",
            headers=HEADERS,
            json={"source_id": source_id, "content_key": "MAINPDF"},
        )
        assert missing.status_code == 200
        assert client.get(evidence_path, headers=HEADERS).status_code == 404
        assert (
            client.post(prefix + "/search", headers=HEADERS, json={"query": "needle"}).json()[
                "total"
            ]
            == 0
        )


def test_changed_attachment_does_not_stale_its_unchanged_authorized_sibling(tmp_path: Path):
    """Currentness follows one content observation, not another authorized sibling."""
    from test_scopes import sync

    item = source() | {
        "contents": [
            {"key": "FIRSTPDF", "kind": "pdf", "version": "1"},
            {"key": "SECONDPDF", "kind": "pdf", "version": "1"},
        ]
    }
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snapshot, preview, prefix = document_scope(client, [item])
        registered = {}
        for content_key, text in [("FIRSTPDF", "first evidence"), ("SECONDPDF", "second evidence")]:
            path = tmp_path / f"{content_key}.pdf"
            write_pdf(path, text)
            registered[content_key] = register(
                client, prefix, preview["items"][0]["id"], path, content_key
            )
            parsed = finished(
                client, prefix, ingest(client, prefix, registered[content_key], key=content_key)
            )
            assert parsed["state"] == "COMPLETE", parsed
        changed = item | {
            "contents": [item["contents"][0], item["contents"][1] | {"version": "2"}]
        }
        response = sync(
            client, notebook, [changed], purpose="revalidation", snapshot_id=snapshot["id"]
        )
        assert response.status_code == 200, response.text
        rows = client.get(prefix + "/documents", headers=HEADERS).json()["items"]
        assert {row["content_key"]: (row["coverage"], row["historical"]) for row in rows} == {
            "FIRSTPDF": ("FULL_TEXT_PARSED", False),
            "SECONDPDF": ("STALE", True),
        }
        hits = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "evidence"}
        ).json()["items"]
        evidence = [
            client.get(prefix + "/evidence/" + hit["evidence_id"], headers=HEADERS).json()
            for hit in hits
        ]
        assert {row["content_key"]: row["historical"] for row in evidence} == {
            "FIRSTPDF": False,
            "SECONDPDF": True,
        }
        current = finished(
            client, prefix, ingest(client, prefix, registered["FIRSTPDF"], key="current-cache")
        )
        assert current["state"] == "COMPLETE" and current["cache_hit"], current
        refused = client.post(
            prefix + "/documents/ingest",
            headers=HEADERS,
            json={"document_id": registered["SECONDPDF"]["id"], "idempotency_key": "stale"},
        )
        assert refused.status_code == 409 and refused.json()["code"] == "DOCUMENT_STALE"


def test_failed_native_text_hash_and_changed_stage_never_publish(tmp_path: Path):
    """The last segment cannot commit a mismatched hash or an obsolete source observation."""
    from test_scopes import sync

    item = source() | {"contents": [{"key": "NOTEKEY1", "kind": "human_note", "version": "1"}]}
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, preview, prefix = document_scope(
            client, [item], spec={"include_notes": True}
        )
        stage = client.post(
            prefix + "/documents/text",
            headers=HEADERS,
            json={
                "source_id": preview["items"][0]["id"],
                "content_key": "NOTEKEY1",
                "total_characters": 7,
                "sha256": hashlib.sha256(b"correct").hexdigest(),
            },
        ).json()
        route = prefix + "/documents/text/" + stage["id"]
        failed = client.post(
            route, headers=HEADERS, json={"offset": 0, "text": "altered", "final": True}
        )
        assert failed.status_code == 409 and failed.json()["code"] == "TEXT_HASH_MISMATCH"
        assert (
            sync(
                client,
                notebook,
                [item | {"version": "2"}],
                purpose="revalidation",
                snapshot_id=snap["id"],
            ).status_code
            == 200
        )
        assert (
            client.post(
                route, headers=HEADERS, json={"offset": 0, "text": "correct", "final": True}
            ).status_code
            == 409
        )
        with app.state.services.database.transaction() as connection:
            assert connection.execute("SELECT count(*) FROM document_versions").fetchone()[0] == 0


def test_owned_worker_cancellation_timeout_and_memory(tmp_path: Path, monkeypatch):
    """Actual suspended worker ownership and hard limits survive every terminal path."""
    import _winapi
    import subprocess
    import sys
    import threading

    import win32api
    import win32con
    import win32process

    path = tmp_path / "large.pdf"
    path.write_bytes(pdf_bytes([{"lines": [(40, 440, "a" * 1000)]} for _ in range(500)]))
    launch = _winapi.CreateProcess
    owned_handles = []
    launched = threading.Event()

    def observed_launch(*args, **kwargs):
        result = launch(*args, **kwargs)
        if "--parser-worker" in args[1]:
            owned_handles.append(
                win32api.OpenProcess(
                    win32con.SYNCHRONIZE | win32con.PROCESS_QUERY_INFORMATION, False, result[2]
                )
            )
            launched.set()
        return result

    unrelated = subprocess.Popen(
        [sys.executable, "-c", "import time; time.sleep(30)"],
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    monkeypatch.setattr(_winapi, "CreateProcess", observed_launch)
    clock = [0.0]
    app = make_app(tmp_path / "engine", clock)
    try:
        with TestClient(app, base_url="http://127.0.0.1:49200") as client:
            _, _, preview, prefix = document_scope(client)
            document = register(client, prefix, preview["items"][0]["id"], path)
            operation = ingest(client, prefix, document, key="cancel")
            assert launched.wait(5), "Real parser process was not launched"
            assert (
                client.post(
                    prefix + "/operations/" + operation["id"] + "/cancel", headers=HEADERS
                ).status_code
                == 200
            )
            result = finished(client, prefix, operation)
            assert result["state"] == "CANCELLED" and result["document_version_id"] is None
            timed = finished(
                client,
                prefix,
                ingest(client, prefix, document, key="timeout", limits={"timeout_seconds": 0.1}),
            )
            assert timed["state"] == "PAUSED" and timed["reason"] == "PARSER_TIMEOUT", timed
            launched.clear()
            changing = ingest(client, prefix, document, key="changing-registration")
            assert launched.wait(5)
            another = tmp_path / "another.pdf"
            write_pdf(another, "replacement observation")
            register(client, prefix, preview["items"][0]["id"], another)
            stale = finished(client, prefix, changing)
            assert stale["state"] == "PAUSED" and stale["reason"] == "DOCUMENT_STALE", stale
            assert (
                client.get(prefix + "/documents", headers=HEADERS).json()["items"][0]["coverage"]
                == "STALE"
            )
            path.write_bytes(
                pdf_bytes(
                    [
                        {
                            "lines": [
                                (40 + i % 10, 40 + i % 400, "limited allocation")
                                for i in range(100_000)
                            ]
                        }
                    ]
                )
            )
            document = register(client, prefix, preview["items"][0]["id"], path)
            memory = finished(
                client,
                prefix,
                ingest(
                    client,
                    prefix,
                    document,
                    key="memory",
                    limits={"memory_bytes": 64 * 1024 * 1024},
                ),
            )
            assert memory["state"] == "PAUSED" and memory["reason"] == "PARSER_MEMORY_LIMIT", memory
            assert unrelated.poll() is None, "Cancellation killed an unrelated process"
            assert all(win32process.GetExitCodeProcess(handle) != 259 for handle in owned_handles)
            with app.state.services.database.transaction() as connection:
                assert (
                    connection.execute("SELECT count(*) FROM document_versions").fetchone()[0] == 0
                )
            launched.clear()
            expired = ingest(client, prefix, document, key="expired")
            assert launched.wait(5)
            clock[0] = 31.0
            assert (
                client.get(prefix + "/operations/" + expired["id"], headers=HEADERS).status_code
                == 503
            )
            import json

            deadline = time.monotonic() + 5
            while time.monotonic() < deadline:
                with app.state.services.database.transaction() as connection:
                    receipt = json.loads(
                        connection.execute(
                            "SELECT payload FROM document_operations WHERE id=?", (expired["id"],)
                        ).fetchone()[0]
                    )
                if receipt["state"] == "PAUSED":
                    break
                time.sleep(0.02)
            assert receipt["reason"] == "BRIDGE_EXPIRED", receipt
            assert win32process.GetExitCodeProcess(owned_handles[-1]) != 259
    finally:
        unrelated.terminate()
        unrelated.wait(timeout=5)
        for handle in owned_handles:
            handle.Close()


@pytest.mark.parametrize(
    "kind, expected",
    [("empty", "NEEDS_OCR"), ("corrupt", "UNREADABLE"), ("unmapped", "FULL_TEXT_PARSED")],
)
def test_unusable_text_and_unverified_geometry_remain_explicit(tmp_path: Path, kind, expected):
    """Unusable text stays explicit; unverified character correspondence gets page precision."""
    path = tmp_path / "quality.pdf"
    if kind == "corrupt":
        path.write_bytes(b"%PDF-1.7\ninvalid structure\n")
    elif kind == "empty":
        path.write_bytes(pdf_bytes([{"operations": ["0 0 0 rg 30 30 200 200 re f"]}]))
    else:
        write_pdf(path, "boundary " * 100)
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, preview, prefix = document_scope(client)
        document = register(client, prefix, preview["items"][0]["id"], path)
        result = finished(client, prefix, ingest(client, prefix, document))
        assert result["coverage"] == expected, result
        if kind == "corrupt":
            assert result["state"] == "FAILED" and result["document_version_id"] is None
        else:
            assert result["pages_processed"] == result["page_count"] == 1
        if kind == "unmapped":
            hits = client.post(
                prefix + "/search", headers=HEADERS, json={"query": "boundary"}
            ).json()
            evidence = client.get(
                prefix + "/evidence/" + hits["items"][0]["evidence_id"], headers=HEADERS
            ).json()
            assert evidence["precision"] == "page" and evidence["rectangles"] == []


def test_supervisor_finalization_failure_is_visible_and_database_still_closes(
    tmp_path: Path, monkeypatch
):
    """An unexpected receipt failure is observable at the request and shutdown boundaries."""
    import sqlite3

    from evidra.domain.errors import EvidraError

    path = tmp_path / "corrupt.pdf"
    path.write_bytes(b"%PDF-1.7\ninvalid structure")
    app = make_app(tmp_path / "engine", [0.0])
    with pytest.raises(EvidraError, match="could not finalize"):
        with TestClient(app, base_url="http://127.0.0.1:49200") as client:
            _, _, preview, prefix = document_scope(client)
            document = register(client, prefix, preview["items"][0]["id"], path)

            def unavailable_receipt(*_):
                raise sqlite3.OperationalError("controlled write failure")

            monkeypatch.setattr(app.state.services.ingestion, "_failure", unavailable_receipt)
            operation = ingest(client, prefix, document)
            deadline = time.monotonic() + 5
            while time.monotonic() < deadline:
                response = client.get(prefix + "/operations/" + operation["id"], headers=HEADERS)
                if response.status_code == 500:
                    break
                time.sleep(0.02)
            assert response.json()["code"] == "DOCUMENT_SUPERVISOR_FAILED", response.text
            assert "controlled write failure" not in response.text
    with pytest.raises(EvidraError, match="closed"):
        with app.state.services.database.transaction():
            pytest.fail("Database remained open after supervisor failure")


def test_document_pages_respect_the_actual_renderer_envelope(tmp_path: Path):
    """Large valid Unicode titles page without truncating or dropping authorized documents."""
    import json

    item = source() | {
        "title": "🧪" * 10_000,
        "contents": [{"key": f"PDF{i:03}", "kind": "pdf"} for i in range(100)],
    }
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, _, prefix = document_scope(client, [item])
        offset, found = 0, []
        while True:
            response = client.get(prefix + f"/documents?offset={offset}&limit=50", headers=HEADERS)
            assert response.status_code == 200, response.text
            page = response.json()
            envelope = {"channel": "evidra-ui-v1", "id": "x" * 80, "result": page, "error": None}
            assert (
                len(json.dumps(envelope, ensure_ascii=False).encode("utf-16-le")) // 2 <= 1_000_000
            )
            assert all(row["title"] == item["title"] for row in page["items"])
            found.extend(row["content_key"] for row in page["items"])
            assert page["limit"] == len(page["items"]) > 0
            offset += page["limit"]
            if offset >= page["total"]:
                break
        assert len(found) == len(set(found)) == 100
