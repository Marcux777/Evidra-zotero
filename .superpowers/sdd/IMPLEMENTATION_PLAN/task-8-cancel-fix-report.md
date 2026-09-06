# Task8 native cancellation race correction

Native frozen revision50431ef returned `QUEUED` revision1 after resume, then its worker claim advanced the job revision before the immediately following native cancel command. The cancel was rejected with `REVISION_CONFLICT`. The worker dispatched two batches, exceeding the cancellation test's intended maximum of one. Both calls ended `GENERATION_INCOMPLETE` at512 output tokens; zero extraction results/proposals were committed. This is a failed native acceptance gate, not a successful cancellation observation.

Exact causal evidence: `.local/native-smoke/task8-native-cancel-receipt.json` and `task8-cancel-conflict-diagnostic.json`. Job `5c74dc56c2c8fdf500351d58ee9441ec`, calls `00f93acec566437f88c01b2c1eeb05ea` and `24530a64e6465053fe2bfde9b8e34732`. Owned host31848 closed normally at17:58:07Z; exact frozen engine absent17:58:08Z. Original failed artifacts remain unchanged.

## Change

`services/engine/src/evidra/jobs/queue.py`: restrictive `pause`/`cancel` commands accept an older displayed revision. Future revisions remain invalid; `resume` and uncertainty acknowledgement continue requiring the exact revision. Existing current-scope authorization, idempotency fingerprint and terminal-state guards remain in place. A delayed stop can intentionally stop a subsequently resumed instance of the same immutable job; it cannot expand scope, grant access or dispatch anything. No UI retry or fresh-read race workaround was added.

`services/engine/tests/test_jobs.py`: strengthened the existing controlled HTTP/SQLite inflight-stop regression to send the resume response's revision after a verified worker claim. It now includes pause and rejects stale resume/future stop revisions. It still observes one provider request, worker cessation and zero results/proposals. Pause during a sent request correctly retains `WAITING_PROVIDER/BILLING_UNKNOWN`; it is not treated as a free or completed call.

## Verification

- Existing focused test selection: `rtk proxy uv run --project services/engine --no-sync pytest services/engine/tests/test_jobs.py -k inflight_stop_or_revocation -q`.
- RED:2failed(cancel,pause)/1passed(revoke), actual409 `REVISION_CONFLICT`; `.local/task08/cancel-fix/red.log`. The outer PowerShell wrapper mistakenly returned0 after displaying the failing pytest output; that wrapper status is not passing evidence.
- First corrected run: cancel/revoke passed; new pause assertion expected PAUSED but actual existing uncertainty handling correctly returned WAITING_PROVIDER. Full failure preserved in `green.log` and its receipt(returncode1). Corrected only the assertion after tracing `JobWorker.failure`.
- Final focused run:3passed/16deselected; `green2.log` and `green2-receipt.json`(returncode0). No permanent new test function; one existing regression expanded for the actual race.
- Ruff check passed for the two changed paths. Mypy passed for queue.py. Ruff format initially reported the new test lines; ran formatter on test_jobs.py only and inspected the resulting diff. No behavior changed after the successful focused run.
- No production worker/UI changes. No live model calls for this correction. Native revalidation requires a newly reviewed packaged engine and remains pending.

## Separate native extraction limitation

The original512-output job and a distinct explicitly configured1024-output job both failed `GENERATION_INCOMPLETE` in two calls each, with confirmed output-token usage and no committed results. `.local/native-smoke/task8-incomplete-diagnostic.json` and `task8-extended-incomplete-diagnostic.json` preserve these outcomes. The latter resumed the exact paused preparation after a helper readiness failure; it did not retry the original failed job. No further generation-output escalation is planned. Partial model output was not persisted, so no claim about its content is made. This cancellation fix does not resolve or close successful native extraction acceptance.
