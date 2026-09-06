"""Real SQLite/HTTP evidence for scope membership, revocation and immutable capture."""

from dataclasses import replace
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from hypothesis import given
from hypothesis import strategies as st
from test_runtime_notebooks import HEADERS, make_app


def source(key="SAMEKEY1", library=1, version="1", **fields):
    return dict(
        identity=dict(profile_instance_id="profile-a", library_id=library, item_key=key),
        version=version,
        title=key,
        year=2020,
        item_type="journalArticle",
        tags=["a", "b"],
        contents=[dict(key=key + "PDF", kind="pdf", role="unassigned")],
        **fields,
    )


def setup(client):
    notebook = client.post(
        "/v1/notebooks", headers=HEADERS, json=dict(name="Review", idempotency_key="n")
    ).json()
    return notebook["id"]


def sync(client, notebook, sources, *, purpose="selection", stage_id=None, final=True):
    return client.post(
        f"/v1/notebooks/{notebook}/sources/sync",
        headers=HEADERS,
        json={"items": sources, "purpose": purpose, "stage_id": stage_id, "final": final},
    )


def capture(client, notebook, sources, spec=None, key="snapshot", revision=1):
    synced = sync(client, notebook, sources)
    assert synced.status_code == 200, "source sync must be implemented"
    preview = client.post(
        f"/v1/notebooks/{notebook}/sources/preview",
        headers=HEADERS,
        json={
            "selection": spec or {},
            "stage_id": synced.json()["stage_id"],
        },
    )
    assert preview.status_code == 200, preview.text
    request = dict(preview_id=preview.json()["id"], expected_revision=revision, idempotency_key=key)
    response = client.post(f"/v1/notebooks/{notebook}/snapshots", headers=HEADERS, json=request)
    assert response.status_code == 201, response.text
    return response.json(), preview.json(), request


def test_snapshot_intersection_forgery_and_guarded_commit(tmp_path: Path):
    from evidra.domain.errors import EvidraError

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        snap, preview, request = capture(client, notebook, [source(), source(library=2)])
        assert len({s["id"] for s in preview["items"]}) == 2
        foreign = source() | {
            "identity": source()["identity"] | {"profile_instance_id": "profile-b"}
        }
        assert sync(client, notebook, [foreign]).status_code == 403
        assert (
            client.post(f"/v1/notebooks/{notebook}/snapshots", headers=HEADERS, json=request).json()
            == snap
        )
        scopes = app.state.services.scopes
        with pytest.raises(EvidraError) as error:
            scopes.resolve(
                replace(scopes.principal, profile_instance_id="profile-b"), notebook, snap["id"]
            )
        assert error.value.code == "FORBIDDEN"
        context = scopes.resolve(scopes.principal, notebook, snap["id"])
        ids = sorted(context.source_ids)
        with scopes.guarded(context, source_id=ids[0]) as connection:
            assert connection.execute("SELECT COUNT(*) FROM snapshot_members").fetchone()[0] == 2
        with pytest.raises(EvidraError) as error:
            with scopes.guarded(replace(context, source_ids=frozenset({"forged"}))):
                pytest.fail("forged context entered transaction")
        assert error.value.code == "FORBIDDEN"
        other = client.post(
            "/v1/notebooks", headers=HEADERS, json=dict(name="Other", idempotency_key="other")
        ).json()["id"]
        assert (
            client.get(
                f"/v1/notebooks/{other}/snapshots/{snap['id']}/sources", headers=HEADERS
            ).status_code
            == 404
        )
        with pytest.raises(EvidraError) as error:
            with scopes.guarded(context, source_id="forged-evidence-source"):
                pytest.fail("foreign source entered transaction")
        assert error.value.code == "SOURCE_REVOKED"
        scopes.revoke_access(ids[0], notebook_id=notebook)
        with pytest.raises(EvidraError) as error:
            scopes.assert_current(context)
        assert error.value.code == "SCOPE_STALE"
        page = client.get(
            f"/v1/notebooks/{notebook}/snapshots/{snap['id']}/sources", headers=HEADERS
        ).json()
        assert [s["source"]["id"] for s in page["items"]] == [ids[1]]
        assert page["unavailable_count"] == 1
        # Revalidation restores availability, never a removed notebook grant.
        denied = sync(client, notebook, [source(), source(library=2)], purpose="revalidation")
        assert denied.status_code == 403
        assert scopes.resolve(scopes.principal, notebook, snap["id"]).source_ids == {ids[1]}
        with scopes.database.transaction() as connection:
            with pytest.raises(Exception, match="immutable"):
                connection.execute(
                    "DELETE FROM snapshot_members WHERE snapshot_id=?", (snap["id"],)
                )


def test_filters_versions_delta_and_stale_preview(tmp_path: Path):
    from evidra.domain.errors import EvidraError

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        excluded = dict(profile_instance_id="profile-a", library_id=1, item_key="EXCLUDE1")
        snap, preview, _ = capture(
            client,
            notebook,
            [source(), source(), source("EXCLUDE1"), source("OLDKEY01") | {"year": 1990}],
            {"year_min": 2000, "tags": ["a", "b"], "tag_mode": "AND", "exclusions": [excluded]},
        )
        assert [s["identity"]["item_key"] for s in preview["items"]] == ["SAMEKEY1"]
        assert {r["reason"] for r in preview["removed"]} == {"excluded", "year"}
        scopes = app.state.services.scopes
        context = scopes.resolve(scopes.principal, notebook, snap["id"])
        updated = source(version="2") | {"title": "Revised title"}
        synced = sync(client, notebook, [updated, source("OLDKEY01") | {"year": 1990}]).json()
        with pytest.raises(EvidraError) as error:
            scopes.assert_current(context)
        assert error.value.code == "SCOPE_STALE"
        page = client.get(
            f"/v1/notebooks/{notebook}/snapshots/{snap['id']}/sources", headers=HEADERS
        ).json()
        assert page["items"][0]["source"]["title"] == "SAMEKEY1"
        assert page["items"][0]["state"] == "stale"
        preview = client.post(
            f"/v1/notebooks/{notebook}/sources/preview",
            headers=HEADERS,
            json={
                "selection": {"year_min": 2000},
                "stage_id": synced["stage_id"],
            },
        ).json()
        assert preview["changed"] == [synced["items"][0]["id"]]
        # Filtered candidates also bind the preview; a newly eligible item needs a new preview.
        refreshed = sync(
            client,
            notebook,
            [source("OLDKEY01", version="2") | {"year": 2025}],
            purpose="revalidation",
            stage_id=synced["stage_id"],
        )
        assert refreshed.status_code == 200
        stale = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json=dict(
                preview_id=preview["id"], expected_revision=2, idempotency_key="filtered-changed"
            ),
        )
        assert stale.status_code == 409
        scopes.revoke_access(synced["items"][0]["id"])
        response = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json=dict(preview_id=preview["id"], expected_revision=2, idempotency_key="next"),
        )
        assert response.status_code in {404, 409}
        assert (
            client.get(
                f"/v1/notebooks/{notebook}/snapshots/{snap['id']}/sources", headers=HEADERS
            ).json()["items"]
            == []
        )


def test_content_opt_in_and_current_content_authorization(tmp_path: Path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        original = source() | {
            "contents": [
                dict(key="P", kind="pdf", role="unassigned"),
                dict(key="N", kind="human_note", role="unassigned"),
                dict(key="AI", kind="ai_artifact", role="unassigned"),
            ]
        }
        snap, preview, _ = capture(client, notebook, [original])
        assert [c["key"] for c in preview["items"][0]["contents"]] == ["P"]
        next_snap, preview, _ = capture(
            client, notebook, [original], {"include_notes": True}, "notes", 2
        )
        assert [c["key"] for c in preview["items"][0]["contents"]] == ["P", "N"]
        capture(client, notebook, [original], {}, "notes-off", 3)
        historical = client.get(
            f"/v1/notebooks/{notebook}/snapshots/{next_snap['id']}/sources", headers=HEADERS
        ).json()
        assert [c["key"] for c in historical["items"][0]["source"]["contents"]] == ["P"]
        sync(
            client,
            notebook,
            [original | {"contents": [original["contents"][0]]}],
            purpose="revalidation",
        )
        page = client.get(
            f"/v1/notebooks/{notebook}/snapshots/{next_snap['id']}/sources", headers=HEADERS
        ).json()
        assert [c["key"] for c in page["items"][0]["source"]["contents"]] == ["P"]


def test_restart_requires_native_preflight_without_resurrecting_grants(tmp_path: Path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        snap, preview, _ = capture(client, notebook, [source(), source(library=2)])
        app.state.services.scopes.revoke_access(preview["items"][0]["id"], notebook_id=notebook)
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        path = f"/v1/notebooks/{notebook}/snapshots/{snap['id']}"
        assert client.get(path + "/sources", headers=HEADERS).json()["items"] == []
        identities = client.get(path + "/identities", headers=HEADERS)
        assert identities.status_code == 200
        assert identities.json()["items"] == [
            dict(profile_instance_id="profile-a", library_id=2, item_key="SAMEKEY1")
        ]
        sync(client, notebook, [source(library=2)], purpose="revalidation")
        page = client.get(path + "/sources", headers=HEADERS).json()
        assert [s["source"]["identity"]["library_id"] for s in page["items"]] == [2]
        assert (
            client.get(
                path + "/identities", headers=HEADERS | {"X-Evidra-Client": "mcp"}
            ).status_code
            == 403
        )


def test_explicit_attachment_roles_and_revision_conflicts(tmp_path: Path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        original = source() | {"contents": [dict(key="P", kind="pdf"), dict(key="S", kind="pdf")]}
        roles = [
            {"identity": original["identity"], "key": "P", "role": "principal"},
            {"identity": original["identity"], "key": "S", "role": "supplement"},
        ]
        snap, preview, request = capture(client, notebook, [original], {"attachment_roles": roles})
        assert [c["role"] for c in preview["items"][0]["contents"]] == ["principal", "supplement"]
        conflict = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json=request | {"expected_revision": 2},
        )
        assert conflict.status_code == 409
        duplicate = roles + [{"identity": original["identity"], "key": "S", "role": "principal"}]
        invalid = client.post(
            f"/v1/notebooks/{notebook}/sources/preview",
            headers=HEADERS,
            json={
                "selection": {"attachment_roles": duplicate},
                "stage_id": preview["stage_id"],
            },
        )
        assert invalid.status_code == 422
        prior_role = original | {
            "contents": [dict(key="P", kind="pdf", role="principal"), dict(key="S", kind="pdf")]
        }
        staged = sync(client, notebook, [prior_role]).json()
        conflict = client.post(
            f"/v1/notebooks/{notebook}/sources/preview",
            headers=HEADERS,
            json={
                "stage_id": staged["stage_id"],
                "selection": {
                    "attachment_roles": [
                        {"identity": original["identity"], "key": "S", "role": "principal"}
                    ]
                },
            },
        )
        assert conflict.status_code == 422


@given(st.integers(min_value=1, max_value=100000), st.integers(min_value=1, max_value=100000))
def test_compound_identity_property(left, right):
    from evidra.domain.sources import SourceIdentity

    a = SourceIdentity(profile_instance_id="p1", library_id=left, item_key="SAMEKEY1")
    b = SourceIdentity(profile_instance_id="p2", library_id=right, item_key="SAMEKEY1")
    assert a.source_id != b.source_id
    assert (a.source_id == a.model_copy(update={"library_id": right}).source_id) == (left == right)


def test_library_revocation_never_restores_unvalidated_sources_or_aba_contexts(tmp_path: Path):
    from evidra.domain.errors import EvidraError

    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        first = setup(client)
        second = client.post(
            "/v1/notebooks", headers=HEADERS, json=dict(name="Second", idempotency_key="second")
        ).json()["id"]
        capture(client, first, [source("FIRST001")])
        snap, _, _ = capture(client, second, [source("SECOND01")])
        scopes = app.state.services.scopes
        context = scopes.resolve(scopes.principal, second, snap["id"], capability="commit")
        client.post(
            "/v1/sources/invalidate",
            headers=HEADERS,
            json={"identities": [source("FIRST001")["identity"]], "reason": "archived"},
        )
        sync(client, first, [source("FIRST001")], purpose="revalidation")
        assert scopes.resolve(scopes.principal, second, snap["id"]).source_ids == set()
        sync(client, second, [source("SECOND01")], purpose="revalidation")
        with pytest.raises(EvidraError) as error:
            with scopes.guarded(context, capability="commit"):
                pytest.fail("pre-revocation computation was permitted to commit after restoration")
        assert error.value.code == "SCOPE_STALE"


def test_selection_staging_is_session_notebook_version_and_batch_bound(tmp_path: Path):
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook = setup(client)
        other = client.post(
            "/v1/notebooks", headers=HEADERS, json=dict(name="Other", idempotency_key="other")
        ).json()["id"]
        first = source() | {"contents": [dict(key="ONLYPDF2", kind="pdf")]}
        result = client.post(
            f"/v1/notebooks/{notebook}/sources/sync",
            headers=HEADERS,
            json={"items": [first], "purpose": "selection", "stage_id": None, "final": False},
        )
        assert result.status_code == 200, "explicit selection staging is missing"
        staged = result.json()
        request = {
            "selection": {},
            "stage_id": staged["stage_id"],
        }
        path = f"/v1/notebooks/{notebook}/sources/preview"
        assert client.post(path, headers=HEADERS, json=request).status_code == 409
        result = client.post(
            f"/v1/notebooks/{notebook}/sources/sync",
            headers=HEADERS,
            json={
                "items": [source("SECOND01")],
                "purpose": "selection",
                "stage_id": staged["stage_id"],
                "final": True,
            },
        )
        assert result.status_code == 200
        preview = client.post(path, headers=HEADERS, json=request)
        assert preview.status_code == 200
        old_preview = preview.json()["id"]
        # A replacement preview supersedes its predecessor even within one completed stage.
        replacement = client.post(path, headers=HEADERS, json=request)
        assert replacement.status_code == 200
        superseded = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json={
                "preview_id": old_preview,
                "expected_revision": 1,
                "idempotency_key": "old-preview",
            },
        )
        assert superseded.status_code == 404
        old_preview = replacement.json()["id"]
        # A source hash known from another notebook is not selection authority.
        own_empty = client.post(
            f"/v1/notebooks/{other}/sources/sync",
            headers=HEADERS,
            json={"items": [], "purpose": "selection", "stage_id": None, "final": True},
        ).json()
        forged = client.post(
            f"/v1/notebooks/{other}/sources/preview",
            headers=HEADERS,
            json=request
            | {"stage_id": own_empty["stage_id"], "source_ids": [staged["items"][0]["id"]]},
        )
        assert forged.status_code == 422
        wrong_notebook = client.post(
            f"/v1/notebooks/{other}/sources/preview", headers=HEADERS, json=request
        )
        assert wrong_notebook.status_code == 409
        preflight = client.post(
            f"/v1/notebooks/{other}/sources/sync",
            headers=HEADERS,
            json={"items": [first], "purpose": "revalidation", "stage_id": None, "final": True},
        )
        assert preflight.status_code == 403
        # A legitimate broader native selection elsewhere cannot widen the child-only stage.
        broader = first | {
            "contents": [dict(key="ONLYPDF2", kind="pdf"), dict(key="OTHERPDF", kind="pdf")]
        }
        client.post(
            f"/v1/notebooks/{other}/sources/sync",
            headers=HEADERS,
            json={"items": [broader], "purpose": "selection", "stage_id": None, "final": True},
        )
        assert client.post(path, headers=HEADERS, json=request).status_code == 409
        empty = client.post(
            f"/v1/notebooks/{notebook}/sources/sync",
            headers=HEADERS,
            json={"items": [], "purpose": "selection", "stage_id": None, "final": True},
        ).json()
        latest_request = {"selection": {}, "stage_id": empty["stage_id"]}
        empty_preview = client.post(path, headers=HEADERS, json=latest_request).json()
        assert client.post(path, headers=HEADERS, json=request).status_code == 409
        stale = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json={
                "preview_id": old_preview,
                "expected_revision": 1,
                "idempotency_key": "superseded",
            },
        )
        assert stale.status_code == 404
    with TestClient(make_app(tmp_path, [0.0]), base_url="http://127.0.0.1:49200") as client:
        assert client.post(path, headers=HEADERS, json=latest_request).status_code == 409
        old_empty = client.post(
            f"/v1/notebooks/{notebook}/snapshots",
            headers=HEADERS,
            json={
                "preview_id": empty_preview["id"],
                "expected_revision": 1,
                "idempotency_key": "old-empty",
            },
        )
        assert old_empty.status_code in {404, 409}
