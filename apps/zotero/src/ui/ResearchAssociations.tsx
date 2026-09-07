import { useState } from 'react';
import type { Locale, ResearchPreview } from '../bridge/types';
import { catalog } from './i18n';
import { ValueDisplay } from './MatrixValue';
import { MatrixEvidence } from './MatrixEvidence';

type Inputs = ResearchPreview['inputs'];

export function ResearchEvidence({ evidence, studies, locale, busy, onOpen, heading }: { evidence: Inputs['evidence']; studies: Inputs['studies']; locale: Locale; busy: boolean; onOpen: (id: string) => void; heading?: string }) {
    const t = catalog(locale).research;
    const [offset, setOffset] = useState(0);
    return <section aria-label={heading ?? t.selectedEvidence}><h5>{heading ?? t.selectedEvidence}</h5>
        {evidence.length === 0 && <p>{t.noSelectedEvidence}</p>}
        {evidence.slice(offset, offset + 10).map(value => <div key={value.id} className="research-reference">
            <strong>{studies.find(study => study.source_id === value.source_id)?.title}</strong>
            <p>{value.source_identity.library_id}/{value.source_identity.item_key}</p><code>{value.id}</code>
            <MatrixEvidence evidence={value} image={null} locale={locale} busy={busy} onOpen={onOpen}/>
        </div>)}
        {evidence.length > 10 && <div className="actions"><button type="button" disabled={offset === 0} onClick={() => setOffset(old => Math.max(0, old - 10))}>{t.previous}</button>
            <span>{offset + 1}–{Math.min(offset + 10, evidence.length)} / {evidence.length}</span>
            <button type="button" disabled={offset + 10 >= evidence.length} onClick={() => setOffset(old => old + 10)}>{t.next}</button></div>}
    </section>;
}

export function ResearchCells({ cells, studies, locale }: { cells: Inputs['cells']; studies: Inputs['studies']; locale: Locale }) {
    const t = catalog(locale).research, m = catalog(locale).matrix;
    const [offset, setOffset] = useState(0);
    return <section aria-label={t.selectedCells}><h5>{t.selectedCells}</h5>
        {cells.slice(offset, offset + 10).map(value => {
            const cell = value.cell, identity = studies.find(study => study.source_id === cell.source_id)?.identity;
            return <div key={value.id} className="research-reference"><strong>{cell.source_title} · {cell.field_key}</strong>
                <p>{identity?.library_id}/{identity?.item_key} · {t.basis}: {t[value.basis]} · {m.reviews[cell.review_state]} · {t.version} {cell.revision}</p>
                <ValueDisplay value={cell.value} locale={locale}/><p>{cell.value_state ? m.values[cell.value_state] : m.undecided}</p>
                <p>{t.form}: <code>{cell.form_version_id}</code> · {t.fieldOrigin}: <code>{cell.field_origin_form_version_id}</code></p>
                <p>{t.cellProvenance}: <code>{value.id}</code>{cell.proposal_id && <> · <code>{cell.proposal_id}</code></>}</p>
            </div>;
        })}
        {cells.length > 10 && <div className="actions"><button type="button" disabled={offset === 0} onClick={() => setOffset(old => Math.max(0, old - 10))}>{t.previous}</button>
            <span>{offset + 1}–{Math.min(offset + 10, cells.length)} / {cells.length}</span>
            <button type="button" disabled={offset + 10 >= cells.length} onClick={() => setOffset(old => old + 10)}>{t.next}</button></div>}
    </section>;
}
