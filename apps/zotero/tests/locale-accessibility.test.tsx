import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { App } from '../src/ui/App';
import { catalog } from '../src/ui/i18n';
import type { Locale } from '../src/bridge/types';

function leaves(value: unknown, prefix = ''): [string, string][] {
    if (typeof value === 'string') return [[prefix, value]];
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => leaves(child, `${prefix}.${key}`));
}

test('complete catalogs have identical semantic keys and authored UTF-8 Portuguese codepoints', () => {
    const pt = leaves(catalog('pt-BR')), en = leaves(catalog('en-US'));
    expect(pt.map(([key]) => key).sort()).toEqual(en.map(([key]) => key).sort());
    expect(catalog('pt-BR').empty).toBe('Voc\u00ea ainda n\u00e3o tem cadernos.');
    for (const [key, value] of [...pt, ...en]) {
        expect(value.trim(), key).not.toBe('');
        expect(value, key).not.toMatch(/\uFFFD|Ã[\u0080-\u00BF]|Â[\u0080-\u00BF]|â€|ðŸ/);
    }
});

test.each(['pt-BR', 'en-US'] as Locale[])('onboarding in %s has named controls, semantic landmarks and an actionable package diagnostic', async locale => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
        await act(async () => root.render(<App bridge={{ request: async message => {
            if (message.op === 'status') return {state:'failed', locale, theme:'light', mode:'LOCAL', version:'10.0.1', selected:null, engine:null, error:'INVALID_ENGINE_MANIFEST'};
            if (message.op === 'notebook.list') return {items:[], offset:0, limit:50, total:0};
            throw new Error('Unexpected operation');
        } }}/>));
        expect(host.querySelector('main#main h1')).toBeTruthy();
        expect(host.querySelector('a.skip')?.getAttribute('href')).toBe('#main');
        expect(host.querySelector('[role=alert]')?.textContent).toContain(catalog(locale).diagnostics.INVALID_ENGINE_MANIFEST);
        for (const control of host.querySelectorAll('button,input,select,textarea')) {
            const element = control as HTMLInputElement;
            const name = element.getAttribute('aria-label') || element.labels?.[0]?.textContent || element.textContent;
            expect(name?.trim(), element.outerHTML).toBeTruthy();
        }
        expect(host.textContent).toContain(catalog(locale).empty);
        expect(document.documentElement.lang).toBe(locale);
    } finally { await act(async () => root.unmount()); host.remove(); }
});
