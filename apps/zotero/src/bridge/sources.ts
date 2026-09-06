import { captureSelectors, identityKey, libraryAvailability, resolveSelection, revalidateSelection } from '../sources/resolver';
import { serializeUiResponse } from '../security/messages';
import type { NativeSelection, UnavailableSource } from '../sources/resolver';
import type { NativeSourceItem, NativeSourcePane, NativeZotero } from './native-types';
import type { IdentityPage, JobAccessPage, PreviewPage, SelectionSpec, Snapshot, SnapshotCreate, SnapshotPage, SnapshotSourcePage, Source, SourceAccess, SourceIdentity, SourceInput, SourcePage, SourceSync } from './types';

export interface SourceTransport {
    request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown>;
    stop(): Promise<void>;
}
export interface SourcePreviewResult { preview: PreviewPage; unavailable: UnavailableSource[]; offset: number; limit: number; total: number; unavailable_total: number }
export interface SourceState { revision: number }
interface ReaderItemState { source: string; path: string; lastRead: number | null; processed: number | null }
type VerifyReaderFile = (item: NativeSourceItem, path: string, verify: () => Promise<unknown>) => Promise<void>;

/** Persisted attachment state, with timestamps compared separately below.
 * Neither changed:{} nor a stable Zotero version covers these attachment fields.
 * This uses only the already-authorized item and synchronous native getters.
 */
function readerItemState(api: NativeZotero, item: NativeSourceItem): ReaderItemState | null {
    if (!item.isPDFAttachment() || item.deleted || libraryAvailability(api, item.libraryID)) return null;
    const path = item.getFilePath();
    const timestamp = (value: unknown) => value === null || Number.isSafeInteger(value) && Number(value) >= 0;
    const { attachmentPath, attachmentLinkMode, attachmentContentType, attachmentCharset, attachmentSyncState,
        attachmentSyncedModificationTime, attachmentSyncedHash, attachmentLastRead, attachmentLastProcessedModificationTime } = item;
    if (!path || typeof attachmentPath !== 'string' || !Number.isSafeInteger(attachmentLinkMode)
        || typeof attachmentContentType !== 'string' || attachmentCharset !== null && typeof attachmentCharset !== 'string'
        || !Number.isSafeInteger(attachmentSyncState) || !timestamp(attachmentSyncedModificationTime)
        || attachmentSyncedHash !== null && typeof attachmentSyncedHash !== 'string'
        || !timestamp(attachmentLastRead) || !timestamp(attachmentLastProcessedModificationTime)) return null;
    const library = api.Libraries.get(item.libraryID);
    return { path, lastRead: attachmentLastRead, processed: attachmentLastProcessedModificationTime,
        source: JSON.stringify([item.id, item.key, item.libraryID, item.parentID, item.parentKey, item.itemTypeID,
            item.version, item.deleted, item.getField('dateModified'), item.getField('title'), item.getTags(),
            library.libraryID, library.libraryType, library.libraryTypeID, library.groupID ?? null,
            path, attachmentPath, attachmentLinkMode, attachmentContentType, attachmentCharset,
            attachmentSyncState, attachmentSyncedModificationTime, attachmentSyncedHash]) };
}

/** Native access must be checked before an engine content request, including after restart.
 * Serialized invalidation is a fail-closed barrier; failure stops this owned engine.
 */
export class SourceBridge {
    #api: NativeZotero;
    #engine: SourceTransport;
    #profile: string;
    #report: (error: unknown) => void;
    #observer: string;
    #epoch = 0;
    #barrier: Promise<void> = Promise.resolve();
    #operations: Promise<unknown> = Promise.resolve();
    #known = new Map<string, SourceIdentity>();
    #observed = new Map<number, SourceIdentity>();
    #readerItems = new Map<number, ReaderItemState>();
    #previews = new Map<string, { notebook: string; stageId: string; access: SourceAccess[]; native: string; unavailable: UnavailableSource[]; epoch: number }>();
    #selection = new Map<string, SelectionSpec>();
    #active = true;

    constructor(api: NativeZotero, engine: SourceTransport, profile: string, report: (error: unknown) => void) {
        this.#api = api; this.#engine = engine; this.#profile = profile; this.#report = report;
        this.#observer = api.Notifier.registerObserver({ notify: (event, type, ids, extraData) => this.#notify(event, type, ids, extraData) },
            ['item', 'collection', 'collection-item', 'search', 'group'], 'evidra-sources');
        if (!this.#observer) throw new Error('SOURCE_NOTIFIER_UNAVAILABLE');
    }
    state(): SourceState { return { revision: this.#epoch }; }
    shutdown() { this.#active = false; ++this.#epoch; this.#api.Notifier.unregisterObserver(this.#observer); this.#previews.clear(); this.#readerItems.clear(); }
    #readerBookkeeping(ids: (string | number)[], extraData: Record<string, unknown>): boolean {
        const unchanged = new Map<number, ReaderItemState>();
        const epoch = this.#epoch;
        for (const rawID of ids) {
            const id = Number(rawID), previous = this.#readerItems.get(id);
            const extra = extraData?.[String(rawID)] as { changed?: unknown } | undefined;
            if (!previous || !extra || Object.keys(extra).length !== 1 || !extra.changed
                || typeof extra.changed !== 'object' || Array.isArray(extra.changed) || Object.keys(extra.changed).length) return false;
            // get() never loads metadata. Unknown or unloaded items remain conservative.
            const item = this.#api.Items.get(id);
            const current = item && item.id === id ? readerItemState(this.#api, item) : null;
            if (!current || current.source !== previous.source || current.processed !== previous.processed
                || current.lastRead === null || current.lastRead === previous.lastRead) return false;
            unchanged.set(id, current);
        }
        if (epoch !== this.#epoch) return false;
        for (const [id, current] of unchanged) this.#readerItems.set(id, current);
        return true;
    }
    async #notify(event: string, type: string, ids: (string | number)[], extraData: Record<string, unknown> = {}) {
        if (!this.#active) return;
        if (!ids.length && type === 'item') return;
        let readbackError: unknown;
        if (event === 'modify' && type === 'item') {
            try { if (this.#readerBookkeeping(ids, extraData)) return; }
            catch (error) { readbackError = error; }
        }
        const unknownItem = type === 'item' && ids.some(id => !this.#observed.has(Number(id)));
        const affected = type === 'item' && !unknownItem
            ? [...new Map(ids.flatMap(id => { const identity = this.#observed.get(Number(id)); return identity ? [[identityKey(identity), identity] as const] : []; })).values()]
            : [...this.#known.values()];
        // A new item may change a selected library/search. Invalidate only known
        // sources and the local preview; do not read the unknown item's metadata.
        ++this.#epoch; this.#previews.clear();
        const reason = type === 'item' && ['delete', 'trash'].includes(event) ? 'deleted' : 'changed';
        const invalidation = this.#invalidate(affected, reason);
        if (readbackError) this.#report(readbackError);
        return invalidation;
    }
    #invalidate(identities: SourceIdentity[], reason: 'changed' | 'deleted' | 'missing' | 'library_missing' | 'archived'): Promise<void> {
        const affected = new Set(identities.map(identityKey));
        for (const id of this.#readerItems.keys()) {
            const identity = this.#observed.get(id);
            if (identity && affected.has(identityKey(identity))) this.#readerItems.delete(id);
        }
        this.#barrier = this.#barrier.then(async () => {
            try {
                for (let offset = 0; offset < identities.length; offset += 100)
                    await this.#engine.request('POST', '/v1/sources/invalidate', { identities: identities.slice(offset, offset + 100), reason });
            } catch (error) {
                this.#report(error);
                try { await this.#engine.stop(); }
                catch (stopError) { this.#report(stopError); throw new AggregateError([error, stopError], 'SOURCE_INVALIDATION_FAILED'); }
                throw error;
            }
        });
        return this.#barrier;
    }
    async #run<T>(action: (epoch: number) => Promise<T>): Promise<T> {
        const operation = this.#operations.then(async () => {
            if (!this.#active) throw new Error('SOURCE_BRIDGE_CLOSED');
            await this.#barrier;
            const epoch = this.#epoch;
            const result = await action(epoch);
            this.#assertEpoch(epoch);
            await this.#barrier;
            return result;
        });
        // A failed user operation is returned to its caller. It is not retried and does
        // not prevent a later independent user action; invalidation failures stay latched.
        this.#operations = operation.then(() => undefined, () => undefined);
        return operation;
    }
    #assertEpoch(epoch: number) { if (!this.#active || epoch !== this.#epoch) throw new Error('SCOPE_STALE'); }
    #remember(native: NativeSelection) {
        for (const [id, identity] of native.observed) this.#observed.set(id, identity);
        for (const [id, item] of native.readerItems) if (!this.#readerItems.has(id)) {
            const state = readerItemState(this.#api, item);
            if (state) this.#readerItems.set(id, state);
        }
        for (const source of native.items) this.#known.set(identityKey(source.identity), source.identity);
        for (const source of native.unavailable) this.#known.set(identityKey(source.identity), source.identity);
    }
    async #sync(notebook: string, native: NativeSelection, epoch: number,
        purpose: SourceSync['purpose'], stageId: string | null, snapshotId: string | null = null,
        synced: Source[] | null = null): Promise<string | null> {
        this.#assertEpoch(epoch); this.#remember(native);
        if (native.items.length > 10000) throw new Error('SELECTION_TOO_LARGE');
        for (const reason of ['missing', 'library_missing', 'deleted', 'archived', 'content_excluded'] as const) {
            const identities = native.unavailable.filter(s => s.reason === reason).map(s => s.identity);
            if (identities.length) {
                this.#assertEpoch(epoch);
                await this.#invalidate(identities, reason === 'content_excluded' ? 'changed' : reason);
            }
        }
        const batches: SourceInput[][] = [];
        let batch: SourceInput[] = [];
        // Reserve the schema's maximum opaque-stage length before any batch write.
        const bytes = (items: SourceInput[]) => new TextEncoder().encode(JSON.stringify({ items, purpose, stage_id: '0'.repeat(200), snapshot_id: '0'.repeat(200), final: false })).length;
        for (const source of native.items) {
            if (bytes([source]) > 65536) throw new Error('SOURCE_METADATA_TOO_LARGE');
            if (batch.length === 100 || bytes([...batch, source]) > 65536) { batches.push(batch); batch = []; }
            batch.push(source);
        }
        if (batch.length || purpose === 'selection') batches.push(batch);
        for (let index = 0; index < batches.length; ++index) {
            this.#assertEpoch(epoch);
            const request: SourceSync = { items: batches[index]!, purpose, stage_id: stageId,
                snapshot_id: snapshotId,
                final: purpose === 'revalidation' || index === batches.length - 1 };
            const page = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/sync`, request) as SourcePage;
            this.#assertEpoch(epoch);
            if (!page || typeof page !== 'object') throw new Error('INVALID_SOURCE_SYNC_RECEIPT');
            if (synced) {
                if (page.items.length !== batches[index]!.length || page.items.some((item, i) =>
                    identityKey(item.identity) !== identityKey(batches[index]![i]!.identity))) throw new Error('INVALID_SOURCE_SYNC_RECEIPT');
                synced.push(...page.items);
            }
            if (purpose === 'selection') {
                if (typeof page.stage_id !== 'string' || !page.stage_id.length || page.stage_id.length > 200
                    || stageId !== null && page.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
                stageId = page.stage_id;
            } else if (page.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
        }
        return stageId;
    }
    async history(notebook: string, offset: number): Promise<SnapshotPage> {
        return this.#run(async () => {
            const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots?offset=${offset}&limit=50`) as SnapshotPage;
            serializeUiResponse('0'.repeat(80), page, null);
            return page;
        });
    }
    async #latestSelection(notebook: string): Promise<SelectionSpec> {
        const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots?offset=0&limit=1`) as SnapshotPage;
        if (!page.items[0]) throw new Error('SNAPSHOT_NOT_FOUND');
        return page.items[0].selection;
    }
    async preview(notebook: string, options: SelectionSpec, pane: NativeSourcePane | null): Promise<SourcePreviewResult> {
        return this.#run(async epoch => {
            this.#previews.clear();
            const existing = this.#selection.get(notebook) ?? await this.#latestSelection(notebook);
            const spec = { ...options, selectors: pane ? captureSelectors(pane, options.include_selected_containers)
                : (existing.selectors ?? []).filter(s => s.kind === 'item' || options.include_selected_containers) };
            const native = await resolveSelection(this.#api, this.#profile, spec);
            const stageId = await this.#sync(notebook, native, epoch, 'selection', null);
            if (stageId === null) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
            const preview = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/preview`, { stage_id: stageId, selection: spec }) as PreviewPage;
            this.#assertEpoch(epoch);
            if (preview.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
            this.#selection.set(notebook, spec);
            this.#previews.clear();
            const access: SourceAccess[] = [...native.items.map(s => ({ identity: s.identity, contents: (s.contents ?? []).map(c => ({ key: c.key, kind: c.kind })) })), ...native.unavailable.map(s => ({ identity: s.identity, contents: [] }))];
            this.#previews.set(preview.id, { notebook, stageId, access, native: JSON.stringify({ items: native.items, unavailable: native.unavailable }), unavailable: native.unavailable, epoch });
            return this.#previewResult(preview, native.unavailable, 0);
        });
    }
    #previewResult(preview: PreviewPage, unavailable: UnavailableSource[], offset: number): SourcePreviewResult {
        const start = Math.max(0, offset - preview.total);
        const omitted = offset >= preview.total ? unavailable.slice(start, start + 50) : [];
        const result = { preview, unavailable: omitted, offset, limit: preview.limit + omitted.length,
            total: preview.total + unavailable.length, unavailable_total: unavailable.length };
        // Measure the exact serialized envelope, reserving the maximum admitted ID.
        serializeUiResponse('0'.repeat(80), result, null);
        return result;
    }
    async previewPage(notebook: string, id: string, offset: number): Promise<SourcePreviewResult> {
        return this.#run(async epoch => {
            const stored = this.#previews.get(id);
            if (!stored || stored.notebook !== notebook || stored.epoch !== epoch) throw new Error('SCOPE_STALE');
            // Even native-unavailable pages validate the live server stage/fingerprint.
            const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/sources/previews/${id}?offset=${offset}&limit=50`) as PreviewPage;
            if (page.id !== id || page.stage_id !== stored.stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
            return this.#previewResult(page, stored.unavailable, offset);
        });
    }
    async create(notebook: string, request: SnapshotCreate): Promise<Snapshot> {
        return this.#run(async epoch => {
            const preview = this.#previews.get(request.preview_id);
            if (!preview || preview.notebook !== notebook || preview.epoch !== epoch) throw new Error('SCOPE_STALE');
            const native = await revalidateSelection(this.#api, this.#profile, preview.access);
            await this.#sync(notebook, native, epoch, 'revalidation', preview.stageId);
            if (JSON.stringify({ items: native.items, unavailable: native.unavailable }) !== preview.native) throw new Error('SCOPE_STALE');
            this.#assertEpoch(epoch);
            return await this.#engine.request('POST', `/v1/notebooks/${notebook}/snapshots`, request) as Snapshot;
        });
    }
    async read(notebook: string, snapshot: string, offset: number): Promise<SnapshotSourcePage> {
        return this.#run(async epoch => {
            await this.#revalidate(notebook, snapshot, epoch);
            this.#assertEpoch(epoch);
            const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/sources?offset=${offset}&limit=50`) as SnapshotSourcePage;
            serializeUiResponse('0'.repeat(80), page, null);
            return page;
        });
    }
    async #revalidate(notebook: string, snapshot: string, epoch: number, synced: Source[] | null = null): Promise<void> {
        const access: SourceAccess[] = [];
        for (let start = 0; ;) {
            this.#assertEpoch(epoch);
            const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/identities?offset=${start}&limit=100`) as IdentityPage;
            access.push(...page.items);
            start += page.items.length;
            if (start >= page.total) break;
            if (!page.items.length) throw new Error('INVALID_SOURCE_PAGE');
        }
        const native = await revalidateSelection(this.#api, this.#profile, access);
        await this.#sync(notebook, native, epoch, 'revalidation', null, snapshot, synced);
        this.#assertEpoch(epoch);
    }
    /** Internal continuation for DocumentBridge only; no renderer callback, URL or file capability. */
    async withRunDocuments<T>(notebook: string, snapshot: string, run: string,
        action: (sources: Source[], check: () => void, verifyReaderFile: VerifyReaderFile, documents?: Set<string>) => Promise<T>): Promise<T> {
        return this.#run(async epoch => {
            const access = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/runs/${run}/access`) as { items: SourceAccess[]; documents: [string, string][] };
            this.#assertEpoch(epoch);
            // Complete authorized source contents preserve Task4 subset-sync revocation semantics.
            // Only server-owned run dependencies are subsequently registered as PDFs.
            const native = await revalidateSelection(this.#api, this.#profile, access.items);
            const synced: Source[] = [];
            await this.#sync(notebook, native, epoch, 'revalidation', null, snapshot, synced);
            const result = await action(synced, () => this.#assertEpoch(epoch),
                (item, path, verify) => this.#verifyReaderFile(item, path, epoch, verify),
                new Set(access.documents.map(([source, key]) => `${source}:${key}`)));
            serializeUiResponse('0'.repeat(80), result, null);
            return result;
        });
    }

    /** Internal continuation for DocumentBridge only; no renderer callback, URL or file capability. */
    async withJobDocuments<T>(notebook: string, snapshot: string, job: string,
        action: (sources: Source[], check: () => void, verifyReaderFile: VerifyReaderFile, documents?: Set<string>) => Promise<T>): Promise<T> {
        return this.#run(async epoch => {
            const items: SourceAccess[] = [], documents = new Set<string>();
            for (let offset = 0; ;) {
                this.#assertEpoch(epoch);
                const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/jobs/${job}/access?offset=${offset}&limit=50`) as JobAccessPage;
                if (page.offset !== offset || page.limit !== page.items.length || page.items.length > 50) throw new Error('INVALID_SOURCE_PAGE');
                items.push(...page.items);
                for (const [source, key] of page.documents) documents.add(`${source}:${key}`);
                offset += page.items.length;
                if (offset >= page.total) break;
                if (!page.items.length) throw new Error('INVALID_SOURCE_PAGE');
            }
            this.#assertEpoch(epoch);
            const native = await revalidateSelection(this.#api, this.#profile, items);
            const synced: Source[] = [];
            await this.#sync(notebook, native, epoch, 'revalidation', null, snapshot, synced);
            const result = await action(synced, () => this.#assertEpoch(epoch),
                (item, path, verify) => this.#verifyReaderFile(item, path, epoch, verify), documents);
            serializeUiResponse('0'.repeat(80), result, null);
            return result;
        });
    }

    /** Internal continuation for DocumentBridge only; no renderer callback, URL or file capability. */
    async withDocuments<T>(notebook: string, snapshot: string,
        action: (sources: Source[], check: () => void, verifyReaderFile: VerifyReaderFile) => Promise<T>): Promise<T> {
        return this.#run(async epoch => {
            const synced: Source[] = [];
            await this.#revalidate(notebook, snapshot, epoch, synced);
            const result = await action(synced, () => this.#assertEpoch(epoch),
                (item, path, verify) => this.#verifyReaderFile(item, path, epoch, verify));
            serializeUiResponse('0'.repeat(80), result, null);
            return result;
        });
    }
    /** A native annotation-import timestamp may be acknowledged only across the
     * existing immutable-file verification. Rotation/deletion use the same timestamp.
     * No other prior observation is refreshed, and no notification is delayed.
     */
    async #verifyReaderFile(item: NativeSourceItem, path: string, epoch: number, verify: () => Promise<unknown>) {
        try {
            this.#assertEpoch(epoch);
            const previous = this.#readerItems.get(item.id);
            const before = readerItemState(this.#api, item);
            if (!previous || !before || before.path !== path || before.source !== previous.source
                || this.#api.Items.get(item.id) !== item) throw new Error('SCOPE_STALE');
            await verify();
            this.#assertEpoch(epoch);
            const after = readerItemState(this.#api, item);
            if (!after || before.source !== after.source || before.processed !== after.processed
                || this.#api.Items.get(item.id) !== item) throw new Error('SCOPE_STALE');
            previous.processed = after.processed;
        } catch (error) {
            if (this.#active && epoch === this.#epoch) {
                try { await this.#notify('modify', 'item', [item.id]); }
                catch (invalidationError) { throw new AggregateError([error, invalidationError], 'SOURCE_INVALIDATION_FAILED'); }
            }
            throw error;
        }
    }
    async revoke(notebook: string, source: string, expectedRevision: number): Promise<unknown> {
        return this.#run(async () => {
            const result = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/${source}/revoke`, { expected_revision: expectedRevision });
            this.#previews.clear();
            return result;
        });
    }
}
