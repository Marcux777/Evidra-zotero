import type { Locale, ProtocolVersion, ResearchPreview, ScreeningOutput } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchEvidence } from './ResearchAssociations';

type Stage = 'TITLE_ABSTRACT' | 'FULL_TEXT';
type Verdict = { criterion_id: string; verdict: 'MET' | 'NOT_MET' | 'UNCLEAR'; evidence_ids: string[] };
type Card = NonNullable<ScreeningOutput['card']>;

/** Relevance fields with their contract defaults made explicit (older outputs omit them). */
export function relevanceOf(output: ScreeningOutput) {
    return {
        grade: output.relevance_grade ?? null,
        verdicts: (output.verdicts ?? []).map(v => ({ ...v, evidence_ids: v.evidence_ids ?? [] })) as Verdict[],
        reusable: output.reusable ?? [],
        concerns: (output.concerns ?? []).map(c => ({ ...c, evidence_ids: c.evidence_ids ?? [] })),
        card: output.card ?? null,
    };
}

export function hasRelevance(output: ScreeningOutput): boolean {
    const value = relevanceOf(output);
    return value.grade !== null || value.verdicts.length > 0 || value.card !== null;
}

function Anchors({ ids, locale, busy, onOpen }: { ids: string[]; locale: Locale; busy: boolean; onOpen: (id: string) => void }) {
    const t = catalog(locale).research;
    return <>{ids.map((id, i) => <button key={id} type="button" className="link" disabled={busy} title={id} onClick={() => onOpen(id)}>{t.openEvidence} {i + 1}</button>)}</>;
}

/** Relevance proposal: verdicts, grade, reuse, concerns and the full-text paper card. */
export function RelevanceView({ output, protocol, locale, busy, onOpen }: {
    output: ScreeningOutput; protocol: ProtocolVersion | null; locale: Locale; busy: boolean; onOpen: (id: string) => void;
}) {
    const t = catalog(locale).research, value = relevanceOf(output);
    const level = (protocol?.rubric ?? []).find(r => r.grade === value.grade);
    const criterion = (id: string) => protocol?.criteria.find(c => c.id === id)?.text;
    const points = (heading: string, values: Card['strengths']) => values.length > 0 && <><h6>{heading}</h6>
        <ul>{values.map((point, i) => <li key={i}>{point.text} <Anchors ids={point.evidence_ids} locale={locale} busy={busy} onOpen={onOpen}/></li>)}</ul></>;
    return <div className="relevance">
        <p><strong>{t.relevance}:</strong> {value.grade === null ? t.gradeNone : `${value.grade}${level ? ` · ${level.label}` : ''}`}</p>
        {value.verdicts.length > 0 && <><h5>{t.verdicts}</h5><ul>{value.verdicts.map(v => <li key={v.criterion_id}>
            <code>{v.criterion_id}</code>{criterion(v.criterion_id) && <> · {criterion(v.criterion_id)}</>}: <strong>{t[v.verdict]}</strong> <Anchors ids={v.evidence_ids} locale={locale} busy={busy} onOpen={onOpen}/>
        </li>)}</ul></>}
        {value.reusable.length > 0 && <><h5>{t.reusable}</h5><ul>{value.reusable.map((item, i) => <li key={i}>
            <strong>{t.reuseKinds[item.kind]}</strong>: {item.text}<br/>{t.use}: {item.use} <Anchors ids={item.evidence_ids} locale={locale} busy={busy} onOpen={onOpen}/>
        </li>)}</ul></>}
        {value.concerns.length > 0 && <><h5>{t.concerns}</h5><ul>{value.concerns.map((item, i) => <li key={i}>
            {item.text} <Anchors ids={item.evidence_ids} locale={locale} busy={busy} onOpen={onOpen}/></li>)}</ul></>}
        {value.card && <details open><summary>{t.card}</summary><p>{value.card.summary}</p>
            {points(t.contributions, value.card.contributions)}{points(t.strengths, value.card.strengths)}{points(t.cardLimitations, value.card.limitations)}
            {value.card.questions.length > 0 && <><h6>{t.questions}</h6><ul>{value.card.questions.map((q, i) => <li key={i}>{q}</li>)}</ul></>}
        </details>}
    </div>;
}

function applicable(protocol: ProtocolVersion, stage: Stage) {
    return protocol.criteria.filter(c => c.applicability === 'BOTH' || c.applicability === stage);
}

/** Client mirror of the engine's relevance rules, so a correction can always be completed. */
export function relevanceValid(draft: ScreeningOutput, protocol: ProtocolVersion, stage: Stage): boolean {
    const rubric = protocol.rubric ?? [], value = relevanceOf(draft);
    if (!rubric.length) return true;
    const criteria = applicable(protocol, stage);
    const ids = value.verdicts.map(v => v.criterion_id);
    if (ids.length !== criteria.length || new Set(ids).size !== ids.length || !criteria.every(c => ids.includes(c.id))) return false;
    if (value.verdicts.some(v => v.verdict !== 'UNCLEAR' && !v.evidence_ids.length)) return false;
    if (value.grade === null ? draft.decision !== 'UNCERTAIN' : !rubric.some(r => r.grade === value.grade)) return false;
    const blocking = value.verdicts.some(v => {
        const kind = criteria.find(c => c.id === v.criterion_id)?.kind;
        return v.verdict === 'NOT_MET' && kind === 'INCLUSION' || v.verdict === 'MET' && kind === 'EXCLUSION';
    });
    if (draft.decision === 'INCLUDE' && blocking || draft.decision === 'EXCLUDE' && !blocking) return false;
    return (stage === 'FULL_TEXT') === (value.card !== null);
}

/** Human correction of the grade and each criterion verdict, with its own prepared anchors. */
export function RelevanceEditor({ draft, protocol, stage, preview, locale, busy, onOpen, onChange }: {
    draft: ScreeningOutput; protocol: ProtocolVersion; stage: Stage; preview: ResearchPreview; locale: Locale; busy: boolean;
    onOpen: (id: string) => void; onChange: (value: ScreeningOutput) => void;
}) {
    const t = catalog(locale).research, value = relevanceOf(draft);
    const verdicts: Verdict[] = applicable(protocol, stage).map(c => value.verdicts.find(v => v.criterion_id === c.id)
        ?? { criterion_id: c.id, verdict: 'UNCLEAR', evidence_ids: [] });
    const update = (id: string, patch: Partial<Verdict>) => onChange({ ...draft, verdicts: verdicts.map(v => v.criterion_id === id ? { ...v, ...patch } : v) });
    return <fieldset><legend>{t.relevance}</legend>
        <label>{t.grade}<select value={value.grade === null ? '' : String(value.grade)}
            onChange={e => onChange({ ...draft, verdicts, relevance_grade: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">{t.gradeNone}</option>
            {(protocol.rubric ?? []).map(r => <option key={r.grade} value={r.grade}>{r.grade} · {r.label}</option>)}</select></label>
        {verdicts.map(v => <fieldset key={v.criterion_id}><legend>{v.criterion_id}: {protocol.criteria.find(c => c.id === v.criterion_id)?.text}</legend>
            <label>{t.verdicts}<select value={v.verdict} onChange={e => update(v.criterion_id, { verdict: e.target.value as Verdict['verdict'] })}>
                {(['MET', 'NOT_MET', 'UNCLEAR'] as const).map(value => <option key={value} value={value}>{t[value]}</option>)}</select></label>
            <ResearchEvidence evidence={preview.inputs.evidence} studies={preview.inputs.studies} locale={locale} busy={busy} onOpen={onOpen}
                selected={v.evidence_ids} onChange={evidence_ids => update(v.criterion_id, { evidence_ids: evidence_ids.slice(0, 6) })}/>
        </fieldset>)}
        {!relevanceValid({ ...draft, verdicts }, protocol, stage) && <p role="status">{t.relevanceInvalid}</p>}
    </fieldset>;
}
