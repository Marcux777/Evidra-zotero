# ADR 0003 — Relevance triage for a researcher's own project

Date: 2026-09-27. Status: implemented on branch `codex/relevance-triage`; native Zotero acceptance pending.

The primary use is deciding which library studies serve the researcher's project and what can be reused from them. The v1 screening path existed but required one manual run per study, returned only INCLUDE/EXCLUDE/UNCERTAIN, and could not screen real full-text PDFs (per-character geometry in the prompt exceeded the 450,000-character envelope). These decisions stay within SPEC §9, §11, §13 and §14.

**Lexical retrieval.** Queries drop Portuguese and English function words and match any remaining term, ranked by BM25; `match=all` keeps the strict AND and quoted phrases. Queries above 64 distinct terms are refused, never truncated. Form fields carry `search_terms` so SEARCH extraction does not query English papers with a Portuguese question. Scope restriction still precedes ranking.

**Model inputs.** Prepared research inputs omit per-character rectangles; the model receives excerpts, locators and IDs only. Navigation reopens stored geometry by evidence ID. Backups accept this geometry-free nested evidence only when every other field equals the original record.

**Project and rubric.** A protocol version may carry `project` (description, methods, data, constraints, sought contribution kinds) and `rubric` (explicit grades 0–5). Ordering studies is allowed only by that explicit rubric (SPEC §14). Without a rubric, screening keeps its original schema and prompt byte for byte.

**Relevance output.** With a rubric, the output schema requires one verdict per applicable criterion, a rubric grade (null only for UNCERTAIN), reusable items with how to use them, concerns and, for full text, a paper card. The validator enforces anchored MET/NOT_MET verdicts, prepared evidence only and decision/verdict consistency. The paper card is part of the full-text call rather than a separate summarization pass, so every point keeps an original anchor.

**Directed full text.** Full-text screening selects the opening chunks, conclusion/limitation passages and per-criterion lexical hits, then fills in reading order within a byte budget derived from the same estimate as the context gate. Coverage reports `DIRECTED_EXCERPTS` with selected and candidate counts; nothing claims whole-paper reading.

**Batches.** A batch prepares one ordinary research run per study, each with its own persisted, inspectable preview, and starts them sequentially after one explicit start (the consent covers the listed runs, summed estimates and maximum output). Every per-run guarantee is unchanged: provider identity, checkpoint, cancellation, billing uncertainty and immutable artifacts. The batch pauses on uncertain billing, provider waits or paused runs, and reports `PREPARED_RUN_STALE` when the provider profile changed (for example after a rate-limit pause); it never resends an uncertain call. Studies without text for the stage are skipped without a call. `NOT_HUMAN_EXCLUDED` skips only studies that every human reviewer excluded at title/abstract; a model EXCLUDE never removes a study.

**Human decisions.** Model proposals never become decisions. A human-approved or corrected proposal can be adopted into a `ScreeningDecision` by a named local reviewer, recording `adopted_artifact_version_id` as provenance. The queue shows proposals and human decisions side by side and hides a proposal whose prepared evidence no longer verifies.

**Evaluation.** Quality is measured on the researcher's own question with blind human labels ([relevance pilot](../evaluation/RELEVANCE_PILOT.md)); failures stay in denominators and count as manual work.
