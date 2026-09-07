import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

/** Fixed-height rows, bounded overscan, and keyboard navigation across unmounted rows. */
export function WindowedList<T>({ items, label, rowKey, render, rowHeight = 76 }: {
    items: T[]; label: string; rowKey: (item:T)=>string; render: (item:T,index:number)=>ReactNode; rowHeight?: number;
}) {
    const viewport = useRef<HTMLDivElement>(null), [top, setTop] = useState(0);
    const height = 380, start = Math.max(0, Math.min(items.length-1, Math.floor(top / rowHeight))-2);
    const end = Math.min(items.length, start + Math.ceil(height / rowHeight) + 5);
    return <div ref={viewport} className="windowed-list" role="list" aria-label={label} tabIndex={0}
        style={{height, overflowY:'auto'}} onScroll={e=>setTop(e.currentTarget.scrollTop)}
        onKeyDown={e=>{
            if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.nativeEvent.isComposing) return;
            const target = (e.target as HTMLElement).closest('[data-row-index]');
            const current = Number(target?.getAttribute('data-row-index') ?? start);
            const next = e.key==='Home'?0:e.key==='End'?items.length-1:Math.max(0,Math.min(items.length-1,current+(e.key==='ArrowDown'?1:-1)));
            if (next<0 || !viewport.current) return;
            e.preventDefault(); viewport.current.scrollTop = next*rowHeight; setTop(next*rowHeight);
            requestAnimationFrame(()=>viewport.current?.querySelector<HTMLElement>(`[data-row-index="${next}"] button`)?.focus());
        }}>
        <div style={{height:items.length*rowHeight,position:'relative'}}>{items.slice(start,end).map((item, index)=><div role="listitem" aria-posinset={start+index+1} aria-setsize={items.length} data-row-index={start+index}
            key={rowKey(item)} className="windowed-row" style={{position:'absolute',top:(start+index)*rowHeight,height:rowHeight,inlineSize:'100%'}}>{render(item,start+index)}</div>)}</div>
    </div>;
}
