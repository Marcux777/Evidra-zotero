CREATE TABLE preview_cache_access (
    operation_id TEXT PRIMARY KEY REFERENCES document_operations(id),
    bytes INTEGER NOT NULL CHECK(bytes >= 0),
    used_at TEXT NOT NULL
);
INSERT INTO preview_cache_access
SELECT id,length(CAST(preview AS BLOB)),COALESCE(json_extract(payload,'$.updated_at'),'1970-01-01T00:00:00+00:00')
FROM document_operations WHERE preview IS NOT NULL;
CREATE INDEX preview_cache_lru ON preview_cache_access(used_at,operation_id);
