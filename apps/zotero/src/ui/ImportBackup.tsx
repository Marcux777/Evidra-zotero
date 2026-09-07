import { useEffect, useRef, useState } from 'react';
import type { ExportCommand, ImportMappingState, ImportPreview, ImportSourcePage, SnapshotSourcePage, Source, SourceAccess } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';

const confirmed = new Set(['INVALID_BACKUP', 'SCOPE_DENIED', 'IMPORT_FILE_CHANGED', 'IMPORT_TRANSFER_INVALID']);
type MapCommand = Extract<ExportCommand, { op: 'imports.map' }>;
export function ImportBackup({ bridge, notebook_id, snapshot_id, locale, onImported }: ResearchScope & { onImported: () => void }) {
    const scope = { notebook_id, snapshot_id }, t = catalog(locale), e = t.exports;
    const [preview, setPreview] = useState<ImportPreview | null>(null), [originals, setOriginals] = useState<ImportSourcePage | null>(null), [targets, setTargets] = useState<SnapshotSourcePage | null>(null);
    const [originalOffsets, setOriginalOffsets] = useState<number[]>([]), [targetOffsets, setTargetOffsets] = useState<number[]>([]);
    const [source, setSource] = useState<SourceAccess | null>(null), [target, setTarget] = useState<Source | null>(null), [contents, setContents] = useState<Record<string, string>>({});
    const [mapping, setMapping] = useState<ImportMappingState | null>(null), [completed, setCompleted] = useState<Set<string>>(new Set()), [reviewed, setReviewed] = useState(false), [staging, setStaging] = useState(false), [imported, setImported] = useState(false), [contentOffset, setContentOffset] = useState(0);
    const queue = useRef<MapCommand[]>([]), revision = useRef(0);
    function clear() { queue.current = []; setPreview(null); setOriginals(null); setTargets(null); setSource(null); setTarget(null); setContents({}); setCompleted(new Set()); setMapping(null); setReviewed(false); setStaging(false); setImported(false); }
    const actions = useResearchActions(bridge, clear, confirmed);
    useEffect(() => {
        if (!staging || actions.busy || actions.uncertain) return;
        if (actions.error) { queue.current = []; setStaging(false); return; }
        const command = queue.current[0];
        if (!command) { setStaging(false); return; }
        command.request.expected_revision = revision.current;
        actions.write(command, (value: ImportMappingState) => { revision.current = value.revision; setMapping(value); queue.current.shift();
            if (command.request.final) { setCompleted(old => new Set([...old, command.request.original.profile_instance_id + ':' + command.request.original.library_id + ':' + command.request.original.item_key])); setSource(null); setTarget(null); }
        });
    }, [staging, actions.busy, actions.uncertain, actions.error, mapping]);
    function originalPage(offset: number, previous = false) { if (!preview) return; actions.read(async current => {
        const page = await bridge.request({ op: 'imports.sources', ...scope, preview_id: preview.id, offset }) as ImportSourcePage;
        if (current()) { setOriginalOffsets(old => previous ? old.slice(0, -1) : originals ? [...old, originals.offset] : []); setOriginals(page); setSource(null); }
    }); }
    function targetPage(offset: number, previous = false) { actions.read(async current => {
        const page = await bridge.request({ op: 'sources.read', ...scope, offset }) as SnapshotSourcePage;
        if (current()) { setTargetOffsets(old => previous ? old.slice(0, -1) : targets ? [...old, targets.offset] : []); setTargets(page); }
    }); }
    function chooseTarget(next: Source) { setTarget(next); setContentOffset(0); setContents(Object.fromEntries((source?.contents ?? []).map(c => [c.key, next.contents?.some(x => x.key === c.key && x.kind === c.kind) ? c.key : '']))); }
    function stage() {
        if (!preview || !source || !target || actions.locked || staging) return;
        const pairs = source.contents.map(c => ({ original_key: c.key, target_key: contents[c.key]!, kind: c.kind }));
        queue.current = [];
        for (let offset = 0; offset < Math.max(1, pairs.length);) {
            const command: MapCommand = { op: 'imports.map', ...scope, preview_id: preview.id,
                request: { original: source.identity, target: target.identity, contents: pairs.slice(offset, offset + 50), offset, final: false, expected_revision: 0, idempotency_key: researchKey() } };
            while (new TextEncoder().encode(JSON.stringify(command.request)).byteLength > 60000 && command.request.contents.length > 1) command.request.contents.pop();
            offset += Math.max(1, command.request.contents.length); command.request.final = offset >= pairs.length;
            queue.current.push(command);
        }
        setStaging(true); setReviewed(false);
    }
    const locked = actions.locked || staging;
    return <section aria-label={e.importTitle}><h3>{e.importTitle}</h3><p>{e.importWarning}</p><ResearchFeedback actions={actions} locale={locale}/>
        <button type="button" disabled={locked || !!preview} onClick={() => actions.read(async current => {
            const value = await bridge.request({ op: 'imports.choose', ...scope }) as ImportPreview | null;
            if (current() && value) { setPreview(value); revision.current = value.mapping_revision ?? 0; setMapping({ revision: revision.current, mapped_sources: 0, total_sources: value.source_count });
                const page = await bridge.request({ op: 'imports.sources', ...scope, preview_id: value.id, offset: 0 }) as ImportSourcePage;
                const destination = await bridge.request({ op: 'sources.read', ...scope, offset: 0 }) as SnapshotSourcePage;
                if (current()) { setOriginals(page); setTargets(destination); setOriginalOffsets([]); setTargetOffsets([]); }
            }
        })}>{e.choose}</button>
        {preview && <><p>{preview.name} · {e.originalProfile}: {preview.profile_instance_id} · {e.records}: {preview.records} · {e.pdfBytes}: {preview.pdf_bytes}</p><p>{e.mappingHelp}</p>
            <fieldset disabled={locked}><legend>{e.originalSource}</legend><ul>{originals?.items.map(row => { const key = `${row.identity.profile_instance_id}:${row.identity.library_id}:${row.identity.item_key}`; return <li key={key}><button type="button" disabled={completed.has(key)} onClick={() => { setSource(row); setTarget(null); setContents({}); setReviewed(false); }}>{key}{completed.has(key) ? ` · ${e.mapping}` : ''}</button></li>; })}</ul>
                <button type="button" disabled={!originalOffsets.length} onClick={() => originalPage(originalOffsets.at(-1)!, true)}>{t.previous}</button><button type="button" disabled={!originals || originals.offset + originals.limit >= originals.total} onClick={() => originalPage(originals!.offset + originals!.limit)}>{t.next}</button>
            </fieldset>
            {source && <fieldset disabled={locked}><legend>{e.originalSource}: {source.identity.profile_instance_id} / {source.identity.library_id} / {source.identity.item_key}</legend><p>{e.targetSource}</p>
                <ul>{targets?.items.map(({ source: row }) => <li key={row.id}><button type="button" aria-pressed={target?.id === row.id} onClick={() => chooseTarget(row)}>{row.title} · {row.identity.profile_instance_id} / {row.identity.library_id} / {row.identity.item_key}</button></li>)}</ul>
                <button type="button" disabled={!targetOffsets.length} onClick={() => targetPage(targetOffsets.at(-1)!, true)}>{t.previous}</button><button type="button" disabled={!targets || targets.offset + targets.limit >= targets.total} onClick={() => targetPage(targets!.offset + targets!.limit)}>{t.next}</button>
                {target && <><p>{e.targetSource}: {target.identity.profile_instance_id} / {target.identity.library_id} / {target.identity.item_key}</p>{source.contents.slice(contentOffset, contentOffset + 20).map(c => <label key={c.key}>{c.kind} / {c.key}<select value={contents[c.key] ?? ''} onChange={event => setContents(old => ({ ...old, [c.key]: event.target.value }))}><option value="">{e.unmapped}</option>{target.contents?.filter(x => x.kind === c.kind).map(x => <option key={x.key} value={x.key}>{x.kind} / {x.key}</option>)}</select></label>)}
                    <button type="button" disabled={!contentOffset} onClick={() => setContentOffset(old => Math.max(0, old - 20))}>{t.previous}</button><button type="button" disabled={contentOffset + 20 >= source.contents.length} onClick={() => setContentOffset(old => old + 20)}>{t.next}</button>
                    <button type="button" disabled={source.contents.some(c => !contents[c.key]) || new Set(Object.values(contents)).size !== source.contents.length} onClick={stage}>{e.mapping}</button></>}
            </fieldset>}
            {staging && <p role="status">{e.mappingProgress}</p>}<p>{e.mapping}: {mapping?.mapped_sources ?? 0} / {preview.source_count}</p>
            <label><input type="checkbox" checked={reviewed} disabled={locked || mapping?.mapped_sources !== preview.source_count} onChange={event => setReviewed(event.target.checked)}/>{e.confirm}</label>
            <button type="button" disabled={locked || imported || !reviewed || mapping?.mapped_sources !== preview.source_count} onClick={() => actions.write({ op: 'imports.commit', ...scope, request: { preview_id: preview.id, confirmed: true, expected_mapping_revision: revision.current, idempotency_key: researchKey() } }, () => { setImported(true); onImported(); })}>{e.restore}</button>{imported && <p role="status">{e.imported}</p>}
            <button type="button" disabled={locked} onClick={() => actions.write({ op: 'exports.discard', ...scope, transfer_id: preview.id }, clear)}>{e.discard}</button>
        </>}
    </section>;
}
