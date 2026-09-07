"""Real scoped SQLite form/matrix invariants; no model or native services."""

from concurrent.futures import ThreadPoolExecutor

import pytest
from fastapi.testclient import TestClient
from test_conversations import indexed
from test_runtime_notebooks import HEADERS, make_app


@pytest.mark.parametrize(
    ("kind", "valid", "invalid"),
    [
        ("text", "reported", 42),
        ("number", {"original": "4.2e1", "normalized": 42}, 42),
        ("boolean", False, "false"),
        ("enum", "yes", "other"),
        ("list", ["A", "B"], "A"),
        (
            "experimental_result",
            [
                {
                    "metric": "accuracy",
                    "number": {"original": "42%", "normalized": 42},
                    "dataset": "D",
                    "condition": "test",
                    "unit": "%",
                    "baseline": None,
                    "direction": "HIGHER_BETTER",
                }
            ],
            [{"metric": "accuracy", "number": {"original": "42%", "normalized": 42}}],
        ),
    ],
)
def test_field_schema_matches_values_without_coercion(kind, valid, invalid):
    from pydantic import ValidationError

    from evidra.domain.errors import EvidraError
    from evidra.extraction.matrix import validate_value
    from evidra.extraction.models import CellValue, FieldDefinition

    field = FieldDefinition(
        key="f",
        label="Field",
        kind=kind,
        question="Question",
        definition="Definition",
        options=["yes", "no"] if kind == "enum" else [],
    )
    value = CellValue(value=valid, value_state="FOUND")
    validate_value(field, value.value)
    with pytest.raises((ValidationError, EvidraError)):
        validate_value(field, CellValue(value=invalid, value_state="FOUND").value)


def test_v6_migration_preserves_existing_synthetic_notebook_and_evidence(tmp_path, monkeypatch):
    import sqlite3
    from unittest.mock import AsyncMock, Mock

    from evidra.storage import database as storage

    with monkeypatch.context() as patch:
        patch.setattr(storage, "SCHEMA_VERSION", 6)
        # The historical v6 fixture predates the v8 job startup/recovery subsystem.
        patch.setattr("evidra.api.app.JobQueue", Mock())
        patch.setattr("evidra.api.app.ResearchService", Mock(return_value=Mock(close=AsyncMock())))
        app = make_app(tmp_path, [0.0])
        with TestClient(app, base_url="http://127.0.0.1:49200") as client:
            notebook, _, _ = indexed(client)
            with app.state.services.database.transaction() as conn:
                evidence_before = [
                    tuple(r) for r in conn.execute("SELECT id,original_text FROM document_chunks")
                ]
    with monkeypatch.context() as patch:
        patch.setattr(storage, "SCHEMA_VERSION", 7)
        upgraded = storage.Database(tmp_path / "evidra.sqlite3")
    with upgraded.transaction() as conn:
        assert conn.execute("PRAGMA user_version").fetchone()[0] == 7
        assert (
            conn.execute("SELECT id FROM notebooks WHERE id=?", (notebook,)).fetchone()[0]
            == notebook
        )
        assert [
            tuple(r) for r in conn.execute("SELECT id,original_text FROM document_chunks")
        ] == evidence_before
        assert conn.execute("SELECT count(*) FROM cell_decisions").fetchone()[0] == 0
    upgraded.close()
    with sqlite3.connect(tmp_path / "evidra.before-v7.sqlite3") as backup:
        assert backup.execute("PRAGMA user_version").fetchone()[0] == 6


def setup(client):
    _, _, prefix = indexed(client, text="The reported result is 42 percent.")
    response = client.get(prefix + "/forms/template", headers=HEADERS)
    assert response.status_code == 200, response.text
    fields = response.json()
    fields = [dict(fields[0], key="result", kind="number", unit="percent")]
    response = client.post(
        prefix + "/forms",
        headers=HEADERS,
        json={
            "name": "Computing",
            "fields": fields,
            "expected_revision": 0,
            "idempotency_key": "form",
        },
    )
    assert response.status_code == 201, response.text
    form = response.json()
    hit = client.post(prefix + "/search", headers=HEADERS, json={"query": "reported"}).json()[
        "items"
    ][0]
    proposal = {
        "form_version_id": form["id"],
        "source_id": hit["source_id"],
        "field_key": "result",
        "value": {"original": "42", "normalized": 42},
        "value_state": "FOUND",
        "evidence_ids": [hit["evidence_id"]],
        "rationale": "Reported explicitly",
        "idempotency_key": "a",
    }
    return prefix, form, proposal


@pytest.mark.parametrize(
    "state",
    [
        "FOUND",
        "NOT_FOUND_IN_SEARCH",
        "NOT_REPORTED_CANDIDATE",
        "NOT_APPLICABLE",
        "UNREADABLE",
        "CONFLICTING",
    ],
)
def test_schema_states_and_context(tmp_path, state):
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, form, proposal = setup(client)
        untouched = client.get(prefix + "/matrix/" + form["id"], headers=HEADERS).json()["items"][0]
        assert untouched["value"] is None and untouched["value_state"] is None
        proposal.update(value_state=state, value=proposal["value"] if state == "FOUND" else None)
        response = client.post(prefix + "/matrix/proposals", headers=HEADERS, json=proposal)
        assert response.status_code == 201, response.text
        assert response.json()["review_state"] == "UNREVIEWED"
        assert response.json()["origin"] == "HUMAN_CLIENT"
        assert response.json()["coverage"] == "CITED_EVIDENCE_ONLY"
        invalid = dict(proposal, value="", idempotency_key="bad")
        assert (
            client.post(prefix + "/matrix/proposals", headers=HEADERS, json=invalid).status_code
            == 422
        )
        assert (
            client.post(
                prefix + "/matrix/proposals",
                headers=HEADERS,
                json=dict(proposal, author="model", review_state="APPROVED"),
            ).status_code
            == 422
        )
        fields = [dict(form["fields"][0], kind="experimental_result")]
        new = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Results",
                "fields": fields,
                "expected_revision": 1,
                "idempotency_key": "v2",
            },
        ).json()
        results = [
            {
                "metric": "accuracy",
                "number": {"original": "4.2e1", "normalized": 42},
                "dataset": x,
                "condition": "test",
                "unit": "%",
                "baseline": "control",
                "direction": "HIGHER_BETTER",
            }
            for x in ["A", "B", "C"]
        ]
        response = client.post(
            prefix + "/matrix/proposals",
            headers=HEADERS,
            json=dict(
                proposal,
                form_version_id=new["id"],
                value_state="FOUND",
                value=results,
                idempotency_key="results",
            ),
        )
        assert response.status_code == 201, response.text
        assert response.json()["value"] == results
        assert client.get(prefix + "/forms/" + form["id"], headers=HEADERS).json() == form


def test_concurrent_decisions_competing_proposals_bulk_and_revocation(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, body = setup(client)
        proposal = client.post(prefix + "/matrix/proposals", headers=HEADERS, json=body).json()
        decision = {
            "proposal_id": proposal["id"],
            "expected_revision": 0,
            "action": "APPROVED",
            "idempotency_key": "approve",
        }

        def decide(key):
            return client.post(
                prefix + "/matrix/decisions",
                headers=HEADERS,
                json=dict(decision, idempotency_key=key),
            )

        with ThreadPoolExecutor(2) as pool:
            responses = list(pool.map(decide, ["one", "two"]))
        assert sorted(r.status_code for r in responses) == [201, 409]
        winner = next(r for r in responses if r.status_code == 201).json()
        assert winner["author"] == "bridge:profile-a"
        assert winner["old"]["value"] is None and winner["new"]["value"]["normalized"] == 42
        original_form = form
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Updated form",
                "fields": original_form["fields"],
                "expected_revision": 1,
                "idempotency_key": "unchanged-fields",
            },
        ).json()
        inherited = client.get(prefix + "/matrix/" + form["id"], headers=HEADERS).json()["items"][0]
        assert inherited["value"]["normalized"] == 42 and inherited["revision"] == 1
        assert inherited["decision_form_version_id"] == original_form["id"]
        assert inherited["field_origin_form_version_id"] == original_form["id"]
        body["form_version_id"] = form["id"]
        competing = client.post(
            prefix + "/matrix/proposals",
            headers=HEADERS,
            json=dict(body, value={"original": "43", "normalized": 43}, idempotency_key="b"),
        ).json()
        rejected = client.post(
            prefix + "/matrix/decisions",
            headers=HEADERS,
            json=dict(
                decision,
                proposal_id=competing["id"],
                expected_revision=1,
                action="REJECTED",
                idempotency_key="reject-competing",
            ),
        )
        assert rejected.status_code == 201, rejected.text
        assert rejected.json()["new"]["value"]["normalized"] == 42
        assert rejected.json()["new"]["review_state"] == "APPROVED"
        assert rejected.json()["proposal_id"] == competing["id"]
        listed = client.post(
            prefix + "/matrix/proposals/query",
            headers=HEADERS,
            json={
                "form_version_id": form["id"],
                "source_id": body["source_id"],
                "field_key": "result",
                "offset": 0,
            },
        ).json()
        assert {p["id"]: p["review_state"] for p in listed["items"]} == {
            proposal["id"]: "APPROVED",
            competing["id"]: "REJECTED",
        }
        cell_path = prefix + "/matrix/" + form["id"]
        cell = client.get(cell_path, headers=HEADERS).json()["items"][0]
        assert cell["value"]["normalized"] == 42 and cell["revision"] == 2
        preview = client.post(
            prefix + "/matrix/bulk-preview",
            headers=HEADERS,
            json={
                "items": [{"proposal_id": competing["id"], "expected_revision": 2}],
                "idempotency_key": "preview",
            },
        ).json()
        correction = dict(
            decision,
            action="CORRECTED",
            expected_revision=2,
            value={"original": "44", "normalized": 44},
            value_state="FOUND",
            rationale="Corrected reading",
            idempotency_key="correct",
        )
        assert (
            client.post(prefix + "/matrix/decisions", headers=HEADERS, json=correction).status_code
            == 201
        )
        assert (
            client.post(
                prefix + "/matrix/bulk-approve",
                headers=HEADERS,
                json={"preview_id": preview["id"], "idempotency_key": "bulk"},
            ).status_code
            == 409
        )
        assert (
            client.get(cell_path, headers=HEADERS).json()["items"][0]["value"]["normalized"] == 44
        )
        fresh = client.post(
            prefix + "/matrix/bulk-preview",
            headers=HEADERS,
            json={
                "items": [{"proposal_id": competing["id"], "expected_revision": 3}],
                "idempotency_key": "fresh",
            },
        ).json()
        batch = {"preview_id": fresh["id"], "idempotency_key": "confirmed-bulk"}
        accepted = client.post(prefix + "/matrix/bulk-approve", headers=HEADERS, json=batch)
        assert accepted.status_code == 200, accepted.text
        assert accepted.json()["items"][0]["new"]["value"]["normalized"] == 43
        assert (
            client.post(prefix + "/matrix/bulk-approve", headers=HEADERS, json=batch).json()
            == accepted.json()
        )
        assert (
            client.post(
                prefix + "/matrix/bulk-approve",
                headers=HEADERS,
                json=dict(batch, preview_id=preview["id"]),
            ).json()["code"]
            == "IDEMPOTENCY_CONFLICT"
        )
        # Reopen the actual database connection; persisted history is not a cache.
        from evidra.storage.database import Database

        reopened = Database(tmp_path / "evidra.sqlite3")
        with reopened.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM cell_decisions").fetchone()[0] == 4
            assert conn.execute("SELECT count(*) FROM extraction_proposals").fetchone()[0] == 2
        reopened.close()
        with app.state.services.database.transaction() as conn:
            conn.execute("UPDATE sources SET available=0 WHERE id=?", (body["source_id"],))
        assert client.get(cell_path, headers=HEADERS).json()["items"] == []
        assert (
            client.post(
                prefix + "/matrix/decisions",
                headers=HEADERS,
                json=dict(decision, expected_revision=2, idempotency_key="revoked"),
            ).status_code
            == 403
        )
    # A real application restart invalidates availability, then scoped native revalidation
    # restores access without reconstructing decisions or losing their original form lineage.
    from test_scopes import source, sync

    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        assert client.get(cell_path, headers=HEADERS).json()["items"] == []
        item = source()
        item["contents"] = [{"key": "SAMEKEY1", "kind": "abstract", "version": "1"}]
        assert (
            sync(
                client,
                prefix.split("/")[3],
                [item],
                purpose="revalidation",
                snapshot_id=prefix.split("/")[5],
            ).status_code
            == 200
        )
        restarted = client.get(cell_path, headers=HEADERS)
        assert restarted.status_code == 200, restarted.text
        assert restarted.json()["items"][0]["value"]["normalized"] == 43
        history = client.post(
            prefix + "/matrix/decisions/query",
            headers=HEADERS,
            json={
                "form_version_id": form["id"],
                "source_id": body["source_id"],
                "field_key": "result",
                "offset": 0,
            },
        ).json()
        assert history["total"] == 4
        assert history["items"][-1] == winner
