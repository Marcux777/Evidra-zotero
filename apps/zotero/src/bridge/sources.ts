import { captureSelectors, identityKey, resolveSelection, revalidateSelection } from '../sources/resolver';
import { serializeUiResponse } from '../security/messages';
import type { NativeSelection, UnavailableSource } from '../sources/resolver';
import type { NativeSourcePane, NativeZotero } from './native-types';
import type { IdentityPage, PreviewPage, SelectionSpec, Snapshot, SnapshotCreate, SnapshotPage, SnapshotSourcePage, SourceAccess, SourceIdentity, SourceInput, SourcePage, SourceSync } from './types';

interface SourceTransport {
    request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown>;
    stop(): Promise<void>;
}
export interface SourcePreviewResult { preview: PreviewPage; unavailable: UnavailableSource[]; offset: number; limit: number; total: number; unavailable_total: number }
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
    #previews = new Map<string, { notebook: string; stageId: string; access: SourceAccess[]; native: string; unavailable: UnavailableSource[]; epoch: number }>();
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
        return this.#invalidate(affected, reason);
    }
    #invalidate(identities: SourceIdentity[], reason: 'changed' | 'deleted' | 'missing' | 'library_missing' | 'archived'): Promise<void> {
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
        for (const source of native.items) this.#known.set(identityKey(source.identity), source.identity);
        for (const source of native.unavailable) this.#known.set(identityKey(source.identity), source.identity);
    }
    async #sync(notebook: string, native: NativeSelection, epoch: number,
        purpose: SourceSync['purpose'], stageId: string | null, snapshotId: string | null = null): Promise<string | null> {
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
            const access: SourceAccess[] = [];
            for (let start = 0; ; start += 100) {
                const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/identities?offset=${start}&limit=100`) as IdentityPage;
                access.push(...page.items);
                if (start + page.items.length >= page.total) break;
                if (!page.items.length) throw new Error('INVALID_SOURCE_PAGE');
            }
            const native = await revalidateSelection(this.#api, this.#profile, access);
            await this.#sync(notebook, native, epoch, 'revalidation', null, snapshot);
            this.#assertEpoch(epoch);
            const page = await this.#engine.request('GET', `/v1/notebooks/${notebook}/snapshots/${snapshot}/sources?offset=${offset}&limit=50`) as SnapshotSourcePage;
            serializeUiResponse('0'.repeat(80), page, null);
            return page;
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
