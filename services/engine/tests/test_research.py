"""Research persistence and real scoped HTTP boundaries with controlled model transport."""

from fastapi.testclient import TestClient
from test_matrix import setup
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
