import { useEffect, useState } from 'react';
import type { ProtocolVersion, ScreeningPage, ScreeningWrite, Source } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';

export function Screening(props: ResearchScope & { protocol: ProtocolVersion; source: Source | null }) {
    const { bridge, notebook_id, snapshot_id, locale, protocol, source } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [page, setPage] = useState<ScreeningPage | null>(null), [stage, setStage] = useState<ScreeningWrite['stage']>('TITLE_ABSTRACT');
    const [reviewer, setReviewer] = useState(''), [rationale, setRationale] = useState(''), [decision, setDecision] = useState<ScreeningWrite['decision']>('UNCERTAIN');
    const [criteria, setCriteria] = useState<string[]>([]), [notice, setNotice] = useState('');
    const [record, setRecord] = useState<ScreeningPage['items'][number] | null>(null), [known, setKnown] = useState(false);
    const [refreshRevision, setRefreshRevision] = useState(0);
    const actions = useResearchActions(bridge, () => { setPage(null); setRecord(null); setKnown(false); });
    async function load(offset: number, current: () => boolean) {
        const result = await bridge.request({ op: 'research.screening', ...scope, protocol_id: protocol.id, offset }) as ScreeningPage;
        if (current()) setPage(result);
    }
    useEffect(() => {
        setRecord(null); setKnown(false);
        if (!source) return;
        actions.read(async current => {
            for (let offset = 0; ;) {
                const result = await bridge.request({ op: 'research.screening', ...scope, protocol_id: protocol.id, offset }) as ScreeningPage;
                if (!current()) return;
                if (offset === 0) setPage(result);
                const row = result.items.find(r => r.source_id === source.id && r.stage === stage);
                if (row) { setRecord(row); setKnown(true); return; }
                offset += result.items.length;
                if (offset >= result.total) { setKnown(true); return; }
                if (!result.items.length) throw new Error('INVALID_SCREENING_PAGE');
            }
        }, true);
    }, [source?.id, stage, protocol.id, refreshRevision]);
    const row = record;
    const previous = row?.decisions.find(d => d.reviewer === reviewer);
    const applicable = protocol.criteria.filter(c => c.applicability === 'BOTH' || c.applicability === stage);
    return <section aria-label={t.screening}><h3>{t.screening}</h3><p>{t.reviewerHelp}</p><p>{t.missing}</p>
        <ResearchFeedback actions={actions} locale={locale}/>{notice && <p role="status">{notice}</p>}
        {page && <p>{t.members}: {page.snapshot_members} · {t.events}: {page.observed_decision_events} · {t.historic}</p>}
        <button type="button" disabled={actions.locked} onClick={() => setRefreshRevision(old => old + 1)}>{t.refresh}</button>
        <ul className="research-list">{page?.items.map(value => <li key={value.source_id + value.stage}>
            <code>{value.source_id.slice(0, 12)}</code> · {t[value.stage]} {value.conflict && <strong>{t.conflict}</strong>}
            {value.decisions.map(d => <p key={d.id}>{d.reviewer}: {t[d.decision]} · {d.rationale} · {t.version} {d.revision}</p>)}
        </li>)}</ul>
        {page && <nav className="actions" aria-label={t.screening}>
            <button type="button" disabled={actions.locked || page.offset === 0} onClick={() => actions.read(c => load(Math.max(0, page.offset - 20), c))}>{t.previous}</button>
            <button type="button" disabled={actions.locked || page.offset + page.limit >= page.total} onClick={() => actions.read(c => load(page.offset + page.limit, c))}>{t.next}</button></nav>}
        {!source ? <p>{t.noSources}</p> : <><p>{t.source}: {source.title}</p><fieldset disabled={actions.locked}><legend>{t.screening}</legend>
            <label>{t.stage}<select value={stage} onChange={e => { setStage(e.target.value as typeof stage); setCriteria([]); }}>{(['TITLE_ABSTRACT', 'FULL_TEXT'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
            <label>{t.reviewer}<input maxLength={100} value={reviewer} onChange={e => setReviewer(e.target.value)}/></label>
            <label>{t.decision}<select value={decision} onChange={e => setDecision(e.target.value as typeof decision)}>{(['INCLUDE', 'EXCLUDE', 'UNCERTAIN'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
            {applicable.map(c => <label key={c.id}><input type="checkbox" checked={criteria.includes(c.id)} onChange={e => setCriteria(old => e.target.checked ? [...old, c.id] : old.filter(id => id !== c.id))}/>{c.id}: {c.text}</label>)}
            <label>{t.rationale}<textarea maxLength={2000} value={rationale} onChange={e => setRationale(e.target.value)}/></label>
        </fieldset><button type="button" disabled={actions.locked || !reviewer.trim() || !rationale.trim() || !criteria.length || !known}
            onClick={() => actions.write({ op: 'research.screening.decide', ...scope, request: {
                protocol_version_id: protocol.id, source_id: source.id, stage, reviewer, decision, criterion_ids: criteria,
                rationale, expected_revision: previous?.revision ?? 0, idempotency_key: researchKey(),
            } }, value => {
                const decisions = [...(row?.decisions ?? []).filter(d => d.reviewer !== reviewer), value];
                const updated = { source_id: source.id, stage, decisions, conflict: new Set(decisions.map(d => d.decision)).size > 1 };
                setRecord(updated); setNotice(t.saved);
                setRefreshRevision(old => old + 1);
                setPage(old => old && ({ ...old, observed_decision_events: old.observed_decision_events + 1,
                    items: old.items.map(r => r.source_id === source.id && r.stage === stage ? updated : r) }));
            })}>{t.saveDecision}</button></>}
    </section>;
}
