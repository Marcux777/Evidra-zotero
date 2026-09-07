CREATE TABLE form_versions (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id), revision INTEGER NOT NULL,
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id, revision), UNIQUE(notebook_id,idempotency_key)
);
CREATE TABLE form_field_lineage (
 form_version_id TEXT NOT NULL REFERENCES form_versions(id), field_key TEXT NOT NULL,
 origin_form_version_id TEXT NOT NULL REFERENCES form_versions(id),
 PRIMARY KEY(form_version_id,field_key)
);
CREATE TABLE extraction_proposals (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 form_version_id TEXT NOT NULL REFERENCES form_versions(id),
 field_origin_form_version_id TEXT NOT NULL REFERENCES form_versions(id),
 source_id TEXT NOT NULL REFERENCES sources(id), field_key TEXT NOT NULL,
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE INDEX proposal_cells ON extraction_proposals(notebook_id,snapshot_id,field_origin_form_version_id,source_id,field_key);
CREATE TABLE cell_decisions (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 field_origin_form_version_id TEXT NOT NULL REFERENCES form_versions(id), source_id TEXT NOT NULL REFERENCES sources(id), field_key TEXT NOT NULL,
 revision INTEGER NOT NULL, proposal_id TEXT NOT NULL REFERENCES extraction_proposals(id),
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,field_origin_form_version_id,source_id,field_key,revision), UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE matrix_bulk_previews (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE INDEX decision_proposals ON cell_decisions(notebook_id,snapshot_id,proposal_id);
CREATE TABLE matrix_bulk_commits (
 notebook_id TEXT NOT NULL REFERENCES notebooks(id), snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
 idempotency_key TEXT NOT NULL, request TEXT NOT NULL, preview_id TEXT NOT NULL REFERENCES matrix_bulk_previews(id),
 PRIMARY KEY(notebook_id,snapshot_id,idempotency_key)
);
