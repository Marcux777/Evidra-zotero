import { useState } from 'react';
import type { DecisionPage, DecisionWrite, ExtractionProposal, FieldDefinition, Locale, MatrixCell, ProposalPage, SearchPage } from '../bridge/types';
import { catalog } from './i18n';
import { ValueDisplay, ValueEditor } from './MatrixValue';

type State = NonNullable<MatrixCell['value_state']>;
export function ProposalReview({cell,field,locale,busy,readOnly,proposals,history,hits,onSearch,onInspect,onVisual,onPropose,onDecide,onPage,onHistory,onBulk}: {
    cell:MatrixCell;field:FieldDefinition;locale:Locale;busy:boolean;readOnly:boolean;
    proposals:ProposalPage|null;history:DecisionPage|null;hits:SearchPage|null;
    onSearch:(query:string,offset:number)=>void;onInspect:(id:string)=>void;onVisual:(proposal:ExtractionProposal)=>void;
    onPropose:(value:MatrixCell['value'],state:State,evidence:string[],rationale:string)=>void;
    onDecide:(request:Omit<DecisionWrite,'idempotency_key'>)=>void;
    onPage:(offset:number)=>void;onHistory:(offset:number)=>void;onBulk:(proposal:ExtractionProposal)=>void;
}) {
    const t=catalog(locale).matrix;
    const [selected,setSelected]=useState<ExtractionProposal|null>(null),[correction,setCorrection]=useState<MatrixCell['value']>(null),[correctionState,setCorrectionState]=useState<State>('FOUND'),[correctionReason,setCorrectionReason]=useState('');
    const [draft,setDraft]=useState<MatrixCell['value']>(null),[state,setState]=useState<State>('FOUND'),[reason,setReason]=useState(''),[query,setQuery]=useState(''),[evidence,setEvidence]=useState<string[]>([]);
    const locked=busy||readOnly;
    function select(proposal:ExtractionProposal){if(selected?.id===proposal.id)return;setSelected(proposal);setCorrection(proposal.value);setCorrectionState(proposal.value_state);setCorrectionReason('');}
    const canCorrect=selected&&correctionReason.trim()&&(correctionState!=='FOUND'||correction!==null);
    return <section className="proposal-review" aria-label={t.proposals}>
        <h3>{cell.source_title} · {field.label}</h3><p>{field.question}</p><p>{field.definition}</p>
        {(field.rules??[]).length>0&&<ul>{field.rules!.map((rule,i)=><li key={i}>{rule}</li>)}</ul>}
        <h4>{t.current}</h4><p>{t.reviews[cell.review_state]} · {t.revision} {cell.revision}</p>
        <ValueDisplay value={cell.value} locale={locale} unit={field.unit}/>
        <p>{cell.value_state?t.values[cell.value_state]:t.undecided}</p>
        {cell.decision_form_version_id&&cell.decision_form_version_id!==cell.form_version_id&&<p>{t.inherited}: <code>{cell.decision_form_version_id}</code></p>}
        <h4>{t.proposals}</h4>{proposals?.items.length===0&&<p>{t.noProposals}</p>}
        <ul className="proposal-list">{proposals?.items.map(proposal=><li key={proposal.id}>
            <p>{t.reviews[proposal.review_state]} · {new Date(proposal.created_at).toLocaleString(locale)}</p>
            <ValueDisplay value={proposal.value} locale={locale} unit={field.unit}/><p>{t.values[proposal.value_state]}</p>
            <button type="button" disabled={busy} aria-pressed={selected?.id===proposal.id} onClick={()=>select(proposal)}>{t.reviewProposal}</button>
        </li>)}</ul>
        {proposals&&proposals.total>proposals.limit&&<nav className="actions" aria-label={t.proposals}><button type="button" disabled={busy||proposals.offset===0} onClick={()=>onPage(Math.max(0,proposals.offset-proposals.limit))}>{t.previous}</button><span>{proposals.offset+1}–{Math.min(proposals.total,proposals.offset+proposals.limit)} / {proposals.total}</span><button type="button" disabled={busy||proposals.offset+proposals.limit>=proposals.total} onClick={()=>onPage(proposals.offset+proposals.limit)}>{t.next}</button></nav>}
        {selected&&<div className="selected-proposal" key={selected.id}>
            <p>{selected.origin === 'HUMAN_CLIENT' ? t.origin : selected.origin === 'MODEL_RUN' ? catalog(locale).jobs.modelOrigin : catalog(locale).jobs.measuredOrigin} · {selected.principal}</p>
            <p>{selected.coverage === 'CITED_EVIDENCE_ONLY' ? t.coverage : catalog(locale).jobs[selected.coverage]}</p><p>{selected.rationale}</p>
            <p>{t.version}: <code>{selected.form_version_id}</code></p>
            {selected.model&&<p>{t.supportingModel}: {selected.model} · <code>{selected.run_id}</code></p>}
            {selected.visual&&<><p>{t.visual}</p><p>{t.imageHash}: <code>{selected.visual.sha256}</code></p>
                <p>{t.imagePage}: {selected.visual.page_index+1} · {t.imageRegion}: {selected.visual.region.join(', ')}</p>
                <button type="button" disabled={busy} onClick={()=>onVisual(selected)}>{t.visualPreview}</button></>}
            {selected.evidence_ids.map(id=><button type="button" key={id} disabled={busy} onClick={()=>onInspect(id)}>{t.inspect}</button>)}
            <div className="actions"><button type="button" disabled={locked} onClick={()=>onDecide({proposal_id:selected.id,expected_revision:cell.revision,action:'APPROVED',value:null,value_state:null,rationale:null})}>{t.approve}</button>
                <button type="button" disabled={locked} onClick={()=>onDecide({proposal_id:selected.id,expected_revision:cell.revision,action:'REJECTED',value:null,value_state:null,rationale:null})}>{t.reject}</button>
                <button type="button" disabled={locked} onClick={()=>onBulk(selected)}>{t.addBulk}</button></div>
            <details><summary>{t.correction}</summary><label>{t.valueState}<select disabled={locked} name="matrix_correction_state" value={correctionState} onChange={e=>{setCorrectionState(e.target.value as State);setCorrection(selected.value);}}>{Object.entries(t.values).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                {correctionState==='FOUND'&&<ValueEditor key={selected.id} field={field} locale={locale} initial={selected.value} disabled={locked} onChange={setCorrection}/>}
                <label>{t.rationale}<textarea name="matrix_correction_reason" disabled={locked} maxLength={2000} value={correctionReason} onChange={e=>setCorrectionReason(e.target.value)}/></label>
                <button type="button" disabled={locked||!canCorrect} onClick={()=>onDecide({proposal_id:selected.id,expected_revision:cell.revision,action:'CORRECTED',value:correctionState==='FOUND'?correction:null,value_state:correctionState,rationale:correctionReason.trim()})}>{t.correct}</button>
            </details>
        </div>}
        {!readOnly&&<details className="manual-proposal"><summary>{t.newProposal}</summary><p>{t.foundHelp}</p>
            <fieldset disabled={busy}><label>{t.searchText}<input name="matrix_evidence_search" value={query} maxLength={2000} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{
                if(e.key!=='Enter'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||e.nativeEvent.isComposing||e.nativeEvent.keyCode===229) return;
                e.preventDefault(); if(query.trim()) onSearch(query.trim(),0);
            }}/></label><button type="button" disabled={!query.trim()} onClick={()=>onSearch(query.trim(),0)}>{t.search}</button></fieldset>
            <p>{t.evidenceHelp}</p><ul className="evidence-hits">{hits?.items.map(hit=><li key={hit.evidence_id}><blockquote>{hit.excerpt}</blockquote>
                <label className="source-check"><input type="checkbox" disabled={busy||hit.source_id!==cell.source_id||(!evidence.includes(hit.evidence_id)&&evidence.length>=12)} checked={evidence.includes(hit.evidence_id)}
                    onChange={e=>setEvidence(old=>e.target.checked?[...old,hit.evidence_id]:old.filter(id=>id!==hit.evidence_id))}/>{t.chooseEvidence} · {hit.content_key}</label>
                <button type="button" disabled={busy} onClick={()=>onInspect(hit.evidence_id)}>{t.inspect}</button></li>)}</ul>
            {hits&&<nav className="actions" aria-label={t.search}><button type="button" disabled={busy||hits.offset===0} onClick={()=>onSearch(query.trim(),Math.max(0,hits.offset-hits.limit))}>{t.previous}</button><span>{hits.total}</span><button type="button" disabled={busy||hits.offset+hits.limit>=hits.total} onClick={()=>onSearch(query.trim(),hits.offset+hits.limit)}>{t.next}</button></nav>}
            <p>{t.selectedEvidence}: {evidence.length}</p>
            <fieldset disabled={busy}><label>{t.valueState}<select name="matrix_proposal_state" value={state} onChange={e=>{setState(e.target.value as State);setDraft(null);}}>{Object.entries(t.values).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                {state==='FOUND'&&<ValueEditor field={field} initial={null} locale={locale} disabled={busy} onChange={setDraft}/>}
                <label>{t.rationale}<textarea name="matrix_proposal_reason" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
                <button type="button" disabled={!evidence.length||!reason.trim()||(state==='FOUND'&&draft===null)} onClick={()=>onPropose(state==='FOUND'?draft:null,state,evidence,reason.trim())}>{t.saveProposal}</button>
            </fieldset>
        </details>}
        <button type="button" disabled={busy} onClick={()=>onHistory(0)}>{t.history}</button>
        {history&&<><h4>{t.history}</h4>{history.items.length===0&&<p>{t.noHistory}</p>}<ol className="decision-history">{history.items.map(event=><li key={event.id}><p>{t.reviews[event.action]} · {event.author} · {new Date(event.created_at).toLocaleString(locale)}</p>
            <p>{t.before} ({event.old.revision})</p><ValueDisplay value={event.old.value} locale={locale} unit={field.unit}/><p>{t.after} ({event.new.revision})</p><ValueDisplay value={event.new.value} locale={locale} unit={field.unit}/><p>{event.rationale}</p></li>)}</ol>
            <nav className="actions" aria-label={t.history}><button type="button" disabled={busy||history.offset===0} onClick={()=>onHistory(Math.max(0,history.offset-history.limit))}>{t.previous}</button><button type="button" disabled={busy||history.offset+history.limit>=history.total} onClick={()=>onHistory(history.offset+history.limit)}>{t.next}</button></nav>
        </>}
    </section>;
}
