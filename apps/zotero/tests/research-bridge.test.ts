import { createHash, webcrypto } from 'node:crypto';
import { expect, test } from 'vitest';
import { SourceBridge } from '../src/bridge/sources';
import { DocumentBridge } from '../src/bridge/documents';
import { NoteBridge } from '../src/bridge/notes';
import { parseUiMessage } from '../src/security/messages';

const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
const identity = { profile_instance_id: 'p1', library_id: 1, item_key: 'PARENT01' };
const uuid = '12345678-1234-4234-8234-123456789abc';

function fixture() {
    const parent: any = { id: 1, key: identity.item_key, libraryID: 1, parentID: false, parentKey: false,
        version: 1, deleted: false, itemTypeID: 1, loadAllData: async () => {},
        getField: (name: string) => name === 'title' ? 'Scoped study' : name === 'dateModified' ? 'stamp' : '',
        getTags: () => [], isRegularItem: () => true, isAttachment: () => false, isNote: () => false, isAnnotation: () => false,
        getAttachments: () => { throw new Error('UNAUTHORIZED_SIBLING_SCAN'); }, getNotes: () => { throw new Error('UNAUTHORIZED_NOTE_SCAN'); } };
    const library = { libraryID: 1, libraryType: 'user', libraryTypeID: null, editable: true, filesEditable: true, archived: false };
    const html = `<div class="zotero-note znv1"><div data-evidra-origin="ai" data-evidra-outbox="${uuid}"><p>Approved immutable content</p></div></div>`;
    const intent: any = { id: 'b'.repeat(32), uuid, state: 'APPROVED', source_id: 'c'.repeat(64), destination: identity,
        html, html_sha256: createHash('sha256').update(html).digest('hex'), note_key: null };
    const items = new Map<number, any>([[1, parent]]), reads: (string | number)[] = [], requests: string[] = [], searches: any[][] = [];
    let observer: any, saves = 0, ackLost = false, beginLost = false, denyAfterSave = false;
    const errors: unknown[] = [];
    const api: any = {
        Libraries: { exists: () => true, get: () => library }, ItemTypes: { getName: () => 'journalArticle' },
        Items: { get: (id: number) => items.get(id) ?? false, getAsync: async (id: number) => { reads.push(id); return items.get(id) ?? false; },
            getByLibraryAndKeyAsync: async (libraryID: number, key: string) => { reads.push(key); return [...items.values()].find(i => i.libraryID === libraryID && i.key === key) ?? false; } },
        Notifier: { registerObserver: (value: any) => { observer = value; return 'notes'; }, unregisterObserver() {} },
        Search: class {
            libraryID = 0; conditions: any[][] = [];
            addCondition(...values: any[]) { this.conditions.push(values); }
            async search() {
                expect(this.libraryID).toBe(1); expect(this.conditions).toContainEqual(['itemType', 'is', 'note']);
                expect(this.conditions).toContainEqual(['includeDeleted', 'true']); searches.push(this.conditions);
                const [field, operator, value] = this.conditions[2]!;
                expect(['tag', 'note']).toContain(field);
                return [...items.values()].filter(i => i.isNote() && i.libraryID === this.libraryID
                    && (field === 'tag' ? operator === 'is' && i.getTags().some((t: any) => t.tag === value) : i.getNote().includes(value))).map(i => i.id);
            }
        },
        Item: class {
            id = 0; key = ''; libraryID = 0; parentKey = ''; deleted = false; html = ''; tags: { tag: string }[] = [];
            constructor(type: string) { expect(type).toBe('note'); }
            setNote(value: string) { this.html = value; }
            addTag(tag: string) { this.tags.push({ tag }); }
            getNote() { return this.html; } getTags() { return this.tags; } isNote() { return true; }
            async loadAllData() {}
            async saveTx() {
                if (!library.editable) throw new Error('NATIVE_LIBRARY_READ_ONLY');
                this.id = 10 + ++saves; this.key = `NOTE000${saves}`; items.set(this.id, this);
                if (denyAfterSave) library.editable = false;
                await observer.notify('add', 'item', [this.id], {});
                return this.id;
            }
        },
    };
    const engine: any = { stop: async () => {}, request: async (_method: string, path: string, body?: any) => {
        requests.push(path);
        if (path.includes('/identities?')) return { items: [{ identity, contents: [] }], offset: 0, limit: 100, total: 1 };
        if (path.endsWith('/sources/sync')) return { items: body.items.map((item: any) => ({ ...item, id: intent.source_id, version_id: 'v', year_state: 'missing' })),
            offset: 0, limit: 1, total: 1, stage_id: null };
        if (path === '/v1/sources/invalidate') return { invalidated_count: 1 };
        if (path.endsWith('/begin')) {
            const create = intent.state === 'APPROVED'; intent.state = 'APPLYING';
            if (beginLost) { beginLost = false; throw new Error('RESPONSE_LOST'); }
            return { intent: { ...intent }, may_create: create };
        }
        if (path.endsWith('/ack')) {
            expect(body).toMatchObject({ uuid, library_id: 1, parent_key: identity.item_key, html_sha256: intent.html_sha256, origin: 'ai', tag: 'evidra:ai' });
            expect(items.size).toBeGreaterThan(1);
            intent.state = 'COMPLETE'; intent.note_key = body.note_key;
            if (ackLost) { ackLost = false; throw new Error('RESPONSE_LOST'); }
            return { ...intent };
        }
        if (path.endsWith('/' + intent.id)) return { ...intent };
        throw new Error('UNEXPECTED_ROUTE ' + path);
    } };
    const sources = new SourceBridge(api, engine, 'p1', e => errors.push(e));
    const documents = new DocumentBridge(api, sources, engine, webcrypto as unknown as Crypto, v => v);
    const createBridge = () => new NoteBridge(api, sources, engine, webcrypto as unknown as Crypto, documents);
    const command: any = parseUiMessage({ op: 'research.notes.publish', ...scope, intent_id: intent.id, request: { idempotency_key: 'publish' } });
    return { api, parent, library, intent, items, reads, searches, requests, errors, sources, createBridge, command,
        saves: () => saves, loseAck: () => { ackLost = true; }, loseBegin: () => { beginLost = true; }, denyAfterSave: () => { denyAfterSave = true; } };
}

test('native outbox reconciles a lost acknowledgement after successful save and source invalidation without a duplicate', async () => {
    const f = fixture(); f.loseAck();
    try {
        await expect(f.createBridge().publish(f.command)).rejects.toThrow('RESPONSE_LOST');
        expect(f.saves()).toBe(1); expect(f.requests).toContain('/v1/sources/invalidate');
        const result = await f.createBridge().publish(f.command);
        expect(result).toMatchObject({ state: 'COMPLETE', note_key: 'NOTE0001' });
        expect(f.saves()).toBe(1); expect(f.parent.getTags()).toEqual([]); expect(f.errors).toEqual([]);
        expect(f.items.get(11).getTags()).toContainEqual({ tag: 'evidra:ai' });
        expect(f.items.get(11).getNote()).toContain('data-evidra-origin="ai"');
    } finally { f.sources.shutdown(); }
});

test('lost creation admission and changed permissions cannot cause speculative creation or success acknowledgement', async () => {
    const f = fixture();
    try {
        f.library.editable = false;
        await expect(f.createBridge().publish(f.command)).rejects.toThrow('LIBRARY_NOT_EDITABLE');
        expect(f.requests.some(p => p.endsWith('/begin'))).toBe(false);
        f.library.editable = true; f.loseBegin();
        await expect(f.createBridge().publish(f.command)).rejects.toThrow('RESPONSE_LOST');
        await expect(f.createBridge().publish(f.command)).rejects.toThrow('OUTBOX_UNCERTAIN');
        expect(f.saves()).toBe(0);
    } finally { f.sources.shutdown(); }
    const changed = fixture(); changed.denyAfterSave();
    try {
        await expect(changed.createBridge().publish(changed.command)).rejects.toThrow('LIBRARY_NOT_EDITABLE');
        expect(changed.saves()).toBe(1); expect(changed.requests.some(p => p.endsWith('/ack'))).toBe(false);
    } finally { changed.sources.shutdown(); }
});

test('trashed, edited or ambiguous UUID matches fail closed, and two windows share the single publication queue', async () => {
    const f = fixture();
    try {
        const bridge = f.createBridge();
        await Promise.all([bridge.publish(f.command), bridge.publish(f.command)]);
        expect(f.saves()).toBe(1);
        const note = f.items.get(11); note.deleted = true;
        await expect(bridge.publish(f.command)).rejects.toThrow('OUTBOX_NOTE_CHANGED');
        note.deleted = false; const html = note.html; note.html += '<p>User edit</p>';
        await expect(bridge.publish(f.command)).rejects.toThrow('OUTBOX_NOTE_CHANGED');
        note.html = html;
        const clone = Object.assign(Object.create(Object.getPrototypeOf(note)), note, { id: 12, key: 'NOTE0002' }); f.items.set(12, clone);
        await expect(bridge.publish(f.command)).rejects.toThrow('OUTBOX_AMBIGUOUS');
        expect(f.saves()).toBe(1);
        expect(() => parseUiMessage({ op: 'research.notes.ack', ...scope, intent_id: f.intent.id, request: {} })).toThrow('INVALID_UI_MESSAGE');
        expect(() => parseUiMessage({ ...f.command, html: '<p>Injected</p>' })).toThrow('INVALID_UI_MESSAGE');
    } finally { f.sources.shutdown(); }
});
