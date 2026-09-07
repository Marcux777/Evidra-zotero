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
        assert preview["html"].startswith('<div class="zotero-note znv1">')
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


@pytest.mark.parametrize("kind", ["SCREENING", "SYNTHESIS", "AUDIT"])
def test_note_preserves_per_result_anchors_cells_and_excludes_unused_preparation(tmp_path, kind):
    from xml.etree import ElementTree

    from evidra.extraction.models import MatrixCell
    from evidra.research.execution import ArtifactVersion, ResearchCell, ResearchPreview
    from evidra.storage.note_html import note_html

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        _, version = protocol(client, prefix, form)
        profile(client)
        run = prepare_research(client, prefix, version["id"], "SCREENING", manual["source_id"])
        preview = ResearchPreview.model_validate(
            client.get(prefix + "/research/runs/" + run["id"] + "/preview", headers=HEADERS).json()
        )
        original = preview.inputs.evidence[0]
        # Rendering-only variants; no fabricated evidence is persisted or granted.
        excerpts = [
            original.model_copy(update={"id": str(i + 1) * 64, "excerpt": text})
            for i, text in enumerate(
                ["Alpha <original> excerpt", "Beta original excerpt", "Unused preparation excerpt"]
            )
        ]
        cells = [
            ResearchCell(
                id=f"cell-{i}",
                basis="REVIEWED",
                evidence_ids=[excerpts[i].id],
                cell=MatrixCell(
                    value=f"Cell value {i}",
                    value_state="FOUND",
                    form_version_id=form["id"],
                    field_origin_form_version_id=form["id"],
                    source_id=manual["source_id"],
                    source_title="Study",
                    field_key=f"result_{i}",
                    revision=i + 1,
                    review_state="CORRECTED",
                ),
            )
            for i in range(2)
        ]
        inputs = preview.inputs.model_copy(update={"evidence": excerpts, "cells": cells})
        if kind == "SCREENING":
            output = {
                "kind": kind,
                "decision": "UNCERTAIN",
                "criterion_ids": ["population"],
                "evidence_ids": [excerpts[0].id],
                "rationale": "Screening result",
            }
        elif kind == "SYNTHESIS":
            output = {
                "kind": kind,
                "sections": [
                    {
                        "heading": f"Result {i}",
                        "text": f"Result text {i}",
                        "cell_ids": [cells[i].id],
                        "evidence_ids": [excerpts[i].id],
                        "basis": "REVIEWED",
                        "comparability": "Retain study context",
                    }
                    for i in range(2)
                ],
                "limitations": ["Collection limited"],
            }
        else:
            output = {
                "kind": kind,
                "claims": [
                    {
                        "text": f"Claim {i}",
                        "start": i * 10,
                        "end": i * 10 + 7,
                        "support": "SUPPORTED_PROPOSAL",
                        "evidence_ids": [excerpts[i].id],
                        "explanation": "Proposal only",
                        "references": [],
                    }
                    for i in range(2)
                ],
                "collection_limitations": "Collection limited",
            }
        artifact = ArtifactVersion(
            id="a" * 32,
            artifact_id="b" * 32,
            revision=1,
            previous_version_id=None,
            run_id=run["id"],
            output=output,
            coverage=preview.inputs.coverage,
            review_state="UNREVIEWED",
            rationale=None,
            author="fixture",
            created_at="2026-09-01T00:00:00Z",
        )
        html = note_html("fixture-uuid", "Title", artifact, inputs, "en-US")
        results = ElementTree.fromstring(html).find("div").findall("div")
        assert len(results) == (1 if kind == "SCREENING" else 2)
        text = [" ".join(result.itertext()) for result in results]
        assert "Alpha <original> excerpt" in text[0]
        assert excerpts[0].id in text[0]
        assert "Beta original excerpt" not in text[0]
        assert "Unused preparation excerpt" not in html
        assert "<original>" not in html and "&lt;original&gt;" in html
        if kind != "SCREENING":
            assert "Beta original excerpt" in text[1]
            assert excerpts[1].id in text[1]
            assert "Alpha <original> excerpt" not in text[1]
        if kind == "SYNTHESIS":
            assert "result_0" in text[0] and "Cell value 0" in text[0]
            assert "cell-0" in text[0] and "CORRECTED" in text[0]
            assert "result_1" not in text[0]
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM provider_calls").fetchone()[0] == 0


def crash_research(directory, after_checkpoint):
    """Child uses production SQLite/provider accounting; only HTTP is controlled."""
    import os
    from pathlib import Path

    directory = Path(directory)
    app = make_app(directory, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        _, version = protocol(client, prefix, form)
        profile(client)

        def boundary(request):
            if not after_checkpoint:
                os._exit(75)
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
                            "rationale": "Review needed",
                        }
                    ),
                ),
            )

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        run = prepare_research(client, prefix, version["id"], "SCREENING", manual["source_id"])
        (directory / "receipt.json").write_text(json.dumps({"prefix": prefix, "run": run}))
        original = app.state.services.research.planner.validate
        validations = 0

        def validate(*args):
            nonlocal validations
            validations += 1
            if validations == 2:
                os._exit(76)
            return original(*args)

        app.state.services.research.planner.validate = validate
        finish_research(client, prefix, run)
    raise AssertionError("Child did not reach the intended interruption boundary")


@pytest.mark.parametrize("checkpoint", [False, True])
def test_research_process_restart_reuses_checkpoint_and_never_resends_unknown(tmp_path, checkpoint):
    import subprocess
    import sys
    from pathlib import Path

    from test_scopes import source, sync

    program = (
        "import sys;sys.path.insert(0,sys.argv[1]);from test_research import crash_research;"
        "crash_research(sys.argv[2],sys.argv[3]=='True')"
    )
    child = subprocess.run(
        [sys.executable, "-c", program, str(Path(__file__).parent), str(tmp_path), str(checkpoint)],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert child.returncode == (76 if checkpoint else 75), child.stdout + child.stderr
    receipt = json.loads((tmp_path / "receipt.json").read_text())
    prefix, original = receipt["prefix"], receipt["run"]
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
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
        calls = []

        def reject_call(request):
            calls.append(request)
            raise AssertionError("A restarted run must not repeat the original call")

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(reject_call)
        )
        run = client.get(prefix + "/research/runs/" + original["id"], headers=HEADERS).json()
        assert run["checkpointed"] is checkpoint
        if checkpoint:
            assert run["state"] == "PAUSED"
            result = finish_research(client, prefix, run)
            assert result["state"] == "PARTIAL", result
        else:
            assert run["state"] == "BILLING_UNKNOWN"
            denied = client.post(
                prefix + "/research/runs/" + run["id"] + "/control",
                headers=HEADERS,
                json={
                    "action": "start",
                    "expected_revision": run["revision"],
                    "idempotency_key": "no-resend",
                },
            )
            assert denied.status_code == 422
        assert calls == []
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM provider_calls").fetchone()[0] == 1
            assert conn.execute("SELECT count(*) FROM artifact_versions").fetchone()[0] == int(
                checkpoint
            )


@pytest.mark.parametrize(
    "invalid", ["missing_stage", "invented_anchor", "indirect_as_direct", "unreviewed_upgrade"]
)
def test_invalid_research_has_no_artifact_or_hidden_retry_and_preserves_confirmed_usage(
    tmp_path, invalid
):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        _, version = protocol(client, prefix, form)
        profile(client)
        calls = []
        if invalid == "unreviewed_upgrade":
            assert (
                client.post(prefix + "/matrix/proposals", headers=HEADERS, json=manual).status_code
                == 201
            )

        def boundary(request):
            inputs = json.loads(json.loads(request.content)["messages"][-1]["content"])["inputs"]
            calls.append(inputs)
            if invalid == "missing_stage":
                assert inputs["evidence"] == []
                output = {
                    "kind": "SCREENING",
                    "decision": "EXCLUDE",
                    "criterion_ids": ["population"],
                    "evidence_ids": [],
                    "rationale": "Missing full text means exclusion",
                }
            elif invalid == "unreviewed_upgrade":
                cell = inputs["cells"][0]
                assert cell["basis"] == "UNREVIEWED"
                output = {
                    "kind": "SYNTHESIS",
                    "sections": [
                        {
                            "heading": "Result",
                            "text": "Reviewed result",
                            "cell_ids": [cell["id"]],
                            "evidence_ids": cell["evidence_ids"],
                            "basis": "REVIEWED",
                            "comparability": "One study",
                        }
                    ],
                    "limitations": ["Notebook only"],
                }
            else:
                output = {
                    "kind": "AUDIT",
                    "claims": [
                        {
                            "text": "The reported result is 42 percent.",
                            "start": 0,
                            "end": 34,
                            "support": "SUPPORTED_PROPOSAL",
                            "evidence_ids": [
                                "0" * 64
                                if invalid == "invented_anchor"
                                else inputs["evidence"][0]["id"]
                            ],
                            "explanation": "Claimed support",
                            "references": [
                                {
                                    "citation": "Unavailable external work",
                                    "source_id": None,
                                    "relationship": "DIRECT",
                                }
                            ]
                            if invalid == "indirect_as_direct"
                            else [],
                        }
                    ],
                    "collection_limitations": "Notebook only",
                }
            return httpx.Response(200, text=stream("ollama", json.dumps(output)))

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        body = {
            "kind": "SCREENING"
            if invalid == "missing_stage"
            else "SYNTHESIS"
            if invalid == "unreviewed_upgrade"
            else "AUDIT",
            "protocol_version_id": version["id"],
            "profile_id": "local",
            "question": "Check result",
            "idempotency_key": "invalid",
        }
        if invalid == "missing_stage":
            body.update(source_id=manual["source_id"], stage="FULL_TEXT")
        elif invalid == "unreviewed_upgrade":
            body.update(include_unreviewed=True)
        else:
            body.update(
                pasted_text="The reported result is 42 percent.", retrieval_query="reported"
            )
        prepared = client.post(prefix + "/research/runs", headers=HEADERS, json=body)
        assert prepared.status_code == 201, prepared.text
        result = finish_research(client, prefix, prepared.json())
        assert result["state"] == "FAILED" and result["reason"] == "INVALID_OUTPUT", result
        refused = client.post(
            prefix + "/research/runs/" + result["id"] + "/control",
            headers=HEADERS,
            json={
                "action": "start",
                "expected_revision": result["revision"],
                "idempotency_key": "no-retry",
            },
        )
        assert refused.status_code == 422, refused.text
        assert len(calls) == 1
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM artifact_versions").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM screening_decisions").fetchone()[0] == 0
            usage = conn.execute(
                "SELECT state,input_tokens,output_tokens FROM provider_calls"
            ).fetchall()
            assert len(usage) == 1 and usage[0][0] == "CONFIRMED"
            assert usage[0][1] is not None and usage[0][2] is not None


@pytest.mark.parametrize("action", ["cancel", "revoke"])
def test_inflight_research_stop_never_commits_partial_model_output(tmp_path, action):
    import asyncio
    import threading

    app = make_app(tmp_path, [0.0])
    entered, release = threading.Event(), threading.Event()
    calls = []

    class Delayed(httpx.AsyncByteStream):
        async def __aiter__(self):
            entered.set()
            while not release.is_set():
                await asyncio.sleep(0.01)
            yield stream(
                "ollama",
                json.dumps(
                    {
                        "kind": "SCREENING",
                        "decision": "UNCERTAIN",
                        "criterion_ids": ["population"],
                        "evidence_ids": [],
                        "rationale": "Requires human review",
                    }
                ),
            ).encode()

    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        _, version = protocol(client, prefix, form)
        profile(client)

        def boundary(request):
            calls.append(str(request.url))
            return httpx.Response(200, stream=Delayed())

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        run = prepare_research(client, prefix, version["id"], "SCREENING", manual["source_id"])
        started = client.post(
            prefix + "/research/runs/" + run["id"] + "/control",
            headers=HEADERS,
            json={"action": "start", "expected_revision": 0, "idempotency_key": "start"},
        )
        assert started.status_code == 200, started.text
        try:
            assert entered.wait(3), "Controlled request did not reach the provider boundary"
            if action == "cancel":
                response = client.post(
                    prefix + "/research/runs/" + run["id"] + "/control",
                    headers=HEADERS,
                    json={
                        "action": "cancel",
                        "expected_revision": started.json()["revision"],
                        "idempotency_key": "cancel",
                    },
                )
                assert response.status_code == 200 and response.json()["state"] == "CANCELLED"
            else:
                app.state.services.scopes.revoke_access(manual["source_id"])
        finally:
            release.set()
        for _ in range(100):
            if not app.state.services.research.tasks:
                break
            time.sleep(0.01)
        assert app.state.services.research.tasks == {}
        assert len(calls) == 1
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM artifact_versions").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM screening_decisions").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM provider_calls").fetchone()[0] == 1
            final = json.loads(conn.execute("SELECT payload FROM research_runs").fetchone()[0])
            assert (
                final["state"] == "CANCELLED"
                if action == "cancel"
                else final["state"] in {"PAUSED", "BILLING_UNKNOWN"}
            )
