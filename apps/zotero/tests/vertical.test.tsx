import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { Onboarding } from '../src/ui/onboarding';
import { EngineController, type EnginePlatform } from '../src/bootstrap/engine';
import { catalog } from '../src/ui/i18n';
import type { BridgeStatus, UiBridge } from '../src/bridge/types';
async function production(path: string) {
    expect(existsSync(new NodeURL(`../src/${path}`, import.meta.url)), `missing Task2 behavior: ${path}`).toBe(true);
    return import(/* @vite-ignore */ new NodeURL(`../src/${path}`, import.meta.url).href);
}
afterEach(() => { document.body.replaceChildren(); });
test('executable consent acknowledges one fingerprint and must be renewed after package changes or failed startup', async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    let fingerprint = 'a'.repeat(64), launches = 0;
    const errors: unknown[] = [];
    const platform: EnginePlatform = {
        verify: async () => ({ fingerprint, manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', entrypoint: 'evidra-engine.exe', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'd'.repeat(64) }] } }),
        start: async () => { launches++; return { token: 'e'.repeat(64), receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, stop: async () => {} }; },
        fetch: async () => new Response(JSON.stringify({ status: 'ok', protocol_version: 1, profile_instance_id: 'profile', heartbeat_interval_seconds: 10, heartbeat_timeout_seconds: 30 })),
        every: () => () => {},
        reportError: error => { throw error; }
    };
    const controller = new EngineController(platform, 'profile');
    const bridge: UiBridge = { request: async message => {
        if (message.op !== 'engine.start') throw new Error('unexpected operation');
        return controller.start(message.fingerprint, message.consent);
    } };
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const render = async () => {
        const status: BridgeStatus = { ...controller.view(), version: '10.0.1', locale: 'pt-BR', theme: 'system', mode: 'LOCAL', selected: null };
        await act(async () => root.render(<Onboarding status={status} bridge={bridge} t={catalog('pt-BR')} refresh={async () => {}} onError={error => errors.push(error)}/>));
    };
    const checkbox = () => host.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const start = () => host.querySelector('button.primary') as HTMLButtonElement;
    try {
        await controller.choose('package'); await render();
        await act(async () => checkbox().click());
        fingerprint = 'b'.repeat(64); await controller.verify(); await render();
        expect(checkbox().checked).toBe(false);
        expect(start().disabled).toBe(true);
        // Returning to an old fingerprint must not resurrect an old acknowledgement.
        fingerprint = 'a'.repeat(64); await controller.verify(); await render();
        expect(start().disabled).toBe(true);
        await act(async () => checkbox().click());
        // The privileged payload changes after UI acknowledgement but before startup.
        fingerprint = 'c'.repeat(64);
        await act(async () => start().click());
        expect(launches).toBe(0);
        expect(errors).toMatchObject([{ message: 'PAYLOAD_CHANGED' }]);
        expect(checkbox().checked).toBe(false);
        expect(start().disabled).toBe(true);
        await render();
        expect(start().disabled).toBe(true);
        await act(async () => checkbox().click());
        await act(async () => start().click());
        expect(launches).toBe(1);
        expect(controller.view().state).toBe('running');
    }
    finally { await act(async () => root.unmount()); await controller.stop(); }
});
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
test.each(['click', 'Enter'] as const)('real React notebook command uses %s without form submission and preserves validation, drafts and idempotency', async activation => {
    const { App } = await production('ui/App.tsx');
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const notebooks: unknown[] = [];
    let selected: unknown = null;
    let startupError: string|null = 'PAYLOAD_HASH_MISMATCH';
    const creates: { name: string | undefined; idempotency_key: string }[] = [];
    let holdCreate = true, failCreate = true;
    let releaseCreate: (() => void) | null = null;
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
                creates.push({ name: message.name, idempotency_key: message.idempotency_key });
                if (holdCreate) await new Promise<void>(resolve => { releaseCreate = resolve; });
                if (failCreate) throw new Error('CREATE_FAILED');
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
    const cryptoProperty = Object.getOwnPropertyDescriptor(globalThis, 'crypto')!;
    const contentCrypto = { getRandomValues: crypto.getRandomValues.bind(crypto) };
    try {
        // Match the opaque Gecko realm: no randomUUID, with the real CSPRNG available.
        Object.defineProperty(globalThis, 'crypto', { configurable: true, value: contentCrypto });
        expect('randomUUID' in crypto).toBe(false);
        await act(async () => root.render(<App bridge={bridge}/>));
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('PAYLOAD_HASH_MISMATCH');
        await act(async()=>root.unmount());startupError=null;root=createRoot(host);
        await act(async () => root.render(<App bridge={bridge}/>));
        const form = host.querySelector('form')!;
        const input = host.querySelector('input[name="name"]') as HTMLInputElement;
        const button = form.querySelector('button')!;
        let submits = 0;
        form.addEventListener('submit', () => { submits++; });
        const enter = (options: KeyboardEventInit = {}) => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...options }));
        const activate = () => { if (activation === 'click') button.click(); else enter(); };
        await act(async () => activate());
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(document.activeElement).toBe(input);
        expect(submits).toBe(0);
        expect(creates).toHaveLength(0);
        expect(host.querySelector(`#${form.getAttribute('aria-labelledby')}`)?.textContent).toBe('Criar caderno');
        expect(input.labels?.[0]?.textContent).toBe('Nome do caderno');
        expect(button.type).toBe('button');
        expect(button.textContent).toBe('Criar caderno');
        await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '  Revisão de evidências  '); input.dispatchEvent(new Event('input', { bubbles: true })); });
        for (const options of [{ isComposing: true }, { keyCode: 229 }, { repeat: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true }, { key: 'a' }]) {
            await act(async () => { enter(options); });
            expect(creates).toHaveLength(0);
        }
        // Both commands can arrive before React commits disabled controls.
        await act(async () => { activate(); button.click(); enter(); });
        expect(creates).toHaveLength(1);
        expect(creates[0]?.name).toBe('Revisão de evidências');
        expect(creates[0]?.idempotency_key).toMatch(/^[0-9a-f]{64}$/);
        expect(button.disabled).toBe(true);
        expect(input.disabled).toBe(true);
        expect(input.value).toBe('  Revisão de evidências  ');
        await act(async () => { button.click(); enter(); });
        expect(creates).toHaveLength(1);
        expect(releaseCreate).not.toBeNull();
        await act(async () => { releaseCreate!(); });
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('CREATE_FAILED');
        expect(input.value).toBe('  Revisão de evidências  ');
        expect(button.disabled).toBe(false);
        expect(input.disabled).toBe(false);
        expect(notebooks).toHaveLength(0);
        holdCreate = false; failCreate = false;
        await act(async () => activate());
        expect(creates).toHaveLength(2);
        expect(creates[1]).toEqual(creates[0]);
        expect(notebooks).toHaveLength(1);
        expect(host.querySelector('h1')!.textContent).toBe('Revisão de evidências');
        expect(host.textContent).toContain('Revisão de fontes');
        expect(host.textContent).toContain('Nenhum modelo');
        expect(input.value).toBe('');
        expect(host.querySelector('[role="alert"]')).toBeNull();
        expect(submits).toBe(0);
        await act(async () => root.unmount());
        root = createRoot(host);
        await act(async () => root.render(<App bridge={bridge}/>));
        expect(host.querySelector('h1')!.textContent).toBe('Revisão de evidências');
    }
    finally {
        try { await act(async () => { releaseCreate?.(); root.unmount(); }); }
        finally { Object.defineProperty(globalThis, 'crypto', cryptoProperty); }
    }
});
