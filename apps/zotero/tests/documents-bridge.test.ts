import { existsSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import { URL as NodeURL } from 'node:url';
import { expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
import { SourceBridge } from '../src/bridge/sources';
import type { TextAttachmentOpener } from '../src/bridge/text-view';

const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };

// Native APIs and engine IO are controlled; resolver, notification adapter, epoch,
// preview and DocumentBridge continuations below are the production implementations.
async function readerNotifications(incompleteObservation = false, mediaType = 'application/pdf', openText?: TextAttachmentOpener) {
    const { DocumentBridge } = await import('../src/bridge/documents');
    const bytes = new TextEncoder().encode('unchanged authorized PDF');
    const identity = { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT1' };
    const sourceKind = mediaType === 'application/pdf' ? 'pdf' : 'text_attachment';
    const evidence: any = { id: 'c'.repeat(64), source_id: 'b'.repeat(64), source_identity: identity, content_key: 'PDFKEY1',
        source_kind: sourceKind, page_index: sourceKind === 'pdf' ? 1 : null, precision: sourceKind === 'pdf' ? 'page' : 'text', rectangles: [], document_bytes: bytes.length,
        document_sha256: createHash('sha256').update(bytes).digest('hex') };
    const parent: any = { id: 1, key: 'PARENT1', libraryID: 1, parentID: false, parentKey: false, itemTypeID: 1,
        version: 1, deleted: false, getField: (name: string) => name === 'dateModified' ? 'stamp' : name === 'title' ? 'Title' : '',
        getTags: () => [], isRegularItem: () => true, isNote: () => false, isAnnotation: () => false,
        isAttachment: () => false, loadAllData: async () => {}, getAttachments: () => { throw new Error('UNAUTHORIZED_SIBLING_SCAN'); } };
    const pdf: any = { ...parent, id: 2, key: 'PDFKEY1', parentID: 1, parentKey: 'PARENT1', itemTypeID: 2,
        attachmentContentType: mediaType, attachmentPath: 'C:/authorized/only.pdf', attachmentLinkMode: 2,
        attachmentCharset: null, attachmentSyncState: 0, attachmentSyncedModificationTime: null,
        attachmentSyncedHash: null, attachmentLastProcessedModificationTime: 0, attachmentLastRead: null,
        isRegularItem: () => false, isAttachment: () => true, isFileAttachment: () => true,
        isPDFAttachment: () => pdf.attachmentContentType === 'application/pdf',
        getFilePath: () => pdf.attachmentPath, getFilePathAsync: async () => pdf.getFilePath() };
    if (incompleteObservation) delete pdf.attachmentSyncedHash;
    const note: any = { ...parent, id: 3, key: 'NOTE1', parentID: 1, parentKey: 'PARENT1', itemTypeID: 3,
        isRegularItem: () => false, isNote: () => true, getNote: () => 'Human note' };
    const annotation: any = { ...parent, id: 4, key: 'ANNOT1', parentID: 2, parentKey: 'PDFKEY1', itemTypeID: 4,
        isRegularItem: () => false, isAnnotation: () => true, annotationText: 'Human annotation', annotationComment: '', annotationPosition: '{}' };
    const library = { libraryID: 1, libraryType: 'user', libraryTypeID: null, archived: false };
    const fetched: (number | string)[] = [], invalidated: unknown[] = [], locations: unknown[] = [], errors: unknown[] = [];
    let observer: any, exists = true, verifyCount = 0;
    const hooks = { beforeSecondVerify: async () => {}, navigate: async () => {}, processed: true, runAccess: async () => {}, textView: async () => {} };
    const requests: { path: string; body: any }[] = [];
    const nativeItems = new Map([[1, parent], [2, pdf], [3, note], [4, annotation], [5, { ...parent, id: 5, key: 'PARENT2' }]]);
    const lookup = (id: number) => { fetched.push(id); if (!nativeItems.has(id)) throw new Error('UNAUTHORIZED_ITEM_READ'); return nativeItems.get(id); };
    const api: any = { Libraries: { exists: () => exists, get: () => library },
        Items: { get: lookup, getAsync: async (id: number) => lookup(id), getByLibraryAndKeyAsync: async (_: number, key: string) => {
            fetched.push(key); const item = [...nativeItems.values()].find(item => item.key === key);
            if (!item) throw new Error('UNAUTHORIZED_ITEM_READ'); return item;
        } }, ItemTypes: { getName: () => 'journalArticle' },
        Notifier: { registerObserver: (value: any) => { observer = value; return 'observer'; }, unregisterObserver() {} },
        Reader: { open: async () => {
            if (sourceKind !== 'pdf') throw new Error('TEXT_SENT_TO_PDF_READER');
            if (hooks.processed) pdf.attachmentLastProcessedModificationTime = 1700000000;
            return { itemID: 2, _initPromise: Promise.resolve(), _internalReader: { _lastView: {
                initializedPromise: Promise.resolve(), _iframeWindow: { PDFViewerApplication: { pdfDocument: {
                    getDownloadInfo: async () => ({ length: bytes.length }), getData: async () => bytes,
                } } },
            } }, navigate: async (location: unknown) => { locations.push(location); await hooks.navigate(); } };
        } } };
    const preview: any = { id: 'f'.repeat(32), stage_id: 'e'.repeat(32), notebook_id: scope.notebook_id, expected_revision: 1,
        items: [], removed: [], offset: 0, limit: 0, total: 0, included_count: 1, removed_count: 0,
        added_count: 1, dropped_count: 0, changed_count: 0, possible_duplicate_count: 0 };
    const engine = { stop: async () => {}, request: async (_: string, path: string, body?: any): Promise<any> => {
        requests.push({ path, body });
        if (path.endsWith('/access')) { await hooks.runAccess(); return { items: [{ identity, contents: [
            { key: 'PDFKEY1', kind: 'pdf' }, { key: 'NOTE1', kind: 'human_note' }, { key: 'ANNOT1', kind: 'human_annotation' },
        ] }], documents: [['b'.repeat(64), 'PDFKEY1']] }; }
        if (path.includes('/jobs/') && path.includes('/access?')) {
            await hooks.runAccess();
            // Deliberately small first page exercises variable-size access pagination.
            const offset = Number(new URL('http://fixture' + path).searchParams.get('offset'));
            const contents = [{ key: 'PDFKEY1', kind: 'pdf' }, { key: 'NOTE1', kind: 'human_note' }, { key: 'ANNOT1', kind: 'human_annotation' }];
            const item = offset === 0 ? { identity, contents } : { identity: { ...identity, item_key: 'PARENT2' }, contents: [] };
            return { items: [item], documents: offset === 0 ? [['b'.repeat(64), 'PDFKEY1']] : [], offset, limit: 1, total: 2 };
        }
        if (path.endsWith('/control')) return { id: 'f'.repeat(32), state: 'CANCELLED' };
        if (path.includes('/units?')) return { items: [], offset: 0, limit: 0, total: 0 };
        if (path.endsWith('/cancel')) return { id: 'f'.repeat(32), state: 'RUNNING' };
        if (path.endsWith('/events?cursor=0')) return { items: [], cursor: 0, state: 'RUNNING' };
        if (path.includes('/snapshots?')) return { items: [{ selection: {} }], total: 1, offset: 0, limit: 1 };
        if (path.includes('/identities?')) return { items: [{ identity, contents: [{ key: 'PDFKEY1', kind: sourceKind },
            { key: 'NOTE1', kind: 'human_note' }, { key: 'ANNOT1', kind: 'human_annotation' }] }], total: 1, offset: 0, limit: 100 };
        if (path.endsWith('/sources/sync')) return { items: body.items.map((s: any) => ({ ...s, id: 'b'.repeat(64), version_id: 'v', year_state: 'missing' })),
            total: 1, offset: 0, limit: 1, stage_id: body.purpose === 'selection' ? preview.stage_id : body.stage_id };
        if (path.endsWith('/sources/preview') || path.includes('/sources/previews/')) return preview;
        if (path.endsWith('/documents/register')) return { id: 'd'.repeat(32) };
        if (path.includes('/evidence/')) return evidence;
        if (path.endsWith('/documents/text-view')) {
            await hooks.textView();
            return { evidence, title: 'Original text', media_type: mediaType, offset: body.offset ?? 0, text: 'verified text', total: 40000 };
        }
        if (path.endsWith('/documents/verify')) { if (++verifyCount === 2) await hooks.beforeSecondVerify(); return evidence; }
        if (path === '/v1/sources/invalidate') { invalidated.push(body); return { invalidated_count: 1 }; }
        throw new Error(`Unexpected reader route ${path}`);
    } };
    const sources = new SourceBridge(api, engine, 'p1', error => errors.push(error));
    await sources.preview(scope.notebook_id, { include_selected_containers: false, include_descendants: false,
        include_notes: true, include_annotations: true, tag_mode: 'AND', pdf_only: false }, { getSelectedItems: () => [pdf, note, annotation] } as any);
    const bridge = new DocumentBridge(api, sources, engine, webcrypto as unknown as Crypto, value => value, openText);
    const notify = (ids = [2], extra: any = { '2': { changed: {} } }, event = 'modify', type = 'item') => observer.notify(event, type, ids, extra);
    return { pdf, note, annotation, library, sources, evidence, hooks, locations, invalidated, errors, fetched, notify, requests,
        events: () => bridge.dispatch({ op: 'conversation.events', ...scope, run_id: 'f'.repeat(32), cursor: 0 }),
        cancel: () => bridge.dispatch({ op: 'conversation.cancel', ...scope, run_id: 'f'.repeat(32) }),
        jobUnits: () => bridge.dispatch({ op: 'jobs.units', ...scope, job_id: 'f'.repeat(32), offset: 0 }),
        jobCancel: () => bridge.dispatch({ op: 'jobs.control', ...scope, job_id: 'f'.repeat(32), request: { action: 'cancel', expected_revision: 0, idempotency_key: 'cancel' } }),
        removeLibrary: () => { exists = false; },
        open: () => bridge.dispatch({ op: 'documents.open', ...scope, evidence_id: evidence.id }),
        preview: () => sources.previewPage(scope.notebook_id, preview.id, 0) };
}

test('text attachment opening and later segments verify current scoped originals without entering the PDF Reader', async () => {
    let opened = 0, read!: Parameters<TextAttachmentOpener>[1];
    const f = await readerNotifications(false, 'text/html', async (view, next) => {
        ++opened; read = next;
        expect(view.evidence.source_kind).toBe('text_attachment');
        expect(view.evidence.page_index).toBeNull();
    });
    try {
        await f.open();
        expect(opened).toBe(1);
        expect(f.requests.find(value => value.path.endsWith('/documents/text-view'))?.body).toEqual({
            evidence_id: f.evidence.id, path: 'C:/authorized/only.pdf', offset: null,
        });
        f.requests.length = 0;
        expect((await read(16000)).offset).toBe(16000);
        expect(f.requests.some(value => value.path.includes('/identities?'))).toBe(true);
        expect(f.requests.some(value => value.path.endsWith('/documents/register'))).toBe(true);
        f.hooks.textView = async () => { f.pdf.attachmentPath = 'C:/changed/other.html'; };
        await expect(f.open()).rejects.toThrow('DOCUMENT_STALE');
        expect(opened).toBe(1);
        f.hooks.textView = async () => { throw new Error('DOCUMENT_STALE'); };
        await expect(read(0)).rejects.toThrow('DOCUMENT_STALE');
        f.removeLibrary();
        const calls = f.requests.filter(value => value.path.endsWith('/documents/text-view')).length;
        await expect(read(0)).rejects.toThrow();
        expect(f.requests.filter(value => value.path.endsWith('/documents/text-view'))).toHaveLength(calls);
    } finally { f.sources.shutdown(); }
});

test('run continuation preserves authorized sibling sync and cancellation bypasses blocked content preflight', async () => {
    const f = await readerNotifications();
    f.requests.length = 0;
    let release!: () => void, entered!: () => void;
    const waiting = new Promise<void>(resolve => { entered = resolve; });
    f.hooks.runAccess = () => new Promise<void>(resolve => { release = resolve; entered(); });
    const events = f.events();
    await waiting;
    expect(await f.cancel()).toEqual({ id: 'f'.repeat(32), state: 'RUNNING' });
    expect(f.requests.some(r => r.path.endsWith('/events?cursor=0'))).toBe(false);
    release();
    await events;
    expect(f.requests.some(r => r.path.includes('/identities?'))).toBe(false);
    expect(f.requests.filter(r => r.path.endsWith('/documents/register'))).toHaveLength(1);
    expect(f.requests.find(r => r.path.endsWith('/sources/sync'))!.body.items[0].contents.map((c: any) => c.key)).toEqual(['PDFKEY1', 'NOTE1', 'ANNOT1']);
    f.hooks.runAccess = async () => { await f.notify([1], {}, 'modify'); };
    await expect(f.events()).rejects.toThrow('SCOPE_STALE');
});

test('job continuation paginates exact access, preserves sibling sync and permits cancel during a blocked read', async () => {
    const f = await readerNotifications();
    try {
        f.requests.length = 0;
        let release!: () => void, entered!: () => void;
        const waiting = new Promise<void>(resolve => { entered = resolve; });
        f.hooks.runAccess = () => new Promise<void>(resolve => { release = resolve; entered(); });
        const units = f.jobUnits(); await waiting;
        expect(await f.jobCancel()).toEqual({ id: 'f'.repeat(32), state: 'CANCELLED' });
        expect(f.requests.some(r => r.path.includes('/units?'))).toBe(false);
        f.hooks.runAccess = async () => {}; release(); await units;
        expect(f.requests.filter(r => r.path.includes('/access?')).map(r => r.path.split('?')[1])).toEqual(['offset=0&limit=50', 'offset=1&limit=50']);
        expect(f.requests.some(r => r.path.includes('/identities?'))).toBe(false);
        expect(f.requests.filter(r => r.path.endsWith('/documents/register'))).toHaveLength(1);
        expect(f.requests.find(r => r.path.endsWith('/sources/sync'))!.body.items[0].contents.map((c: any) => c.key)).toEqual(['PDFKEY1', 'NOTE1', 'ANNOT1']);
        f.hooks.runAccess = async () => { await f.notify([1], {}, 'modify'); };
        await expect(f.jobUnits()).rejects.toThrow('SCOPE_STALE');
    } finally { f.sources.shutdown(); }
});

test.each([
    'reader-last-read', 'verified-native-processing', 'path', 'link-mode', 'content-type', 'charset', 'sync-state',
    'storage-mtime', 'storage-hash', 'unverified-processing', 'parent', 'deleted', 'version', 'title',
    'note', 'annotation-text', 'annotation-comment', 'annotation-position', 'mixed-event', 'unknown',
    'ambiguous-payload', 'unavailable-prior-state', 'unavailable-readback', 'missing-library', 'archived-library',
])('native reader notification preserves continuation only for proven bookkeeping: %s', async scenario => {
    const f = await readerNotifications(scenario === 'unavailable-prior-state');
    f.hooks.processed = scenario !== 'reader-last-read';
    const benign = ['reader-last-read', 'verified-native-processing'].includes(scenario);
    f.hooks.navigate = async () => {
        f.pdf.attachmentLastRead = 1700000001;
        if (scenario === 'path') f.pdf.attachmentPath = 'C:/authorized/relinked.pdf';
        if (scenario === 'link-mode') f.pdf.attachmentLinkMode = 0;
        if (scenario === 'content-type') f.pdf.attachmentContentType = 'text/plain';
        if (scenario === 'charset') f.pdf.attachmentCharset = 'utf-8';
        if (scenario === 'sync-state') f.pdf.attachmentSyncState = 1;
        if (scenario === 'storage-mtime') f.pdf.attachmentSyncedModificationTime = 1700000001;
        if (scenario === 'storage-hash') f.pdf.attachmentSyncedHash = 'a'.repeat(32);
        if (scenario === 'unverified-processing') ++f.pdf.attachmentLastProcessedModificationTime;
        if (scenario === 'parent') f.pdf.parentKey = 'OTHER1';
        if (scenario === 'deleted') f.pdf.deleted = true;
        if (scenario === 'version') ++f.pdf.version;
        if (scenario === 'title') { const get = f.pdf.getField; f.pdf.getField = (name: string) => name === 'title' ? 'Changed' : get(name); }
        if (scenario === 'unavailable-readback') Object.defineProperty(f.pdf, 'attachmentPath', { get: () => { throw new Error('NATIVE_READBACK_FAILED'); } });
        if (scenario === 'missing-library') f.removeLibrary();
        if (scenario === 'archived-library') f.library.archived = true;
        if (scenario === 'note' || scenario === 'mixed-event') {
            f.note.getNote = () => 'Changed human note';
            await f.notify(scenario === 'mixed-event' ? [2, 3] : [3], { '2': { changed: {} }, '3': { changed: { note: 'Human note' } } });
        } else if (scenario.startsWith('annotation-')) {
            const field = { 'annotation-text': 'annotationText', 'annotation-comment': 'annotationComment', 'annotation-position': 'annotationPosition' }[scenario]!;
            const old = f.annotation[field]; f.annotation[field] = 'Changed annotation';
            await f.notify([4], { '4': { changed: { [field]: old } } });
        } else await f.notify(scenario === 'unknown' ? [999] : [2], scenario === 'ambiguous-payload' ? {} : { '2': { changed: {} } });
    };
    try {
        if (benign) {
            await expect(f.open()).resolves.toEqual(f.evidence);
            expect(f.sources.state().revision).toBe(0);
            await expect(f.preview()).resolves.toHaveProperty('preview.id');
            expect(f.invalidated).toEqual([]);
        } else {
            await expect(f.open()).rejects.toThrow('SCOPE_STALE');
            expect(f.sources.state().revision).toBe(1);
            await expect(f.preview()).rejects.toThrow('SCOPE_STALE');
            expect(f.invalidated).toEqual([{ identities: [f.evidence.source_identity], reason: 'changed' }]);
        }
        expect(f.fetched.every(id => [1, 2, 3, 4, 'PARENT1', 'PDFKEY1', 'NOTE1', 'ANNOT1'].includes(id))).toBe(true);
        expect(f.errors.map((error: any) => error.message)).toEqual(scenario === 'unavailable-readback' ? ['NATIVE_READBACK_FAILED'] : []);
    } finally { f.sources.shutdown(); }
});

test.each(['timestamp', 'path', 'metadata', 'scope', 'bytes', 'benign-then-material'])('PDF processing acknowledgment fails closed across %s verification races', async scenario => {
    const f = await readerNotifications();
    f.hooks.beforeSecondVerify = async () => {
        if (scenario === 'timestamp') ++f.pdf.attachmentLastProcessedModificationTime;
        if (scenario === 'path') f.pdf.attachmentPath = 'C:/authorized/relinked.pdf';
        if (scenario === 'metadata') ++f.pdf.version;
        if (scenario === 'scope') await f.notify([2], {}, 'trash');
        if (scenario === 'bytes') throw new Error('DOCUMENT_STALE');
    };
    f.hooks.navigate = async () => {
        f.pdf.attachmentLastRead = 1700000001;
        const benign = f.notify();
        f.pdf.attachmentPath = 'C:/authorized/relinked.pdf';
        const changed = f.notify();
        await Promise.all([benign, changed]);
    };
    try {
        await expect(f.open()).rejects.toThrow(scenario === 'bytes' ? 'DOCUMENT_STALE' : 'SCOPE_STALE');
        if (scenario === 'bytes') { f.pdf.attachmentLastRead = 1700000001; await f.notify(); }
        expect(f.locations).toHaveLength(scenario === 'benign-then-material' ? 1 : 0);
        expect(f.sources.state().revision).toBe(scenario === 'bytes' ? 2 : 1);
        expect(f.invalidated).toHaveLength(scenario === 'bytes' ? 2 : 1);
        await expect(f.preview()).rejects.toThrow('SCOPE_STALE');
    } finally { f.sources.shutdown(); }
});

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

test.each(['pdf', 'text_attachment'])('production document bridge revalidates exact %s content before resolving its path and fails on an intervening native notification', async kind => {
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
    const pdf: any = { ...parent, id: 2, key: 'PDFKEY1', parentID: 1, parentKey: 'PARENT1', attachmentContentType: kind === 'pdf' ? 'application/pdf' : 'text/plain',
        attachmentPath: 'C:/authorized/only.pdf', attachmentLinkMode: 2, attachmentCharset: null,
        attachmentSyncState: 0, attachmentSyncedModificationTime: null, attachmentSyncedHash: null,
        attachmentLastProcessedModificationTime: 0, attachmentLastRead: null, getFilePath: () => 'C:/authorized/only.pdf',
        isRegularItem: () => false, isAttachment: () => true, isFileAttachment: () => true, isPDFAttachment: () => kind === 'pdf',
        getFilePathAsync: async () => { calls.push('native.path'); if (changed) await observer.notify('modify', 'item', [2], {}); return 'C:/authorized/only.pdf'; } };
    const badPdf = { ...pdf, id: 3, key: 'BADPDF1' };
    const api: any = { Libraries: { exists: () => true, get: () => ({ libraryID: 1, libraryType: 'user', libraryTypeID: null, archived: false }) },
        Items: { getByLibraryAndKeyAsync: async (_: number, key: string) => { fetched.push(key); return key === 'PARENT1' ? parent : key === 'PDFKEY1' ? pdf : key === 'BADPDF1' ? badPdf : false; },
            getAsync: async (id: number) => id === 1 ? parent : id === 2 ? pdf : false },
        ItemTypes: { getName: () => 'journalArticle' },
        Notifier: { registerObserver: (value: any) => { observer = value; return 'observer'; }, unregisterObserver() {} } };
    const document = { id: 'd'.repeat(32), source_id: 'b'.repeat(64), content_key: 'PDFKEY1', source_kind: kind, revision: 1 };
    const engine = { stop: async () => {}, request: async (_: string, path: string, body?: any) => {
        calls.push(path);
        if (path.includes('/identities?')) return { items: [{ identity, contents: [{ key: 'PDFKEY1', kind }, { key: 'BADPDF1', kind }] }], total: 1, offset: 0, limit: 100 };
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
    // This test isolates loaded Reader identity; the real file-acknowledgment
    // continuation and its races are exercised by readerNotifications above.
    const sources: any = { withDocuments: async (_: string, __: string, run: any) => run([source], () => {},
        async (_item: unknown, _path: string, verify: () => Promise<unknown>) => { await verify(); }) };
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

test('annotation indexing preserves literals and entities through Zotero restricted formatting before hashing the staged text', async () => {
    const { DocumentBridge } = await import('../src/bridge/documents');
    const annotationText = 'List<T> &amp; <span>literal</span> unmatched <b> and <i>';
    const annotationComment = '</i> plus <i>italics</i> <B>bold</B> H<sub>2</sub> x<SUP>2</SUP>';
    const expected = 'List<T> &amp; <span>literal</span> unmatched <b> and <i>\n\n</i> plus italics bold H2 x2';
    // Native formatter responses follow the installed algorithm. In particular a pair
    // cannot cross annotationText/annotationComment and unrecognized syntax is escaped.
    const formatted = new Map([
        [annotationText, 'List&lt;T&gt; &amp;amp; &lt;span&gt;literal&lt;/span&gt; unmatched &lt;b&gt; and &lt;i&gt;'],
        [annotationComment, '&lt;/i&gt; plus <i>italics</i> <b>bold</b> H<sub>2</sub> x<sup>2</sup>'],
    ]);
    const item = { id: 2, key: 'ANNOT001', libraryID: 1, deleted: false, version: 1, getField: () => 'stamp',
        isAnnotation: () => true, annotationText, annotationComment };
    const source: any = { id: 'b'.repeat(64), identity: { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT1' },
        contents: [{ key: item.key, kind: 'human_annotation', version: '1:stamp' }] };
    const api: any = { Items: { getByLibraryAndKeyAsync: async () => item }, EditorInstanceUtilities: {
        _transformTextToHTML: (text: string) => { const html = formatted.get(text); if (html === undefined) throw new Error('Unexpected native annotation input'); return html; },
    } };
    const sources: any = { withDocuments: async (_: string, __: string, run: any) => run([source], () => {}) };
    const writes: { path: string; body: any }[] = [];
    const document = { id: 'd'.repeat(32), source_id: source.id, content_key: item.key, source_kind: 'human_annotation',
        revision: 1, coverage: 'FULL_TEXT_PARSED', reason: null };
    const engine: any = { request: async (method: string, path: string, body: any) => {
        expect(method).toBe('POST'); writes.push({ path, body });
        if (path.endsWith('/documents/text')) return { id: 'e'.repeat(32), offset: 0, total_characters: body.total_characters, document: null };
        if (path.endsWith('/documents/text/' + 'e'.repeat(32))) return { id: 'e'.repeat(32), offset: [...body.text].length,
            total_characters: [...body.text].length, document };
        throw new Error('Unexpected annotation document route');
    } };
    const plainText = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
    const bridge = new DocumentBridge(api, sources, engine, webcrypto as unknown as Crypto, plainText);
    const command = parseUiMessage({ op: 'documents.index', ...scope, source_id: source.id, content_key: item.key, limits: {}, idempotency_key: 'annotation' });
    if (command.op !== 'documents.index') throw new Error('Expected an indexing command');
    expect(await bridge.dispatch(command)).toEqual({ document, operation: null });
    expect(writes).toHaveLength(2);
    expect(writes[0]!.body).toEqual({ source_id: source.id, content_key: item.key, total_characters: expected.length,
        sha256: createHash('sha256').update(expected).digest('hex') });
    expect(writes[1]!.body).toEqual({ offset: 0, text: expected, final: true });
    expect([item.annotationText, item.annotationComment]).toEqual([annotationText, annotationComment]);
    writes.length = 0;
    delete api.EditorInstanceUtilities._transformTextToHTML;
    await expect(bridge.dispatch(command)).rejects.toThrow('_transformTextToHTML is not a function');
    expect(writes).toEqual([]);
});
