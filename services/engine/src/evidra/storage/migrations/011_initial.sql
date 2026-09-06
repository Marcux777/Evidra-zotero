CREATE TABLE note_previews (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id), idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, payload TEXT NOT NULL, UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE approved_write_outbox (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id), preview_id TEXT NOT NULL UNIQUE REFERENCES note_previews(id),
    uuid TEXT NOT NULL UNIQUE, approval_key TEXT NOT NULL, approval TEXT NOT NULL,
    payload TEXT NOT NULL, begin_key TEXT, UNIQUE(notebook_id,snapshot_id,approval_key)
);
