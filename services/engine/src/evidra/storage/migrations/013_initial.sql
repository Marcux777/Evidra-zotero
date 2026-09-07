CREATE TABLE imported_notebooks (
 id TEXT PRIMARY KEY, notebook_id TEXT NOT NULL REFERENCES notebooks(id),
 snapshot_id TEXT NOT NULL REFERENCES snapshots(id), idempotency_key TEXT NOT NULL,
 request TEXT NOT NULL, payload TEXT NOT NULL, mappings TEXT NOT NULL,
 UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE imported_records (
 import_id TEXT NOT NULL REFERENCES imported_notebooks(id), ordinal INTEGER NOT NULL,
 kind TEXT NOT NULL, original_record_id TEXT NOT NULL, access TEXT NOT NULL,
 payload TEXT NOT NULL, PRIMARY KEY(import_id,ordinal)
);
CREATE TABLE imported_files (
 import_id TEXT NOT NULL REFERENCES imported_notebooks(id), path TEXT NOT NULL,
 manifest TEXT NOT NULL, access TEXT NOT NULL, data BLOB NOT NULL,
 PRIMARY KEY(import_id,path)
);
CREATE TRIGGER immutable_import_update BEFORE UPDATE ON imported_records BEGIN SELECT RAISE(ABORT,'immutable imported history'); END;
CREATE TRIGGER immutable_import_delete BEFORE DELETE ON imported_records BEGIN SELECT RAISE(ABORT,'immutable imported history'); END;
