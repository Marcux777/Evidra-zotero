import { useState } from 'react';
import type { Locale, ResearchPreview } from '../bridge/types';
import { catalog } from './i18n';
import { ValueDisplay } from './MatrixValue';
import { MatrixEvidence } from './MatrixEvidence';

type Inputs = ResearchPreview['inputs'];

export function ResearchEvidence({ evidence, studies, locale, busy, onOpen, heading, selected, onChange }: { evidence: Inputs['evidence']; studies: Inputs['studies']; locale: Locale; busy: boolean; onOpen: (id: string) => void; heading?: string; selected?: string[]; onChange?: (ids: string[]) => void }) {
    const t = catalog(locale).research;
    const [offset, setOffset] = useState(0), [query, setQuery] = useState('');
    const filtered = evidence.filter(value => !query || `${value.excerpt} ${value.id} ${value.content_key} ${studies.find(study => study.source_id === value.source_id)?.title}`.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
    const pageOffset = Math.min(offset, Math.max(0, Math.ceil(filtered.length / 10) - 1) * 10);
    return <section aria-label={heading ?? t.selectedEvidence}><h5>{heading ?? t.selectedEvidence}</h5>
        {onChange && <><label>{t.findPrepared}<input maxLength={2000} value={query} onChange={event => { setQuery(event.target.value); setOffset(0); }}/></label><p>{t.selectedEvidence}: {selected?.length ?? 0} / 12</p></>}
        {evidence.length === 0 && <p>{t.noSelectedEvidence}</p>}
        {filtered.slice(pageOffset, pageOffset + 10).map(value => <div key={value.id} className="research-reference">
            {onChange && <label><input type="checkbox" checked={selected?.includes(value.id) ?? false} disabled={busy || (selected?.length === 12 && !selected.includes(value.id))}
                onChange={event => onChange(event.target.checked ? [...(selected ?? []), value.id] : (selected ?? []).filter(id => id !== value.id))}/>{value.excerpt}</label>}
            <strong>{studies.find(study => study.source_id === value.source_id)?.title}</strong>
            <p>{value.source_identity.library_id}/{value.source_identity.item_key}</p><code>{value.id}</code>
            <MatrixEvidence evidence={value} image={null} locale={locale} busy={busy} onOpen={onOpen}/>
        </div>)}
        {filtered.length > 10 && <div className="actions"><button type="button" disabled={busy || pageOffset === 0} onClick={() => setOffset(Math.max(0, pageOffset - 10))}>{t.previous}</button>
            <span>{pageOffset + 1}–{Math.min(pageOffset + 10, filtered.length)} / {filtered.length}</span>
            <button type="button" disabled={busy || pageOffset + 10 >= filtered.length} onClick={() => setOffset(pageOffset + 10)}>{t.next}</button></div>}
    </section>;
}

export function ResearchCells({ cells, studies, locale, selected, onChange }: { cells: Inputs['cells']; studies: Inputs['studies']; locale: Locale; selected?: string[]; onChange?: (ids: string[]) => void }) {
    const t = catalog(locale).research, m = catalog(locale).matrix;
    const [offset, setOffset] = useState(0), [query, setQuery] = useState('');
    const filtered = cells.filter(value => !query || `${value.cell.source_title} ${value.cell.field_key} ${value.id}`.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)));
    const pageOffset = Math.min(offset, Math.max(0, Math.ceil(filtered.length / 10) - 1) * 10);
    return <section aria-label={t.selectedCells}><h5>{t.selectedCells}</h5>
        {onChange && <><label>{t.findPrepared}<input maxLength={2000} value={query} onChange={event => { setQuery(event.target.value); setOffset(0); }}/></label><p>{t.selectedCells}: {selected?.length ?? 0} / 50</p><p>{t.cellSelectionHelp}</p></>}
        {filtered.slice(pageOffset, pageOffset + 10).map(value => {
            const cell = value.cell, identity = studies.find(study => study.source_id === cell.source_id)?.identity;
            return <div key={value.id} className="research-reference">
                {onChange && <label><input type="checkbox" checked={selected?.includes(value.id) ?? false} disabled={selected?.length === 50 && !selected.includes(value.id)}
                    onChange={event => onChange(event.target.checked ? [...(selected ?? []), value.id] : (selected ?? []).filter(id => id !== value.id))}/>{cell.source_title} · {cell.field_key}</label>}
                <strong>{cell.source_title} · {cell.field_key}</strong>
                <p>{identity?.library_id}/{identity?.item_key} · {t.basis}: {t[value.basis]} · {m.reviews[cell.review_state]} · {t.version} {cell.revision}</p>
                <ValueDisplay value={cell.value} locale={locale}/><p>{cell.value_state ? m.values[cell.value_state] : m.undecided}</p>
                <p>{t.form}: <code>{cell.form_version_id}</code> · {t.fieldOrigin}: <code>{cell.field_origin_form_version_id}</code></p>
                <p>{t.cellProvenance}: <code>{value.id}</code>{cell.proposal_id && <> · <code>{cell.proposal_id}</code></>}</p>
            </div>;
        })}
        {filtered.length > 10 && <div className="actions"><button type="button" disabled={pageOffset === 0} onClick={() => setOffset(Math.max(0, pageOffset - 10))}>{t.previous}</button>
            <span>{pageOffset + 1}–{Math.min(pageOffset + 10, filtered.length)} / {filtered.length}</span>
            <button type="button" disabled={pageOffset + 10 >= filtered.length} onClick={() => setOffset(pageOffset + 10)}>{t.next}</button></div>}
    </section>;
}
