import { useState } from 'react';
import type { ArtifactVersion, Locale, ResearchPreview } from '../bridge/types';
import { catalog } from './i18n';

type Claim = Extract<ArtifactVersion['output'], { kind: 'AUDIT' }>['claims'][number];
type Reference = Claim['references'][number];
type Inputs = ResearchPreview['inputs'];

export function auditReferencesValid(claim: Claim, inputs: Inputs): boolean {
    const cited = new Set(inputs.evidence.filter(value => claim.evidence_ids.includes(value.id)).map(value => value.source_id));
    return (claim.support === 'INSUFFICIENT_EVIDENCE' || claim.evidence_ids.length > 0) && claim.references.every(reference => {
        if (!reference.citation.trim()) return false;
        if (reference.relationship === 'DIRECT' && (!reference.source_id || !cited.has(reference.source_id))) return false;
        if (reference.relationship === 'NOT_IN_NOTEBOOK' && reference.source_id !== null) return false;
        return reference.source_id !== null || !inputs.studies.some(study => [study.title, study.doi].some(value => value && value.trim().toLocaleLowerCase() === reference.citation.trim().toLocaleLowerCase()));
    });
}

export function ResearchReference({ reference, inputs, evidenceIds, locale, onChange, onRemove }: {
    reference: Reference; inputs: Inputs; evidenceIds: string[]; locale: Locale; onChange: (reference: Reference) => void; onRemove: () => void;
}) {
    const t = catalog(locale).research;
    const [query, setQuery] = useState(''), [offset, setOffset] = useState(0);
    const cited = new Set(inputs.evidence.filter(value => evidenceIds.includes(value.id)).map(value => value.source_id));
    const allowed = inputs.studies.filter(study => reference.relationship === 'DIRECT' ? cited.has(study.source_id) : reference.relationship !== 'NOT_IN_NOTEBOOK');
    const filtered = allowed.filter(study => `${study.title} ${study.identity.library_id}/${study.identity.item_key}`.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
    const pageOffset = Math.min(offset, Math.max(0, Math.ceil(filtered.length / 20) - 1) * 20), page = filtered.slice(pageOffset, pageOffset + 20);
    const current = allowed.find(study => study.source_id === reference.source_id);
    const choices = current && !page.includes(current) ? [current, ...page] : page;
    return <fieldset><legend>{reference.citation || t.references}</legend>
        <label>{t.citation}<input maxLength={2000} value={reference.citation} onChange={event => onChange({ ...reference, citation: event.target.value })}/></label>
        <label>{t.relationship}<select value={reference.relationship} onChange={event => {
            const relationship = event.target.value as Reference['relationship']; setOffset(0); setQuery('');
            const source_id = relationship === 'NOT_IN_NOTEBOOK' || (relationship === 'DIRECT' && !cited.has(reference.source_id ?? '')) ? null : reference.source_id;
            onChange({ ...reference, relationship, source_id });
        }}>{(['DIRECT', 'INDIRECT_MENTION', 'NOT_IN_NOTEBOOK'] as const).map(value => <option key={value} value={value}>{t[value]}</option>)}</select></label>
        <label>{t.findSource}<input maxLength={2000} value={query} disabled={reference.relationship === 'NOT_IN_NOTEBOOK'} onChange={event => { setQuery(event.target.value); setOffset(0); }}/></label>
        <label>{t.referenceSource}<select aria-label={t.referenceSource} value={current?.source_id ?? ''} disabled={reference.relationship === 'NOT_IN_NOTEBOOK'} onChange={event => onChange({ ...reference, source_id: event.target.value || null })}>
            <option value="">{t.noReferenceSource}</option>{choices.map(study => <option key={study.source_id} value={study.source_id}>{study.title} · {study.identity.library_id}/{study.identity.item_key}</option>)}
        </select></label><p>{t.referenceSourceHelp}</p>
        {filtered.length > 20 && <div className="actions"><button type="button" disabled={pageOffset === 0} onClick={() => setOffset(Math.max(0, pageOffset - 20))}>{t.previous}</button>
            <span>{pageOffset + 1}–{Math.min(pageOffset + 20, filtered.length)} / {filtered.length}</span>
            <button type="button" disabled={pageOffset + 20 >= filtered.length} onClick={() => setOffset(pageOffset + 20)}>{t.next}</button></div>}
        <button type="button" onClick={onRemove}>{t.removeReference}</button>
    </fieldset>;
}
