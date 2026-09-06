import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { expect, test } from 'vitest';
import type { UiMessage } from '../src/bridge/types';
import { parseUiMessage } from '../src/security/messages';

test('jobs prepare exact inputs before start, preserve uncertain keys and expose coverage and cancellation', async () => {
    expect(existsSync(new NodeURL('../src/ui/Jobs.tsx', import.meta.url)), 'extraction jobs UI is missing').toBe(true);
    const { Jobs } = await import(/* @vite-ignore */ new NodeURL('../src/ui/Jobs.tsx', import.meta.url).href);
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const scope = { notebook_id:'11111111-1111-4111-8111-111111111111', snapshot_id:'a'.repeat(32) };
    const field = {key:'accuracy',label:'Accuracy',kind:'number',question:'Accuracy?',definition:'Reported accuracy',unit:'%',options:[]};
    const form = {id:'b'.repeat(32),revision:1,name:'Form',fields:[field],field_origins:{accuracy:'b'.repeat(32)}};
    const profile = {id:'local',revision:1,model:'fixture',mode:'LOCAL',purpose:'generation',adapter:'ollama'};
    let job:any = null, uncertain = true, delayPreview = false, releasePreview!: () => void;
    const messages:UiMessage[]=[];
    const unit:any = {id:'d'.repeat(32),job_id:'c'.repeat(32),source_id:'e'.repeat(64),field_key:'accuracy',state:'QUEUED',coverage_state:'PARTIAL_SCAN',batches_total:1,batches_processed:0,
        coverage:[{content_key:'MAIN',source_kind:'pdf',pages_total:2,pages_processed:0,chunks_total:2,chunks_selected:2,chunks_processed:0,failed_pages:0,reason:null},
            {content_key:'MISSING',source_kind:'pdf',pages_total:null,pages_processed:0,chunks_total:0,chunks_selected:0,chunks_processed:0,failed_pages:0,reason:'MISSING_FILE'}]};
    const bridge={request:async(message:UiMessage):Promise<unknown>=>{
        parseUiMessage(message);messages.push(structuredClone(message));
        if(message.op==='matrix.forms')return {items:[form],offset:0,limit:1,total:1};
        if(message.op==='provider.list')return {items:[profile],offset:message.offset,limit:50,total:1};
        if(message.op==='jobs.list')return {items:job?[job]:[],offset:0,limit:10,total:job?1:0};
        if(message.op==='jobs.prepare'){
            job={id:'c'.repeat(32),...scope,state:'PAUSED',revision:0,request:message.request,profile,total_units:1,completed_units:0,failed_units:0,cached_units:0};
            if(uncertain){uncertain=false;throw new Error('BRIDGE_TIMEOUT');}return {...job};
        }
        if(message.op==='jobs.units')return {items:[unit],offset:0,limit:1,total:1};
        if(message.op==='jobs.preview'){
            if(delayPreview)await new Promise<void>(resolve=>{releasePreview=resolve;});
            return {unit_id:unit.id,batch_index:message.batch_index,prompt:'EXACT original evidence and question',schema_plan:{system:'EXACT extraction rules',output_schema:{type:'object'},mode:'local_validation'},estimated_input_tokens:500,profile};
        }
        if(message.op==='jobs.read')return {...job};
        if(message.op==='jobs.control'){job={...job,state:message.request.action==='resume'?'RUNNING':message.request.action==='cancel'?'CANCELLED':'PAUSED',revision:job.revision+1};return {...job};}
        throw new Error(`Unexpected jobs operation: ${message.op}`);
    }};
    const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
    const button=(label:string)=>[...host.querySelectorAll('button')].find(b=>b.textContent===label)!;
    const click=async(label:string)=>{expect(button(label),label).toBeTruthy();await act(async()=>button(label).click());};
    try{
        await act(async()=>root.render(<Jobs bridge={bridge} {...scope} locale="en-US" profilesEpoch={0}/>));
        await click('Open extraction jobs');
        await click('Prepare extraction');
        expect(host.textContent).toContain('The outcome is uncertain');
        await click('Retry same operation');
        const prepared=messages.filter(m=>m.op==='jobs.prepare');expect(prepared).toHaveLength(2);expect(prepared[0]).toEqual(prepared[1]);
        expect(prepared[0]!.request.idempotency_key).toMatch(/^[a-f0-9]{64}$/);
        expect(messages.filter(m=>m.op==='jobs.control')).toHaveLength(0);
        expect(host.textContent).toContain('EXACT original evidence and question');
        expect(host.textContent).toContain('EXACT extraction rules');
        expect(host.textContent).toContain('MISSING');
        expect(host.textContent).toContain('Missing file');
        await click('Start / resume extraction');
        expect(messages.filter(m=>m.op==='jobs.control')[0]!.request).toMatchObject({action:'resume',expected_revision:0});
        delayPreview=true;
        await act(async()=>host.querySelector<HTMLButtonElement>('.windowed-list button')!.click());
        expect(releasePreview).toBeTypeOf('function');
        expect(button('Cancel extraction').disabled).toBe(false);
        await click('Cancel extraction');
        expect(messages.filter(m=>m.op==='jobs.control')[1]!.request.action).toBe('cancel');
        expect(host.textContent).toContain('Cancelled');
        await act(async()=>releasePreview());
        expect(host.textContent).not.toContain('EXACT original evidence and question');
        expect(button('Refresh extraction jobs').disabled).toBe(false);
    }finally{await act(async()=>root.unmount());host.remove();}
});
