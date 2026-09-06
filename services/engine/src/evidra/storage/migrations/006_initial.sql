CREATE TABLE vector_generations (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL, snapshot_id TEXT NOT NULL,
 profile_id TEXT NOT NULL, profile_revision INTEGER NOT NULL, payload TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX vector_active ON vector_generations(notebook_id,snapshot_id,profile_id) WHERE active=1;
CREATE TABLE vector_blocks (
 generation_id TEXT NOT NULL REFERENCES vector_generations(id) ON DELETE CASCADE,
 block INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY(generation_id,block)
);
CREATE TABLE vector_members (
 generation_id TEXT NOT NULL REFERENCES vector_generations(id) ON DELETE CASCADE,
 chunk_id TEXT NOT NULL REFERENCES document_chunks(id), block INTEGER NOT NULL,
 position INTEGER NOT NULL, PRIMARY KEY(generation_id,chunk_id)
);
CREATE TABLE vector_jobs (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL, snapshot_id TEXT NOT NULL,
 idempotency_key TEXT NOT NULL, profile_id TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE conversations (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL, snapshot_id TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0, idempotency_key TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE conversation_runs (
 id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id),
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, payload TEXT NOT NULL,
 scope_revision INTEGER NOT NULL, scope_fingerprint TEXT NOT NULL,
 UNIQUE(conversation_id,idempotency_key)
);
CREATE TABLE conversation_events (
 run_id TEXT NOT NULL REFERENCES conversation_runs(id), cursor INTEGER NOT NULL,
 payload TEXT NOT NULL, PRIMARY KEY(run_id,cursor)
);
