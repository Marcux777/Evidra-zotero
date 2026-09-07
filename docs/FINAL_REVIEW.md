# Final source review — 2026-09-07

**The specification v1 is not complete.** The single final correction and independent re-review closed the original ingestion and CSV defects, but an Important textual-citation opening gap remains. This document records that result; it does not grant release approval.

The reviewed range is `08d3cf6e5f0c2456ef9a4ea9842e8c768c9add51` through `1f567d109c11a1590e71d497e45214a65d7509d3`. The re-review covered 26 authored and two generated files and inspected the reported source, commands, receipts and logs without repeating suites or executing native/model operations. Its original report is `.superpowers/sdd/IMPLEMENTATION_PLAN/final-fix-review.md`, SHA-256 `cd473a901c63bfa13f45abfc31eb0480b02f3d1f858b55f21d392c5c7c3ccf35`.

| Finding | Final disposition |
|---|---|
| I1: admitted text attachments lacked ingestion | Addressed: MIME provenance, verified files, bounded worker parsing, original extracted text, retrieval and full-scan planning. This does not imply native opening. |
| I2: CSV compared cell revisions across snapshots | Addressed: local selected-snapshot projection, explicit snapshot/source version and separate imported history in both orientations. |
| M1: document reasons bypassed localization | Addressed with existing coverage labels and retained machine codes. |
| M2: operation counters omitted the operation kind | Addressed: indexing and preview are named. |
| M3: failed-keyring test inspected an unrelated database | Addressed: the existing test now uses its actual database and backup. This is fixture evidence, not live keyring acceptance. |
| M4: old STATE checkpoints appeared current | Addressed: superseded checkpoints are historical and package/source revisions remain separate. |
| M5: dependency/capture warnings | Deferred Minor maintenance; no warning suppression or warning-free claim. |
| N1: new textual citations cannot open their original attachment | **Open Important implementation gap, A12.** The document UI only displays a limitation for text, and the native `documents.open` handler rejects non-PDF sources. |

N1 concerns `apps/zotero/src/ui/Documents.tsx:164–165` and `apps/zotero/src/bridge/documents.ts:118`. Successfully indexed plain text, HTML/XML or EPUB can supply an excerpt, but Evidra cannot open its original attachment from that citation. Asking the user to locate the attachment manually does not implement SPEC section 8/A12. No physical PDF page or geometry is fabricated; see [text format and navigation limits](TEXT_ATTACHMENTS.md). A subsequent implementation must establish an authorized, version-verified native opening path with honest available precision while preserving the PDF loaded-byte checks. N1 was retained as a real requirement blocker at the final review cap, not waived or marked passed.

Verification of the correction uses the scoped aggregate recorded in [TEST_REPORT.md](TEST_REPORT.md): 16 ingestion/PDF cases, four CSV/import cases, one keyring case, three document UI/bridge cases, one locale case, TypeScript, Ruff and scoped mypy. Original failed attempts and focused corrections are preserved. This is not a fresh full-suite run. The original package3 backup was separately read and validated without modification by the corrected source.

Package3 native evidence remains bound to `08d3cf6`, with 19 observer checks and 46 checks of four actual saved files, mapped import and original PDF evidence. It predates the final text/CSV correction. Its additional default-animation Reader/panel-close observation was inconclusive; long imported IDs overflowed the viewport. Neither that result nor a successor binary hash can close N1 or the other [acceptance gaps](ACCEPTANCE_MATRIX.md).

Successful pinned native extraction/research, corrected native cancellation, approved-note publication/reconciliation, complete keyboard/lifecycle coverage, installed external clients, externally blocked-network LOCAL operation and a genuinely clean Windows test remain partial, failed or unverified as recorded individually. The three Task9 `GENERATION_INCOMPLETE` runs remain failed; no settings, models or budgets were silently changed.
