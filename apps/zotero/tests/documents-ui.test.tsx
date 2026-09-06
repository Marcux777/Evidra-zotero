import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';

test('the document panel exposes pause/cancel, literal evidence, precision and on-demand local preview through explicit buttons', async () => {
    const url = new NodeURL('../src/ui/Documents.tsx', import.meta.url);
    expect(existsSync(url), 'document panel is missing').toBe(true);
    const { Documents } = await import(/* @vite-ignore */ url.href);
    const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
    const messages: any[] = [];
    let indexes = 0, previewsRead = 0;
    const operation = { id: 'f'.repeat(32), document_id: 'd'.repeat(32), state: 'PAUSED', reason: 'PAGE_LIMIT', kind: 'ingest' };
    const row = { document_id: 'd'.repeat(32), source_id: 'b'.repeat(64), content_key: 'PDFKEY1', source_kind: 'pdf', title: 'Study',
        coverage: 'METADATA_ONLY', parsed_coverage: 'METADATA_ONLY', historical: false, document_version_id: 'e'.repeat(64), operation };
    const bridge = { request: async (message: any) => {
        messages.push(message);
        if (message.op === 'documents.list') return { items: [row], offset: 0, limit: 50, total: 1 };
        if (message.op === 'documents.search') return { items: [{ evidence_id: 'c'.repeat(64), source_id: row.source_id, content_key: row.content_key,
            source_kind: 'pdf', excerpt: '<img src="https://outside.invalid/x"> literal result', page_index: 1, page_label: 'vii', historical: false, score: -1 }], offset: 0, limit: 40, total: 1, documents_retrieved: 1 };
        if (message.op === 'documents.evidence') return { id: 'c'.repeat(64), source_id: row.source_id, source_kind: 'pdf', content_key: row.content_key,
            document_version_id: row.document_version_id, excerpt: 'literal result', start: 10, end: 24, page_index: 1, page_label: 'vii',
            precision: 'page', rectangles: [], historical: false, parser_version: 'verified-parser' };
        if (message.op === 'documents.open') return { precision: 'page' };
        if (message.op === 'documents.index') {
            if (++indexes === 1) throw new Error('ENGINE_TIMEOUT');
            operation.state = 'RUNNING'; operation.reason = '';
            return { document: {}, operation };
        }
        if (message.op === 'documents.cancel') { operation.state = 'CANCELLED'; return operation; }
        if (message.op === 'documents.preview') return { ...operation, state: 'COMPLETE', kind: 'preview' };
        if (message.op === 'documents.operation') return { ...operation, state: 'COMPLETE', kind: 'preview' };
        if (message.op === 'documents.preview.read') {
            if (++previewsRead === 1) throw new Error('ENGINE_TIMEOUT');
            return { document_version_id: row.document_version_id, page_index: 1, region: [0, 0, 40, 60], width: 40, height: 60,
                sha256: '1'.repeat(64), data_base64: 'AAAA' };
        }
        throw new Error('Unexpected document UI command');
    } };
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const click = async (text: string) => { const button = [...host.querySelectorAll('button')].find(b => b.textContent === text); expect(button, text).toBeTruthy(); await act(async () => button!.click()); };
    try {
        await act(async () => root.render(<StrictMode><Documents bridge={bridge} {...scope} locale="en-US"/></StrictMode>));
        await click('Documents and evidence');
        expect(host.textContent).toContain('Page limit reached');
        const query = host.querySelector('input[name="document_query"]') as HTMLInputElement;
        await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(query, 'literal'); query.dispatchEvent(new Event('input', { bubbles: true })); });
        await click('Search text');
        expect(host.textContent).toContain('<img src="https://outside.invalid/x"> literal result');
        expect(host.querySelector('img')).toBeNull();
        await click('Inspect excerpt');
        expect(host.textContent).toContain('Page precision');
        expect(host.textContent).toContain('vii');
        await click('Open page');
        expect(messages.at(-1)).toMatchObject({ op: 'documents.open', evidence_id: 'c'.repeat(64), ...scope });
        expect(messages.some(m => m.op === 'documents.preview')).toBe(false);
        await click('Reindex text');
        expect(host.textContent).toContain('The indexing result is unknown');
        await click('Repeat original indexing request');
        expect(messages.filter(m => m.op === 'documents.index')[0]).toEqual(messages.filter(m => m.op === 'documents.index')[1]);
        await click('Cancel');
        expect(messages.some(m => m.op === 'documents.cancel')).toBe(true);
        await click('Render local preview');
        expect(host.querySelector('img')).toBeNull();
        await click('Refresh documents');
        expect(host.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
        expect(messages.filter(m => m.op === 'documents.preview')).toHaveLength(1);
    } finally { await act(async () => root.unmount()); host.remove(); }
});
