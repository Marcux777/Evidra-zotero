# Task8 implementation report

Status: IMPLEMENTED; focused source verification PASS. Independent review and native/live-provider acceptance remain controller-owned and pending. This is not full M4 or project completion.

Base: `b7ead30d894c29c7d9f2ae5d2017b9b6ead912ca`, branch `codex/implement-evidra`. Final source: `8dfb5e2aa5a08f5fbfac6f314189c6b1be239e30`.

## Implemented contracts

Migration008 adds durable extraction jobs, study/field units, exact batch preparations, validated outputs, original call identities, scoped cache references and command idempotency. Migration007 is unchanged. Preparation creates PAUSED jobs without model calls, freezes the form/field lineage/profile/settings and enumerates every currently granted study and attachment. Existing Task4 indexing remains the prerequisite; missing, unavailable, unindexed and failed content remains visible in coverage. No parser supervisor, native process, service or model download was added.

SQLite transactional claim admits one generator unit across extraction jobs, and extraction/conversation admission shares the existing single-generation boundary. Each claim has a unique lease token, 120-second expiry and 10-second renewal. Stale renewal, commit and cleanup cannot acquire the next claim after explicit resume. The worker never holds a database lock across model I/O. Parsing remains independently bounded by IngestionService. Queue limits are 100000 stored units overall and 30000 per preparation; each unit selects at most 10000 chunks. Exact preparation storage is capped at 128 MiB and cache references at 10000 with LRU removal of references only.

Each batch contains up to four authorized evidence chunks. The persisted preview includes the exact effective system instructions, field-specific output schema, prompt, provider profile and input estimate used at dispatch. Context sizing is explicitly `utf8-bytes-plus-overhead-v1`; it respects the requested context and Ollama window but is never represented as a verified paid-call InputBound. ProviderRegistry.generate remains the sole transport/reservation/SENT/usage boundary. Every attempt's call_id is persisted; a proved NOT_SENT attempt may obtain a new identity only after explicit resume. SENT, BILLING_UNKNOWN or confirmed billing without committed output cannot be resent after interruption. Explicit skip acknowledges the lost unit while retaining uncertain accounting; it does not resolve a charge or claim successful extraction.

Validated batch outputs and measured page/chunk counts checkpoint independently. Final trusted result, competing proposal and unit completion share one guarded transaction. No generated output writes a human decision or approved value. MODEL_RUN requires an exact immutable server-produced result; evidence-free measured coverage uses COVERAGE_CHECK with model=null. All original processed evidence and planned attachment grants are reauthorized on reads. Cache keys bind notebook/snapshot/current access, frozen form and lineage, field, profile/model/configuration, exact system/schema/prompt, evidence/coverage and empty authorized history. Hits retain the original proposal ID and attribution. Cache clearing preserves proposals and human decisions; a process-specific access fingerprint conservatively causes cache misses after restart.

SEARCH absence is null/NOT_FOUND_IN_SEARCH. A FULL_SCAN starts as PARTIAL_SCAN and becomes FULL_SCAN only after every granted page/chunk has actually been processed without missing or failed content. Only then can unanimous batch search misses propose null/NOT_REPORTED_CANDIDATE. Distinct list/experimental results from separate batches are retained with dataset, metric, condition, unit, baseline, direction and literal/normalized number; conflicting values for the same experimental context produce CONFLICTING. Oversized combined proposals fail explicitly rather than silently dropping results. Original batch outputs remain durable. A job with incomplete coverage finishes PARTIAL, not SUCCEEDED.

Typed Pydantic/OpenAPI-generated JobCommand operations are wired through the actual EngineController allowlist and native DocumentBridge. Job access pages revalidate complete authorized sibling metadata while registering only server-declared dependent PDFs. Status-only header reads and pause/cancel/skip bypass document registration. UI commands use explicit buttons and 32-byte getRandomValues idempotency keys. Uncertain writes retry the identical operation; stale asynchronous reads cannot overwrite a cancellation. Setup, exact preparation, progress, pause/resume/cancel, reconciliation skip, cache clearing, windowed units and paged coverage are present in PT-BR/en-US. Queued units with no checkpoint explicitly say “Cobertura pendente; nenhum lote confirmado” / “Coverage pending; no committed batches”. Existing human proposal labels remain distinct from model/coverage producers.

## Tests added, changed and reused

Added `services/engine/tests/test_jobs.py`: nine test functions, fourteen parameterized cases in the final file. Coverage includes actual SQLite claims, checkpoint/cache/proposal preservation, complete/partial/search/no-hit coverage, absent attachment/blank PDF page, real version7-to8 migration, real child-process interruption after the second SENT boundary, blocked resend, in-flight cancel/revocation, stale claim cleanup after resume, coverage-only grant revocation and distinct/conflicting experimental contexts. The child uses controlled httpx transport and exits71; it is an actual isolated Python process, not a simulated restart flag.

Added `apps/zotero/tests/jobs-ui.test.tsx`: one case exercises the real component/generated command parser, uncertain same-key retry, exact preparation before start, missing coverage, explicit pending wording and cancellation during a delayed preview. Added one job-specific case to existing `documents-bridge.test.ts`, using production SourceBridge/DocumentBridge with controlled native APIs and variable-size access pages. Modified existing `engine.test.ts` allowlist case with permitted/rejected job routes. Modified the existing historical version6-to7 test in `test_matrix.py` only to isolate its historical app startup from the newly introduced JobQueue. No tests removed. Existing jobs cases were expanded as defects were reproduced; that does not count as additional independent suites.

Existing jobs/matrix/conversations/provider-security integration suite passed75 cases before final edge corrections. The affected jobs/matrix suites were rerun after lease/grant corrections (26 cases); the full jobs suite passed13 after aggregation, followed by the final two-case distinct/conflicting aggregation check (twelve other cases deselected). These counts overlap and must not be added together. Existing matrix tests exercise all six value kinds/states, CAS, lineage, bulk atomicity and human decision persistence. Existing provider-security tests exercise the real registry admission/accounting and no-substitution boundaries using controlled transport, not paid traffic.

## Original failures and verification receipts

All commands were invoked through `rtk`; inner commands below omit that wrapper for readability. Full raw logs remain under `.local/task08/`, hashed in `evidence-manifest.json`.

| Command / affected path | Result and causal evidence |
|---|---|
| `uv run --project services/engine --no-sync pytest services/engine/tests/test_jobs.py -q` initial RED | Missing job routes produced two404 failures, `backend-red.log`. Initial PowerShell wrapper incorrectly returned0; pytest's failure output is the RED evidence, not the outer exit code. |
| Measured-coverage RED | Prepared units incorrectly advertised FULL_SCAN, `coverage-red.log`; fixed to initial PARTIAL_SCAN. |
| SQLite restart/integration failures | `integration-first.log` retained the cache/coverage and historical fixture errors; `restart-check.log` retained a test-helper idempotency collision. Both were fixed without replacing production accounting/transport. |
| `npm test -- apps/zotero/tests/jobs-ui.test.tsx` | `ui-red.log`: expected missing Jobs component assertion; `ui-first.log`: first UI case passed. |
| Expired-lease regression | `lease-red.log`: old owner still passed require_lease after a new claim; unique claim tokens fixed it. `lease-green.log`:11 jobs cases passed. |
| Coverage-only authorization regression | `coverage-grant-red.log`: result stayed readable after its only attachment grant was removed. Trusted-result grant checks fixed this; `backend-final-check.log`:26 jobs+matrix cases passed. |
| Distinct experimental results regression | `multiple-results-red.log`: distinct datasets were collapsed into CONFLICTING. `multiple-results-green.log`:13 jobs cases passed; `multiple-results-final.log`: final distinct/conflicting pair passed,12 deselected. |
| `uv run --project services/engine --no-sync pytest services/engine/tests/test_jobs.py services/engine/tests/test_matrix.py services/engine/tests/test_conversations.py services/engine/tests/test_provider_security.py -q` | `backend-green.log`:75 passed, one upstream Starlette/Anyio deprecation warning,31.37s. Later affected-path checks above supersede changed content. |
| `npm test -- apps/zotero/tests/jobs-ui.test.tsx apps/zotero/tests/documents-bridge.test.ts apps/zotero/tests/engine.test.ts` | `ui-bridge-check.log`: one fixture error split the same identity across pages, overwriting its authorized contents. Corrected to distinct source identities. `ui-bridge-green.log`:44 passed across3 files. Final pending-label change: `coverage-ui-final.log`,1 passed. |
| `npm run typecheck` | `ui-typescript-final.log` and final label version `typescript-label-final.log`:PASS. |
| `uv run --project services/engine --no-sync mypy --config-file services/engine/pyproject.toml ...` | `backend-mypy.log`:15 source files passed; final lease/matrix jobs scope `backend-strict-final.log`:6 passed. Aggregation needed a contexts annotation (`aggregation-types.log`); `aggregation-types-green.log`:1 affected file passed under the strict project config. |
| `uv run --project services/engine --no-sync ruff check ...` | Original test import/line diagnostics in `backend-ruff-final.log`, corrected in `backend-ruff-green.log`. Aggregation long literal in `aggregation-ruff.log`, corrected in final `aggregation-ruff-green.log`:PASS. |
| `npm run generate:contracts` | `contracts-backend-final.log`:generated contracts/validators successfully. No API shape changed after this generation. |
| Unique plugin build using the existing `scripts/build-plugin.mjs` algorithm | `ui-build-final.log`:esbuild and package verification PASS,12 resources,294682 bytes. `.local/task08/build-unique.mjs` changes output directories only and preserves the source build algorithm. No installed/native payload was overwritten. |

Final XPI: `.local/task08/dist-2026-09-06T17-06-12-704Z/evidra-0.1.0.xpi`, SHA256 `b651a35df00c2f2f45a02c5ea0d4cc3563c8d227fac7596a73e013ff9a4130dc`. Its build receipt records native_acceptance=NOT_VERIFIED. PowerShell logs can label normal esbuild stderr as NativeCommandError; the captured child exit was0 and package validation succeeded. No native performance result is inferred from build duration or controlled UI tests.

## Acceptance mapping and explicit limits

| Row | Supplied evidence | Remaining boundary |
|---|---|---|
| A16 | Frozen study/field/content enumeration; actual counts; blank page plus missing PDF; partial/search/full distinctions; explicit pending UI | Controller native job journey and target-scale measurements pending |
| A17 | Null states in all four scan/search absence cases; zero-call COVERAGE_CHECK; complete scan only proposes NOT_REPORTED_CANDIDATE | Native model semantic behavior pending |
| A18 | Real registry extraction adds a competing model proposal while preserving an approved manual cell; cache creates no duplicate | Later MCP producer and controller native extraction pending |
| A19 | Actual multi-batch transport produces multiple structured datasets without losing context; conflicting same-context values remain null/CONFLICTING | Native multiple-result rendering/model behavior pending |
| A22 | Real child process exits after one checkpoint and next SENT; checkpoint survives restart; no new attempt or duplicate proposal; stale lease cannot regain authority | Native packaged restart, notes/outbox in later tasks pending |
| A23 | Cancel before dispatch produces zero calls; in-flight cancel/revocation prevents proposal/next batch; status/UI cancel bypass slow reads; restart exposes BILLING_UNKNOWN and explicit skip | Native cancellation latency/cost observation pending; no refund claim |
| A24 | Jobs use only existing ProviderRegistry, WAITING_PROVIDER classifications, explicit profile resume and durable attempt identity; existing registry security checks passed | No paid job or live-provider limit test run; error/limit source behavior is not paid-service acceptance |

No performance claim for1000 articles/50000 chunks,300ms UI action or p95 retrieval is made. All provider tests used controlled local transport. No personal Zotero access, native-profile/model-service operation, paid call, credential access, public release, push, merge or note write was performed. Missing/failed inputs are reported; uncertain sends are blocked rather than retried. Root owns remaining native validation and independent review.

## Commits, ownership and Task9 handoff

- `acd28bbbc16aa9a7bebb86f770ac734fe9903241`: durable scoped backend, migration008 and generated contracts.
- `4d0417a5f8cc88cd8658f4ae062b0b4b9ad9bd6f`: claim-specific lease ownership and coverage-grant reauthorization.
- `879e6b695f8d7a9109672b9ec0f2a85a6ba77e85`: UI, typed bridge and actual allowlist integration.
- `bdde0d0fc16ea318c31f52a70a55f9682f2f0e42`: contextual aggregation and explicit pending label.
- `8dfb5e2aa5a08f5fbfac6f314189c6b1be239e30`: long-literal formatting correction; concatenated text/behavior unchanged. The prior aggregation commit preceded the last Ruff correction; final lint passes and the original diagnostic is preserved.

Four Git preflights, owned staged diffs and whitespace checks were performed; only task-owned paths were committed. The evidence manifest binds this report, original logs, changed committed source blobs and final XPI. Report-only commit identity is available from Git. Production source/index ownership returns to root at handoff.

For Task9, reuse ProviderRegistry.generate with trusted CallIdentity for single admission, reservation/SENT and post-failure accounting, plus its cancellation Event. JobQueue exposes guarded claim/lease/renew/control, exact batch checkpoints and restart uncertainty as concrete extraction services. There is no generic future job-kind registry or speculative summary handler. A later synthesis consumer must define its own scoped inputs and validated output transaction while preserving these admission/accounting/recovery boundaries; it cannot treat this extraction-specific unit schema as an already implemented synthesis engine.
