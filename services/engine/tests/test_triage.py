"""Relevance triage: rubric-bound screening, sequential batches, queue and adoption."""

import hashlib
import json
import time

import httpx
import pytest
from fastapi.testclient import TestClient
from pdf_fixtures import pdf_bytes
from test_conversations import profile
from test_documents import document_scope, finished, ingest, register
from test_providers import stream
from test_runtime_notebooks import HEADERS, make_app
from test_scopes import source

from evidra.research.execution import ResearchPreview
from evidra.research.models import ProtocolVersion
from evidra.research.planner import ResearchPlanner, screening_schema

PAPERS = {
    "ATARIPAP": "Deep Q-networks reach human level on Atari games with a replay buffer.",
    "ROBOTPAP": "A legged robot learns to walk on real hardware with model predictive control.",
    "NOABSTRA": None,
}


def stage_text(client, prefix, source_id, key, text):
    stage = client.post(
        prefix + "/documents/text",
        headers=HEADERS,
        json={
            "source_id": source_id,
            "content_key": key,
            "total_characters": len(text),
            "sha256": hashlib.sha256(text.encode()).hexdigest(),
        },
    )
    assert stage.status_code == 201, stage.text
    done = client.post(
        prefix + "/documents/text/" + stage.json()["id"],
        headers=HEADERS,
        json={"offset": 0, "text": text, "final": True},
    )
    assert done.status_code == 200, done.text


def library(client, tmp_path, *, pages=1):
    """Three studies: abstracts (one missing) and a mapped PDF each."""
    items = []
    for key, abstract in PAPERS.items():
        item = source(key=key)
        item["title"] = key.lower()
        item["contents"] = [{"key": key + "PDF", "kind": "pdf", "role": "unassigned"}]
        if abstract:
            item["contents"].append({"key": key, "kind": "abstract", "version": "1"})
        items.append(item)
    notebook, snap, preview, prefix = document_scope(client, items)
    ids = {}
    for row in preview["items"]:
        key = row["title"].upper()
        ids[key] = row["id"]
        if PAPERS[key]:
            stage_text(client, prefix, row["id"], key, PAPERS[key])
        body = []
        for page in range(pages):
            lines = [(20, 480, f"{PAPERS[key] or 'Tabular bandits study.'} Page {page}.")]
            if page == pages - 1:
                lines.append((20, 440, "Limitations: evaluated on a single benchmark suite."))
            body.append({"lines": lines})
        path = tmp_path / f"{key}.pdf"
        path.write_bytes(pdf_bytes(body))
        document = register(client, prefix, row["id"], path, key + "PDF")
        assert finished(client, prefix, ingest(client, prefix, document, key=key))["state"] == (
            "COMPLETE"
        )
    return prefix, ids


def relevance_protocol(client, prefix, **overrides):
    fields = client.get(prefix + "/forms/template", headers=HEADERS).json()
    form = client.post(
        prefix + "/forms",
        headers=HEADERS,
        json={"name": "F", "fields": fields[:1], "expected_revision": 0, "idempotency_key": "f"},
    ).json()
    body = {
        "question": "Which studies can my Atari agent reuse?",
        "objective": "Find reusable value-based methods for Atari",
        "review_type": "EXPLORATORY",
        "form_version_id": form["id"],
        "criteria": [
            {
                "id": "atari",
                "text": "Evaluates on Atari",
                "kind": "INCLUSION",
                "applicability": "BOTH",
            },
            {
                "id": "robots",
                "text": "Physical robot hardware",
                "kind": "EXCLUSION",
                "applicability": "BOTH",
            },
        ],
        "project": {
            "description": "A sample-efficient DQN variant for Atari 100k.",
            "methods": ["replay buffer", "distributional value heads"],
            "seeking": ["METHOD", "BASELINE"],
        },
        "rubric": [
            {"grade": 0, "label": "Fora", "definition": "Unrelated to the project"},
            {"grade": 2, "label": "Útil", "definition": "A reusable component"},
            {"grade": 3, "label": "Central", "definition": "Directly comparable work"},
        ],
        "expected_revision": 0,
        "idempotency_key": "protocol",
    } | overrides
    return client.post(prefix + "/protocols", headers=HEADERS, json=body)


def relevance_output(prompt):
    stage = prompt["stage"]
    evidence = prompt["inputs"]["evidence"]
    ids = [e["id"] for e in evidence]
    text = " ".join(e["excerpt"] for e in evidence).lower()
    criteria = [
        c for c in prompt["inputs"]["protocol"]["criteria"] if c["applicability"] in {"BOTH", stage}
    ]
    atari, robot = "atari" in text, "robot" in text
    verdicts = [
        {
            "criterion_id": c["id"],
            "verdict": "MET" if (atari if c["id"] == "atari" else robot) else "NOT_MET",
            "evidence_ids": ids[:1],
        }
        for c in criteria
    ]
    include = atari and not robot
    output = {
        "kind": "SCREENING",
        "decision": "INCLUDE" if include else "EXCLUDE",
        "criterion_ids": [c["id"] for c in criteria],
        "evidence_ids": ids[:1],
        "rationale": "Criteria judged from the supplied excerpts.",
        "verdicts": verdicts,
        "relevance_grade": 3 if include else 0,
        "reusable": [
            {
                "kind": "METHOD",
                "text": "Replay buffer",
                "use": "Baseline for the variant",
                "evidence_ids": ids[:1],
            }
        ]
        if include
        else [],
        "concerns": [] if include else [{"text": "Different domain", "evidence_ids": ids[:1]}],
    }
    if stage == "FULL_TEXT":
        point = {"text": "Stated in the excerpt", "evidence_ids": ids[:1]}
        output["card"] = {
            "summary": "A study summary.",
            "contributions": [point],
            "strengths": [point],
            "limitations": [point],
            "questions": ["Which seeds were used?"],
        }
    return output


def controlled(app, calls, *, fail_first=False):
    def boundary(request):
        prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
        calls.append(prompt)
        if fail_first and len(calls) == 1:
            return httpx.Response(429, text="slow down")
        return httpx.Response(200, text=stream("ollama", json.dumps(relevance_output(prompt))))

    app.state.services.providers.client = httpx.AsyncClient(transport=httpx.MockTransport(boundary))


def batch(client, prefix, protocol_id, stage, key, **extra):
    response = client.post(
        prefix + "/triage/batches",
        headers=HEADERS,
        json={
            "protocol_version_id": protocol_id,
            "profile_id": "local",
            "stage": stage,
            "question": "Is this study relevant to my Atari agent?",
            "idempotency_key": key,
        }
        | extra,
    )
    assert response.status_code == 201, response.text
    return response.json()


def run_batch(client, prefix, view):
    batch_id = view["batch"]["id"]
    started = client.post(
        prefix + f"/triage/batches/{batch_id}/control",
        headers=HEADERS,
        json={
            "action": "start",
            "expected_revision": view["batch"]["revision"],
            "idempotency_key": "start-" + str(view["batch"]["revision"]),
        },
    )
    assert started.status_code == 200, started.text
    for _ in range(300):
        current = client.get(prefix + f"/triage/batches/{batch_id}", headers=HEADERS).json()
        if current["batch"]["state"] != "RUNNING":
            return current
        time.sleep(0.02)
    raise AssertionError("Batch did not finish")


def queue(client, prefix, protocol_id, stage, sort="ATTENTION"):
    response = client.post(
        prefix + "/triage/queue",
        headers=HEADERS,
        json={"protocol_version_id": protocol_id, "stage": stage, "sort": sort},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_rubric_protocol_is_validated_and_versioned(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _ = library(client, tmp_path)
        single = relevance_protocol(
            client, prefix, rubric=[{"grade": 1, "label": "x", "definition": "y"}]
        )
        assert single.status_code == 422, single.text
        duplicate = relevance_protocol(
            client,
            prefix,
            rubric=[{"grade": 1, "label": "x", "definition": "y"}] * 2,
            idempotency_key="dup",
        )
        assert duplicate.status_code == 422, duplicate.text
        created = relevance_protocol(client, prefix)
        assert created.status_code == 201, created.text
        stored = client.get(prefix + "/protocols/" + created.json()["id"], headers=HEADERS).json()
        assert stored["project"]["seeking"] == ["METHOD", "BASELINE"]
        assert [r["grade"] for r in stored["rubric"]] == [0, 2, 3]


def test_schema_requires_relevance_fields_only_with_a_rubric():
    base = {
        "id": "a" * 32,
        "notebook_id": "n",
        "revision": 1,
        "question": "q",
        "objective": "o",
        "review_type": "EXPLORATORY",
        "form_version_id": "b" * 32,
        "author": "a",
        "created_at": "2026-09-27T00:00:00Z",
        "criteria": [
            {"id": "atari", "text": "t", "kind": "INCLUSION", "applicability": "BOTH"},
            {"id": "full", "text": "t", "kind": "INCLUSION", "applicability": "FULL_TEXT"},
        ],
    }
    plain = screening_schema(ProtocolVersion.model_validate(base), "TITLE_ABSTRACT")
    assert "verdicts" not in plain["properties"] and "card" not in plain["properties"]
    rubric = ProtocolVersion.model_validate(
        base
        | {
            "rubric": [
                {"grade": 0, "label": "a", "definition": "b"},
                {"grade": 3, "label": "c", "definition": "d"},
            ]
        }
    )
    title = screening_schema(rubric, "TITLE_ABSTRACT")
    assert {"verdicts", "relevance_grade", "reusable", "concerns"} <= set(title["required"])
    assert "card" not in title["properties"]
    assert title["properties"]["verdicts"]["minItems"] == 1
    assert title["$defs"]["CriterionVerdict"]["properties"]["criterion_id"]["enum"] == ["atari"]
    full = screening_schema(rubric, "FULL_TEXT")
    assert "card" in full["required"] and full["properties"]["verdicts"]["maxItems"] == 2
    assert full["properties"]["relevance_grade"]["anyOf"][0]["enum"] == [0, 3]


def test_relevance_output_validation_refuses_incoherent_proposals(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        run = client.post(
            prefix + "/research/runs",
            headers=HEADERS,
            json={
                "kind": "SCREENING",
                "protocol_version_id": protocol["id"],
                "profile_id": "local",
                "source_id": ids["ATARIPAP"],
                "stage": "TITLE_ABSTRACT",
                "question": "Relevant?",
                "idempotency_key": "one",
            },
        ).json()
        preview = ResearchPreview.model_validate(
            client.get(prefix + f"/research/runs/{run['id']}/preview", headers=HEADERS).json()
        )
        body = preview.request
        prompt = json.loads(preview.prompt)
        valid = relevance_output(prompt)
        ResearchPlanner.validate(json.dumps(valid), body, preview.inputs)
        broken = [
            valid | {"verdicts": valid["verdicts"][:1]},
            valid | {"verdicts": [v | {"evidence_ids": []} for v in valid["verdicts"]]},
            valid | {"relevance_grade": 1},
            valid | {"relevance_grade": None},
            valid | {"decision": "EXCLUDE"},
            valid
            | {
                "card": {
                    "summary": "s",
                    "contributions": [],
                    "strengths": [],
                    "limitations": [],
                    "questions": [],
                }
            },
            valid | {"reusable": [valid["reusable"][0] | {"evidence_ids": ["f" * 64]}]},
        ]
        for output in broken:
            with pytest.raises(Exception) as caught:
                ResearchPlanner.validate(json.dumps(output), body, preview.inputs)
            assert getattr(caught.value, "code", None) == "INVALID_OUTPUT", output
        uncertain = valid | {
            "decision": "UNCERTAIN",
            "relevance_grade": None,
            "verdicts": [v | {"verdict": "UNCLEAR", "evidence_ids": []} for v in valid["verdicts"]],
        }
        ResearchPlanner.validate(json.dumps(uncertain), body, preview.inputs)


def test_batch_screens_sequentially_queue_orders_and_adoption_needs_review(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        calls: list[dict] = []
        controlled(app, calls)
        prepared = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta")
        items = {i["source_id"]: i for i in prepared["batch"]["items"]}
        assert items[ids["NOABSTRA"]]["skipped"] == "NO_CONTENT"
        assert items[ids["NOABSTRA"]]["run_id"] is None
        assert all(items[ids[k]]["run_id"] for k in ["ATARIPAP", "ROBOTPAP"])
        assert prepared["run_states"] == {"PREPARED": 2} and calls == []
        assert prepared["batch"]["estimated_input_tokens"] > 0
        # Idempotent replay returns the same batch without new runs.
        again = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta")
        assert again["batch"]["id"] == prepared["batch"]["id"]
        done = run_batch(client, prefix, prepared)
        assert done["batch"]["state"] == "COMPLETE", done
        assert len(calls) == 2 and sum(done["run_states"].values()) == 2
        by_grade = queue(client, prefix, protocol["id"], "TITLE_ABSTRACT", "GRADE")
        assert [r["source_id"] for r in by_grade["items"]][:2] == [ids["ATARIPAP"], ids["ROBOTPAP"]]
        atari = by_grade["items"][0]
        assert atari["output"]["relevance_grade"] == 3 and atari["review_state"] == "UNREVIEWED"
        assert atari["output"]["reusable"][0]["kind"] == "METHOD"
        assert by_grade["items"][2]["run_id"] is None and by_grade["items"][2]["output"] is None
        # An unreviewed model proposal cannot become a decision.
        adopt = {
            "artifact_version_id": atari["artifact_version_id"],
            "reviewer": "Marcus",
            "expected_revision": 0,
            "idempotency_key": "adopt-1",
        }
        refused = client.post(prefix + "/triage/adopt", headers=HEADERS, json=adopt)
        assert refused.status_code == 422 and refused.json()["code"] == "INVALID_REQUEST"
        reviewed = client.post(
            prefix + f"/artifacts/{atari['artifact_version_id']}/review",
            headers=HEADERS,
            json={
                "action": "APPROVED",
                "expected_revision": 1,
                "rationale": "Checked",
                "idempotency_key": "review-1",
            },
        )
        assert reviewed.status_code == 201, reviewed.text
        stale = client.post(prefix + "/triage/adopt", headers=HEADERS, json=adopt)
        assert stale.status_code == 409 and stale.json()["code"] == "REVISION_CONFLICT"
        adopted = client.post(
            prefix + "/triage/adopt",
            headers=HEADERS,
            json=adopt | {"artifact_version_id": reviewed.json()["id"], "idempotency_key": "a2"},
        )
        assert adopted.status_code == 201, adopted.text
        decision = adopted.json()
        assert decision["decision"] == "INCLUDE" and decision["reviewer"] == "Marcus"
        assert decision["adopted_artifact_version_id"] == reviewed.json()["id"]
        # A human exclusion at title/abstract keeps that study out of the full-text batch.
        excluded = client.post(
            prefix + "/screening/decisions",
            headers=HEADERS,
            json={
                "protocol_version_id": protocol["id"],
                "source_id": ids["ROBOTPAP"],
                "stage": "TITLE_ABSTRACT",
                "reviewer": "Marcus",
                "decision": "EXCLUDE",
                "criterion_ids": ["robots"],
                "rationale": "Hardware robots",
                "expected_revision": 0,
                "idempotency_key": "exclude",
            },
        )
        assert excluded.status_code == 201, excluded.text
        attention = queue(client, prefix, protocol["id"], "TITLE_ABSTRACT")
        assert attention["items"][-1]["human"]  # settled studies sink to the end
        full = batch(
            client, prefix, protocol["id"], "FULL_TEXT", "ft", selection="NOT_HUMAN_EXCLUDED"
        )
        full_items = {i["source_id"]: i for i in full["batch"]["items"]}
        assert full_items[ids["ROBOTPAP"]]["skipped"] == "HUMAN_EXCLUDED"
        assert full_items[ids["NOABSTRA"]]["run_id"]  # full text exists without an abstract
        finished_full = run_batch(client, prefix, full)
        assert finished_full["batch"]["state"] == "COMPLETE", finished_full
        rows = queue(client, prefix, protocol["id"], "FULL_TEXT", "GRADE")["items"]
        card = rows[0]["output"]["card"]
        assert rows[0]["source_id"] == ids["ATARIPAP"] and card["strengths"][0]["evidence_ids"]


def test_batch_pauses_when_a_run_waits_for_the_provider(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        calls: list[dict] = []
        controlled(app, calls, fail_first=True)
        prepared = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta")
        paused = run_batch(client, prefix, prepared)
        # A sent call without a validated answer is uncertain billing: stop, never resend.
        assert paused["batch"]["state"] == "PAUSED", paused
        assert paused["batch"]["reason"] == "RUN_BILLING_UNKNOWN", paused
        assert paused["run_states"] == {"BILLING_UNKNOWN": 1, "PREPARED": 1}
        assert len(calls) == 1
        # Restarting skips the uncertain run; the rate-limit pause changed the provider
        # revision, so the remaining prepared run is stale and nothing is sent.
        stale = run_batch(client, prefix, paused)
        assert stale["batch"]["reason"] == "PREPARED_RUN_STALE" and len(calls) == 1
        provider = next(
            p
            for p in client.get("/v1/providers/profiles?offset=0&limit=50", headers=HEADERS).json()[
                "items"
            ]
            if p["id"] == "local"
        )
        assert provider["paused_code"] == "RATE_LIMITED"
        resumed_profile = client.post(
            "/v1/providers/profiles/local/resume",
            headers=HEADERS,
            json={"expected_revision": provider["revision"], "idempotency_key": "resume"},
        )
        assert resumed_profile.status_code == 200, resumed_profile.text
        pending = [
            i["source_id"]
            for i in stale["batch"]["items"]
            if i["run_id"]
            and client.get(prefix + f"/research/runs/{i['run_id']}", headers=HEADERS).json()[
                "state"
            ]
            == "PREPARED"
        ]
        again = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta-2", source_ids=pending)
        resumed = run_batch(client, prefix, again)
        assert resumed["batch"]["state"] == "COMPLETE", resumed
        assert len(resumed["batch"]["items"]) == 1
        assert len(calls) == 2  # the uncertain call was not resent


def test_cancelled_batch_never_starts(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        calls: list[dict] = []
        controlled(app, calls)
        prepared = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta")
        path = prefix + f"/triage/batches/{prepared['batch']['id']}/control"
        cancelled = client.post(
            path,
            headers=HEADERS,
            json={"action": "cancel", "expected_revision": 0, "idempotency_key": "c"},
        )
        assert cancelled.status_code == 200 and cancelled.json()["batch"]["state"] == "CANCELLED"
        start = client.post(
            path,
            headers=HEADERS,
            json={"action": "start", "expected_revision": 1, "idempotency_key": "s"},
        )
        assert start.status_code == 422 and calls == []


def test_full_text_selection_is_directed_and_fits_the_default_context(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        from test_relevance import paper_pdf

        path = tmp_path / "long.pdf"
        paper_pdf(path, pages=30, lines=30)
        notebook, snap, preview, prefix = document_scope(client)
        source_id = preview["items"][0]["id"]
        document = register(client, prefix, source_id, path)
        assert finished(client, prefix, ingest(client, prefix, document))["state"] == "COMPLETE"
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        run = client.post(
            prefix + "/research/runs",
            headers=HEADERS,
            json={
                "kind": "SCREENING",
                "protocol_version_id": protocol["id"],
                "profile_id": "local",
                "source_id": source_id,
                "stage": "FULL_TEXT",
                "question": "Relevant?",
                "idempotency_key": "long",
            },
        )
        assert run.status_code == 201, run.text
        prepared = client.get(
            prefix + f"/research/runs/{run.json()['id']}/preview", headers=HEADERS
        ).json()
        coverage = prepared["inputs"]["coverage"]
        assert coverage["reason"] == "DIRECTED_EXCERPTS"
        assert 0 < coverage["evidence_chunks"] < coverage["candidate_chunks"] == 30
        pages = [e["page_index"] for e in prepared["inputs"]["evidence"]]
        assert pages[0] == 0 and pages == sorted(pages)
        assert prepared["estimated_input_tokens"] + 4096 <= 32768
        assert "RELEVANCE:" in prepared["schema_plan"]["system"]


def test_batch_calls_share_the_batch_job_identity_and_ceiling_blocks_before_sending(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        calls: list[dict] = []
        controlled(app, calls)
        first = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "x" * 70 + "a")
        second = batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "x" * 70 + "b")

        def runs(view):
            return {i["run_id"] for i in view["batch"]["items"] if i["run_id"]}

        # Keys sharing a long prefix are distinct batches with distinct runs.
        assert first["batch"]["id"] != second["batch"]["id"]
        assert not runs(first) & runs(second)
        assert first["batch"]["destination"] == "ollama / fixture / http://127.0.0.1:11434"
        assert first["batch"]["mode"] == "LOCAL"
        assert first["batch"]["categories"] == ["excerpts", "metadata"]
        done = run_batch(client, prefix, first)
        assert done["batch"]["state"] == "COMPLETE", done
        with app.state.services.database.transaction() as conn:
            identities = conn.execute("SELECT job_id,session_id FROM provider_calls").fetchall()
        assert {row[0] for row in identities} == {first["batch"]["id"]}
        assert {row[1] for row in identities} == runs(first)
        # A ceiling on the batch job applies to all its calls; without a verified token
        # bound the reservation refuses before sending, and the batch stops instead of
        # failing every remaining study.
        ceiling = client.put(
            prefix + "/provider-budgets",
            headers=HEADERS,
            json={
                "kind": "job",
                "identity": second["batch"]["id"],
                "currency": "USD",
                "ceiling": "1",
                "expected_revision": 0,
                "idempotency_key": "cap",
            },
        )
        assert ceiling.status_code == 200, ceiling.text
        paused = run_batch(client, prefix, second)
        assert paused["batch"]["state"] == "PAUSED", paused
        assert len(calls) == 2  # only the first batch's two sends; nothing else was sent
        started = [i["run_id"] for i in second["batch"]["items"] if i["run_id"]][0]
        refused = client.get(prefix + f"/research/runs/{started}", headers=HEADERS).json()
        assert refused["reason"] in {"PRICE_UNKNOWN", "TOKEN_BOUND_REQUIRED"}, refused
        assert paused["batch"]["reason"] == "RUN_" + (
            refused["state"] if refused["state"] != "FAILED" else refused["reason"]
        )
        assert sum(paused["run_states"].values()) == 2 and paused["run_states"]["PREPARED"] == 1


def test_adoption_replay_is_bound_to_the_adopted_artifact_version(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, ids = library(client, tmp_path)
        protocol = relevance_protocol(client, prefix).json()
        profile(client)
        calls: list[dict] = []
        controlled(app, calls)
        run_batch(client, prefix, batch(client, prefix, protocol["id"], "TITLE_ABSTRACT", "ta"))
        rows = queue(client, prefix, protocol["id"], "TITLE_ABSTRACT", "GRADE")["items"]
        reviewed = []
        for index, row in enumerate(rows[:2]):
            response = client.post(
                prefix + f"/artifacts/{row['artifact_version_id']}/review",
                headers=HEADERS,
                json={
                    "action": "APPROVED",
                    "expected_revision": 1,
                    "rationale": "Checked",
                    "idempotency_key": f"review-{index}",
                },
            )
            assert response.status_code == 201, response.text
            reviewed.append(response.json()["id"])
        adopt = {
            "artifact_version_id": reviewed[0],
            "reviewer": "Marcus",
            "expected_revision": 0,
            "idempotency_key": "adopt",
        }
        first = client.post(prefix + "/triage/adopt", headers=HEADERS, json=adopt)
        assert first.status_code == 201, first.text
        # Same key, another artifact: the adopted provenance is part of the request identity.
        other = client.post(
            prefix + "/triage/adopt",
            headers=HEADERS,
            json=adopt | {"artifact_version_id": reviewed[1]},
        )
        assert other.status_code == 409 and other.json()["code"] == "IDEMPOTENCY_CONFLICT"
        # A newer review does not prevent replaying the recorded adoption.
        newer = client.post(
            prefix + f"/artifacts/{reviewed[0]}/review",
            headers=HEADERS,
            json={
                "action": "REJECTED",
                "expected_revision": 2,
                "rationale": "Second look",
                "idempotency_key": "review-again",
            },
        )
        assert newer.status_code == 201, newer.text
        replay = client.post(prefix + "/triage/adopt", headers=HEADERS, json=adopt)
        assert replay.status_code == 201 and replay.json() == first.json()
        stale = client.post(
            prefix + "/triage/adopt",
            headers=HEADERS,
            json=adopt | {"idempotency_key": "adopt-2", "expected_revision": 1},
        )
        assert stale.status_code == 409 and stale.json()["code"] == "REVISION_CONFLICT"


def test_review_replay_saved_before_relevance_fields_stays_idempotent():
    from evidra.extraction.forms import fingerprint, same_request
    from evidra.research.execution import ArtifactReview

    body = ArtifactReview.model_validate(
        {
            "expected_revision": 1,
            "action": "CORRECTED",
            "rationale": "Fixed",
            "idempotency_key": "k",
            "corrected_output": {
                "kind": "SCREENING",
                "decision": "UNCERTAIN",
                "criterion_ids": ["atari"],
                "evidence_ids": [],
                "rationale": "r",
            },
        }
    )
    stored = json.loads(fingerprint(body))
    for name in ["verdicts", "relevance_grade", "reusable", "concerns", "card"]:
        stored["corrected_output"].pop(name)
    old = json.dumps(stored, sort_keys=True, ensure_ascii=False)
    assert old != fingerprint(body) and same_request(old, body)
    changed = json.loads(old)
    changed["rationale"] = "Other"
    assert not same_request(json.dumps(changed), body)
