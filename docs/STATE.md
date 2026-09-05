# Evidra implementation state

Updated: 2026-09-05. Owner: current Codex task in C:/p/evidra-zotero. Branch: codex/implement-evidra.

The full v1 implementation is in progress, not complete. Task 1's engine implementation and focused Windows checks passed independent review after one fix round. No complete native milestone or end-to-end acceptance criterion is declared passed. The supplied SPEC.md is preserved unchanged and IMPLEMENTATION_PLAN.md decomposes M0–M7 into twelve tasks.

## Environment and authorizations

- User authorized implementation, local dependency installation, and updating the existing Zotero application; closed Zotero before installer execution.
- Zotero updated 9.0.6 -> 10.0.1 with official digitally signed installer; silent install returned 0; executable, registry and the personal helper's start/status verified 10.0.1 and local API/Connector HTTP 200. No personal-library content was selected or changed by the agent. The application owns its normal version upgrade.
- Installer SHA-256: `4b0f508ef28bff9a7b6cc2299eb18f2431d966d91a462ce29e5bc609d5e07036`; source https://download.zotero.org/client/release/10.0.1/Zotero-10.0.1_x64_setup.exe. Authenticode status Valid, Corporation for Digital Scholarship. Local download receipt: `.local/installers/download-receipt.json`.
- Node 22.15.0, npm 10.9.2, uv 0.11.28, actual Python 3.12.11 at C:/Users/marcu/AppData/Roaming/uv/python/cpython-3.12.11-windows-x86_64-none/python.exe. The `py -3.12` launcher failed because the registered StabilityMatrix path was stale; no interpreter substitution or new Python install was used.
- `npm ci --no-audit --no-fund` installed 126 packages; `uv sync --project services/engine --frozen --python <verified-python> --no-python-downloads` installed 63 packages. npm warned of transitive deprecated whatwg-encoding in test-only jsdom.
- Initial npm resolution failed ERESOLVE because openapi-typescript requires TypeScript ^5.x. Pinning verified TypeScript 5.9.3 resolved it; no force/legacy-peer override. Original npm diagnostic logs remain in the user's npm cache with timestamp 2026-09-05T20_32_57_449Z.
- winget lookup failed to update its source / find the initial queried package. Update used the independently verified official Zotero download, not winget. PowerShell utility/security modules were absent from autoload search; explicitly importing the installed Security module enabled signature validation. Hashing used Python hashlib.

## Current files and verification

Task 1 commit `2759afbae9638e742bf96aa2174e26b2e3efbca8` adds the authenticated loopback engine, heartbeat, private one-use Windows handshake, versioned SQLite storage and persistent/idempotent notebooks. Nine permanent test functions collect 21 cases; all passed. Ruff and strict mypy passed on 16 source files. The upstream Starlette/AnyIO deprecation warning remains visible and documented.

Review fix `a47c06e3870b8e0715dfff3a68b69fd449c36681` corrects slow-body heartbeat expiry and adds sanitized causal CLI diagnostics. The final covering run passed 18 cases (seven unrelated cases not repeated); changed-file Ruff/mypy passed. There are now 25 cases in ten functions. Scoped independent re-review found both findings addressed and no new Critical/Important breakage; see the appended fix report for exact RED/GREEN evidence.

Two real hidden engine processes exercised restart persistence, authentication, heartbeat expiration and cleanup against synthetic data. Both exited 0, consumed their handshakes, removed their receipts and closed their sockets. A built Python wheel contains the migration. This does not verify the eventual Windows executable distribution or native Zotero interface. See TEST_REPORT.md and `.superpowers/sdd/IMPLEMENTATION_PLAN/task-1-report.md` for exact logs and hashes.

Task 2's native source implementation is committed at `cae92f6ba3b982e1a685fa9bda45a537fba39a5f` with fixes at `4240646b318ad2b2a4306f85c4f00b6bbb549b35`. Independent scoped re-review confirmed fingerprint-bound executable consent, refreshed notebook lists across existing panels, and retained sanitized causal diagnostics; no new Critical/Important breakage. Final covering typecheck, 15 Vitest cases in four files, XPI build and controlled adapter-to-frozen-engine smoke passed. Actual native Zotero acceptance remains NOT_VERIFIED. The reviewed XPI is 88,142 bytes, SHA256 `f71bb79ffb2e510845c9799171d3b19f92cde448ada8e15c10c3021f5be61166`.

Root installed verified Ajv 8.20.0 and Pillow 12.3.0 as required project dependencies under the existing authorization; see DEPENDENCIES.md. A preliminary M0 PyInstaller onedir passed actual authenticated notebook/expiry/cleanup checks with child PATH restricted to System32. This advances A33 only partially: the final package, a clean Windows host and native Zotero remain pending. The initial manifest-space rejection and test-harness environment-key error were corrected with their original causes retained in `.local/native-smoke/`; neither failed attempt is counted as success.

Official target-source inspection found that unknown custom tab types can break Zotero session restore after plugin removal. ADR 0002 selects the spec's allowed native in-window panel plus supported reader section. No Zotero session methods are patched. Provider protocol research is recorded in PROVIDER_PROTOCOL_REFERENCE.md.

The user subsequently authorized installing a local model service for validation. Portable Ollama 0.33.3 and the public qwen3:4b / qwen3-embedding:0.6b models are installed under `.local/ollama`. The owned loopback server passed a synthetic live JSON-streaming/embedding smoke, both models fully on the RTX 5060 Ti GPU. This verifies the external local test environment; Evidra adapters and semantic retrieval are still later work. Exact models, digests, settings and receipts: LOCAL_MODEL_TEST_ENVIRONMENT.md. No paid API, personal-library content or model weights entered the release payload.

## Next step

Implement sources and scope isolation, then parser, providers, matrix/jobs/research, MCP, exports and distribution as recorded in the plan. Native smoke must use a separate synthetic profile. NATIVE_VALIDATION_PLAN.md pins the reviewed XPI, engine payload, isolated paths and exact checks. The user explicitly authorized its isolated launch/install/preferences/API/DOM test exception on2026-09-05. Native execution has not yet occurred. Personal-profile plugin installation is not authorized.
