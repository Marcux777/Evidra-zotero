import { webcrypto } from 'node:crypto';
import { expect, test } from 'vitest';
test('native projection filters before field reads, preserves genuine identities and never supplies original parents to translators', async () => {
    const { nativeBibliography } = await import('../src/bridge/bibliography');
    const sources: any[] = [1, 2].map(index => ({ id: String(index).repeat(64), identity: { profile_instance_id: 'profile', library_id: index, item_key: `STUDY00${index}` },
        version: '1:2026-09-01', title: `Study ${index}`, year: 2026, item_type: 'journalArticle', doi: `10.1/${index}`, contents: [] }));
    const reads: string[] = [], projected: any[] = [], seen: any[] = [];
    let option: any, translatorId: string | null = null;
    const originals = sources.map((source, index) => ({ id: index + 41, key: source.identity.item_key, libraryID: index + 1, version: 1, itemTypeID: 7, deleted: false,
        isRegularItem: () => true, getUsedFields: () => [1, 2, 3, 4], getCreators: () => [{ lastName: `Author ${index}`, creatorTypeID: 1, fieldMode: 0 }],
        getField: (field: string | number) => { const name = typeof field === 'number' ? ['unused', 'title', 'DOI', 'abstractNote', 'extra'][field]! : field; reads.push(name);
            if (['abstractNote', 'extra'].includes(name)) throw new Error('EXCLUDED_FIELD_READ');
            return name === 'dateModified' ? '2026-09-01' : name === 'title' ? source.title : name === 'DOI' ? source.doi : ''; },
        getNotes: () => { throw new Error('EXCLUDED_CHILD_READ'); }, getAttachments: () => { throw new Error('EXCLUDED_CHILD_READ'); },
        loadAllData: () => { throw new Error('UNBOUNDED_LOAD'); }, clone: () => { throw new Error('UNBOUNDED_CLONE'); },
    }));
    class Item {
        id = false; key = false; libraryID = 0; fields: Record<string, unknown> = {}; creators: unknown[] = [];
        constructor(public type: string) { projected.push(this); }
        setField(field: string | number, value: unknown) { this.fields[String(field)] = value; }
        setCreators(creators: unknown[]) { this.creators = creators; }
        getAttachments() { return []; } getNotes() { return []; }
    }
    class Translate {
        string = ''; items: any[] = []; handlers: Record<string, (...args: any[]) => void> = {};
        async getTranslators() { return [{ translatorID: '9cb70025-a888-4a29-a210-93ec52da40d4' }]; }
        setItems(items: any[]) { this.items = items; }
        setTranslator(id: string) { translatorId = id; }
        setDisplayOptions(value: unknown) { option = value; }
        setHandler(name: string, callback: (...args: any[]) => void) { this.handlers[name] = callback; }
        async translate() {
            for (const item of this.items) {
                expect(originals).not.toContain(item);
                const data = { title: item.fields['1'], itemID: false, key: false, uri: 'https://zotero.org/items/false', notes: item.getNotes(), attachments: item.getAttachments() };
                this.handlers.itemDone!(this, data); seen.push(data);
            }
            this.handlers.itemDone!(this, false);
            this.string = seen.map(item => item.title).join('\n');
        }
    }
    const api: any = { Item, Translate: { Export: Translate }, ItemFields: { getName: (id: number) => ['unused', 'title', 'DOI', 'abstractNote', 'extra'][id] },
        ItemTypes: { getName: () => 'journalArticle' }, URI: { getItemURI: (item: any) => `https://zotero.org/groups/${item.libraryID}/items/${item.key}` },
        Notifier: { registerObserver: () => 'bibliography-observer', unregisterObserver: () => {} },
        Libraries: { exists: () => true, get: (id: number) => ({ libraryID: id, libraryType: 'user', archived: false }) },
        Items: { getByLibraryAndKeyAsync: async (library: number, key: string) => originals.find(item => item.libraryID === library && item.key === key) } };
    const { SourceBridge } = await import('../src/bridge/sources');
    const bridge = new SourceBridge(api, { request: async () => { throw new Error('UNEXPECTED_RESEARCH_REQUEST'); }, stop: async () => {} }, 'profile', () => {});
    const access = async () => sources.map(source => ({ identity: source.identity, contents: [] }));
    const result = await bridge.withBibliography(access, sources,
        check => nativeBibliography(api, webcrypto as Crypto, 'profile', sources, 'bibtex', check));
    expect(reads).not.toContain('abstractNote'); expect(reads).not.toContain('extra');
    expect(projected).toHaveLength(2); expect(projected.every(item => item.id === false && item.key === false)).toBe(true);
    expect(seen.map(item => item.itemID)).toEqual([41, 42]);
    expect(seen.map(item => item.uri)).toEqual(['https://zotero.org/groups/1/items/STUDY001', 'https://zotero.org/groups/2/items/STUDY002']);
    expect(option).toMatchObject({ exportNotes: false, exportFileData: false });
    expect(translatorId).toBe('9cb70025-a888-4a29-a210-93ec52da40d4');
    expect(result.text).toBe('Study 1\nStudy 2');
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    await expect(nativeBibliography(api, webcrypto as Crypto, 'wrong-profile', sources, 'bibtex', () => {})).rejects.toThrow('SCOPE_DENIED');
    await expect(bridge.withBibliography(access, sources, async check => { originals[0]!.version++; check(); return {}; })).rejects.toThrow('SCOPE_STALE');
    bridge.shutdown();
});
