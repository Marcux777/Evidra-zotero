ALTER TABLE sources ADD COLUMN metadata_version TEXT NOT NULL DEFAULT '';
CREATE TABLE source_contents (
    source_id TEXT NOT NULL REFERENCES sources(id),
    key TEXT NOT NULL,
    kind TEXT NOT NULL,
    version_id TEXT NOT NULL,
    available INTEGER NOT NULL CHECK(available IN (0,1)),
    access_revision INTEGER NOT NULL,
    PRIMARY KEY(source_id, key)
);
