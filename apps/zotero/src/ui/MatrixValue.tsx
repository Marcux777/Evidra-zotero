import { useState } from 'react';
import type { FieldDefinition, Locale, MatrixCell } from '../bridge/types';
import { catalog } from './i18n';

type Value = MatrixCell['value'];
type Result = Exclude<Extract<Value, object[]>, string[]>[number];
type ResultDraft = { metric:string; original:string; normalized:string; dataset:string; condition:string; unit:string; baseline:string; direction:Result['direction'] };
const emptyResult = (): ResultDraft => ({metric:'',original:'',normalized:'',dataset:'',condition:'',unit:'',baseline:'',direction:'UNSPECIFIED'});
const numeric = (original:string, normalized:string) => original.trim() && normalized.trim() && Number.isFinite(Number(normalized)) ? {original, normalized:Number(normalized)} : null;

export function valueSummary(value:Value,locale:Locale):string {
    if(value===null)return '—';
    if(typeof value==='string')return value;
    if(typeof value==='boolean')return value?catalog(locale).matrix.booleanTrue:catalog(locale).matrix.booleanFalse;
    if(!Array.isArray(value))return value.original;
    return value.map(item=>typeof item==='string'?item:`${item.metric}: ${item.number.original}`).join('; ');
}

export function ValueDisplay({value,locale,unit}: {value:Value;locale:Locale;unit?:string|null}) {
    const t=catalog(locale).matrix;
    if(value===null) return <span>—</span>;
    if(typeof value==='boolean') return <span>{value?t.booleanTrue:t.booleanFalse}</span>;
    if(typeof value==='string') return <span className="matrix-value">{value}</span>;
    if(!Array.isArray(value)) return <span>{value.original} <small>({t.normalized}: {value.normalized}{unit?` ${unit}`:''})</small></span>;
    return <ul className="matrix-values">{value.map((item,index)=><li key={index}>{typeof item==='string'?item:<>
        <strong>{item.metric}</strong>: {item.number.original} ({t.normalized}: {item.number.normalized}{item.unit?` ${item.unit}`:''})
        <dl>{(['dataset','condition','baseline'] as const).map(key=><div key={key}><dt>{t[key]}</dt><dd>{item[key]??'—'}</dd></div>)}
            <div><dt>{t.direction}</dt><dd>{t.directions[item.direction]}</dd></div></dl>
    </>}</li>)}</ul>;
}

export function ValueEditor({field,initial,locale,disabled,onChange}: {
    field:FieldDefinition; initial:Value; locale:Locale;disabled:boolean;onChange:(value:Value)=>void;
}) {
    const t=catalog(locale).matrix;
    const [text,setText]=useState(typeof initial==='string'?initial:Array.isArray(initial)&&initial.every(v=>typeof v==='string')?initial.join('\n'):'');
    const [original,setOriginal]=useState(initial && typeof initial==='object' && !Array.isArray(initial)?initial.original:'');
    const [normalized,setNormalized]=useState(initial && typeof initial==='object' && !Array.isArray(initial)?String(initial.normalized):'');
    const [choice,setChoice]=useState(initial===null?'':String(initial));
    const [results,setResults]=useState<ResultDraft[]>(()=>Array.isArray(initial)&&initial.length&&typeof initial[0]!=='string'
        ? (initial as Result[]).map(r=>({...r,original:r.number.original,normalized:String(r.number.normalized),dataset:r.dataset??'',condition:r.condition??'',unit:r.unit??'',baseline:r.baseline??''})):[emptyResult()]);
    function resultChange(next:ResultDraft[]) {
        setResults(next);
        const values:Result[]=[];
        for(const draft of next) { const number=numeric(draft.original,draft.normalized); if(!draft.metric.trim()||!number){onChange(null);return;}
            values.push({metric:draft.metric,number,dataset:draft.dataset||null,condition:draft.condition||null,unit:draft.unit||null,baseline:draft.baseline||null,direction:draft.direction}); }
        onChange(values.length?values:null);
    }
    return <fieldset disabled={disabled} className="value-editor"><legend>{t.value}{field.unit?` (${field.unit})`:''}</legend>
        {(field.kind==='text'||field.kind==='list')&&<label>{field.kind==='list'?t.listHelp:t.value}<textarea name="matrix_value" maxLength={8000} value={text} onChange={e=>{
            setText(e.target.value); const next=field.kind==='list'?e.target.value.split('\n').filter(v=>v.trim()):e.target.value;
            onChange(next.length?next:null);
        }}/></label>}
        {field.kind==='number'&&<><label>{t.original}<input name="matrix_original" maxLength={2000} value={original} onChange={e=>{setOriginal(e.target.value);onChange(numeric(e.target.value,normalized));}}/></label>
            <label>{t.normalized}<input name="matrix_normalized" inputMode="decimal" value={normalized} onChange={e=>{setNormalized(e.target.value);onChange(numeric(original,e.target.value));}}/></label></>}
        {(field.kind==='boolean'||field.kind==='enum')&&<label>{t.value}<select name="matrix_choice" value={choice} onChange={e=>{setChoice(e.target.value);onChange(e.target.value===''?null:field.kind==='boolean'?e.target.value==='true':e.target.value);}}><option value="">{t.unset}</option>
            {field.kind==='boolean'?<><option value="true">{t.booleanTrue}</option><option value="false">{t.booleanFalse}</option></>:(field.options??[]).map(v=><option key={v}>{v}</option>)}
        </select></label>}
        {field.kind==='experimental_result'&&<>{results.map((result,index)=><fieldset key={index}><legend>{t.kinds.experimental_result} {index+1}</legend>
            {(['metric','original','normalized','dataset','condition','unit','baseline'] as const).map(key=><label key={key}>{t[key]}<input name={`matrix_result_${index}_${key}`} value={result[key]} maxLength={2000}
                onChange={e=>resultChange(results.map((old,i)=>i===index?{...old,[key]:e.target.value}:old))}/></label>)}
            <label>{t.direction}<select value={result.direction} onChange={e=>resultChange(results.map((old,i)=>i===index?{...old,direction:e.target.value as Result['direction']}:old))}>{Object.entries(t.directions).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
            <button type="button" onClick={()=>resultChange(results.filter((_,i)=>i!==index))}>{t.removeResult}</button>
        </fieldset>)}<button type="button" disabled={results.length>=50} onClick={()=>resultChange([...results,emptyResult()])}>{t.addResult}</button></>}
    </fieldset>;
}
