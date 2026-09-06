# Task6 implementation report

Base: `e9a6d413824a723013627516e3c9d8594d963c50`. Implementation is ongoing; this is not full M3/native acceptance.

## Backend increment

Implemented scoped exact cosine retrieval with compact little-endian float32 SQLite blocks, authorization joins before scoring/top-k, no persistent RAM vector cache, atomic active-generation swap and durable cancellable index-build progress. Defaults remain lexical40/vector40, RRF k60, at most12 document-diverse nonoverlapping chunks. The complete history is retained or context preparation fails; selected/excluded chunk counts and UTF-8-plus-framing estimate are explicit. Estimates never become monetary `InputBound` receipts.

Conversations bind snapshots. Prepared runs persist question, complete included history, server evidence excerpts/offsets/version/source, prompt/version, selected provider/configuration, effective Ollama options, context exclusions and destination. Explicit start checks scope/history/provider revisions and dispatches once; retries return the durable existing run. Events are bounded authenticated SSE cursor batches. Final promotion requires provider terminal completion/cleanup, local strict schema and literal evidence validation, current scope and conversation revision. Failed/cancelled/incomplete/fabricated output stays draft. No repair command or automatic repair. Visual preparation consumes byte-verified server preview operations and persists image provenance as proposed interpretation.

Pydantic conversation/provider native commands and generated Ajv allowlists are included for the next UI increment. No duplicate provider transport, credentials store or usage ledger was added. Existing lexical/evidence reads now honor the server-issued context capability, allowing commit-scoped consumers to use them without nesting transactions.

### Checks and actual evidence

New permanent file: `services/engine/tests/test_conversations.py`, ten focused cases. No existing tests changed or removed in this increment. Covered distinct risks: schema/evidence promotion and history persistence; fabricated ID and quotation; incomplete provider terminal; cleanup failure; cancellation; revocation during stream; unauthorized dominant vector before top-k and model/dimension mismatch; bounded context/history; late rebuild failure preserving the previous index. Providers in these checks are controlled async fixtures; source text, scope and SQLite persistence are real.

Initial RED command: `rtk proxy uv run --project services/engine --no-sync pytest services/engine/tests/test_conversations.py -q`. Actual result before implementation: `assert 404 == 201` at conversation creation; `1 failed, 1 warning in 1.21s`. The new route was absent as expected. Subsequent integration diagnostics identified schema head still5 (`sqlite3.OperationalError: no such table: vector_jobs`); schema is now6. Test additions for distinct invariants followed the consumer implementation; those additions do not claim separate preimplementation RED evidence.

GREEN command: `rtk proxy uv run --project services/engine --no-sync python .local/task06/check.py backend-increment uv run --project services/engine --no-sync pytest services/engine/tests/test_conversations.py -q`. Actual child exit0: `10 passed, 1 warning in 4.42s`. Full original captured log: `.local/task06/20260906T124525813977Z-backend-increment.log`, corresponding JSON records command/cwd/child exit. Warning is upstream Starlette's deprecated `anyio.abc.BlockingPortal` alias; not pristine output.

Changed backend mypy passed (8 files) before command-contract additions. Changed backend/test Ruff passes after formatting. Pydantic→OpenAPI→TypeScript/Ajv generation passes. Generation initially rejected OpenAPI `format=password`; it is now explicitly recognized as an annotation while the SecretWrite bounds remain validated. No live provider, vision or native Zotero check is claimed.

Commits and final UI/check evidence will be appended after each verified increment.
