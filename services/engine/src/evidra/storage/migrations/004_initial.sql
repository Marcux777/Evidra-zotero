CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    content_key TEXT NOT NULL,
    content_version TEXT NOT NULL,
    source_kind TEXT NOT NULL,
    path TEXT NOT NULL,
    file_identity TEXT NOT NULL,
    revision INTEGER NOT NULL,
    coverage TEXT NOT NULL,
    reason TEXT,
    current_version_id TEXT,
    UNIQUE(source_id,content_key,content_version)
);
CREATE TABLE document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    sha256 TEXT NOT NULL,
    parser_version TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    file_identity TEXT NOT NULL,
    coverage TEXT NOT NULL,
    page_count INTEGER NOT NULL,
    pages_processed INTEGER NOT NULL,
    bytes_processed INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(document_id,sha256,parser_version,policy_version)
);
CREATE TABLE document_pages (
    version_id TEXT NOT NULL REFERENCES document_versions(id),
    page_index INTEGER NOT NULL,
    payload TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    normalization_map TEXT NOT NULL,
    PRIMARY KEY(version_id,page_index)
);
CREATE TABLE document_chunks (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL REFERENCES document_versions(id),
    page_index INTEGER NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    normalization_map TEXT NOT NULL,
    FOREIGN KEY(version_id,page_index) REFERENCES document_pages
);
CREATE INDEX chunks_version ON document_chunks(version_id,page_index,start_offset);
CREATE VIRTUAL TABLE document_fts USING fts5(chunk_id UNINDEXED,text,tokenize='unicode61');
CREATE TABLE document_operations (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
    document_id TEXT NOT NULL REFERENCES documents(id),
    idempotency_key TEXT NOT NULL,
    request TEXT NOT NULL,
    payload TEXT NOT NULL,
    preview TEXT,
    UNIQUE(notebook_id,snapshot_id,idempotency_key)
);
CREATE TABLE document_text_stages (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL REFERENCES notebooks(id),
    snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
    source_id TEXT NOT NULL REFERENCES sources(id),
    content_key TEXT NOT NULL,
    content_version TEXT NOT NULL,
    session_id TEXT NOT NULL,
    scope_signature TEXT NOT NULL,
    total_characters INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    offset INTEGER NOT NULL,
    document_id TEXT REFERENCES documents(id)
);
CREATE TABLE document_text_parts (
    stage_id TEXT NOT NULL REFERENCES document_text_stages(id),
    start_offset INTEGER NOT NULL,
    text TEXT NOT NULL,
    final INTEGER NOT NULL,
    PRIMARY KEY(stage_id,start_offset)
);
CREATE TRIGGER immutable_document_version_update BEFORE UPDATE ON document_versions BEGIN SELECT RAISE(ABORT,'immutable document version'); END;
CREATE TRIGGER immutable_document_version_delete BEFORE DELETE ON document_versions BEGIN SELECT RAISE(ABORT,'immutable document version'); END;
CREATE TRIGGER immutable_document_page_update BEFORE UPDATE ON document_pages BEGIN SELECT RAISE(ABORT,'immutable document page'); END;
CREATE TRIGGER immutable_document_page_delete BEFORE DELETE ON document_pages BEGIN SELECT RAISE(ABORT,'immutable document page'); END;
CREATE TRIGGER immutable_document_chunk_update BEFORE UPDATE ON document_chunks BEGIN SELECT RAISE(ABORT,'immutable document chunk'); END;
CREATE TRIGGER immutable_document_chunk_delete BEFORE DELETE ON document_chunks BEGIN SELECT RAISE(ABORT,'immutable document chunk'); END;
