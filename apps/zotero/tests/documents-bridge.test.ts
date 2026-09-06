import { existsSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { URL as NodeURL } from 'node:url';
import { expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
import { SourceBridge } from '../src/bridge/sources';

const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };

test('document commands accept only generated bounded payloads, never renderer paths or text', () => {
    const index = { op: 'documents.index', ...scope, source_id: 'b'.repeat(64), content_key: 'PDFKEY1', limits: {}, idempotency_key: 'request' };
    expect(parseUiMessage(index)).toEqual(index);
    for (const bad of [{ ...index, path: 'C:/private.pdf' }, { ...index, text: 'model supplied' },
        { ...index, limits: { timeout_seconds: Infinity } }, { ...index, limits: { memory_bytes: 1 } },
        { ...index, snapshot_id: '../outside' }, { ...index, limits: { retry: true } }]) {
        expect(() => parseUiMessage(bad)).toThrow('INVALID_UI_MESSAGE');
    }
    expect(parseUiMessage({ op: 'documents.search', ...scope, request: { query: 'literal', offset: 0, limit: 40 } })).toHaveProperty('op', 'documents.search');
    expect(() => parseUiMessage({ op: 'documents.preview', ...scope, request: { document_version_id: 'c'.repeat(64), page_index: 0, region: [10, 20, 0, 0], idempotency_key: 'preview' } })).toThrow('INVALID_UI_MESSAGE');
});

test('production document bridge revalidates exact content before resolving its path and fails on an intervening native notification', async () => {
    const url = new NodeURL('../src/bridge/documents.ts', import.meta.url);
    expect(existsSync(url), 'document bridge is missing').toBe(true);
    const { DocumentBridge } = await import(/* @vite-ignore */ url.href);
    const identity = { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT1' };
    const calls: string[] = [], fetched: string[] = [];
    let observer: any, changed = false;
    const parent: any = { id: 1, key: 'PARENT1', libraryID: 1, parentID: false, parentKey: false, itemTypeID: 1,
        version: 1, deleted: false, getField: (name: string) => name === 'dateModified' ? 'stamp' : '',
        getTags: () => [], isRegularItem: () => true, isNote: () => false, isAnnotation: () => false,
        isAttachment: () => false, loadAllData: async () => {}, getAttachments: () => { throw new Error('sibling scan'); } };
    const pdf: any = { ...parent, id: 2, key: 'PDFKEY1', parentID: 1, parentKey: 'PARENT1', attachmentContentType: 'application/pdf',
        isRegularItem: () => false, isAttachment: () => true, isFileAttachment: () => true, isPDFAttachment: () => true,
        getFilePathAsync: async () => { calls.push('native.path'); if (changed) await observer.notify('modify', 'item', [2], {}); return 'C:/authorized/only.pdf'; } };
    const badPdf = { ...pdf, id: 3, key: 'BADPDF1' };
    const api: any = { Libraries: { exists: () => true, get: () => ({ libraryID: 1, libraryType: 'user', libraryTypeID: null, archived: false }) },
        Items: { getByLibraryAndKeyAsync: async (_: number, key: string) => { fetched.push(key); return key === 'PARENT1' ? parent : key === 'PDFKEY1' ? pdf : key === 'BADPDF1' ? badPdf : false; },
            getAsync: async (id: number) => id === 1 ? parent : id === 2 ? pdf : false },
        ItemTypes: { getName: () => 'journalArticle' },
        Notifier: { registerObserver: (value: any) => { observer = value; return 'observer'; }, unregisterObserver() {} } };
    const document = { id: 'd'.repeat(32), source_id: 'b'.repeat(64), content_key: 'PDFKEY1', source_kind: 'pdf', revision: 1 };
    const engine = { stop: async () => {}, request: async (_: string, path: string, body?: any) => {
        calls.push(path);
        if (path.includes('/identities?')) return { items: [{ identity, contents: [{ key: 'PDFKEY1', kind: 'pdf' }, { key: 'BADPDF1', kind: 'pdf' }] }], total: 1, offset: 0, limit: 100 };
        if (path.endsWith('/sources/sync')) return { items: body.items.map((s: any) => ({ ...s, id: 'b'.repeat(64), version_id: 'v', year_state: 'missing' })), total: 1, offset: 0, limit: 1, stage_id: null };
        if (path.endsWith('/documents/register')) {
            if (body.content_key === 'BADPDF1') return { ...document, id: 'f'.repeat(32), content_key: 'BADPDF1', coverage: 'UNREADABLE', reason: 'INVALID_DOCUMENT_TYPE' };
            expect(body).toMatchObject({ source_id: 'b'.repeat(64), content_key: 'PDFKEY1', path: 'C:/authorized/only.pdf' }); return document;
        }
        if (path.endsWith('/documents/ingest')) return { id: 'e'.repeat(32), state: 'QUEUED' };
        if (path === '/v1/sources/invalidate') return { invalidated_count: 1 };
        throw new Error('Unexpected document route');
    } };
    const sources = new SourceBridge(api, engine, 'p1', error => { throw error; });
    const bridge = new DocumentBridge(api, sources, engine, webcrypto as unknown as Crypto, (value: string) => value);
    try {
        const command = parseUiMessage({ op: 'documents.index', ...scope, source_id: 'b'.repeat(64), content_key: 'PDFKEY1', limits: {}, idempotency_key: 'index' });
        const result = await bridge.dispatch(command);
        expect(result).toMatchObject({ document, operation: { state: 'QUEUED' } });
        expect(calls.map(v => v === 'native.path' ? v : v.split('/').at(-1))).toEqual([
            'identities?offset=0&limit=100', 'sync', 'native.path', 'register', 'native.path', 'register', 'ingest',
        ]);
        expect(fetched.every(key => ['PARENT1', 'PDFKEY1', 'BADPDF1'].includes(key))).toBe(true);
        const registrations = calls.filter(v => v.endsWith('/register')).length;
        changed = true;
        await expect(bridge.dispatch(command)).rejects.toThrow('SCOPE_STALE');
        expect(calls.filter(v => v.endsWith('/register'))).toHaveLength(registrations);
    } finally { sources.shutdown(); }
});

test('a cached Reader PDF and a changed active view cannot receive locations from another immutable version', async () => {
    const { DocumentBridge } = await import('../src/bridge/documents');
    const bytes = new TextEncoder().encode('actual indexed PDF bytes');
    const digest = Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('');
    const identity = { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT1' };
    const source: any = { id: 'b'.repeat(64), identity, contents: [{ key: 'PDFKEY1', kind: 'pdf', version: '1:stamp' }] };
    const evidence: any = { id: 'c'.repeat(64), source_id: source.id, source_identity: identity, content_key: 'PDFKEY1',
        source_kind: 'pdf', page_index: 1, precision: 'rectangles', rectangles: [[10, 20, 30, 40]], document_sha256: digest, document_bytes: bytes.byteLength };
    const locations: unknown[] = [];
    let loaded = bytes.slice(), changeView = false, revokeOnLoad = false, revoked = false, dataRequests = 0;
    loaded[0] = loaded[0]! ^ 1;
    const proxy = { getDownloadInfo: async () => ({ length: loaded.byteLength }), getData: async () => { ++dataRequests; if (changeView) reader._internalReader._lastView = { ...view }; revoked = revokeOnLoad; return loaded; } };
    const view = { initializedPromise: Promise.resolve(), _iframeWindow: { PDFViewerApplication: { pdfDocument: proxy } } };
    const reader = { itemID: 2, _initPromise: Promise.resolve(), _internalReader: { _lastView: view }, navigate: async (location: unknown) => { locations.push(location); } };
    const item = { id: 2, key: 'PDFKEY1', libraryID: 1, deleted: false, version: 1, getField: () => 'stamp',
        isPDFAttachment: () => true, getFilePathAsync: async () => 'C:/authorized/only.pdf' };
    const api: any = { Items: { getByLibraryAndKeyAsync: async () => item }, Reader: { open: async (_: number, location: unknown) => { expect(location).toBeUndefined(); return reader; } } };
    const sources: any = { withDocuments: async (_: string, __: string, run: any) => run([source], () => {}) };
    const engine: any = { request: async (_: string, path: string) => {
        if (path.endsWith('/documents/verify') && revoked) throw new Error('SOURCE_REVOKED');
        if (path.endsWith('/documents/register')) return { id: 'd'.repeat(32) };
        return evidence;
    } };
    const bridge = new DocumentBridge(api, sources, engine, webcrypto as unknown as Crypto, value => value);
    const command: any = { op: 'documents.open', ...scope, evidence_id: evidence.id };
    await expect(bridge.dispatch(command)).rejects.toThrow('READER_VERSION_MISMATCH');
    expect(locations).toEqual([]);
    loaded = new Uint8Array(1);
    await expect(bridge.dispatch(command)).rejects.toThrow('READER_SIZE_MISMATCH');
    expect(dataRequests).toBe(1);
    loaded = bytes;
    await bridge.dispatch(command);
    expect(locations).toEqual([{ position: { pageIndex: 1, rects: evidence.rectangles } }]);
    revokeOnLoad = true;
    await expect(bridge.dispatch(command)).rejects.toThrow('SOURCE_REVOKED');
    expect(locations).toHaveLength(1);
    revokeOnLoad = revoked = false;
    changeView = true;
    await expect(bridge.dispatch(command)).rejects.toThrow('READER_CHANGED');
    expect(locations).toHaveLength(1);
});
