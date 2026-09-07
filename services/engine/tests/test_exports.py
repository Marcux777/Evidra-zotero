"""Portable exports: real scoped SQLite/HTTP, typed CSV and hostile ZIP boundaries."""

import base64
import csv
import hashlib
import io
import json
import sqlite3
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
        second_archive, _, _ = export(client, prefix, "backup")
        second_inspect = upload(client, prefix, second_archive)
        assert second_inspect.status_code == 201, second_inspect.text
        second_preview = second_inspect.json()
        second_revision = 0
        for mapping in mappings:
            second_revision = post(
                client,
                prefix + f"/imports/uploads/{second_preview['id']}/mappings",
                dict(
                    mapping,
                    offset=0,
                    final=True,
                    expected_revision=second_revision,
                    idempotency_key=f"map-{second_revision}",
                ),
                200,
            )["revision"]
        second_import = post(
            client,
            prefix + "/imports",
            {
                "preview_id": second_preview["id"],
                "expected_mapping_revision": second_revision,
                "confirmed": True,
                "idempotency_key": "second-import",
            },
        )
        assert second_import["record_count"] == 2 * imported["record_count"]
        third_archive, _, _ = export(client, prefix, "backup")
        third_inspect = upload(client, prefix, third_archive)
        if third_inspect.status_code != 201:
            from evidra.exports.backup import read_backup

            read_backup(third_archive)  # Preserve the original causal validation chain.
        assert third_inspect.status_code == 201, third_inspect.text
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


def test_archive_cannot_erase_source_mapping_by_forging_empty_access(tmp_path):
    from evidra.exports.backup import make_backup
    from evidra.exports.models import PortableNotebook

    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, *_ = decision_fixture(client)
        raw, _, _ = export(client, prefix)
        portable = json.loads(raw)
        for record in portable["records"]:
            record["access"] = []
        forged = make_backup(PortableNotebook.model_validate(portable), [])
        inspected = upload(client, prefix, forged)
        assert inspected.status_code == 201, inspected.text
        preview = inspected.json()
        assert preview["source_count"] == 1
        denied = client.post(
            prefix + "/imports",
            headers=HEADERS,
            json={
                "preview_id": preview["id"],
                "confirmed": True,
                "expected_mapping_revision": 0,
                "idempotency_key": "unmapped",
            },
        )
        assert denied.status_code == 403, denied.text


def test_bibliography_preview_does_not_read_research_or_attachment_text(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _, proposal, *_ = decision_fixture(client)
        denied_reads = []
        blocked = {
            "document_pages",
            "document_chunks",
            "form_versions",
            "extraction_proposals",
            "cell_decisions",
            "imported_records",
            "external_notes",
        }

        def authorize(operation, table, column, *_):
            if operation == sqlite3.SQLITE_READ and table in blocked:
                denied_reads.append((table, column))
                return sqlite3.SQLITE_DENY
            return sqlite3.SQLITE_OK

        with app.state.services.database.transaction() as conn:
            conn.set_authorizer(authorize)
        try:
            value = post(
                client,
                prefix + "/exports/previews",
                {"format": "bibtex", "source_ids": [proposal["source_id"]]},
            )
            assert [s["id"] for s in value["bibliography"]] == [proposal["source_id"]]
            assert value["bibliography"][0]["contents"] == []
            post(client, prefix + f"/exports/{value['id']}/validate", {}, 200)
            assert denied_reads == []
        finally:
            with app.state.services.database.transaction() as conn:
                conn.set_authorizer(None)


def test_pdf_preview_original_bytes_and_cached_revocation(tmp_path):
    from pdf_fixtures import write_pdf
    from test_documents import document_scope, finished, ingest, register

    path = tmp_path / "selected.pdf"
    original = write_pdf(path)
    with TestClient(
        make_app(tmp_path / "engine", [0.0]), base_url="http://127.0.0.1:49200"
    ) as client:
        _, _, sources, prefix = document_scope(client)
        source_id = sources["items"][0]["id"]
        document = register(client, prefix, source_id, path)
        result = finished(client, prefix, ingest(client, prefix, document))
        assert result["state"] == "COMPLETE", result
        default, default_preview, _ = export(client, prefix, "backup")
        assert default_preview["pdf_bytes"] == 0
        with zipfile.ZipFile(io.BytesIO(default)) as archive:
            assert all(not name.endswith(".pdf") for name in archive.namelist())
        included, preview, artifact = export(client, prefix, "backup", include_pdfs=True)
        assert preview["pdf_bytes"] == len(original)
        with zipfile.ZipFile(io.BytesIO(included)) as archive:
            pdf = next(name for name in archive.namelist() if name.endswith(".pdf"))
            assert archive.read(pdf) == original
        inspected = upload(client, prefix, included)
        assert inspected.status_code == 201, inspected.text
        review = inspected.json()
        source = sources["items"][0]
        mapped = post(
            client,
            prefix + f"/imports/uploads/{review['id']}/mappings",
            {
                "original": source["identity"],
                "target": source["identity"],
                "contents": [
                    {"original_key": c["key"], "target_key": c["key"], "kind": c["kind"]}
                    for c in source["contents"]
                ],
                "offset": 0,
                "final": True,
                "expected_revision": 0,
                "idempotency_key": "pdf-map",
            },
            200,
        )
        post(
            client,
            prefix + "/imports",
            {
                "preview_id": review["id"],
                "confirmed": True,
                "expected_mapping_revision": mapped["revision"],
                "idempotency_key": "pdf-import",
            },
        )
        reexported, measured, _ = export(client, prefix, "backup", include_pdfs=True)
        assert measured["pdf_bytes"] == len(original)  # Identical originals copied once.
        assert upload(client, prefix, reexported).status_code == 201
        path.unlink()
        post(
            client,
            prefix + "/documents/missing",
            {"source_id": source_id, "content_key": source["contents"][0]["key"]},
            200,
        )
        denied = client.get(prefix + f"/exports/{artifact['id']}/data?offset=0", headers=HEADERS)
        assert denied.status_code == 404 and denied.json()["code"] == "MISSING_FILE", denied.text
        redacted, _, _ = export(client, prefix, "backup", include_pdfs=True)
        assert b"decisive finding" not in redacted
        with zipfile.ZipFile(io.BytesIO(redacted)) as archive:
            assert not any(name.endswith(".pdf") for name in archive.namelist())


def test_external_note_provenance_no_credentials_and_nested_evidence_validation(tmp_path):
    from evidra.exports.backup import make_backup
    from evidra.exports.models import PortableNotebook

    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, _, proposal, *_ = decision_fixture(client)
        token = "9" * 64
        post(
            client,
            prefix + "/mcp/connections",
            {
                "label": "Synthetic external client",
                "allow_proposals": True,
                "expires_in_seconds": 3600,
                "idempotency_key": "connection",
                "token": token,
            },
        )
        response = client.post(
            "/v1/mcp/gateway/propose_note",
            headers={"x-evidra-client": "mcp", "Authorization": "Bearer " + token},
            json={
                "text": "External draft retains its original evidence",
                "evidence_ids": proposal["evidence_ids"],
                "declared_model": "unverified client claim",
                "idempotency_key": "note",
            },
        )
        assert response.status_code == 200, response.text
        note = response.json()
        raw, _, _ = export(client, prefix)
        portable = json.loads(raw)
        record = next(r for r in portable["records"] if r["kind"] == "external_note")
        assert record["data"] == note and note["run_id"] is None
        assert (
            token.encode() not in raw
            and hashlib.sha256(token.encode()).hexdigest().encode() not in raw
        )
        assert (
            b"connection_file" not in raw
            and b"token_hash" not in raw
            and b"access_token" not in raw
        )
        record["data"]["evidence"][0]["excerpt"] = "forged original evidence"
        forged = make_backup(PortableNotebook.model_validate(portable), [])
        inspected = upload(client, prefix, forged)
        assert inspected.status_code == 422, inspected.text
        assert inspected.json()["code"] == "INVALID_BACKUP"


def test_foreign_profile_requires_explicit_mapping_and_exact_indexed_evidence(tmp_path):
    from test_documents import document_scope
    from test_scopes import source

    with TestClient(
        make_app(tmp_path / "original", [0.0]), base_url="http://127.0.0.1:49200"
    ) as client:
        prefix, _, _, decision, _ = decision_fixture(client)
        archive, _, _ = export(client, prefix, "backup")
        with zipfile.ZipFile(io.BytesIO(archive)) as opened:
            notebook = json.loads(opened.read("notebook.json"))
        original = next(r["data"] for r in notebook["records"] if r["kind"] == "source")
        evidence = next(r["data"] for r in notebook["records"] if r["kind"] == "evidence")
        text = next(
            r["data"]["original_text"] for r in notebook["records"] if r["kind"] == "page_part"
        )
    app = make_app(tmp_path / "destination", [0.0], profile="profile-b")
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        target = source(key="TARGET01", library=9)
        target["identity"]["profile_instance_id"] = "profile-b"
        target["contents"] = [{"key": "TARGET01", "kind": "abstract", "version": "1"}]
        target2 = {
            **target,
            "identity": {**target["identity"], "item_key": "TARGET02"},
            "contents": [{"key": "TARGET02", "kind": "abstract", "version": "1"}],
        }
        _, _, selected, prefix = document_scope(client, [target, target2])
        actual = next(s for s in selected["items"] if s["identity"]["item_key"] == "TARGET01")
        other = next(s for s in selected["items"] if s["identity"]["item_key"] == "TARGET02")
        inspected = upload(client, prefix, archive)
        assert inspected.status_code == 201, inspected.text
        preview = inspected.json()
        commit = {
            "preview_id": preview["id"],
            "confirmed": True,
            "expected_mapping_revision": 0,
            "idempotency_key": "foreign",
        }
        assert client.post(prefix + "/imports", headers=HEADERS, json=commit).status_code == 403
        mapping = {
            "original": original["identity"],
            "target": actual["identity"],
            "contents": [
                {
                    "original_key": evidence["content_key"],
                    "target_key": "TARGET01",
                    "kind": "abstract",
                }
            ],
            "offset": 0,
            "final": True,
            "expected_revision": 0,
            "idempotency_key": "remap",
        }
        state = post(client, prefix + f"/imports/uploads/{preview['id']}/mappings", mapping, 200)
        imported = post(
            client, prefix + "/imports", dict(commit, expected_mapping_revision=state["revision"])
        )
        page = client.get(
            prefix + f"/imports/{imported['id']}/records?offset=0&limit=20", headers=HEADERS
        ).json()
        history = next(r for r in page["items"] if r["kind"] == "decision")
        assert history["data"] == decision and history["origin_profile_id"] == "profile-a"
        assert history["import_chain"][0]["import_id"] == imported["id"]
        request = {"evidence_id": evidence["id"], "origin_group_id": history["origin_group_id"]}
        endpoint = prefix + f"/imports/{imported['id']}/evidence"
        assert (
            client.post(endpoint, headers=HEADERS, json=request).json()["code"] == "DOCUMENT_STALE"
        )
        stage = post(
            client,
            prefix + "/documents/text",
            {
                "source_id": actual["id"],
                "content_key": "TARGET01",
                "total_characters": len(text),
                "sha256": hashlib.sha256(text.encode()).hexdigest(),
            },
        )
        post(
            client,
            prefix + f"/documents/text/{stage['id']}",
            {"offset": 0, "text": text, "final": True},
            200,
        )
        mapped = post(client, endpoint, request, 200)
        assert (
            mapped["excerpt"] == evidence["excerpt"]
            and mapped["source_identity"] == actual["identity"]
        )
        assert mapped["id"] != evidence["id"]
        reference = post(
            client,
            prefix + f"/imports/{imported['id']}/reference",
            {
                "kind": "form",
                "identity": decision["new"]["form_version_id"],
                "origin_group_id": history["origin_group_id"],
            },
            200,
        )
        assert reference["record"]["kind"] == "form"
        second = upload(client, prefix, archive).json()
        post(
            client,
            prefix + f"/imports/uploads/{second['id']}/mappings",
            {
                **mapping,
                "target": other["identity"],
                "contents": [
                    {
                        "original_key": evidence["content_key"],
                        "target_key": "TARGET02",
                        "kind": "abstract",
                    }
                ],
            },
            200,
        )
        second_import = post(
            client,
            prefix + "/imports",
            {
                **commit,
                "preview_id": second["id"],
                "expected_mapping_revision": 1,
                "idempotency_key": "second",
            },
        )
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM cell_decisions").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM form_versions").fetchone()[0] == 0
        app.state.services.scopes.revoke_access(actual["id"])
        assert client.post(endpoint, headers=HEADERS, json=request).status_code == 403
        remaining, _, _ = export(client, prefix)
        portable = json.loads(remaining)
        visible_imports = {r["import_id"] for r in portable["records"] if r["origin"] == "IMPORTED"}
        assert visible_imports == {second_import["id"]}
        assert portable["omissions"]


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
