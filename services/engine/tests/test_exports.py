"""Portable exports: real scoped SQLite/HTTP, typed CSV and hostile ZIP boundaries."""

import base64
import csv
import hashlib
import io
import json
import stat
import zipfile

import pytest
from fastapi.testclient import TestClient
from test_matrix import setup
from test_research import protocol
from test_runtime_notebooks import HEADERS, make_app


def post(client, path, body, status=201):
    response = client.post(path, headers=HEADERS, json=body)
    assert response.status_code == status, response.text
    return response.json()


def export(client, prefix, format="json", **options):
    preview = post(client, prefix + "/exports/previews", {"format": format, **options})
    artifact = post(
        client,
        prefix + "/exports",
        {
            "preview_id": preview["id"],
            "idempotency_key": "create-" + preview["id"],
        },
    )
    data = bytearray()
    while len(data) < artifact["bytes"]:
        response = client.get(
            prefix + f"/exports/{artifact['id']}/data?offset={len(data)}", headers=HEADERS
        )
        assert response.status_code == 200, response.text
        data.extend(base64.b64decode(response.json()["data_base64"]))
    assert hashlib.sha256(data).hexdigest() == artifact["sha256"]
    return bytes(data), preview, artifact


def upload(client, prefix, data):
    stage = post(
        client,
        prefix + "/imports/uploads",
        {
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        },
    )
    for offset in range(0, len(data), 24000):
        post(
            client,
            prefix + f"/imports/uploads/{stage['id']}",
            {
                "offset": offset,
                "data_base64": base64.b64encode(data[offset : offset + 24000]).decode(),
            },
            200,
        )
    return client.post(prefix + f"/imports/uploads/{stage['id']}/inspect", headers=HEADERS)


def decision_fixture(client):
    prefix, form, body = setup(client)
    _, protocol1 = protocol(client, prefix, form)
    proposal = post(client, prefix + "/matrix/proposals", body)
    decision = post(
        client,
        prefix + "/matrix/decisions",
        {
            "proposal_id": proposal["id"],
            "expected_revision": 0,
            "action": "APPROVED",
            "idempotency_key": "approve",
        },
    )
    return prefix, form, proposal, decision, protocol1


def test_versioned_roundtrip_has_typed_imported_history_without_local_authority(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, proposal, decision, protocol1 = decision_fixture(client)
        archive, preview, _ = export(client, prefix, "backup")
        assert preview["pdf_bytes"] == 0
        with zipfile.ZipFile(io.BytesIO(archive)) as opened:
            assert set(opened.namelist()) == {"manifest.json", "notebook.json"}
            notebook = json.loads(opened.read("notebook.json"))
        records = notebook["records"]
        assert next(r["data"] for r in records if r["kind"] == "decision") == decision
        assert next(r["data"] for r in records if r["kind"] == "protocol") == protocol1
        assert any(r["kind"] == "document_version" for r in records)
        assert any(r["kind"] == "evidence" and r["data"]["excerpt"] for r in records)
        inspected = upload(client, prefix, archive)
        assert inspected.status_code == 201, inspected.text
        review = inspected.json()
        original_sources = client.get(
            prefix + f"/imports/uploads/{review['id']}/sources?offset=0&limit=20", headers=HEADERS
        ).json()["items"]
        assert len(original_sources) == review["source_count"]
        mappings = [
            {
                "original": s["identity"],
                "target": s["identity"],
                "contents": [
                    {"original_key": c["key"], "target_key": c["key"], "kind": c["kind"]}
                    for c in s["contents"]
                ],
            }
            for s in original_sources
        ]
        revision = 0
        for mapping in mappings:
            request = dict(
                mapping,
                offset=0,
                final=True,
                expected_revision=revision,
                idempotency_key=f"map-{revision}",
            )
            result = post(
                client, prefix + f"/imports/uploads/{review['id']}/mappings", request, 200
            )
            assert (
                post(client, prefix + f"/imports/uploads/{review['id']}/mappings", request, 200)
                == result
            )
            revision = result["revision"]
        before = {}
        with app.state.services.database.transaction() as connection:
            for table in [
                "cell_decisions",
                "extraction_jobs",
                "approved_write_outbox",
                "mcp_connections",
            ]:
                before[table] = connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
        body = {
            "preview_id": review["id"],
            "expected_mapping_revision": revision,
            "confirmed": True,
            "idempotency_key": "import",
        }
        imported = post(client, prefix + "/imports", body)
        assert post(client, prefix + "/imports", body) == imported
        page = client.get(
            prefix + f"/imports/{imported['id']}/records?offset=0&limit=20", headers=HEADERS
        ).json()
        all_records = page["items"]
        offset = len(all_records)
        while offset < page["total"]:
            page = client.get(
                prefix + f"/imports/{imported['id']}/records?offset={offset}&limit=20",
                headers=HEADERS,
            ).json()
            all_records.extend(page["items"])
            offset += len(page["items"])
        imported_decision = next(r for r in all_records if r["kind"] == "decision")
        assert imported_decision["origin"] == "IMPORTED"
        assert imported_decision["data"] == decision
        assert imported_decision["data"]["new"]["value"] == {"original": "42", "normalized": 42.0}
        assert imported_decision["data"]["new"]["proposal_id"] == proposal["id"]
        assert next(r for r in all_records if r["kind"] == "form")["data"] == form
        with app.state.services.database.transaction() as connection:
            for table, count in before.items():
                assert connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0] == count
        second, _, _ = export(client, prefix)
        assert any(r["origin"] == "IMPORTED" for r in json.loads(second)["records"])
        # A foreign mapping is never a grant; even same-profile remapping is explicit.
        bad = dict(
            mappings[0],
            offset=0,
            final=True,
            expected_revision=revision,
            idempotency_key="bad",
            target={**mappings[0]["target"], "profile_instance_id": "another-profile"},
        )
        assert (
            client.post(
                prefix + f"/imports/uploads/{review['id']}/mappings", headers=HEADERS, json=bad
            ).status_code
            == 403
        )
        app.state.services.scopes.revoke_access(proposal["source_id"])
        assert (
            client.get(
                prefix + f"/imports/{imported['id']}/records?offset=0&limit=20", headers=HEADERS
            ).json()["items"]
            == []
        )
        redacted, _, _ = export(client, prefix)
        assert b"reported result" not in redacted and b"Reported explicitly" not in redacted
        assert json.loads(redacted)["omissions"]


@pytest.mark.parametrize(
    "kind",
    [
        "path",
        "absolute",
        "backslash",
        "symlink",
        "duplicate",
        "bomb",
        "version",
        "checksum",
        "schema",
    ],
)
def test_hostile_archives_rejected_without_extraction(tmp_path, kind):
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, *_ = setup(client)
        valid, _, _ = export(client, prefix, "backup")
        with zipfile.ZipFile(io.BytesIO(valid)) as opened:
            entries = {name: opened.read(name) for name in opened.namelist()}
        if kind in {"version", "checksum"}:
            manifest = json.loads(entries["manifest.json"])
            if kind == "version":
                manifest["schema_version"] = 999
            else:
                manifest["files"][0]["sha256"] = "0" * 64
            entries["manifest.json"] = json.dumps(manifest).encode()
        if kind == "schema":
            payload = json.loads(entries["notebook.json"])
            payload["token_hash"] = "forbidden"
            entries["notebook.json"] = json.dumps(payload).encode()
            manifest = json.loads(entries["manifest.json"])
            manifest["files"][0].update(
                bytes=len(entries["notebook.json"]),
                sha256=hashlib.sha256(entries["notebook.json"]).hexdigest(),
            )
            entries["manifest.json"] = json.dumps(manifest).encode()
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name, value in entries.items():
                archive.writestr(name, value)
            if kind in {"path", "absolute", "backslash"}:
                archive.writestr(
                    {
                        "path": "../escape.txt",
                        "absolute": "C:/escape.txt",
                        "backslash": "..\\escape.txt",
                    }[kind],
                    b"malice",
                )
            elif kind == "symlink":
                info = zipfile.ZipInfo("pdfs/link.pdf")
                info.create_system = 3
                info.external_attr = (stat.S_IFLNK | 0o777) << 16
                archive.writestr(info, b"../../escape.txt")
            elif kind == "duplicate":
                with pytest.warns(UserWarning):
                    archive.writestr("notebook.json", entries["notebook.json"])
            elif kind == "bomb":
                archive.writestr("pdfs/" + "a" * 64 + ".pdf", b"0" * 2_000_000)
        response = upload(client, prefix, stream.getvalue())
        assert response.status_code == 422, response.text
        assert response.json()["code"] == "INVALID_BACKUP"
        assert not (tmp_path.parent / "escape.txt").exists()


@pytest.mark.parametrize(
    "text", ['=WEBSERVICE("https://bad")', "+SUM(1,2)", "-2+3", "@SUM(A1)", "\t=1+1", "\r=1+1"]
)
def test_csv_neutralizes_text_but_retains_typed_numbers(tmp_path, text):
    from evidra.exports.csv import csv_cell

    assert csv_cell(text, kind="text").startswith("'")
    assert csv_cell(-3.5, kind="number") == -3.5
    assert csv_cell(0, kind="number") == 0
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, _, body = setup(client)
        proposal = post(
            client,
            prefix + "/matrix/proposals",
            dict(body, value={"original": text, "normalized": -3.5}),
        )
        post(
            client,
            prefix + "/matrix/decisions",
            {
                "proposal_id": proposal["id"],
                "expected_revision": 0,
                "action": "APPROVED",
                "idempotency_key": "decision",
            },
        )
        data, _, _ = export(client, prefix, "csv_results", excel=True)
        assert data.startswith(b"\xef\xbb\xbf")
        row = next(csv.DictReader(io.StringIO(data.decode("utf-8-sig"))))
        assert row["value"] == "-3.5" and row["original"] == "'" + text
        assert row["unit"] == "percent" and row["review_state"] == "APPROVED"
        assert "reported result" in row["evidence"]
