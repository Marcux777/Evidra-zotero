# Final source and native review — 2026-09-07

## Final host review and package-5 handoff — 2026-09-07

**All feasible work on the authorized development host is complete; full v1 acceptance is still blocked by A25/A29/A33.** The final classification is27 fixture-verified, six bounded live and three partial. A36 now has successful native extraction, persisted unreviewed proposals, unchanged approved matrix, original PDF evidence and a real saved JSON export. This is a bounded synthetic flow; no scientific endorsement of model output is implied.

Source `1b7c3f8` fixes the last observed product defect: Zotero's getNote removes the stored wrapper, causing an intact approved note to be refused as OUTBOX_NOTE_CHANGED. The bridge reconstructs the exact known wrapper for comparison, retaining the existing identity, parent, tags and hash checks. The existing native bridge regression failed before the fix (two failures), then passed3/3; TypeScript passed. Package5 source binding verifies299 inputs and597 engine entries. Its engine is byte-identical to package4. Controller source review: `.superpowers/sdd/IMPLEMENTATION_PLAN/note-wrapper-controller-review.md` (SHA-256 `c7df61724fe0a5a8cb3d9de86b19721573ae935b930e0ed79f805067a7930c10`). This bounded correction has controller review, not another independent review.

Actual package5 recovery and restart each passed16 checks: the same note56/ZGFGJQIR, exact approved HTML, COMPLETE outbox and idempotent reconciliation survived normal restart without duplication. Summary SHA-256 `6f7e19c5fa33cde26c0e6affa1c312252e4b87bfbd6d5b8452ed0dcdb6140805`. Both hosts closed normally with no owned engine remaining. The controller inspected both saved native completed-note captures.

The authorized think=true runs also produced synthesis/audit artifacts with explicit partial coverage and human-review requirements. The original screening remains FAILED: its proposal violated missing-abstract uncertainty and was correctly rejected. The synthesis was corrected before synthetic note approval; the audit remains unreviewed. All original generation/helper failures are preserved in [TEST_REPORT.md](TEST_REPORT.md). No complete-v1 approval, blocked-network test, file-symlink success or clean-Windows result is claimed.

All review/checkpoint text below is historical and is superseded by this handoff where outcomes changed.

## Historical original-view source and native review

**F1 and F2 are addressed; full specification v1 acceptance remains incomplete.** F1's actual-controller route correction is in `4fbc836`. Commits `032ec82` and `c2ae541` implement F2 with verified original structure, passive figures, exact source text and citation-based EPUB resource selection. The independent report `.superpowers/sdd/IMPLEMENTATION_PLAN/original-rendering-final-review.md` (SHA-256 `95985b0baddb8f3d46b94331b142a2fc5005aa2839b8533022ec41f2eae6b5ea`) approved the scoped source after inspecting its complete verification evidence. The source binding lists all 33 changed inputs.

Package4 from exact `c2ae5413512755f9ad7b4fd1701c8b5a14702a23` then passed 57 actual native original-view/layout checks and composed plugin lifecycle acceptance. The controller verified complete receipts, artifact hashes, native images and teardown. Original-view summary SHA-256 `ba8cd17d64e7b84bf3b9787a461d8370f291cde78bc1232b329b777d9c727e90`; lifecycle summary SHA-256 `22aee653bea24d4caf36e67354434cf6ade52ad347e068e5f9418897b2de7fef`. These close the original-document implementation gap and bounded A01/A12 validation. They do not reproduce publisher CSS layout or establish successful native model extraction, external-network isolation, clean Windows or a general accessibility audit. Later bounded A23/A28/A34 checks are recorded below. See [TEST_REPORT.md](TEST_REPORT.md), [TEXT_ATTACHMENTS.md](TEXT_ATTACHMENTS.md) and the four remaining partial rows in [ACCEPTANCE_MATRIX.md](ACCEPTANCE_MATRIX.md).

The subsequent acceptance increment closes native cancellation (27 checks; summary SHA-256 `db0dc7a99f985d55718c812d5723cc3dd2b5f544d5834024de34e1773e568a04`), the bounded native state/keyboard matrix (42 checks/23 controls; summary SHA-256 `a27cb321ffd849e62b51949e8ce006b6fc36ccbd951e3435eeaba5e084408db0`), and explicit hostile HTML/PDF controlled cross-flow (two cases,154 verified bound hashes). These add no production change. A28 retains the explicit controlled-provider/native-fixture/observer limitations in TEST_REPORT. Current classification is27 fixture-verified, five bounded live and four partial: A25/A29/A33/A36. No complete-v1 or release approval is inferred.

The newly authorized larger-budget attempts do not close A36: all five native calls failed INVALID_OUTPUT below16384 output tokens. A separate exact-input diagnostic traced the accuracy failure to reasoning prose preceding JSON in Ollama message.content with thinkfalse. The subsequent thinktrue configuration is user-authorized but not yet executed; validators remain unchanged. Both native hosts/engines closed normally. See the23:00Z checkpoint in TEST_REPORT. The user has only this development host, so clean-Windows acceptance remains unavailable.

The reviews below retain their original findings as historical evidence; their old open-F2 statements have been superseded.

# Historical resumed source review — 2026-09-07

**Specification v1 remains incomplete.** The 21-file review at 63b52f3 found F1 (EngineController route omission) and F2 (the extracted-text inspector does not open the original HTML/XML/EPUB representation). F1 is corrected in 4fbc836 with an actual-controller RED/GREEN regression. F2 remains Important; its implementation is the next source increment. The inspector and scoped CSS have no other established quality finding, but no new native acceptance or package approval is inferred.

The exact independent report is `.superpowers/sdd/IMPLEMENTATION_PLAN/text-opening-review.md`, SHA-256 474d31c612c52183dfe11dfeabdd203cbe757bbbc955dfce0f1649b7fbe89218. The controller read it fully, checked F1 against the actual allowlist and verified the correction's raw evidence. Native original-document presentation must be exercised after that remaining implementation is reviewed and packaged. [TEST_REPORT.md](TEST_REPORT.md) and [ACCEPTANCE_MATRIX.md](ACCEPTANCE_MATRIX.md) retain original failures and the distinct fixture/native categories.

The review below is historical; its old final-wave cap no longer stops the user's resumed completion request.

# Historical final source review — 2026-09-07

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
