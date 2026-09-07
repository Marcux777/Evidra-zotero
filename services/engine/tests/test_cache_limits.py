"""Real SQLite eviction: only reconstructible images/references may disappear."""

import importlib.util

import pytest
from fastapi.testclient import TestClient
from test_exports import decision_fixture
from test_runtime_notebooks import make_app


def test_derived_lru_budget_preserves_originals_decisions_and_recent_images(tmp_path, monkeypatch):
    assert importlib.util.find_spec("evidra.storage.cache") is not None, (
        "byte-bounded derived LRU is missing"
    )
    from evidra.storage import database as storage
    from evidra.storage.cache import CacheLimits, prune_derived, remember_preview

    monkeypatch.setattr(storage, "SCHEMA_VERSION", 14)
    app = make_app(tmp_path, [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        prefix, *_ = decision_fixture(client)
        notebook, snapshot = prefix.split("/")[3], prefix.split("/")[5]
        database = app.state.services.database
        with database.transaction() as conn:
            document = conn.execute("SELECT id FROM documents LIMIT 1").fetchone()[0]
            originals = {
                table: [tuple(row) for row in conn.execute(f"SELECT * FROM {table}")]
                for table in (
                    "document_versions",
                    "document_pages",
                    "document_chunks",
                    "cell_decisions",
                    "extraction_proposals",
                )
            }
            for index in range(3):
                conn.execute(
                    "INSERT INTO document_operations VALUES(?,?,?,?,?,?,?,?)",
                    (
                        f"image{index}",
                        notebook,
                        snapshot,
                        document,
                        f"image{index}",
                        "{}",
                        "{}",
                        "x" * 450_000,
                    ),
                )
    monkeypatch.setattr(storage, "SCHEMA_VERSION", 15)
    database = storage.Database(tmp_path / "evidra.sqlite3")
    try:
        assert (tmp_path / "evidra.before-v15.sqlite3").is_file()
        with database.transaction() as conn:
            assert conn.execute("SELECT count(*) FROM preview_cache_access").fetchone()[0] == 3
            # Access image0 last, so image1 must be evicted first.
            remember_preview(conn, "image0", "x" * 450_000)
            result = prune_derived(
                conn, CacheLimits(image_cache_bytes=1_048_576, derived_cache_bytes=1_048_576)
            )
            assert result["preview_bytes"] == 900_000 and result["evicted_previews"] == 1
            assert (
                conn.execute(
                    "SELECT preview FROM document_operations WHERE id='image1'"
                ).fetchone()[0]
                is None
            )
            assert (
                conn.execute(
                    "SELECT preview FROM document_operations WHERE id='image0'"
                ).fetchone()[0]
                is not None
            )
            for table, rows in originals.items():
                assert [tuple(row) for row in conn.execute(f"SELECT * FROM {table}")] == rows
    finally:
        database.close()


@pytest.mark.parametrize("raw", [b"{invalid", b'{"image_cache_bytes":0}'])
def test_invalid_cache_settings_fail_closed_without_silent_defaults(tmp_path, raw):
    from evidra.domain.errors import EvidraError
    from evidra.storage.cache import load_cache_limits

    (tmp_path / "cache-settings.json").write_bytes(raw)
    with pytest.raises(EvidraError) as failure:
        load_cache_limits(tmp_path)
    assert failure.value.code == "INVALID_CACHE_SETTINGS"
    assert failure.value.__cause__ is not None
