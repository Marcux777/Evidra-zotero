# Evidra architecture

The approved design is implemented in sequential vertical layers. This document describes the boundaries and records which layers currently exist; it is not a completion claim. SPEC.md remains the binding product specification. Decisions are in `docs/adr/` and executed evidence is in TEST_REPORT.md.

## Components and ownership

| Component | Responsibility | Current implementation state |
|---|---|---|
| Zotero plugin | Resolve native source objects, present the local interface, mediate human approval, own the engine process | Task 2 pending |
| Typed UI bridge | Permit named operations from the renderer without exposing Zotero objects, paths, credentials or generic network access | Task 2 pending |
| Loopback engine | Own sessions, domain services and one Evidra database | Task 1 implemented and independently reviewed |
| Scope service | Intersect snapshot membership, current notebook grants and current source access at every read/commit | Task 3 pending |
| Document/evidence services | Parse authorized files in subprocesses; retain immutable versions and verified locations | Task 4 pending |
| Provider services | Native protocols, explicit capability provenance, consent and budget accounting | Task 5 pending |
| Retrieval/conversations | Authorized lexical/vector retrieval, draft streams and validated promotion | Task 6 pending |
| Matrix/jobs/research | Proposals distinct from human decisions; persistent units and approved-note outbox | Tasks 7–9 pending |
| MCP bridge | Restricted stdio client of the running engine, with a separate scoped credential | Task 10 pending |
| Exports/distribution | Current-access filtering, validated backup/import and bundled Windows runtime | Tasks 11–12 pending |

The engine never opens `zotero.sqlite`. Zotero source identity is the compound profile/library/item key; document attachments have their own compound identity. Zotero writes occur through the plugin after a human-approved intent and a fresh native permission check.

## Runtime session

The privileged plugin generates a fresh session token and a private, unpredictable Windows handshake directory. The engine validates current-user ownership/DACLs and path/file identity before consuming the handshake exactly once. The credential is neither an argument nor part of the connection receipt. The engine prebinds an exclusive IPv4 loopback socket and gives that same socket to Uvicorn.

The receipt identifies protocol, host, negotiated port and profile. Health reveals minimal status; authenticated requests additionally require the expected Host, no unapproved web Origin, the bridge header and constant-time credential verification. The heartbeat expires after 30 seconds. Body intake is bounded and must not let a previously admitted request execute after session expiry. Only owned process resources are cleaned up; the receipt is removed only if its verified identity still matches.

`create_app(RuntimeSettings)` creates the app and its lifespan-owned `Services`. `Database` owns explicit locked transactions, WAL, foreign keys, SQL schema versioning and backups before subsequent migrations. No parsing or ML model initializes at startup. Domain operations must not hold a database lock while waiting on network or parser work.

## Content authorization

The planned `ScopeService.resolve` creates an immutable server-owned context from the authenticated principal, notebook, snapshot and requested capability. The permitted set is the intersection of immutable membership, current notebook grants and current source/library access. Retrieval restricts that set before top-k. A UUID is an identifier, never proof of authorization.

Services recheck current access and scope revision before committing asynchronous results. Removal or revocation also affects historical reads, cached results, exports and MCP. Frozen snapshots preserve composition and document references; they do not guarantee that an old original PDF still exists. Human decisions are durable records, not discardable derived cache.

## Model and human actions

Generation providers receive only authorized context assembled by domain services. Provider adapters cannot expand source selection, run tools or apply human decisions. Streamed text is a draft until schema and evidence validation succeed. Valid evidence anchors, proposed support and human review remain separate states.

All proposal origins use the same storage and validation paths. Human approval uses explicit revision checks and append-only events. A note approval creates a persistent outbox intent; the native bridge checks current permissions, creates a new note, and acknowledges only after readback/reconciliation of the intent UUID.

MCP is a stdio forwarding process, not a second database writer. Its connection credential is notebook/snapshot/capability/expiry-bound and cannot configure providers, change scope, read arbitrary files or approve/apply proposals. Expired heartbeat or revoked access blocks new reads and proposals.

## Contracts and verification

Pydantic models are the domain schema source of truth; generated OpenAPI/TypeScript contracts are consumed by the extension. API errors have a stable sanitized envelope. Diagnostic causes stay distinguishable without raw validation inputs, secrets, document contents or personal paths.

Tests use real SQLite, Windows file security and local subprocesses where those are the material boundary. Controlled provider fixtures verify wire contracts, not live provider availability. Native Zotero, live provider, packaged-runtime and clean-Windows evidence are recorded separately. Logs, receipts and test-change accounting are retained with the task reports.
