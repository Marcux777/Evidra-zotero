"""Research persistence and real scoped HTTP boundaries with controlled model transport."""

import json
import time

import httpx
import pytest
from fastapi.testclient import TestClient
from test_conversations import profile
from test_matrix import setup
from test_providers import stream
from test_runtime_notebooks import HEADERS, make_app


def protocol(client, prefix, form):
    body = {
        "question": "Which results are reported?",
        "objective": "Compare contextual results",
        "review_type": "EXPLORATORY",
        "form_version_id": form["id"],
        "criteria": [
            {
                "id": "population",
                "text": "Computing study",
                "kind": "INCLUSION",
                "applicability": "BOTH",
            }
        ],
        "expected_revision": 0,
        "idempotency_key": "protocol",
    }
    response = client.post(prefix + "/protocols", headers=HEADERS, json=body)
    assert response.status_code == 201, response.text
    return body, response.json()


def test_protocol_versions_stage_decisions_and_observed_counts(tmp_path):
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        prefix, form, proposal = setup(client)
        body, original = protocol(client, prefix, form)
        changed = client.post(
            prefix + "/protocols",
            headers=HEADERS,
            json=dict(
                body,
                criteria=[dict(body["criteria"][0], text="Different criterion")],
                expected_revision=1,
                idempotency_key="protocol2",
            ),
        ).json()
        assert changed["revision"] == 2
        assert (
            client.get(prefix + "/protocols/" + original["id"], headers=HEADERS).json() == original
        )
        decision = {
            "protocol_version_id": original["id"],
            "source_id": proposal["source_id"],
            "stage": "TITLE_ABSTRACT",
            "reviewer": "Reviewer A",
            "decision": "INCLUDE",
            "criterion_ids": ["population"],
            "rationale": "Reviewed available abstract",
            "expected_revision": 0,
            "idempotency_key": "a",
        }
        for request in [
            decision,
            dict(decision, reviewer="Reviewer B", decision="EXCLUDE", idempotency_key="b"),
        ]:
            response = client.post(prefix + "/screening/decisions", headers=HEADERS, json=request)
            assert response.status_code == 201, response.text
        assert (
            client.post(prefix + "/screening/decisions", headers=HEADERS, json=decision).json()[
                "revision"
            ]
            == 1
        )
        result = client.get(prefix + "/screening/" + original["id"], headers=HEADERS).json()
        assert result["items"][0]["conflict"] is True
        assert result["items"][0]["stage"] == "TITLE_ABSTRACT"
        assert result["observed_decision_events"] == 2
        assert result["historical_search_count"] is None
        full = client.post(
            prefix + "/screening/decisions",
            headers=HEADERS,
            json=dict(
                decision,
                stage="FULL_TEXT",
                decision="UNCERTAIN",
                idempotency_key="full",
            ),
        )
        assert full.status_code == 201, full.text
        assert full.json()["revision"] == 1
        current = client.get(prefix + "/screening/" + changed["id"], headers=HEADERS).json()
        assert current["items"] == []


def prepare_research(client, prefix, protocol_id, kind, source_id, key="research"):
    response = client.post(
        prefix + "/research/runs",
        headers=HEADERS,
        json={
            "kind": kind,
            "protocol_version_id": protocol_id,
            "profile_id": "local",
            "question": "Compare the reported results",
            "idempotency_key": key,
            **({"source_id": source_id, "stage": "TITLE_ABSTRACT"} if kind == "SCREENING" else {}),
            **(
                {"pasted_text": "The reported result is 42 percent.", "retrieval_query": "reported"}
                if kind == "AUDIT"
                else {}
            ),
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def finish_research(client, prefix, run):
    response = client.post(
        prefix + "/research/runs/" + run["id"] + "/control",
        headers=HEADERS,
        json={
            "action": "start",
            "expected_revision": run["revision"],
            "idempotency_key": "start-" + str(run["revision"]),
        },
    )
    assert response.status_code == 200, response.text
    for _ in range(100):
        result = client.get(prefix + "/research/runs/" + run["id"], headers=HEADERS)
        assert result.status_code == 200, result.text
        if result.json()["state"] != "RUNNING":
            return result.json()
        time.sleep(0.02)
    raise AssertionError("Research did not finish")


@pytest.mark.parametrize("kind", ["SCREENING", "SYNTHESIS", "AUDIT"])
def test_model_research_uses_prepared_input_and_never_approves(tmp_path, kind):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        _, protocol_version = protocol(client, prefix, form)
        profile(client)
        proposed = client.post(prefix + "/matrix/proposals", headers=HEADERS, json=manual).json()
        client.post(
            prefix + "/matrix/decisions",
            headers=HEADERS,
            json={
                "proposal_id": proposed["id"],
                "action": "CORRECTED",
                "expected_revision": 0,
                "value": {"original": "44", "normalized": 44},
                "value_state": "FOUND",
                "rationale": "Human correction",
                "idempotency_key": "correct",
            },
        )
        calls = []

        def boundary(request):
            prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
            calls.append(prompt)
            evidence_id = prompt["inputs"]["evidence"][0]["id"]
            if kind == "SCREENING":
                output = {
                    "kind": kind,
                    "decision": "INCLUDE",
                    "criterion_ids": ["population"],
                    "evidence_ids": [evidence_id],
                    "rationale": "Explicit computing study",
                }
            elif kind == "SYNTHESIS":
                cell = prompt["inputs"]["cells"][0]
                assert cell["cell"]["value"]["normalized"] == 44
                output = {
                    "kind": kind,
                    "sections": [
                        {
                            "heading": "Results",
                            "text": "The reviewed value is 44, preserving human correction.",
                            "cell_ids": [cell["id"]],
                            "evidence_ids": [evidence_id],
                            "basis": "REVIEWED",
                            "comparability": "One study; no ranking",
                        }
                    ],
                    "limitations": ["Limited to the approved matrix cells"],
                }
            else:
                output = {
                    "kind": kind,
                    "claims": [
                        {
                            "text": "The reported result is 42 percent.",
                            "start": 0,
                            "end": 34,
                            "support": "SUPPORTED_PROPOSAL",
                            "evidence_ids": [evidence_id],
                            "explanation": "Literal statement",
                            "references": [
                                {
                                    "citation": "Unavailable cited work",
                                    "source_id": None,
                                    "relationship": "INDIRECT_MENTION",
                                }
                            ],
                        }
                    ],
                    "collection_limitations": "Only retrieved chunks from this notebook",
                }
            return httpx.Response(200, text=stream("ollama", json.dumps(output)))

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        run = prepare_research(client, prefix, protocol_version["id"], kind, manual["source_id"])
        assert calls == []
        preview = client.get(
            prefix + "/research/runs/" + run["id"] + "/preview", headers=HEADERS
        ).json()
        result = finish_research(client, prefix, run)
        assert result["state"] in {"COMPLETE", "PARTIAL"}, result
        assert len(calls) == 1
        assert json.loads(preview["prompt"]) == calls[0]
        artifact = client.get(
            prefix + "/artifacts/" + result["artifact_version_id"], headers=HEADERS
        ).json()
        assert artifact["review_state"] == "UNREVIEWED"
        assert artifact["anchor_validation"] == "VERIFIED_ORIGINAL_EXCERPTS"
        assert artifact["support_validation"] == "MODEL_PROPOSAL_REQUIRES_HUMAN_REVIEW"
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM screening_decisions").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM cell_decisions").fetchone()[0] == 1
            assert conn.execute("SELECT job_id FROM provider_calls").fetchone()[0] == run["id"]
        # Human review produces a new immutable artifact revision, never edits original output.
        reviewed = client.post(
            prefix + "/artifacts/" + artifact["id"] + "/review",
            headers=HEADERS,
            json={
                "action": "APPROVED",
                "expected_revision": 1,
                "rationale": "Reviewed anchors and support",
                "idempotency_key": "review",
            },
        )
        assert reviewed.status_code == 201, reviewed.text
        assert reviewed.json()["revision"] == 2
        assert (
            client.get(prefix + "/artifacts/" + artifact["id"], headers=HEADERS).json()[
                "review_state"
            ]
            == "UNREVIEWED"
        )
        # Revocation hides the prepared source text and derived artifact on reopened requests.
        with app.state.services.database.transaction() as conn:
            conn.execute(
                "UPDATE source_contents SET available=0 WHERE source_id=?", (manual["source_id"],)
            )
        assert (
            client.get(prefix + "/artifacts/" + artifact["id"], headers=HEADERS).status_code == 403
        )


def screening_artifact(client, app):
    prefix, form, manual = setup(client)
    _, version = protocol(client, prefix, form)
    profile(client)

    def boundary(request):
        prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
        return httpx.Response(
            200,
            text=stream(
                "ollama",
                json.dumps(
                    {
                        "kind": "SCREENING",
                        "decision": "UNCERTAIN",
                        "criterion_ids": ["population"],
                        "evidence_ids": [prompt["inputs"]["evidence"][0]["id"]],
                        "rationale": '<img src=x onerror="evil()"> requires human review',
                    }
                ),
            ),
        )

    app.state.services.providers.client = httpx.AsyncClient(transport=httpx.MockTransport(boundary))
    run = prepare_research(client, prefix, version["id"], "SCREENING", manual["source_id"])
    result = finish_research(client, prefix, run)
    assert result["state"] == "PARTIAL", result
    return prefix, manual, result["artifact_version_id"]


def test_outbox_preview_approval_and_readback_survive_reopen_without_duplicate(tmp_path):
    from evidra.storage.database import Database

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, manual, artifact_id = screening_artifact(client, app)
        preview_response = client.post(
            prefix + "/notes/previews",
            headers=HEADERS,
            json={
                "artifact_version_id": artifact_id,
                "source_id": manual["source_id"],
                "title": "Research <preview>",
                "locale": "en-US",
                "idempotency_key": "preview",
            },
        )
        assert preview_response.status_code == 201, preview_response.text
        preview = preview_response.json()
        assert "<img" not in preview["html"] and "&lt;img" in preview["html"]
        assert 'data-evidra-origin="ai"' in preview["html"]
        assert preview["uuid"] in preview["html"]
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM approved_write_outbox").fetchone()[0] == 0
        approval = {
            "preview_id": preview["id"],
            "expected_artifact_revision": 1,
            "idempotency_key": "approve-note",
        }
        response = client.post(prefix + "/notes/approve", headers=HEADERS, json=approval)
        assert response.status_code == 201, response.text
        intent = response.json()
        assert intent["uuid"] == preview["uuid"] and intent["state"] == "APPROVED"
        assert (
            client.post(prefix + "/notes/approve", headers=HEADERS, json=approval).json()["id"]
            == intent["id"]
        )
        start = client.post(
            prefix + "/notes/outbox/" + intent["id"] + "/begin",
            headers=HEADERS,
            json={"idempotency_key": "apply"},
        ).json()
        assert start["may_create"] is True
        # Lost begin response must not grant a second permission to create.
        assert (
            client.post(
                prefix + "/notes/outbox/" + intent["id"] + "/begin",
                headers=HEADERS,
                json={"idempotency_key": "apply"},
            ).json()["may_create"]
            is False
        )
        readback = {
            "uuid": intent["uuid"],
            "library_id": intent["destination"]["library_id"],
            "parent_key": intent["destination"]["item_key"],
            "note_key": "NEWNOTE1",
            "html_sha256": intent["html_sha256"],
            "origin": "ai",
            "tag": "evidra:ai",
            "idempotency_key": "ack",
        }
        bad = client.post(
            prefix + "/notes/outbox/" + intent["id"] + "/ack",
            headers=HEADERS,
            json=dict(readback, html_sha256="0" * 64),
        )
        assert bad.status_code == 409, bad.text
        ack = client.post(
            prefix + "/notes/outbox/" + intent["id"] + "/ack", headers=HEADERS, json=readback
        )
        assert ack.status_code == 200, ack.text
        assert ack.json()["state"] == "COMPLETE"
        assert (
            client.post(
                prefix + "/notes/outbox/" + intent["id"] + "/ack", headers=HEADERS, json=readback
            ).json()
            == ack.json()
        )
        reopened = Database(tmp_path / "evidra.sqlite3")
        with reopened.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM approved_write_outbox").fetchone()[0] == 1
            assert (
                json.loads(conn.execute("SELECT payload FROM approved_write_outbox").fetchone()[0])[
                    "note_key"
                ]
                == "NEWNOTE1"
            )
        reopened.close()
