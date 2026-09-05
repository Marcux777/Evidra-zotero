# Authorized native validation operation

This plan describes a local test operation. The user explicitly authorized this isolated test on2026-09-05: “Autorizo esse teste isolado”. It has not yet been executed. The current XPI is built from Task2 fix revision `4240646b318ad2b2a4306f85c4f00b6bbb549b35`; independent scoped re-review confirmed all three findings addressed with no new Critical/Important breakage. `.local/task-2/native-smoke-preparation.json` is the preparation receipt.

## Exact target and isolation

- Host executable: `C:/Program Files/Zotero/zotero.exe`, verified10.0.1.
- New profile: `C:/p/evidra-zotero/.local/native-smoke/zotero-task2-profile`.
- New data directory: `C:/p/evidra-zotero/.local/native-smoke/zotero-task2-data`.
- XPI: `.local/task-2/dist/evidra-0.1.0.xpi`, 88,142 bytes, SHA256 `f71bb79ffb2e510845c9799171d3b19f92cde448ada8e15c10c3021f5be61166`, plugin ID `evidra@evidra.local`. The source review passed and the user granted the scoped native-operation exception.
- Engine: the verified preliminary payload `.local/native-smoke/m0-engine-20260905T213413Z/dist/evidra-engine`; manifest SHA256 `96906d631de3e6102b94c59083a3b638ed84bfb5e97e565b202893817b96294f`.
- Explicit launch arguments: `-no-remote -profile <absolute-new-profile> -datadir <absolute-new-data-directory>`. The existing personal instance remains owned by the user. The test must verify actual `ProfD` and `Zotero.DataDirectory.dir` before creating synthetic fixtures.
- The plugin's normal data location is `%LOCALAPPDATA%/Evidra/profiles/<new-profile-instance-id>`; only the new test profile's own identifier may be used. Its exact path will be recorded before notebook writes.

The separate instance is justified by the [official multiple-profile guide](https://www.zotero.org/support/kb/multiple_profiles), but that guide also warns against assuming that a new profile automatically gets separate data. Target `dataDirectory.js` handles explicit `-datadir` before default-profile discovery, which is why both paths are required.

## Proposed native checks

1. Install the pinned XPI in the new profile and record host/addon versions, actual profile/data paths and startup diagnostics.
2. Open the actual workspace/reader panel and verify the local React bundle, bridge source/origin checks, engine selection/consent and authenticated notebook creation/reopen.
3. Exercise already-mounted panels, keyboard/focus, PT-BR/en-US, themes/zoom, then disable/uninstall and check registered UI/listeners/owned engine cleanup.
4. As later implementation slices are reviewed, use clearly labeled synthetic items/PDFs/notes only in this same test profile to exercise source snapshots, evidence navigation, matrix and exports. Record each tested revision independently. Package revisions require fresh hashes and re-review before use.

A bounded test-only helper may exercise Zotero/Gecko APIs and DOM controls inside this verified profile and write receipts under `.local/native-smoke/`. It must not expose an arbitrary shell/file/eval bridge, operate other application windows, modify the original notes or use personal-library data. Missing native capabilities or causal errors stop the affected check; a controlled adapter run cannot substitute for a native result. Test-only helpers must not enter the production XPI.

Only this test profile may receive startup/test preferences. Proposed settings disable its Connector HTTP server to avoid the personal instance's port, automatic sync, translator updates, proxy authentication probes and first-run guidance. These names are verified in the target [default preferences](https://raw.githubusercontent.com/zotero/zotero/10.0.1/defaults/preferences/zotero.js). No account login, global application configuration or system network change is part of this operation.

## Why an exception is needed

The current local policy at `C:/Users/marcu/.codex/instructions/zotero.md` requires the personal HTTP helper and states: **“Never use Zotero UI automation”**. The authorized helper lacks profile-selecting launch/install arguments. The user's explicit exception covers this direct isolated-profile launch, test-only native APIs/DOM automation and profile preferences. It does not grant operations in the personal profile. The XPI and engine preparation, source inspection and non-native checks remain independently authorized.
