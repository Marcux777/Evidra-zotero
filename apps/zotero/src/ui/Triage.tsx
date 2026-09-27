import { useEffect, useRef, useState } from 'react';
import type { ArtifactVersion, ProtocolVersion, ScreeningBatchPrepare, ScreeningBatchView, ScreeningDecision, ScreeningQueuePage, ScreeningQueueRow } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';
import { relevanceOf, RelevanceView } from './Relevance';

type Stage = ScreeningBatchPrepare['stage'];
type Sort = 'ATTENTION' | 'GRADE' | 'TITLE';
export type TriageSettings = Pick<ScreeningBatchPrepare, 'profile_id' | 'context_tokens' | 'max_output_tokens' | 'ollama_options'>;

/** Batch relevance screening plus a sortable queue where proposals become human decisions. */
export function Triage(props: ResearchScope & { protocol: ProtocolVersion; question: string; settings: TriageSettings | null; onInspect: (runId: string) => void }) {
    const { bridge, notebook_id, snapshot_id, locale, protocol, question, settings, onInspect } = props;
    const scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [stage, setStage] = useState<Stage>('TITLE_ABSTRACT'), [selection, setSelection] = useState<ScreeningBatchPrepare['selection']>('ALL');
    const [batch, setBatch] = useState<ScreeningBatchView | null>(null), [queue, setQueue] = useState<ScreeningQueuePage | null>(null);
    const [sort, setSort] = useState<Sort>('ATTENTION'), [reviewer, setReviewer] = useState(''), [notice, setNotice] = useState('');
    // Stable keys per artifact: a repeated click after a lost response replays, never duplicates.
    const keys = useRef(new Map<string, { review: string; adopt: string }>());
    const actions = useResearchActions(bridge, () => { setBatch(null); setQueue(null); });
    const running = batch?.batch.state === 'RUNNING';
    const reason = (code: string | null | undefined) => code ? (t.batchReasons as Record<string, string>)[code] ?? code : '';
    const skip = (code: string) => (t.skipReasons as Record<string, string>)[code] ?? code;

    async function loadQueue(offset: number, current: () => boolean, order = sort, which = stage) {
        const page = await bridge.request({ op: 'research.queue', ...scope, request: {
            protocol_version_id: protocol.id, stage: which, sort: order, offset, limit: 20 } }) as ScreeningQueuePage;
        if (current()) setQueue(page);
    }
    useEffect(() => { setQueue(null); setBatch(null); actions.read(c => loadQueue(0, c)); }, [protocol.id, stage]);
    useEffect(() => {
        if (!running || !batch) return;
        const timer = setInterval(() => actions.read(async current => {
            const next = await bridge.request({ op: 'research.batch.read', ...scope, batch_id: batch.batch.id }) as ScreeningBatchView;
            if (!current()) return;
            setBatch(next);
            if (next.batch.state !== 'RUNNING') await loadQueue(queue?.offset ?? 0, current);
        }), 1500);
        return () => clearInterval(timer);
    }, [running, batch?.batch.id]);

    function prepare(sourceIds: string[] | null = null, interrupt = false) {
        if (!settings) return;
        actions.write({ op: 'research.batch.prepare', ...scope, request: {
            protocol_version_id: protocol.id, stage, question, selection, source_ids: sourceIds, ...settings, idempotency_key: researchKey(),
        } }, value => { setBatch(value as ScreeningBatchView); setNotice(''); }, interrupt);
    }
    function control(action: 'start' | 'cancel') {
        if (!batch) return;
        actions.write({ op: 'research.batch.control', ...scope, batch_id: batch.batch.id,
            request: { action, expected_revision: batch.batch.revision, idempotency_key: researchKey() } }, value => setBatch(value as ScreeningBatchView), action === 'cancel');
    }
    function reprepare() {
        actions.read(async current => {
            const pending: string[] = [];
            for (let offset = 0; ;) {
                const page = await bridge.request({ op: 'research.queue', ...scope, request: {
                    protocol_version_id: protocol.id, stage, sort: 'TITLE', offset, limit: 50 } }) as ScreeningQueuePage;
                if (!current()) return;
                pending.push(...page.items.filter(row => batch?.batch.items.some(i => i.source_id === row.source_id && i.run_id)
                    && (!row.run_state || ['PREPARED', 'PAUSED', 'WAITING_PROVIDER'].includes(row.run_state))).map(row => row.source_id));
                offset += page.items.length;
                if (!page.items.length || offset >= page.total) break;
            }
            if (current() && pending.length) prepare(pending, true);
        });
    }
    function decide(row: ScreeningQueueRow, approve: boolean) {
        if (!row.artifact_version_id || !reviewer.trim()) return;
        const key = keys.current.get(row.artifact_version_id) ?? { review: researchKey(), adopt: researchKey() };
        keys.current.set(row.artifact_version_id, key);
        const previous = row.human.find(d => d.reviewer === reviewer)?.revision ?? 0;
        actions.read(async current => {
            let version = row.artifact_version_id!;
            if (approve) {
                const artifact = await bridge.request({ op: 'research.artifact', ...scope, version_id: version }) as ArtifactVersion;
                const reviewed = await bridge.request({ op: 'research.review', ...scope, version_id: version, request: {
                    expected_revision: artifact.revision, action: 'APPROVED', rationale: t.approvedInQueue, corrected_output: null, idempotency_key: key.review } }) as ArtifactVersion;
                version = reviewed.id;
            }
            await bridge.request({ op: 'research.screening.adopt', ...scope, request: {
                artifact_version_id: version, reviewer, expected_revision: previous, idempotency_key: key.adopt } }) as ScreeningDecision;
            if (!current()) return;
            setNotice(t.adopted); await loadQueue(queue?.offset ?? 0, current);
        }, true);
    }
    const open = (id: string) => actions.read(async () => { await bridge.request({ op: 'documents.open', ...scope, evidence_id: id }); });
    const label = (grade: number | null) => grade === null ? t.gradeNone : `${grade} · ${protocol.rubric?.find(r => r.grade === grade)?.label ?? ''}`;

    return <section aria-label={t.triage}><h3>{t.triage}</h3><p>{t.triageHelp}</p>
        <ResearchFeedback actions={actions} locale={locale}/>{notice && <p role="status">{notice}</p>}
        <fieldset disabled={actions.locked || running}><legend>{t.batch}</legend>
            <label>{t.stage}<select value={stage} onChange={e => setStage(e.target.value as Stage)}>{(['TITLE_ABSTRACT', 'FULL_TEXT'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
            <label>{t.selection}<select value={selection} onChange={e => setSelection(e.target.value as typeof selection)}>
                <option value="ALL">{t.selectionAll}</option><option value="NOT_HUMAN_EXCLUDED">{t.selectionNotExcluded}</option></select></label>
            {!settings && <p>{t.noProfile}</p>}
            <button type="button" disabled={!settings || !question.trim()} onClick={() => prepare()}>{t.prepareBatch}</button>
        </fieldset>
        {batch && <section aria-label={t.batch}><h4>{t.batch} · {t[batch.batch.state]} {reason(batch.batch.reason) && <>· {reason(batch.batch.reason)}</>}</h4>
            <p>{t.batchRuns}: {batch.batch.items.filter(i => i.run_id).length} · {Object.entries(batch.run_states).map(([state, n]) => `${(t as unknown as Record<string, string>)[state] ?? state}: ${n}`).join(' · ')}</p>
            <p>{t.estimateTotal}: {batch.batch.estimated_input_tokens} · {t.outputTotal}: {batch.batch.max_output_tokens}</p>
            {batch.batch.items.some(i => i.skipped) && <details><summary>{t.batchSkipped}: {batch.batch.items.filter(i => i.skipped).length}</summary>
                <ul>{batch.batch.items.filter(i => i.skipped).map(i => <li key={i.source_id}>{i.title || i.source_id.slice(0, 12)} · {skip(i.skipped!)}</li>)}</ul></details>}
            <div className="actions">
                <button type="button" className="primary" disabled={actions.locked || !['PREPARED', 'PAUSED'].includes(batch.batch.state)} onClick={() => control('start')}>{t.startBatch}</button>
                <button type="button" disabled={actions.uncertain || ['COMPLETE', 'CANCELLED'].includes(batch.batch.state)} onClick={() => control('cancel')}>{t.cancelBatch}</button>
                {batch.batch.reason === 'PREPARED_RUN_STALE' && <button type="button" disabled={actions.locked} onClick={reprepare}>{t.reprepare}</button>}
            </div></section>}
        <section aria-label={t.queue}><h4>{t.queue}</h4>
            <div className="source-filters"><label>{t.sort}<select value={sort} onChange={e => { const next = e.target.value as Sort; setSort(next); actions.read(c => loadQueue(0, c, next)); }}>
                {(['ATTENTION', 'GRADE', 'TITLE'] as const).map(v => <option key={v} value={v}>{t.sorts[v]}</option>)}</select></label>
                <label>{t.reviewer}<input maxLength={100} value={reviewer} onChange={e => setReviewer(e.target.value)}/></label>
                <button type="button" disabled={actions.locked} onClick={() => actions.read(c => loadQueue(queue?.offset ?? 0, c))}>{t.refresh}</button></div>
            <p>{t.reviewerHelp}</p>
            <ul className="research-list">{queue?.items.map(row => {
                const value = row.output ? relevanceOf(row.output) : null;
                const reviewed = row.review_state === 'APPROVED' || row.review_state === 'CORRECTED';
                const adopted = row.human.some(d => d.adopted_artifact_version_id === row.artifact_version_id);
                return <li key={row.source_id}><article>
                    <h5>{row.title}{row.year !== null && ` (${row.year})`}</h5>
                    <p>{t.aiProposal}: {row.output ? <>{t[row.output.decision]} · {t.relevance}: {label(value!.grade)}</> : row.artifact_version_id && !row.artifact_available ? t.unavailable : t.noProposal}
                        {row.run_state && <> · {t[row.run_state]}{row.run_reason && ` (${row.run_reason})`}</>}{row.review_state && <> · {t[row.review_state]}</>}</p>
                    {value && value.verdicts.length > 0 && <p>{value.verdicts.map(v => `${v.criterion_id}: ${t[v.verdict]}`).join(' · ')}</p>}
                    <p>{t.humanDecisions}: {row.human.length ? row.human.map(d => `${d.reviewer}: ${t[d.decision]}`).join(' · ') : '—'}{row.conflict && <> · <strong>{t.conflict}</strong></>}</p>
                    {row.output && <details><summary>{t.reusable} · {t.concerns}{value!.card && ` · ${t.card}`}</summary>
                        <p>{row.output.rationale}</p><RelevanceView output={row.output} protocol={protocol} locale={locale} busy={actions.locked} onOpen={open}/></details>}
                    <div className="actions">
                        {row.output && row.review_state === 'UNREVIEWED' && <button type="button" disabled={actions.locked || !reviewer.trim()} onClick={() => decide(row, true)}>{t.approveAdopt}</button>}
                        {row.output && reviewed && !adopted && <button type="button" disabled={actions.locked || !reviewer.trim()} onClick={() => decide(row, false)}>{t.adopt}</button>}
                        {row.run_id && <button type="button" disabled={actions.locked} onClick={() => onInspect(row.run_id!)}>{t.inspect}</button>}
                    </div></article></li>;
            })}</ul>
            {queue && queue.total > queue.limit && <nav className="actions" aria-label={t.queue}>
                <button type="button" disabled={actions.locked || queue.offset === 0} onClick={() => actions.read(c => loadQueue(Math.max(0, queue.offset - queue.limit), c))}>{t.previous}</button>
                <span>{queue.offset + 1}–{queue.offset + queue.items.length} / {queue.total}</span>
                <button type="button" disabled={actions.locked || queue.offset + queue.limit >= queue.total} onClick={() => actions.read(c => loadQueue(queue.offset + queue.limit, c))}>{t.next}</button></nav>}
        </section>
    </section>;
}
