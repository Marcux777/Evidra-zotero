CREATE TABLE screening_batches (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id), idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, payload TEXT NOT NULL, claim_token TEXT,
    UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE screening_batch_commands (
    batch_id TEXT NOT NULL REFERENCES screening_batches(id), idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, PRIMARY KEY(batch_id,idempotency_key)
);
