import { useState } from 'react';
import type { FieldDefinition, FormVersion, Locale } from '../bridge/types';
import { catalog } from './i18n';

export function FormEditor({form,template,locale,busy,onSave,onCancel}: {
    form:FormVersion|null;template:FieldDefinition[];locale:Locale;busy:boolean;
    onSave:(name:string,fields:FieldDefinition[])=>void;onCancel:()=>void;
}) {
    const t=catalog(locale).matrix;
    const [name,setName]=useState(form?.name??t.templateName),[fields,setFields]=useState<FieldDefinition[]>(form?.fields??[]),[index,setIndex]=useState(0);
    const current=fields[index];
    function update(patch:Partial<FieldDefinition>){setFields(old=>old.map((f,i)=>i===index?{...f,...patch}:f));}
    const valid=name.trim()&&fields.length&&new Set(fields.map(f=>f.key)).size===fields.length&&fields.every(f=>/^[a-z][a-z0-9_]{0,63}$/.test(f.key)&&f.label.trim()&&f.question.trim()&&f.definition.trim()&&(f.kind!=='enum'||f.options?.length));
    function useTemplate(){setFields(template.map(f=>{
        const label=t.templateFields[f.key as keyof typeof t.templateFields]??f.label;
        return {...f,label,definition:label,question:`${t.templateQuestion} ${label.toLowerCase()}?`,rules:[t.templateRule]};
    }));setIndex(0);}
    return <section className="form-editor" aria-label={t.editForm}><h3>{form?t.editForm:t.createForm}</h3><p>{t.formHelp}</p>
        <fieldset disabled={busy}><label>{t.formName}<input name="matrix_form_name" value={name} maxLength={200} onChange={e=>setName(e.target.value)}/></label>
        <div className="actions"><button type="button" onClick={useTemplate}>{t.template}</button><button type="button" disabled={fields.length>=30} onClick={()=>{
            const next=fields.length;setFields([...fields,{key:`field_${next+1}`,label:'',kind:'text',question:'',definition:'',unit:null,rules:[],options:[],required:false}]);setIndex(next);
        }}>{t.addField}</button></div>
        {fields.length>0&&<label>{t.field}<select name="matrix_field" value={index} onChange={e=>setIndex(Number(e.target.value))}>{fields.map((f,i)=><option key={i} value={i}>{i+1}. {f.label||f.key}</option>)}</select></label>}
        {current&&<><label>{t.key}<input name="matrix_field_key" value={current.key} maxLength={64} onChange={e=>update({key:e.target.value})}/></label>
            <label>{t.label}<input name="matrix_field_label" value={current.label} maxLength={200} onChange={e=>update({label:e.target.value})}/></label>
            <label>{t.kind}<select name="matrix_field_kind" value={current.kind} onChange={e=>update({kind:e.target.value as FieldDefinition['kind'], options:e.target.value==='enum'?[t.booleanTrue,t.booleanFalse]:[]})}>{Object.entries(t.kinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
            {(['question','definition'] as const).map(key=><label key={key}>{t[key]}<textarea name={`matrix_field_${key}`} maxLength={2000} value={current[key]} onChange={e=>update({[key]:e.target.value})}/></label>)}
            <label>{t.unit}<input name="matrix_field_unit" maxLength={2000} value={current.unit??''} onChange={e=>update({unit:e.target.value||null})}/></label>
            <label>{t.rules}<textarea name="matrix_field_rules" value={(current.rules??[]).join('\n')} onChange={e=>update({rules:e.target.value.split('\n').filter(Boolean)})}/></label>
            {current.kind==='enum'&&<label>{t.options}<textarea name="matrix_field_options" value={(current.options??[]).join('\n')} onChange={e=>update({options:e.target.value.split('\n').filter(Boolean)})}/></label>}
            <label className="source-check"><input type="checkbox" checked={current.required??false} onChange={e=>update({required:e.target.checked})}/>{t.required}</label>
            <button type="button" onClick={()=>{setFields(fields.filter((_,i)=>i!==index));setIndex(Math.max(0,index-1));}}>{t.removeField}</button>
        </>}
        <div className="actions"><button className="primary" type="button" disabled={!valid} onClick={()=>onSave(name.trim(),fields)}>{t.saveForm}</button><button type="button" onClick={onCancel}>{t.cancel}</button></div>
        </fieldset>
    </section>;
}
