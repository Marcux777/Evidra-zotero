import { useEffect, useRef, useState } from 'react';
import type { AttachmentRole, Locale, Notebook, SelectionSpec, Snapshot, SnapshotCreate, SnapshotPage, SnapshotSourcePage, Source, SourceChange, SourceIdentity, UiBridge } from '../bridge/types';
import type { SourcePreviewResult, SourceState } from '../bridge/sources';
import { catalog } from './i18n';
import { Documents } from './Documents';

const sameIdentity = (a: SourceIdentity, b: SourceIdentity) => a.profile_instance_id === b.profile_instance_id && a.library_id === b.library_id && a.item_key === b.item_key;
const emptyHistory: SnapshotPage = { items: [], offset: 0, limit: 50, total: 0 };
const confirmedCaptureFailure = (error: unknown) => error instanceof Error &&
    ['SCOPE_STALE', 'SOURCE_REVOKED', 'FORBIDDEN', 'UNAUTHENTICATED', 'BRIDGE_EXPIRED', 'NOT_FOUND', 'IDEMPOTENCY_CONFLICT'].includes(error.message);

export function Sources({ bridge, notebook, locale, onRevision }: { bridge: UiBridge; notebook: Notebook; locale: Locale; onRevision?: (revision: number) => void }) {
    const t = catalog(locale), s = t.sources;
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [spec, setSpec] = useState<SelectionSpec>({ include_selected_containers: false, include_descendants: false, include_notes: false, include_annotations: false, pdf_only: false, tag_mode: 'AND' });
    const [minimum, setMinimum] = useState(''), [maximum, setMaximum] = useState(''), [types, setTypes] = useState(''), [tags, setTags] = useState('');
    const [preview, setPreview] = useState<SourcePreviewResult | null>(null), [valid, setValid] = useState(false);
    const [previewOffsets, setPreviewOffsets] = useState<number[]>([]), [sourceOffsets, setSourceOffsets] = useState<number[]>([]), [historyOffsets, setHistoryOffsets] = useState<number[]>([]);
    const [history, setHistory] = useState(emptyHistory), [snapshot, setSnapshot] = useState<Snapshot | null>(null), [sources, setSources] = useState<SnapshotSourcePage | null>(null);
    const version = useRef(0), epoch = useRef<number | null>(null), actionBusy = useRef(false), alive = useRef(true), revision = useRef(notebook.revision), pendingCapture = useRef<SnapshotCreate | null>(null);
    const [capturePending, setCapturePending] = useState(false), [documentEpoch, setDocumentEpoch] = useState(0);
    const report = (value: unknown) => setError(value instanceof Error ? value.message : 'OPERATION_FAILED');
    function clearPending() { pendingCapture.current = null; setCapturePending(false); }
    function invalidate(discardCapture = true) { ++version.current; setPreview(null); setValid(false); setSources(null); if (discardCapture) { clearPending(); setDocumentEpoch(value => value + 1); } setNotice(pendingCapture.current ? s.captureUncertain : s.changed); }
    function edit(next: Partial<SelectionSpec>) { if (pendingCapture.current) return; ++version.current; setSpec(old => ({ ...old, ...next })); setValid(false); }
    function updateRevision(next: number) { revision.current = next; onRevision?.(next); }
    useEffect(() => { alive.current = true; return () => { alive.current = false; ++version.current; }; }, []);
    // A newer notebook revision can be our own committed capture with a lost response.
    // Recovery still submits its original expected revision; the server decides idempotency.
    useEffect(() => { if (notebook.revision > revision.current) { revision.current = notebook.revision; invalidate(false); } }, [notebook.revision]);
    useEffect(() => {
        if (!open) return;
        let active = true, polling = false;
        const poll = async () => {
            if (!active || polling) return;
            polling = true;
            try {
                const next = await bridge.request({ op: 'sources.state' }) as SourceState;
                if (!active) return;
                if (epoch.current !== null && next.revision !== epoch.current) invalidate();
                epoch.current = next.revision;
            } catch (value) { if (active) { invalidate(confirmedCaptureFailure(value)); report(value); } }
            finally { polling = false; }
        };
        void poll();
        const timer = setInterval(() => void poll(), 10000);
        return () => { active = false; clearInterval(timer); };
    }, [bridge, open, locale]);
    async function action(work: (current: () => boolean) => Promise<void>) {
        if (actionBusy.current) return;
        actionBusy.current = true; setBusy(true); setError('');
        const token = ++version.current, current = () => alive.current && token === version.current;
        try { await work(current); }
        catch (value) { if (current()) { if (confirmedCaptureFailure(value)) invalidate(); else setValid(false); report(value); } }
        finally { actionBusy.current = false; if (alive.current) setBusy(false); }
    }
    async function loadHistory(offset: number, current: () => boolean, initial = false, direction: 'next' | 'previous' | 'replace' = 'replace') {
        const page = await bridge.request({ op: 'sources.history', notebook_id: notebook.id, offset }) as SnapshotPage;
        if (!current()) return;
        setHistory(page);
        setHistoryOffsets(old => direction === 'next' ? [...old, history.offset] : direction === 'previous' ? old.slice(0, -1) : []);
        if (initial && page.items[0]) {
            const latest = page.items[0]; updateRevision(Math.max(revision.current, latest.revision));
            setSnapshot(latest);
            if (!preview) {
                setSpec({ ...latest.selection, selectors: [] });
                setMinimum(latest.selection.year_min?.toString() ?? ''); setMaximum(latest.selection.year_max?.toString() ?? '');
                setTypes((latest.selection.item_types ?? []).join(', ')); setTags((latest.selection.tags ?? []).join(', '));
            }
            const pageSources = await bridge.request({ op: 'sources.read', notebook_id: notebook.id, snapshot_id: latest.id, offset: 0 }) as SnapshotSourcePage;
            if (current()) setSources(pageSources);
        }
    }
    function openView() { setOpen(true); void action(current => loadHistory(0, current, true)); }
    function options(): SelectionSpec {
        const year = (value: string) => { if (!value.trim()) return null; if (!/^\d{1,4}$/.test(value) || Number(value) < 1) throw new Error(s.invalidYear); return Number(value); };
        const year_min = year(minimum), year_max = year(maximum);
        if (year_min && year_max && year_min > year_max) throw new Error(s.invalidYear);
        const split = (value: string) => [...new Set(value.split(',').map(v => v.trim()).filter(Boolean))];
        return { ...spec, selectors: [], year_min, year_max, item_types: split(types), tags: split(tags) };
    }
    function previewSelection(capture: boolean) { if (pendingCapture.current) return; void action(async current => {
        setValid(false); setNotice('');
        const result = await bridge.request({ op: 'sources.preview', notebook_id: notebook.id, selection: options(), capture }) as SourcePreviewResult;
        if (!current()) return;
        setPreview(result); setPreviewOffsets([]); setValid(true);
        updateRevision(result.preview.expected_revision);
    }); }
    function previewPage(back: boolean) { if (!preview) return; void action(async current => {
        const offset = back ? previewOffsets.at(-1) ?? 0 : preview.offset + preview.limit;
        const page = await bridge.request({ op: 'sources.preview.page', notebook_id: notebook.id, preview_id: preview.preview.id, offset }) as SourcePreviewResult;
        if (!current()) return;
        setPreview(page); setPreviewOffsets(old => back ? old.slice(0, -1) : [...old, preview.offset]);
    }); }
    function capture() { if (!pendingCapture.current && (!preview || !valid)) return; void action(async current => {
        const request = pendingCapture.current ?? {
            preview_id: preview!.preview.id, expected_revision: preview!.preview.expected_revision,
            idempotency_key: Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')
        };
        pendingCapture.current = request; setCapturePending(true);
        let result: Snapshot;
        try { result = await bridge.request({ op: 'sources.create', notebook_id: notebook.id, request }) as Snapshot; }
        catch (value) {
            if (current()) {
                if (confirmedCaptureFailure(value)) { invalidate(); report(value); }
                else setNotice(s.captureUncertain);
            }
            throw value;
        }
        if (!current()) return;
        clearPending();
        updateRevision(result.revision); setSnapshot(result); setSourceOffsets([]); setPreview(null); setValid(false); setNotice(s.captured);
        await loadHistory(0, current);
        if (!current()) return;
        const next = await bridge.request({ op: 'sources.read', notebook_id: notebook.id, snapshot_id: result.id, offset: 0 }) as SnapshotSourcePage;
        if (current()) setSources(next);
    }); }
    function read(next: Snapshot, offset: number, direction: 'next' | 'previous' | 'replace' = 'replace') { void action(async current => {
        const previousOffset = sources?.offset ?? 0;
        setSources(null); setSnapshot(next);
        const page = await bridge.request({ op: 'sources.read', notebook_id: notebook.id, snapshot_id: next.id, offset }) as SnapshotSourcePage;
        if (current()) { setSources(page); setSourceOffsets(old => direction === 'next' ? [...old, previousOffset] : direction === 'previous' ? old.slice(0, -1) : []); }
    }); }
    function revoke(source: Source) { void action(async current => {
        const result = await bridge.request({ op: 'sources.revoke', notebook_id: notebook.id, source_id: source.id, expected_revision: revision.current }) as SourceChange;
        if (!current()) return;
        updateRevision(result.revision); setSources(null); setPreview(null); setValid(false); setDocumentEpoch(value => value + 1); setNotice(s.revoked);
    }); }
    function role(source: Source, key: string, value: AttachmentRole['role']) {
        const existing = (spec.attachment_roles ?? []).filter(r => !(sameIdentity(r.identity, source.identity) && r.key === key));
        edit({ attachment_roles: [...existing.map(r => sameIdentity(r.identity, source.identity) && value === 'principal' && r.role === 'principal' ? { ...r, role: 'unassigned' as const } : r), { identity: source.identity, key, role: value }] });
    }
    function sourceRow(source: Source, pending: boolean, state?: string) {
        return <li key={source.id}><div className="source-heading"><strong>{source.title || s.untitled}</strong><span>{state === 'stale' ? s.stale : pending ? s.pending : s.current}</span></div>
            <p className="source-meta">{source.year ?? s.yearMissing} · {source.item_type} · {s.library} {source.identity.library_id} · {source.identity.item_key}</p>
            {!!source.contents?.length && <ul className="source-contents">{source.contents.map(content => <li key={content.key}>
                <span>{s.kinds[content.kind]}: {content.title || content.key}</span>
                {pending && ['pdf', 'text_attachment'].includes(content.kind) ? <label>{s.role}<select disabled={busy || capturePending} value={(spec.attachment_roles ?? []).find(r => sameIdentity(r.identity, source.identity) && r.key === content.key)?.role ?? content.role} onChange={e => role(source, content.key, e.target.value as AttachmentRole['role'])}>
                    <option value="unassigned">{s.unassigned}</option><option value="principal">{s.principal}</option><option value="supplement">{s.supplement}</option>
                </select></label> : <span>{s.roles[content.role]}</span>}
            </li>)}</ul>}
            {pending ? <button disabled={busy || capturePending} type="button" onClick={() => edit({ exclusions: [...(spec.exclusions ?? []), source.identity] })}>{s.exclude}</button>
                : <button disabled={busy || capturePending} type="button" onClick={() => revoke(source)}>{s.revoke}</button>}
        </li>;
    }
    if (!open) return <button className="sources-open" type="button" onClick={openView}>{s.open}</button>;
    return <section className="sources" aria-label={s.title} aria-busy={busy}><h2>{s.title}</h2>
        <p>{s.help}</p><div role="status" className="source-status">{notice}</div>{error && <p role="alert" className="source-error">{t.error}: {error}</p>}
        <fieldset disabled={busy || capturePending}><legend>{s.selection}</legend>
            {(['include_selected_containers', 'include_descendants', 'include_notes', 'include_annotations', 'pdf_only'] as const).map(key => <label className="source-check" key={key}><input type="checkbox" name={key} checked={!!spec[key]} onChange={e => edit({ [key]: e.target.checked })}/>{s[key]}</label>)}
            {(spec.include_notes || spec.include_annotations) && <p className="source-warning">{s.provenance}</p>}
            <div className="source-filters"><label>{s.yearMin}<input name="year_min" inputMode="numeric" value={minimum} onChange={e => { setMinimum(e.target.value); edit({}); }}/></label>
                <label>{s.yearMax}<input name="year_max" inputMode="numeric" value={maximum} onChange={e => { setMaximum(e.target.value); edit({}); }}/></label>
                <label>{s.types}<input name="item_types" value={types} placeholder="journalArticle, book" onChange={e => { setTypes(e.target.value); edit({}); }}/></label>
                <label>{s.tags}<input name="tags" value={tags} onChange={e => { setTags(e.target.value); edit({}); }}/></label>
                <label>{s.tagMode}<select value={spec.tag_mode ?? 'AND'} onChange={e => edit({ tag_mode: e.target.value as 'AND' | 'OR' })}><option value="AND">{s.allTags}</option><option value="OR">{s.anyTag}</option></select></label>
            </div>
            {!!spec.exclusions?.length && <div><p>{s.exclusions}: {spec.exclusions.length}</p><button type="button" onClick={() => edit({ exclusions: [] })}>{s.clearExclusions}</button></div>}
        </fieldset>
        <div className="actions"><button type="button" disabled={busy || capturePending} onClick={() => previewSelection(true)}>{s.preview}</button><button type="button" disabled={busy || capturePending} onClick={() => previewSelection(false)}>{s.refresh}</button></div>
        {preview && <div><h3>{s.previewTitle}: {preview.preview.included_count}</h3><p>{s.added}: {preview.preview.added_count} · {s.dropped}: {preview.preview.dropped_count} · {s.updated}: {preview.preview.changed_count}</p>
            {!valid && !capturePending && <p>{s.previewAgain}</p>}
            {!!preview.preview.possible_duplicate_count && <p className="source-warning">{s.duplicates}: {preview.preview.possible_duplicate_count}</p>}
            <ul className="source-list">{preview.preview.items.map(source => sourceRow(source, true))}</ul>
            {!!(preview.preview.removed_count + preview.unavailable_total) && <p>{s.removed}: {preview.preview.removed_count + preview.unavailable_total}</p>}
            {!!(preview.preview.removed.length + preview.unavailable.length) && <ul>
                {preview.preview.removed.map((row, index) => <li key={`removed-${index}`}>{row.title ?? row.identity.item_key}: {s.reasons[row.reason]}</li>)}
                {preview.unavailable.map((row, index) => <li key={`unavailable-${index}`}>{s.library} {row.identity.library_id} · {row.identity.item_key}: {s.reasons[row.reason]}</li>)}
            </ul>}
            {preview.total > preview.limit && <nav className="actions" aria-label={s.previewTitle}><button disabled={busy || !previewOffsets.length} onClick={() => previewPage(true)}>{t.previous}</button><span>{preview.offset + 1}–{preview.offset + preview.limit} / {preview.total}</span><button disabled={busy || preview.offset + preview.limit >= preview.total} onClick={() => previewPage(false)}>{t.next}</button></nav>}
        </div>}
        <button className="primary" type="button" disabled={busy || !capturePending && (!preview || !valid)} onClick={capture}>{capturePending ? s.retryCapture : s.capture}</button><p className="source-meta">{s.frozen}</p>
        <h3>{s.history}</h3><div className="actions">{history.items.map(row => <button type="button" disabled={busy} key={row.id} aria-pressed={snapshot?.id === row.id} onClick={() => read(row, 0)}>{t.revision} {row.revision} · {row.member_count} · {new Date(row.created_at).toLocaleString(locale)}</button>)}</div>
        {history.total > history.limit && <nav className="actions" aria-label={s.history}><button disabled={busy || !historyOffsets.length} onClick={() => void action(current => loadHistory(historyOffsets.at(-1) ?? 0, current, false, 'previous'))}>{t.previous}</button><button disabled={busy || history.offset + history.limit >= history.total} onClick={() => void action(current => loadHistory(history.offset + history.limit, current, false, 'next'))}>{t.next}</button></nav>}
        {snapshot && <div><h3>{s.members} · {t.revision} {snapshot.revision}</h3>{sources && <><p>{s.accessible}: {sources.total} · {s.unavailable}: {sources.unavailable_count}</p><ul className="source-list">{sources.items.map(row => sourceRow(row.source, false, row.state))}</ul>
            {sources.total > sources.limit && <nav className="actions" aria-label={s.members}><button disabled={busy || !sourceOffsets.length} onClick={() => read(snapshot, sourceOffsets.at(-1) ?? 0, 'previous')}>{t.previous}</button><button disabled={busy || sources.offset + sources.limit >= sources.total} onClick={() => read(snapshot, sources.offset + sources.limit, 'next')}>{t.next}</button></nav>}</>}
            <button type="button" disabled={busy} onClick={() => read(snapshot, sources?.offset ?? 0)}>{s.readAgain}</button></div>}
        <p className="source-meta">{s.external}</p>
        {snapshot && <div hidden={!sources}><Documents key={`${snapshot.id}:${documentEpoch}`} bridge={bridge} notebook_id={notebook.id} snapshot_id={snapshot.id} locale={locale}/></div>}
    </section>;
}
