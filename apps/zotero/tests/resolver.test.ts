import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { expect, test } from 'vitest';

async function production() {
    expect(existsSync(new NodeURL('../src/sources/resolver.ts', import.meta.url)), 'source resolver is missing').toBe(true);
    return import(/* @vite-ignore */ new NodeURL('../src/sources/resolver.ts', import.meta.url).href);
}

// Controlled native API fixture, not a live Zotero profile or native smoke.
function fixture() {
    const fetched: number[] = [], wholeLibraries: number[] = [];
    const items = new Map<number, any>();
    function item(id: number, key: string, libraryID = 1, type = 'journalArticle', parentID: number | false = false) {
        const fields: Record<string, string> = { title: key, date: '2020-02-01', dateModified: '2026-09-05 00:00:00', DOI: '10.1/same', abstractNote: 'Original abstract' };
        const value = { id, key, libraryID, parentID, parentKey: parentID ? items.get(parentID)?.key : false,
            itemTypeID: type, version: 4, deleted: false, attachmentContentType: type === 'attachment' ? 'application/pdf' : '',
            isRegularItem: () => !['note', 'annotation', 'attachment'].includes(type),
            isNote: () => type === 'note', isAnnotation: () => type === 'annotation', isAttachment: () => type === 'attachment',
            isFileAttachment: () => type === 'attachment', isPDFAttachment: () => type === 'attachment',
            getField: (key: string) => fields[key] ?? '', getTags: () => [{ tag: 'review' }],
            getAttachments: () => [...items.values()].filter(i => i.parentID === id && i.isAttachment()).map(i => i.id),
            getNotes: () => [...items.values()].filter(i => i.parentID === id && i.isNote()).map(i => i.id),
            getAnnotations: () => [...items.values()].filter(i => i.parentID === id && i.isAnnotation()),
            getNote: () => id === 15 ? '<div data-evidra-origin="ai">Draft</div>' : '<p>Human</p>',
            loadAllData: async () => {}, isEditable: () => false };
        items.set(id, value); return value;
    }
    item(10, 'SAMEKEY1'); item(11, 'PDFMAIN1', 1, 'attachment', 10); item(12, 'PDFSUPP1', 1, 'attachment', 10);
    item(13, 'NOTEHUM1', 1, 'note', 10); item(14, 'ANNOTAT1', 1, 'annotation', 11); item(15, 'NOTEAIA1', 1, 'note', 10);
    item(20, 'SAMEKEY1', 2); item(21, 'GROUPPDF', 2, 'attachment', 20);
    item(30, 'ARCHIVE1', 3); item(31, 'ARCHPDF1', 3, 'attachment', 30);
    item(40, 'DESCEND1'); item(50, 'UNRELATED');
    const libraries = new Map([[1, { libraryID: 1, libraryType: 'user', libraryTypeID: 123, archived: false, editable: true, filesEditable: true }],
        [2, { libraryID: 2, libraryType: 'group', libraryTypeID: 9002, groupID: 9002, archived: false, editable: false, filesEditable: false }],
        [3, { libraryID: 3, libraryType: 'group', libraryTypeID: 9003, groupID: 9003, archived: true, editable: false, filesEditable: false }]]);
    const collections = new Map([['COL1', { id: 1, key: 'COL1', libraryID: 1, deleted: false, loadAllData: async () => {}, getChildItems: () => [10], getDescendents: () => [{ id: 10, type: 'item' }, { id: 40, type: 'item' }] }],
        ['COL2', { id: 2, key: 'COL2', libraryID: 1, deleted: false, loadAllData: async () => {}, getChildItems: () => [10], getDescendents: () => [{ id: 10, type: 'item' }] }]]);
    const searches = new Map([['SEARCH1', { id: 3, key: 'SEARCH1', libraryID: 1, deleted: false, loadAllData: async () => {}, search: async () => [12, 13, 15] }]]);
    const api = { Libraries: { exists: (id: number) => libraries.has(id), get: (id: number) => libraries.get(id) },
        Items: { getAsync: async (id: number) => { fetched.push(id); return items.get(id) ?? false; },
            getByLibraryAndKeyAsync: async (library: number, key: string) => { const value = [...items.values()].find(i => i.libraryID === library && i.key === key); if (value) fetched.push(value.id); return value ?? false; } },
        Collections: { getByLibraryAndKeyAsync: async (_: number, key: string) => collections.get(key) ?? false },
        Searches: { getByLibraryAndKeyAsync: async (_: number, key: string) => searches.get(key) ?? false },
        ItemTypes: { getName: (id: string) => id },
        Search: class { libraryID = 0; addCondition() {} async search() { wholeLibraries.push(this.libraryID); return [...items.values()].filter(i => i.libraryID === this.libraryID && !i.parentID).map(i => i.id); } } };
    const pane = { getSelectedLibraryIDs: () => [1, 2, 3], getCollectionTreeRows: () => [{ ref: { libraryID: 1 }, isLibrary: () => false }, { ref: { libraryID: 2 }, isLibrary: () => false }, { ref: { libraryID: 3 }, isLibrary: () => false }],
        getSelectedCollections: () => [...collections.values()], getSelectedSavedSearches: () => [], getSelectedItems: () => [items.get(20), items.get(30)] };
    return { api, pane, items, item, libraries, fetched, wholeLibraries };
}

test('plural selectors deduplicate overlaps without scanning parent libraries; descendants are explicit and read-only groups remain readable', async () => {
    const { captureSelectors, resolveSelection } = await production();
    const f = fixture();
    const navigationPane = { ...f.pane, getCollectionTreeRows: () => [{ ref: { libraryID: 1 }, isLibrary: () => true }], getSelectedItems: () => [f.items.get(10)] };
    const itemOnly = captureSelectors(navigationPane);
    expect(itemOnly).toEqual([{ kind: 'item', library_id: 1, key: 'SAMEKEY1' }]);
    expect((await resolveSelection(f.api, 'p1', { selectors: itemOnly })).items.map((s: any) => s.identity.item_key)).toEqual(['SAMEKEY1']);
    const selectors = captureSelectors(f.pane, true);
    expect(selectors.map((s: any) => s.kind)).toEqual(['collection', 'collection', 'item', 'item']);
    let result = await resolveSelection(f.api, 'p1', { selectors });
    expect(result.items.map((s: any) => [s.identity.library_id, s.identity.item_key])).toEqual([[1, 'SAMEKEY1'], [2, 'SAMEKEY1']]);
    expect(result.items[1]).toMatchObject({ remote_group_id: 9002, remote_library_id: '9002' });
    expect(result.unavailable).toEqual([{ identity: { profile_instance_id: 'p1', library_id: 3, item_key: 'ARCHIVE1' }, reason: 'archived' }]);
    expect(f.wholeLibraries).toEqual([]);
    expect(f.fetched).not.toContain(40); expect(f.fetched).not.toContain(50); expect(f.fetched).not.toContain(31);
    expect(result.items[0].contents.filter((c: any) => c.kind === 'pdf').map((c: any) => [c.key, c.role])).toEqual([['PDFMAIN1', 'unassigned'], ['PDFSUPP1', 'unassigned']]);
    result = await resolveSelection(f.api, 'p1', { selectors, include_descendants: true });
    expect(result.items.map((s: any) => s.identity.item_key)).toEqual(['SAMEKEY1', 'DESCEND1', 'SAMEKEY1']);
    const field = f.items.get(10).getField;
    f.items.get(10).getField = (name: string) => name === 'date' ? '0800-01-01' : field(name);
    result = await resolveSelection(f.api, 'p1', { selectors: captureSelectors(navigationPane, true) });
    expect(f.wholeLibraries).toEqual([1]);
    expect(result.items.find((s: any) => s.identity.item_key === 'SAMEKEY1').year).toBe(800);
    expect(result.items.some((s: any) => s.identity.item_key === 'UNRELATED')).toBe(true);
    f.libraries.delete(2);
    result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'item', library_id: 2, key: 'SAMEKEY1' }] });
    expect(result.unavailable[0].reason).toBe('library_missing');
});

test('saved-search child normalization preserves only selected content and enforces note/annotation provenance opt-in', async () => {
    const { resolveSelection } = await production();
    const f = fixture();
    let result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'search', library_id: 1, key: 'SEARCH1' }] });
    expect(result.items.map((s: any) => s.identity.item_key)).toEqual(['SAMEKEY1']);
    expect(result.items[0].contents.map((c: any) => c.key)).toEqual(['PDFSUPP1']);
    expect(f.fetched).not.toContain(11);
    result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'search', library_id: 1, key: 'SEARCH1' }], include_notes: true });
    expect(result.items[0].contents.map((c: any) => [c.key, c.kind])).toEqual([['PDFSUPP1', 'pdf'], ['NOTEHUM1', 'human_note']]);
    result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'item', library_id: 1, key: 'ANNOTAT1' }], include_annotations: true });
    expect(result.items[0].contents.map((c: any) => [c.key, c.kind])).toEqual([['ANNOTAT1', 'human_annotation']]);
    f.items.get(14).getTags = () => [{ tag: 'evidra:ai' }];
    result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'item', library_id: 1, key: 'ANNOTAT1' }], include_annotations: true });
    expect(result.items[0].contents).toEqual([]);
    f.items.get(10).deleted = true;
    result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'item', library_id: 1, key: 'PDFSUPP1' }] });
    expect(result.items).toEqual([]);
    expect(result.unavailable[0].reason).toBe('deleted');
});

test.each([
    { kind: 'attachment', includeNotes: false, ai: false, expected: 'pdf' },
    { kind: 'note', includeNotes: false, ai: false, expected: null },
    { kind: 'note', includeNotes: true, ai: false, expected: 'human_note' },
    { kind: 'note', includeNotes: true, ai: true, expected: null }
])('standalone $kind keeps its own identity and content authorization (notes=$includeNotes, AI=$ai)', async ({ kind, includeNotes, ai, expected }) => {
    const { resolveSelection } = await production();
    const f = fixture();
    const standalone = f.item(60, 'DIRECT01', 1, kind);
    if (ai) standalone.getTags = () => [{ tag: 'evidra:ai' }];
    const result = await resolveSelection(f.api, 'p1', { selectors: [{ kind: 'item', library_id: 1, key: 'DIRECT01' }], include_notes: includeNotes });
    if (expected) {
        expect(result.items).toHaveLength(1);
        expect(result.items[0].identity.item_key).toBe('DIRECT01');
        expect(result.items[0].item_type).toBe(kind);
        expect(result.items[0].contents.map((c: any) => [c.key, c.kind])).toEqual([['DIRECT01', expected]]);
    } else {
        expect(result.items).toEqual([]);
        expect(result.unavailable).toEqual([{ identity: { profile_instance_id: 'p1', library_id: 1, item_key: 'DIRECT01' }, reason: 'content_excluded' }]);
    }
});

test('privileged source preflight precedes content, notifications invalidate known sources, and failed revocation stops the owned engine', async () => {
    expect(existsSync(new NodeURL('../src/bridge/sources.ts', import.meta.url)), 'source bridge is missing').toBe(true);
    const { SourceBridge } = await import(/* @vite-ignore */ new NodeURL('../src/bridge/sources.ts', import.meta.url).href);
    const f = fixture();
    let observer: any, removed = false, stopped = false, deny = false;
    let readIdentity = { profile_instance_id: 'p1', library_id: 2, item_key: 'SAMEKEY1' };
    const calls: string[] = [], invalidated: any[] = [], errors: unknown[] = [], synced: any[] = [];
    const api = { ...f.api, Notifier: { registerObserver: (value: any) => { observer = value; return 'observer'; }, unregisterObserver: () => { removed = true; } } };
    const transport = { request: async (_method: string, path: string, body?: any) => {
        calls.push(path);
        if (path.includes('/identities')) return { items: [readIdentity], total: 1, offset: 0, limit: 100 };
        if (path.endsWith('/sources/sync')) { synced.push(body); return { items: body.items.map((s: any) => ({ ...s, id: 'a'.repeat(64), version_id: 'v', year_state: 'known' })), total: 1, offset: 0, limit: 1, stage_id: body.stage_id }; }
        if (path === '/v1/sources/invalidate') { if (deny) throw new Error('INVALIDATION_FAILURE'); invalidated.push(body); return { revision: 0 }; }
        if (path.includes('/snapshots?')) return { items: [{ id: 'snapshot', selection: { include_notes: true } }], total: 1, offset: 0, limit: 1 };
        if (path.includes('/sources?')) return { items: [{ source: { title: 'Allowed group source' }, state: 'current' }], total: 1, unavailable_count: 0, offset: 0, limit: 50 };
        throw new Error(`Unexpected path ${path}`);
    }, stop: async () => { stopped = true; } };
    const bridge = new SourceBridge(api, transport, 'p1', (e: unknown) => errors.push(e));
    try {
        const page = await bridge.read('notebook', 'snapshot', 0);
        expect(page.items[0].source.title).toBe('Allowed group source');
        expect(calls.findIndex(p => p.includes('/identities'))).toBeLessThan(calls.findIndex(p => p.endsWith('/sources/sync')));
        expect(calls.findIndex(p => p.endsWith('/sources/sync'))).toBeLessThan(calls.findIndex(p => p.includes('/sources?')));
        expect(f.fetched).not.toContain(10); expect(f.fetched).not.toContain(50);
        expect(synced[0]).toMatchObject({ purpose: 'revalidation', stage_id: null, final: true });
        await observer.notify('modify', 'item', [21], {});
        expect(invalidated[0]).toEqual({ identities: [{ profile_instance_id: 'p1', library_id: 2, item_key: 'SAMEKEY1' }], reason: 'changed' });
        expect(bridge.state().revision).toBe(1);
        const fetched = f.fetched.length;
        await observer.notify('add', 'item', [9999], {});
        expect(bridge.state().revision).toBe(2);
        expect(f.fetched).toHaveLength(fetched);
        expect(invalidated[1].identities).toEqual(invalidated[0].identities);
        const standalone = f.item(60, 'DIRECT01', 2, 'note');
        standalone.getTags = () => [{ tag: 'evidra:ai' }];
        readIdentity = { ...readIdentity, item_key: 'DIRECT01' };
        await bridge.read('notebook', 'snapshot', 0);
        expect(invalidated.at(-1)).toEqual({ identities: [readIdentity], reason: 'changed' });
        deny = true;
        await expect(observer.notify('delete', 'item', [20], {})).rejects.toThrow('INVALIDATION_FAILURE');
        expect(stopped).toBe(true); expect(errors).toHaveLength(1);
        const before = calls.length;
        await expect(bridge.read('notebook', 'snapshot', 0)).rejects.toThrow('INVALIDATION_FAILURE');
        expect(calls).toHaveLength(before);
    } finally { bridge.shutdown(); }
    expect(removed).toBe(true);
});

test('selection batches bind one completed server stage; empty selection, revalidation and interrupted capture stay explicit', async () => {
    const { SourceBridge } = await import('../src/bridge/sources');
    const f = fixture();
    const selected = Array.from({ length: 202 }, (_, index) => f.item(1000 + index, `BATCH${index}`));
    const field = selected[0]!.getField;
    selected[0]!.getField = (name: string) => name === 'title' ? '漢'.repeat(9000) : field(name);
    const options = { include_selected_containers: false, include_descendants: false, tag_mode: 'AND' as const, pdf_only: false, include_notes: false, include_annotations: false };
    const pane = { ...f.pane, getSelectedItems: () => [...selected, f.items.get(30)] };
    const api = { ...f.api, Notifier: { registerObserver: () => 'observer', unregisterObserver() {} } };
    const synced: any[] = [], previews: any[] = [], commits: any[] = [];
    let stage: { id: string; complete: boolean; items: any[] } | null = null;
    let stageNumber = 0, revision = 1, failAt = -1;
    const transport = { request: async (_: string, path: string, body?: any) => {
        if (path.endsWith('/sources/sync')) {
            synced.push(body);
            if (synced.length === failAt) throw new Error('BATCH_INTERRUPTED');
            expect(body.items.length).toBeLessThanOrEqual(100);
            expect(new TextEncoder().encode(JSON.stringify(body)).length).toBeLessThanOrEqual(65536);
            if (body.purpose === 'selection') {
                if (body.stage_id === null) stage = { id: (++stageNumber).toString(16).padStart(32, '0'), complete: false, items: [] };
                else expect(stage?.id).toBe(body.stage_id);
                expect(stage?.complete).toBe(false);
                stage!.items.push(...body.items); stage!.complete = body.final;
            } else {
                expect(body.purpose).toBe('revalidation'); expect(body.final).toBe(true);
                expect(stage?.id).toBe(body.stage_id);
                expect(stage?.complete).toBe(true);
            }
            return { items: [], offset: 0, limit: 0, total: 0, stage_id: stage!.id };
        }
        if (path.endsWith('/sources/preview')) {
            previews.push(body);
            expect(Object.keys(body).sort()).toEqual(['selection', 'stage_id']);
            expect(stage?.complete).toBe(true); expect(body.stage_id).toBe(stage?.id);
            return { id: 'b'.repeat(31) + stageNumber, stage_id: stage!.id, notebook_id: 'notebook', expected_revision: revision, selection: body.selection, items: [], removed: [], added: [], dropped: [], changed: [], possible_duplicates: [] };
        }
        if (path === '/v1/sources/invalidate') return { invalidated_count: 0 };
        if (path.includes('/snapshots?')) return { items: [{ selection: {} }], offset: 0, limit: 1, total: 1 };
        if (path.endsWith('/snapshots')) { commits.push(body); return { id: 'c'.repeat(32), notebook_id: 'notebook', revision: ++revision, created_at: '2026-09-05T00:00:00Z', selection: {}, member_count: selected.length }; }
        throw new Error(`Unexpected path ${path}`);
    }, stop: async () => {} };
    const bridge = new SourceBridge(api as any, transport, 'p1', () => {});
    try {
        const first = await bridge.preview('notebook', options, pane);
        const batchCount = synced.length;
        expect(batchCount).toBeGreaterThan(2);
        expect(synced.flatMap(b => b.items)).toHaveLength(202);
        expect(synced.every(b => b.purpose === 'selection')).toBe(true);
        expect(synced[0].stage_id).toBeNull();
        expect(synced.slice(1).every(b => b.stage_id === first.preview.stage_id)).toBe(true);
        expect(synced.map(b => b.final)).toEqual(synced.map((_, index) => index === batchCount - 1));
        const request = { preview_id: first.preview.id, expected_revision: 1, idempotency_key: 'capture' };
        await bridge.create('notebook', request);
        expect(commits).toHaveLength(1); // Unchanged archived exclusions do not prevent capture.
        expect(synced.slice(batchCount).every(b => b.purpose === 'revalidation' && b.stage_id === first.preview.stage_id && b.final)).toBe(true);
        selected[0]!.version = 5;
        await expect(bridge.create('notebook', request)).rejects.toThrow('SCOPE_STALE');
        expect(commits).toHaveLength(1);
        const empty = await bridge.preview('notebook', options, { ...pane, getSelectedItems: () => [] });
        expect(synced.at(-1)).toEqual({ items: [], purpose: 'selection', stage_id: null, final: true });
        expect(empty.preview.selection.selectors).toEqual([]);
        const containers = await bridge.preview('notebook', { ...options, include_selected_containers: true }, f.pane);
        expect(containers.preview.selection.selectors?.map(s => s.kind)).toEqual(['collection', 'collection', 'item', 'item']);
        const itemsOnly = await bridge.preview('notebook', options, null);
        expect(itemsOnly.preview.selection.selectors?.map(s => s.kind)).toEqual(['item', 'item']);
        failAt = synced.length + 2;
        const previewCount = previews.length;
        await expect(bridge.preview('notebook', options, pane)).rejects.toThrow('BATCH_INTERRUPTED');
        expect(previews).toHaveLength(previewCount);
        await expect(bridge.create('notebook', { preview_id: itemsOnly.preview.id, expected_revision: revision, idempotency_key: 'interrupted' })).rejects.toThrow('SCOPE_STALE');
        expect(commits).toHaveLength(1);
    } finally { bridge.shutdown(); }
});
