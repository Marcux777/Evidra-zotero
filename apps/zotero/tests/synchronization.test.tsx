import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test, vi } from 'vitest';
import { App } from '../src/ui/App';
import type { BridgeStatus, Notebook, NotebookPage, UiBridge, UiMessage } from '../src/bridge/types';

test('mounted reader follows shared startup and notebook changes while keeping drafts and newer selection/page', async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    let running = false, selected: Notebook | null = null;
    const notebooks: Notebook[] = [];
    const notebook = (name: string, number: number): Notebook => ({ id: `${String(number).padStart(8, '0')}-1111-4111-8111-111111111111`, profile_instance_id: 'profile', name, revision: 1, initial_snapshot_id: 'snapshot', created_at: '2026-09-05T00:00:00Z', updated_at: '2026-09-05T00:00:00Z' });
    const status = (): BridgeStatus => ({ state: running ? 'running' : 'stopped', version: '10.0.1', locale: 'pt-BR', theme: 'system', mode: 'LOCAL', selected, engine: null, error: null });
    async function request(message: UiMessage): Promise<unknown> {
        switch (message.op) {
            case 'status': return status();
            case 'notebook.list': return { items: notebooks.slice(message.offset, message.offset + 50), offset: message.offset, limit: 50, total: notebooks.length } satisfies NotebookPage;
            case 'notebook.create': { const created = notebook(message.name, notebooks.length + 1); notebooks.push(created); return created; }
            case 'notebook.select': selected = notebooks.find(n => n.id === message.id)!; return selected;
            default: throw new Error('unexpected operation');
        }
    }
    let holdReaderPage = false, releasePage: (() => void) | null = null;
    const readerBridge: UiBridge = { request: async message => {
        const response = await request(message);
        if (holdReaderPage && message.op === 'notebook.list') {
            holdReaderPage = false;
            await new Promise<void>(resolve => { releasePage = resolve; });
        }
        return response;
    } };
    const reader = document.createElement('div'), workspace = document.createElement('div');
    document.body.append(reader, workspace);
    const readerRoot = createRoot(reader), workspaceRoot = createRoot(workspace);
    const tick = async () => { await act(async () => { await vi.advanceTimersByTimeAsync(10000); }); };
    const typeName = async (host: HTMLElement, text: string) => { await act(async () => {
        const input = host.querySelector('input[name="name"]')!;
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }); };
    try {
        await act(async () => { readerRoot.render(<App bridge={readerBridge} compact/>); workspaceRoot.render(<App bridge={{ request }}/>); });
        running = true; notebooks.push(notebook('Caderno inicial', 1));
        await tick();
        expect(reader.querySelector('.notebooks')?.textContent).toContain('Caderno inicial');
        await typeName(reader, 'Rascunho ainda não salvo');
        const language = reader.querySelector('select')!;
        await act(async () => { language.value = 'en-US'; language.dispatchEvent(new Event('change', { bubbles: true })); });
        await typeName(workspace, 'Criado em outra janela');
        await act(async () => { workspace.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
        expect(workspace.querySelector('.notebooks')?.textContent).toContain('Criado em outra janela');
        await tick();
        expect(reader.querySelector('.notebooks')?.textContent).toContain('Criado em outra janela');
        expect(reader.querySelector('h1')?.textContent).toBe('Criado em outra janela');
        expect((reader.querySelector('input[name="name"]') as HTMLInputElement).value).toBe('Rascunho ainda não salvo');
        expect(language.value).toBe('en-US');
        for (let i = 3; i <= 51; i++) notebooks.push(notebook(`Caderno ${i}`, i));
        await tick();
        holdReaderPage = true;
        await tick();
        expect(releasePage).not.toBeNull();
        await act(async () => { (reader.querySelector('nav button:last-child') as HTMLButtonElement).click(); });
        expect(reader.querySelector('.notebooks')?.textContent).toBe('Caderno 51');
        await act(async () => { (reader.querySelector('.notebooks button') as HTMLButtonElement).click(); });
        expect(reader.querySelector('h1')?.textContent).toBe('Caderno 51');
        await act(async () => { releasePage!(); });
        expect(reader.querySelector('.notebooks')?.textContent).toBe('Caderno 51');
        expect(reader.querySelector('h1')?.textContent).toBe('Caderno 51');
        running = false; selected = null;
        await tick();
        expect(reader.querySelector('.notebooks')?.textContent).toBe('');
    }
    finally { await act(async () => { releasePage?.(); readerRoot.unmount(); workspaceRoot.unmount(); }); reader.remove(); workspace.remove(); vi.useRealTimers(); }
});
