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
