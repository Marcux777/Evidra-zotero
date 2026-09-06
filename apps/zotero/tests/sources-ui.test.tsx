import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { expect, test, vi } from 'vitest';
import type { Notebook, UiMessage } from '../src/bridge/types';

test('Sources requires a current preview, preserves filter drafts on notifications and exposes labeled opt-in controls', async () => {
    expect(existsSync(new NodeURL('../src/ui/Sources.tsx', import.meta.url)), 'Sources view is missing').toBe(true);
    const { Sources } = await import(/* @vite-ignore */ new NodeURL('../src/ui/Sources.tsx', import.meta.url).href);
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    const notebook: Notebook = { id: '11111111-1111-4111-8111-111111111111', profile_instance_id: 'p1', name: 'Review', revision: 1, initial_snapshot_id: 'a'.repeat(32), created_at: '2026-09-05T00:00:00Z', updated_at: '2026-09-05T00:00:00Z' };
    const messages: UiMessage[] = [];
    let eventRevision = 0;
    let captured = false;
    let loseCaptureResponse = true;
    let captureFailure: Error | null = null;
    let stateFailure: Error | null = null;
    const committed = new Map<string, unknown>();
    let delayed = false;
    let release: ((value: unknown) => void) | undefined;
    let lastPreview: unknown;
    const bridge = { request: async (message: UiMessage) => {
        messages.push(message);
        if (message.op === 'sources.state') { if (stateFailure) { const error = stateFailure; stateFailure = null; throw error; } return { revision: eventRevision }; }
        if (message.op === 'sources.history') return { items: [{ id: 'a'.repeat(32), notebook_id: notebook.id, revision: 1, member_count: 0, selection: {}, created_at: '2026-09-05T00:00:00Z' }], offset: 0, limit: 50, total: 1 };
        if (message.op === 'sources.read') return { items: captured ? [{ source: (lastPreview as { preview: { items: unknown[] } }).preview.items[0], state: 'current' }] : [], offset: 0, limit: 50, total: captured ? 1 : 0, unavailable_count: 0 };
        if (message.op === 'sources.create') {
            if (captureFailure) throw captureFailure;
            captured = true;
            if (!committed.has(message.request.idempotency_key)) committed.set(message.request.idempotency_key,
                { id: 'd'.repeat(32), notebook_id: notebook.id, revision: 2, member_count: 1, selection: {}, created_at: '2026-09-05T00:00:00Z' });
            if (loseCaptureResponse) { loseCaptureResponse = false; throw new Error('BRIDGE_TIMEOUT'); }
            return committed.get(message.request.idempotency_key);
        }
        if (message.op === 'sources.revoke') { captured = false; return { revision: 3 }; }
        if (message.op === 'sources.preview.page') {
            expect(message.preview_id).toBe('b'.repeat(32));
            expect([0, 1]).toContain(message.offset);
            const original = lastPreview as any;
            return message.offset === 0 ? original : { ...original, offset: 1, preview: { ...original.preview, offset: 1, items: [], removed: [{ identity: { profile_instance_id: 'p1', library_id: 1, item_key: 'OMITTED1' }, title: 'Filtered paper', reason: 'year' }] } };
        }
        if (message.op === 'sources.preview') {
            lastPreview = { preview: { id: 'b'.repeat(32), stage_id: 'e'.repeat(32), notebook_id: notebook.id, expected_revision: 1, items: [{ identity: { profile_instance_id: 'p1', library_id: 1, item_key: 'PAPER001' }, id: 'c'.repeat(64), version_id: 'v1', version: '1', title: 'Selected paper', year: 2020, year_state: 'known', item_type: 'journalArticle', tags: [], doi: null, remote_library_id: null, remote_group_id: null, contents: [] }], removed: [], offset: 0, limit: 1, total: 2, included_count: 1, removed_count: 1, added_count: 1, dropped_count: 0, changed_count: 0, possible_duplicate_count: 0 }, unavailable: [], offset: 0, limit: 1, total: 2, unavailable_total: 0 };
            return delayed ? new Promise(resolve => { release = resolve; }) : lastPreview;
        }
        throw new Error('Unexpected source operation');
    } };
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
        await act(async () => root.render(<Sources bridge={bridge} notebook={notebook} locale="en-US"/>));
        await act(async () => (host.querySelector('button') as HTMLButtonElement).click());
        const descendants = host.querySelector('input[name="include_descendants"]') as HTMLInputElement;
        const notes = host.querySelector('input[name="include_notes"]') as HTMLInputElement;
        expect(descendants.checked).toBe(false); expect(notes.checked).toBe(false);
        expect(notes.labels?.length).toBe(1);
        await act(async () => notes.click());
        expect(host.textContent).toContain('unmarked');
        const year = host.querySelector('input[name="year_min"]') as HTMLInputElement;
        await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(year, '2000'); year.dispatchEvent(new Event('input', { bubbles: true })); });
        const button = (text: string) => [...host.querySelectorAll('button')].find(b => b.textContent === text)!;
        await act(async () => button('Preview current Zotero selection').click());
        expect(messages.find(m => m.op === 'sources.preview')).toMatchObject({ selection: { year_min: 2000, include_notes: true }, capture: true });
        expect(host.textContent).toContain('Selected paper');
        expect(button('Capture immutable snapshot').disabled).toBe(false);
        await act(async () => button('Next').click());
        expect(host.textContent).toContain('Filtered paper');
        expect(host.textContent).not.toContain('Selected paper');
        await act(async () => button('Previous').click());
        expect(host.textContent).toContain('Selected paper');
        await act(async () => button('Capture immutable snapshot').click());
        expect(messages.find(m => m.op === 'sources.create')).toMatchObject({ request: { preview_id: 'b'.repeat(32), expected_revision: 1, idempotency_key: expect.stringMatching(/^[a-f0-9]{64}$/) } });
        expect(button('Retry original capture')).toBeDefined();
        expect(button('Retry original capture').disabled).toBe(false);
        expect(button('Preview current Zotero selection').disabled).toBe(true);
        // App polling can learn the committed revision before its response reaches Sources.
        await act(async () => root.render(<Sources bridge={bridge} notebook={{ ...notebook, revision: 2 }} locale="en-US"/>));
        stateFailure = new Error('BRIDGE_SEND_FAILED');
        await act(async () => vi.advanceTimersByTimeAsync(10000));
        expect(messages.filter(m => m.op === 'sources.create')).toHaveLength(1);
        expect(button('Retry original capture').disabled).toBe(false);
        await act(async () => button('Retry original capture').click());
        const creates = messages.filter(m => m.op === 'sources.create');
        expect(creates).toHaveLength(2);
        expect(creates[1]).toEqual(creates[0]);
        expect(committed.size).toBe(1);
        expect(host.textContent).toContain('Selected paper');
        await act(async () => button('Remove access in this notebook').click());
        expect(messages.find(m => m.op === 'sources.revoke')).toMatchObject({ source_id: 'c'.repeat(64), expected_revision: 2 });
        expect(host.textContent).not.toContain('Selected paper');
        await act(async () => button('Preview current Zotero selection').click());
        captureFailure = new Error('SCOPE_STALE');
        await act(async () => button('Capture immutable snapshot').click());
        expect(button('Retry original capture')).toBeUndefined();
        expect(button('Capture immutable snapshot').disabled).toBe(true);
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('SCOPE_STALE');
        captureFailure = null;
        await act(async () => button('Preview current Zotero selection').click());
        eventRevision = 1;
        await act(async () => vi.advanceTimersByTimeAsync(10000));
        expect(year.value).toBe('2000'); expect(notes.checked).toBe(true);
        expect(button('Capture immutable snapshot').disabled).toBe(true);
        expect(host.textContent).not.toContain('Selected paper');
        expect(host.querySelector('[role="status"]')?.textContent).toContain('changed');
        expect(host.textContent).not.toContain('Currently accessible: 0');
        delayed = true;
        await act(async () => button('Preview current Zotero selection').click());
        eventRevision = 2;
        await act(async () => vi.advanceTimersByTimeAsync(10000));
        await act(async () => release!(lastPreview));
        expect(host.textContent).not.toContain('Selected paper');
        expect(button('Capture immutable snapshot').disabled).toBe(true);
        delayed = false;
        await act(async () => button('Preview current Zotero selection').click());
        loseCaptureResponse = true;
        await act(async () => button('Capture immutable snapshot').click());
        expect(button('Retry original capture').disabled).toBe(false);
        ++eventRevision;
        await act(async () => vi.advanceTimersByTimeAsync(10000));
        expect(button('Retry original capture')).toBeUndefined();
        expect(button('Capture immutable snapshot').disabled).toBe(true);
    } finally { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); }
});
