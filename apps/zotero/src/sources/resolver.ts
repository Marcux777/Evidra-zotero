import type { NativeSourceAPI, NativeSourceItem, NativeSourcePane } from '../bridge/native-types';
import type { SelectionSpec, Selector, SourceContent, SourceIdentity, SourceInput } from '../bridge/types';

export interface UnavailableSource { identity: SourceIdentity; reason: 'archived' | 'missing' | 'library_missing' | 'deleted' | 'content_excluded' }
export interface NativeSelection { items: SourceInput[]; unavailable: UnavailableSource[]; observed: Map<number, SourceIdentity> }
export const identityKey = (id: SourceIdentity) => JSON.stringify([id.profile_instance_id, id.library_id, id.item_key]);

export function captureSelectors(pane: NativeSourcePane, includeContainers = false): Selector[] {
    const items: Selector[] = pane.getSelectedItems().map(i => ({ kind: 'item', library_id: i.libraryID, key: i.key }));
    // Navigation rows remain selected while users highlight individual items.
    if (!includeContainers) return [...new Map(items.map(s => [JSON.stringify(s), s])).values()];
    const libraryRows = new Set(pane.getCollectionTreeRows().filter(row => row.isLibrary(true)).map(row => row.ref.libraryID));
    const selected: Selector[] = [
        ...pane.getSelectedLibraryIDs().filter(id => libraryRows.has(id)).map(library_id => ({ kind: 'library' as const, library_id, key: null })),
        ...pane.getSelectedCollections().map(c => ({ kind: 'collection' as const, library_id: c.libraryID, key: c.key })),
        ...pane.getSelectedSavedSearches().map(s => ({ kind: 'search' as const, library_id: s.libraryID, key: s.key })),
        ...items
    ];
    return [...new Map(selected.map(s => [JSON.stringify(s), s])).values()];
}

export function libraryAvailability(api: NativeSourceAPI, library: number): 'library_missing' | 'archived' | null {
    if (!api.Libraries.exists(library)) return 'library_missing';
    const value = api.Libraries.get(library);
    // editable/filesEditable govern writes. Available read-only group content is authorized.
    if (value.archived) return 'archived';
    if (!['user', 'group'].includes(value.libraryType)) throw new Error('UNSUPPORTED_SOURCE_LIBRARY');
    return null;
}

export async function resolveSelection(api: NativeSourceAPI, profile: string, spec: SelectionSpec): Promise<NativeSelection> {
    const resolved = new Map<string, { parent: NativeSourceItem; all: boolean; selected: Map<string, NativeSourceItem> }>();
    const unavailable = new Map<string, UnavailableSource>();
    const observed = new Map<number, SourceIdentity>();
    const identity = (i: NativeSourceItem): SourceIdentity => ({ profile_instance_id: profile, library_id: i.libraryID, item_key: i.key });
    const reject = (id: SourceIdentity, reason: UnavailableSource['reason']) => unavailable.set(identityKey(id), { identity: id, reason });
    async function add(item: NativeSourceItem) {
        let parent = item;
        const visited = new Set<number>();
        while (parent.parentID) {
            if (visited.has(parent.id)) throw new Error('INVALID_SOURCE_PARENT');
            visited.add(parent.id);
            const next = await api.Items.getAsync(parent.parentID);
            if (!next) { reject(identity(parent), 'missing'); return; }
            if (next.libraryID !== item.libraryID) throw new Error('INVALID_SOURCE_PARENT');
            parent = next;
        }
        const reason = libraryAvailability(api, parent.libraryID);
        if (reason || parent.deleted || item.deleted) { reject(identity(parent), reason ?? 'deleted'); return; }
        if (parent.isAnnotation()) throw new Error('INVALID_SOURCE_PARENT');
        if (!parent.isRegularItem() && !parent.isAttachment() && !parent.isNote()) throw new Error('UNSUPPORTED_SOURCE_TYPE');
        const key = identityKey(identity(parent));
        observed.set(parent.id, identity(parent));
        observed.set(item.id, identity(parent));
        const entry = resolved.get(key) ?? { parent, all: false, selected: new Map() };
        entry.all ||= item.isRegularItem();
        if (!item.isRegularItem()) entry.selected.set(item.key, item);
        resolved.set(key, entry);
    }
    for (const selector of spec.selectors ?? []) {
        const reason = libraryAvailability(api, selector.library_id);
        if (reason) {
            if (selector.kind === 'item' && selector.key) reject({ profile_instance_id: profile, library_id: selector.library_id, item_key: selector.key }, reason);
            else throw new Error('SELECTOR_UNAVAILABLE');
            continue;
        }
        if (selector.kind === 'item') {
            if (!selector.key) throw new Error('INVALID_SELECTOR');
            const item = await api.Items.getByLibraryAndKeyAsync(selector.library_id, selector.key);
            if (item) await add(item);
            else reject({ profile_instance_id: profile, library_id: selector.library_id, item_key: selector.key }, 'missing');
            continue;
        }
        let ids: number[];
        if (selector.kind === 'library') {
            const search = new api.Search();
            search.libraryID = selector.library_id;
            search.addCondition('noChildren', 'true');
            ids = await search.search();
        } else if (selector.kind === 'collection') {
            if (!selector.key) throw new Error('INVALID_SELECTOR');
            const collection = await api.Collections.getByLibraryAndKeyAsync(selector.library_id, selector.key);
            if (!collection || collection.deleted) throw new Error('SELECTOR_UNAVAILABLE');
            await collection.loadAllData();
            ids = spec.include_descendants ? collection.getDescendents(false, 'item', false).map(i => i.id) : collection.getChildItems(true, false);
        } else {
            if (!selector.key) throw new Error('INVALID_SELECTOR');
            const search = await api.Searches.getByLibraryAndKeyAsync(selector.library_id, selector.key);
            if (!search) throw new Error('SELECTOR_UNAVAILABLE');
            await search.loadAllData();
            ids = await search.search();
        }
        for (const id of new Set(ids)) {
            const item = await api.Items.getAsync(id);
            if (!item) throw new Error('SELECTION_CHANGED');
            if (item.libraryID !== selector.library_id) throw new Error('INVALID_SELECTOR_RESULT');
            await add(item);
        }
    }
    const items: SourceInput[] = [];
    for (const entry of resolved.values()) {
        const { parent } = entry;
        if (parent.isNote() && !spec.include_notes) { reject(identity(parent), 'content_excluded'); continue; }
        await parent.loadAllData();
        const reason = libraryAvailability(api, parent.libraryID);
        if (reason || parent.deleted) { reject(identity(parent), reason ?? 'deleted'); continue; }
        if (parent.getTags().some(t => t.tag === 'evidra:ai')) { reject(identity(parent), 'content_excluded'); continue; }
        const contents = new Map<string, SourceContent>();
        const addContent = async (item: NativeSourceItem) => {
            observed.set(item.id, identity(parent));
            if (item.deleted) return;
            if (item.isNote() && !spec.include_notes || item.isAnnotation() && !spec.include_annotations) return;
            await item.loadAllData();
            if (item.getTags().some(t => t.tag === 'evidra:ai')) return;
            let kind: SourceContent['kind'];
            if (item.isNote()) {
                const generated = /data-evidra-origin\s*=\s*["']ai["']/i.test(item.getNote());
                if (generated) return;
                kind = 'human_note';
            } else if (item.isAnnotation()) kind = 'human_annotation';
            else if (item.isPDFAttachment()) kind = 'pdf';
            else if (item.isFileAttachment() && /^(text\/|application\/(epub\+zip|xhtml\+xml))/.test(item.attachmentContentType)) kind = 'text_attachment';
            else return;
            contents.set(item.key, { key: item.key, kind, role: 'unassigned', title: String(item.getField('title')), version: `${item.version}:${item.getField('dateModified')}` });
            if (entry.all && spec.include_annotations && item.isFileAttachment()) {
                for (const annotation of item.getAnnotations(false)) await addContent(annotation);
            }
        };
        if (entry.all) {
            if (parent.getField('abstractNote')) contents.set(parent.key, { key: parent.key, kind: 'abstract', role: 'unassigned', title: '', version: `${parent.version}:${parent.getField('dateModified')}` });
            const ids = [...parent.getAttachments(false), ...(spec.include_notes ? parent.getNotes(false) : [])];
            for (const id of ids) {
                const child = await api.Items.getAsync(id);
                if (!child) throw new Error('SELECTION_CHANGED');
                await addContent(child);
            }
        } else for (const child of entry.selected.values()) await addContent(child);
        if (!parent.isRegularItem() && !contents.size) { reject(identity(parent), 'content_excluded'); continue; }
        const library = api.Libraries.get(parent.libraryID);
        const match = String(parent.getField('date', true)).match(/(?:^|\D)(\d{4})(?:\D|$)/);
        items.push({ identity: identity(parent), version: `${parent.version}:${parent.getField('dateModified')}`, title: String(parent.getField('title')),
            year: match && Number(match[1]) > 0 ? Number(match[1]) : null, item_type: api.ItemTypes.getName(parent.itemTypeID), tags: parent.getTags().map(t => t.tag),
            doi: String(parent.getField('DOI')) || null, remote_library_id: library.libraryTypeID == null ? null : String(library.libraryTypeID),
            remote_group_id: library.libraryType === 'group' ? library.groupID ?? null : null, contents: [...contents.values()] });
    }
    return { items, unavailable: [...unavailable.values()], observed };
}
