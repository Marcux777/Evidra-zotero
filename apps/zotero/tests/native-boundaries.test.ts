import { test, expect, vi } from 'vitest';
import { nativeEngine } from '../src/bootstrap/native-engine';
import { ZoteroBridge } from '../src/bridge/zotero';
import type { NativeGlobals } from '../src/bridge/native-types';
import { createUiTransport } from '../src/ui/transport';

test('opaque UI waits for native readiness and exchanges only admitted messages on its own window', async () => {
    // Gecko's chrome boundary cannot be emulated by jsdom. These event identities are
    // recorded by the isolated Zotero 10.0.1 native probe; production transport is real.
    const logs: unknown[] = [];
    const bridge = new ZoteroBridge({ Zotero: { logError: (error: unknown) => { logs.push(error); } } } as unknown as NativeGlobals, () => {});
    const dispatch = vi.spyOn(bridge, 'dispatch').mockImplementation(async request => ({ operation: request.op }));
    const parent = document.createElement('div'); document.body.append(parent);
    const unmount = bridge.mount(parent, window, false, () => {});
    const frame = parent.querySelector('iframe')!;
    const child = frame.contentWindow!;
    const listeners = new Map<string, Set<EventListener>>();
    const add = vi.spyOn(child, 'addEventListener').mockImplementation((type, callback) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(callback as EventListener);
    });
    const remove = vi.spyOn(child, 'removeEventListener').mockImplementation((type, callback) => { listeners.get(type)?.delete(callback as EventListener); });
    const deliver = (event: Record<string, unknown>) => { for (const listener of [...(listeners.get('message') ?? [])]) listener(event as unknown as Event); };
    const outgoing: string[] = [];
    let pauseReplies = false;
    const post = vi.spyOn(child, 'postMessage').mockImplementation(message => {
        outgoing.push(message as string);
        const value = JSON.parse(message as string);
        const request = Object.hasOwn(value, 'request');
        if (pauseReplies && Object.hasOwn(value, 'result')) return;
        deliver({ data: message, source: request ? child : null, origin: request ? 'null' : '', isTrusted: true });
    });
    const transport = createUiTransport(child);
    try {
        const first = transport.bridge.request({ op: 'status' });
        const ready = JSON.stringify({ channel: 'evidra-ui-v1', ready: true });
        for (const invalid of [{ source: child }, { origin: 'null' }, { isTrusted: false }])
            deliver({ data: ready, source: null, origin: '', isTrusted: true, ...invalid });
        expect(outgoing).toEqual([]);
        frame.dispatchEvent(new Event('load'));
        await expect(first).resolves.toEqual({ operation: 'status' });
        expect(dispatch).toHaveBeenCalledTimes(1);
        const request = JSON.stringify({ channel: 'evidra-ui-v1', id: 'foreign', request: { op: 'status' } });
        expect(() => deliver({ data: 'null', source: child, origin: 'null', isTrusted: true })).not.toThrow();
        for (const invalid of [{ source: window }, { origin: '' }, { isTrusted: false }])
            deliver({ data: request, source: child, origin: 'null', isTrusted: true, ...invalid });
        await Promise.resolve();
        expect(dispatch).toHaveBeenCalledTimes(1);
        pauseReplies = true;
        let settled = false;
        const second = transport.bridge.request({ op: 'status' }).then(value => { settled = true; return value; });
        const response = { channel: 'evidra-ui-v1', id: 'ui-2', result: { operation: 'status' }, error: null };
        for (const invalid of [{ source: child }, { origin: 'null' }, { isTrusted: false }])
            deliver({ data: JSON.stringify(response), source: null, origin: '', isTrusted: true, ...invalid });
        deliver({ data: JSON.stringify({ ...response, extra: true }), source: null, origin: '', isTrusted: true });
        await Promise.resolve();
        expect(settled).toBe(false);
        deliver({ data: JSON.stringify(response), source: null, origin: '', isTrusted: true });
        await expect(second).resolves.toEqual({ operation: 'status' });
        unmount();
        const afterClose = transport.bridge.request({ op: 'status' });
        transport.close();
        await expect(afterClose).rejects.toThrow('BRIDGE_CLOSED');
        expect(listeners.get('message')?.size).toBe(0);
        expect(logs).toEqual([]);
    } finally {
        transport.close(); unmount(); post.mockRestore(); add.mockRestore(); remove.mockRestore(); parent.remove();
    }
});

test('native verification appends individual Windows executable components before invoking the system command', async () => {
    const boundary = new Error('MANIFEST_READ_BOUNDARY');
    const calls: string[] = [];
    const g = {
        PathUtils: { join: (root: string, ...components: string[]) => {
            if (components.some(part => /[\\/]/.test(part))) throw new DOMException('NS_ERROR_FILE_UNRECOGNIZED_PATH', 'OperationError');
            return [root, ...components].join('\\');
        } },
        ChromeUtils: { importESModule: () => ({ Subprocess: {
            getEnvironment: () => ({ LOCALAPPDATA: 'C:\\local', SystemRoot: 'C:\\Windows' }),
            call: async (options: { command: string }) => { calls.push(options.command); return {
                wait: async () => ({ exitCode: 0 }), stdout: { readString: async () => '' }, stderr: { readString: async () => '' }
            }; }
        } }) },
        IOUtils: { stat: async () => ({ size: 1 }), readJSON: async () => { throw boundary; } },
        fetch: globalThis.fetch, setTimeout, clearTimeout, setInterval, clearInterval
    } as unknown as NativeGlobals;
    await expect(nativeEngine(g).verify('C:\\payload')).rejects.toBe(boundary);
    expect(calls).toEqual(['C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe']);
});
