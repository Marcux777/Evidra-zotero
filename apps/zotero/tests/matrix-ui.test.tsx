import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { expect, test } from 'vitest';
import type { UiMessage } from '../src/bridge/types';
import { parseUiMessage } from '../src/security/messages';

test('matrix review uses explicit actions, preserves uncertain decision keys and previews actual bulk changes', async () => {
    expect(existsSync(new NodeURL('../src/ui/Matrix.tsx', import.meta.url)), 'human matrix UI is missing').toBe(true);
    const { Matrix } = await import(/* @vite-ignore */ new NodeURL('../src/ui/Matrix.tsx', import.meta.url).href);
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const scope = { notebook_id:'11111111-1111-4111-8111-111111111111', snapshot_id:'a'.repeat(32) };
    const field = { key:'problem', label:'Problem', kind:'text', question:'What problem?', definition:'Reported problem', unit:null, rules:[], required:false, options:[] };
    const form = { id:'b'.repeat(32), notebook_id:scope.notebook_id, name:'Computing', fields:[field], revision:1, author:'bridge:profile-a', created_at:'2026-09-06T10:00:00Z' };
    const cell: any = { form_version_id:form.id, source_id:'c'.repeat(64), source_title:'Study 1', field_key:'problem', value:null, value_state:'NOT_FOUND_IN_SEARCH', revision:0, review_state:'UNREVIEWED', proposal_id:null };
    const proposal = { ...cell, id:'d'.repeat(32), value:'42', value_state:'FOUND', evidence_ids:['e'.repeat(64)], run_id:null, rationale:'Literal result', origin:'HUMAN_CLIENT', principal:'bridge:profile-a', model:null, coverage:'CITED_EVIDENCE_ONLY', source_kinds:['abstract'], visual:null, created_at:'2026-09-06T10:00:00Z', review_state:'UNREVIEWED' };
    const messages: UiMessage[] = [];
    let decisions = 0, revoked = false;
    const bridge = { request: async (message: UiMessage): Promise<unknown> => {
        parseUiMessage(message);
        messages.push(structuredClone(message));
        if (message.op === 'matrix.forms') return {items:[form], offset:0, limit:1, total:1};
        if (message.op === 'matrix.query') { if (revoked) throw new Error('SOURCE_REVOKED'); return {items:[{...cell}], offset:0, limit:50,total:1}; }
        if (message.op === 'matrix.proposals') return {items:[proposal], offset:0, limit:20,total:1};
        if (message.op === 'matrix.decide') { if (++decisions === 1) throw new Error('BRIDGE_TIMEOUT'); Object.assign(cell, {value:'42',value_state:'FOUND',revision:1,review_state:'APPROVED',proposal_id:proposal.id}); return {new:cell}; }
        if (message.op === 'matrix.preview') return {id:'f'.repeat(32),count:1,changes:[{old:{...cell},proposal}]};
        if (message.op === 'matrix.approve') return {items:[]};
        if (message.op === 'documents.evidence') return {id:proposal.evidence_ids[0], source_kind:'abstract', content_key:'ABSTRACT', excerpt:'EXACT original evidence', start:0,end:23,document_version_id:'e'.repeat(64),page_index:null,page_label:null,historical:false};
        throw new Error(`Unexpected matrix operation: ${message.op}`);
    } };
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    const button = (label:string) => [...host.querySelectorAll('button')].find(b=>b.textContent===label)!;
    const click = async (label:string) => { expect(button(label),label).toBeTruthy(); await act(async()=>button(label).click()); };
    try {
        await act(async()=>root.render(<Matrix bridge={bridge} {...scope} locale="en-US"/>));
        await click('Open extraction matrix');
        await click('Study 1 · Problem');
        expect(messages.filter(m=>m.op==='matrix.decide')).toHaveLength(0);
        await click('Review proposal');
        await click('Approve value');
        expect(host.textContent).toContain('The outcome is uncertain');
        expect(button('Approve value').disabled).toBe(true);
        await click('Retry same operation');
        const writes = messages.filter(m=>m.op==='matrix.decide');
        expect(writes).toHaveLength(2); expect(writes[0]).toEqual(writes[1]);
        expect(writes[0]!.request.idempotency_key).toMatch(/^[a-f0-9]{64}$/);
        await click('Study 1 · Problem'); await click('Review proposal');
        await click('Add to bulk review'); await click('Preview bulk approval');
        expect(messages.filter(m=>m.op==='matrix.approve')).toHaveLength(0);
        expect(host.textContent).toContain('Before'); expect(host.textContent).toContain('After');
        await click('Inspect evidence'); expect(host.textContent).toContain('EXACT original evidence');
        await click('Confirm bulk approval');
        expect(messages.filter(m=>m.op==='matrix.approve')).toHaveLength(1);
        revoked = true; await click('Refresh matrix');
        expect(host.textContent).not.toContain('EXACT original evidence');
        expect(host.querySelector('.proposal-review')).toBeNull();
    } finally { await act(async()=>root.unmount()); host.remove(); }
});

test('form and human proposal controls work without submit and preserve multiple original experimental numbers', async () => {
    const { Matrix } = await import('../src/ui/Matrix');
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const scope = { notebook_id:'11111111-1111-4111-8111-111111111111', snapshot_id:'a'.repeat(32) };
    const field = {key:'results',label:'Resultados',kind:'experimental_result',question:'Context?',definition:'Results',unit:null,rules:[],required:false,options:[]};
    let form:any=null,proposals:any[]=[],saved:any=null;
    const messages:UiMessage[]=[];
    const source='c'.repeat(64),evidence='e'.repeat(64);
    const bridge={request:async(message:UiMessage):Promise<unknown>=>{
        parseUiMessage(message);messages.push(structuredClone(message));
        if(message.op==='matrix.forms')return {items:form?[form]:[],offset:0,limit:1,total:form?1:0};
        if(message.op==='matrix.template')return [field];
        if(message.op==='matrix.form.write'){form={id:'b'.repeat(32),name:message.request.name,fields:message.request.fields,revision:1,field_origins:{results:'b'.repeat(32)},notebook_id:scope.notebook_id,author:'bridge:profile-a',created_at:'2026-09-06T10:00:00Z'};return form;}
        if(message.op==='matrix.query')return {items:[{form_version_id:form.id,field_origin_form_version_id:form.id,decision_form_version_id:null,source_id:source,source_title:'Study',field_key:'results',value:null,value_state:null,review_state:'UNREVIEWED',revision:0,proposal_id:null}],offset:0,limit:50,total:1};
        if(message.op==='matrix.proposals')return {items:proposals,offset:0,limit:20,total:proposals.length};
        if(message.op==='documents.search')return {items:[{evidence_id:evidence,source_id:source,content_key:'ABSTRACT',source_kind:'abstract',excerpt:'Reported experiments',page_index:null,page_label:null,historical:false,score:1}],offset:0,limit:20,total:1,documents_retrieved:1};
        if(message.op==='matrix.propose'){saved=structuredClone(message.request);proposals=[{...message.request,id:'d'.repeat(32),review_state:'UNREVIEWED',created_at:'2026-09-06T10:00:00Z',origin:'HUMAN_CLIENT'}];return proposals[0];}
        throw new Error(`Unexpected operation: ${message.op}`);
    }};
    const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
    const button=(text:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===text)!;
    const click=async(text:string)=>{expect(button(text),text).toBeTruthy();await act(async()=>button(text).click());};
    const fill=async(name:string,text:string)=>{const input=host.querySelector(`[name="${name}"]`) as HTMLInputElement|HTMLTextAreaElement;expect(input,name).toBeTruthy();await act(async()=>{Object.getOwnPropertyDescriptor(input instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value')!.set!.call(input,text);input.dispatchEvent(new Event('input',{bubbles:true}));});};
    try{
        await act(async()=>root.render(<Matrix bridge={bridge} {...scope} locale="en-US"/>));
        await click('Open extraction matrix');await click('Create form');await click('Use computing template');await click('Save form version');
        expect(form.fields[0].label).toBe('Results with context');expect(form.fields[0].required).toBe(false);
        await click('Study · Results with context');
        await act(async()=>{(host.querySelector('.manual-proposal') as HTMLDetailsElement).open=true;});
        await fill('matrix_evidence_search','reported');
        const searchInput=host.querySelector('[name=matrix_evidence_search]')!;
        await act(async()=>searchInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true})));
        expect(messages.filter(m=>m.op==='documents.search')).toHaveLength(0);
        await act(async()=>searchInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})));
        expect(messages.filter(m=>m.op==='documents.search')).toHaveLength(1);
        await act(async()=>(host.querySelector('.evidence-hits input[type=checkbox]') as HTMLInputElement).click());
        await fill('matrix_result_0_metric','accuracy');await fill('matrix_result_0_original','4.2e1');await fill('matrix_result_0_normalized','42');await fill('matrix_result_0_dataset','Dataset A');await fill('matrix_result_0_unit','%');
        await fill('matrix_proposal_reason','Reported experiments');
        expect(button('Save proposal for review').disabled).toBe(false);
        await click('Add experimental result');
        expect(button('Save proposal for review').disabled).toBe(true); // An unfinished second result cannot silently disappear.
        await fill('matrix_result_1_metric','accuracy');await fill('matrix_result_1_original','43,5');await fill('matrix_result_1_normalized','43.5');await fill('matrix_result_1_dataset','Dataset B');await fill('matrix_result_1_condition','held-out');
        await click('Save proposal for review');
        expect(saved.value).toHaveLength(2);expect(saved.value[0]).toMatchObject({number:{original:'4.2e1',normalized:42},dataset:'Dataset A',unit:'%'});
        expect(saved.value[1]).toMatchObject({number:{original:'43,5',normalized:43.5},dataset:'Dataset B',condition:'held-out',unit:null});
        expect(saved.evidence_ids).toEqual([evidence]);expect(messages.filter(m=>m.op==='matrix.decide')).toHaveLength(0);
    }finally{await act(async()=>root.unmount());host.remove();}
});

test('windowed cells stay bounded and keyboard End reaches a previously unmounted row', async()=>{
    const {WindowedList}=await import('../src/ui/WindowedList');
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
    let selected=-1;
    try{
        await act(async()=>root.render(<WindowedList items={Array.from({length:50},(_,i)=>i)} label="Cells" rowKey={String} render={i=><button type="button" onClick={()=>{selected=i;}}>{i}</button>}/>));
        expect(host.querySelectorAll('[role=listitem]').length).toBeLessThan(12);expect(host.textContent).not.toContain('49');
        await act(async()=>{host.querySelector('[role=list]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));});
        await act(async()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
        expect(document.activeElement?.textContent).toBe('49');
        await act(async()=>(document.activeElement as HTMLButtonElement).click());expect(selected).toBe(49);
        expect(host.querySelectorAll('[role=listitem]').length).toBeLessThan(12);
    }finally{await act(async()=>root.unmount());host.remove();}
});
