import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { Conversation } from '../src/ui/Conversation';

test('native conversation prepares explicitly, keeps uncertain request keys, shows drafts and disables absent vision', async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
    const conversation = { id: 'b'.repeat(32), ...scope, revision: 0 };
    const profile = { id: 'local', revision: 1, adapter: 'ollama', model: 'fixture', mode: 'LOCAL', purpose: 'generation', base_url: 'http://127.0.0.1:11434', capabilities: { generation: { supported: true, provenance: 'USER_DECLARED' } } };
    const run: any = { id: 'c'.repeat(32), conversation_id: conversation.id, state: 'PREPARED', profile, categories: ['excerpts'], question: 'question', prompt_version: 'conversation-v1',
        context: { documents_retrieved: 1, documents_used: 1, excluded_budget: 0, excluded_overlap: 0, excluded_limit: 0,
            estimated_input_tokens: 1000, max_output_tokens: 512, context_tokens: 4096, system: 'system', history: [], prompt: 'authorized excerpt' }, output: null, visual: null, error: null };
    const messages: any[] = [];
    let prepares = 0, release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const bridge = { request: async (message: any) => {
        messages.push(structuredClone(message));
        if (message.op === 'provider.list') return { items: [profile], offset: 0, limit: 50, total: 1 };
        if (message.op === 'provider.settings') return { block_paid_apis: true, revision: 0 };
        if (message.op === 'provider.budget.read') return null;
        if (message.op === 'provider.calls') return { items: [], offset: 0, limit: 50, total: 0 };
        if (message.op === 'conversation.list') return { items: [], offset: 0, limit: 50, total: 0 };
        if (message.op === 'conversation.create' || message.op === 'conversation.read') return conversation;
        if (message.op === 'conversation.history') return { items: [], offset: 0, limit: 50, total: 0 };
        if (message.op === 'conversation.prepare') { if (++prepares === 1) throw new Error('BRIDGE_TIMEOUT'); return structuredClone(run); }
        if (message.op === 'conversation.start') { run.state = 'RUNNING'; return structuredClone(run); }
        if (message.op === 'conversation.run') return structuredClone(run);
        if (message.op === 'conversation.events') {
            if (message.cursor === 0) return { cursor: 8, state: 'RUNNING', items: Array.from({ length: 8 }, (_, index) => ({ cursor: index + 1, kind: 'draft', text: 'draft', code: null })) };
            await gate; return { cursor: 9, state: 'COMPLETE', items: [{ cursor: 9, kind: 'complete', text: null, code: null }] };
        }
        throw new Error(`Unexpected UI command: ${message.op}`);
    } };
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    async function click(text: string) {
        const button = [...host.querySelectorAll('button')].find(value => value.textContent === text);
        expect(button, text).toBeTruthy(); await act(async () => button!.click());
    }
    try {
        await act(async () => root.render(<Conversation bridge={bridge} {...scope} locale="en-US"/>));
        expect(messages).toEqual([]);
        await click('Open conversation');
        const select = host.querySelector('select[name=conversation_profile]') as HTMLSelectElement;
        await act(async () => { select.value = 'local'; select.dispatchEvent(new Event('change', { bubbles: true })); });
        const input = host.querySelector('textarea')!;
        await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, 'question'); input.dispatchEvent(new Event('input', { bubbles: true })); });
        expect((host.querySelector('input[name=conversation_image]') as HTMLInputElement).disabled).toBe(true);
        expect(host.textContent).toContain('does not declare image support');
        await click('Prepare context'); await click('Prepare context');
        const prepared = messages.filter(message => message.op === 'conversation.prepare');
        expect(prepared).toHaveLength(2); expect(prepared[0]).toEqual(prepared[1]);
        expect(messages.some(message => message.op === 'conversation.start')).toBe(false);
        expect(host.textContent).toContain('nothing sent to the generator');
        await click('Send context and start');
        expect(host.textContent).toContain('Draft — not yet validated');
        expect(host.querySelector('.answer')).toBeNull();
        run.state = 'COMPLETE'; run.output = { claims: [{ text: '<img src="https://outside.invalid">', kind: 'general', evidence: [] }] }; conversation.revision = 1;
        await act(async () => { release(); await gate; });
        expect(host.querySelector('.answer')?.textContent).toContain('<img src="https://outside.invalid">');
        expect(host.querySelector('img')).toBeNull();
        expect(host.textContent).not.toContain('Valid anchor:');
        expect(messages.filter(message => message.op === 'conversation.start')).toHaveLength(1);
    } finally { release(); await act(async () => root.unmount()); host.remove(); }
});
