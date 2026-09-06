"""Task6 consumer invariants, using real SQLite evidence and controlled provider events."""

import asyncio
import hashlib
import json
import time

import httpx
import pytest
from fastapi.testclient import TestClient
from test_documents import document_scope
from test_runtime_notebooks import HEADERS, make_app
from test_scopes import source


def indexed(client, *, key="n", text="decisive finding", item_key="SAMEKEY1"):
    item = source(key=item_key)
    item["contents"] = [{"key": item_key, "kind": "abstract", "version": "1"}]
    notebook, snap, preview, prefix = document_scope(client, [item], key=key)
    stage = client.post(
        prefix + "/documents/text",
        headers=HEADERS,
        json={
            "source_id": preview["items"][0]["id"],
            "content_key": item_key,
            "total_characters": len(text),
            "sha256": hashlib.sha256(text.encode()).hexdigest(),
        },
    )
    assert stage.status_code == 201, stage.text
    for offset in range(0, len(text), 8000):
        response = client.post(
            prefix + "/documents/text/" + stage.json()["id"],
            headers=HEADERS,
            json={
                "offset": offset,
                "text": text[offset : offset + 8000],
                "final": offset + 8000 >= len(text),
            },
        )
        assert response.status_code == 200, response.text
    return notebook, snap, prefix


def profile(client):
    response = client.put(
        "/v1/providers/profiles/local",
        headers=HEADERS,
        json={
            "expected_revision": 0,
            "idempotency_key": "profile",
            "spec": {
                "adapter": "ollama",
                "mode": "LOCAL",
                "purpose": "generation",
                "base_url": "http://127.0.0.1:11434",
                "model": "fixture",
                "capabilities": {
                    name: {"supported": True, "provenance": "USER_DECLARED"}
                    for name in ["generation", "streaming"]
                },
            },
        },
    )
    assert response.status_code == 200, response.text


@pytest.mark.parametrize(
    "scenario",
    [
        "text",
        "native_schema",
        "visual",
        "monetary_cap",
        "historical_consent",
        "length",
        "length_missing_usage",
    ],
)
def test_conversation_consumes_actual_registry_usage_and_server_visual_bytes(tmp_path, scenario):
    from pdf_fixtures import write_pdf
    from test_documents import finished, ingest, register
    from test_providers import profile_data, stream

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client)
        profile(client)
        if scenario == "native_schema":
            spec = client.get("/v1/providers/profiles", headers=HEADERS).json()["items"][0]
            for field in ["id", "revision", "paused_code"]:
                spec.pop(field)
            spec["capabilities"]["structured_output"] = {
                "supported": True,
                "provenance": "USER_DECLARED",
            }
            assert (
                client.put(
                    "/v1/providers/profiles/local",
                    headers=HEADERS,
                    json={"spec": spec, "expected_revision": 1, "idempotency_key": "native"},
                ).status_code
                == 200
            )
        preview_id = None
        pixels = None
        if scenario in ["visual", "historical_consent"]:
            path = tmp_path / "visual.pdf"
            write_pdf(path)
            _, _, sources, prefix = document_scope(client, key="visual")
            document = register(client, prefix, sources["items"][0]["id"], path)
            parsed = finished(client, prefix, ingest(client, prefix, document))
            response = client.post(
                prefix + "/documents/preview",
                headers=HEADERS,
                json={
                    "document_version_id": parsed["document_version_id"],
                    "page_index": 0,
                    "region": [30, 410, 200, 470],
                    "scale": 1,
                    "idempotency_key": "visual",
                },
            )
            assert response.status_code == 202, response.text
            rendered = finished(client, prefix, response.json())
            assert rendered["state"] == "COMPLETE", rendered
            preview_id = rendered["id"]
            pixels = client.get(
                prefix + "/operations/" + preview_id + "/preview", headers=HEADERS
            ).json()
            spec = client.get("/v1/providers/profiles", headers=HEADERS).json()["items"][0]
            for field in ["id", "revision", "paused_code"]:
                spec.pop(field)
            spec["capabilities"]["images"] = {"supported": True, "provenance": "USER_DECLARED"}
            assert (
                client.put(
                    "/v1/providers/profiles/local",
                    headers=HEADERS,
                    json={"spec": spec, "expected_revision": 1, "idempotency_key": "vision"},
                ).status_code
                == 200
            )
        calls = []
        cloud_calls = []

        def boundary(request):
            body = json.loads(request.content)
            if request.url.host != "127.0.0.1":
                cloud_calls.append(body)
                return httpx.Response(
                    200,
                    text=stream(
                        "openai",
                        json.dumps(
                            {
                                "claims": [
                                    {
                                        "text": "Controlled visual continuation",
                                        "kind": "visual_proposal",
                                        "evidence": [],
                                    }
                                ]
                            }
                        ),
                    ),
                )
            calls.append(body)
            claim = {
                "text": "Controlled interpretation",
                "kind": "visual_proposal" if scenario == "visual" else "general",
                "evidence": [],
            }
            if scenario == "historical_consent":
                evidence = json.loads(body["messages"][-1]["content"])["evidence"][0]
                claim.update(
                    kind="source",
                    evidence=[{"evidence_id": evidence["id"], "excerpt": evidence["excerpt"]}],
                )
            if scenario.startswith("length"):
                terminal = {"done": True, "done_reason": "length"}
                if scenario == "length":
                    terminal.update(prompt_eval_count=8, eval_count=512)
                return httpx.Response(
                    200,
                    text=json.dumps({"message": {"content": "unvalidated draft"}})
                    + "\n"
                    + json.dumps(terminal)
                    + "\n",
                )
            return httpx.Response(200, text=stream("ollama", json.dumps({"claims": [claim]})))

        app.state.services.providers.client = httpx.AsyncClient(
            transport=httpx.MockTransport(boundary)
        )
        conversation = client.post(
            prefix + "/conversations", headers=HEADERS, json={"idempotency_key": "registry"}
        ).json()
        prepared = client.post(
            prefix + "/conversations/" + conversation["id"] + "/runs",
            headers=HEADERS,
            json={
                "idempotency_key": "registry",
                "expected_revision": 0,
                "profile_id": "local",
                "question": "decisive finding",
                "context_tokens": 8192,
                "max_output_tokens": 512,
                "preview_operation_id": preview_id,
            },
        )
        assert prepared.status_code == 201, prepared.text
        run = prepared.json()
        from evidra.conversations.models import Answer

        preview = run["context"]
        assert run["prompt_version"] == "conversation-v2" and all(
            rule in preview["system"]
            for rule in [
                'Use kind="source" for claims drawn from supplied excerpts',
                "at least one supplied evidence ID with a literal excerpt",
                'Use kind="general" only for knowledge beyond those excerpts and set evidence=[]',
                'Use kind="visual_proposal" only when an image is supplied',
            ]
        )
        assert preview["schema_mode"] == (
            "native" if scenario == "native_schema" else "local_validation"
        )
        assert preview["output_schema"] == Answer.model_json_schema()
        path = prefix + "/runs/" + run["id"]
        if scenario == "text":
            historical = json.loads(json.dumps(run))
            del historical["context"]["schema_mode"], historical["context"]["output_schema"]
            with app.state.services.database.transaction() as connection:
                connection.execute(
                    "UPDATE conversation_runs SET payload=? WHERE id=?",
                    (json.dumps(historical), run["id"]),
                )
            assert client.get(path, headers=HEADERS).json()["context"]["schema_mode"] is None
            rejected = client.post(path + "/start", headers=HEADERS)
            assert rejected.status_code == 409 and "SCHEMA_PLAN_MISSING" in rejected.text
            assert not calls
            with app.state.services.database.transaction() as connection:
                assert (
                    json.loads(
                        connection.execute(
                            "SELECT payload FROM conversation_runs WHERE id=?", (run["id"],)
                        ).fetchone()[0]
                    )
                    == historical
                )
                connection.execute(
                    "UPDATE conversation_runs SET payload=? WHERE id=?",
                    (json.dumps(run), run["id"]),
                )
        if scenario == "monetary_cap":
            assert client.post(
                "/v1/providers/prices",
                headers=HEADERS,
                json={
                    "version": "v1",
                    "adapter": "ollama",
                    "model": "fixture",
                    "currency": "USD",
                    "source": "controlled fixture",
                    "input_per_million": "1",
                    "output_per_million": "1",
                    "effective_date": "2026-01-01",
                },
            ).status_code in [200, 201]
            assert (
                client.put(
                    prefix + "/provider-budgets",
                    headers=HEADERS,
                    json={
                        "kind": "call",
                        "identity": run["id"],
                        "currency": "USD",
                        "ceiling": "1",
                        "expected_revision": 0,
                        "idempotency_key": "cap",
                    },
                ).status_code
                == 200
            )
        started = client.post(path + "/start", headers=HEADERS)
        assert started.status_code == 200, started.text
        deadline = time.monotonic() + 4
        while time.monotonic() < deadline:
            result = client.get(path, headers=HEADERS).json()
            if result["state"] not in ["RUNNING", "PREPARED"]:
                break
            time.sleep(0.01)
        if scenario == "monetary_cap":
            assert result["state"] == "FAILED" and result["error"] == "TOKEN_BOUND_REQUIRED", result
            assert not calls
        elif scenario.startswith("length"):
            assert result["state"] == "FAILED" and result["error"] == "GENERATION_INCOMPLETE", (
                result
            )
            assert result["termination_reason"] == "length" and result["output"] is None
            ledger = client.get(
                prefix + "/provider-calls?offset=0&limit=50", headers=HEADERS
            ).json()["items"]
            assert len(calls) == len(ledger) == 1
            assert ledger[0]["error"] == "GENERATION_INCOMPLETE"
            assert (ledger[0]["state"], ledger[0]["input_tokens"], ledger[0]["output_tokens"]) == (
                ("CONFIRMED", 8, 512) if scenario == "length" else ("BILLING_UNKNOWN", None, None)
            )
            assert (
                '"kind":"complete"'
                not in client.get(path + "/events?cursor=0", headers=HEADERS).text
            )
        else:
            assert result["state"] == "COMPLETE", result
            assert calls[0]["messages"][0]["content"] == preview["system"]
            assert calls[0]["messages"][-1]["content"] == preview["prompt"]
            assert calls[0].get("format") == (
                preview["output_schema"] if scenario == "native_schema" else None
            )
            extra_schema = (
                json.dumps(preview["output_schema"]) if scenario == "native_schema" else ""
            )
            assert preview["estimated_input_tokens"] == len(
                (
                    preview["system"]
                    + extra_schema
                    + json.dumps(preview["history"], ensure_ascii=False)
                    + preview["prompt"]
                ).encode()
            ) + 512 + (4096 if pixels else 0)
            ledger = client.get(
                prefix + "/provider-calls?offset=0&limit=50", headers=HEADERS
            ).json()["items"]
            assert len(calls) == len(ledger) == 1 and ledger[0]["state"] == "CONFIRMED"
            assert ledger[0]["call_id"] == ledger[0]["job_id"] == run["id"]
            assert ledger[0]["session_id"] == conversation["id"] and ledger[0]["input_tokens"] == 8
            if pixels:
                assert calls[0]["messages"][-1]["images"] == [pixels["data_base64"]]
                assert result["visual"]["sha256"] == pixels["sha256"]
                assert result["visual"]["interpretation"] == "PROPOSED_REQUIRES_HUMAN_REVIEW"
                assert "images" in result["categories"]
                if scenario != "historical_consent":
                    assert result["anchor_status"] is None
            if scenario == "historical_consent":
                response = client.put(
                    "/v1/providers/profiles/cloud",
                    headers=HEADERS,
                    json={
                        "spec": profile_data("openai"),
                        "expected_revision": 0,
                        "idempotency_key": "cloud",
                    },
                )
                assert response.status_code == 200, response.text
                app.state.services.providers.secrets.set(
                    "cloud", "synthetic-only", memory_only=True
                )
                assert (
                    client.put(
                        "/v1/providers/settings",
                        headers=HEADERS,
                        json={
                            "block_paid_apis": False,
                            "expected_revision": 0,
                            "idempotency_key": "cloud",
                        },
                    ).status_code
                    == 200
                )
                assert (
                    client.put(
                        f"/v1/notebooks/{conversation['notebook_id']}/providers/cloud/consent",
                        headers=HEADERS,
                        json={
                            "granted": True,
                            "categories": ["history", "images", "metadata"],
                            "expected_revision": 0,
                            "profile_revision": 1,
                            "idempotency_key": "no-excerpts",
                        },
                    ).status_code
                    == 200
                )
                followup = client.post(
                    prefix + "/conversations/" + conversation["id"] + "/runs",
                    headers=HEADERS,
                    json={
                        "idempotency_key": "historical-visual",
                        "expected_revision": 1,
                        "profile_id": "cloud",
                        "question": "unmatchedterm",
                        "context_tokens": 16384,
                        "max_output_tokens": 512,
                        "preview_operation_id": preview_id,
                    },
                )
                assert followup.status_code == 201, followup.text
                historical = followup.json()
                assert historical["context"]["evidence"] == []
                assert (
                    result["output"]["claims"][0]["evidence"][0]["excerpt"]
                    in historical["context"]["history"][-1]["text"]
                )
                path = prefix + "/runs/" + historical["id"]
                rejected = client.post(path + "/start", headers=HEADERS)
                assert not cloud_calls, "Historical quotation was sent without excerpt consent"
                assert rejected.status_code == 403 and "CONSENT_REQUIRED" in rejected.text, (
                    rejected.text
                )
                assert client.get(path, headers=HEADERS).json()["state"] == "PREPARED"
                assert set(historical["categories"]) == {
                    "excerpts",
                    "metadata",
                    "history",
                    "images",
                }


def test_prepared_run_stream_promotes_only_verified_evidence_and_preserves_history(tmp_path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        _, _, prefix = indexed(client)
        profile(client)
        created = client.post(
            prefix + "/conversations", headers=HEADERS, json={"idempotency_key": "conversation"}
        )
        assert created.status_code == 201, created.text
        from evidra.providers.models import GenerationEvent

        async def generation(context, profile_id, request, cancel_event, **kwargs):
            allowed = json.loads(request.messages[-1].text)["evidence"][0]
            yield GenerationEvent(
                kind="delta",
                text=json.dumps(
                    {
                        "claims": [
                            {
                                "text": "A proposed conclusion",
                                "kind": "source",
                                "evidence": [
                                    {"evidence_id": allowed["id"], "excerpt": allowed["excerpt"]}
                                ],
                            }
                        ]
                    }
                ),
            )
            yield GenerationEvent(kind="final")

        app.state.services.providers.generate = generation
        conversation = created.json()
        prepare = client.post(
            prefix + "/conversations/" + conversation["id"] + "/runs",
            headers=HEADERS,
            json={
                "idempotency_key": "prepare",
                "expected_revision": 0,
                "profile_id": "local",
                "question": "decisive finding",
                "context_tokens": 8192,
                "max_output_tokens": 1024,
            },
        )
        assert prepare.status_code == 201, prepare.text
        run = prepare.json()
        assert run["state"] == "PREPARED" and run["context"]["documents_used"] == 1
        path = prefix + "/runs/" + run["id"]
        start = client.post(path + "/start", headers=HEADERS)
        assert start.status_code == 200, start.text
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            result = client.get(path, headers=HEADERS).json()
            if result["state"] not in ["RUNNING", "PREPARED"]:
                break
            time.sleep(0.01)
        assert result["state"] == "COMPLETE", result
        assert result["output"]["claims"][0]["kind"] == "source"
        events = client.get(path + "/events?cursor=0", headers=HEADERS)
        assert events.headers["content-type"].startswith("text/event-stream")
        assert '"kind":"draft"' in events.text and '"kind":"complete"' in events.text
        history = client.get(
            prefix + "/conversations/" + conversation["id"] + "/runs", headers=HEADERS
        ).json()
        assert history["total"] == 1 and history["items"][0]["id"] == run["id"]
        next_run = client.post(
            prefix + "/conversations/" + conversation["id"] + "/runs",
            headers=HEADERS,
            json={
                "idempotency_key": "history",
                "expected_revision": 1,
                "profile_id": "local",
                "question": "decisive",
                "context_tokens": 8192,
                "max_output_tokens": 1024,
            },
        )
        assert next_run.status_code == 201, next_run.text
        next_run = next_run.json()
        assert next_run["context"]["history_evidence_ids"] == [run["context"]["evidence"][0]["id"]]
        access = client.get(prefix + "/runs/" + next_run["id"] + "/access", headers=HEADERS).json()
        assert access["documents"] == [[run["context"]["evidence"][0]["source_id"], "SAMEKEY1"]]
        revoked = client.post(
            f"/v1/notebooks/{conversation['notebook_id']}/sources/{access['documents'][0][0]}/revoke",
            headers=HEADERS,
            json={
                "expected_revision": client.get(
                    f"/v1/notebooks/{conversation['notebook_id']}", headers=HEADERS
                ).json()["revision"]
            },
        )
        assert revoked.status_code == 200, revoked.text
        assert client.get(prefix + "/runs/" + next_run["id"], headers=HEADERS).status_code == 403
        cancelled = client.post(prefix + "/runs/" + next_run["id"] + "/cancel", headers=HEADERS)
        assert cancelled.status_code == 200 and set(cancelled.json()) == {"id", "state"}


@pytest.mark.parametrize(
    "failure", ["invented", "excerpt", "incomplete", "revoke", "cancel", "cleanup"]
)
def test_failed_stream_is_never_promoted_or_retried(tmp_path, failure):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, _, prefix = indexed(client)
        profile(client)
        conversation = client.post(
            prefix + "/conversations", headers=HEADERS, json={"idempotency_key": "conversation"}
        ).json()
        run = client.post(
            prefix + "/conversations/" + conversation["id"] + "/runs",
            headers=HEADERS,
            json={
                "idempotency_key": "prepare",
                "expected_revision": 0,
                "profile_id": "local",
                "question": "decisive finding",
                "context_tokens": 8192,
                "max_output_tokens": 100,
            },
        ).json()
        from evidra.domain.errors import EvidraError
        from evidra.providers.models import GenerationEvent

        calls = []

        async def generation(context, profile_id, request, cancel_event, **kwargs):
            calls.append(kwargs["identity"].call_id)
            value = run["context"]["evidence"][0]
            yield GenerationEvent(
                kind="delta",
                text=json.dumps(
                    {
                        "claims": [
                            {
                                "text": "claim",
                                "kind": "source",
                                "evidence": [
                                    {
                                        "evidence_id": "fabricated"
                                        if failure == "invented"
                                        else value["id"],
                                        "excerpt": "invented quotation"
                                        if failure == "excerpt"
                                        else value["excerpt"],
                                    }
                                ],
                            }
                        ]
                    }
                ),
            )
            if failure == "revoke":
                app.state.services.scopes.revoke_access(value["source_id"], notebook_id=notebook)
            if failure == "cancel":
                await asyncio.sleep(10)
            if failure != "incomplete":
                yield GenerationEvent(kind="final")
            if failure == "cleanup":
                raise EvidraError("PROVIDER_CLEANUP_FAILED", "fixture cleanup failure")

        app.state.services.providers.generate = generation
        path = prefix + "/runs/" + run["id"]
        assert client.post(path + "/start", headers=HEADERS).status_code == 200
        if failure == "cancel":
            assert client.post(path + "/cancel", headers=HEADERS).status_code == 200
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            with app.state.services.database.transaction() as connection:
                result = json.loads(
                    connection.execute(
                        "SELECT payload FROM conversation_runs WHERE id=?", (run["id"],)
                    ).fetchone()[0]
                )
            if result["state"] != "RUNNING":
                break
            time.sleep(0.01)
        assert result["state"] in ["FAILED", "CANCELLED"], result
        assert result["output"] is None
        if failure == "revoke":
            assert client.get(path, headers=HEADERS).status_code == 403
        else:
            assert client.post(path + "/start", headers=HEADERS).json()["state"] == result["state"]
        assert calls == [run["id"]]


def test_exact_vectors_filter_before_topk_and_reject_generation_mismatch(tmp_path):
    import numpy as np

    from evidra.conversations.models import VectorGeneration
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import EmbeddingBatch

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, prefix = indexed(client)
        _, _, foreign = indexed(client, key="foreign", item_key="FOREIGN1")
        profile(client)
        allowed = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "decisive"}
        ).json()["items"][0]["evidence_id"]
        forbidden = client.post(
            foreign + "/search", headers=HEADERS, json={"query": "decisive"}
        ).json()["items"][0]["evidence_id"]
        generation = VectorGeneration(
            id="generation",
            profile_id="local",
            model="fixture",
            digest="v1",
            dimensions=2,
            normalized=True,
            chunks=2,
        )
        services = app.state.services
        with services.database.transaction() as connection:
            connection.execute(
                "INSERT INTO vector_generations VALUES(?,?,?,?,?,?,1)",
                (generation.id, notebook, snap["id"], "local", 1, generation.model_dump_json()),
            )
            connection.execute(
                "INSERT INTO vector_blocks VALUES(?,?,?)",
                (generation.id, 0, np.array([[0, 1], [1, 0]], dtype="<f4").tobytes()),
            )
            connection.executemany(
                "INSERT INTO vector_members VALUES(?,?,?,?)",
                [(generation.id, allowed, 0, 0), (generation.id, forbidden, 0, 1)],
            )
        context = services.scopes.resolve(services.scopes.principal, notebook, snap["id"])
        batch = EmbeddingBatch(
            model="fixture", digest="v1", dimensions=2, normalized=True, vectors=[[1, 0]]
        )
        assert services.vectors.search_batch(context, "local", batch, limit=1) == [allowed]
        for bad in [
            batch.model_copy(update={"digest": "v2"}),
            batch.model_copy(update={"dimensions": 3, "vectors": [[1, 0, 0]]}),
        ]:
            with pytest.raises(EvidraError) as error:
                services.vectors.search_batch(context, "local", bad)
            assert error.value.code == "VECTOR_MISMATCH"


def test_context_limits_are_explicit_and_complete_history_is_not_truncated(tmp_path):
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import SchemaPlan
    from evidra.retrieval.context import SYSTEM, build_context

    plan = SchemaPlan(system=SYSTEM, output_schema={}, mode="native")

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, prefix = indexed(client)
        hit = client.post(prefix + "/search", headers=HEADERS, json={"query": "decisive"}).json()[
            "items"
        ][0]["evidence_id"]
        services = app.state.services
        context = services.scopes.resolve(services.scopes.principal, notebook, snap["id"])
        evidence = services.evidence.read(context, hit)
        candidates = [
            evidence.model_copy(update={"id": str(i), "document_version_id": str(i)})
            for i in range(15)
        ]
        preview = build_context("question", candidates, [], 20000, 100, plan)
        assert len(preview.evidence) == 12 and preview.excluded_limit == 3
        assert preview.documents_used == 12 and preview.documents_retrieved == 15
        bounded = build_context("question", candidates, [], 2000, 100, plan)
        assert bounded.excluded_budget > 0
        assert bounded.estimated_input_tokens + 100 <= 2000
        with pytest.raises(EvidraError) as error:
            build_context(
                "question", candidates, [{"role": "user", "text": "x" * 5000}], 2000, 100, plan
            )
        assert error.value.code == "CONTEXT_LIMIT"


def test_embedding_rebuild_keeps_previous_atomic_generation_on_late_failure(tmp_path):
    from evidra.providers.models import EmbeddingBatch

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snap, prefix = indexed(client, text="decisive finding " * 3000)
        profile(client)
        spec = client.get("/v1/providers/profiles", headers=HEADERS).json()["items"][0]
        for field in ["id", "revision", "paused_code"]:
            spec.pop(field)
        spec["purpose"] = "embedding"
        spec["capabilities"]["embeddings"] = {"supported": True, "provenance": "USER_DECLARED"}
        assert (
            client.put(
                "/v1/providers/profiles/local",
                headers=HEADERS,
                json={"expected_revision": 1, "idempotency_key": "embedding", "spec": spec},
            ).status_code
            == 200
        )
        calls = []
        failing = False

        async def embed(context, profile_id, texts):
            calls.append(len(texts))
            return EmbeddingBatch(
                model="fixture",
                digest="changed" if failing and len(calls) > 1 else "v1",
                dimensions=2,
                normalized=True,
                vectors=[[1, 0] for _ in texts],
            )

        app.state.services.providers.embed = embed

        def build(key):
            created = client.post(
                prefix + "/vectors",
                headers=HEADERS,
                json={"profile_id": "local", "idempotency_key": key},
            )
            assert created.status_code == 202, created.text
            deadline = time.monotonic() + 4
            while time.monotonic() < deadline:
                job = client.get(
                    prefix + "/vectors/" + created.json()["id"], headers=HEADERS
                ).json()
                if job["state"] != "RUNNING":
                    return job
                time.sleep(0.01)
            pytest.fail("Embedding build did not finish")

        original = build("one")
        assert original["state"] == "COMPLETE" and len(calls) > 1, original
        calls.clear()
        failing = True
        failed = build("two")
        assert failed["state"] == "FAILED" and failed["error"] == "VECTOR_MISMATCH", failed
        with app.state.services.database.transaction() as connection:
            active = connection.execute(
                "SELECT id FROM vector_generations WHERE active=1"
            ).fetchall()
        assert [r[0] for r in active] == [original["id"]]
        context = app.state.services.scopes.resolve(
            app.state.services.scopes.principal, notebook, snap["id"]
        )
        assert app.state.services.vectors.search_batch(
            context,
            "local",
            EmbeddingBatch(
                model="fixture", digest="v1", dimensions=2, normalized=True, vectors=[[1, 0]]
            ),
        )
