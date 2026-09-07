import type { NativeReader, NativeSourceItem, NativeZotero } from './native-types';
import type { SourceBridge, SourceTransport } from './sources';
import type { ConversationCommand, DocumentCommand, DocumentOperation, Evidence, RegisteredDocument, Source, SourceContent, TextStage } from './types';
import { conversationCommand } from './conversations';
import { matrixCommand } from './matrix';
import { jobCommand } from './jobs';
import { researchCommand } from './research';
import { mcpCommand } from './mcp';
import type { McpCommand } from './types';
import type { ResearchCommand } from './types';
import type { JobCommand, MatrixCommand } from './types';
import { identityKey } from '../sources/resolver';

export interface IndexResult { document: RegisteredDocument; operation: DocumentOperation | null }

/** Only native-authorized content can supply paths/text; UI sends scoped IDs and bounded settings. */
export class DocumentBridge {
    constructor(private api: NativeZotero, private sources: SourceBridge, private engine: SourceTransport,
        private crypto: Crypto, private plainText: (html: string) => string) {}

    async #item(source: Source, content: SourceContent, check: () => void): Promise<NativeSourceItem> {
        check();
        const item = await this.api.Items.getByLibraryAndKeyAsync(source.identity.library_id, content.key);
        check();
        if (!item || item.deleted || item.key !== content.key || item.libraryID !== source.identity.library_id
            || `${item.version}:${item.getField('dateModified')}` !== content.version) throw new Error('SCOPE_STALE');
        if (content.kind === 'pdf' && !item.isPDFAttachment() || content.kind === 'human_note' && !item.isNote()
            || content.kind === 'human_annotation' && !item.isAnnotation()) throw new Error('SCOPE_STALE');
        if (content.kind === 'text_attachment' && (!item.isFileAttachment()
            || !content.media_type || content.media_type !== item.attachmentContentType)) throw new Error('SCOPE_STALE');
        return item;
    }

    async dispatch(message: DocumentCommand | ConversationCommand | MatrixCommand | JobCommand | McpCommand | Exclude<ResearchCommand, { op: 'research.notes.publish' }>): Promise<unknown> {
        const prefix = `/v1/notebooks/${message.notebook_id}/snapshots/${message.snapshot_id}`;
        if (message.op === 'mcp.revoke' || message.op === 'mcp.connections')
            return mcpCommand(message, (method, path, body) => this.engine.request(method, prefix + path, body));
        if (message.op === 'research.run' || message.op === 'research.runs'
            || message.op === 'research.control' && message.request.action !== 'start')
            return researchCommand(message, (method, path, body) => this.engine.request(method, prefix + path, body));
        // Scoped status-only cancellation must not queue behind native content revalidation.
        if (message.op === 'conversation.cancel' || message.op === 'conversation.vectors.cancel')
            return conversationCommand(message, (method, path, body) => this.engine.request(method, prefix + path, body));
        // Job headers contain configuration/counts only. Cancellation never waits for PDF registration.
        if (message.op === 'jobs.read' || message.op === 'jobs.list' || message.op === 'jobs.control' && ['pause', 'cancel', 'skip_uncertain'].includes(message.request.action))
            return jobCommand(message, (method, path, body) => this.engine.request(method, prefix + path, body));
        const continuation = ['conversation.run', 'conversation.start', 'conversation.events'].includes(message.op)
            ? (action: Parameters<SourceBridge['withRunDocuments']>[3]) => this.sources.withRunDocuments(message.notebook_id, message.snapshot_id, (message as { run_id: string }).run_id, action)
            : 'job_id' in message && message.op.startsWith('jobs.')
                ? (action: Parameters<SourceBridge['withRunDocuments']>[3]) => this.sources.withJobDocuments(message.notebook_id, message.snapshot_id, message.job_id, action)
            : (action: Parameters<SourceBridge['withRunDocuments']>[3]) => this.sources.withDocuments(message.notebook_id, message.snapshot_id, action);
        return continuation(async (sources, check, verifyReaderFile, dependencies) => {
            const documents = new Map<string, { document: RegisteredDocument; item: NativeSourceItem; path: string | false }>();
            const request = async (method: 'GET' | 'POST', path: string, body?: unknown) => {
                check(); const value = await this.engine.request(method, prefix + path, body); check(); return value;
            };
            // Local availability is re-observed before cache reads and ranking, independently
            // for each exact attachment key. No parent/sibling traversal or byte hashing here.
            for (const source of sources) for (const content of source.contents ?? []) {
                if (content.kind !== 'pdf' && content.kind !== 'text_attachment') continue;
                if (dependencies && !dependencies.has(`${source.id}:${content.key}`)) continue;
                const item = await this.#item(source, content, check);
                const path = await item.getFilePathAsync(); check();
                const target = { source_id: source.id, content_key: content.key };
                const document = await request('POST', path === false ? '/documents/missing' : '/documents/register',
                    path === false ? target : { ...target, path }) as RegisteredDocument;
                documents.set(`${source.id}:${content.key}`, { document, item, path });
            }
            if (message.op.startsWith('conversation.')) return conversationCommand(message as ConversationCommand, request);
            if (message.op.startsWith('matrix.')) return matrixCommand(message as MatrixCommand, request);
            if (message.op.startsWith('jobs.')) return jobCommand(message as JobCommand, request);
            if (message.op.startsWith('mcp.')) return mcpCommand(message as McpCommand, request);
            if (message.op.startsWith('research.')) return researchCommand(message as Exclude<ResearchCommand, { op: 'research.notes.publish' }>, request);
            switch (message.op) {
                case 'documents.list': return request('GET', `/documents?offset=${message.offset}&limit=50`);
                case 'documents.search': return request('POST', '/search', message.request);
                case 'documents.evidence': return request('GET', `/evidence/${message.evidence_id}`);
                case 'documents.operation': return request('GET', `/operations/${message.operation_id}`);
                case 'documents.cancel': return request('POST', `/operations/${message.operation_id}/cancel`);
                case 'documents.preview.read': return request('GET', `/operations/${message.operation_id}/preview`);
                case 'documents.preview': return request('POST', '/documents/preview', message.request);
                case 'documents.index': {
                    const source = sources.find(s => s.id === message.source_id);
                    const content = source?.contents?.find(c => c.key === message.content_key);
                    if (!source || !content) throw new Error('SOURCE_REVOKED');
                    if (content.kind === 'pdf' || content.kind === 'text_attachment') {
                        const registered = documents.get(`${source.id}:${content.key}`)!;
                        if (registered.path === false) throw new Error('MISSING_FILE');
                        const operation = await request('POST', '/documents/ingest', { document_id: registered.document.id,
                            idempotency_key: message.idempotency_key, limits: message.limits }) as DocumentOperation;
                        return { document: registered.document, operation } satisfies IndexResult;
                    }
                    if (!['abstract', 'human_note', 'human_annotation'].includes(content.kind)) throw new Error('UNSUPPORTED_DOCUMENT');
                    const item = await this.#item(source, content, check);
                    const text = content.kind === 'abstract' ? String(item.getField('abstractNote'))
                        : content.kind === 'human_note' ? this.plainText(item.getNote())
                        : [item.annotationText, item.annotationComment].filter(Boolean)
                            .map(value => this.plainText(this.api.EditorInstanceUtilities._transformTextToHTML(value))).join('\n\n');
                    check();
                    if (`${item.version}:${item.getField('dateModified')}` !== content.version) throw new Error('SCOPE_STALE');
                    const characters = [...text];
                    if (characters.length > 20_000_000) throw new Error('TEXT_LIMIT');
                    const hash = await this.#hash(new TextEncoder().encode(text)); check();
                    let stage = await request('POST', '/documents/text', { source_id: source.id, content_key: content.key,
                        total_characters: characters.length, sha256: hash }) as TextStage;
                    for (let offset = 0; ;) {
                        const part = characters.slice(offset, offset + 8000), final = offset + part.length === characters.length;
                        stage = await request('POST', `/documents/text/${stage.id}`, { offset, text: part.join(''), final }) as TextStage;
                        offset += part.length;
                        if (stage.offset !== offset) throw new Error('INVALID_TEXT_RECEIPT');
                        if (final) break;
                    }
                    if (!stage.document) throw new Error('INVALID_TEXT_RECEIPT');
                    return { document: stage.document, operation: null } satisfies IndexResult;
                }
                case 'documents.open': {
                    const evidence = await request('GET', `/evidence/${message.evidence_id}`) as Evidence;
                    if (evidence.source_kind !== 'pdf' || evidence.page_index === null) throw new Error('UNSUPPORTED_DOCUMENT');
                    const source = sources.find(s => s.id === evidence.source_id && identityKey(s.identity) === identityKey(evidence.source_identity));
                    const registered = documents.get(`${evidence.source_id}:${evidence.content_key}`);
                    if (!source || !registered || registered.path === false) throw new Error('SOURCE_REVOKED');
                    const verified = await request('POST', '/documents/verify', { evidence_id: evidence.id, path: registered.path }) as Evidence;
                    check();
                    // Open without applying any old page/offset to a possibly cached Reader.
                    let reader = await this.#ready(this.api.Reader.open(registered.item.id, undefined, { openInWindow: false }));
                    if (!reader) reader = await this.#readerForUnloadedTab(registered.item.id, check);
                    await this.#ready(reader._initPromise); check();
                    const view = reader._internalReader._lastView;
                    await this.#ready(view.initializedPromise); check();
                    const proxy = view._iframeWindow?.PDFViewerApplication?.pdfDocument;
                    if (!proxy || typeof proxy.getData !== 'function' || typeof proxy.getDownloadInfo !== 'function') throw new Error('READER_PDF_UNAVAILABLE');
                    // Reader already owns its loaded stream. Check its size before copying it
                    // into privileged bridge memory; this is not a Reader RAM limit.
                    const downloaded = await this.#ready(proxy.getDownloadInfo()); check();
                    if (!Number.isSafeInteger(verified.document_bytes) || verified.document_bytes <= 0
                        || verified.document_bytes > 2_000_000_000 || downloaded.length !== verified.document_bytes) throw new Error('READER_SIZE_MISMATCH');
                    if (reader._internalReader._lastView !== view || view._iframeWindow?.PDFViewerApplication?.pdfDocument !== proxy) throw new Error('READER_CHANGED');
                    const data = await this.#ready(proxy.getData()); check();
                    if (data.byteLength !== verified.document_bytes) throw new Error('READER_SIZE_MISMATCH');
                    if (await this.#hash(data) !== verified.document_sha256) throw new Error('READER_VERSION_MISMATCH');
                    check();
                    const content = source.contents!.find(c => c.key === evidence.content_key)!;
                    await this.#item(source, content, check);
                    const currentPath = await registered.item.getFilePathAsync(); check();
                    if (currentPath === false) throw new Error('MISSING_FILE');
                    await verifyReaderFile(registered.item, currentPath,
                        () => request('POST', '/documents/verify', { evidence_id: evidence.id, path: currentPath }));
                    if (reader.itemID !== registered.item.id || reader._internalReader._lastView !== view
                        || view._iframeWindow?.PDFViewerApplication?.pdfDocument !== proxy) throw new Error('READER_CHANGED');
                    await reader.navigate(verified.precision === 'rectangles'
                        ? { position: { pageIndex: verified.page_index!, rects: verified.rectangles } }
                        : { pageIndex: verified.page_index! });
                    check();
                    return verified;
                }
            }
        });
    }

    async #hash(data: Uint8Array<ArrayBuffer>): Promise<string> {
        return Array.from(new Uint8Array(await this.crypto.subtle.digest('SHA-256', data)), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async #ready<T>(promise: Promise<T>): Promise<T> {
        let timer: ReturnType<typeof setTimeout>;
        const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('READER_TIMEOUT')), 10000); });
        try { return await Promise.race([promise, timeout]); }
        finally { clearTimeout(timer!); }
    }

    async #readerForUnloadedTab(itemID: number, check: () => void): Promise<NativeReader> {
        const window = this.api.getMainWindow() as (Window & { Zotero_Tabs: { selectedID: string; getTabIDByItemID(id: number): string | undefined } }) | null;
        const tabID = window?.Zotero_Tabs.getTabIDByItemID(itemID);
        if (!window || !tabID) throw new Error('READER_NOT_READY');
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
            check();
            if (window.Zotero_Tabs.selectedID !== tabID) throw new Error('READER_CHANGED');
            const reader = this.api.Reader.getByTabID(tabID);
            if (reader) {
                if (reader.itemID !== itemID) throw new Error('READER_CHANGED');
                return reader;
            }
            // Reader.open activated an unloaded tab. Await its single asynchronous load;
            // do not invoke open a second time or navigate an unrelated active Reader.
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        throw new Error('READER_TIMEOUT');
    }
}
