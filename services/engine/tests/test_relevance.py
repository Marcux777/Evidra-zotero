"""Relevance triage: natural-language lexical recall and compact research model inputs."""

import json

from fastapi.testclient import TestClient
from pdf_fixtures import pdf_bytes
from test_conversations import profile
from test_documents import document_scope, finished, ingest, register
from test_runtime_notebooks import HEADERS, make_app

from evidra.retrieval.lexical import fts_query

WORDS = (
    "Our agent is evaluated on Atari benchmark environments using five random seeds and "
    "reports the median human normalized score with a confidence interval over the runs "
)


def paper_pdf(path, pages=8, lines=30):
    """Several full pages of verified per-character geometry, like a real article."""
    text = (WORDS * 400).split(" ")
    body, cursor = [], 0
    for _ in range(pages):
        page = []
        for row in range(lines):
            line = " ".join(text[cursor : cursor + 9])
            cursor += 9
            page.append((20, 480 - 15 * row, line))
        body.append({"lines": page})
    path.write_bytes(pdf_bytes(body))


def indexed_paper(client, tmp_path, **kwargs):
    path = tmp_path / "paper.pdf"
    paper_pdf(path, **kwargs)
    notebook, snap, preview, prefix = document_scope(client)
    registered = register(client, prefix, preview["items"][0]["id"], path)
    result = finished(client, prefix, ingest(client, prefix, registered))
    assert result["state"] == "COMPLETE", result
    return prefix, preview["items"][0]["id"]


def test_fts_query_keeps_content_terms_phrases_and_quotes_every_token():
    assert fts_query("Which benchmark environments were used?") == (
        '"benchmark" OR "environments" OR "used"'
    )
    assert fts_query("O que o estudo informa sobre método?") == '"método"'
    assert fts_query('"random seeds" per run', "all") == '"random seeds" AND "per" AND "run"'
    # Only function words: keep them rather than silently searching nothing.
    assert fts_query("what is the") == '"what" OR "is" OR "the"'
    # Syntax is data: FTS operators and quotes never escape their quoted token.
    assert fts_query('" OR *; DROP TABLE x; --') == '"drop" OR "table" OR "x"'
    assert fts_query("?!") == ""


def test_natural_question_retrieves_content_terms_and_all_mode_stays_strict(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _ = indexed_paper(client, tmp_path, pages=1, lines=3)
        question = "Which benchmark environments were used for the evaluation of agents?"
        natural = client.post(prefix + "/search", headers=HEADERS, json={"query": question})
        assert natural.status_code == 200, natural.text
        assert natural.json()["total"] >= 1
        assert "benchmark" in natural.json()["items"][0]["excerpt"]
        strict = client.post(
            prefix + "/search", headers=HEADERS, json={"query": question, "match": "all"}
        ).json()
        # "used" and "agents" do not occur literally; all-terms mode keeps AND semantics.
        assert strict["total"] == 0
        phrase = client.post(
            prefix + "/search",
            headers=HEADERS,
            json={"query": '"random seeds" median', "match": "all"},
        ).json()
        assert phrase["total"] >= 1


def screening_protocol(client, prefix):
    fields = client.get(prefix + "/forms/template", headers=HEADERS).json()
    form = client.post(
        prefix + "/forms",
        headers=HEADERS,
        json={
            "name": "Relevance",
            "fields": fields[:1],
            "expected_revision": 0,
            "idempotency_key": "form",
        },
    ).json()
    response = client.post(
        prefix + "/protocols",
        headers=HEADERS,
        json={
            "question": "Which deep RL agents can be reused?",
            "objective": "Select reusable Atari agents",
            "review_type": "EXPLORATORY",
            "form_version_id": form["id"],
            "criteria": [
                {"id": "atari", "text": "Atari", "kind": "INCLUSION", "applicability": "BOTH"}
            ],
            "expected_revision": 0,
            "idempotency_key": "protocol",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_full_text_screening_sends_compact_evidence_that_fits_default_context(tmp_path):
    """Per-character geometry once made every real mapped PDF exceed the prompt envelope."""
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, source_id = indexed_paper(client, tmp_path)
        protocol = screening_protocol(client, prefix)
        profile(client)
        hit = client.post(prefix + "/search", headers=HEADERS, json={"query": "Atari"}).json()
        stored = client.get(prefix + "/evidence/" + hit["items"][0]["evidence_id"], headers=HEADERS)
        rectangles = len(stored.json()["rectangles"])
        assert rectangles > 100, "fixture must carry verified geometry"
        response = client.post(
            prefix + "/research/runs",
            headers=HEADERS,
            json={
                "kind": "SCREENING",
                "protocol_version_id": protocol["id"],
                "profile_id": "local",
                "source_id": source_id,
                "stage": "FULL_TEXT",
                "question": protocol["question"],
                "idempotency_key": "full-text",
            },
        )
        assert response.status_code == 201, response.text
        preview = client.get(
            prefix + "/research/runs/" + response.json()["id"] + "/preview", headers=HEADERS
        ).json()
        prompt = json.loads(preview["prompt"])
        evidence = prompt["inputs"]["evidence"]
        assert len(evidence) == preview["inputs"]["coverage"]["evidence_chunks"] >= 8
        assert set(evidence[0]) == {
            "id",
            "source_id",
            "source_kind",
            "content_key",
            "document_version_id",
            "page_index",
            "page_label",
            "historical",
            "excerpt",
        }
        assert all(e["rectangles"] == [] for e in preview["inputs"]["evidence"])
        assert preview["estimated_input_tokens"] + 4096 <= 32768
        # Navigation still reopens the stored geometry by evidence ID.
        again = client.get(prefix + "/evidence/" + evidence[0]["id"], headers=HEADERS).json()
        assert again["rectangles"] and again["precision"] == "rectangles"


def test_backup_with_compact_research_inputs_still_imports(tmp_path):
    """Prepared inputs omit geometry; the backup must still verify them as original."""
    from test_exports import export, upload

    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, source_id = indexed_paper(client, tmp_path, pages=2, lines=10)
        protocol = screening_protocol(client, prefix)
        profile(client)
        response = client.post(
            prefix + "/research/runs",
            headers=HEADERS,
            json={
                "kind": "SCREENING",
                "protocol_version_id": protocol["id"],
                "profile_id": "local",
                "source_id": source_id,
                "stage": "FULL_TEXT",
                "question": protocol["question"],
                "idempotency_key": "full-text",
            },
        )
        assert response.status_code == 201, response.text
        archive, _, _ = export(client, prefix, "backup")
        inspected = upload(client, prefix, archive)
        assert inspected.status_code == 201, inspected.text
        # Integrity-valid archives that differ only in the nested excerpt are refused by the
        # nested-evidence check itself; the same rebuild without the change is accepted.
        import hashlib
        import io
        import zipfile

        def rebuild(forge):
            with zipfile.ZipFile(io.BytesIO(archive)) as opened:
                notebook = json.loads(opened.read("notebook.json"))
                manifest = json.loads(opened.read("manifest.json"))
            if forge:
                for record in notebook["records"]:
                    if record["kind"] == "research_preview":
                        record["data"]["inputs"]["evidence"][0]["excerpt"] += " forged"
            data = json.dumps(notebook).encode()
            for entry in manifest["files"]:
                if entry["path"] == "notebook.json":
                    entry["bytes"], entry["sha256"] = len(data), hashlib.sha256(data).hexdigest()
            out = io.BytesIO()
            with zipfile.ZipFile(out, "w") as written:
                written.writestr("manifest.json", json.dumps(manifest))
                written.writestr("notebook.json", data)
            return out.getvalue()

        control = upload(client, prefix, rebuild(False))
        assert control.status_code == 201, control.text
        rejected = upload(client, prefix, rebuild(True))
        assert rejected.status_code == 422, rejected.text
        assert rejected.json()["code"] == "INVALID_BACKUP", rejected.text


def test_request_saved_before_new_optional_fields_replays_idempotently(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _ = indexed_paper(client, tmp_path, pages=1, lines=2)
        field = client.get(prefix + "/forms/template", headers=HEADERS).json()[0]
        field.pop("search_terms")  # a client of the previous contract never sends it
        body = {"name": "Old", "fields": [field], "expected_revision": 0, "idempotency_key": "f"}
        first = client.post(prefix + "/forms", headers=HEADERS, json=body)
        assert first.status_code == 201, first.text
        # Rewrite the stored request as the previous contract serialized it.
        with app.state.services.database.transaction() as conn:
            stored = json.loads(conn.execute("SELECT request FROM form_versions").fetchone()[0])
            for value in stored["fields"]:
                value.pop("search_terms")
            conn.execute(
                "UPDATE form_versions SET request=?",
                (json.dumps(stored, sort_keys=True, ensure_ascii=False),),
            )
        replay = client.post(prefix + "/forms", headers=HEADERS, json=body)
        assert replay.status_code == 201 and replay.json()["id"] == first.json()["id"]
        changed = client.post(prefix + "/forms", headers=HEADERS, json=body | {"name": "Changed"})
        assert changed.status_code == 409 and changed.json()["code"] == "IDEMPOTENCY_CONFLICT"


def test_query_and_search_term_bounds_are_explicit(tmp_path):
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, _ = indexed_paper(client, tmp_path, pages=1, lines=2)
        many = " ".join(f"term{i}" for i in range(65))
        for match in ["any", "all"]:
            refused = client.post(
                prefix + "/search", headers=HEADERS, json={"query": many, "match": match}
            )
            assert refused.status_code == 422 and refused.json()["code"] == "QUERY_TOO_COMPLEX"
        field = client.get(prefix + "/forms/template", headers=HEADERS).json()[0]
        # Twenty individually valid 100-character terms exceed only the query length.
        for terms in [['alpha"beta'], [" "], [chr(97 + i) * 100 for i in range(20)]]:
            response = client.post(
                prefix + "/forms",
                headers=HEADERS,
                json={
                    "name": "Bounds",
                    "fields": [field | {"search_terms": terms}],
                    "expected_revision": 0,
                    "idempotency_key": "bounds-" + str(len(terms)) + terms[0][:3],
                },
            )
            assert response.status_code == 422, (terms[:1], response.text)
