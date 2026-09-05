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

Task 1 implementation commit: `2759afbae9638e742bf96aa2174e26b2e3efbca8`. Independent review passed after the fix commit described below. No smoke against model endpoints or paid APIs has run. No Zotero test profile has yet been created or loaded with Evidra.

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

## Test-change accounting

Setup commit added no permanent tests: only approved specifications, configuration/lockfiles and a nonbehavioral package initializer changed. Subsequent behavioral/security/persistence checks are tracked by task reports and the acceptance matrix. Extra checks above the ordinary zero-or-one default must each name a distinct material invariant.

Task 1: 1 added test file, 9 test functions, 21 collected/executed cases; 0 pre-existing tests modified or removed. The report maps each function to a separate material invariant: session authorization, durable idempotency/profile isolation, bounded/redacted input, transactional sanitized storage errors, migration lifecycle, concurrent creation, credential file ACL/claim, exclusive listener binding, and safe receipt cleanup.

Task 1 fix round 1: one existing function gained one delayed-body case; one new function has three real CLI failure cases; no tests removed. The file now contains 10 functions and 25 cases. Eighteen covering cases were executed after the fix; seven unrelated persistence/lifecycle cases retain their earlier execution evidence. The final full-project check will report its own count at its exact revision.

