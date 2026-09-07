import { useEffect, useRef, useState } from 'react';
import type { Locale, UiBridge, UiMessage } from '../bridge/types';
import { catalog } from './i18n';
import { Diagnostic } from './Diagnostic';
export const researchKey = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
const invalidates = new Set(['SCOPE_STALE', 'SOURCE_REVOKED', 'DOCUMENT_STALE', 'MISSING_FILE', 'FORBIDDEN', 'NOT_FOUND', 'BRIDGE_EXPIRED', 'UNAUTHENTICATED']);
const confirmed = new Set([...invalidates, 'REVISION_CONFLICT', 'IDEMPOTENCY_CONFLICT', 'INVALID_REQUEST', 'INVALID_OUTPUT', 'CONTEXT_LIMIT', 'BODY_TOO_LARGE', 'INVALID_UI_MESSAGE', 'INVALID_ENGINE_ROUTE', 'RUN_BUSY', 'PROVIDER_PAUSED', 'API_BLOCKED', 'CONSENT_REQUIRED', 'CAPABILITY_UNSUPPORTED', 'NO_EVIDENCE', 'BILLING_UNKNOWN', 'ENGINE_STOPPING', 'BUDGET_EXCEEDED', 'LIBRARY_NOT_EDITABLE', 'OUTBOX_UNCERTAIN', 'OUTBOX_NOTE_CHANGED', 'OUTBOX_NOTE_MISSING', 'OUTBOX_AMBIGUOUS', 'OUTBOX_RECONCILIATION_LIMIT', 'OUTBOX_RECONCILE_REQUIRED']);
export type ResearchScope = { bridge: UiBridge; notebook_id: string; snapshot_id: string; locale: Locale };
export function useResearchActions(bridge: UiBridge, invalidate: () => void, additionalConfirmed: ReadonlySet<string> = new Set()) {
    const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState('');
    const active = useRef(true), epoch = useRef(0), working = useRef(false);
    const pending = useRef<{ command: UiMessage; success: (value: any) => void } | null>(null);
    const invalidation = useRef(invalidate); invalidation.current = invalidate;
    useEffect(() => { active.current = true; return () => { active.current = false; ++epoch.current; }; }, []);
    async function run(work: (current: () => boolean) => Promise<void>) {
        if (working.current) return;
        working.current = true; setBusy(true); setError(''); const token = ++epoch.current;
        const current = () => active.current && epoch.current === token;
        try { await work(current); }
        catch (failure) { if (current()) {
            const code = failure instanceof Error ? failure.message : 'OPERATION_FAILED'; setError(code);
            if (confirmed.has(code) || additionalConfirmed.has(code)) { pending.current = null; setUncertain(false); }
            else if (pending.current) setUncertain(true);
            if (invalidates.has(code)) invalidation.current();
        } }
        finally { if (current()) { working.current = false; setBusy(false); } }
    }
    function retry() { return run(async current => {
        const value = pending.current; if (!value) return;
        const result = await bridge.request(value.command); if (!current()) return;
        pending.current = null; setUncertain(false); value.success(result);
    }); }
    function write(command: UiMessage, success: (value: any) => void, interruptRead = false) {
        if (pending.current) return;
        if (working.current) { if (!interruptRead) return; ++epoch.current; working.current = false; }
        pending.current = { command, success }; void retry();
    }
    function read(work: (current: () => boolean) => Promise<void>, replace = false) {
        if (pending.current) return;
        if (working.current && replace) { ++epoch.current; working.current = false; }
        void run(work);
    }
    return { busy, uncertain, error, locked: busy || uncertain, write, read, retry };
}
export function ResearchFeedback({ actions, locale }: { actions: ReturnType<typeof useResearchActions>; locale: Locale }) {
    const t = catalog(locale).research;
    return <>{actions.busy && <p role="status">{t.busy}</p>}{actions.error && <p role="alert"><Diagnostic code={actions.error} locale={locale}/></p>}
        {actions.uncertain && <div role="alert"><p>{t.uncertain}</p><button type="button" disabled={actions.busy} onClick={() => void actions.retry()}>{t.retry}</button></div>}</>;
}
