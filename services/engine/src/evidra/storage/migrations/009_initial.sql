CREATE TABLE protocol_versions (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    revision INTEGER NOT NULL, idempotency_key TEXT NOT NULL, request TEXT NOT NULL,
    payload TEXT NOT NULL, UNIQUE(notebook_id,revision), UNIQUE(notebook_id,idempotency_key)
);
CREATE TABLE screening_decisions (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
    protocol_version_id TEXT NOT NULL REFERENCES protocol_versions(id),
    source_id TEXT NOT NULL REFERENCES sources(id), stage TEXT NOT NULL,
    reviewer TEXT NOT NULL, revision INTEGER NOT NULL, idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL,
    UNIQUE(notebook_id,idempotency_key),
    UNIQUE(snapshot_id,protocol_version_id,source_id,stage,reviewer,revision)
);
