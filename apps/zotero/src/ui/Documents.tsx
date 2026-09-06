import { useEffect, useRef, useState } from 'react';
import type { DocumentCommand, DocumentOperation, DocumentPage, DocumentStatus, Evidence, Locale, PagePreview, PagePreviewRequest, ParserLimits, SearchPage, UiBridge } from '../bridge/types';
import type { IndexResult } from '../bridge/documents';
import { catalog } from './i18n';

const active = (operation: DocumentOperation | null | undefined) => operation && ['QUEUED', 'RUNNING'].includes(operation.state);
const key = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
const confirmed = (error: unknown) => error instanceof Error && ['SCOPE_STALE', 'SOURCE_REVOKED', 'FORBIDDEN', 'UNAUTHENTICATED', 'DOCUMENT_STALE', 'MISSING_FILE', 'INVALID_REQUEST', 'IDEMPOTENCY_CONFLICT', 'UNSUPPORTED_DOCUMENT', 'INVALID_DOCUMENT_TYPE', 'DOCUMENT_FILE_ERROR', 'INVALID_DOCUMENT_PATH', 'REPARSE_POINT', 'NOT_REGULAR_FILE'].includes(error.message);

export function Documents({ bridge, notebook_id, snapshot_id, locale }: { bridge: UiBridge; notebook_id: string; snapshot_id: string; locale: Locale }) {
    const t = catalog(locale), d = t.evidence, scope = { notebook_id, snapshot_id };
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [page, setPage] = useState<DocumentPage | null>(null), [offsets, setOffsets] = useState<number[]>([]), [polling, setPolling] = useState(true);
    const [fileMB, setFileMB] = useState('200'), [maxPages, setMaxPages] = useState('1000'), [memoryMiB, setMemoryMiB] = useState('512'), [seconds, setSeconds] = useState('120');
    const [query, setQuery] = useState(''), [search, setSearch] = useState<SearchPage | null>(null), [evidence, setEvidence] = useState<Evidence | null>(null);
    const [version, setVersion] = useState<string | null>(null), [physicalPage, setPhysicalPage] = useState('1'), [region, setRegion] = useState(''), [scale, setScale] = useState('1');
    const [previewOp, setPreviewOp] = useState<DocumentOperation | null>(null), [preview, setPreview] = useState<PagePreview | null>(null);
    const pending = useRef(new Map<string, Extract<DocumentCommand, { op: 'documents.index' }>>());
    const [uncertain, setUncertain] = useState<string[]>([]);
    const alive = useRef(true), running = useRef(false), generation = useRef(0);
    useEffect(() => { alive.current = true; return () => { alive.current = false; ++generation.current; }; }, []);

    function reason(value: string | null | undefined) { return value ? d.reasons[value as keyof typeof d.reasons] ?? value : ''; }
    async function action(work: (current: () => boolean) => Promise<void>) {
        if (running.current) return;
        running.current = true; setBusy(true); setError('');
        const currentGeneration = ++generation.current;
        const current = () => alive.current && generation.current === currentGeneration;
        try { await work(current); }
        catch (failure) {
            if (current()) {
                setError(failure instanceof Error ? reason(failure.message) : 'OPERATION_FAILED'); setPolling(false);
                if (confirmed(failure)) { setEvidence(null); setSearch(null); setPreview(null); }
            }
        } finally { running.current = false; if (alive.current) setBusy(false); }
    }
    async function load(offset: number, current: () => boolean, direction: 'same' | 'next' | 'previous' = 'same') {
        const next = await bridge.request({ op: 'documents.list', ...scope, offset }) as DocumentPage;
        if (!current()) return;
        setPage(next); setOffsets(old => direction === 'next' ? [...old, page?.offset ?? 0] : direction === 'previous' ? old.slice(0, -1) : old);
        if (active(previewOp) || previewOp?.state === 'COMPLETE' && !preview) {
            const operation = await bridge.request({ op: 'documents.operation', ...scope, operation_id: previewOp!.id }) as DocumentOperation;
            if (!current()) return;
            setPreviewOp(operation);
            if (operation.state === 'COMPLETE') {
                const image = await bridge.request({ op: 'documents.preview.read', ...scope, operation_id: operation.id }) as PagePreview;
                if (current()) setPreview(image);
            } else if (!active(operation)) setError(reason(operation.reason));
        }
    }
    const needsPoll = page?.items.some(row => active(row.operation)) || active(previewOp);
    useEffect(() => {
        if (!open || !polling || !needsPoll) return;
        const timer = setInterval(() => { if (!running.current) void action(current => load(page?.offset ?? 0, current)); }, 1000);
        return () => clearInterval(timer);
    }, [open, polling, needsPoll, page, previewOp, locale]);

    function limits(): ParserLimits {
        const value = { max_file_bytes: Number(fileMB) * 1_000_000, max_pages: Number(maxPages), memory_bytes: Number(memoryMiB) * 1048576, timeout_seconds: Number(seconds) };
        if (!Number.isSafeInteger(value.max_file_bytes) || value.max_file_bytes < 1 || value.max_file_bytes > 2_000_000_000
            || !Number.isSafeInteger(value.max_pages) || value.max_pages < 1 || value.max_pages > 10000
            || !Number.isSafeInteger(value.memory_bytes) || value.memory_bytes < 67108864 || value.memory_bytes > 4294967296
            || !Number.isFinite(value.timeout_seconds) || value.timeout_seconds < .1 || value.timeout_seconds > 1800) throw new Error(d.invalidLimits);
        return value;
    }
    function index(row: DocumentStatus) { void action(async current => {
        const id = `${row.source_id}:${row.content_key}`;
        const command = pending.current.get(id) ?? { op: 'documents.index' as const, ...scope, source_id: row.source_id,
            content_key: row.content_key, limits: limits(), idempotency_key: key() };
        pending.current.set(id, command); setUncertain([...pending.current.keys()]); setNotice(d.pending);
        let result: IndexResult;
        try { result = await bridge.request(command) as IndexResult; }
        catch (failure) {
            if (confirmed(failure)) { pending.current.delete(id); setUncertain([...pending.current.keys()]); }
            else if (current()) setNotice(d.uncertain);
            throw failure;
        }
        if (!current()) return;
        pending.current.delete(id); setUncertain([...pending.current.keys()]); setPolling(true);
        setNotice(result.operation ? d.states[result.operation.state] : d.states.COMPLETE);
        await load(page?.offset ?? 0, current);
    }); }
    function cancel(operation: DocumentOperation) { void action(async current => {
        await bridge.request({ op: 'documents.cancel', ...scope, operation_id: operation.id });
        if (current()) { setPolling(true); await load(page?.offset ?? 0, current); }
    }); }
    function searchText(offset = 0) { if (!query.trim()) return; void action(async current => {
        const found = await bridge.request({ op: 'documents.search', ...scope, request: { query, offset, limit: 40 } }) as SearchPage;
        if (current()) { setSearch(found); setEvidence(null); setPreview(null); }
    }); }
    function inspect(id: string) { void action(async current => {
        const value = await bridge.request({ op: 'documents.evidence', ...scope, evidence_id: id }) as Evidence;
        if (current()) { setEvidence(value); setVersion(value.source_kind === 'pdf' ? value.document_version_id : null);
            setPhysicalPage(String((value.page_index ?? 0) + 1)); setPreview(null); setPreviewOp(null); setRegion(''); }
    }); }
    function openEvidence() { if (!evidence) return; void action(async current => {
        await bridge.request({ op: 'documents.open', ...scope, evidence_id: evidence.id });
        if (current()) setNotice(d.opened);
    }); }
    function renderPreview() { if (!version) return; void action(async current => {
        const values = region.trim() ? region.split(',').map(value => Number(value.trim())) : null;
        if (values && (values.length !== 4 || values.some(v => !Number.isFinite(v)) || values[0]! >= values[2]! || values[1]! >= values[3]!)) throw new Error('INVALID_REGION');
        const request: PagePreviewRequest = { document_version_id: version, page_index: Number(physicalPage) - 1,
            region: values as PagePreviewRequest['region'], scale: Number(scale), idempotency_key: key(), limits: limits() };
        const operation = await bridge.request({ op: 'documents.preview', ...scope, request }) as DocumentOperation;
        if (current()) {
            setPreview(null); setPreviewOp(operation); setPolling(true);
            if (operation.state === 'COMPLETE') {
                const image = await bridge.request({ op: 'documents.preview.read', ...scope, operation_id: operation.id }) as PagePreview;
                if (current()) setPreview(image);
            }
        }
    }); }
    if (!open) return <button type="button" onClick={() => { setOpen(true); void action(current => load(0, current)); }}>{d.open}</button>;
    return <section className="documents" aria-label={d.open} aria-busy={busy}>
        <h3>{d.open}</h3><p>{d.help}</p><div role="status">{busy ? d.pending : notice}</div>
        {error && <p role="alert" className="source-error">{error}</p>}
        <details><summary>{d.limits}</summary><fieldset disabled={busy || !!uncertain.length}><div className="source-filters">
            <label>{d.fileMB}<input type="number" min=".000001" max="2000" step="any" value={fileMB} onChange={e => setFileMB(e.target.value)}/></label>
            <label>{d.pages}<input type="number" min="1" max="10000" value={maxPages} onChange={e => setMaxPages(e.target.value)}/></label>
            <label>{d.memoryMiB}<input type="number" min="64" max="4096" value={memoryMiB} onChange={e => setMemoryMiB(e.target.value)}/></label>
            <label>{d.seconds}<input type="number" min=".1" max="1800" step="any" value={seconds} onChange={e => setSeconds(e.target.value)}/></label>
        </div></fieldset></details>
        <button type="button" disabled={busy} onClick={() => { setPolling(true); void action(current => load(page?.offset ?? 0, current)); }}>{d.refresh}</button>
        <ul className="source-list">{page?.items.map(row => {
            const operation = row.operation, supported = ['pdf', 'abstract', 'human_note', 'human_annotation'].includes(row.source_kind);
            return <li key={`${row.source_id}:${row.content_key}`}><div className="source-heading"><strong>{row.title || row.content_key}</strong><span>{d.coverage[row.coverage]}</span></div>
                <p className="source-meta">{t.sources.kinds[row.source_kind]} · {row.content_key} {row.historical && `· ${d.historical}`}</p>
                {row.reason && <p>{reason(row.reason)}</p>}
                {operation && <p role={active(operation) ? 'status' : undefined}>{d.states[operation.state]} {reason(operation.reason)}<br/>
                    {d.bytes}: {operation.bytes_processed ?? 0} · {d.processed}: {operation.pages_processed ?? 0} / {operation.page_count ?? '—'} {operation.cache_hit && `· ${d.cache}`}</p>}
                {['NEEDS_OCR', 'UNREADABLE', 'PARTIAL_TEXT'].includes(row.coverage) && <p>{d.ocr}</p>}
                {supported ? <div className="actions"><button type="button" disabled={busy || !!active(operation) || row.historical} onClick={() => index(row)}>
                    {uncertain.includes(`${row.source_id}:${row.content_key}`) ? d.retry : row.document_version_id ? d.reindex : d.index}</button>
                    {active(operation) && <button type="button" disabled={busy} onClick={() => cancel(operation!)}>{d.cancel}</button>}
                    {row.source_kind === 'pdf' && row.document_version_id && <button type="button" disabled={busy} onClick={() => { setVersion(row.document_version_id!); setPhysicalPage('1'); setRegion(''); setPreview(null); setPreviewOp(null); }}>{d.preview}</button>}
                </div> : <p>{d.unsupported}</p>}
            </li>;
        })}</ul>
        {page && page.total > page.limit && <nav className="actions" aria-label={d.open}><button disabled={busy || !offsets.length} onClick={() => void action(current => load(offsets.at(-1) ?? 0, current, 'previous'))}>{t.previous}</button>
            <span>{page.offset + 1}–{page.offset + page.items.length} / {page.total}</span><button disabled={busy || page.offset + page.items.length >= page.total} onClick={() => void action(current => load(page.offset + page.items.length, current, 'next'))}>{t.next}</button></nav>}
        <label>{d.query}<input name="document_query" value={query} maxLength={2000} onChange={e => { setQuery(e.target.value); setSearch(null); setEvidence(null); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && !busy) { e.preventDefault(); searchText(); } }}/></label>
        <button type="button" disabled={busy || !query.trim()} onClick={() => searchText()}>{d.search}</button>
        {search && <div><p>{d.retrieved}: {search.documents_retrieved} · {d.matches}: {search.total}</p>
            {!search.items.length && <p>{d.empty}</p>}<ul className="source-list">{search.items.map(hit => <li key={hit.evidence_id}>
                <blockquote>{hit.excerpt}</blockquote><p className="source-meta">{t.sources.kinds[hit.source_kind]} · {hit.content_key}
                    {hit.page_index !== null && ` · ${d.page} ${hit.page_index + 1}`} {hit.page_label !== null && `· ${hit.page_label}`} {hit.historical && `· ${d.historical}`}</p>
                <button disabled={busy} type="button" onClick={() => inspect(hit.evidence_id)}>{d.inspect}</button></li>)}</ul>
            {search.total > search.limit && <nav className="actions" aria-label={d.search}><button disabled={busy || !search.offset} onClick={() => searchText(Math.max(0, search.offset - search.limit))}>{t.previous}</button><button disabled={busy || search.offset + search.items.length >= search.total} onClick={() => searchText(search.offset + search.items.length)}>{t.next}</button></nav>}
        </div>}
        {evidence && <aside className="evidence-panel"><h4>{d.precision[evidence.precision]}</h4><blockquote>{evidence.excerpt}</blockquote>
            <p>{t.sources.kinds[evidence.source_kind]} · {evidence.content_key} {evidence.historical && `· ${d.historical}`}</p>
            <p>{d.offsets}: {evidence.start}–{evidence.end} · {evidence.parser_version}</p>
            {evidence.page_index !== null && <p>{d.page}: {evidence.page_index + 1} · {d.label}: {evidence.page_label ?? '—'}</p>}
            {evidence.precision === 'page' && <p>{d.pageOnly}</p>}
            {evidence.source_kind === 'pdf' && <button type="button" disabled={busy} onClick={openEvidence}>{evidence.precision === 'rectangles' ? d.openExcerpt : d.openPage}</button>}
        </aside>}
        {version && <fieldset className="preview-controls" disabled={busy || !!active(previewOp)}><legend>{d.preview}</legend><p>{d.previewHelp}</p>
            <div className="source-filters"><label>{d.page}<input type="number" min="1" max="10000" value={physicalPage} onChange={e => setPhysicalPage(e.target.value)}/></label>
                <label>{d.scale}<input type="number" min=".01" max="4" step=".1" value={scale} onChange={e => setScale(e.target.value)}/></label></div>
            <label>{d.region}<input value={region} onChange={e => setRegion(e.target.value)} placeholder="30, 40, 300, 400"/></label>
            <button type="button" onClick={renderPreview}>{d.render}</button><p className="source-meta">{d.previewLimits}</p>
        </fieldset>}
        {previewOp && <p role="status">{d.states[previewOp.state]} {reason(previewOp.reason)}</p>}
        {active(previewOp) && <button type="button" disabled={busy} onClick={() => cancel(previewOp!)}>{d.cancel}</button>}
        {preview && <figure className="page-preview"><img src={`data:image/png;base64,${preview.data_base64}`} alt={`${d.page} ${preview.page_index + 1}: ${preview.region.join(', ')}`}/><figcaption>{d.previewDestination} · {preview.width}×{preview.height}<br/>{d.previewHash}: <code>{preview.sha256}</code></figcaption></figure>}
    </section>;
}
