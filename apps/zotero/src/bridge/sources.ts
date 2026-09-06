import { captureSelectors, identityKey, resolveSelection } from '../sources/resolver';
import type { NativeSelection, UnavailableSource } from '../sources/resolver';
import type { NativeSourcePane, NativeZotero } from './native-types';
import type { IdentityPage, SelectionPreview, SelectionSpec, Snapshot, SnapshotCreate, SnapshotPage, SnapshotSourcePage, SourceIdentity, SourceInput, SourcePage, SourceSync } from './types';

interface SourceTransport {
    request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown>;
    stop(): Promise<void>;
}
export interface SourcePreviewResult { preview: SelectionPreview; unavailable: UnavailableSource[] }
export interface SourceState { revision: number }

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
    #previews = new Map<string, { notebook: string; stageId: string; spec: SelectionSpec; native: string; epoch: number }>();
    #selection = new Map<string, SelectionSpec>();
    #active = true;

    constructor(api: NativeZotero, engine: SourceTransport, profile: string, report: (error: unknown) => void) {
        this.#api = api; this.#engine = engine; this.#profile = profile; this.#report = report;
        this.#observer = api.Notifier.registerObserver({ notify: (event, type, ids) => this.#notify(event, type, ids) },
            ['item', 'collection', 'collection-item', 'search', 'group'], 'evidra-sources');
        if (!this.#observer) throw new Error('SOURCE_NOTIFIER_UNAVAILABLE');
    }
    state(): SourceState { return { revision: this.#epoch }; }
    shutdown() { this.#active = false; ++this.#epoch; this.#api.Notifier.unregisterObserver(this.#observer); this.#previews.clear(); }
    async #notify(event: string, type: string, ids: (string | number)[]) {
        if (!this.#active) return;
        const unknownItem = type === 'item' && ids.some(id => !this.#observed.has(Number(id)));
        const affected = type === 'item' && !unknownItem
            ? [...new Map(ids.flatMap(id => { const identity = this.#observed.get(Number(id)); return identity ? [[identityKey(identity), identity] as const] : []; })).values()]
            : [...this.#known.values()];
        // A new item may change a selected library/search. Invalidate only known
        // sources and the local preview; do not read the unknown item's metadata.
        if (!ids.length && type === 'item') return;
        ++this.#epoch; this.#previews.clear();
        const reason = type === 'item' && ['delete', 'trash'].includes(event) ? 'deleted' : 'changed';
        this.#barrier = this.#barrier.then(async () => {
            try {
                for (let offset = 0; offset < affected.length; offset += 100)
                    await this.#engine.request('POST', '/v1/sources/invalidate', { identities: affected.slice(offset, offset + 100), reason });
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
        for (const source of native.items) this.#known.set(identityKey(source.identity), source.identity);
        for (const source of native.unavailable) this.#known.set(identityKey(source.identity), source.identity);
    }
    async #sync(notebook: string, native: NativeSelection, epoch: number,
        purpose: SourceSync['purpose'], stageId: string | null): Promise<string | null> {
        this.#assertEpoch(epoch); this.#remember(native);
        if (native.items.length > 10000) throw new Error('SELECTION_TOO_LARGE');
        for (const reason of ['missing', 'library_missing', 'deleted', 'archived', 'content_excluded'] as const) {
            const identities = native.unavailable.filter(s => s.reason === reason).map(s => s.identity);
            for (let i = 0; i < identities.length; i += 100) {
                this.#assertEpoch(epoch);
                await this.#engine.request('POST', '/v1/sources/invalidate', { identities: identities.slice(i, i + 100), reason: reason === 'content_excluded' ? 'changed' : reason });
            }
        }
        const batches: SourceInput[][] = [];
        let batch: SourceInput[] = [];
        // Reserve the schema's maximum opaque-stage length before any batch write.
        const bytes = (items: SourceInput[]) => new TextEncoder().encode(JSON.stringify({ items, purpose, stage_id: '0'.repeat(200), final: false })).length;
        for (const source of native.items) {
            if (bytes([source]) > 65536) throw new Error('SOURCE_METADATA_TOO_LARGE');
            if (batch.length === 100 || bytes([...batch, source]) > 65536) { batches.push(batch); batch = []; }
            batch.push(source);
        }
        if (batch.length || purpose === 'selection') batches.push(batch);
        for (let index = 0; index < batches.length; ++index) {
            this.#assertEpoch(epoch);
            const request: SourceSync = { items: batches[index]!, purpose, stage_id: stageId,
                final: purpose === 'revalidation' || index === batches.length - 1 };
            const page = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/sync`, request) as SourcePage;
            this.#assertEpoch(epoch);
            if (!page || typeof page !== 'object') throw new Error('INVALID_SOURCE_SYNC_RECEIPT');
            if (purpose === 'selection') {
                if (typeof page.stage_id !== 'string' || !page.stage_id.length || page.stage_id.length > 200
                    || stageId !== null && page.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
                stageId = page.stage_id;
            } else if (page.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
        }
        return stageId;
    }
    async history(notebook: string, offset: number): Promise<SnapshotPage> {
        return this.#run(async () => await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots?offset=${offset}&limit=50`) as SnapshotPage);
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
            const preview = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/preview`, { stage_id: stageId, selection: spec }) as SelectionPreview;
            this.#assertEpoch(epoch);
            if (preview.stage_id !== stageId) throw new Error('INVALID_SELECTION_STAGE_RECEIPT');
            this.#selection.set(notebook, spec);
            this.#previews.clear();
            this.#previews.set(preview.id, { notebook, stageId, spec, native: JSON.stringify({ items: native.items, unavailable: native.unavailable }), epoch });
            return { preview, unavailable: native.unavailable };
        });
    }
    async create(notebook: string, request: SnapshotCreate): Promise<Snapshot> {
        return this.#run(async epoch => {
            const preview = this.#previews.get(request.preview_id);
            if (!preview || preview.notebook !== notebook || preview.epoch !== epoch) throw new Error('SCOPE_STALE');
            const native = await resolveSelection(this.#api, this.#profile, preview.spec);
            await this.#sync(notebook, native, epoch, 'revalidation', preview.stageId);
            if (JSON.stringify({ items: native.items, unavailable: native.unavailable }) !== preview.native) throw new Error('SCOPE_STALE');
            this.#assertEpoch(epoch);
            return await this.#engine.request('POST', `/v1/notebooks/${notebook}/snapshots`, request) as Snapshot;
        });
    }
    async read(notebook: string, snapshot: string, offset: number): Promise<SnapshotSourcePage> {
        return this.#run(async epoch => {
            const selection = await this.#latestSelection(notebook);
            const identities: SourceIdentity[] = [];
            for (let start = 0; ; start += 100) {
                const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/identities?offset=${start}&limit=100`) as IdentityPage;
                identities.push(...page.items);
                if (start + page.items.length >= page.total) break;
                if (!page.items.length) throw new Error('INVALID_SOURCE_PAGE');
            }
            const native = await resolveSelection(this.#api, this.#profile, { ...selection,
                selectors: identities.map(id => {
                    if (id.profile_instance_id !== this.#profile) throw new Error('INVALID_SOURCE_PROFILE');
                    return { kind: 'item', library_id: id.library_id, key: id.item_key };
                }) });
            await this.#sync(notebook, native, epoch, 'revalidation', null);
            this.#assertEpoch(epoch);
            return await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/sources?offset=${offset}&limit=50`) as SnapshotSourcePage;
        });
    }
    async revoke(notebook: string, source: string, expectedRevision: number): Promise<unknown> {
        return this.#run(async () => {
            const result = await this.#engine.request('POST', `/v1/notebooks/${notebook}/sources/${source}/revoke`, { expected_revision: expectedRevision });
            this.#previews.clear();
            return result;
        });
    }
}
