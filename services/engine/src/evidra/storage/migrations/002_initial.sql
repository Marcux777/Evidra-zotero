CREATE TABLE source_libraries (
    profile_instance_id TEXT NOT NULL,
    library_id INTEGER NOT NULL,
    available INTEGER NOT NULL CHECK(available IN (0,1)),
    PRIMARY KEY(profile_instance_id, library_id)
);
CREATE TABLE sources (
    id TEXT PRIMARY KEY,
    profile_instance_id TEXT NOT NULL,
    library_id INTEGER NOT NULL,
    item_key TEXT NOT NULL,
    version_id TEXT NOT NULL,
    available INTEGER NOT NULL CHECK(available IN (0,1)),
    access_revision INTEGER NOT NULL,
    reason TEXT,
    UNIQUE(profile_instance_id, library_id, item_key),
    FOREIGN KEY(profile_instance_id, library_id) REFERENCES source_libraries
);
CREATE TABLE source_versions (
    source_id TEXT NOT NULL REFERENCES sources(id),
    version_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    PRIMARY KEY(source_id, version_id)
);
CREATE TABLE notebook_grants (
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    source_id TEXT NOT NULL REFERENCES sources(id),
    contents TEXT NOT NULL,
    PRIMARY KEY(notebook_id, source_id)
);
CREATE TABLE snapshot_members (
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
    source_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    PRIMARY KEY(snapshot_id, source_id),
    FOREIGN KEY(source_id, version_id) REFERENCES source_versions
);
CREATE TABLE snapshot_selections (
    snapshot_id TEXT PRIMARY KEY REFERENCES snapshots(id),
    selection TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    request TEXT NOT NULL,
    UNIQUE(notebook_id, idempotency_key)
);
CREATE TABLE selection_previews (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    payload TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    stage_id TEXT NOT NULL,
    candidate_ids TEXT NOT NULL
);
CREATE TABLE selection_stages (
    notebook_id TEXT PRIMARY KEY REFERENCES notebooks(id),
    id TEXT UNIQUE NOT NULL,
    session_id TEXT NOT NULL,
    versions TEXT NOT NULL,
    complete INTEGER NOT NULL CHECK(complete IN (0,1))
);
CREATE TRIGGER immutable_snapshot_update BEFORE UPDATE ON snapshots BEGIN SELECT RAISE(ABORT, 'immutable snapshot'); END;
CREATE TRIGGER immutable_snapshot_delete BEFORE DELETE ON snapshots BEGIN SELECT RAISE(ABORT, 'immutable snapshot'); END;
CREATE TRIGGER immutable_member_update BEFORE UPDATE ON snapshot_members BEGIN SELECT RAISE(ABORT, 'immutable member'); END;
CREATE TRIGGER immutable_member_delete BEFORE DELETE ON snapshot_members BEGIN SELECT RAISE(ABORT, 'immutable member'); END;
CREATE TRIGGER immutable_version_update BEFORE UPDATE ON source_versions BEGIN SELECT RAISE(ABORT, 'immutable version'); END;
CREATE TRIGGER immutable_version_delete BEFORE DELETE ON source_versions BEGIN SELECT RAISE(ABORT, 'immutable version'); END;
CREATE TRIGGER immutable_selection_update BEFORE UPDATE ON snapshot_selections BEGIN SELECT RAISE(ABORT, 'immutable selection'); END;
CREATE TRIGGER immutable_selection_delete BEFORE DELETE ON snapshot_selections BEGIN SELECT RAISE(ABORT, 'immutable selection'); END;
