import { DocumentBridge } from './documents';
import type { NativeSourceItem, NativeZotero } from './native-types';
import type { SourceBridge, SourceTransport } from './sources';
import type { ApprovedWriteOutbox, OutboxBegin, ResearchCommand, Source } from './types';
import { identityKey } from '../sources/resolver';

type Publish = Extract<ResearchCommand, { op: 'research.notes.publish' }>;

/** Shared across windows. Only approved server intents can become new native notes. */
export class NoteBridge {
    #pending: Promise<unknown> = Promise.resolve();
    constructor(private api: NativeZotero, private sources: SourceBridge, private engine: SourceTransport,
        private crypto: Crypto, private documents: DocumentBridge) {}

    publish(command: Publish): Promise<ApprovedWriteOutbox> {
        const next = this.#pending.then(() => this.#publish(command));
        this.#pending = next.then(() => undefined, () => undefined);
        return next;
    }

    async #parent(intent: ApprovedWriteOutbox, sources: Source[], check: () => void) {
        check();
        if (!sources.some(source => source.id === intent.source_id && identityKey(source.identity) === identityKey(intent.destination)))
            throw new Error('SOURCE_REVOKED');
        const library = intent.destination.library_id;
        if (!this.api.Libraries.exists(library)) throw new Error('LIBRARY_NOT_EDITABLE');
        const current = this.api.Libraries.get(library);
        if (current.libraryID !== library || !['user', 'group'].includes(current.libraryType)
            || current.archived || current.editable !== true) throw new Error('LIBRARY_NOT_EDITABLE');
        const parent = await this.api.Items.getByLibraryAndKeyAsync(library, intent.destination.item_key);
        check();
        if (!parent || parent.deleted || !parent.isRegularItem() || parent.libraryID !== library
            || parent.key !== intent.destination.item_key) throw new Error('SOURCE_REVOKED');
        return parent;
    }

    async #reconcile(intent: ApprovedWriteOutbox, check: () => void): Promise<NativeSourceItem | null> {
        const candidates = new Set<number>();
        for (const [field, operator, value] of [['tag', 'is', `evidra:outbox:${intent.uuid}`], ['note', 'contains', intent.uuid]]) {
            check();
            const search = new this.api.Search(); search.libraryID = intent.destination.library_id;
            search.addCondition('itemType', 'is', 'note'); search.addCondition('includeDeleted', 'true');
            search.addCondition(field!, operator!, value!);
            const ids = await search.search(); check();
            if (ids.length > 100) throw new Error('OUTBOX_RECONCILIATION_LIMIT');
            for (const id of ids) candidates.add(id);
        }
        if (intent.note_key) {
            const saved = await this.api.Items.getByLibraryAndKeyAsync(intent.destination.library_id, intent.note_key); check();
            if (!saved) throw new Error('OUTBOX_NOTE_MISSING');
            candidates.add(saved.id);
        }
        const matches: NativeSourceItem[] = [];
        for (const id of candidates) {
            const item = await this.api.Items.getAsync(id); check();
            if (!item) throw new Error('OUTBOX_NOTE_MISSING');
            await item.loadAllData(); check();
            if (item.key === intent.note_key || item.getTags().some(tag => tag.tag === `evidra:outbox:${intent.uuid}`)
                || item.isNote() && item.getNote().includes(`data-evidra-outbox="${intent.uuid}"`)) matches.push(item);
        }
        if (matches.length > 1) throw new Error('OUTBOX_AMBIGUOUS');
        return matches[0] ?? null;
    }

    async #readback(intent: ApprovedWriteOutbox, note: NativeSourceItem, check: () => void) {
        check();
        if (!note.isNote() || note.deleted || note.libraryID !== intent.destination.library_id
            || note.parentKey !== intent.destination.item_key || !/^[A-Z0-9]{8}$/.test(note.key)) throw new Error('OUTBOX_NOTE_CHANGED');
        const html = note.getNote(), tags = note.getTags().map(tag => tag.tag);
        if (!html.includes('data-evidra-origin="ai"') || !html.includes(`data-evidra-outbox="${intent.uuid}"`)
            || !tags.includes('evidra:ai') || !tags.includes(`evidra:outbox:${intent.uuid}`)) throw new Error('OUTBOX_NOTE_CHANGED');
        const digest = Array.from(new Uint8Array(await this.crypto.subtle.digest('SHA-256', new TextEncoder().encode(html))),
            byte => byte.toString(16).padStart(2, '0')).join('');
        check();
        if (digest !== intent.html_sha256) throw new Error('OUTBOX_NOTE_CHANGED');
        return { uuid: intent.uuid, library_id: note.libraryID, parent_key: String(note.parentKey), note_key: note.key,
            html_sha256: digest, origin: 'ai', tag: 'evidra:ai' };
    }

    async #publish(command: Publish): Promise<ApprovedWriteOutbox> {
        const path = `/v1/notebooks/${command.notebook_id}/snapshots/${command.snapshot_id}/notes/outbox/${command.intent_id}`;
        const read = () => this.documents.dispatch({ ...command, op: 'research.notes.read' } as Extract<ResearchCommand, { op: 'research.notes.read' }>) as Promise<ApprovedWriteOutbox>;
        let intent = await read();
        let savedKey: string | null = null;
        try {
            await this.sources.withDocuments(command.notebook_id, command.snapshot_id, async (sources, check) => {
                await this.#parent(intent, sources, check);
                const existing = await this.#reconcile(intent, check);
                if (existing) { await this.#readback(intent, existing, check); return null; }
                if (intent.state === 'COMPLETE') throw new Error('OUTBOX_NOTE_MISSING');
                const begin = await this.engine.request('POST', path + '/begin', command.request) as OutboxBegin; check();
                intent = begin.intent;
                if (!begin.may_create) throw new Error('OUTBOX_UNCERTAIN');
                await this.#parent(intent, sources, check);
                // Check again after the remote admission, before the single native write.
                if (await this.#reconcile(intent, check)) throw new Error('OUTBOX_RECONCILE_REQUIRED');
                check();
                const note = new this.api.Item('note'); note.libraryID = intent.destination.library_id;
                note.parentKey = intent.destination.item_key;
                note.setNote(intent.html); note.addTag('evidra:ai'); note.addTag(`evidra:outbox:${intent.uuid}`);
                await note.saveTx();
                savedKey = note.key;
                return null;
            });
        } catch (error) {
            // A successful native creation invalidates the normal source epoch. Keep
            // that barrier intact and require an independent current revalidation.
            if (!savedKey || !(error instanceof Error) || error.message !== 'SCOPE_STALE') throw error;
        }
        intent = await read();
        return this.sources.withDocuments(command.notebook_id, command.snapshot_id, async (sources, check) => {
            await this.#parent(intent, sources, check);
            const note = await this.#reconcile(intent, check);
            if (!note || savedKey && savedKey !== note.key) throw new Error('OUTBOX_NOTE_MISSING');
            const receipt = await this.#readback(intent, note, check);
            const result = await this.engine.request('POST', path + '/ack', { ...receipt, ...command.request }); check();
            return result as ApprovedWriteOutbox;
        });
    }
}
