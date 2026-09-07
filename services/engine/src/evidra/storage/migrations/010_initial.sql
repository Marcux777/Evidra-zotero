CREATE TABLE research_runs (
    id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id), idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, preview TEXT NOT NULL, payload TEXT NOT NULL,
    checkpoint TEXT, claim_token TEXT,
    UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE research_commands (
    run_id TEXT NOT NULL REFERENCES research_runs(id), idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL, PRIMARY KEY(run_id,idempotency_key)
);
CREATE TABLE artifact_versions (
    id TEXT PRIMARY KEY, artifact_id TEXT NOT NULL, revision INTEGER NOT NULL,
    run_id TEXT NOT NULL REFERENCES research_runs(id), payload TEXT NOT NULL,
    UNIQUE(artifact_id,revision)
);
CREATE INDEX artifact_run ON artifact_versions(run_id,revision);
CREATE TABLE artifact_reviews (
    artifact_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, request TEXT NOT NULL,
    version_id TEXT NOT NULL REFERENCES artifact_versions(id),
    PRIMARY KEY(artifact_id,idempotency_key)
);
