import { useEffect, useRef, useState } from 'react';
import type { Evidence, Locale, RunRecord, UiBridge } from '../bridge/types';
import { catalog } from './i18n';
import { renderSafeMarkdown } from '../security/markdown';

export function EvidencePanel({ bridge, notebook_id, snapshot_id, run, locale }: {
    bridge: UiBridge; notebook_id: string; snapshot_id: string; run: RunRecord; locale: Locale;
}) {
    const t = catalog(locale), c = t.chat, d = t.evidence;
    const [evidence, setEvidence] = useState<Evidence | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const version = useRef(0), heading = useRef<HTMLHeadingElement>(null);
    useEffect(() => { setEvidence(null); setError(''); ++version.current; return () => { ++version.current; }; }, [run.id]);
    async function inspect(id: string, open = false) {
        if (busy) return;
        const epoch = ++version.current; setBusy(true); setError('');
        try {
            const result = await bridge.request({ op: open ? 'documents.open' : 'documents.evidence', notebook_id, snapshot_id, evidence_id: id }) as Evidence;
            if (epoch === version.current) { setEvidence(result); requestAnimationFrame(() => heading.current?.focus()); }
        } catch (failure) { if (epoch === version.current) { setEvidence(null); setError(failure instanceof Error ? failure.message : 'OPERATION_FAILED'); } }
        finally { if (epoch === version.current) setBusy(false); }
    }
    if (run.state !== 'COMPLETE' || !run.output) return null;
    return <section className="answer" aria-label={c.complete}>
        <h3>{c.complete}</h3><p>{c.proposedSupport}</p>
        <ol className="claims">{run.output.claims.map((claim, index) => <li key={index}>
            <div className="claim-text" dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(claim.text) }}/><p className="source-meta">{claim.kind === 'general' ? c.general : claim.kind === 'visual_proposal' ? c.visualProposal : c.proposedSupport}</p>
            {claim.evidence.map((citation, citationIndex) => <div key={`${citation.evidence_id}:${citationIndex}`}><blockquote>{citation.excerpt}</blockquote>
                <button type="button" disabled={busy} onClick={() => void inspect(citation.evidence_id)}>{d.inspect}</button></div>)}
        </li>)}</ol>
        {error && <p role="alert" className="source-error">{error}</p>}
        {evidence && <aside className="evidence-panel"><h4 tabIndex={-1} ref={heading}>{c.validAnchor}</h4><p>{c.proposedSupport}</p><blockquote>{evidence.excerpt}</blockquote>
            <p>{t.sources.kinds[evidence.source_kind]} · {evidence.content_key} · {d.offsets}: {evidence.start}–{evidence.end}</p>
            <p><code>{evidence.document_version_id}</code>{evidence.historical && ` · ${d.historical}`}</p>
            {evidence.page_index !== null && <p>{d.page}: {evidence.page_index + 1} · {d.label}: {evidence.page_label ?? '—'}</p>}
            {evidence.source_kind === 'pdf' && <button type="button" disabled={busy} onClick={() => void inspect(evidence.id, true)}>{evidence.precision === 'rectangles' ? d.openExcerpt : d.openPage}</button>}
        </aside>}
    </section>;
}
