import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { App } from '../src/ui/App';
import { Conversation } from '../src/ui/Conversation';
import { ProviderSettings } from '../src/ui/ProviderSettings';
import { Exports } from '../src/ui/Exports';
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

test.each(['pt-BR', 'en-US'] as Locale[])('actual failure panels in %s retain machine codes and show actionable diagnostics', async locale => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    const t = catalog(locale), scope = { notebook_id: 'notebook', snapshot_id: 'snapshot', locale };
    const cause = new Error('HTTP 404 from configured provider endpoint');
    const providerFailure = new Error('PROVIDER_HTTP_ERROR', { cause });
    const importFailure = new Error('INVALID_BACKUP', { cause: new Error('Unresolved decision proposal') });
    const commands: string[] = [];
    const bridge = { request: async (message: {op: string}) => {
        commands.push(message.op);
        if (message.op === 'provider.list') throw providerFailure;
        if (message.op === 'sources.read' || message.op === 'imports.list') return { items: [], offset: 0, limit: 0, total: 0 };
        if (message.op === 'imports.choose') throw importFailure;
        throw new Error(`Unexpected operation: ${message.op}`);
    } };
    const click = async (label: string) => {
        const button = [...host.querySelectorAll('button')].find(item => item.textContent === label);
        expect(button, label).toBeTruthy(); await act(async () => button!.click());
    };
    try {
        await act(async () => root.render(<><Conversation bridge={bridge} {...scope}/><ProviderSettings bridge={bridge} locale={locale}/><Exports bridge={bridge} {...scope}/></>));
        await click(t.chat.open); await click(t.chat.models); await click(t.exports.open); await click(t.exports.choose);
        for (const name of [t.chat.title, t.chat.models]) {
            const panel = [...host.querySelectorAll('section')].find(item => item.getAttribute('aria-label') === name)!;
            const alert = panel.querySelector('[role=alert]')!;
            expect(alert.textContent).toContain('PROVIDER_HTTP_ERROR');
            expect(alert.textContent).toMatch(locale === 'pt-BR' ? /endereço.*modelo/i : /endpoint.*model/i);
            expect(alert.textContent).not.toContain('MODEL_NOT_FOUND');
            expect(alert.textContent).not.toContain(cause.message);
        }
        const imported = [...host.querySelectorAll('section')].find(item => item.getAttribute('aria-label') === t.exports.importTitle)!;
        expect(imported.querySelector('[role=alert]')?.textContent).toContain('INVALID_BACKUP');
        expect(imported.querySelector('[role=alert]')?.textContent).toContain(t.diagnostics.INVALID_BACKUP);
        expect(providerFailure.message).toBe('PROVIDER_HTTP_ERROR'); expect(providerFailure.cause).toBe(cause);
        expect(commands.filter(op => op === 'imports.choose')).toHaveLength(1);
    } finally { await act(async () => root.unmount()); host.remove(); }
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
