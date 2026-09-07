CREATE TABLE mcp_connections (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 session_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, allow_proposals INTEGER NOT NULL,
 expires_at TEXT NOT NULL, revoked_at TEXT, last_used_at TEXT, label TEXT NOT NULL,
 created_at TEXT NOT NULL, idempotency_key TEXT NOT NULL, request TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE external_notes (
 id TEXT PRIMARY KEY, artifact_id TEXT NOT NULL, revision INTEGER NOT NULL,
 notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 connection_id TEXT NOT NULL REFERENCES mcp_connections(id), idempotency_key TEXT NOT NULL,
 request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(connection_id,idempotency_key), UNIQUE(artifact_id,revision)
);
