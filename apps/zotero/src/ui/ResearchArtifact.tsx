import { useState } from 'react';
import type { ArtifactPage, ArtifactVersion, ResearchPreview } from '../bridge/types';
import { catalog } from './i18n';
import { ResearchFeedback, researchKey, useResearchActions, type ResearchScope } from './research-actions';
import { NotePreview } from './NotePreview';
import { ResearchCells, ResearchEvidence } from './ResearchAssociations';

export function ResearchArtifact(props: ResearchScope & { artifact: ArtifactVersion; preview: ResearchPreview; onChange: (value: ArtifactVersion) => void }) {
    const { artifact, preview, onChange, bridge, notebook_id, snapshot_id, locale } = props;
    const t = catalog(locale).research, scope = { notebook_id, snapshot_id };
    const [draft, setDraft] = useState(artifact.output), [rationale, setRationale] = useState('');
    const [history, setHistory] = useState<ArtifactPage | null>(null), [visible, setVisible] = useState(true);
    const actions = useResearchActions(bridge, () => setVisible(false));
    const label = (key: string) => (t as Record<string, string>)[key] ?? key;
    const output = artifact.output;
    const selectedIds = new Set(output.kind === 'SCREENING' ? output.evidence_ids
        : output.kind === 'SYNTHESIS' ? output.sections.flatMap(section => section.evidence_ids) : output.claims.flatMap(claim => claim.evidence_ids));
    const openEvidence = (id: string) => actions.read(async () => { await bridge.request({ op: 'documents.open', ...scope, evidence_id: id }); });
    const references = (ids: string[]) => <ResearchEvidence evidence={preview.inputs.evidence.filter(value => ids.includes(value.id))} studies={preview.inputs.studies} locale={locale} busy={actions.locked} onOpen={openEvidence}/>;
    if (!visible) return <ResearchFeedback actions={actions} locale={locale}/>;
    async function versions(offset: number, current: () => boolean) {
        const page = await bridge.request({ op: 'research.versions', ...scope, version_id: artifact.id, offset }) as ArtifactPage;
        if (current()) setHistory(page);
    }
    function review(action: 'APPROVED' | 'CORRECTED' | 'REJECTED') {
        actions.write({ op: 'research.review', ...scope, version_id: artifact.id, request: { expected_revision: artifact.revision,
            action, rationale, corrected_output: action === 'CORRECTED' ? draft : null, idempotency_key: researchKey() } }, onChange);
    }
    return <section aria-label={t.artifact}><h3>{t.artifact} · {t.version} {artifact.revision}</h3>
        <p>{t[artifact.review_state]} · {artifact.author} · {new Date(artifact.created_at).toLocaleString(locale)}</p><p>{t.proposalHelp}</p>
        <ResearchFeedback actions={actions} locale={locale}/>
        <p>{artifact.coverage.complete ? t.complete : t.partial} · {t.studies}: {artifact.coverage.included_studies}/{artifact.coverage.snapshot_members}</p>
        <p>{t.reviewed}: {artifact.coverage.reviewed_cells} · {t.unreviewedCount}: {artifact.coverage.unreviewed_cells} · {t.chunks}: {artifact.coverage.evidence_chunks}/{artifact.coverage.candidate_chunks}</p>
        {output.kind === 'SCREENING' ? <article><h4>{t[output.decision]}</h4><p>{output.rationale}</p><p>{output.criterion_ids.join(', ')}</p>{references(output.evidence_ids)}</article>
            : output.kind === 'SYNTHESIS' ? <>{output.sections.map((section, i) => <article key={i}><h4>{section.heading}</h4><p>{section.text}</p>
                <p>{t.basis}: {t[section.basis]}</p><p>{t.comparison}: {section.comparability}</p>
                <ResearchCells cells={preview.inputs.cells.filter(cell => section.cell_ids.includes(cell.id))} studies={preview.inputs.studies} locale={locale}/>{references(section.evidence_ids)}</article>)}<h4>{t.limitations}</h4>{output.limitations.map((text, i) => <p key={i}>{text}</p>)}</>
            : <>{output.claims.map((claim, i) => <article key={i}><blockquote>{claim.text}</blockquote><strong>{t[claim.support]}</strong><p>{claim.explanation}</p>
                {claim.references.map((ref, j) => { const study = preview.inputs.studies.find(value => value.source_id === ref.source_id);
                    return <p key={j}>{ref.citation} · {t[ref.relationship]}{study && <> · {study.title} · {study.identity.library_id}/{study.identity.item_key}</>}</p>; })}
                {references(claim.evidence_ids)}</article>)}<p>{output.collection_limitations}</p></>}
        {preview.inputs.evidence.some(value => !selectedIds.has(value.id)) && <details><summary>{t.otherEvidence}</summary>
            <ResearchEvidence evidence={preview.inputs.evidence.filter(value => !selectedIds.has(value.id))} studies={preview.inputs.studies} locale={locale} busy={actions.locked} onOpen={openEvidence} heading={t.evidence}/>
        </details>}
        <details><summary>{t.review}</summary><fieldset disabled={actions.locked}><legend>{t.review}</legend>
            <label>{t.rationale}<textarea maxLength={2000} value={rationale} onChange={e => setRationale(e.target.value)}/></label>
            {draft.kind === 'SCREENING' && <><label>{t.decision}<select value={draft.decision} onChange={e => setDraft({ ...draft, decision: e.target.value as typeof draft.decision })}>{(['INCLUDE', 'EXCLUDE', 'UNCERTAIN'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
                <label>{t.rationale}<textarea maxLength={2000} value={draft.rationale} onChange={e => setDraft({ ...draft, rationale: e.target.value })}/></label>
                {preview.inputs.protocol.criteria.map(c => <label key={c.id}><input type="checkbox" checked={draft.criterion_ids.includes(c.id)} onChange={e => setDraft({ ...draft, criterion_ids: e.target.checked ? [...draft.criterion_ids, c.id] : draft.criterion_ids.filter(id => id !== c.id) })}/>{c.id}: {c.text}</label>)}</>}
            {draft.kind === 'SYNTHESIS' && <>{draft.sections.map((section, i) => <fieldset key={i}><legend>{t.text} {i + 1}</legend>
                {(['heading', 'text', 'comparability'] as const).map(field => <label key={field}>{field === 'comparability' ? t.comparison : t[field]}<textarea maxLength={2000} value={section[field]} onChange={e => setDraft({ ...draft, sections: draft.sections.map((v, j) => j === i ? { ...v, [field]: e.target.value } : v) })}/></label>)}</fieldset>)}
                {draft.limitations.map((value, i) => <label key={i}>{t.limitations} {i + 1}<textarea maxLength={2000} value={value} onChange={e => setDraft({ ...draft, limitations: draft.limitations.map((v, j) => j === i ? e.target.value : v) })}/></label>)}</>}
            {draft.kind === 'AUDIT' && <>{draft.claims.map((claim, i) => <fieldset key={i}><legend>{claim.text}</legend>
                <label>{t.decision}<select value={claim.support} onChange={e => setDraft({ ...draft, claims: draft.claims.map((v, j) => j === i ? { ...v, support: e.target.value as typeof v.support } : v) })}>
                    {(['SUPPORTED_PROPOSAL', 'PARTIALLY_SUPPORTED_PROPOSAL', 'CONTRADICTED_PROPOSAL', 'INSUFFICIENT_EVIDENCE'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>
                <label>{t.rationale}<textarea maxLength={2000} value={claim.explanation} onChange={e => setDraft({ ...draft, claims: draft.claims.map((v, j) => j === i ? { ...v, explanation: e.target.value } : v) })}/></label>
                {claim.references.map((ref, r) => <label key={r}>{ref.citation}<select value={ref.relationship} onChange={e => setDraft({ ...draft, claims: draft.claims.map((v, j) => j === i ? { ...v, references: v.references.map((value, k) => k === r ? { ...value, relationship: e.target.value as typeof value.relationship } : value) } : v) })}>
                    {(['DIRECT', 'INDIRECT_MENTION', 'NOT_IN_NOTEBOOK'] as const).map(v => <option key={v} value={v}>{t[v]}</option>)}</select></label>)}</fieldset>)}
                <label>{t.limitations}<textarea maxLength={2000} value={draft.collection_limitations} onChange={e => setDraft({ ...draft, collection_limitations: e.target.value })}/></label></>}
        </fieldset><div className="actions">{(['APPROVED', 'CORRECTED', 'REJECTED'] as const).map(v => <button type="button" key={v} disabled={actions.locked || !rationale.trim()} onClick={() => review(v)}>{v === 'APPROVED' ? t.approve : v === 'CORRECTED' ? t.correct : t.reject}</button>)}</div></details>
        <details><summary>{t.version}</summary><button type="button" disabled={actions.locked} onClick={() => actions.read(c => versions(0, c))}>{t.refresh}</button>
            {history?.items.map(value => <p key={value.id}><button type="button" disabled={actions.locked} onClick={() => onChange(value)}>{t.version} {value.revision} · {label(value.review_state)}</button></p>)}
            {history && <div className="actions"><button type="button" disabled={actions.locked || history.offset === 0} onClick={() => actions.read(c => versions(Math.max(0, history.offset - 1), c))}>{t.previous}</button>
                <button type="button" disabled={actions.locked || history.offset + history.limit >= history.total} onClick={() => actions.read(c => versions(history.offset + history.limit, c))}>{t.next}</button></div>}</details>
        <NotePreview {...props} artifact={artifact}/>
    </section>;
}
