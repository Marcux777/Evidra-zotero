"""Durable extraction boundaries with real SQLite and controlled provider transport."""

import json
import time
from concurrent.futures import ThreadPoolExecutor

import httpx
import pytest
from fastapi.testclient import TestClient
from test_conversations import profile
from test_matrix import setup
from test_providers import stream
from test_runtime_notebooks import HEADERS, make_app


def prepare(client, prefix, form, key="job", method="FULL_SCAN"):
    response = client.post(
        prefix + "/jobs",
        headers=HEADERS,
        json={
            "idempotency_key": key,
            "form_version_id": form["id"],
            "field_keys": ["result"],
            "profile_id": "local",
            "method": method,
            "max_output_tokens": 512,
            "max_chunks_per_unit": 100,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def finish(client, prefix, job):
    response = client.post(
        prefix + "/jobs/" + job["id"] + "/control",
        headers=HEADERS,
        json={
            "action": "resume",
            "expected_revision": job["revision"],
            "idempotency_key": "start-" + job["id"] + "-" + str(job["revision"]),
        },
    )
    assert response.status_code == 200, response.text
    for _ in range(100):
        result = client.get(prefix + "/jobs/" + job["id"], headers=HEADERS)
        assert result.status_code == 200, result.text
        if result.json()["state"] not in {"QUEUED", "RUNNING"}:
            return result.json()
        time.sleep(0.02)
    raise AssertionError("Job did not finish")


def test_durable_extraction_cache_and_human_decision(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, manual = setup(client)
        profile(client)
        proposed = client.post(prefix + "/matrix/proposals", headers=HEADERS, json=manual).json()
        assert (
            client.post(
                prefix + "/matrix/decisions",
                headers=HEADERS,
                json={
                    "proposal_id": proposed["id"],
                    "expected_revision": 0,
                    "action": "APPROVED",
                    "idempotency_key": "approve",
                },
            ).status_code
            == 201
        )
        calls = []

        def boundary(request):
            prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
            calls.append(prompt)
            result = {
                "value": {"original": "42", "normalized": 42},
                "value_state": "FOUND",
                "evidence_ids": [prompt["evidence"][0]["id"]],
                "rationale": "Explicit value",
            }
            return httpx.Response(200, text=stream("ollama", json.dumps(result)))

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        job = prepare(client, prefix, form)
        assert job["state"] == "PAUSED" and job["total_units"] == 1
        pending = client.get(prefix + "/jobs/" + job["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        assert pending["coverage_state"] == "PARTIAL_SCAN"
        done = finish(client, prefix, job)
        assert done["state"] == "SUCCEEDED", done
        unit = client.get(prefix + "/jobs/" + job["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        assert unit["coverage"][0]["chunks_processed"] == 1
        history = client.post(
            prefix + "/matrix/proposals/query",
            headers=HEADERS,
            json={
                "form_version_id": form["id"],
                "source_id": manual["source_id"],
                "field_key": "result",
                "offset": 0,
            },
        ).json()["items"]
        assert history[0]["origin"] == "MODEL_RUN"
        assert history[0]["coverage"] == "FULL_SCAN"
        assert (
            client.get(prefix + "/matrix/" + form["id"], headers=HEADERS).json()["items"][0][
                "proposal_id"
            ]
            == proposed["id"]
        )
        cached = finish(client, prefix, prepare(client, prefix, form, "cached"))
        assert cached["state"] == "SUCCEEDED" and len(calls) == 1
        assert (
            client.post(
                prefix + "/matrix/proposals/query",
                headers=HEADERS,
                json={
                    "form_version_id": form["id"],
                    "source_id": manual["source_id"],
                    "field_key": "result",
                    "offset": 0,
                },
            ).json()["total"]
            == 2
        )


def test_queue_claim_is_atomic_and_cancel_prevents_dispatch(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, _ = setup(client)
        profile(client)
        job = prepare(client, prefix, form)
        queue = app.state.services.jobs
        context = app.state.services.scopes.resolve(
            app.state.services.scopes.principal, job["notebook_id"], job["snapshot_id"], "commit"
        )
        queue.control(
            context,
            job["id"],
            __import__("evidra.jobs.models", fromlist=["JobControl"]).JobControl(
                action="resume", expected_revision=0, idempotency_key="resume"
            ),
        )
        with ThreadPoolExecutor(max_workers=2) as pool:
            claims = list(pool.map(lambda n: queue.claim(context, job["id"], str(n)), range(2)))
        assert sum(c is not None for c in claims) == 1
        running = queue.get(context, job["id"])
        response = client.post(
            prefix + "/jobs/" + job["id"] + "/control",
            headers=HEADERS,
            json={
                "action": "cancel",
                "expected_revision": running.revision,
                "idempotency_key": "cancel",
            },
        )
        assert response.json()["state"] == "CANCELLED", response.text
        assert queue.claim(context, job["id"], "cancelled") is None
        assert client.get(prefix + "/provider-calls", headers=HEADERS).json()["total"] == 0


@pytest.mark.parametrize(
    "method,limit,expected,coverage,question",
    [
        ("SEARCH", 100, "NOT_FOUND_IN_SEARCH", "SEARCH", "reported"),
        ("SEARCH", 100, "NOT_FOUND_IN_SEARCH", "SEARCH", "zyzzxxy"),
        ("FULL_SCAN", 100, "NOT_REPORTED_CANDIDATE", "FULL_SCAN", "reported"),
        ("FULL_SCAN", 1, "NOT_FOUND_IN_SEARCH", "PARTIAL_SCAN", "reported"),
    ],
)
def test_absence_requires_measured_scan_and_preserves_batches(
    tmp_path, method, limit, expected, coverage, question
):
    from test_conversations import indexed

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client, text=("reported result observation. " * 700))
        fields = client.get(prefix + "/forms/template", headers=HEADERS).json()
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Field",
                "fields": [
                    dict(
                        fields[0],
                        key="result",
                        label=question,
                        definition=question,
                        question=question,
                    )
                ],
                "expected_revision": 0,
                "idempotency_key": "form",
            },
        ).json()
        profile(client)
        calls = []

        def boundary(request):
            prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
            calls.extend(e["id"] for e in prompt["evidence"])
            return httpx.Response(
                200,
                text=stream(
                    "ollama",
                    json.dumps(
                        {
                            "value": None,
                            "value_state": "NOT_FOUND_IN_SEARCH",
                            "evidence_ids": [],
                            "rationale": "Not in this batch",
                        }
                    ),
                ),
            )

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        response = client.post(
            prefix + "/jobs",
            headers=HEADERS,
            json={
                "idempotency_key": "job",
                "form_version_id": form["id"],
                "field_keys": ["result"],
                "profile_id": "local",
                "method": method,
                "max_chunks_per_unit": limit,
            },
        )
        assert response.status_code == 201, response.text
        done = finish(client, prefix, response.json())
        assert done["state"] == ("PARTIAL" if coverage == "PARTIAL_SCAN" else "SUCCEEDED"), done
        unit = client.get(prefix + "/jobs/" + done["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        assert unit["coverage_state"] == coverage
        assert unit["coverage"][0]["chunks_processed"] == len(calls)
        assert len(calls) == len(set(calls))
        proposal = client.post(
            prefix + "/matrix/proposals/query",
            headers=HEADERS,
            json={
                "form_version_id": form["id"],
                "source_id": unit["source_id"],
                "field_key": "result",
                "offset": 0,
            },
        ).json()["items"][0]
        assert proposal["value"] is None and proposal["value_state"] == expected
        if question == "zyzzxxy":
            assert (
                not calls and proposal["origin"] == "COVERAGE_CHECK" and proposal["model"] is None
            )
            # Removing a planned attachment grant must also hide an evidence-free derived result.
            with app.state.services.database.transaction() as conn:
                conn.execute(
                    "UPDATE notebook_grants SET contents='[]' WHERE notebook_id=?",
                    (done["notebook_id"],),
                )
            response = client.post(
                prefix + "/matrix/proposals/query",
                headers=HEADERS,
                json={
                    "form_version_id": form["id"],
                    "source_id": unit["source_id"],
                    "field_key": "result",
                    "offset": 0,
                },
            )
            assert response.json()["code"] == "SOURCE_REVOKED", response.text


@pytest.mark.parametrize("conflict", [False, True])
def test_experimental_results_keep_distinct_batch_contexts(tmp_path, conflict):
    from test_conversations import indexed

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client, text="reported result observation. " * 700)
        fields = client.get(prefix + "/forms/template", headers=HEADERS).json()
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Results",
                "fields": [dict(fields[0], key="result", kind="experimental_result")],
                "expected_revision": 0,
                "idempotency_key": "form",
            },
        ).json()
        profile(client)
        results = []

        def boundary(request):
            prompt = json.loads(json.loads(request.content)["messages"][-1]["content"])
            result = {
                "metric": "accuracy",
                "number": {
                    "original": str(42 + len(results)) + "%",
                    "normalized": 42 + len(results),
                },
                "dataset": "Same dataset" if conflict else "Dataset " + str(len(results)),
                "condition": "test",
                "unit": "%",
                "baseline": "control",
                "direction": "HIGHER_BETTER",
            }
            results.append(result)
            return httpx.Response(
                200,
                text=stream(
                    "ollama",
                    json.dumps(
                        {
                            "value": [result],
                            "value_state": "FOUND",
                            "evidence_ids": [prompt["evidence"][0]["id"]],
                            "rationale": "Explicit experimental context",
                        }
                    ),
                ),
            )

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        job = finish(client, prefix, prepare(client, prefix, form))
        assert job["state"] == "SUCCEEDED", job
        unit = client.get(prefix + "/jobs/" + job["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        proposal = client.post(
            prefix + "/matrix/proposals/query",
            headers=HEADERS,
            json={
                "form_version_id": form["id"],
                "source_id": unit["source_id"],
                "field_key": "result",
                "offset": 0,
            },
        ).json()["items"][0]
        assert len(results) > 1
        if conflict:
            assert proposal["value_state"] == "CONFLICTING" and proposal["value"] is None
        else:
            assert proposal["value_state"] == "FOUND" and proposal["value"] == results


def test_v7_to_v8_keeps_human_decisions_and_creates_empty_queue(tmp_path, monkeypatch):
    import sqlite3
    from unittest.mock import Mock

    from evidra.storage import database as storage

    with monkeypatch.context() as patch:
        patch.setattr(storage, "SCHEMA_VERSION", 7)
        patch.setattr("evidra.api.app.JobQueue", Mock())
        with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
            prefix, _, manual = setup(client)
            proposal = client.post(
                prefix + "/matrix/proposals", headers=HEADERS, json=manual
            ).json()
            decision = client.post(
                prefix + "/matrix/decisions",
                headers=HEADERS,
                json={
                    "proposal_id": proposal["id"],
                    "expected_revision": 0,
                    "idempotency_key": "approval",
                    "action": "APPROVED",
                },
            )
            assert decision.status_code == 201, decision.text
            before = decision.json()
    db = storage.Database(tmp_path / "evidra.sqlite3")
    with db.transaction() as conn:
        assert conn.execute("PRAGMA user_version").fetchone()[0] == 8
        assert (
            json.loads(conn.execute("SELECT payload FROM cell_decisions").fetchone()[0]) == before
        )
        assert conn.execute("SELECT count(*) FROM extraction_jobs").fetchone()[0] == 0
    db.close()
    with sqlite3.connect(tmp_path / "evidra.before-v8.sqlite3") as conn:
        assert conn.execute("PRAGMA user_version").fetchone()[0] == 7


def crash_after_second_send(directory):
    """Controlled child only: first batch commits, second SENT crashes without cleanup."""
    import os
    from pathlib import Path

    from test_conversations import indexed

    root = Path(directory)
    app = make_app(root, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client, text="reported result. " * 900)
        fields = client.get(prefix + "/forms/template", headers=HEADERS).json()
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Field",
                "fields": [dict(fields[0], key="result", question="reported")],
                "expected_revision": 0,
                "idempotency_key": "form",
            },
        ).json()
        profile(client)
        calls = 0

        def boundary(request):
            nonlocal calls
            calls += 1
            if calls == 2:
                os._exit(71)
            return httpx.Response(
                200,
                text=stream(
                    "ollama",
                    json.dumps(
                        {
                            "value": None,
                            "value_state": "NOT_FOUND_IN_SEARCH",
                            "evidence_ids": [],
                            "rationale": "No value in this batch",
                        }
                    ),
                ),
            )

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        job = prepare(client, prefix, form)
        (root / "job.json").write_text(json.dumps({"prefix": prefix, "job": job}), encoding="utf-8")
        finish(client, prefix, job)
        raise AssertionError("Controlled process did not interrupt")


def test_real_process_interruption_preserves_checkpoint_and_blocks_resend(tmp_path):
    import subprocess
    import sys
    from pathlib import Path

    from test_scopes import source, sync

    code = (
        "import sys;sys.path.insert(0,sys.argv[1]);"
        "from test_jobs import crash_after_second_send;crash_after_second_send(sys.argv[2])"
    )
    result = subprocess.run(
        [sys.executable, "-c", code, str(Path(__file__).parent), str(tmp_path)],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 71, result.stdout + result.stderr
    receipt = json.loads((tmp_path / "job.json").read_text(encoding="utf-8"))
    prefix, old = receipt["prefix"], receipt["job"]
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        item = source()
        item["contents"] = [{"key": "SAMEKEY1", "kind": "abstract", "version": "1"}]
        assert (
            sync(
                client,
                old["notebook_id"],
                [item],
                purpose="revalidation",
                snapshot_id=old["snapshot_id"],
            ).status_code
            == 200
        )
        job = client.get(prefix + "/jobs/" + old["id"], headers=HEADERS).json()
        assert job["state"] == "WAITING_PROVIDER" and job["reason"] == "BILLING_UNKNOWN"
        units = client.get(prefix + "/jobs/" + job["id"] + "/units", headers=HEADERS).json()[
            "items"
        ]
        assert units[0]["state"] == "BILLING_UNKNOWN" and units[0]["batches_processed"] == 1
        assert units[0]["coverage"][0]["chunks_processed"] == 4
        calls = client.get(prefix + "/provider-calls", headers=HEADERS).json()["items"]
        assert {c["state"] for c in calls} == {"CONFIRMED", "BILLING_UNKNOWN"}
        response = client.post(
            prefix + "/jobs/" + job["id"] + "/control",
            headers=HEADERS,
            json={
                "action": "resume",
                "expected_revision": job["revision"],
                "idempotency_key": "unsafe",
            },
        )
        assert response.status_code == 409 and response.json()["code"] == "BILLING_UNKNOWN"
        skipped = client.post(
            prefix + "/jobs/" + job["id"] + "/control",
            headers=HEADERS,
            json={
                "action": "skip_uncertain",
                "expected_revision": job["revision"],
                "idempotency_key": "skip",
            },
        ).json()
        # Explicit skip preserves accounting uncertainty, never creates a new provider attempt.
        done = finish(client, prefix, skipped)
        assert done["state"] == "FAILED"
        assert client.get(prefix + "/provider-calls", headers=HEADERS).json()["total"] == 2
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM extraction_proposals").fetchone()[0] == 0


@pytest.mark.parametrize("action", ["cancel", "revoke"])
def test_inflight_stop_or_revocation_never_commits_or_dispatches_next_batch(tmp_path, action):
    import asyncio
    import threading

    from test_conversations import indexed

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
                        "value": None,
                        "value_state": "NOT_FOUND_IN_SEARCH",
                        "evidence_ids": [],
                        "rationale": "No value",
                    }
                ),
            ).encode()

    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client, text="reported result. " * 900)
        field = client.get(prefix + "/forms/template", headers=HEADERS).json()[0]
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Field",
                "fields": [dict(field, key="result")],
                "expected_revision": 0,
                "idempotency_key": "form",
            },
        ).json()
        profile(client)

        def boundary(request):
            calls.append(request.url)
            return httpx.Response(200, stream=Delayed())

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        job = prepare(client, prefix, form)
        response = client.post(
            prefix + "/jobs/" + job["id"] + "/control",
            headers=HEADERS,
            json={"action": "resume", "expected_revision": 0, "idempotency_key": "resume"},
        )
        assert response.status_code == 200, response.text
        assert entered.wait(2), "Controlled provider did not receive first batch"
        unit = client.get(prefix + "/jobs/" + job["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        if action == "cancel":
            current = client.get(prefix + "/jobs/" + job["id"], headers=HEADERS).json()
            cancelled = client.post(
                prefix + "/jobs/" + job["id"] + "/control",
                headers=HEADERS,
                json={
                    "action": "cancel",
                    "expected_revision": current["revision"],
                    "idempotency_key": "cancel",
                },
            )
            assert cancelled.json()["state"] == "CANCELLED", cancelled.text
        else:
            app.state.services.scopes.revoke_access(unit["source_id"])
        release.set()
        for _ in range(100):
            if app.state.services.job_worker.active is None:
                break
            time.sleep(0.01)
        assert app.state.services.job_worker.active is None
        assert len(calls) == 1
        with app.state.services.database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM extraction_results").fetchone()[0] == 0
            assert conn.execute("SELECT count(*) FROM extraction_proposals").fetchone()[0] == 0
        final = client.get(prefix + "/jobs/" + job["id"], headers=HEADERS).json()
        assert final["state"] == ("CANCELLED" if action == "cancel" else "PAUSED")


def test_full_scan_counts_missing_attachment_and_failed_pdf_page(tmp_path):
    from pdf_fixtures import pdf_bytes
    from test_documents import document_scope, finished, ingest, register
    from test_scopes import source

    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        item = source()
        item["contents"].append({"key": "MISSING", "kind": "pdf"})
        _, _, sources, prefix = document_scope(client, [item])
        path = tmp_path / "partial.pdf"
        path.write_bytes(pdf_bytes([{"lines": [(40, 440, "reported result")]}, {"lines": []}]))
        document = register(client, prefix, sources["items"][0]["id"], path)
        parsed = finished(client, prefix, ingest(client, prefix, document))
        assert parsed["pages_processed"] == 2
        missing = client.post(
            prefix + "/documents/missing",
            headers=HEADERS,
            json={"source_id": sources["items"][0]["id"], "content_key": "MISSING"},
        )
        assert missing.status_code == 200, missing.text
        field = client.get(prefix + "/forms/template", headers=HEADERS).json()[0]
        form = client.post(
            prefix + "/forms",
            headers=HEADERS,
            json={
                "name": "Field",
                "fields": [dict(field, key="result")],
                "expected_revision": 0,
                "idempotency_key": "form",
            },
        ).json()
        profile(client)
        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(
                lambda request: httpx.Response(
                    200,
                    text=stream(
                        "ollama",
                        json.dumps(
                            {
                                "value": None,
                                "value_state": "NOT_FOUND_IN_SEARCH",
                                "evidence_ids": [],
                                "rationale": "Not seen",
                            }
                        ),
                    ),
                )
            )
        )
        done = finish(client, prefix, prepare(client, prefix, form))
        assert done["state"] == "PARTIAL", done
        unit = client.get(prefix + "/jobs/" + done["id"] + "/units", headers=HEADERS).json()[
            "items"
        ][0]
        assert len(unit["coverage"]) == 2
        coverage = {c["content_key"]: c for c in unit["coverage"]}
        assert coverage["MISSING"]["reason"] == "MISSING_FILE"
        assert coverage["SAMEKEY1PDF"]["pages_total"] == 2
        assert coverage["SAMEKEY1PDF"]["pages_processed"] == 1
        assert coverage["SAMEKEY1PDF"]["failed_pages"] == 1


def test_expired_lease_requires_explicit_resume_and_rejects_stale_owner(tmp_path):
    from evidra.domain.errors import EvidraError
    from evidra.jobs.models import JobControl

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, form, _ = setup(client)
        profile(client)
        job = prepare(client, prefix, form)
        queue = app.state.services.jobs
        clock = [0.0]
        queue.clock = lambda: clock[0]
        context = queue.scopes.resolve(
            queue.scopes.principal, job["notebook_id"], job["snapshot_id"], "commit"
        )
        queue.control(
            context,
            job["id"],
            JobControl(action="resume", expected_revision=0, idempotency_key="start"),
        )
        unit = queue.claim(context, job["id"], "initial-lease")
        assert unit is not None
        clock[0] = 121
        assert queue.claim(context, job["id"], "expiry") is None
        paused = queue.get(context, job["id"])
        assert paused.state == "PAUSED" and paused.reason == "LEASE_EXPIRED"
        with queue.database.transaction() as conn, pytest.raises(EvidraError, match="lease"):
            queue.require_lease(conn, context, job["id"], unit.id, "initial-lease")
        queue.control(
            context,
            job["id"],
            JobControl(
                action="resume", expected_revision=paused.revision, idempotency_key="resume"
            ),
        )
        assert queue.claim(context, job["id"], "new-lease").id == unit.id
        with queue.database.transaction() as conn, pytest.raises(EvidraError, match="lease"):
            queue.require_lease(conn, context, job["id"], unit.id, "initial-lease")
        app.state.services.job_worker.failure(
            job["id"], unit.id, "ENGINE_INTERRUPTED", "initial-lease"
        )
        with queue.database.transaction() as conn:
            _, active = queue.require_lease(conn, context, job["id"], unit.id, "new-lease")
            assert active.state == "RUNNING"
