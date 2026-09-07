import { useEffect, useRef, useState } from 'react';
import type { BatchPreview, FormPage, FormVersion, JobCommand, JobControl, JobPage, JobRecord, JobWrite, Locale, ProfilePage, ProviderProfile, UiBridge, UnitPage, UnitRecord } from '../bridge/types';
import { catalog } from './i18n';
import { WindowedList } from './WindowedList';

const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
const invalidates = new Set(['SCOPE_STALE', 'SOURCE_REVOKED', 'DOCUMENT_STALE', 'MISSING_FILE', 'FORBIDDEN', 'NOT_FOUND', 'BRIDGE_EXPIRED', 'UNAUTHENTICATED']);
const confirmed = new Set([...invalidates, 'REVISION_CONFLICT', 'IDEMPOTENCY_CONFLICT', 'INVALID_REQUEST', 'INVALID_OUTPUT', 'CONTEXT_LIMIT', 'QUEUE_LIMIT', 'BODY_TOO_LARGE', 'INVALID_UI_MESSAGE', 'INVALID_ENGINE_ROUTE', 'BILLING_UNKNOWN', 'RUN_BUSY', 'PROVIDER_PAUSED', 'API_BLOCKED', 'CONSENT_REQUIRED', 'CAPABILITY_UNSUPPORTED']);

export function Jobs({ bridge, notebook_id, snapshot_id, locale, profilesEpoch }: {
    bridge: UiBridge; notebook_id: string; snapshot_id: string; locale: Locale; profilesEpoch: number;
}) {
    const t = catalog(locale).jobs, scope = { notebook_id, snapshot_id };
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [uncertain, setUncertain] = useState(false), [form, setForm] = useState<FormVersion | null>(null), [profiles, setProfiles] = useState<ProviderProfile[]>([]);
    const [fields, setFields] = useState<string[]>([]), [profileId, setProfileId] = useState(''), [method, setMethod] = useState<JobWrite['method']>('FULL_SCAN');
    const [maxChunks, setMaxChunks] = useState('500'), [context, setContext] = useState('32768'), [output, setOutput] = useState('2048'), [force, setForce] = useState(false);
    const [numCtx, setNumCtx] = useState(''), [temperature, setTemperature] = useState(''), [seed, setSeed] = useState(''), [think, setThink] = useState('');
    const [page, setPage] = useState<JobPage | null>(null), [job, setJob] = useState<JobRecord | null>(null), [units, setUnits] = useState<UnitPage | null>(null);
    const [unit, setUnit] = useState<UnitRecord | null>(null), [preview, setPreview] = useState<BatchPreview | null>(null), [coverageOffset, setCoverageOffset] = useState(0);
    const alive = useRef(true), running = useRef(false), version = useRef(0), polling = useRef(false), selected = useRef<JobRecord | null>(null), unitOffset = useRef(0);
    const activeAction = useRef(0);
    const heading = useRef<HTMLHeadingElement>(null), pending = useRef<JobCommand | null>(null);
    const locked = busy || uncertain;
    const provider = profiles.find(p => p.id === profileId);
    const numberValid = (value: string, min: number, max: number, integer = true) => value.trim() !== '' && Number.isFinite(Number(value)) && (!integer || Number.isInteger(Number(value))) && Number(value) >= min && Number(value) <= max;
    const valid = !!form && fields.length > 0 && !!provider && numberValid(maxChunks, 1, 10000) && numberValid(context, 1024, 1_000_000) && numberValid(output, 1, 32768)
        && (provider.adapter !== 'ollama' || (!numCtx || numberValid(numCtx, 1, 1_000_000)) && (!temperature || numberValid(temperature, 0, 2, false)) && (!seed || numberValid(seed, -2147483648, 2147483647)));
    useEffect(() => { alive.current = true; return () => { alive.current = false; ++version.current; }; }, []);
    function display(value: JobRecord) { selected.current = value; setJob(value); setPage(old => old && ({ ...old, items: old.items.map(row => row.id === value.id ? value : row) })); }
    function clearEvidence() { setUnits(null); setUnit(null); setPreview(null); setCoverageOffset(0); }
    function fail(failure: unknown, writing: boolean) {
        const code = failure instanceof Error ? failure.message : 'OPERATION_FAILED'; setError(code);
        if (confirmed.has(code)) { pending.current = null; setUncertain(false); }
        else if (writing) setUncertain(true);
        if (invalidates.has(code)) { ++version.current; clearEvidence(); }
    }
    async function action(work: (current: () => boolean) => Promise<void>) {
        if (running.current) return;
        running.current = true; setBusy(true); setError(''); const token = ++version.current;
        activeAction.current = token;
        const current = () => alive.current && version.current === token;
        try { await work(current); }
        catch (failure) { if (current()) fail(failure, pending.current !== null); }
        finally { if (activeAction.current === token) { running.current = false; if (alive.current) setBusy(false); } }
    }
    async function loadProfiles(current: () => boolean) {
        const values: ProviderProfile[] = [];
        for (let offset = 0; ;) {
            const result = await bridge.request({ op: 'provider.list', offset }) as ProfilePage;
            if (!current()) return;
            values.push(...result.items.filter(p => p.purpose === 'generation'));
            offset += result.items.length;
            if (offset >= result.total) break;
            if (!result.items.length) throw new Error('INVALID_PROVIDER_PAGE');
        }
        setProfiles(values); setProfileId(old => values.some(p => p.id === old) ? old : values[0]?.id ?? '');
    }
    async function loadPage(offset: number, current: () => boolean) {
        const result = await bridge.request({ op: 'jobs.list', ...scope, offset }) as JobPage;
        if (current()) setPage(result);
    }
    async function initialize(current: () => boolean) {
        const forms = await bridge.request({ op: 'matrix.forms', ...scope, offset: 0 }) as FormPage;
        if (!current()) return;
        const next = forms.items[0] ?? null;
        setForm(next); setFields(previous => next?.id === form?.id ? previous : next?.fields.map(f => f.key) ?? []);
        await loadProfiles(current); if (current()) await loadPage(0, current);
        if (current() && selected.current) {
            const result = await bridge.request({ op: 'jobs.read', ...scope, job_id: selected.current.id }) as JobRecord;
            if (current()) { display(result); await loadUnits(result, unitOffset.current, current, true); }
        }
    }
    useEffect(() => { if (open && !uncertain && !running.current) void action(loadProfiles); }, [profilesEpoch]);
    async function inspect(value: JobRecord, chosen: UnitRecord, batch: number, current: () => boolean) {
        setUnit(chosen); setPreview(null); setCoverageOffset(0);
        if (chosen.batches_total === 0) return;
        const result = await bridge.request({ op: 'jobs.preview', ...scope, job_id: value.id, unit_id: chosen.id, batch_index: batch }) as BatchPreview;
        if (current()) setPreview(result);
    }
    async function loadUnits(value: JobRecord, offset: number, current: () => boolean, inspectFirst = false) {
        const result = await bridge.request({ op: 'jobs.units', ...scope, job_id: value.id, offset }) as UnitPage;
        if (!current()) return;
        unitOffset.current = offset; setUnits(result);
        const chosen = result.items.find(u => u.id === unit?.id) ?? result.items[0];
        if (chosen) {
            setUnit(chosen);
            if (inspectFirst) await inspect(value, chosen, 0, current);
        } else { setUnit(null); setPreview(null); }
    }
    function select(value: JobRecord) {
        void action(async current => {
            clearEvidence(); display(value);
            const latest = await bridge.request({ op: 'jobs.read', ...scope, job_id: value.id }) as JobRecord;
            if (!current()) return;
            display(latest); await loadUnits(latest, 0, current, true);
            requestAnimationFrame(() => heading.current?.focus());
        });
    }
    async function executePending() {
        await action(async current => {
            const command = pending.current; if (!command) return;
            const result = await bridge.request(command); if (!current()) return;
            pending.current = null; setUncertain(false);
            if (command.op === 'jobs.cache.clear') { setNotice(t.cacheCleared); return; }
            const value = result as JobRecord; display(value);
            if (command.op === 'jobs.prepare') { await loadPage(0, current); if (current()) await loadUnits(value, 0, current, true); }
            // Pause/cancel are complete as soon as the status receipt arrives; no PDF reads follow.
        });
    }
    function mutate(command: JobCommand) { if (locked || running.current) return; pending.current = command; void executePending(); }
    function prepare() {
        if (!valid || locked || running.current || !form) return;
        const options = provider?.adapter === 'ollama' ? {
            num_ctx: numCtx ? Number(numCtx) : null, temperature: temperature ? Number(temperature) : null,
            seed: seed ? Number(seed) : null, think: think ? think === 'on' : null,
        } : null;
        mutate({ op: 'jobs.prepare', ...scope, request: { form_version_id: form.id, field_keys: fields,
            profile_id: profileId, method, max_chunks_per_unit: Number(maxChunks), context_tokens: Number(context),
            max_output_tokens: Number(output), ollama_options: options, force_new: force, idempotency_key: newKey() } });
    }
    function control(action: JobControl['action']) {
        if (!job) return;
        const command: JobCommand = { op: 'jobs.control', ...scope, job_id: job.id, request: { action, expected_revision: job.revision, idempotency_key: newKey() } };
        if (['pause', 'cancel'].includes(action) && running.current && !pending.current && !uncertain) {
            // Invalidate a slow read without delaying status-only cancellation behind it.
            ++version.current; running.current = false; pending.current = command; void executePending();
        } else mutate(command);
    }
    useEffect(() => {
        if (!open) return;
        const timer = setInterval(() => {
            const value = selected.current;
            if (!value || !['RUNNING', 'QUEUED'].includes(value.state) || polling.current || running.current || pending.current) return;
            const token = version.current, current = () => alive.current && version.current === token && selected.current?.id === value.id;
            polling.current = true;
            void (async () => {
                try {
                    const result = await bridge.request({ op: 'jobs.read', ...scope, job_id: value.id }) as JobRecord;
                    if (!current()) return;
                    display(result);
                    if (result.revision !== value.revision) await loadUnits(result, unitOffset.current, current);
                } catch (failure) { if (current()) fail(failure, false); }
                finally { polling.current = false; }
            })();
        }, 1000);
        return () => clearInterval(timer);
    }, [open, bridge, notebook_id, snapshot_id, unit?.id]);
    const reason = (code: string | null | undefined) => code ? (t.reasons as Record<string, string>)[code] ?? code : '';
    const status = (state: string) => (t.states as Record<string, string>)[state] ?? state;
    const resumeReady = job && !['RUNNING', 'QUEUED', 'CANCELLED', 'SUCCEEDED'].includes(job.state) && units && (preview || units.items.every(u => u.batches_total === 0));
    return <section className="extraction-jobs" aria-label={t.title}>
        {!open ? <button type="button" onClick={() => { setOpen(true); void action(initialize); }}>{t.open}</button> : <>
            <h2>{t.title}</h2><p>{t.help}</p><p>{t.searchHelp}</p>
            {busy && <p role="status">{t.busy}</p>}{error && <p role="alert" className="source-error">{error}</p>}{notice && <p role="status">{notice}</p>}
            {uncertain && <div role="alert"><p>{t.uncertain}</p><button type="button" disabled={busy} onClick={() => void executePending()}>{t.retry}</button></div>}
            <div className="actions"><button type="button" disabled={locked} onClick={() => void action(initialize)}>{t.refresh}</button>
                <button type="button" disabled={locked} onClick={() => mutate({ op: 'jobs.cache.clear', ...scope })}>{t.cacheClear}</button></div>
            {!form ? <p>{t.noForm}</p> : <form noValidate className="job-setup" aria-label={t.prepare}>
                <p>{t.form}: {form.revision} · {form.name}</p>
                <fieldset disabled={locked}><legend>{t.fields}</legend>{form.fields.map(field => <label key={field.key}>
                    <input name={`job_field_${field.key}`} type="checkbox" checked={fields.includes(field.key)} onChange={event => setFields(old => event.target.checked ? [...old, field.key] : old.filter(key => key !== field.key))}/>{field.label}
                </label>)}</fieldset>
                <fieldset disabled={locked}><legend>{t.prepare}</legend>
                    <label>{t.provider}<select name="job_profile" value={profileId} onChange={e => setProfileId(e.target.value)}>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.id} · {profile.model} · {profile.mode}</option>)}</select></label>
                    {!profiles.length && <p>{t.noProfile}</p>}
                    <label>{t.method}<select name="job_method" value={method} onChange={e => setMethod(e.target.value as JobWrite['method'])}><option value="SEARCH">{t.SEARCH}</option><option value="FULL_SCAN">{t.scanOption}</option></select></label>
                    <label>{t.chunksLimit}<input name="job_chunks" type="number" min={1} max={10000} value={maxChunks} onChange={e => setMaxChunks(e.target.value)}/></label>
                    <label>{t.context}<input name="job_context" type="number" min={1024} max={1000000} value={context} onChange={e => setContext(e.target.value)}/></label>
                    <label>{t.output}<input name="job_output" type="number" min={1} max={32768} value={output} onChange={e => setOutput(e.target.value)}/></label>
                    {provider?.adapter === 'ollama' && <details><summary>Ollama</summary>
                        <label>{t.numCtx}<input name="job_num_ctx" type="number" min={1} value={numCtx} onChange={e => setNumCtx(e.target.value)} placeholder={t.default}/></label>
                        <label>{t.temperature}<input name="job_temperature" type="number" min={0} max={2} step="any" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder={t.default}/></label>
                        <label>{t.seed}<input name="job_seed" type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder={t.default}/></label>
                        <label>{t.think}<select name="job_think" value={think} onChange={e => setThink(e.target.value)}><option value="">{t.default}</option><option value="on">{t.on}</option><option value="off">{t.off}</option></select></label>
                    </details>}
                    <label><input name="job_force" type="checkbox" checked={force} onChange={e => setForce(e.target.checked)}/>{t.force}</label>
                </fieldset>
                <button type="button" className="primary" disabled={locked || !valid} onClick={prepare}>{t.prepare}</button>
            </form>}
            {page?.items.length === 0 && <p>{t.empty}</p>}
            <ul className="job-list">{page?.items.map(value => <li key={value.id}><button type="button" disabled={locked} aria-current={job?.id === value.id ? 'true' : undefined} onClick={() => select(value)}>{t.job} {value.id.slice(0, 8)} · {status(value.state)} · {value.completed_units}/{value.total_units}</button></li>)}</ul>
            {page && page.total > page.limit && <nav className="actions" aria-label={t.title}>
                <button type="button" disabled={locked || page.offset === 0} onClick={() => void action(current => loadPage(Math.max(0, page.offset - 10), current))}>{t.previous}</button>
                <button type="button" disabled={locked || page.offset + page.limit >= page.total} onClick={() => void action(current => loadPage(page.offset + page.limit, current))}>{t.next}</button>
            </nav>}
            {job && <section className="job-detail" aria-label={t.job}>
                <h3 ref={heading} tabIndex={-1}>{t.job} {job.id}</h3><p role="status">{status(job.state)} {reason(job.reason)}</p>
                <p>{job.profile.model} · {job.profile.mode} · {job.request.method === 'FULL_SCAN' ? t.scanOption : t.SEARCH} · {t.form}: <code>{job.request.form_version_id}</code></p>
                <p>{t.context}: {job.request.context_tokens} · {t.output}: {job.request.max_output_tokens}</p>
                <p>{t.completed}: {job.completed_units}/{job.total_units} · {t.failed}: {job.failed_units} · {t.cached}: {job.cached_units}</p>
                <progress aria-label={t.completed} value={job.completed_units + job.failed_units} max={Math.max(1, job.total_units)}/>
                <div className="actions">
                    <button type="button" disabled={locked || !resumeReady || job.reason === 'BILLING_UNKNOWN'} onClick={() => control('resume')}>{t.resume}</button>
                    <button type="button" disabled={uncertain || pending.current !== null || !['RUNNING', 'QUEUED'].includes(job.state)} onClick={() => control('pause')}>{t.pause}</button>
                    <button type="button" disabled={uncertain || pending.current !== null || ['CANCELLED', 'SUCCEEDED'].includes(job.state)} onClick={() => control('cancel')}>{t.cancel}</button>
                </div><p>{t.cancelHelp}</p>
                {job.reason === 'BILLING_UNKNOWN' && <><p>{t.skipHelp}</p><button type="button" disabled={locked} onClick={() => control('skip_uncertain')}>{t.skip}</button></>}
                {units && <><h4>{t.units}: {units.total}</h4>
                    <WindowedList items={units.items} label={t.units} rowKey={value => value.id} render={value => <button type="button" disabled={locked} onClick={() => void action(current => inspect(job, value, 0, current))}>{value.field_key} · {value.source_id.slice(0, 12)} · {status(value.state)} · {value.batches_processed}/{value.batches_total}</button>}/>
                    {units.total > units.items.length && <nav className="actions" aria-label={t.units}>
                        <button type="button" disabled={locked || units.offset === 0} onClick={() => void action(current => loadUnits(job, Math.max(0, units.offset - 20), current, true))}>{t.previous}</button>
                        <button type="button" disabled={locked || units.offset + units.limit >= units.total} onClick={() => void action(current => loadUnits(job, units.offset + units.limit, current, true))}>{t.next}</button>
                    </nav>}
                </>}
                {unit && <section aria-label={t.coverage} className="job-coverage">
                    <h4>{unit.field_key} · {t.coverage}</h4><p>{unit.state === 'QUEUED' && unit.batches_processed === 0 ? t.pendingCoverage : t[unit.coverage_state]} · {status(unit.state)} {reason(unit.reason)}</p>
                    <p>{t.batches}: {unit.batches_processed}/{unit.batches_total}</p>
                    {unit.proposal_id && <p>{t.proposal}: <code>{unit.proposal_id}</code></p>}
                    <ul>{unit.coverage.slice(coverageOffset, coverageOffset + 10).map(content => <li key={content.content_key}>
                        <strong>{content.content_key}</strong> · {content.source_kind} · {reason(content.reason)}
                        <p>{t.pages}: {content.pages_processed}/{content.pages_total ?? t.unknown} · {t.failedPages}: {content.failed_pages}</p>
                        <p>{t.chunks}: {content.chunks_processed}/{content.chunks_total} · {t.selectedChunks}: {content.chunks_selected}</p>
                    </li>)}</ul>
                    {unit.coverage.length > 10 && <nav className="actions" aria-label={t.coverage}>
                        <button type="button" disabled={coverageOffset === 0} onClick={() => setCoverageOffset(old => Math.max(0, old - 10))}>{t.previous}</button>
                        <button type="button" disabled={coverageOffset + 10 >= unit.coverage.length} onClick={() => setCoverageOffset(old => old + 10)}>{t.next}</button>
                    </nav>}
                    {unit.batches_total === 0 ? <p>{t.noBatch}</p> : preview && <div className="job-preparation">
                        <h4>{t.preview}: {preview.batch_index + 1}/{unit.batches_total}</h4>
                        <p>{t.estimate}: {preview.estimated_input_tokens}</p><p>{t.schemaMode}: {preview.schema_plan.mode}</p>
                        <details open><summary>{t.prompt}</summary><pre>{preview.prompt}</pre></details>
                        <details><summary>{t.system}</summary><pre>{preview.schema_plan.system}</pre></details>
                        <details><summary>{t.schema}</summary><pre>{JSON.stringify(preview.schema_plan.output_schema, null, 2)}</pre></details>
                        <nav className="actions" aria-label={t.preview}>
                            <button type="button" disabled={locked || preview.batch_index === 0} onClick={() => void action(current => inspect(job, unit, preview.batch_index - 1, current))}>{t.previous}</button>
                            <button type="button" disabled={locked || preview.batch_index + 1 >= unit.batches_total} onClick={() => void action(current => inspect(job, unit, preview.batch_index + 1, current))}>{t.next}</button>
                        </nav>
                    </div>}
                </section>}
            </section>}
        </>}
    </section>;
}
