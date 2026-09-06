CREATE TABLE provider_profiles (
    id TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    revision INTEGER NOT NULL,
    spec TEXT NOT NULL,
    paused_code TEXT
);
CREATE TABLE provider_settings (
    owner TEXT PRIMARY KEY,
    revision INTEGER NOT NULL,
    block_paid_apis INTEGER NOT NULL
);
CREATE TABLE provider_model_observations (
    profile_id TEXT NOT NULL REFERENCES provider_profiles(id),
    base_url TEXT NOT NULL,
    model TEXT NOT NULL,
    cloud INTEGER NOT NULL,
    digest TEXT,
    PRIMARY KEY(profile_id,base_url,model)
);
CREATE TABLE provider_writes (
    owner TEXT NOT NULL,
    target TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    result TEXT NOT NULL,
    PRIMARY KEY(owner, target, idempotency_key)
);
CREATE TABLE provider_consents (
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    profile_id TEXT NOT NULL REFERENCES provider_profiles(id),
    revision INTEGER NOT NULL,
    profile_revision INTEGER NOT NULL,
    categories TEXT NOT NULL,
    granted INTEGER NOT NULL,
    PRIMARY KEY(notebook_id, profile_id)
);
CREATE TABLE provider_secrets (
    owner TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    receipt TEXT NOT NULL,
    operation_key TEXT,
    keyring_present INTEGER NOT NULL,
    PRIMARY KEY(owner, profile_id)
);
CREATE TABLE provider_prices (
    owner TEXT NOT NULL,
    version TEXT NOT NULL,
    config TEXT NOT NULL,
    PRIMARY KEY(owner, version)
);
CREATE TABLE provider_budgets (
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    kind TEXT NOT NULL,
    identity TEXT NOT NULL,
    revision INTEGER NOT NULL,
    currency TEXT NOT NULL,
    ceiling TEXT NOT NULL,
    PRIMARY KEY(notebook_id, kind, identity)
);
CREATE TABLE provider_calls (
    call_id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
    profile_id TEXT NOT NULL REFERENCES provider_profiles(id),
    profile_revision INTEGER NOT NULL,
    job_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    repair_of TEXT UNIQUE REFERENCES provider_calls(call_id),
    state TEXT NOT NULL,
    reserved TEXT,
    currency TEXT,
    price TEXT,
    input_bound TEXT,
    max_output_tokens INTEGER NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX provider_calls_budget ON provider_calls(notebook_id, job_id, session_id);
