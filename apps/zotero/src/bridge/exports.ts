import { nativeBibliography, TRANSLATORS, type BibliographyFormat } from './bibliography';
import { DocumentBridge } from './documents';
import type { TextAttachmentViews } from './text-view';
import type { NativeGlobals, NativePicker } from './native-types';
import type { SourceBridge, SourceTransport } from './sources';
import type { Evidence, ExportArtifact, ExportCommand, ExportData, ExportPreview, ImportPreview,
    Locale, Source, SourceAccess, UploadReceipt } from './types';
import { catalog } from '../ui/i18n';

const MAX_BYTES = 128 * 1024 * 1024, CHUNK = 24000;
type Request = (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>;
type NativePrepared = { preview: ExportPreview; bytes: Uint8Array<ArrayBuffer>; sha256: string; key?: string };
export interface SaveReceipt { filename: string; bytes: number; sha256: string; saved: true }

/** Only typed artifact IDs cross the renderer boundary. FilePicker owns every path. */
export class ExportBridge {
    #native = new Map<string, NativePrepared>();
    #artifacts = new Map<string, ExportArtifact>();
    #saved = new Map<string, SaveReceipt>();
    constructor(private g: NativeGlobals, private sources: SourceBridge, private engine: SourceTransport,
        private profile: string, private textViews?: TextAttachmentViews) {}

    #prefix(message: ExportCommand) { return `/v1/notebooks/${message.notebook_id}/snapshots/${message.snapshot_id}`; }

    async #scoped<T>(message: ExportCommand, action: (request: Request, check: () => void, sources: Source[]) => Promise<T>) {
        const metadataOnly = message.op === 'exports.preview' && Object.hasOwn(TRANSLATORS, message.request.format)
            || message.op === 'exports.create' && this.#native.has(message.request.preview_id)
            || message.op === 'exports.save' && this.#native.has(message.artifact_id);
        const operation = async (sources: Source[], check: () => void) => {
            const request: Request = async (method, path, body) => {
                check(); const result = await this.engine.request(method, this.#prefix(message) + path, body); check(); return result;
            };
            // Re-observe only explicitly granted PDF paths before any historical cache
            // read. No parent traversal or sibling enumeration is used here.
            if (!metadataOnly) for (const source of sources) for (const content of source.contents ?? []) {
                if (content.kind !== 'pdf') continue;
                const item = await this.g.Zotero.Items.getByLibraryAndKeyAsync(source.identity.library_id, content.key); check();
                if (!item || item.deleted || !item.isPDFAttachment() || item.key !== content.key
                    || item.libraryID !== source.identity.library_id || `${item.version}:${item.getField('dateModified')}` !== content.version)
                    throw new Error('SCOPE_STALE');
                const path = await item.getFilePathAsync(); check();
                await request('POST', path === false ? '/documents/missing' : '/documents/register',
                    { source_id: source.id, content_key: content.key, ...(path === false ? {} : { path }) });
            }
            return action(request, check, sources);
        };
        if (metadataOnly) {
            const prepared = message.op === 'exports.create' ? this.#native.get(message.request.preview_id)
                : message.op === 'exports.save' ? this.#native.get(message.artifact_id) : undefined;
            const expected = prepared?.preview.bibliography ?? [];
            return this.sources.withBibliography(async () => {
                if (message.op === 'exports.preview') return await this.engine.request('POST', this.#prefix(message) + '/exports/bibliography-access', message.request) as SourceAccess[];
                return expected.map(source => ({ identity: source.identity, contents: [] }));
            }, expected, check => operation([], check));
        }
        return this.sources.withDocuments(message.notebook_id, message.snapshot_id, operation);
    }

    #picker(window: Window, title: string, save: boolean, filename: string) {
        const Picker = this.g.ChromeUtils.importESModule('chrome://zotero/content/modules/filePicker.mjs').FilePicker as new () => NativePicker;
        const picker = new Picker();
        picker.init(window, title, save ? picker.modeSave : picker.modeOpen);
        picker.defaultString = filename;
        const extension = filename.split('.').at(-1)!;
        picker.appendFilter(extension.toUpperCase(), `*.${extension}`);
        return picker;
    }

    async dispatch(message: ExportCommand, window: Window, locale: Locale): Promise<unknown> {
        const t = catalog(locale).exports;
        if (message.op === 'exports.discard') {
            await this.engine.request('POST', this.#prefix(message) + `/transfers/${message.transfer_id}/discard`);
            this.#native.delete(message.transfer_id); this.#artifacts.delete(message.transfer_id); this.#saved.delete(message.transfer_id);
            return null;
        }
        if (message.op === 'imports.open') {
            const evidence = await this.#scoped(message, request => request('POST', `/imports/${message.import_id}/evidence`, message.request)) as Evidence;
            return new DocumentBridge(this.g.Zotero, this.sources, this.engine, this.g.crypto, this.g.plainText, this.textViews?.opener(window, locale))
                .dispatch({ op: 'documents.open', notebook_id: message.notebook_id, snapshot_id: message.snapshot_id, evidence_id: evidence.id });
        }
        return this.#scoped(message, async (request, check) => {
            switch (message.op) {
                case 'exports.preview': {
                    const preview = await request('POST', '/exports/previews', message.request) as ExportPreview;
                    if (Object.hasOwn(TRANSLATORS, preview.format)) {
                        try {
                            const result = await nativeBibliography(this.g.Zotero, this.g.crypto, this.profile, preview.bibliography ?? [],
                                preview.format as BibliographyFormat, check);
                            await request('POST', `/exports/${preview.id}/validate`);
                            const measured = { ...preview, bytes: result.bytes.byteLength };
                            this.#native.set(preview.id, { preview: measured, bytes: result.bytes, sha256: result.sha256 });
                            return measured;
                        } catch (error) {
                            try { await request('POST', `/transfers/${preview.id}/discard`); }
                            catch (cleanup) { throw new AggregateError([error, cleanup], 'EXPORT_CLEANUP_FAILED'); }
                            throw error;
                        }
                    }
                    return preview;
                }
                case 'exports.create': {
                    const native = this.#native.get(message.request.preview_id);
                    let artifact: ExportArtifact;
                    if (native) {
                        await request('POST', `/exports/${native.preview.id}/validate`);
                        if (native.key && native.key !== message.request.idempotency_key) throw new Error('IDEMPOTENCY_CONFLICT');
                        const format = native.preview.format;
                        artifact = { id: native.preview.id, filename: format === 'bibtex' ? 'bibliography.bib' : format === 'ris' ? 'bibliography.ris' : 'bibliography.csl.json',
                            media_type: format === 'csl_json' ? 'application/json' : 'text/plain', bytes: native.bytes.byteLength, sha256: native.sha256 };
                        native.key = message.request.idempotency_key;
                    } else artifact = await request('POST', '/exports', message.request) as ExportArtifact;
                    this.#artifacts.set(artifact.id, artifact);
                    return artifact;
                }
                case 'exports.save': {
                    const artifact = this.#artifacts.get(message.artifact_id);
                    if (!artifact) throw new Error('EXPORT_NOT_CREATED');
                    await request('POST', `/exports/${artifact.id}/validate`);
                    const prior = this.#saved.get(artifact.id);
                    if (prior) return prior;
                    const picker = this.#picker(window, t.chooseDestination, true, artifact.filename);
                    const selected = await picker.show(); check();
                    if (selected !== picker.returnOK && selected !== picker.returnReplace) return null;
                    if (artifact.bytes > MAX_BYTES) throw new Error('BODY_TOO_LARGE');
                    const native = this.#native.get(artifact.id);
                    const bytes = native?.bytes ?? new Uint8Array(artifact.bytes);
                    if (!native) for (let offset = 0; offset < bytes.byteLength;) {
                        const part = await request('GET', `/exports/${artifact.id}/data?offset=${offset}`) as ExportData;
                        const data = Uint8Array.from(atob(part.data_base64), c => c.charCodeAt(0));
                        if (part.offset !== offset || part.total !== artifact.bytes || !data.byteLength || data.byteLength > CHUNK || offset + data.byteLength > bytes.byteLength)
                            throw new Error('EXPORT_TRANSFER_INVALID');
                        bytes.set(data, offset); offset += data.byteLength;
                    }
                    const sha256 = Array.from(new Uint8Array(await this.g.crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join(''); check();
                    if (sha256 !== artifact.sha256 || bytes.byteLength !== artifact.bytes) throw new Error('EXPORT_CHECKSUM_MISMATCH');
                    await request('POST', `/exports/${artifact.id}/validate`); check();
                    await this.g.IOUtils.write(picker.file, bytes, { mode: selected === picker.returnReplace ? 'overwrite' : 'create' });
                    check();
                    if (await this.g.IOUtils.computeHexDigest(picker.file, 'sha256') !== artifact.sha256) throw new Error('EXPORT_SAVE_VERIFY_FAILED');
                    check();
                    const receipt: SaveReceipt = { filename: this.g.PathUtils.filename(picker.file), bytes: artifact.bytes, sha256: artifact.sha256, saved: true };
                    this.#saved.set(artifact.id, receipt);
                    return receipt;
                }
                case 'imports.choose': {
                    const picker = this.#picker(window, t.chooseImport, false, 'notebook.evidra.zip');
                    if (await picker.show() !== picker.returnOK) return null;
                    check();
                    const before = await this.g.IOUtils.stat(picker.file); check();
                    if (before.type !== 'regular' || before.size < 1 || before.size > MAX_BYTES) throw new Error('INVALID_BACKUP');
                    const sha256 = await this.g.IOUtils.computeHexDigest(picker.file, 'sha256'); check();
                    const stage = await request('POST', '/imports/uploads', { bytes: before.size, sha256 }) as UploadReceipt;
                    try {
                        for (let offset = 0; offset < before.size;) {
                            const data = await this.g.IOUtils.read(picker.file, { offset, maxBytes: Math.min(CHUNK, before.size - offset) }); check();
                            if (!data.byteLength || data.byteLength > CHUNK || offset + data.byteLength > before.size) throw new Error('IMPORT_FILE_CHANGED');
                            const uploaded = await request('POST', `/imports/uploads/${stage.id}`, { offset,
                                data_base64: btoa(String.fromCharCode(...data)) }) as UploadReceipt;
                            offset += data.byteLength;
                            if (uploaded.id !== stage.id || uploaded.offset !== offset) throw new Error('IMPORT_TRANSFER_INVALID');
                        }
                        const after = await this.g.IOUtils.stat(picker.file); check();
                        if (before.size !== after.size || before.lastModified !== after.lastModified || before.creationTime !== after.creationTime) throw new Error('IMPORT_FILE_CHANGED');
                        return await request('POST', `/imports/uploads/${stage.id}/inspect`) as ImportPreview;
                    } catch (error) {
                        try { await request('POST', `/transfers/${stage.id}/discard`); }
                        catch (cleanup) { throw new AggregateError([error, cleanup], 'IMPORT_CLEANUP_FAILED'); }
                        throw error;
                    }
                }
                case 'imports.sources': return request('GET', `/imports/uploads/${message.preview_id}/sources?offset=${message.offset}&limit=20`);
                case 'imports.map': return request('POST', `/imports/uploads/${message.preview_id}/mappings`, message.request);
                case 'imports.commit': return request('POST', '/imports', message.request);
                case 'imports.list': return request('GET', `/imports?offset=${message.offset}&limit=20`);
                case 'imports.records': return request('GET', `/imports/${message.import_id}/records?offset=${message.offset}&limit=20`);
                case 'imports.status': return request('GET', `/imports/${message.import_id}/status`);
                case 'imports.reference': return request('POST', `/imports/${message.import_id}/reference`, message.request);
            }
        });
    }
}
