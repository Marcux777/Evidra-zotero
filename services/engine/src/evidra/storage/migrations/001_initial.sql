CREATE TABLE notebooks (
    id TEXT PRIMARY KEY,
    profile_instance_id TEXT NOT NULL,
    name TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    revision INTEGER NOT NULL CHECK (revision >= 1),
    initial_snapshot_id TEXT NOT NULL,
    UNIQUE (profile_instance_id, idempotency_key),
    UNIQUE (profile_instance_id, id)
);
CREATE TABLE snapshots (
    id TEXT PRIMARY KEY,
    profile_instance_id TEXT NOT NULL,
    notebook_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    revision INTEGER NOT NULL CHECK (revision >= 1),
    FOREIGN KEY (profile_instance_id, notebook_id)
        REFERENCES notebooks(profile_instance_id, id)
);
