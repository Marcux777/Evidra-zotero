import { useEffect, useRef, useState } from 'react';
import './research.css';
import type { ArtifactVersion, ProfilePage, ProtocolVersion, ProviderProfile, ResearchControl, ResearchPrepare, ResearchPreview, ResearchRun, ResearchRunPage, SnapshotSourcePage } from '../bridge/types';
import { catalog } from './i18n';
import { Protocol } from './Protocol';
import { Screening } from './Screening';
import { ResearchArtifact } from './ResearchArtifact';
import { NoteOutbox } from './NotePreview';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';

export function Research(props: ResearchScope & { profilesEpoch: number }) {
    const { bridge, notebook_id, snapshot_id, locale, profilesEpoch } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [open, setOpen] = useState(false), [protocol, setProtocol] = useState<ProtocolVersion | null>(null);
    const [sources, setSources] = useState<SnapshotSourcePage | null>(null), [sourceId, setSourceId] = useState('');
    const [profiles, setProfiles] = useState<ProviderProfile[]>([]), [profileId, setProfileId] = useState('');
    const [kind, setKind] = useState<ResearchPrepare['kind']>('SCREENING'), [stage, setStage] = useState<ResearchPrepare['stage']>('TITLE_ABSTRACT');
    const [question, setQuestion] = useState(''), [pasted, setPasted] = useState(''), [query, setQuery] = useState(''), [unreviewed, setUnreviewed] = useState(false);
    const [context, setContext] = useState('32768'), [output, setOutput] = useState('4096');
    const [numCtx, setNumCtx] = useState(''), [temperature, setTemperature] = useState(''), [seed, setSeed] = useState(''), [think, setThink] = useState('');
    const [page, setPage] = useState<ResearchRunPage | null>(null), [run, setRun] = useState<ResearchRun | null>(null);
    const [inspectRequested, setInspectRequested] = useState<string | null>(null);
    const [preview, setPreview] = useState<ResearchPreview | null>(null), [artifact, setArtifact] = useState<ArtifactVersion | null>(null);
    const selected = useRef<ResearchRun | null>(null);
    function clear() { setPreview(null); setArtifact(null); setSources(null); setSourceId(''); }
    const actions = useResearchActions(bridge, clear);
    const provider = profiles.find(p => p.id === profileId), source = sources?.items.find(s => s.source.id === sourceId)?.source ?? null;
    function display(value: ResearchRun) {
        selected.current = value; setRun(value); setPage(old => old && ({ ...old, items: old.items.map(v => v.id === value.id ? value : v) }));
    }
    async function loadSources(offset: number, current: () => boolean) {
        const values = await bridge.request({ op: 'sources.read', ...scope, offset }) as SnapshotSourcePage;
        if (current()) { setSources(values); setSourceId(old => values.items.some(s => s.state === 'current' && s.source.id === old) ? old : values.items.find(s => s.state === 'current')?.source.id ?? ''); }
    }
    async function loadProfiles(current: () => boolean) {
        const values: ProviderProfile[] = [];
        for (let offset = 0; ;) {
            const result = await bridge.request({ op: 'provider.list', offset }) as ProfilePage;
            if (!current()) return; values.push(...result.items.filter(p => p.purpose === 'generation'));
            offset += result.items.length; if (offset >= result.total) break;
            if (!result.items.length) throw new Error('INVALID_PROVIDER_PAGE');
        }
        setProfiles(values); setProfileId(old => values.some(p => p.id === old) ? old : values[0]?.id ?? '');
    }
    async function loadRuns(offset: number, current: () => boolean) {
        const result = await bridge.request({ op: 'research.runs', ...scope, offset }) as ResearchRunPage;
        if (current()) setPage(result);
    }
    useEffect(() => { if (open) actions.read(async current => { await loadProfiles(current); if (current()) await loadSources(0, current); if (current()) await loadRuns(0, current); }); }, [open, profilesEpoch]);
    function inspect(value: ResearchRun) {
        display(value); setPreview(null); setArtifact(null);
        actions.read(async current => {
            const latest = await bridge.request({ op: 'research.run', ...scope, run_id: value.id }) as ResearchRun;
            if (!current()) return; display(latest);
            const next = await bridge.request({ op: 'research.preview', ...scope, run_id: value.id }) as ResearchPreview;
            if (!current()) return; setPreview(next);
            if (latest.artifact_version_id) {
                const result = await bridge.request({ op: 'research.artifact', ...scope, version_id: latest.artifact_version_id }) as ArtifactVersion;
                if (current()) setArtifact(result);
            }
        }, true);
    }
    // A newly prepared run is read only after the write receipt completed. No model
    // starts until the exact persisted preparation has been displayed.
    useEffect(() => {
        if (inspectRequested && run?.id === inspectRequested) { setInspectRequested(null); inspect(run); }
    }, [inspectRequested]);
    useEffect(() => {
        if (!open) return;
        const timer = setInterval(() => {
            const value = selected.current;
            if (!value || value.state !== 'RUNNING') return;
            actions.read(async current => {
                const next = await bridge.request({ op: 'research.run', ...scope, run_id: value.id }) as ResearchRun;
                if (!current() || selected.current?.id !== value.id) return; display(next);
                if (next.artifact_version_id && preview) {
                    const result = await bridge.request({ op: 'research.artifact', ...scope, version_id: next.artifact_version_id }) as ArtifactVersion;
                    if (current()) setArtifact(result);
                }
            });
        }, 1500);
        return () => clearInterval(timer);
    }, [open, preview]);
    const numberValid = (value: string, min: number, max: number, integer = true) => !!value.trim() && Number.isFinite(Number(value)) && (!integer || Number.isInteger(Number(value))) && Number(value) >= min && Number(value) <= max;
    const valid = !!protocol && !!provider && !!question.trim() && (kind !== 'SCREENING' || !!source)
        && (kind !== 'AUDIT' || pasted.trim() && query.trim()) && numberValid(context, 1024, 1000000) && numberValid(output, 1, 32768)
        && (provider.adapter !== 'ollama' || (!numCtx || numberValid(numCtx, 1, 1000000)) && (!temperature || numberValid(temperature, 0, 2, false)) && (!seed || numberValid(seed, -2147483648, 2147483647)));
    function prepare() {
        if (!valid || !protocol) return;
        actions.write({ op: 'research.prepare', ...scope, request: { kind, protocol_version_id: protocol.id, profile_id: profileId,
            source_id: kind === 'SCREENING' ? sourceId : null, stage: kind === 'SCREENING' ? stage : null, question,
            pasted_text: kind === 'AUDIT' ? pasted : '', retrieval_query: kind === 'AUDIT' ? query : '', include_unreviewed: kind === 'SYNTHESIS' && unreviewed,
            context_tokens: Number(context), max_output_tokens: Number(output), idempotency_key: researchKey(),
            ollama_options: provider?.adapter === 'ollama' ? { num_ctx: numCtx ? Number(numCtx) : null, temperature: temperature ? Number(temperature) : null,
                seed: seed ? Number(seed) : null, think: think ? think === 'on' : null } : null,
        } }, value => { setPreview(null); setArtifact(null); display(value); setInspectRequested(value.id); });
    }
    function control(action: ResearchControl['action']) {
        if (run) actions.write({ op: 'research.control', ...scope, run_id: run.id,
            request: { action, expected_revision: run.revision, idempotency_key: researchKey() } }, display, action === 'cancel');
    }
    return <section className="research" aria-label={t.title}>{!open ? <button type="button" onClick={() => setOpen(true)}>{t.open}</button> : <>
        <h2>{t.title}</h2><ResearchFeedback actions={actions} locale={locale}/>
        <Protocol {...props} onSelect={value => { setProtocol(value); if (!question && value) setQuestion(value.question); }}/>
        <fieldset disabled={actions.locked}><legend>{t.source}</legend><label>{t.source}<select value={sourceId} onChange={e => setSourceId(e.target.value)}>
            {sources?.items.filter(v => v.state === 'current').map(({ source: s }) => <option key={s.id} value={s.id}>{s.title} · {s.identity.library_id}/{s.identity.item_key}</option>)}</select></label>
            {!source && <p>{t.noSources}</p>}<div className="actions"><button type="button" onClick={() => actions.read(c => loadSources(sources?.offset ?? 0, c))}>{t.refresh}</button>
                <button type="button" disabled={!sources || sources.offset === 0} onClick={() => actions.read(c => loadSources(Math.max(0, sources!.offset - 50), c))}>{t.previous}</button>
                <button type="button" disabled={!sources || sources.offset + sources.limit >= sources.total} onClick={() => actions.read(c => loadSources(sources!.offset + sources!.limit, c))}>{t.next}</button></div>
        </fieldset>
        {protocol ? <Screening key={protocol.id} {...props} protocol={protocol} source={source}/> : <p>{t.noProtocol}</p>}
        <fieldset disabled={actions.locked}><legend>{t.prepare}</legend>
            <label>{t.kind}<select value={kind} onChange={e => setKind(e.target.value as typeof kind)}>{(['SCREENING', 'SYNTHESIS', 'AUDIT'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
            {kind === 'SCREENING' && <label>{t.stage}<select value={stage ?? 'TITLE_ABSTRACT'} onChange={e => setStage(e.target.value as typeof stage)}>{(['TITLE_ABSTRACT', 'FULL_TEXT'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>}
            <label>{t.question}<textarea maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)}/></label>
            {kind === 'AUDIT' && <><label>{t.pasted}<textarea maxLength={12000} value={pasted} onChange={e => setPasted(e.target.value)}/></label><label>{t.query}<textarea maxLength={2000} value={query} onChange={e => setQuery(e.target.value)}/></label></>}
            {kind === 'SYNTHESIS' && <label><input type="checkbox" checked={unreviewed} onChange={e => setUnreviewed(e.target.checked)}/>{t.unreviewed}</label>}
            <label>{t.provider}<select value={profileId} onChange={e => setProfileId(e.target.value)}>{profiles.map(p => <option key={p.id} value={p.id}>{p.id} · {p.model} · {p.mode}</option>)}</select></label>{!profiles.length && <p>{t.noProfile}</p>}
            <label>{t.context}<input type="number" min={1024} max={1000000} value={context} onChange={e => setContext(e.target.value)}/></label>
            <label>{t.output}<input type="number" min={1} max={32768} value={output} onChange={e => setOutput(e.target.value)}/></label>
            {provider?.adapter === 'ollama' && <details><summary>Ollama</summary>
                <label>{t.numCtx}<input type="number" min={1} value={numCtx} onChange={e => setNumCtx(e.target.value)} placeholder={t.default}/></label>
                <label>{t.temperature}<input type="number" min={0} max={2} step="any" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder={t.default}/></label>
                <label>{t.seed}<input type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder={t.default}/></label>
                <label>{t.think}<select value={think} onChange={e => setThink(e.target.value)}><option value="">{t.default}</option><option value="on">{t.on}</option><option value="off">{t.off}</option></select></label>
            </details>}
        </fieldset><button type="button" className="primary" disabled={actions.locked || !valid} onClick={prepare}>{t.prepare}</button>
        <h3>{t.runs}</h3><button type="button" disabled={actions.locked} onClick={() => actions.read(c => loadRuns(page?.offset ?? 0, c))}>{t.refresh}</button>
        <ul className="research-list">{page?.items.map(value => <li key={value.id}><button type="button" disabled={actions.locked} aria-current={run?.id === value.id ? 'true' : undefined} onClick={() => inspect(value)}>{t[value.kind]} · {t[value.state]} · {new Date(value.created_at).toLocaleString(locale)}</button></li>)}</ul>
        {page && <nav className="actions" aria-label={t.runs}><button type="button" disabled={actions.locked || page.offset === 0} onClick={() => actions.read(c => loadRuns(Math.max(0, page.offset - 20), c))}>{t.previous}</button>
            <button type="button" disabled={actions.locked || page.offset + page.limit >= page.total} onClick={() => actions.read(c => loadRuns(page.offset + page.limit, c))}>{t.next}</button></nav>}
        {run && <section aria-label={t.preview}><h3>{t[run.kind]} · {t[run.state]}</h3><p role="status">{t[run.state]} {run.reason}</p>
            {preview && <><p>{preview.profile.model} · {preview.profile.mode} · {t.context}: {preview.request.context_tokens} · {t.output}: {preview.request.max_output_tokens}</p>
                <p>{t.estimate}: {preview.estimated_input_tokens} · {t.version} {preview.inputs.protocol.revision}</p>
                <p>{preview.inputs.coverage.complete ? t.complete : t.partial} · {t.reviewed}: {preview.inputs.coverage.reviewed_cells} · {t.unreviewedCount}: {preview.inputs.coverage.unreviewed_cells}</p>
                <details><summary>{t.prompt}</summary><pre>{preview.prompt}</pre></details><details><summary>{t.system}</summary><pre>{preview.schema_plan.system}</pre></details>
                <details><summary>{t.schema}</summary><pre>{JSON.stringify(preview.schema_plan.output_schema, null, 2)}</pre></details></>}
            <div className="actions"><button type="button" disabled={actions.locked || !preview || !['PREPARED', 'PAUSED', 'WAITING_PROVIDER'].includes(run.state)} onClick={() => control('start')}>{t.start}</button>
                <button type="button" disabled={actions.uncertain || ['COMPLETE', 'PARTIAL', 'FAILED', 'CANCELLED'].includes(run.state)} onClick={() => control('cancel')}>{t.cancel}</button></div>
            {run.state === 'BILLING_UNKNOWN' && <><p>{t.acknowledgeHelp}</p><button type="button" disabled={actions.locked} onClick={() => control('acknowledge_uncertain')}>{t.acknowledge}</button></>}
        </section>}
        {artifact && preview && <ResearchArtifact key={artifact.id} {...props} artifact={artifact} preview={preview} onChange={setArtifact}/>}
        <NoteOutbox {...props}/>
    </>}</section>;
}
