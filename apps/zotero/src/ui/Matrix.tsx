import { useEffect, useRef, useState } from 'react';
import type { BulkPreview, DecisionPage, Evidence, ExtractionProposal, FieldDefinition, FormPage, FormVersion, Locale, MatrixCell, MatrixPage, MatrixQuery, PagePreview, ProposalPage, SearchPage, UiBridge, UiMessage } from '../bridge/types';
import { catalog } from './i18n';
import { FormEditor } from './FormEditor';
import { ProposalReview } from './ProposalReview';
import { ValueDisplay, valueSummary } from './MatrixValue';
import { WindowedList } from './WindowedList';
import { MatrixEvidence } from './MatrixEvidence';

const newKey=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const cellKey=(cell:MatrixCell)=>`${cell.field_origin_form_version_id}:${cell.source_id}:${cell.field_key}`;
const confirmed=(failure:unknown)=>failure instanceof Error&&['SCOPE_STALE','SOURCE_REVOKED','DOCUMENT_STALE','EVIDENCE_INVARIANT','MISSING_FILE','FORBIDDEN','NOT_FOUND','UNAUTHENTICATED','BRIDGE_EXPIRED','REVISION_CONFLICT','IDEMPOTENCY_CONFLICT','INVALID_REQUEST','INVALID_OUTPUT','NO_EVIDENCE','BODY_TOO_LARGE','INVALID_UI_MESSAGE','INVALID_ENGINE_ROUTE'].includes(failure.message);
const invalidates=(failure:unknown)=>failure instanceof Error&&['SCOPE_STALE','SOURCE_REVOKED','DOCUMENT_STALE','EVIDENCE_INVARIANT','MISSING_FILE','FORBIDDEN','NOT_FOUND','UNAUTHENTICATED','BRIDGE_EXPIRED','REVISION_CONFLICT','IDEMPOTENCY_CONFLICT'].includes(failure.message);
type Current=()=>boolean;

export function Matrix({bridge,notebook_id,snapshot_id,locale}: {bridge:UiBridge;notebook_id:string;snapshot_id:string;locale:Locale}) {
    const t=catalog(locale),m=t.matrix,scope={notebook_id,snapshot_id};
    const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
    const [forms,setForms]=useState<FormPage|null>(null),[page,setPage]=useState<MatrixPage|null>(null),[template,setTemplate]=useState<FieldDefinition[]>([]),[editing,setEditing]=useState(false);
    const [selected,setSelected]=useState<MatrixCell|null>(null),[proposals,setProposals]=useState<ProposalPage|null>(null),[history,setHistory]=useState<DecisionPage|null>(null),[hits,setHits]=useState<SearchPage|null>(null);
    const [evidence,setEvidence]=useState<Evidence|null>(null),[image,setImage]=useState<PagePreview|null>(null),[bulk,setBulk]=useState<{cell:MatrixCell;proposal:ExtractionProposal}[]>([]),[preview,setPreview]=useState<BulkPreview|null>(null);
    const [reviewFilter,setReviewFilter]=useState<MatrixQuery['review_state']>(null),[valueFilter,setValueFilter]=useState<MatrixQuery['value_state']>(null),[sourceFilter,setSourceFilter]=useState<string|null>(null);
    const alive=useRef(true),version=useRef(0),running=useRef(false),heading=useRef<HTMLHeadingElement>(null),latestRevision=useRef(0);
    const pending=useRef<{message:UiMessage;done:(result:unknown,current:Current)=>Promise<void>}|null>(null);
    const form=forms?.items[0]??null,locked=busy||uncertain,historical=(forms?.offset??0)>0;
    useEffect(()=>{alive.current=true;return()=>{alive.current=false;++version.current;};},[]);
    function clearCell(){setSelected(null);setProposals(null);setHistory(null);setHits(null);setEvidence(null);setImage(null);}
    function invalidate(){++version.current;setPage(null);clearCell();setBulk([]);setPreview(null);setEditing(false);pending.current=null;setUncertain(false);}
    async function action(work:(current:Current)=>Promise<void>){
        if(running.current)return;running.current=true;setBusy(true);setError('');const token=version.current,current=()=>alive.current&&version.current===token;
        try{await work(current);}catch(failure){if(current()){setError(failure instanceof Error?failure.message:'OPERATION_FAILED');if(confirmed(failure)){pending.current=null;setUncertain(false);if(invalidates(failure))invalidate();}else setUncertain(pending.current!==null);}}
        finally{running.current=false;if(alive.current)setBusy(false);}
    }
    async function loadPage(value:FormVersion,offset:number,current:Current,filters={source_id:sourceFilter,review_state:reviewFilter,value_state:valueFilter}){
        const result=await bridge.request({op:'matrix.query',...scope,request:{form_version_id:value.id,offset,...filters}}) as MatrixPage;
        if(current())setPage(result);
    }
    async function loadForms(offset:number,current:Current){
        const result=await bridge.request({op:'matrix.forms',...scope,offset}) as FormPage;
        if(!current())return;setForms(result);clearCell();setBulk([]);setPreview(null);setPage(null);
        if(offset===0)latestRevision.current=result.items[0]?.revision??0;
        if(result.items[0])await loadPage(result.items[0],0,current);
    }
    function mutate(message:UiMessage,done:(result:unknown,current:Current)=>Promise<void>){
        if(locked||running.current)return;pending.current={message,done};void executePending();
    }
    async function executePending(){await action(async current=>{
        const operation=pending.current;if(!operation)return;
        const result=await bridge.request(operation.message);if(!current())return;
        pending.current=null;setUncertain(false);setNotice(m.saved);await operation.done(result,current);
    });}
    function refresh(){void action(current=>loadForms(0,current));}
    async function loadProposals(cell:MatrixCell,offset:number,current:Current){
        const result=await bridge.request({op:'matrix.proposals',...scope,request:{form_version_id:cell.form_version_id,source_id:cell.source_id,field_key:cell.field_key,offset}}) as ProposalPage;
        if(current())setProposals(result);
    }
    function select(cell:MatrixCell){void action(async current=>{clearCell();setSelected(cell);await loadProposals(cell,0,current);requestAnimationFrame(()=>heading.current?.focus());});}
    function inspect(id:string,openNative=false){void action(async current=>{
        const result=await bridge.request({op:openNative?'documents.open':'documents.evidence',...scope,evidence_id:id}) as Evidence;
        if(current()){setEvidence(result);setImage(null);}
    });}
    function visual(proposal:ExtractionProposal){void action(async current=>{
        if(!proposal.visual||!proposal.run_id)return;
        // Revalidate the exact run before requesting its server-owned image operation.
        await bridge.request({op:'conversation.run',...scope,run_id:proposal.run_id});
        const result=await bridge.request({op:'documents.preview.read',...scope,operation_id:proposal.visual.operation_id}) as PagePreview;
        if(result.sha256!==proposal.visual.sha256||result.document_version_id!==proposal.visual.document_version_id||result.page_index!==proposal.visual.page_index||result.region.some((coordinate,i)=>coordinate!==proposal.visual!.region[i]))throw new Error('EVIDENCE_INVARIANT');
        if(current()){setImage(result);setEvidence(null);}
    });}
    async function refreshed(current:Current){clearCell();setBulk([]);setPreview(null);if(form)await loadPage(form,page?.offset??0,current);}
    const field=selected&&form?.fields.find(f=>f.key===selected.field_key);
    return <section className="matrix" aria-label={m.title}>
        {!open?<button type="button" disabled={busy} onClick={()=>{setOpen(true);void action(current=>loadForms(0,current));}}>{m.open}</button>:<>
            <h2>{m.title}</h2><p>{m.foundHelp}</p>
            {error&&<p role="alert" className="source-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
            {uncertain&&<div role="alert"><p>{m.uncertain}</p><button type="button" disabled={busy} onClick={()=>void executePending()}>{m.retry}</button></div>}
            <div className="actions"><button type="button" disabled={locked} onClick={refresh}>{m.refresh}</button><button type="button" disabled={locked||historical} onClick={()=>void action(async current=>{
                const result=await bridge.request({op:'matrix.template',...scope}) as FieldDefinition[];if(current()){setTemplate(result);setEditing(true);}
            })}>{form?m.editForm:m.createForm}</button></div>
            {form?<><p>{m.version}: {form.revision} · {form.name}{historical?` · ${m.historical}`:''}</p>
                {forms&&forms.total>1&&<nav className="actions" aria-label={m.version}><button type="button" disabled={locked||forms.offset===0} onClick={()=>void action(current=>loadForms(forms.offset-1,current))}>{m.previousVersion}</button><button type="button" disabled={locked||forms.offset+1>=forms.total} onClick={()=>void action(current=>loadForms(forms.offset+1,current))}>{m.nextVersion}</button></nav>}
            </>:<p>{m.noForm}</p>}
            {editing&&<FormEditor key={form?.id??'new'} form={form} template={template} locale={locale} busy={locked} onCancel={()=>setEditing(false)} onSave={(name,fields)=>mutate({op:'matrix.form.write',...scope,request:{name,fields,expected_revision:latestRevision.current,idempotency_key:newKey()}},async (_,current)=>{setEditing(false);await loadForms(0,current);})}/>}
            {form&&!editing&&<><fieldset disabled={locked}><legend>{m.title}</legend>
                <label>{m.reviewState}<select name="matrix_review_filter" value={reviewFilter??''} onChange={e=>setReviewFilter((e.target.value||null) as MatrixQuery['review_state'])}><option value="">{m.all}</option>{Object.entries(m.reviews).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                <label>{m.valueState}<select name="matrix_value_filter" value={valueFilter??''} onChange={e=>setValueFilter((e.target.value||null) as MatrixQuery['value_state'])}><option value="">{m.all}</option>{Object.entries(m.values).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                <p>{sourceFilter?`${m.source}: ${sourceFilter}`:m.sourceHelp}</p>
                <div className="actions"><button type="button" onClick={()=>void action(async current=>{clearCell();setBulk([]);setPreview(null);await loadPage(form,0,current);})}>{m.applyFilters}</button>
                    <button type="button" disabled={!selected} onClick={()=>{const source=selected!.source_id;setSourceFilter(source);void action(async current=>{clearCell();await loadPage(form,0,current,{source_id:source,review_state:reviewFilter,value_state:valueFilter});});}}>{m.filterSource}</button>
                    <button type="button" onClick={()=>{setSourceFilter(null);setReviewFilter(null);setValueFilter(null);void action(async current=>{clearCell();await loadPage(form,0,current,{source_id:null,review_state:null,value_state:null});});}}>{m.clearFilters}</button></div>
            </fieldset>
            <div className="matrix-columns"><div className="matrix-table">{page&&<><WindowedList key={`${form.id}:${page.offset}`} items={page.items} rowHeight={100} rowKey={cellKey} label={m.title} render={cell=><>
                <button type="button" disabled={locked} aria-pressed={selected!==null&&cellKey(selected)===cellKey(cell)} onClick={()=>select(cell)}>{cell.source_title} · {form.fields.find(f=>f.key===cell.field_key)?.label??cell.field_key}</button>
                <small>{m.reviews[cell.review_state]} · {cell.value_state?m.values[cell.value_state]:m.undecided}{bulk.some(b=>cellKey(b.cell)===cellKey(cell))?` · ${m.bulk}`:''}</small>
                <small title={valueSummary(cell.value,locale)}>{valueSummary(cell.value,locale)}</small>
            </>}/>{page.items.length===0&&<p>{m.empty}</p>}<nav className="actions" aria-label={m.title}><button type="button" disabled={locked||page.offset===0} onClick={()=>void action(async current=>{clearCell();await loadPage(form,Math.max(0,page.offset-page.limit),current);})}>{m.previous}</button><span>{page.offset}–{page.offset+page.items.length} / {page.total}</span><button type="button" disabled={locked||page.offset+page.limit>=page.total} onClick={()=>void action(async current=>{clearCell();await loadPage(form,page.offset+page.limit,current);})}>{m.next}</button></nav></>}</div>
                <div><h3 tabIndex={-1} ref={heading}>{m.select}</h3>{selected&&field&&<ProposalReview key={`${cellKey(selected)}:${selected.revision}`} cell={selected} field={field} locale={locale} busy={locked} readOnly={historical} proposals={proposals} history={history} hits={hits}
                    onSearch={(query,offset)=>void action(async current=>{const result=await bridge.request({op:'documents.search',...scope,request:{query,offset,limit:20}}) as SearchPage;if(current())setHits(result);})}
                    onInspect={inspect} onVisual={visual} onPage={offset=>void action(current=>loadProposals(selected,offset,current))}
                    onHistory={offset=>void action(async current=>{const result=await bridge.request({op:'matrix.history',...scope,request:{form_version_id:form.id,source_id:selected.source_id,field_key:selected.field_key,offset}}) as DecisionPage;if(current())setHistory(result);})}
                    onPropose={(value,value_state,evidence_ids,rationale)=>mutate({op:'matrix.propose',...scope,request:{form_version_id:form.id,source_id:selected.source_id,field_key:selected.field_key,value,value_state,evidence_ids,rationale,run_id:null,idempotency_key:newKey()}},async (_,current)=>{await loadProposals(selected,0,current);})}
                    onDecide={request=>mutate({op:'matrix.decide',...scope,request:{...request,idempotency_key:newKey()}},async (_,current)=>refreshed(current))}
                    onBulk={proposal=>{const next=bulk.filter(b=>cellKey(b.cell)!==cellKey(selected));if(next.length>=20){setError(m.bulkLimit);return;}setBulk([...next,{cell:selected,proposal}]);setPreview(null);}}
                />}</div>
                <MatrixEvidence evidence={evidence} image={image} locale={locale} busy={locked} onOpen={id=>inspect(id,true)}/>
            </div>
            <section className="bulk-review" aria-label={m.bulk}><h3>{m.bulk}: {bulk.length}</h3><p>{m.bulkLimit}</p>
                <ul>{bulk.map(item=><li key={cellKey(item.cell)}>{item.cell.source_title} · {form.fields.find(f=>f.key===item.cell.field_key)?.label??item.cell.field_key} <button type="button" disabled={locked} onClick={()=>{setBulk(bulk.filter(b=>cellKey(b.cell)!==cellKey(item.cell)));setPreview(null);}}>{m.removeBulk}</button></li>)}</ul>
                <div className="actions"><button type="button" disabled={locked||!bulk.length||historical} onClick={()=>mutate({op:'matrix.preview',...scope,request:{items:bulk.map(b=>({proposal_id:b.proposal.id,expected_revision:b.cell.revision})),idempotency_key:newKey()}},async result=>setPreview(result as BulkPreview))}>{m.previewBulk}</button><button type="button" disabled={locked||!bulk.length} onClick={()=>{setBulk([]);setPreview(null);}}>{m.clearBulk}</button></div>
                {preview&&<><h4>{m.count}: {preview.count}</h4><p>{m.bulkHelp}</p><ol>{preview.changes.map(change=><li key={change.proposal.id}><h4>{change.old.source_title} · {form.fields.find(f=>f.key===change.old.field_key)?.label??change.old.field_key}</h4>
                    <p>{m.before} · {m.revision} {change.old.revision} · {m.reviews[change.old.review_state]}</p><ValueDisplay locale={locale} value={change.old.value}/><p>{m.after} · {m.values[change.proposal.value_state]}</p><ValueDisplay locale={locale} value={change.proposal.value}/>
                    {change.proposal.evidence_ids.map(id=><button type="button" disabled={locked} key={id} onClick={()=>inspect(id)}>{m.inspect}</button>)}
                    {change.proposal.visual&&<button type="button" disabled={locked} onClick={()=>visual(change.proposal)}>{m.visualPreview}</button>}
                </li>)}</ol><button className="primary" type="button" disabled={locked||historical} onClick={()=>mutate({op:'matrix.approve',...scope,request:{preview_id:preview.id,idempotency_key:newKey()}},async (_,current)=>refreshed(current))}>{m.confirmBulk}</button></>}
            </section>
            </>}
        </>}
    </section>;
}
