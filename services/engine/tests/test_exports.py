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


@pytest.mark.parametrize("format", ["csv_results", "csv_studies", "backup"])
def test_export_current_cell_survives_rejection_of_a_competing_proposal(tmp_path, format):
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, form, accepted, _, _ = decision_fixture(client)
        competitor = post(
            client,
            prefix + "/matrix/proposals",
            {
                "form_version_id": form["id"],
                "source_id": accepted["source_id"],
                "field_key": accepted["field_key"],
                "value": {"original": "43", "normalized": 43},
                "value_state": "FOUND",
                "evidence_ids": accepted["evidence_ids"],
                "rationale": "Incorrect competing reading",
                "idempotency_key": "competitor",
            },
        )
        rejected = post(
            client,
            prefix + "/matrix/decisions",
            {
                "proposal_id": competitor["id"],
                "expected_revision": 1,
                "action": "REJECTED",
                "rationale": "Preserve the reviewed value",
                "idempotency_key": "reject-competitor",
            },
        )
        current = client.post(
            prefix + "/matrix/query",
            headers=HEADERS,
            json={"form_version_id": form["id"], "offset": 0},
        ).json()["items"][0]
        assert current["review_state"] == "APPROVED" and current["proposal_id"] == accepted["id"]
        data, _, _ = export(client, prefix, format)
        if format == "backup":
            from evidra.exports.backup import read_backup, validate_references
            from evidra.exports.models import PortableNotebook

            inspected = upload(client, prefix, data)
            assert inspected.status_code == 201, inspected.text
            notebook, _ = read_backup(data)
            portable = notebook.model_dump(mode="json")
            retained = next(
                r["data"]
                for r in portable["records"]
                if r["kind"] == "decision" and r["data"]["id"] == rejected["id"]
            )
            assert retained["new"]["proposal_id"] == accepted["id"]
            retained["new"]["proposal_id"] = "missing-proposal"
            with pytest.raises(ValueError, match="Unresolved decision proposal"):
                validate_references(PortableNotebook.model_validate(portable))
            return
        row = next(csv.DictReader(io.StringIO(data.decode("utf-8"))))
        column = "result.1." if format == "csv_studies" else ""
        assert row[column + "review_state"] == current["review_state"]
        assert row[column + "proposal_id"] == current["proposal_id"]
        assert float(row[column + "value"]) == 42 and row[column + "revision"] == "2"
        assert row[column + "decision_id"] == rejected["id"]
        assert row[column + "decision_action"] == "REJECTED"

        # Revisions belong to one snapshot: revision 2 above must never outrank
        # a reviewed revision 1 in the newly selected snapshot.
        from test_scopes import capture, source

        notebook_id = prefix.split("/")[3]
        item = source(version="2") | {"title": "Selected source version"}
        item["contents"] = [{"key": "SAMEKEY1", "kind": "abstract", "version": "1"}]
        snapshot, _, _ = capture(client, notebook_id, [item], key="new-snapshot", revision=2)
        selected = f"/v1/notebooks/{notebook_id}/snapshots/{snapshot['id']}"
        proposal = post(
            client,
            selected + "/matrix/proposals",
            {
                "form_version_id": form["id"],
                "source_id": accepted["source_id"],
                "field_key": accepted["field_key"],
                "value": {"original": "99", "normalized": 99},
                "value_state": "FOUND",
                "evidence_ids": accepted["evidence_ids"],
                "rationale": "Review in selected snapshot",
                "idempotency_key": "selected-proposal",
            },
        )
        selected_decision = post(
            client,
            selected + "/matrix/decisions",
            {
                "proposal_id": proposal["id"],
                "expected_revision": 0,
                "action": "APPROVED",
                "idempotency_key": "selected-decision",
            },
        )
        data, _, _ = export(client, selected, format)
        rows = list(csv.DictReader(io.StringIO(data.decode("utf-8"))))
        assert len(rows) == 1
        assert float(rows[0][column + "value"]) == 99
        assert rows[0][column + "revision"] == "1"
        assert rows[0][column + "decision_id"] == selected_decision["id"]
        assert rows[0]["snapshot_id"] == snapshot["id"]
        assert rows[0]["title"] == "Selected source version"
        assert rows[0]["source_version"]
        # Flat projection must leave both original decision histories portable.
        data, _, _ = export(client, selected)
        decisions = [r for r in json.loads(data)["records"] if r["kind"] == "decision"]
        assert {rejected["id"], selected_decision["id"]} <= {r["data"]["id"] for r in decisions}
        from evidra.exports.backup import validate_references
        from evidra.exports.csv import render_csv
        from evidra.exports.models import PortableNotebook

        imported = json.loads(data)
        for record in imported["records"]:
            record.update(
                origin="IMPORTED",
                origin_group_id="a" * 64,
                import_chain=[{"import_id": "b" * 32, "imported_at": imported["exported_at"]}],
            )
        imported = PortableNotebook.model_validate(imported)
        validate_references(imported)
        rows = list(
            csv.DictReader(
                io.StringIO(
                    render_csv(imported, per_study=format == "csv_studies", excel=False).decode()
                )
            )
        )
        assert len(rows) == 2
        assert {
            (r["snapshot_id"], float(r[column + "value"]), r[column + "revision"]) for r in rows
        } == {(prefix.rsplit("/", 1)[1], 42, "2"), (snapshot["id"], 99, "1")}
        assert {r["import_group"] for r in rows} == {"a" * 64}
        assert len({r["source_version"] for r in rows}) == 2


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


def test_imported_omissions_survive_restart_without_denied_external_text(tmp_path):
    from evidra.domain.sources import SourceInput
    from evidra.exports.backup import make_backup, read_backup
    from evidra.exports.models import PortableNotebook

    identifiers = ["REVOKED_RECORD_SENTINEL", "OMISSION_ID_SENTINEL", "OMISSION_KIND_SENTINEL"]
    payload = "REVOKED_PAYLOAD_SENTINEL"
    app = make_app(tmp_path, [0.0])
    failures = []
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _, proposal, *_ = decision_fixture(client)
        raw, _, _ = export(client, prefix)
        portable = json.loads(raw)
        source_data = next(r["data"] for r in portable["records"] if r["kind"] == "source")
        native_source = {key: source_data[key] for key in SourceInput.model_fields}
        decision = next(r for r in portable["records"] if r["kind"] == "decision")
        decision["id"] = identifiers[0]
        decision["data"]["rationale"] = payload
        portable["omissions"] = [
            {"kind": identifiers[2], "id": identifiers[1], "reason": "DEPENDENCY_OMITTED"}
        ]
        archive = make_backup(PortableNotebook.model_validate(portable), [])
        inspected = upload(client, prefix, archive)
        assert inspected.status_code == 201, inspected.text
        preview = inspected.json()
        sources = client.get(
            prefix + f"/imports/uploads/{preview['id']}/sources?offset=0&limit=20", headers=HEADERS
        ).json()["items"]
        assert len(sources) == preview["source_count"] == 1
        source = sources[0]
        post(
            client,
            prefix + f"/imports/uploads/{preview['id']}/mappings",
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
                "idempotency_key": "map",
            },
            200,
        )
        imported = post(
            client,
            prefix + "/imports",
            {
                "preview_id": preview["id"],
                "confirmed": True,
                "expected_mapping_revision": 1,
                "idempotency_key": "import",
            },
        )
        post(client, prefix + f"/transfers/{preview['id']}/discard", None, 200)
    reopened = make_app(tmp_path, [0.0])
    with TestClient(reopened, base_url="http://127.0.0.1:49200") as client:
        # Restart correctly invalidates native access; re-observe the same source
        # through the real privileged sync path before testing restored history.
        post(
            client,
            prefix.split("/snapshots/")[0] + "/sources/sync",
            {
                "items": [native_source],
                "purpose": "revalidation",
                "stage_id": None,
                "snapshot_id": prefix.rsplit("/", 1)[1],
                "final": True,
            },
            200,
        )
        restored, _, _ = export(client, prefix)
        visible = json.loads(restored)
        assert any(
            r["original_record_id"] == identifiers[0]
            for r in visible["records"]
            if r["origin"] == "IMPORTED"
        )
        gaps = [o for o in visible["omissions"] if o["kind"] == "imported_omission"]
        if gaps != [
            {
                "kind": "imported_omission",
                "id": f"import:{imported['id']}:omission:0",
                "reason": "DEPENDENCY_OMITTED",
            }
        ]:
            failures.append(
                ("existing omission lost or unsafe after discard/restart", visible["omissions"])
            )
        reopened.state.services.scopes.revoke_access(proposal["source_id"])
        for format in ["json", "markdown", "backup"]:
            denied, _, _ = export(client, prefix, format)
            if format == "backup":
                portable_denied, _ = read_backup(denied)
                denied = portable_denied.model_dump_json().encode()
            if any(value.encode() in denied for value in identifiers + [payload]):
                failures.append(("denied export contains external identifier/payload", format))
            if format == "json":
                omitted = json.loads(denied)["omissions"]
                denied_records = [o for o in omitted if o["kind"] == "imported_record"]
                if len(denied_records) != imported["record_count"]:
                    failures.append(("missing opaque denied-record gaps", len(denied_records)))
                if gaps and gaps[0] not in omitted:
                    failures.append(("existing omission disappeared on revocation", omitted))
        assert not failures, failures


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
                info = zipfile.ZipInfo("pdfs/" + "b" * 64 + ".pdf")
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
