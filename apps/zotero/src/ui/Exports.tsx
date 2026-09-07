import { useState } from 'react';
import type { ExportArtifact, ExportOptions, ExportPreview, SnapshotSourcePage, Source } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';
import { ImportBackup } from './ImportBackup';
import { ImportedHistory } from './ImportedHistory';
import './research.css';

export const exportConfirmed = new Set(['INVALID_BACKUP', 'SCOPE_DENIED', 'EXPORT_CHECKSUM_MISMATCH', 'EXPORT_TRANSFER_INVALID', 'EXPORT_NOT_CREATED', 'IMPORT_FILE_CHANGED', 'IMPORT_TRANSFER_INVALID']);
export function Exports(props: ResearchScope) {
    const { bridge, notebook_id, snapshot_id, locale } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale), e = t.exports;
    const [open, setOpen] = useState(false), [format, setFormat] = useState<ExportOptions['format']>('json');
    const [excel, setExcel] = useState(false), [pdfs, setPdfs] = useState(false), [selected, setSelected] = useState<Source[]>([]);
    const [sources, setSources] = useState<SnapshotSourcePage | null>(null), [offsets, setOffsets] = useState<number[]>([]);
    const [preview, setPreview] = useState<ExportPreview | null>(null), [artifact, setArtifact] = useState<ExportArtifact | null>(null), [saved, setSaved] = useState(false), [historyEpoch, setHistoryEpoch] = useState(0);
    const actions = useResearchActions(bridge, () => { setPreview(null); setArtifact(null); setSaved(false); setSources(null); setSelected([]); }, exportConfirmed);
    const bibliography = ['bibtex', 'ris', 'csl_json'].includes(format), prepared = !!preview;
    function page(offset: number, previous = false) { actions.read(async current => {
        const value = await bridge.request({ op: 'sources.read', ...scope, offset }) as SnapshotSourcePage;
        if (current()) { setOffsets(old => previous ? old.slice(0, -1) : sources ? [...old, sources.offset] : []); setSources(value); }
    }); }
    return <section className="research" aria-label={e.title}>{!open ? <button type="button" onClick={() => { setOpen(true); page(0); }}>{e.open}</button> : <>
        <h2>{e.title}</h2><p>{e.permission}</p><p>{e.sensitive}</p><ResearchFeedback actions={actions} locale={locale}/>
        <fieldset disabled={actions.locked || prepared}><legend>{e.format}</legend><label>{e.format}<select name="export_format" value={format} onChange={event => setFormat(event.target.value as ExportOptions['format'])}>{Object.entries(e.formats).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            {format.startsWith('csv_') && <><label><input type="checkbox" checked={excel} onChange={event => setExcel(event.target.checked)}/>{e.excel}</label><p>{e.csvHelp}</p></>}
            {format === 'backup' && <><label><input name="export_pdfs" type="checkbox" checked={pdfs} onChange={event => setPdfs(event.target.checked)}/>{e.pdfs}</label><p>{e.pdfHelp}</p></>}
            {bibliography && <><p>{e.nativeScope}</p><p>{e.selectStudies} · {e.selected}: {selected.length}</p><ul>{sources?.items.map(({ source }) => <li key={source.id}><label><input type="checkbox" checked={selected.some(s => s.id === source.id)} disabled={selected.length >= 100 && !selected.some(s => s.id === source.id)} onChange={event => setSelected(old => event.target.checked ? [...old, source] : old.filter(s => s.id !== source.id))}/>{source.title || source.identity.item_key} · {source.identity.profile_instance_id} / {source.identity.library_id} / {source.identity.item_key}</label></li>)}</ul>
                <button type="button" disabled={!offsets.length} onClick={() => page(offsets.at(-1)!, true)}>{t.previous}</button><button type="button" disabled={!sources || sources.offset + sources.limit >= sources.total} onClick={() => page(sources!.offset + sources!.limit)}>{t.next}</button></>}
        </fieldset>
        <button type="button" disabled={actions.locked || prepared || bibliography && !selected.length} onClick={() => actions.read(async current => {
            const value = await bridge.request({ op: 'exports.preview', ...scope, request: { format, excel: format.startsWith('csv_') && excel, include_pdfs: format === 'backup' && pdfs, source_ids: bibliography ? selected.map(s => s.id) : [] } }) as ExportPreview;
            if (current()) { setPreview(value); setArtifact(null); setSaved(false); }
        })}>{e.preview}</button>
        {preview && <div><h3>{e.previewTitle}</h3><p>{e.formats[preview.format]} · {e.bytes}: {preview.bytes} · {e.pdfBytes}: {preview.pdf_bytes} · {e.records}: {preview.records} · {e.omitted}: {preview.omitted_records}</p><p>{e.estimate}</p>
            <ul>{Object.entries(preview.counts).map(([kind, count]) => <li key={kind}>{e.kinds[kind as keyof typeof e.kinds] ?? kind}: {count}</li>)}</ul>
            <ul>{preview.bibliography?.map(s => <li key={s.id}>{s.title} · {s.identity.profile_instance_id} / {s.identity.library_id} / {s.identity.item_key}{preview.incomplete_sources?.includes(s.id) && <strong> · {e.incomplete}</strong>}</li>)}</ul>
            <button type="button" disabled={actions.locked || !!artifact} onClick={() => actions.write({ op: 'exports.create', ...scope, request: { preview_id: preview.id, idempotency_key: researchKey() } }, value => setArtifact(value))}>{e.create}</button>
            <button type="button" disabled={actions.locked} onClick={() => actions.write({ op: 'exports.discard', ...scope, transfer_id: preview.id }, () => { setPreview(null); setArtifact(null); setSaved(false); })}>{e.discard}</button>
        </div>}
        {artifact && <div><h3>{e.artifact}</h3><p>{artifact.filename} · {artifact.bytes} · SHA-256: {artifact.sha256}</p><button type="button" disabled={actions.locked || saved} onClick={() => actions.write({ op: 'exports.save', ...scope, artifact_id: artifact.id }, value => setSaved(!!value?.saved))}>{e.save}</button>{saved && <p role="status">{e.saved}</p>}</div>}
        <ImportBackup {...props} onImported={() => setHistoryEpoch(old => old + 1)}/><ImportedHistory key={historyEpoch} {...props}/>
    </>}</section>;
}
