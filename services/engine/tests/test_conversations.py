"""Task6 consumer invariants, using real SQLite evidence and controlled provider events."""

import asyncio
import hashlib
import json
import time

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
    from evidra.retrieval.context import build_context

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
        preview = build_context("question", candidates, [], 20000, 100, "{}")
        assert len(preview.evidence) == 12 and preview.excluded_limit == 3
        assert preview.documents_used == 12 and preview.documents_retrieved == 15
        bounded = build_context("question", candidates, [], 2000, 100, "{}")
        assert bounded.excluded_budget > 0
        assert bounded.estimated_input_tokens + 100 <= 2000
        with pytest.raises(EvidraError) as error:
            build_context(
                "question", candidates, [{"role": "user", "text": "x" * 5000}], 2000, 100, "{}"
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
