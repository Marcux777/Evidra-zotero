# Evidra implementation state

Updated: 2026-09-05. Owner: current Codex task in C:/p/evidra-zotero. Branch: codex/implement-evidra.

The full v1 implementation is in progress, not complete. No milestone or acceptance test has passed yet. The supplied SPEC.md is preserved unchanged and IMPLEMENTATION_PLAN.md decomposes M0–M7 into twelve tasks.

## Environment and authorizations

- User authorized implementation, local dependency installation, and updating the existing Zotero application; closed Zotero before installer execution.
- Zotero updated 9.0.6 -> 10.0.1 with official digitally signed installer; silent install returned 0; executable, registry and the personal helper's start/status verified 10.0.1 and local API/Connector HTTP 200. No personal-library content was selected or changed by the agent. The application owns its normal version upgrade.
- Installer SHA-256: `4b0f508ef28bff9a7b6cc2299eb18f2431d966d91a462ce29e5bc609d5e07036`; source https://download.zotero.org/client/release/10.0.1/Zotero-10.0.1_x64_setup.exe. Authenticode status Valid, Corporation for Digital Scholarship. Local download receipt: `.local/installers/download-receipt.json`.
- Node 22.15.0, npm 10.9.2, uv 0.11.28, actual Python 3.12.11 at C:/Users/marcu/AppData/Roaming/uv/python/cpython-3.12.11-windows-x86_64-none/python.exe. The `py -3.12` launcher failed because the registered StabilityMatrix path was stale; no interpreter substitution or new Python install was used.
- `npm ci --no-audit --no-fund` installed 126 packages; `uv sync --project services/engine --frozen --python <verified-python> --no-python-downloads` installed 63 packages. npm warned of transitive deprecated whatwg-encoding in test-only jsdom.
- Initial npm resolution failed ERESOLVE because openapi-typescript requires TypeScript ^5.x. Pinning verified TypeScript 5.9.3 resolved it; no force/legacy-peer override. Original npm diagnostic logs remain in the user's npm cache with timestamp 2026-09-05T20_32_57_449Z.
- winget lookup failed to update its source / find the initial queried package. Update used the independently verified official Zotero download, not winget. PowerShell utility/security modules were absent from autoload search; explicitly importing the installed Security module enabled signature validation. Hashing used Python hashlib.

## Current files and verification

Created source spec/plan/ADR, package manifests/lockfiles, ignores and empty engine package. No behavior tests yet; setup/configuration changes do not justify permanent tests under the local testing policy. Source/spec hash verified with hashlib.

## Next step

Implement Task 1: real authenticated loopback engine, heartbeat, protected handshake, persistent notebooks and focused tests. Then native plugin vertical, sources, parser, providers, matrix/jobs/research, MCP, exports and distribution as recorded in the plan. Native smoke must use a separate synthetic profile and permitted local services; personal-profile plugin installation is not authorized.
