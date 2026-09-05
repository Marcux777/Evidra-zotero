import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
async function production(path: string) {
    expect(existsSync(new NodeURL(`../src/${path}`, import.meta.url)), `missing Task2 behavior: ${path}`).toBe(true);
    return import(/* @vite-ignore */ new NodeURL(`../src/${path}`, import.meta.url).href);
}
afterEach(() => { document.body.replaceChildren(); });
test('rejects arbitrary capabilities and extra fields before dispatch; only exact renderer source is accepted', async () => {
    const { parseUiMessage, isUiEvent } = await production('security/messages.ts');
    for (const message of [{ op: 'read_file', path: 'C:\\secret' }, { op: 'status', token: 'secret' }, { op: 'notebook.create', name: ' ', idempotency_key: 'x' }, { op: 'notebook.select', id: '../secret' }, { op: 'engine.start', fingerprint: 'bad', consent: true }]) {
        expect(() => parseUiMessage(message)).toThrow();
    }
    expect(parseUiMessage({ op: 'notebook.create', name: 'Evidence', idempotency_key: 'k' })).toEqual({ op: 'notebook.create', name: 'Evidence', idempotency_key: 'k' });
    const source = {};
    const wrong = {};
    expect(isUiEvent({ source, origin: 'null' }, source)).toBe(true);
    expect(isUiEvent({ source: wrong, origin: 'null' }, source)).toBe(false);
    expect(isUiEvent({ source, origin: 'https://evil.example' }, source)).toBe(false);
});
test('renders document text without images, active markup or executable links', async () => {
    const { renderSafeMarkdown } = await production('security/markdown.ts');
    const html = renderSafeMarkdown('<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n[run](javascript:alert(1))\n![leak](https://evil.example/x)\n[good](https://example.org/paper)');
    const box = document.createElement('div');
    box.innerHTML = html;
    expect(box.querySelector('img,script,iframe,object,svg')).toBeNull();
    expect([...box.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['https://example.org/paper']);
    expect(box.textContent).toContain('<img src=x onerror=alert(1)>');
});
test('retains structured startup causes while excluding raw exception inputs and credentials', async () => {
    const { nativeDiagnostic, parseEngineDiagnostic } = await production('security/diagnostics.ts');
    const token = 'e'.repeat(64);
    const cli = parseEngineDiagnostic(JSON.stringify({ operation: 'consume_handshake', causes: [{ type: 'EvidraError', code: 'ACL_ERROR', operation: 'validate_acl' }, { type: 'CalledProcessError', returncode: 1, acl: { reason: 'ACL_OPERATION_FAILED', exception_type: 'System.Management.Automation.ItemNotFoundException', category: 'ObjectNotFound', line: 8, hresult: -2146233087 }, stderr: token }] }));
    const result = nativeDiagnostic(new Error('ENGINE_EXITED', { cause: { exitCode: 1, diagnostic: cli, path: 'C:\\private', token } }));
    const text = JSON.stringify(result);
    expect(text).toContain('consume_handshake');
    expect(text).toContain('CalledProcessError');
    expect(text).toContain('-2146233087');
    expect(text).not.toContain(token);
    expect(text).not.toContain('C:\\private');
    expect(JSON.stringify(parseEngineDiagnostic(token))).not.toContain(token);
});
test('real React notebook flow validates name, creates, selects and reopens through the controlled bridge', async () => {
    const { App } = await production('ui/App.tsx');
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const notebooks: unknown[] = [];
    let selected: unknown = null;
    let startupError: string|null = 'PAYLOAD_HASH_MISMATCH';
    const bridge = { async request(message: {
            op: string;
            name?: string;
            idempotency_key?: string;
            id?: string;
        }) {
            if (message.op === 'status')
                return { state: startupError?'failed':'running', version: '10.0.1', locale: 'pt-BR', theme: 'system', mode: 'LOCAL', selected, engine: null, error: startupError };
            if (message.op === 'notebook.list')
                return { items: notebooks, offset: 0, limit: 50, total: notebooks.length };
            if (message.op === 'notebook.create') {
                if (!message.idempotency_key)
                    throw new Error('key required');
                const n = { id: '11111111-1111-4111-8111-111111111111', profile_instance_id: 'fixture', name: message.name, revision: 1, initial_snapshot_id: 'snapshot', created_at: '2026-09-05T00:00:00Z', updated_at: '2026-09-05T00:00:00Z' };
                notebooks.push(n);
                return n;
            }
            if (message.op === 'notebook.select') {
                selected = notebooks.find((n: any) => n.id === message.id);
                return selected;
            }
            throw new Error('unexpected operation');
        } };
    const host = document.createElement('div');
    document.body.append(host);
    let root = createRoot(host);
    await act(async () => root.render(<App bridge={bridge}/>));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('PAYLOAD_HASH_MISMATCH');
    await act(async()=>root.unmount());startupError=null;root=createRoot(host);
    await act(async () => root.render(<App bridge={bridge}/>));
    const form = host.querySelector('form')!;
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const input = host.querySelector('input[name="name"]') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input);
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Revisão de evidências'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(host.querySelector('h1')!.textContent).toBe('Revisão de evidências');
    expect(host.textContent).toContain('Revisão de fontes');
    expect(host.textContent).toContain('Nenhum modelo');
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(<App bridge={bridge}/>));
    expect(host.querySelector('h1')!.textContent).toBe('Revisão de evidências');
    await act(async () => root.unmount());
});
