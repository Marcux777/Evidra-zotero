CREATE TABLE extraction_jobs (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
 snapshot_id TEXT NOT NULL REFERENCES snapshots(id), idempotency_key TEXT NOT NULL,
 request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE extraction_units (
 id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES extraction_jobs(id),
 source_id TEXT NOT NULL REFERENCES sources(id), field_key TEXT NOT NULL,
 payload TEXT NOT NULL, evidence_ids TEXT NOT NULL, cache_key TEXT NOT NULL,
 lease_owner TEXT, lease_until REAL,
 UNIQUE(job_id,source_id,field_key)
);
CREATE TABLE extraction_batches (
 unit_id TEXT NOT NULL REFERENCES extraction_units(id), batch_index INTEGER NOT NULL,
 evidence_ids TEXT NOT NULL, call_id TEXT NOT NULL UNIQUE, output TEXT,
 prior_call_ids TEXT NOT NULL DEFAULT '[]',
 preview TEXT,
 PRIMARY KEY(unit_id,batch_index)
);
CREATE TABLE extraction_job_commands (
 job_id TEXT NOT NULL REFERENCES extraction_jobs(id), idempotency_key TEXT NOT NULL,
 request TEXT NOT NULL, PRIMARY KEY(job_id,idempotency_key)
);
CREATE TABLE extraction_results (
 id TEXT PRIMARY KEY, unit_id TEXT NOT NULL UNIQUE REFERENCES extraction_units(id),
 notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 payload TEXT NOT NULL
);
CREATE TABLE extraction_cache (
 key TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
 snapshot_id TEXT NOT NULL REFERENCES snapshots(id), result_id TEXT NOT NULL REFERENCES extraction_results(id),
 used_at TEXT NOT NULL
);
CREATE INDEX extraction_units_jobs ON extraction_units(job_id);
CREATE INDEX extraction_cache_scope ON extraction_cache(notebook_id,snapshot_id,used_at);
