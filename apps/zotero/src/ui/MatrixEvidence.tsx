import type { Evidence, Locale, PagePreview } from '../bridge/types';
import { catalog } from './i18n';

export function MatrixEvidence({evidence,image,locale,busy,onOpen}: {
    evidence:Evidence|null;image:PagePreview|null;locale:Locale;busy:boolean;onOpen:(id:string)=>void;
}) {
    const t=catalog(locale),m=t.matrix;
    if(!evidence&&!image)return null;
    return <aside className="matrix-evidence" aria-label={m.evidence}><h3>{m.evidence}</h3>
        {evidence&&<><p>{t.chat.validAnchor} · {t.chat.proposedSupport}</p><blockquote>{evidence.excerpt}</blockquote>
            <p>{t.sources.kinds[evidence.source_kind]} · {evidence.content_key} · {t.evidence.offsets}: {evidence.start}–{evidence.end}</p>
            <p><code>{evidence.document_version_id}</code>{evidence.historical?` · ${t.evidence.historical}`:''}</p>
            {evidence.page_index!==null&&<p>{t.evidence.page}: {evidence.page_index+1}</p>}
            {evidence.source_kind==='pdf'&&<button type="button" disabled={busy} onClick={()=>onOpen(evidence.id)}>{evidence.precision==='rectangles'?t.evidence.openExcerpt:t.evidence.openPage}</button>}
        </>}
        {image&&<><p>{m.visual}</p><img alt={m.visual} src={`data:image/png;base64,${image.data_base64}`}/></>}
    </aside>;
}
