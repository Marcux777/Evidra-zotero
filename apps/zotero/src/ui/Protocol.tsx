import { useEffect, useState } from 'react';
import type { Criterion, FormPage, ProjectContext, ProtocolPage, ProtocolVersion, RubricLevel } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';
type ReuseKind = NonNullable<ProjectContext['seeking']>[number];

export function Protocol(props: ResearchScope & { onSelect: (protocol: ProtocolVersion | null) => void }) {
    const { bridge, notebook_id, snapshot_id, locale, onSelect } = props, scope = { notebook_id, snapshot_id }, t = catalog(locale).research;
    const [page, setPage] = useState<ProtocolPage | null>(null), [selected, setSelected] = useState<ProtocolVersion | null>(null);
    const [forms, setForms] = useState<FormPage | null>(null), [form, setForm] = useState('');
    const [question, setQuestion] = useState(''), [objective, setObjective] = useState(''), [type, setType] = useState<ProtocolVersion['review_type']>('EXPLORATORY');
    const [criteria, setCriteria] = useState<Criterion[]>([{ id: 'criterion_1', text: '', kind: 'INCLUSION', applicability: 'BOTH' }]);
    const [description, setDescription] = useState(''), [methods, setMethods] = useState(''), [data, setData] = useState(''), [constraints, setConstraints] = useState('');
    const [seeking, setSeeking] = useState<ReuseKind[]>([]), [rubric, setRubric] = useState<RubricLevel[]>([]);
    const actions = useResearchActions(bridge, () => { setSelected(null); setPage(null); onSelect(null); });
    function display(value: ProtocolVersion) {
        setSelected(value); setQuestion(value.question); setObjective(value.objective); setType(value.review_type); setForm(value.form_version_id); setCriteria(value.criteria);
        const project = value.project ?? null;
        setDescription(project?.description ?? ''); setMethods((project?.methods ?? []).join('\n')); setData((project?.data ?? []).join('\n'));
        setConstraints((project?.constraints ?? []).join('\n')); setSeeking(project?.seeking ?? []); setRubric(value.rubric ?? []); onSelect(value);
    }
    const lines = (value: string) => value.split('\n').map(v => v.trim()).filter(Boolean);
    const project: ProjectContext | null = description.trim() ? { description: description.trim(), methods: lines(methods), data: lines(data), constraints: lines(constraints), seeking } : null;
    const rubricValid = rubric.length === 0 || rubric.length >= 2 && new Set(rubric.map(r => r.grade)).size === rubric.length
        && rubric.every(r => Number.isInteger(r.grade) && r.grade >= 0 && r.grade <= 5 && r.label.trim() && r.definition.trim());
    const listsValid = [methods, data, constraints].every(value => lines(value).length <= 20 && lines(value).every(v => v.length <= 2000));
    function level(index: number, update: Partial<RubricLevel>) { setRubric(old => old.map((value, i) => i === index ? { ...value, ...update } : value)); }
    async function load(offset: number, current: () => boolean) {
        const result = await bridge.request({ op: 'research.protocols', ...scope, offset }) as ProtocolPage;
        if (!current()) return; setPage(result); if (result.items[0]) display(result.items[0]);
    }
    useEffect(() => { actions.read(async current => {
        const result = await bridge.request({ op: 'matrix.forms', ...scope, offset: 0 }) as FormPage;
        if (!current()) return; setForms(result); setForm(result.items[0]?.id ?? ''); await load(0, current);
    }); }, []);
    const valid = !!form && question.trim() && objective.trim() && criteria.length > 0
        && criteria.every(c => /^[a-z][a-z0-9_]{0,63}$/.test(c.id) && c.text.trim()) && new Set(criteria.map(c => c.id)).size === criteria.length
        && rubricValid && listsValid;
    function change(index: number, update: Partial<Criterion>) { setCriteria(old => old.map((value, i) => i === index ? { ...value, ...update } : value)); }
    return <section aria-label={t.protocol}><h3>{t.protocol}</h3><ResearchFeedback actions={actions} locale={locale}/>
        {selected && <p>{t.version} {selected.revision} · {new Date(selected.created_at).toLocaleString(locale)}</p>}
        <div className="actions"><button type="button" disabled={actions.locked} onClick={() => actions.read(c => load(0, c))}>{t.refresh}</button>
            <button type="button" disabled={actions.locked || !page || page.offset === 0} onClick={() => actions.read(c => load(Math.max(0, page!.offset - 1), c))}>{t.previous}</button>
            <button type="button" disabled={actions.locked || !page || page.offset + page.limit >= page.total} onClick={() => actions.read(c => load(page!.offset + page!.limit, c))}>{t.next}</button></div>
        <fieldset disabled={actions.locked}><legend>{t.protocol}</legend>
            <label>{t.question}<textarea maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)}/></label>
            <label>{t.objective}<textarea maxLength={2000} value={objective} onChange={e => setObjective(e.target.value)}/></label>
            <label>{t.type}<select value={type} onChange={e => setType(e.target.value as typeof type)}>{(['EXPLORATORY', 'SYSTEMATIC'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
            <label>{t.form}<select value={form} onChange={e => setForm(e.target.value)}>
                {form && !forms?.items.some(f => f.id === form) && <option value={form}>{selected?.form_version_id}</option>}
                {forms?.items.map(value => <option key={value.id} value={value.id}>{value.name} · {value.revision}</option>)}</select></label>
            {!forms?.total && <p>{t.noForm}</p>}
            {forms && forms.total > forms.items.length && <div className="actions">{[-1, 1].map(direction => <button key={direction} type="button" disabled={direction < 0 ? forms.offset === 0 : forms.offset + forms.limit >= forms.total} onClick={() => actions.read(async current => {
                const result = await bridge.request({ op: 'matrix.forms', ...scope, offset: Math.max(0, forms.offset + direction) }) as FormPage;
                if (current()) { setForms(result); setForm(result.items[0]?.id ?? ''); }
            })}>{direction < 0 ? t.previous : t.next}</button>)}</div>}
            <h4>{t.criteria}</h4>{criteria.map((criterion, index) => <fieldset key={index}><legend>{t.criteria} {index + 1}</legend>
                <label>{t.criterionId}<input maxLength={64} value={criterion.id} onChange={e => change(index, { id: e.target.value })}/></label>
                <label>{t.criterionText}<textarea maxLength={2000} value={criterion.text} onChange={e => change(index, { text: e.target.value })}/></label>
                <label>{t.type}<select value={criterion.kind} onChange={e => change(index, { kind: e.target.value as Criterion['kind'] })}>{(['INCLUSION', 'EXCLUSION'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
                <label>{t.applicability}<select value={criterion.applicability} onChange={e => change(index, { applicability: e.target.value as Criterion['applicability'] })}>{(['TITLE_ABSTRACT', 'FULL_TEXT', 'BOTH'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
                <button type="button" disabled={criteria.length === 1} onClick={() => setCriteria(old => old.filter((_, i) => i !== index))}>{t.remove}</button>
            </fieldset>)}
            <button type="button" disabled={criteria.length >= 30} onClick={() => setCriteria(old => [...old, { id: `criterion_${researchKey().slice(0, 8)}`, text: '', kind: 'INCLUSION', applicability: 'BOTH' }])}>{t.add}</button>
            <h4>{t.project}</h4><p>{t.projectHelp}</p>
            <label>{t.projectDescription}<textarea maxLength={2000} value={description} onChange={e => setDescription(e.target.value)}/></label>
            <label>{t.projectMethods}<textarea value={methods} onChange={e => setMethods(e.target.value)}/></label>
            <label>{t.projectData}<textarea value={data} onChange={e => setData(e.target.value)}/></label>
            <label>{t.projectConstraints}<textarea value={constraints} onChange={e => setConstraints(e.target.value)}/></label>
            <fieldset><legend>{t.seeking}</legend>{(Object.keys(t.reuseKinds) as ReuseKind[]).map(kind => <label key={kind} className="source-check">
                <input type="checkbox" checked={seeking.includes(kind)} onChange={e => setSeeking(old => e.target.checked ? [...old, kind] : old.filter(v => v !== kind))}/>{t.reuseKinds[kind]}</label>)}</fieldset>
            <h4>{t.rubric}</h4><p>{t.rubricHelp}</p>
            <button type="button" onClick={() => setRubric(t.rubricSuggested.map(([label, definition], grade) => ({ grade, label: label!, definition: definition! })))}>{t.rubricDefault}</button>
            {rubric.map((value, index) => <fieldset key={index}><legend>{t.grade} {value.grade}</legend>
                <label>{t.grade}<input type="number" min={0} max={5} value={value.grade} onChange={e => level(index, { grade: Number(e.target.value) })}/></label>
                <label>{t.gradeLabel}<input maxLength={100} value={value.label} onChange={e => level(index, { label: e.target.value })}/></label>
                <label>{t.gradeDefinition}<textarea maxLength={2000} value={value.definition} onChange={e => level(index, { definition: e.target.value })}/></label>
                <button type="button" onClick={() => setRubric(old => old.filter((_, i) => i !== index))}>{t.remove}</button>
            </fieldset>)}
            <button type="button" disabled={rubric.length >= 6} onClick={() => setRubric(old => [...old, { grade: Math.min(5, Math.max(-1, ...old.map(r => r.grade)) + 1), label: '', definition: '' }])}>{t.addGrade}</button>
        </fieldset>
        <button type="button" disabled={actions.locked || !valid} onClick={() => actions.write({ op: 'research.protocol.write', ...scope, request: {
            question, objective, review_type: type, form_version_id: form, criteria, project, rubric, expected_revision: selected?.revision ?? 0, idempotency_key: researchKey(),
        } }, display)}>{t.saveProtocol}</button>
    </section>;
}
