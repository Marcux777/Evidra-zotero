# Evidra test report

Date: 2026-09-05. Status: implementation in progress. No acceptance criterion is declared passed by environment setup alone.

## Categories

- IMPLEMENTED: production behavior exists; this is not by itself verification.
- VERIFIED_WITH_FIXTURES: repeatable executed check against synthetic/authorized fixtures.
- VERIFIED_LIVE: the actual external application/provider/runtime was exercised.
- NOT_VERIFIED/BLOCKED: missing implementation, unrun check or blocked environment; include its reason.

## Executed environment checks

| Check | Command | Observed result |
|---|---|---|
| Local Zotero before update | `rtk py -3 C:\Users\marcu\plugins\zotero\skills\zotero\scripts\zotero.py start` then `status --json` | Version 9.0.6, API and Connector 200; incompatible with target. |
| Official installer | Official download URL; Windows Get-AuthenticodeSignature after explicit import of installed Security module | Authenticode Valid, Corporation for Digital Scholarship, SHA-256 `4b0f508ef28bff9a7b6cc2299eb18f2431d966d91a462ce29e5bc609d5e07036`. |
| Authorized update | Verified no zotero.exe process after user closed it; executed downloaded official installer with `/S` | Exit 0. No forced termination. |
| Zotero after update | Executable/registry version check, personal helper `start`, `status --json` | Version 10.0.1, schema 44, API and Connector 200. This verifies the host, not the future Evidra plugin. |
| JavaScript dependencies | `rtk npm ci --no-audit --no-fund`, `rtk npm ls --depth=0` | 126 packages installed, dependency tree valid. Transitive test dependency warning: deprecated whatwg-encoding@3.1.1. |
| Python dependencies | `rtk uv sync --project services/engine --frozen --python C:\Users\marcu\AppData\Roaming\uv\python\cpython-3.12.11-windows-x86_64-none\python.exe --no-python-downloads` | 63 packages installed in project .venv; no new interpreter installed. |
| Runtime/FTS5 | `rtk uv run --project services/engine --no-sync python -c <imports and CREATE VIRTUAL TABLE USING fts5>` | Python 3.12.11, SQLite 3.49.1, FTS5 available, FastAPI 0.141.1, Pydantic 2.13.5. |

Initial dependency resolution failure: `ERESOLVE` from TypeScript 7.0.2 versus openapi-typescript's `^5.x` peer. Corrected the manifest to verified TypeScript 5.9.3; lock-only resolution and npm ci then succeeded. No `--force` or `--legacy-peer-deps` used. Initial `py -3.12` registry entry pointed to an absent StabilityMatrix interpreter; uv's already-installed Python 3.12.11 was discovered and verified instead. Winget lookup failed; it did not perform the update.

## Behavioral tests

Task 1 implementation commit: `2759afbae9638e742bf96aa2174e26b2e3efbca8`. Independent review passed after the fix commit described below. No model call formed part of Task 1. A later authorized local model-environment smoke is documented below; paid APIs remain unused. No Zotero test profile has yet been created or loaded with Evidra.

| Check | Exact final command | Observed result / full evidence |
|---|---|---|
| Auth, persistence, migrations, concurrency, request limits and Windows file boundary | `rtk proxy uv run --project services/engine --no-sync pytest services/engine/tests/test_runtime_notebooks.py -q` | 21 passed, 1 warning, 5.88s, exit 0; `.local/task-1/green-0.log`. |
| Python lint | `rtk proxy uv run --project services/engine --no-sync ruff check services/engine/src/evidra services/engine/tests/test_runtime_notebooks.py` | All checks passed; `.local/task-1/green-1.log`. |
| Strict types | `rtk proxy uv run --project services/engine --no-sync mypy --strict services/engine/src/evidra` | No issues in 16 source files; `.local/task-1/green-2.log`. |
| Wheel build/package data | `rtk proxy uv build services/engine --wheel --offline --out-dir .local/task-1/dist` | Exit 0; initial SQL migration is in the ZIP; `.local/task-1/green-3.log`, `wheel-receipt.json`. |
| Real process restart and expiration | `rtk proxy uv run --project services/engine --no-sync python .local/task-1/smoke.py` | Two sessions, exit 0 each, same persisted notebook; handshake consumed, receipt removed, socket closed; `.local/task-1/smoke-receipt.json`. |
| Real Windows path substitution | `rtk proxy uv run --project services/engine --no-sync python .local/task-1/path_security.py` | Hardlink and junction ancestor rejected as UNSAFE_PATH; `.local/task-1/path-security-receipt.json`. |

RED evidence: `.local/task-1/red-api.log` contains 15 expected missing-API failures. The first outer PowerShell wrapper did not propagate the test exit code, so that wrapper's success is not a RED claim. Subsequent direct focused runs reproduced missing CLI, unsanitized storage failure, absent receipt cleanup and closed-database backup errors before their fixes. Exact commands, error causes and invariant mappings are preserved in `.superpowers/sdd/IMPLEMENTATION_PLAN/task-1-report.md`.

Visible upstream warning: `starlette/testclient.py:53: DeprecationWarning: The anyio.abc.BlockingPortal alias is deprecated, use anyio.from_thread.BlockingPortal instead.` No blanket suppression or dependency switch was added. The initial ACL command failed because Get-Acl could not autoload the installed Security module; original stderr is `.local/task-1/acl-error.log`. Explicit import of the verified installed module fixed that cause; an intervening parser error remains in `acl-error-explicit-import.log`.

Wheel SHA-256: `1e11fdf3707e7fd234f99958076bd95b6a339b2917cf9e6d39306e3beb2d33ce`. Synthetic smoke database SHA-256: `1165d781326586a17f84bca1bae3914c5cb5722d14b420f9bee50e57a1e15d49`; SQLite integrity_check returned `ok`. These identify Task 1 evidence, not final release artifacts.

### Task 1 review fixes

Independent review found that delayed request-body intake could outlive heartbeat authorization and that the CLI discarded causal startup diagnostics. Fix commit `a47c06e3870b8e0715dfff3a68b69fd449c36681` rechecks liveness immediately before dispatch and emits allowlisted structured diagnostic causes. Raw validation inputs, arbitrary messages, process arguments, environment and personal paths remain excluded. The original exception chain remains internally intact until the process boundary.

The delayed-body check first returned 200 at 31 seconds (RED), then correctly returned 503 (GREEN). Three actual CLI processes tested a missing private handshake file, a malformed protected handshake and an occupied exclusive socket; every process exited 1, kept stdout empty, and returned distinguishable safe causal diagnostics on stderr. Tests assert that session/provider-secret markers and fixture paths are absent. Original ACL development logs remain retained.

Final covering command: `rtk proxy uv run --project services/engine --no-sync pytest services/engine/tests/test_runtime_notebooks.py -k 'auth_boundary or cli_failure or windows_handshake' -q`: **18 passed, 7 deselected, 1 upstream warning, 8.22s**, exit 0. Changed-file Ruff and strict mypy also passed. Full receipts: `.local/task-1/fix1-final-0.log` through `fix1-final-2.log`; RED/GREEN outputs are `fix1-f1-red.log`, `fix1-f1-green.log`, `fix1-f2-red.log`, `fix1-f2-green.log`. The scoped independent re-review confirmed both findings addressed with no new Critical/Important breakage. The earlier wheel/process-success receipts identify the initial implementation commit and were not rerun or misattributed to this fix.

## Preliminary packaged M0 runtime

While Task 2 was implemented, root built a disposable PyInstaller onedir from the reviewed Task 1 runtime. This is a development package for native test preparation, not the final v1 distribution. Build script: `.local/build-native-engine.py`; full log: `.local/native-smoke/m0-engine-20260905T213413Z/build.log`. PyInstaller 6.22.2 completed its build at log elapsed 20.083s. Its 213 runtime files total 67,557,816 bytes.

The initial preparation then failed with Pydantic `files.203.path` rejecting the real dependency filename `_internal/setuptools/_vendor/jaraco/text/Lorem ipsum.txt`. Task 2 extended its existing manifest regression check, observed RED, allowed interior spaces while retaining unsafe-segment rejection, regenerated contracts and passed the covering checks. Root resumed only manifest emission, preserving the successful build and original error in `manifest-failure.log`. The subsequent harness initially failed before launching the engine because a plain environment dictionary used `SystemRoot` instead of its uppercase key `SYSTEMROOT`; `smoke-c08f625d9091/harness-failure.log` retains that cause, and the unused own synthetic handshake was removed.

Corrected command: `rtk uv run --project services/engine --no-sync python .local/native-smoke/check-packaged-engine.py .local/native-smoke/m0-engine-20260905T213413Z/dist/evidra-engine`. Exit 0. The child PATH was only `C:\WINDOWS\System32`, with Python/Node-specific environment variables removed. The actual frozen process (PID 4120, port 50881) passed minimal health, denied unauthenticated status, created/idempotently read one notebook, expired its heartbeat and exited 0. Handshake consumed, receipt removed, socket closed, SQLite integrity_check `ok`; output logs were checked for the generated secret.

Receipt: `.local/native-smoke/m0-engine-20260905T213413Z/smoke-be843d60f511/smoke-receipt.json`. Manifest SHA-256 `96906d631de3e6102b94c59083a3b638ed84bfb5e97e565b202893817b96294f`; executable SHA-256 `53f79523fdddc24592dce73770fc97a78033222d8fb5b256596780cfc16c974a`. No Zotero process or provider was invoked. A host without Python/Node installed, native plugin lifecycle and all later v1 services remain unverified by this preliminary check.

Compute preflight: Windows 11 Home x64, AMD Ryzen 7 7700, 8 cores/8 logical processors, 32,679,372 KiB visible RAM and 13,523,256 KiB free. An initial transient CPU load sample was 79%; a follow-up process counter showed 667 idle out of 793 aggregate units and no sustained Python/PyInstaller job. This used the installed default CPU build path without changing fidelity or claiming GPU acceleration; no other process was terminated. Future benchmarks require a fresh ownership/availability check.

## Permanent test-change accounting

Task 2 initial commit `cae92f6ba3b982e1a685fa9bda45a537fba39a5f`: 10 new Vitest tests in three files; no existing tests modified/removed. The task report maps them to message capability checks, Markdown isolation, diagnostic redaction, React notebook flow, real payload integrity, controller consent/lifetime, concurrent startup/shutdown, temporary handshake failure, native-dialog cleanup and cloned-profile identity. Final initial commands `rtk npm run typecheck`, `rtk npm test`, targeted Ruff and `rtk npm run build:plugin` exited0. Receipts `.local/task-2/final-reviewed-check-{0,1,2}.log` and `.local/task-2/dist/build-receipt.json`. Initial XPI: 87,667 bytes, SHA256 `3e96cc93501cff3fc21b354df92b5a522d73491e631731d24451ffa1991a7024`. This artifact is under review and will change after fixes.

Task 2's production adapter ran against real Windows ACL commands and the preliminary frozen engine using a Node replacement for Gecko host APIs. Receipt `.local/task-2/adapter-1788645412263/receipt.json` confirms creation/readback of synthetic notebook `f6d462d5-40ef-4a38-9fb2-44aaadc6fc7e` and owned PID39884 termination. It records forced Windows termination; it does not prove graceful cleanup or native Zotero execution. Independent review found stale consent across fingerprint changes, stale notebook lists across mounted panels, and two paths discarding causes. Fix evidence follows; actual native acceptance remains unverified.

### Task 2 review fixes

Fix commit `4240646b318ad2b2a4306f85c4f00b6bbb549b35` binds executable consent to the acknowledged fingerprint, refreshes current notebook pages with the existing ten-second poll while rejecting stale responses, and retains sanitized structural causes for saved-package and heartbeat errors. Privileged startup re-verifies the payload and refuses a fingerprint race before any launch. Unsaved controls survive cross-panel refresh. The cross-panel convergence bound is a poll interval plus request latency, with polls deferred during local operations.

Five new cases cover those material findings; two existing cases were updated for the required diagnostic reporter, eight existing cases ran unchanged, and none were removed. RED/GREEN receipts are `.local/task-2/review-f1{red,green}.log`, `review-f2{red,green}.log`, `review-f3{red0,green0,red1,green1}.log`; the appended task report gives exact commands and assertions. Final covering `rtk npm run typecheck` and `rtk npm test` passed: 15 tests in four files; logs `review-final-check-{0,1}.log`. XPI build and whitespace check also exited0. Python/schema files were unchanged, so their earlier checks were not repeated.

Rebuilt XPI: 88,142 bytes, SHA256 `f71bb79ffb2e510845c9799171d3b19f92cde448ada8e15c10c3021f5be61166`; the preparation receipt carries the same hash. The updated controlled adapter receipt `.local/task-2/adapter-1788646692511/receipt.json` records notebook `76150d3d-2ecf-4015-8521-35b739565134` and PID624 termination (SIGTERM mapped to exit -9). It remains controlled-adapter evidence, not native Zotero or graceful termination evidence. Independent scoped re-review confirmed F1–F3 ADDRESSED with no new Critical/Important breakage; report `.superpowers/sdd/IMPLEMENTATION_PLAN/task-2-rereview1.md`.

Setup commit added no permanent tests: only approved specifications, configuration/lockfiles and a nonbehavioral package initializer changed. Subsequent behavioral/security/persistence checks are tracked by task reports and the acceptance matrix. Extra checks above the ordinary zero-or-one default must each name a distinct material invariant.

Task 1: 1 added test file, 9 test functions, 21 collected/executed cases; 0 pre-existing tests modified or removed. The report maps each function to a separate material invariant: session authorization, durable idempotency/profile isolation, bounded/redacted input, transactional sanitized storage errors, migration lifecycle, concurrent creation, credential file ACL/claim, exclusive listener binding, and safe receipt cleanup.

Task 1 fix round 1: one existing function gained one delayed-body case; one new function has three real CLI failure cases; no tests removed. The file now contains 10 functions and 25 cases. Eighteen covering cases were executed after the fix; seven unrelated persistence/lifecycle cases retain their earlier execution evidence. The final full-project check will report its own count at its exact revision.

## Authorized live local model environment

After the user's explicit installation authorization, root installed official portable Ollama0.33.3 plus qwen3:4b and qwen3-embedding:0.6b. Archive verification, hardware/ownership preflight, local-only startup, actual model digests and full request/response receipts are recorded in LOCAL_MODEL_TEST_ENVIRONMENT.md and `.local/ollama/`. The server binds only127.0.0.1:11434 with cloud disabled.

Executed command: `rtk uv run --project services/engine --no-sync python .local/ollama/smoke-local.py`, exit0 at2026-09-05T22:04:37Z. One preload, one structured streaming generation and one three-text embedding batch succeeded. Both models report fullGPU placement. The generation returned the expected synthetic87.5% value in31chunks; embeddings are finite normalized3x1024. This is a raw provider-service smoke, not an Evidra adapter/retrieval test. No new permanent tests were added for installing that test environment. Future adapter/code changes need their own regression and live integration evidence. LMStudio, paid-provider and external-network-blocked acceptance remain unverified.
