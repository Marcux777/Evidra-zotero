"""Byte-bounded LRU of reconstructible previews and extraction references only."""

import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from evidra.domain.errors import EvidraError


class CacheLimits(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    derived_cache_bytes: int = Field(default=512 * 1024 * 1024, ge=1024 * 1024)
    image_cache_bytes: int = Field(
        default=100 * 1024 * 1024, ge=1024 * 1024, le=100 * 1024 * 1024
    )

    @model_validator(mode="after")
    def within_disk_budget(self) -> "CacheLimits":
        if self.image_cache_bytes > self.derived_cache_bytes:
            raise ValueError("Image cache cannot exceed the derived disk cache budget")
        return self


def load_cache_limits(data_dir: Path) -> CacheLimits:
    path = data_dir / "cache-settings.json"
    if not path.exists():
        return CacheLimits()
    from evidra.security.handshake import assert_no_reparse_points

    assert_no_reparse_points(path)
    try:
        with path.open("rb") as stream:
            raw = stream.read(4097)
        if len(raw) > 4096:
            raise EvidraError("INVALID_CACHE_SETTINGS", "Cache settings exceed 4096 bytes.")
        return CacheLimits.model_validate_json(raw)
    except (OSError, ValidationError) as exc:
        raise EvidraError(
            "INVALID_CACHE_SETTINGS", "Review the local cache-settings.json file."
        ) from exc


def remember_preview(connection: sqlite3.Connection, operation_id: str, payload: str) -> None:
    used_at = datetime.now(UTC)
    previous = connection.execute("SELECT max(used_at) FROM preview_cache_access").fetchone()[0]
    # Windows may return the same clock tick for multiple reads. Preserve access order.
    if previous is not None and used_at <= datetime.fromisoformat(previous):
        used_at = datetime.fromisoformat(previous) + timedelta(microseconds=1)
    connection.execute(
        "INSERT OR REPLACE INTO preview_cache_access VALUES(?,?,?)",
        (operation_id, len(payload.encode("utf-8")), used_at.isoformat()),
    )


def prune_derived(connection: sqlite3.Connection, limits: CacheLimits) -> dict[str, int]:
    # No source text, evidence, version, run, proposal or human decision is deleted.
    images = connection.execute(
        "SELECT operation_id,bytes,used_at FROM preview_cache_access ORDER BY used_at,operation_id"
    ).fetchall()
    references = connection.execute(
        "SELECT key,length(CAST(key||notebook_id||snapshot_id||result_id||used_at AS BLOB)) "
        "AS bytes,used_at FROM extraction_cache ORDER BY used_at,key"
    ).fetchall()
    preview_bytes = sum(row[1] for row in images)
    reference_bytes = sum(row[1] for row in references)
    removed_images = removed_references = 0
    candidates = sorted(
        [(row[2], "image", row[0], row[1]) for row in images]
        + [(row[2], "reference", row[0], row[1]) for row in references]
    )
    for _, kind, identity, size in candidates:
        total_exceeded = preview_bytes + reference_bytes > limits.derived_cache_bytes
        image_exceeded = kind == "image" and preview_bytes > limits.image_cache_bytes
        if not total_exceeded and not image_exceeded:
            continue
        if kind == "image":
            connection.execute(
                "UPDATE document_operations SET preview=NULL WHERE id=?", (identity,)
            )
            connection.execute(
                "DELETE FROM preview_cache_access WHERE operation_id=?", (identity,)
            )
            preview_bytes -= size
            removed_images += 1
        else:
            connection.execute("DELETE FROM extraction_cache WHERE key=?", (identity,))
            reference_bytes -= size
            removed_references += 1
    return {
        "preview_bytes": preview_bytes,
        "reference_bytes": reference_bytes,
        "evicted_previews": removed_images,
        "evicted_references": removed_references,
    }
