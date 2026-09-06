# Evidra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the full local Evidra 0.1.0 product specified in SPEC.md, recording separately code implementation, fixture verification, live verification, and blocked requirements.

**Architecture:** A native Zotero extension resolves sources and mediates human actions. One Python engine owns its SQLite database, scope enforcement, parsing, retrieval and model calls. Sandboxed content never gets the bridge or an administrative credential; MCP is a scoped stdio client of the same engine.

**Tech Stack:** TypeScript, React, markdown-it/DOMPurify, esbuild, Vitest; Python 3.12, FastAPI/Pydantic, SQLite FTS5, pypdfium2, NumPy, httpx, official MCP SDK, keyring, pytest/Ruff/mypy, PyInstaller on Windows.

**Spec:** [SPEC.md](SPEC.md), adopted unchanged from the user's attachment (SHA-256 `80190d8bd1e8b958e570f92adcfccd7e8d518ca3691b6e5b1b9c92ff04c4d4c0`). This plan decomposes that approved design; the specification governs any conflict.

## Global Constraints

- Platform: Windows x64, Zotero 10.0.x from 10.0.1; `strict_max_version: "10.0.*"`. No 7/8/9 compatibility layer. Python `>=3.12,<3.13`.
- Interface PT-BR by default and complete en-US catalog. Do not translate source quotations. No Node/Python requirement for end users.
- Engine bound exclusively to `127.0.0.1`, never port `23119` or `0.0.0.0`; session secret is 256 bits. Heartbeat every 10 seconds; refuse operations after 30 seconds without the bridge.
- The engine never reads `zotero.sqlite`. Real personal-library mutation, paid calls, credentials discovery, releases, remote publishing and pushes are unauthorized. Use synthetic data in a separate test profile.
- Every content read, retrieval, commit, export, cache hit and MCP operation enforces shared server-created ScopeContext. Scope restriction precedes top-k. Library/profile/item keys are compound identities.
- Source removal, current access revocation and stale commits fail closed. Human decisions remain distinct from AI proposals. Missing values are null with explicit states.
- No hidden retries, provider substitutions, automatic model downloads, invented evidence, tool execution from model content, arbitrary public file paths, or fake production adapters.
- LOCAL rejects non-loopback endpoints and explicitly cloud models. API profiles are blocked by default and require per-notebook/provider consent. Never infer zero cost from unknown usage/pricing.
- Persist original text and immutable versions; parser/caches cannot discard human decisions. Transitions and human writes use expected revisions/idempotency; UTC storage.
- Provider secrets use OS keyring or memory only and never appear in logs, process arguments, exports or backups. Restricted handshake/connection files have per-user ACLs.
- All shell invocations are prefixed `rtk`. No install outside the dependencies explicitly authorized on 2026-09-05. Keep all user changes; no reset, stash, prune, merge, rebase, push or unrelated cleanup.
- Before test selection read `C:/Users/marcu/.codex/instructions/testing.md`; use the smallest credible check per material invariant, TDD for behavior, and real SQLite/files/processes at security boundaries. Fixtures are not native Zotero or paid-provider smoke evidence.
- Keep reports and logs under `.local/` and link receipts from docs. Never report M0/M1 as full completion. Never mark unrun acceptance rows passed.
- All changes occur in `C:/p/evidra-zotero` on `codex/implement-evidra`. One implementation agent at a time; root integrates. Agents may not spawn children. Commits use inspected git state and owned files only.

## Integration contracts

Python Pydantic models and FastAPI OpenAPI are the source of truth. Generate `packages/contracts/generated/api.ts`; UI consumes generated schemas, not duplicate domain types. HTTP responses return actual typed domain objects; pagination uses `items`, `offset`, `limit`, `total`. Errors use `code`, `message`, `retryable`, `run_id`, sanitized `details`.

Factory: `evidra.api.app.create_app(settings: RuntimeSettings) -> FastAPI`. `RuntimeSettings` contains `data_dir`, `profile_instance_id`, `session_token` (SecretStr), `port`, and injected monotonic clock for deterministic heartbeat tests. `app.state.services` owns the single database and domain services. CLI `evidra-engine serve --handshake <path>` consumes an ACL-protected one-use file; the token is not a CLI argument. The connection receipt has negotiated port/protocol and no credential.

`Database` in `storage/database.py` provides an explicit locked transaction context and SQLite backup API. Services perform scope checks inside guarded reads/commits. Never keep a DB lock while awaiting a provider or parsing process.

Domain error: `EvidraError(code: str, message: str, *, retryable: bool=False, details: dict|None=None)`; preserve causes with `raise ... from exc`, sanitize public details.

`ScopeService.resolve(principal, notebook_id, snapshot_id, capability="read") -> ScopeContext` creates immutable context. `assert_current(context)` guards commits. Permitted source IDs are the intersection of immutable snapshot membership, current notebook grants, and current source/library access; historical snapshots cannot recover removed sources. Authentication binds principal identity and capabilities server-side. Admin and MCP credentials are distinct.

Routes live below `/v1`; scoped content routes use `/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/...`. Route modules are grouped by responsibility and delegate to services. Privileged UI requests use a narrow typed operation bridge; there is no generic URL fetch, file read, JS evaluation or shell bridge.

Native UI constraint verified during Task2: the opaque iframe keeps sandbox=allow-scripts. Browser form submission returns before firing submit in this sandbox, so UI commands must use explicit buttons and suitable input Enter handling, including IME/busy guards. Keep form semantics where useful but do not implement commands solely through onSubmit. The actual measured load, transport and trusted-input contracts are recorded in ZOTERO_API_REFERENCE.md and must inform subsequent UI work.

The same opaque content realm is not a secure context: crypto.randomUUID is unavailable, although privileged Xray inspection misleadingly exposes that property. UI idempotency keys use the available crypto.getRandomValues API directly; notebook keys are 32 random bytes encoded as 64 hex characters. Do not assume a privileged inspection proves a content capability exists. Preserve stable keys across retries and reset them only on the existing edit/success transitions.

Source provenance contract: the Task3 resolver recognizes the exact Zotero tag `evidra:ai` and note HTML attribute `data-evidra-origin="ai"` as AI artifact markers. Every later Evidra-produced AI note must preserve those markers alongside its outbox/provenance UUID, so explicit note selection cannot recycle an AI artifact into primary evidence. Unmarked external notes have unknown provenance; the opt-in UI must keep that limitation visible.

## Task 1: M0 engine, authenticated session and persistent notebooks

**Files:** Create `services/engine/src/evidra/api/{app,notebooks}.py`, `domain/{models,errors}.py`, `storage/database.py`, `security/{runtime,handshake}.py`, `notebooks/service.py`, `__main__.py`, SQL migrations under `storage/migrations/`, `services/engine/tests/test_runtime_notebooks.py`. Update pyproject only when demonstrated necessary. Engine migrations must ship as package data.

**Interfaces:** Produce the app factory, runtime/settings, database and error contracts above; routes `GET /health`, authenticated `GET /v1/status`, `POST /v1/bridge/heartbeat`, `POST/GET /v1/notebooks`, `GET /v1/notebooks/{id}`. Notebook creation takes name and idempotency key; one notebook per key and profile. Persist notebook UUID, profile, name, timestamps, revision and initial snapshot. Port chosen from a prebound loopback socket, not a check-then-bind race.

**Requirements:** Validate Host/Origin and required `X-Evidra-Client: bridge` header plus Bearer authentication; health exposes only minimal protocol status. Deny wrong host, all unapproved web origins, invalid token and expired bridge. Bounded JSON body size. Use WAL/foreign keys, transactional schema versioning and backup before subsequent migrations; future schema versions are rejected. CLI protects/consumes handshake atomically, validates schema, sends no secrets to stdout/logs, starts lazily and shuts down its owned resources. Windows ACL helpers must fail closed on ACL errors. No parser/models at startup.

- [x] Write `test_runtime_notebooks.py` with one parametrized auth boundary test and one persistence/idempotency test using temporary real SQLite. Direct example:
  ```python
  response = client.post('/v1/notebooks', headers=bridge_headers,
                         json={'name': 'Revisão', 'idempotency_key': 'create-1'})
  assert response.status_code == 201
  notebook_id = response.json()['id']
  assert reopened_client.get(f'/v1/notebooks/{notebook_id}', headers=bridge_headers).json()['name'] == 'Revisão'
  assert client.get('/v1/notebooks', headers={'Host': 'attacker.test'}).status_code == 403
  ```
- [x] Run `rtk uv run --project services/engine --no-sync pytest services/engine/tests/test_runtime_notebooks.py -q` and capture the expected missing behavior failure. A missing dependency is a blocker, not a red proof.
- [x] Implement the production contracts and CLI; real heartbeat expiry via injected clock, transactional creation, body/auth guards. Use `hmac.compare_digest` for credentials and stdlib `secrets` for generated IDs/tokens.
- [x] Run focused pytest, Ruff and mypy on owned modules; run a real loopback subprocess health/notebook/restart smoke using disposable handshake/data. Record stderr, exit, ports and process cleanup, redacting secrets.
- [x] Self-review, inspect git status/branch/root/worktrees, commit owned changes, and write the task report with exact RED/GREEN commands and counts. M0 native acceptance is still pending Task 2.

## Task 2: M0 native XPI, safe UI bridge and first notebook

**Files:** Create `apps/zotero/{manifest.json,bootstrap.js,chrome.manifest}`, `src/bootstrap/{lifecycle,engine}.ts`, `src/bridge/{zotero,types}.ts`, `src/ui/{App,onboarding,i18n}.tsx`, `src/security/{messages,markdown}.ts`, local CSS/HTML and pt-BR/en-US catalogs; `scripts/{build-plugin,generate-contracts}.mjs`, `tsconfig.json`, `vitest.config.ts`, native/UI tests. Own TS/build files only; coordinate API changes with root.

**Interfaces:** Consume Task 1 routes and generated Pydantic models. `ZoteroBridge` encapsulates target-tag APIs. Typed UI operations include status, notebook list/create/select, choose/verify engine and start consent. Privileged adapter never exposes its token, generic fetch, arbitrary file access or Zotero objects to rendered content.

**Requirements:** Native Zotero workspace tab/panel and reader section, lifecycle cleanup on every window and uninstall, correct plugin manifest, no future dummy tabs. Implement first-use engine choice, manifest/hash verification and explicit executable consent; changed binary requires renewed consent. Start own helper only, protected handshake, heartbeat, bounded startup failure and protocol mismatch diagnostics. React local bundle loads under restrictive CSP; markdown-it HTML off + DOMPurify allowlist excludes images/scripts/events and validates links. Wide workspace initially implements real notebook creation/listing. Both locales and keyboard/focus/dark mode on this vertical.

- [x] Write focused Vitest checks for typed-message rejection/token non-exposure and malicious Markdown rendering, plus the first notebook flow through a real React component with a controlled bridge boundary. Example:
  ```ts
  expect(() => parseUiMessage({ op: 'read_file', path: 'C:\\secret' })).toThrow();
  expect(renderSafeMarkdown('<img src=x onerror=alert(1)>')).not.toContain('<img');
  ```
- [x] Run `rtk npm test -- apps/zotero/tests` to observe the missing behavior; implement target APIs verified from official source, bundled React and onboarding. Do not guess runtime globals.
- [x] Generate OpenAPI/types, run `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build:plugin`; inspect XPI zip paths, manifest and packaged resources.
- [ ] Native smoke in a separate authorized test profile: load plugin, create/reopen notebook, reader/workspace lifecycle and disable cleanup. If the permitted helper cannot support test-profile installation/startup, record the exact blocked operation rather than automating Zotero UI or touching the personal profile. Continue independently executable work.
- [x] Record screenshots only from real plugin operation when possible; otherwise label native criteria NOT_VERIFIED. Commit owned changes and report verification.

Task2 source/review gate passed atb132506 after five fix rounds. Native first-notebook creation/reopen, host restart, two-window synchronization, trusted Enter, native light/dark themes and200%zoom passed on the exact reviewed XPI. A12-check Reader run also displayed the current notebook in the registered native section and retained the main workspace after reader close. The900x528main-panel capture was inspected. File-picker, complete keyboard/localization/accessibility and disable/uninstall checks remain pending in NATIVE_VALIDATION_PLAN.md. The user authorized the isolated-profile exception on2026-09-05. Later source tasks continue as explicitly allowed by that step.

## Task 3: M1 source resolution, identities and immutable scoped snapshots

**Files:** `domain/sources.py`, `scope/service.py`, `notebooks/snapshots.py`, `api/sources.py`, scope migrations/tests; `apps/zotero/src/{sources/resolver,bridge/sources,ui/Sources}.tsx/ts` as appropriate and focused resolver tests.

**Interfaces:** Produce ScopeService contract, server-owned principal/capability models and `sync_sources`, `preview_selection`, `create_snapshot`, `revoke_access`. Add current notebook grants distinct from snapshot members. Bridge consumes plural selected collections/libraries/saved-searches/items and sends authorized item/attachment metadata with full compound identities and permitted content kinds.

**Requirements:** Union selectors, optional descendants off, year/type/tags AND/OR/PDF filters apply to explicit inclusions, exclusions win, filter explanation, deduplicate compound identity. Normalize child results to parent while preserving content authorization; distinguish multiple attachments/principal/supplements, metadata, notes, annotations and AI artifacts (notes opt-in, AI excluded). Dynamic delta preview versus frozen snapshots, stale source/version marking and event invalidation. Snapshot capture is immutable and idempotent; source removal blocks all historical reads and in-flight commits. Do not scan disk/library outside selected sources. Check native permissions before bridge sync.

- [x] Write real SQLite/property tests: same key in two profiles/libraries remains distinct; overlapping collections deduplicate; excluded item absent; forged snapshot/source IDs and stale commits fail. The evidence-ID route check belongs to Task4's evidence implementation. Example:
  ```python
  scope = scopes.resolve(principal, notebook_a, snapshot_a)
  scopes.revoke_access(source_id)
  with pytest.raises(EvidraError, match='SCOPE_STALE|SOURCE_REVOKED'):
      scopes.assert_current(scope)
  ```
- [x] Observe RED using `rtk uv run --project services/engine --no-sync pytest services/engine/tests/test_scopes.py -q` and the focused TS resolver test.
- [x] Implement grants/snapshots and resolver UI with selection preview, snapshot history, revocation and notification handling. Every route/service read checks current authorization.
- [x] Run scope/property tests plus existing notebook tests, TS resolver/typecheck, and generated-contract drift check. Record exact expected membership fixtures.
- [x] Self-review and commit; report A02–A10 code/fixture/native status independently.

Task3 source/review gate passed at24bc78c after F1–F4 fixes. Real native two-item selection, immutable capture, changed metadata, revocation persistence and trash invalidation were observed on the exact reviewed XPI/M1 engine. The initial helper's premature read timed out; the original FAILED receipt is retained, and a separate scoped continuation passed11checks after restart. Native plural collections/search/group-library/attachment permutations and later evidence/generation/cache/MCP/export enforcement remain separately tracked; the checklist does not declare those later consumers implemented.

## Task 4: M2 registered documents, parser, evidence and lexical search

**Files:** `documents/{registry,parser_worker,ingestion,chunking}.py`, `evidence/service.py`, `retrieval/lexical.py`, related API/migrations/tests/fixtures; source status and evidence panels/reader navigation TS.

**Interfaces:** `register_attachment` is bridge-admin only and returns opaque ID; parsing accepts that ID, never a public path. Evidence references are server-generated and include document version, compound source identity, source kind, original excerpt, page index/label and verified offsets. Routes expose authorized evidence/search/indexing status and page previews.

**Requirements:** Revalidate regular file/path/reparse points, size/content/stable file identity at registration and use; streaming SHA-256; subprocess parser with one worker (up to two explicit), timeout/memory/page/file limits. Parse every page or record its failure, preserve original text, labels, rotation/crop and normalization maps. Explicit FULL_TEXT_PARSED/PARTIAL_TEXT/METADATA_ONLY/NEEDS_OCR/UNREADABLE/MISSING_FILE/STALE; no OCR. Chunks per page target 2400 chars/overlap <=320 with policy version and offsets. FTS5 escaped parameterized queries with scope JOIN before ORDER/LIMIT and stable tiebreak. Note/abstract indexing preserves kind. Incremental hash/parser cache still requires current grants. Evidence opens correct native attachment/page; only highlight verified rectangles, otherwise label page precision. User-selected page/region preview is bounded and hashed.

**Bounded operation contract:** The production bridge times out after ten seconds, so parsing/rendering returns a short scoped receipt and exposes status/cancel/result. One background supervisor controls one owned PDFium process. This durable document lifecycle remains the parser API consumed by Task8's extraction queue. Defaults:200000000bytes,1000pages,512MiB committed parser memory,120seconds wall time; finite user adjustments are explicit. Exceedance pauses with a reason and explicit resume, never truncation or automatic retry. Final page/chunk persistence is atomic after current scope/file-identity recheck and retains failed-page diagnostics.

**Historical evidence contract:** Stored immutable text remains readable after a version change only while the exact source/content identity is currently available and granted, with historical-version/stale provenance. Removal/revocation blocks access. New ingestion must match frozen snapshot observations. Native open/highlight/preview verifies the registered file identity and full hash against the evidence version. Private note/abstract transfer can use scope/version-bound sequential8k-character parts with finite declared length and complete assembled-hash validation; renderer commands never supply arbitrary text or paths.

- [ ] Author synthetic PDF fixtures with text, two columns/table, rotation/labels, empty text, corruption and multi-attachment scope; test real PDFium subprocess, real SQLite FTS and real symlink/file substitution where OS permits. Example:
  ```python
  hits = search.lexical(scope_a, 'decisive finding', limit=1)
  assert [hit.source_id for hit in hits] == [authorized_source]
  assert evidence.read(scope_a, hits[0].id).excerpt == 'decisive finding'
  ```
- [ ] Run focused parser/security/search tests and confirm RED; implement registered-file ingestion, immutable versions and authorized retrieval.
- [ ] Run the focused tests with bounded subprocess waits; assert all pages accounted for and no falsely complete scan. Test cancellation kills owned parser only; inspect stderr on parser failure.
- [ ] Add real search/status/evidence UI, run TS checks/build and native page-opening smoke if permitted. Record measured page counts/bytes; no invented bbox.
- [ ] Commit and report A05–A14/A28–A30 evidence with material invariant to test mapping.

## Task 5: M3 provider protocols, capabilities, consent and budgets

**Files:** `providers/{models,base,ollama,openai,anthropic,gemini,registry,profiles,usage,embeddings}.py`, `security/secrets.py`, provider API/migrations and protocol fixtures/tests; `docs/MODELS_AND_BILLING.md`.

**Interfaces:** `GenerationProvider.generate(request, cancel_event) -> AsyncIterator[GenerationEvent]`, `EmbeddingProvider.embed(texts, model) -> EmbeddingBatch`, registry selected by explicit profile only. Events distinguish draft deltas, usage, final and error. Profiles persist settings/capability provenance, not plaintext credentials. Models/catalogs do not trigger generation.

**Requirements:** Verify current native docs and installed SDK/types before implementation. Real Ollama native protocol/catalog/embeddings, LM Studio and explicit OpenAI-compatible chat/embedding protocols, official OpenAI appropriate generation API, Anthropic Messages, Gemini generateContent/streamGenerateContent. Each handles protocol-specific streaming, images/schema where supported, explicit capabilities and model ID. HTTP pooled httpx with TLS validation, bounded timeouts, no redirect/retry. LOCAL requires explicit loopback and denies cloud model metadata/names; remote custom HTTPS hosts require explicit consent. Per-notebook/provider consent shows content categories; paid API block default. keyring failures allow memory-only storage with clear status. Call/job/session usage/reservations, versioned price config, unknown price blocks monetary cap; post-send timeout/cancel records BILLING_UNKNOWN. No fallback credential/provider.

- [x] Create protocol fixture tests parameterized per adapter for exact request contract, streaming chunks, invalid JSON/schema, 429, timeout and cancellation. Example:
  ```python
  with pytest.raises(EvidraError, match='RATE_LIMITED'):
      await collect(provider.generate(request, cancel_event))
  assert transport.request_count == 1
  ```
- [x] Execute focused tests to establish RED; use fixture HTTP transport/controlled local server only for provider I/O, real profile/usage persistence.
- [x] Implement native adapters, consent checks, capabilities, secret lifecycle and reservation/reconciliation. Keep generation separate from local embeddings.
- [x] Execute focused protocols/security/usage tests, Ruff/mypy. Live smoke only with explicitly supplied endpoint/model/credentials; otherwise report NOT_VERIFIED live.
- [x] Commit and record official URLs/protocol versions and A23–A26/A30 mapping. Catalog failures are explicit and manual model configuration remains available.


Task5 source/review completed at12b6aa7 after I1–I4/N1 fixes; actual scoped local Ollama generation/embedding passed. Initial RED fixture/capture deviations, failed helper configuration and all unverified native/paid/keyring/offline boundaries remain explicit in TEST_REPORT.md. Task6 owns the user-facing semantic/conversation consumer.

## Task 6: M3 semantic retrieval, conversations and model UI

**Files:** `retrieval/{vectors,fusion,context}.py`, `conversations/{service,validation}.py`, scoped conversation/provider/search routes and tests; `apps/zotero/src/ui/{Conversation,ProviderSettings,EvidencePanel}.tsx`, stream client.

**Interfaces:** Consume ScopeService, lexical evidence and provider protocols. Atomic embedding generation keyed model/revision/dimension/normalization; scoped vector IDs in compact blocks. Conversations bind one snapshot; runs record effective model, allowed evidence IDs, prompts/configuration and visible explanation only.

**Requirements:** Exact NumPy cosine search over permitted IDs in blocks, cache <=512MB, reject mismatched generations/dimensions and keep previous generation consistent until commit. RRF k60 of 40 lexical/40 vector candidates; up to12 diverse non-overlapping chunks within token budget; no assertion of full-corpus reading. Draft SSE with authenticated fetch/cursor and no token URL. Validate final schema and chosen evidence/excerpts against server records; fabricated anchors fail. No automatic repair retry (zero allowed; one only explicit authorized command with separate ledger). Scope revision recheck before final commit; removed historical evidence unavailable. Persist effective provenance/coverage and distinguish valid anchor/proposed support/human review. Settings implement provider/model/manual catalog/capability/consent/cost controls and stop actions; no model still permits lexical/manual workflows.

- [x] Write tests for unauthorized dominant vectors excluded before top-k, mismatched dimensions, revoked evidence during stream, fabricated evidence and bounded context. Example:
  ```python
  assert vector_search(scope_a, query, limit=1)[0].source_id == authorized_source
  with pytest.raises(EvidraError, match='INVALID_MODEL_OUTPUT'):
      validator.promote(scope_a, {'evidence_ids': ['invented-id']})
  ```
- [x] Observe RED, implement services and then real UI streaming/coverage/error handling. Never keep SQLite locks over provider I/O.
- [x] Run focused service/protocol tests and TS stream/security tests/typecheck/build; record no live-model claims without a real endpoint.
- [x] Commit and report A05–A10/A13–A15/A23–A26 with evidence.

Task6 source and bounded native conversation acceptance completed at `9bd75f45a9adfff605af044a2a021b446433e302`. See TEST_REPORT.md for exact reviewed XPI/engine identities, actual local generation, persisted-history/evidence navigation, cancellation and Reader checks. This slice does not close broader vision, paid-provider, corpus-performance or final UI/export acceptance.

## Task 7: M4 versioned forms and human-reviewed matrix

**Files:** `extraction/{forms,matrix}.py`, related API/migrations/tests, `apps/zotero/src/ui/{Matrix,FormEditor,ProposalReview}.tsx` and shared windowed list.

**Interfaces:** Versioned form fields, extraction proposals and append-only cell decisions with expected revision. Proposals require real evidence IDs and coverage; server assigns origin/principal. Paginated `get_matrix`, `propose_extractions`, human `decide_cell`.

**Requirements:** Text/number/boolean/enum/list/experimental-result fields, definitions/question/unit/rules/required. Initial computing template as SPEC §12. Multiple results preserve dataset/condition/unit/baseline/direction/original numeric representation. Absent value null plus six value states; independent four review states. Model output cannot set APPROVED. Reextraction never overwrites human-approved/corrected values; compare competing proposals and revision CAS. Human corrections/events include author/time/old/new. Windowed matrix, filters/source/status, cell selection, evidence side panel and concrete bulk review preview.

- [ ] Write parametrized schema/nullability/result-context tests and real SQLite concurrency test. Example:
  ```python
  matrix.approve(scope, proposal_a, expected_revision=0, author='Pesquisador')
  matrix.propose(scope, proposal_b)
  assert matrix.cell(scope, study, field).approved_value == 42
  with pytest.raises(EvidraError):
      matrix.correct(scope, study, field, 43, expected_revision=0, author='Pesquisador')
  ```
- [ ] Observe RED then implement forms/proposals/decisions and matrix UI using generated contracts.
- [ ] Run focused Python/TS tests, type checks and migration compatibility on existing synthetic notebooks; verify restart persistence.
- [ ] Commit and report A17–A19/A34 with invariant mapping.

## Task 8: M4 persistent jobs, extraction coverage and resume/cancel

**Files:** `jobs/{queue,worker,cache}.py`, `extraction/runner.py`, job API/migrations/tests, `apps/zotero/src/ui/Jobs.tsx` and extraction job setup.

**Interfaces:** Persistent job/unit lease and checkpoint APIs; enqueue systematic extraction enumerates all authorized studies/attachments/fields from frozen snapshot. Workers consume providers, evidence and matrix proposal services. Unit idempotency binds snapshot/study/form/field/method.

**Requirements:** QUEUED/RUNNING/PAUSED/WAITING_PROVIDER/PARTIAL/SUCCEEDED/FAILED/CANCELLED. One generator worker, parser limit separate. Lease transaction and backpressure; checkpoint each committed unit; restart paid sent units becomes BILLING_UNKNOWN and requires explicit reconciliation, never automatic resend. Search versus full scan coverage distinguishes pages/attachments/failures/missing files. NOT_FOUND_IN_SEARCH versus NOT_REPORTED_CANDIDATE correctly null, never infer zero. Recheck cancellation/scope before each provider call and commit; provider limit pauses without fallback. Cache keys include current access/snapshot/prompt/form/model/evidence/history, and cache reads reauthorize.

- [ ] Write real SQLite concurrent-claim and restart tests plus extraction coverage fixtures. Example:
  ```python
  queue.cancel(job_id)
  await worker.step()
  assert ledger.calls_after_cancel(job_id) == 0
  assert queue.get(job_id).state == 'CANCELLED'
  ```
- [ ] Observe RED, implement queue/worker/runner with deterministic injected clock and explicit resume commands.
- [ ] Run focused jobs/extraction tests including process interruption; verify no duplicate proposals, no approved-cell replacement and accurate missing/partial studies.
- [ ] Wire setup/progress/pause/resume/cancel/coverage UI, run UI checks/build and commit; report A16–A19/A22–A24.

## Task 9: M5 protocol, screening, synthesis, audit and approved-note outbox

**Files:** `screening/service.py`, `synthesis/service.py`, `audit/service.py`, `notebooks/protocol.py`, `storage/outbox.py`, API/migrations/tests; native note bridge and `ui/{Protocol,Screening,Research,NotePreview}.tsx`.

**Interfaces:** Versioned protocol/criterion/form, assistant proposals distinct from human screening decisions, versioned derived artifacts and approved write outbox with UUID. All model operations use existing authorized run/job pipeline. Native bridge applies a human-approved note intent only after current library permissions and scope check and acknowledges via readback.

**Source-provenance integration:** Apply the exact AI markers from the Integration contracts to every created AI-derived note and verify them during native readback. Retain the outbox UUID independently; do not modify original human notes or assume an unmarked third-party note has human provenance.

**Requirements:** Inclusion/exclusion criteria IDs/version/applicability; title/abstract vs full text stages, INCLUDE/EXCLUDE/UNCERTAIN proposals and evidence, absent content cannot infer exclusion. Local reviewer labels/conflicts with append-only observed counters, unknown historic counts stay unknown. Synthesis prefers approved cells; opt-in unreviewed proposals visibly distinct; incomplete studies yield explicit partial artifact. Comparisons retain contexts, no invented ranking. Audit pasted claims with four proposal support states, anchors distinct from support, indirectly cited works never presented as read. Artifact versions and human review. Note preview -> human approval -> outbox -> native permission check/create -> provenance UUID reconciliation/readback; never modify original notes and no automatic undo claim.

- [ ] Write protocol version/stage separation tests and outbox crash/readback idempotency tests. Example:
  ```python
  screening.propose(scope, decision='EXCLUDE', criterion_version=1)
  assert screening.human_decision(scope, study) is None
  assert outbox.approve(artifact_id, approval_key).id == outbox.approve(artifact_id, approval_key).id
  ```
- [ ] Observe RED, implement deterministic persistence first and model generation through existing contracts, then the real UI flows.
- [ ] Run focused provenance/authorization/outbox tests and TS bridge/typecheck/build. Native note smoke only in a separate synthetic profile, never in personal library.
- [ ] Commit and report A20–A22 and support/provenance limitations.

## Task 10: M6 restricted MCP stdio gateway and external-client setup

**Files:** `mcp/{server,connection}.py`, private MCP gateway routes, security/connection migrations/tests; UI MCP configuration/proposals and `docs/MCP_SETUP.md`.

**Interfaces:** `evidra-engine mcp --connection-file <path>` reads its own per-user-ACL connection file, never admin/provider secrets, and forwards to the running engine. Expose exactly get_notebook_status, list_sources, search_evidence, read_evidence, get_protocol, get_matrix, propose_extractions, propose_note through official SDK with explicit schemas.

**Requirements:** Tokens bind notebook/snapshot/principal/capabilities/expiry; read-only session cannot propose. Tool args never expand scope or accept paths/URLs/shell. Same domain scope checks, bridge heartbeat dependency, immediate connection revocation. Proposals origin EXTERNAL_CLIENT; client-reported model marked declared. No tool can apply notes or approve cells. Stdout protocol only; sanitized stderr. Connection UI creation/expiry/revocation and last-used status, manual official-client config preview without overwriting any existing config. Verify Codex/Claude Code/Gemini CLI docs and exact command forms.

- [ ] Test real MCP stdio subprocess handshake/list-tools/call-tools against real local HTTP engine and SQLite. Example:
  ```python
  denied = await mcp_client.call_tool('propose_note', {'text': 'Draft'})
  assert denied.isError
  assert not any(tool.name in {'run_javascript', 'read_file', 'apply_note'} for tool in tools)
  ```
- [ ] Observe RED; inspect installed SDK/types and implement only the contract above. Do not invent a replacement MCP transport/server.
- [ ] Run stdio scope/revocation/expiry/read-only/invalid evidence tests including closed bridge; check stdout has only protocol frames and no secret values in diagnostics.
- [ ] Commit, document usable local setup and report A07–A09/A27–A30 fixture/live scope.

## Task 11: M7 exports, secure backup/import and bibliography

**Files:** `exports/{notebook,csv,backup}.py`, related routes/tests, native translator export bridge and `ui/Exports.tsx`; export/import schema in generated contracts.

**Interfaces:** Export preview enumerates current authorized content/format/size/sensitivity, explicit create returns artifact; UI chooses file destination. Backup manifest includes schema_version/checksums and no credentials; restored external decisions retain imported provenance and require confirmed profile/source remapping.

**Requirements:** CSV per-study/per-result with explicit units/context/evidence/review; UTF-8/Excel option, textual formula injection neutralized without coercing numeric values. Complete versioned JSON and readable Markdown covering permitted protocol/members/doc versions/evidence/proposals/decisions/artifacts/history. Revoked content omitted from all export paths including historical backups, minimal tombstones explain omissions. Native BibTeX/RIS/CSL-JSON via verified Zotero translators for explicitly authorized item IDs, no required BBT/citekey inventions. Backups default no PDFs, optional authorized PDFs explicit preview size; validate hashes/version/size/schema/paths and reject zip-slip/bomb/symlink, never execute imported content or auto-write Zotero. SQLite backup API for consistent DB copy where used, not WAL file copy.

- [ ] Write real archive/CSV tests with hand-derived dangerous text and valid typed numbers plus malicious entries. Example:
  ```python
  assert csv_cell('=WEBSERVICE("https://bad")', kind='text').startswith("'")
  assert csv_cell(-3.5, kind='number') == -3.5
  with pytest.raises(EvidraError):
      restore_zip(zip_with_entry('../escape.txt'), destination)
  assert not (destination.parent / 'escape.txt').exists()
  ```
- [ ] Observe RED, implement scoped exports/round-trip restoration and native bibliography bridge, then explicit UI previews/download actions.
- [ ] Run revocation/roundtrip/provenance/archives tests and TS checks; verify approved values and immutable versions survive restore without granting cross-profile source access.
- [ ] Commit and report A05/A30–A32 with actual artifact hashes for synthetic export fixtures.

## Task 12: M7 distribution, diagnostics, accessibility, benchmark and acceptance

**Files:** `scripts/{check,package,dev}.ps1`, `scripts/check.sh`, PyInstaller spec/launcher; benchmark/native smoke scripts and authorized synthetic fixtures; final README, ARCHITECTURE, INSTALL_WINDOWS, PRIVACY_AND_LIMITS, TEST_REPORT, ACCEPTANCE_MATRIX, STATE, THIRD_PARTY_NOTICES.

**Interfaces:** Consume all code above. `npm ci`, `npm run typecheck`, `npm test`, `npm run build:plugin`, frozen uv sync/Ruff/pytest/mypy commands must work from root. Package `evidra-0.1.0.xpi`, `evidra-engine-0.1.0-windows-x64.zip`, SHA256SUMS.txt and release-manifest.json. PyInstaller onedir includes migrations, PDFium, MCP and all runtime files; no model weights.

**Requirements:** Verify license notices from actual dependencies; no remote updater/release. Check packaged engine without Python/Node on PATH in disposable Windows test context and record clean-Windows limitation if a clean machine is unavailable. Manifest protocol/version/architecture/hashes; first-use binary change verification. Diagnostics explain missing engine/model, incompatible version/port/protocol and invalid permissions. Complete locale/keyboard/focus/theme and virtualized long list/matrix checks with accessibility evidence. Cache limits derived material only. Benchmark synthetic/authorized 1000 papers/50000 chunks with actual hardware/seed, bytes/pages, warm lexical/fusion p95 excluding model, parser and memory/cache/resume separately. Read local compute policy before sustained benchmark. Never call synthetic results real-corpus or invented live model speed.

- [ ] Write package integrity/launch behavior check (not source-text assertions), locale key parity + semantic accessibility check only where not already covered; test engine lifetime/heartbeat/cleanup and corrupted manifest error.
- [ ] Execute all local checks once final code is ready; `scripts/check.ps1` produces machine-readable report and full logs with exact counts and command return codes, preserving causal failures.
- [ ] Build XPI/Windows engine, verify archive paths/checksums, start packaged engine from disposable paths and exercise an actual authenticated notebook/search/matrix/export flow.
- [ ] Perform authorized native profile end-to-end flow, evidence click and lifecycle cleanup. Capture actual plugin UI if the allowed capability exists; label any unavailable native/screenshot/offline-network/clean-Windows evidence explicitly.
- [ ] Benchmark after hardware/ownership preflight; measure performance without model calls. Inspect results and optimize only measured bottlenecks, rerun affected benchmark if changed.
- [ ] Review all 36 acceptance rows against exact files/test/receipt; final whole-project independent review, fix real findings, rerun affected checks and regenerate hashes. Save honest STATE if any required result remains blocked.
- [ ] Commit and deliver exact artifact paths/hashes, installation instructions, adapters implemented/live status, tests added/modified/executed and unresolved requirements. No complete-v1 claim unless every mandatory requirement has evidence.
