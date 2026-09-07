import { useEffect, useState } from 'react';
import type { Evidence, ExportCommand, ImportedNotebook, ImportedRecord, ImportedRecordDetail, ImportedRecordPage, ImportPage, ImportVisibility, Locale } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, useResearchActions, type ResearchScope } from './research-actions';
import { ValueDisplay } from './MatrixValue';

type Reference = Extract<ExportCommand, { op: 'imports.reference' }>['request'];
/** Readable, inert field lists retain every original field, with bounded array pages. */
function Fields({ value, locale }: { value: unknown; locale: Locale }) {
    const [offset, setOffset] = useState(0), t = catalog(locale);
    if (value === null || value === undefined) return <span>{t.exports.missing}</span>;
    if (Array.isArray(value)) return <><ol start={offset + 1}>{value.slice(offset, offset + 20).map((item, i) => <li key={offset + i}><Fields value={item} locale={locale}/></li>)}</ol>{value.length > 20 && <><button type="button" disabled={!offset} onClick={() => setOffset(old => old - 20)}>{t.previous}</button><span>{offset + 1}–{Math.min(offset + 20, value.length)} / {value.length}</span><button type="button" disabled={offset + 20 >= value.length} onClick={() => setOffset(old => old + 20)}>{t.next}</button></>}</>;
    if (typeof value === 'object') return <dl>{Object.entries(value).map(([key, item]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd><Fields value={item} locale={locale}/></dd></div>)}</dl>;
    return <span className="matrix-value">{String(value)}</span>;
}
function EvidenceView({ evidence, locale, open, disabled }: { evidence: Evidence; locale: Locale; open: () => void; disabled: boolean }) {
    const e = catalog(locale).exports;
    return <div><blockquote>{evidence.excerpt}</blockquote><p>{evidence.source_identity.profile_instance_id} / {evidence.source_identity.library_id} / {evidence.source_identity.item_key} · {evidence.content_key} · {evidence.document_version_id} · {evidence.page_index ?? '—'} · {evidence.start}–{evidence.end}</p><button type="button" disabled={disabled} onClick={open}>{e.openEvidence}</button></div>;
}
function RecordView({ record, locale, reference, open, disabled }: { record: ImportedRecord; locale: Locale; reference: (value: Reference) => void; open: (id: string, group: string) => void; disabled: boolean }) {
    const e = catalog(locale).exports;
    const link = (kind: Reference['kind'], identity: string) => <button type="button" disabled={disabled} onClick={() => reference({ kind, identity, origin_group_id: record.origin_group_id! })}>{e.kinds[kind]} · {identity}</button>;
    return <article><h4>{e.kinds[record.kind]}</h4><p><strong>{e.imported}</strong> · {record.original_record_id ?? record.id}</p><p>{e.originalProfile}: {record.origin_profile_id} · {record.origin_notebook_id} · {record.imported_at}</p><p>{e.noLocalApproval}</p>
        {record.kind === 'decision' ? <><p>{e.originalAuthor}: {record.data.author} · {record.data.created_at} · {e.originalReview}: {record.data.action}</p><p>{record.data.rationale}</p><h5>{e.priorValue}</h5><ValueDisplay value={record.data.old.value} locale={locale}/><p>{record.data.old.value_state} · {record.data.old.review_state}</p><h5>{e.newValue}</h5><ValueDisplay value={record.data.new.value} locale={locale}/><p>{record.data.new.value_state} · {record.data.new.review_state} · {e.version}: {record.data.new.revision} · {e.field}: {record.data.new.field_key}</p>{link('proposal', record.data.proposal_id)}{link('form', record.data.new.decision_form_version_id ?? record.data.new.form_version_id)}</>
        : record.kind === 'proposal' ? <><p>{record.data.field_key} · {record.data.value_state} · {e.originalReview}: {record.data.review_state} · {record.data.origin} · {record.data.declared_model ?? record.data.model}</p><ValueDisplay value={record.data.value} locale={locale}/><p>{record.data.rationale}</p>{link('form', record.data.form_version_id)}{record.data.evidence_ids.map(id => <span key={id}>{link('evidence', id)}</span>)}</>
        : record.kind === 'evidence' ? <EvidenceView evidence={record.data} locale={locale} disabled={disabled} open={() => open(record.data.id, record.origin_group_id!)}/>
        : record.kind === 'form' ? <><h5>{record.data.name} · {e.version}: {record.data.revision}</h5>{record.data.fields.map(field => <section key={field.key}><h5>{field.key} · {field.label}</h5><p>{field.question}</p><p>{field.kind} · {e.unit}: {field.unit ?? e.missing}</p><Fields value={field} locale={locale}/></section>)}</>
        : record.kind === 'protocol' ? <><h5>{e.question}: {record.data.question}</h5><p>{record.data.objective}</p><p>{e.version}: {record.data.revision} · {record.data.review_type} · {record.data.author}</p>{link('form', record.data.form_version_id)}<Fields value={record.data.criteria} locale={locale}/></>
        : record.kind === 'external_note' ? <><p>{record.data.origin} · {record.data.declared_model} · {e.originalReview}: {record.data.review_state} · {record.data.author} · {record.data.created_at}</p><p className="matrix-value">{record.data.text}</p>{record.data.evidence.map(item => <EvidenceView key={item.id} evidence={item} locale={locale} disabled={disabled} open={() => open(item.id, record.origin_group_id!)}/>)}</>
        : <Fields value={record.data} locale={locale}/>}
    </article>;
}
export function ImportedHistory({ bridge, notebook_id, snapshot_id, locale }: ResearchScope) {
    const scope = { notebook_id, snapshot_id }, t = catalog(locale), e = t.exports;
    const [imports, setImports] = useState<ImportPage | null>(null), [selected, setSelected] = useState<ImportedNotebook | null>(null), [page, setPage] = useState<ImportedRecordPage | null>(null), [detail, setDetail] = useState<ImportedRecord | null>(null), [linked, setLinked] = useState<ImportedRecord | null>(null), [offsets, setOffsets] = useState<number[]>([]);
    const actions = useResearchActions(bridge, () => { setPage(null); setDetail(null); setLinked(null); });
    function list(offset = 0) { actions.read(async current => { const value = await bridge.request({ op: 'imports.list', ...scope, offset }) as ImportPage; if (current()) { setImports(value); setPage(null); setDetail(null); setLinked(null); } }); }
    useEffect(() => { list(); }, []);
    useEffect(() => { if (!selected) return; const timer = setInterval(() => {
        actions.read(async current => { const value = await bridge.request({ op: 'imports.status', ...scope, import_id: selected.id }) as ImportVisibility; if (current() && !value.visible) { setPage(null); setDetail(null); setLinked(null); } });
    }, 10000); return () => clearInterval(timer); }, [selected]);
    function records(item: ImportedNotebook, offset: number, previous = false) { actions.read(async current => {
        const value = await bridge.request({ op: 'imports.records', ...scope, import_id: item.id, offset }) as ImportedRecordPage;
        if (current()) { setOffsets(old => item.id !== selected?.id ? [] : previous ? old.slice(0, -1) : page ? [...old, page.offset] : []); setSelected(item); setPage(value); setDetail(null); setLinked(null); }
    }); }
    function reference(request: Reference) { if (!selected) return; actions.read(async current => {
        const value = await bridge.request({ op: 'imports.reference', ...scope, import_id: selected.id, request }) as ImportedRecordDetail; if (current()) setLinked(value.record);
    }); }
    function inspect(record: ImportedRecord) { if (!selected) return; actions.read(async current => {
        const visible = await bridge.request({ op: 'imports.status', ...scope, import_id: selected.id }) as ImportVisibility;
        if (!visible.visible) throw new Error('SOURCE_REVOKED');
        if (current()) { setDetail(record); setLinked(null); }
    }); }
    function open(evidence_id: string, origin_group_id: string) { if (selected) actions.read(async () => { await bridge.request({ op: 'imports.open', ...scope, import_id: selected.id, request: { evidence_id, origin_group_id } }); }); }
    return <section aria-label={e.history}><h3>{e.history}</h3><p>{e.historyHelp}</p><ResearchFeedback actions={actions} locale={locale}/><button type="button" disabled={actions.locked} onClick={() => list()}>{e.refresh}</button>
        {!imports?.total && <p>{e.empty}</p>}<ul>{imports?.items.map(item => <li key={item.id}>{item.name} · {e.imported} · {new Date(item.imported_at).toLocaleString(locale)}<button type="button" disabled={actions.locked} onClick={() => records(item, 0)}>{e.view}</button></li>)}</ul>
        {imports && imports.total > imports.limit && <><button type="button" disabled={actions.locked || !imports.offset} onClick={() => list(Math.max(0, imports.offset - 20))}>{t.previous}</button><button type="button" disabled={actions.locked || imports.offset + imports.limit >= imports.total} onClick={() => list(imports.offset + imports.limit)}>{t.next}</button></>}
        {page && selected && <><p>{e.records}: {page.total} · {e.omitted}: {page.omitted_records}</p><ul>{page.items.map(record => <li key={record.id}>{e.kinds[record.kind]} · {record.original_record_id}<button type="button" disabled={actions.locked} onClick={() => inspect(record)}>{e.inspect}</button></li>)}</ul><button type="button" disabled={actions.locked || !offsets.length} onClick={() => records(selected, offsets.at(-1)!, true)}>{t.previous}</button><button type="button" disabled={actions.locked || page.offset + page.limit >= page.total} onClick={() => records(selected, page.offset + page.limit)}>{t.next}</button></>}
        {detail && <RecordView key={detail.id} record={detail} locale={locale} reference={reference} open={open} disabled={actions.locked}/>}{linked && <RecordView key={linked.id} record={linked} locale={locale} reference={reference} open={open} disabled={actions.locked}/>}
    </section>;
}
