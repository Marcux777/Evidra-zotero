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
    const frame = document.createElement('iframe');
    // Gecko propagates child document load through the embedding iframe only in
    // capture phase. jsdom does not implement this native browsing-context path.
    const loads = new Set<{ callback: EventListenerOrEventListenerObject; capture: boolean; once: boolean }>();
    const capture = (options?: boolean | EventListenerOptions) => typeof options === 'boolean' ? options : options?.capture === true;
    const loadAdd = vi.spyOn(frame, 'addEventListener').mockImplementation((type, callback, options) => {
        if (type !== 'load' || !callback) throw new Error('UNEXPECTED_FRAME_LISTENER');
        loads.add({ callback, capture: capture(options), once: typeof options === 'object' && options.once === true });
    });
    const loadRemove = vi.spyOn(frame, 'removeEventListener').mockImplementation((type, callback, options) => {
        if (type !== 'load') throw new Error('UNEXPECTED_FRAME_LISTENER');
        for (const load of loads) if (load.callback === callback && load.capture === capture(options)) loads.delete(load);
    });
    const create = vi.spyOn(document, 'createElementNS').mockReturnValueOnce(frame);
    const unmount = bridge.mount(parent, window, true, () => {});
    create.mockRestore();
    const child = frame.contentWindow!;
    const childDocument = frame.contentDocument!;
    const documentUri = vi.spyOn(childDocument, 'documentURI', 'get').mockReturnValue('chrome://evidra/content/ui.html?surface=reader');
    const readyState = vi.spyOn(childDocument, 'readyState', 'get').mockReturnValue('complete');
    const deliverLoad = (target: EventTarget, isTrusted = true) => {
        const event = { type: 'load', target, originalTarget: target, currentTarget: frame, eventPhase: 1, isTrusted } as unknown as Event;
        for (const load of [...loads]) if (load.capture) {
            if (load.once) loads.delete(load);
            if (typeof load.callback === 'function') load.callback.call(frame, event);
            else load.callback.handleEvent(event);
        }
    };
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
        const first = transport.bridge.request({ op: 'status' }).then(result => ({ result }), error => ({ error }));
        const ready = JSON.stringify({ channel: 'evidra-ui-v1', ready: true });
        for (const invalid of [{ source: child }, { origin: 'null' }, { isTrusted: false }])
            deliver({ data: ready, source: null, origin: '', isTrusted: true, ...invalid });
        expect(outgoing).toEqual([]);
        deliverLoad(childDocument.createElement('link'));
        deliverLoad(document);
        deliverLoad(childDocument, false);
        documentUri.mockReturnValue('chrome://evidra/content/ui.html');
        deliverLoad(childDocument);
        documentUri.mockReturnValue('chrome://evidra/content/ui.html?surface=reader');
        readyState.mockReturnValue('interactive');
        deliverLoad(childDocument);
        expect(outgoing).toEqual([]);
        readyState.mockReturnValue('complete');
        deliverLoad(childDocument);
        expect(outgoing).toContain(ready);
        expect(loads.size).toBe(0);
        await expect(first).resolves.toEqual({ result: { operation: 'status' } });
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
        pauseReplies = false;
        const research: any = { op: 'research.prepare', notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32), request: {
            kind: 'AUDIT', protocol_version_id: 'b'.repeat(32), profile_id: 'local', question: 'Question', pasted_text: 'é'.repeat(12000),
            retrieval_query: 'query', idempotency_key: 'audit',
        } };
        await expect(transport.bridge.request(research)).resolves.toEqual({ operation: 'research.prepare' });
        expect(dispatch).toHaveBeenLastCalledWith(research, window, expect.any(Function));
        const sentBefore = outgoing.length;
        await expect(transport.bridge.request({ ...research, request: { ...research.request, pasted_text: '字'.repeat(24000) } })).rejects.toThrow('BODY_TOO_LARGE');
        expect(outgoing).toHaveLength(sentBefore);
        unmount();
        const afterClose = transport.bridge.request({ op: 'status' });
        transport.close();
        await expect(afterClose).rejects.toThrow('BRIDGE_CLOSED');
        expect(listeners.get('message')?.size).toBe(0);
        expect(logs).toEqual([]);
    } finally {
        transport.close(); unmount(); post.mockRestore(); add.mockRestore(); remove.mockRestore(); parent.remove();
        loadAdd.mockRestore(); loadRemove.mockRestore(); documentUri.mockRestore(); readyState.mockRestore();
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
