import { useEffect, useRef, useState } from 'react';
import type { BudgetWrite, Consent, ConversationPage, ConversationRecord, Locale, PagePreview, ProfilePage, ProviderProfile,
    ProviderSettings, RunPage, RunPrepare, RunRecord, UiBridge, UsagePage, VectorJob } from '../bridge/types';
import { catalog } from './i18n';
import { EvidencePanel } from './EvidencePanel';
import { newKey } from './ProviderSettings';
import { readRunStream } from './stream';

export interface QuestionTarget { kind: 'excerpt' | 'document'; id: string; label: string; nonce: string }
export interface VisualSelection { operation_id: string; image: PagePreview }
const revoked = (failure: unknown) => failure instanceof Error && ['SCOPE_STALE', 'SOURCE_REVOKED', 'FORBIDDEN', 'UNAUTHENTICATED', 'DOCUMENT_STALE', 'MISSING_FILE'].includes(failure.message);
const active = (run: RunRecord | null) => run?.state === 'RUNNING';

export function Conversation({ bridge, notebook_id, snapshot_id, locale, profilesEpoch = 0, target, preview }: {
    bridge: UiBridge; notebook_id: string; snapshot_id: string; locale: Locale; profilesEpoch?: number;
    target?: QuestionTarget | null; preview?: VisualSelection | null;
}) {
    const t = catalog(locale), c = t.chat, scope = { notebook_id, snapshot_id };
    const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [streaming, setStreaming] = useState(false), [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [profiles, setProfiles] = useState<ProfilePage | null>(null), [profile, setProfile] = useState<ProviderProfile | null>(null), [embedding, setEmbedding] = useState('');
    const [conversations, setConversations] = useState<ConversationPage | null>(null), [conversation, setConversation] = useState<ConversationRecord | null>(null), [history, setHistory] = useState<RunPage | null>(null);
    const [run, setRun] = useState<RunRecord | null>(null), [draft, setDraft] = useState(''), [question, setQuestion] = useState(''), [questionTarget, setTarget] = useState<QuestionTarget | null>(null);
    const [contextTokens, setContextTokens] = useState('4096'), [outputTokens, setOutputTokens] = useState('1024'), [temperature, setTemperature] = useState('0'), [seed, setSeed] = useState('7'), [think, setThink] = useState(false);
    const [useImage, setUseImage] = useState(false), [consent, setConsent] = useState<Consent | null>(null), [consentChecked, setConsentChecked] = useState(false), [settings, setSettings] = useState<ProviderSettings | null>(null);
    const [vector, setVector] = useState<VectorJob | null>(null), [usage, setUsage] = useState<UsagePage | null>(null);
    const [budgetKind, setBudgetKind] = useState<BudgetWrite['kind']>('call'), [ceiling, setCeiling] = useState(''), [currency, setCurrency] = useState('USD'), [budgetRevision, setBudgetRevision] = useState(0), [budgetLoaded, setBudgetLoaded] = useState(false);
    const running = useRef(false), alive = useRef(true), version = useRef(0), watcher = useRef<AbortController | null>(null), cursor = useRef(0);
    const pending = useRef<RunPrepare | null>(null), conversationKey = useRef<string | null>(null), vectorKey = useRef<string | null>(null), consentKey = useRef<string | null>(null), budgetKey = useRef<string | null>(null);
    const input = useRef<HTMLTextAreaElement>(null);
    const ownedRuns = useRef(new Set<string>()), cancelBusy = useRef(false);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false; ++version.current; watcher.current?.abort();
            for (const run_id of ownedRuns.current) {
                void bridge.request({ op: 'conversation.cancel', notebook_id, snapshot_id, run_id }).catch(failure =>
                    console.error('CONVERSATION_CLEANUP_CANCEL_FAILED', failure));
            }
            ownedRuns.current.clear();
        };
    }, []);
    function observeRun(value: RunRecord) {
        if (['COMPLETE', 'FAILED', 'CANCELLED'].includes(value.state)) ownedRuns.current.delete(value.id);
        setRun(value);
    }
    function fail(failure: unknown) {
        if (!alive.current) return;
        setError(failure instanceof Error ? failure.message : 'OPERATION_FAILED');
        if (revoked(failure)) { setRun(null); setDraft(''); setHistory(null); setConsent(null); watcher.current?.abort(); }
    }
    async function action(work: () => Promise<void>) {
        if (running.current) return;
        running.current = true; setBusy(true); setError('');
        try { await work(); } catch (failure) { fail(failure); }
        finally { running.current = false; if (alive.current) setBusy(false); }
    }
    function edited() { pending.current = null; consentKey.current = null; setConsentChecked(false); if (run?.state === 'PREPARED') { setRun(null); setConsent(null); } }
    async function loadProfiles(offset = 0) {
        const page = await bridge.request({ op: 'provider.list', offset }) as ProfilePage;
        const setting = await bridge.request({ op: 'provider.settings' }) as ProviderSettings;
        if (alive.current) { setProfiles(page); setSettings(setting); }
    }
    async function list(offset = 0) {
        const page = await bridge.request({ op: 'conversation.list', ...scope, offset }) as ConversationPage;
        if (alive.current) setConversations(page);
    }
    async function loadHistory(value: ConversationRecord, offset = 0) {
        const page = await bridge.request({ op: 'conversation.history', ...scope, conversation_id: value.id, offset }) as RunPage;
        if (alive.current) setHistory(page);
    }
    async function openView() { setOpen(true); await loadProfiles(); await list(); requestAnimationFrame(() => input.current?.focus()); }
    useEffect(() => {
        if (!open) return;
        setProfile(null); setEmbedding(''); edited();
        void action(() => loadProfiles());
    }, [profilesEpoch]);
    useEffect(() => {
        if (!target) return;
        setTarget(target); edited();
        if (!open) void action(openView);
        requestAnimationFrame(() => input.current?.focus());
    }, [target?.nonce]);
    useEffect(() => { edited(); }, [preview?.operation_id]);
    async function newConversation() {
        conversationKey.current ??= newKey();
        const value = await bridge.request({ op: 'conversation.create', ...scope, request: { idempotency_key: conversationKey.current } }) as ConversationRecord;
        conversationKey.current = null; watcher.current?.abort(); ++version.current;
        if (alive.current) { setConversation(value); setHistory(null); setRun(null); setDraft(''); cursor.current = 0; pending.current = null; }
        await list(); return value;
    }
    async function selectConversation(value: ConversationRecord) {
        watcher.current?.abort(); ++version.current; setStreaming(false); setDraft(''); cursor.current = 0; setRun(null); pending.current = null;
        const current = await bridge.request({ op: 'conversation.read', ...scope, conversation_id: value.id }) as ConversationRecord;
        if (alive.current) setConversation(current);
        await loadHistory(current);
    }
    async function prepare() {
        if (!profile || !question.trim() || active(run)) return;
        const current = conversation ?? await newConversation();
        pending.current ??= { expected_revision: current.revision, profile_id: profile.id, question: question.trim(),
            context_tokens: Number(contextTokens), max_output_tokens: Number(outputTokens), idempotency_key: newKey(),
            embedding_profile_id: embedding || null, preview_operation_id: useImage ? preview?.operation_id ?? null : null,
            evidence_id: questionTarget?.kind === 'excerpt' ? questionTarget.id : null,
            document_version_id: questionTarget?.kind === 'document' ? questionTarget.id : null,
            ollama_options: profile.adapter === 'ollama' ? { num_ctx: Number(contextTokens), temperature: Number(temperature), seed: seed === '' ? null : Number(seed), think } : null };
        const value = await bridge.request({ op: 'conversation.prepare', ...scope, conversation_id: current.id, request: pending.current }) as RunRecord;
        if (!alive.current) return;
        pending.current = null; setRun(value); setDraft(''); cursor.current = 0; setConsent(null); setConsentChecked(false); consentKey.current = null;
        if (value.profile.mode === 'API') {
            setConsent(await bridge.request({ op: 'provider.consent', ...scope, profile_id: value.profile.id }) as Consent);
            setSettings(await bridge.request({ op: 'provider.settings' }) as ProviderSettings);
        }
        await loadHistory(current);
    }
    async function usagePage(offset = 0) {
        const value = await bridge.request({ op: 'provider.calls', ...scope, offset }) as UsagePage;
        if (alive.current) setUsage(value);
    }
    function watch(value: RunRecord, reset = false) {
        watcher.current?.abort(); const controller = new AbortController(); watcher.current = controller;
        const epoch = ++version.current;
        if (reset) { cursor.current = 0; setDraft(''); }
        setStreaming(true); setError('');
        void readRunStream(bridge, scope, value.id, cursor.current, controller.signal, page => {
            if (!alive.current || epoch !== version.current) return;
            cursor.current = page.cursor;
            const text = page.items.filter(e => e.kind === 'draft').map(e => e.text ?? '').join('');
            if (text) setDraft(old => old + text);
        }).then(async result => {
            if (!alive.current || epoch !== version.current || !result) return;
            observeRun(result);
            if (result.error) setError(result.error);
            const current = await bridge.request({ op: 'conversation.read', ...scope, conversation_id: result.conversation_id }) as ConversationRecord;
            if (!alive.current || epoch !== version.current) return;
            setConversation(current); await loadHistory(current); await usagePage();
        }).catch(fail).finally(() => { if (alive.current && epoch === version.current) setStreaming(false); });
    }
    async function start() {
        if (!run) return;
        const epoch = ++version.current;
        // Own the dispatch before awaiting it: a timeout does not prove it was not sent.
        ownedRuns.current.add(run.id);
        const value = await bridge.request({ op: 'conversation.start', ...scope, run_id: run.id }) as RunRecord;
        if (!alive.current || epoch !== version.current) return;
        observeRun(value); watch(value);
    }
    async function stop() {
        if (!run || cancelBusy.current) return;
        cancelBusy.current = true; setCancelling(true); setError('');
        const epoch = ++version.current, id = run.id;
        watcher.current?.abort(); setStreaming(false);
        try {
            await bridge.request({ op: 'conversation.cancel', ...scope, run_id: id });
            if (alive.current && epoch === version.current) await readRun(id);
        } catch (failure) { fail(failure); }
        finally { cancelBusy.current = false; if (alive.current) setCancelling(false); }
    }
    async function readRun(id: string) {
        watcher.current?.abort(); ++version.current; setStreaming(false); cursor.current = 0; setDraft('');
        const value = await bridge.request({ op: 'conversation.run', ...scope, run_id: id }) as RunRecord;
        if (!alive.current) return;
        observeRun(value); setConsent(null); setConsentChecked(false);
        if (value.state === 'RUNNING') watch(value, true);
        if (value.state === 'PREPARED' && value.profile.mode === 'API') setConsent(await bridge.request({ op: 'provider.consent', ...scope, profile_id: value.profile.id }) as Consent);
    }
    async function grant(granted: boolean) {
        if (!run || !consent) return;
        consentKey.current ??= newKey();
        const value = await bridge.request({ op: 'provider.consent.write', ...scope, profile_id: run.profile.id,
            request: { granted, categories: granted ? run.categories : [], profile_revision: run.profile.revision, expected_revision: consent.revision, idempotency_key: consentKey.current } }) as Consent;
        setConsent(value); consentKey.current = null; setConsentChecked(false);
    }
    useEffect(() => {
        setBudgetLoaded(false); budgetKey.current = null;
        if (!run) return;
        let current = true;
        void bridge.request({ op: 'provider.budget.read', ...scope, kind: budgetKind, identity: budgetKind === 'session' ? run.conversation_id : run.id }).then(value => {
            if (!current || !alive.current) return;
            const budget = value as { revision: number; currency: string; ceiling: string } | null;
            setBudgetRevision(budget?.revision ?? 0); setCurrency(budget?.currency ?? 'USD'); setCeiling(budget?.ceiling ?? ''); setBudgetLoaded(true);
        }).catch(fail);
        return () => { current = false; };
    }, [run?.id, budgetKind]);
    useEffect(() => {
        if (vector?.state !== 'RUNNING') return;
        let current = true, polling = false;
        const timer = setInterval(() => {
            if (polling) return; polling = true;
            void bridge.request({ op: 'conversation.vectors.read', ...scope, job_id: vector.id }).then(value => {
                if (current && alive.current) setVector(value as VectorJob);
            }).catch(failure => { if (current) { clearInterval(timer); fail(failure); } }).finally(() => { polling = false; });
        }, 1000);
        return () => { current = false; clearInterval(timer); };
    }, [vector?.id, vector?.state]);
    const supportsVision = !!profile?.capabilities.images?.supported && profile.capabilities.images.provenance !== 'UNSUPPORTED';
    const consentValid = run?.profile.mode !== 'API' || !!consent?.granted && consent.profile_revision === run.profile.revision && run.categories.every(category => consent.categories.includes(category));
    const executionStates = { PREPARED: c.prepared, RUNNING: c.running, COMPLETE: c.complete, FAILED: c.failed, CANCELLED: c.cancelled };
    const stateLabel = run ? executionStates[run.state] : c.idle;
    if (!open) return <button type="button" className="conversation-open" onClick={() => void action(openView)}>{c.open}</button>;
    return <section className="conversation" aria-label={c.title}>
        <header className="conversation-status"><h2>{c.title}</h2><p role="status">{stateLabel}{busy ? ` · ${t.loading}` : ''}</p>
            <p>{run ? `${run.profile.mode} · ${run.profile.adapter} · ${run.profile.model}` : profile ? `${profile.mode} · ${profile.model}` : c.noModel}</p>
            <p>{c.usage}: {usage?.total ?? c.unknown} · {c.cost}: {usage?.items.find(call => call.call_id === run?.id)?.cost ?? c.unknown}</p></header>
        {error && <p role="alert" className="source-error">{error}{/BRIDGE_|TRANSPORT|TIMEOUT/.test(error) && <><br/>{c.transportUncertain}</>}</p>}
        <details><summary>{c.history}</summary><div className="actions"><button type="button" disabled={busy || active(run)} onClick={() => void action(async () => { await newConversation(); })}>{c.new}</button><button type="button" disabled={busy} onClick={() => void action(() => list())}>{t.sources.refresh}</button></div>
            <ul className="compact-list">{conversations?.items.map(value => <li key={value.id}><button type="button" disabled={busy || active(run)} aria-pressed={value.id === conversation?.id} onClick={() => void action(() => selectConversation(value))}>{value.id} · {t.revision} {value.revision}</button></li>)}</ul>
            {conversations && conversations.total > conversations.limit && <nav className="actions" aria-label={c.history}><button disabled={busy || !conversations.offset} onClick={() => void action(() => list(Math.max(0, conversations.offset - conversations.limit)))}>{t.previous}</button><button disabled={busy || conversations.offset + conversations.items.length >= conversations.total} onClick={() => void action(() => list(conversations.offset + conversations.items.length))}>{t.next}</button></nav>}
            <ul className="compact-list">{history?.items.map(value => <li key={value.id}><button type="button" disabled={busy || active(run)} onClick={() => void action(() => readRun(value.id))}>{value.question} · {executionStates[value.state as keyof typeof executionStates] ?? c.unknown} · {value.model} {value.error}</button></li>)}</ul>
            {conversation && history && history.total > history.limit && <nav className="actions" aria-label={c.history}><button disabled={busy || !history.offset} onClick={() => void action(() => loadHistory(conversation, Math.max(0, history.offset - history.limit)))}>{t.previous}</button><button disabled={busy || history.offset + history.items.length >= history.total} onClick={() => void action(() => loadHistory(conversation, history.offset + history.items.length))}>{t.next}</button></nav>}
        </details>
        <fieldset disabled={busy || active(run)}><legend>{c.question}</legend><div className="source-filters">
            <label>{c.profile}<select name="conversation_profile" value={profile?.id ?? ''} onChange={e => { setProfile(profiles?.items.find(p => p.id === e.target.value) ?? null); setUseImage(false); edited(); }}><option value="">{t.noModel}</option>{profiles?.items.filter(p => p.purpose === 'generation').map(p => <option key={p.id} value={p.id}>{p.id} · {p.mode} · {p.model}</option>)}</select></label>
            <label>{c.embedding}<select name="conversation_embedding" value={embedding} onChange={e => { setEmbedding(e.target.value); vectorKey.current = null; edited(); }}><option value="">{c.lexicalOnly}</option>{profiles?.items.filter(p => p.purpose === 'embedding').map(p => <option key={p.id} value={p.id}>{p.id} · {p.model}</option>)}</select></label>
        </div><button type="button" onClick={() => void action(() => loadProfiles())}>{c.refreshModels}</button>
        {profiles && profiles.total > profiles.limit && <nav className="actions" aria-label={c.models}><button disabled={!profiles.offset} onClick={() => void action(() => loadProfiles(Math.max(0, profiles.offset - profiles.limit)))}>{t.previous}</button><button disabled={profiles.offset + profiles.items.length >= profiles.total} onClick={() => void action(() => loadProfiles(profiles.offset + profiles.items.length))}>{t.next}</button></nav>}
        <button type="button" disabled={!embedding || vector?.state === 'RUNNING'} onClick={() => void action(async () => {
            vectorKey.current ??= newKey(); const value = await bridge.request({ op: 'conversation.vectors.build', ...scope, request: { profile_id: embedding, idempotency_key: vectorKey.current } }) as VectorJob;
            setVector(value); vectorKey.current = null;
        })}>{c.buildIndex}</button>
        <p>{c.scope}: {questionTarget ? `${questionTarget.kind === 'excerpt' ? c.excerptScope : c.documentScope} · ${questionTarget.label}` : c.notebookScope}</p>
        {questionTarget && <button type="button" onClick={() => { setTarget(null); edited(); }}>{c.clearScope}</button>}
        <label>{c.question}<textarea ref={input} name="conversation_question" value={question} maxLength={2000} rows={3} onChange={e => { setQuestion(e.target.value); edited(); }} onKeyDown={event => {
            if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            event.preventDefault(); if (!event.repeat) void action(prepare);
        }}/></label>
        <div className="source-filters"><label>{c.contextLimit}<input name="conversation_context" type="number" min="1024" max="1000000" value={contextTokens} onChange={e => { setContextTokens(e.target.value); edited(); }}/></label>
            <label>{c.outputLimit}<input name="conversation_output" type="number" min="1" max="32768" value={outputTokens} onChange={e => { setOutputTokens(e.target.value); edited(); }}/></label></div>
        {profile?.adapter === 'ollama' && <div className="source-filters"><label>{c.temperature}<input name="conversation_temperature" type="number" min="0" max="2" step=".1" value={temperature} onChange={e => { setTemperature(e.target.value); edited(); }}/></label><label>{c.seed}<input name="conversation_seed" type="number" value={seed} onChange={e => { setSeed(e.target.value); edited(); }}/></label><label className="source-check"><input name="conversation_think" type="checkbox" checked={think} onChange={e => { setThink(e.target.checked); edited(); }}/>{c.think}</label></div>}
        <p id="vision-reason">{supportsVision ? preview ? c.visualProposal : c.noPreview : c.visionDisabled}</p>
        <label className="source-check"><input name="conversation_image" type="checkbox" checked={useImage} disabled={!preview || !supportsVision} aria-describedby="vision-reason" onChange={e => { setUseImage(e.target.checked); edited(); }}/>{c.useImage}</label>
        {preview && useImage && <figure className="page-preview"><img src={`data:image/png;base64,${preview.image.data_base64}`} alt={`${t.evidence.page} ${preview.image.page_index + 1}: ${preview.image.region.join(', ')}`}/><figcaption>{c.imageHash}: {preview.image.sha256} · {c.destination}: {profile?.base_url} / {profile?.model}</figcaption></figure>}
        <button type="button" className="primary" disabled={!profile || !question.trim()} onClick={() => void action(prepare)}>{c.prepare}</button></fieldset>
        {vector && <div role="status"><p>{c.building}: {t.evidence.states[vector.state]} · {c.processed}: {vector.processed} / {vector.total} {vector.error}</p>{vector.state === 'RUNNING' && <button type="button" onClick={() => void action(async () => { setVector(await bridge.request({ op: 'conversation.vectors.cancel', ...scope, job_id: vector.id }) as VectorJob); })}>{c.stop}</button>}</div>}
        {run && <><p>{c.coverage}</p><dl className="metrics"><div><dt>{c.retrieved}</dt><dd>{run.context.documents_retrieved}</dd></div><div><dt>{c.used}</dt><dd>{run.context.documents_used}</dd></div><div><dt>{c.excluded}</dt><dd>{run.context.excluded_budget} / {run.context.excluded_overlap} / {run.context.excluded_limit}</dd></div></dl>
            <p>{c.estimate}: {run.context.estimated_input_tokens} · {c.outputLimit}: {run.context.max_output_tokens} · {c.contextLimit}: {run.context.context_tokens}</p><p className="source-meta">{c.estimateHelp}</p>
            <p>{c.destination}: {run.profile.adapter} / {run.profile.model} / {run.profile.base_url}<br/>{c.categories}: {run.categories.map(category => c.category[category]).join(', ')}</p>
            {run.visual && <p>{c.visualProposal} · {t.evidence.page}: {run.visual.page_index + 1} · {run.visual.region.join(', ')}<br/>{c.imageHash}: <code>{run.visual.sha256}</code><br/>{c.destination}: {run.visual.destination}</p>}
            <details><summary>{c.exactContext}</summary><p>{run.prompt_version} · {run.id}</p><pre>{run.context.system}</pre>{run.context.history.map((message, i) => <pre key={i}>{message.role}: {message.text}</pre>)}<pre>{run.context.prompt}</pre></details>
            {run.state === 'PREPARED' && run.profile.mode === 'API' && <fieldset disabled={busy}><legend>{c.destination}: {run.profile.base_url}</legend>
                {settings?.block_paid_apis && <p>{c.apiBlocked}</p>}
                {consentValid ? <><p>{c.consentSaved}</p><button type="button" onClick={() => void action(() => grant(false))}>{c.revokeConsent}</button></> : <><label className="source-check"><input type="checkbox" checked={consentChecked} onChange={e => { setConsentChecked(e.target.checked); consentKey.current = null; }}/>{c.consent}</label><button type="button" disabled={!consentChecked || !consent} onClick={() => void action(() => grant(true))}>{c.grant}</button></>}
            </fieldset>}
            {run.state === 'PREPARED' && <details><summary>{c.budget}</summary><p>{c.budgetHelp}</p><fieldset disabled={busy}><label>{c.budgetKind}<select value={budgetKind} onChange={e => setBudgetKind(e.target.value as BudgetWrite['kind'])}>{(['call', 'job', 'session'] as const).map(kind => <option key={kind} value={kind}>{c.budgetKinds[kind]}</option>)}</select></label><div className="source-filters"><label>{c.currency}<input value={currency} maxLength={3} onChange={e => { setCurrency(e.target.value.toUpperCase()); budgetKey.current = null; }}/></label><label>{c.ceiling}<input type="number" min="0" step="any" value={ceiling} onChange={e => { setCeiling(e.target.value); budgetKey.current = null; }}/></label></div><button type="button" disabled={!budgetLoaded || !ceiling} onClick={() => void action(async () => {
                budgetKey.current ??= newKey(); const result = await bridge.request({ op: 'provider.budget', ...scope, request: { kind: budgetKind, identity: budgetKind === 'session' ? run.conversation_id : run.id, currency, ceiling, expected_revision: budgetRevision, idempotency_key: budgetKey.current } }) as { revision: number };
                setBudgetRevision(result.revision); budgetKey.current = null;
            })}>{c.saveBudget}</button></fieldset></details>}
            <div className="actions">{run.state === 'PREPARED' && <button type="button" className="primary" disabled={busy || !consentValid || run.profile.mode === 'API' && !!settings?.block_paid_apis} onClick={() => void action(start)}>{c.send}</button>}
                {['PREPARED', 'RUNNING'].includes(run.state) && <button type="button" disabled={cancelling} onClick={() => void stop()}>{c.stop}</button>}
                {!streaming && <button type="button" disabled={busy} onClick={() => void action(() => readRun(run.id))}>{c.resume}</button>}</div>
            {draft && <section className="draft" aria-label={c.draft}><h3>{c.draft}</h3><pre>{draft}</pre></section>}
            <EvidencePanel bridge={bridge} {...scope} run={run} locale={locale}/>
        </>}
        <details><summary>{c.usage}</summary><button type="button" disabled={busy} onClick={() => void action(() => usagePage())}>{c.refreshUsage}</button><p>{c.usage}: {usage?.total ?? c.unknown}</p>
            <ul className="compact-list">{usage?.items.map(call => <li key={call.call_id}><code>{call.call_id}</code> · {call.profile_id} · {call.state} {call.error}<br/>{c.tokens}: {call.input_tokens ?? c.unknown} / {call.output_tokens ?? c.unknown}<br/>{c.cost}: {call.cost ?? c.unknown} {call.currency ?? ''} · {call.price_version ?? c.unknown}</li>)}</ul>
            {usage && usage.total > usage.limit && <nav className="actions" aria-label={c.usage}><button disabled={busy || !usage.offset} onClick={() => void action(() => usagePage(Math.max(0, usage.offset - usage.limit)))}>{t.previous}</button><button disabled={busy || usage.offset + usage.items.length >= usage.total} onClick={() => void action(() => usagePage(usage.offset + usage.items.length))}>{t.next}</button></nav>}
        </details>
    </section>;
}
