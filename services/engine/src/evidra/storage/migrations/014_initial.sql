CREATE TABLE imported_omissions (
 import_id TEXT NOT NULL REFERENCES imported_notebooks(id), ordinal INTEGER NOT NULL CHECK(ordinal>=0),
 PRIMARY KEY(import_id,ordinal)
);
CREATE TRIGGER immutable_import_omission_update BEFORE UPDATE ON imported_omissions BEGIN SELECT RAISE(ABORT,'immutable imported omission'); END;
CREATE TRIGGER immutable_import_omission_delete BEFORE DELETE ON imported_omissions BEGIN SELECT RAISE(ABORT,'immutable imported omission'); END;
