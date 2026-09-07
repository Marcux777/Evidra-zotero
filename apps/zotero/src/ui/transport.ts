import type { UiBridge, UiMessage } from '../bridge/types';
import { MAX_UI_REQUEST_BYTES } from '../security/limits';

export function createUiTransport(target: Window): { bridge: UiBridge; close: () => void } {
    const pending = new Map<string, {
        resolve: (value: unknown) => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
        message: string;
    }>();
    let sequence = 0, ready = false, closed = false;
    const send = (id: string) => {
        const request = pending.get(id);
        if (!request) return;
        try { target.postMessage(request.message, '*'); }
        catch (error) { pending.delete(id); clearTimeout(request.timer); request.reject(new Error('BRIDGE_SEND_FAILED', { cause: error })); }
    };
    const listener = (event: MessageEvent) => {
        // Gecko deliberately hides the source of chrome messages. These identities
        // were measured in Zotero 10.0.1 with the opaque allow-scripts iframe.
        if (closed || !event.isTrusted || event.source !== null || event.origin !== '' || typeof event.data !== 'string' || event.data.length > 1000000) return;
        let value: Record<string, unknown>;
        try { value = JSON.parse(event.data) as Record<string, unknown>; }
        catch { return; }
        if (!value || typeof value !== 'object' || Array.isArray(value) || value.channel !== 'evidra-ui-v1') return;
        const keys = Object.keys(value).sort().join(',');
        if (keys === 'channel,ready' && value.ready === true) {
            if (!ready) { ready = true; for (const id of pending.keys()) send(id); }
            return;
        }
        if (!ready || keys !== 'channel,error,id,result' || typeof value.id !== 'string' || !(value.error === null || (typeof value.error === 'string' && /^[A-Z_]{1,80}$/.test(value.error)))) return;
        const request = pending.get(value.id);
        if (!request) return;
        pending.delete(value.id); clearTimeout(request.timer);
        if (typeof value.error === 'string') request.reject(new Error(value.error));
        else request.resolve(value.result);
    };
    target.addEventListener('message', listener);
    const bridge: UiBridge = { request: (request: UiMessage) => new Promise((resolve, reject) => {
        if (closed) { reject(new Error('BRIDGE_CLOSED')); return; }
        const id = `ui-${++sequence}`;
        const message = JSON.stringify({ channel: 'evidra-ui-v1', id, request });
        if (new TextEncoder().encode(message).byteLength > MAX_UI_REQUEST_BYTES) { reject(new Error('BODY_TOO_LARGE')); return; }
        const timer = setTimeout(() => { pending.delete(id); reject(new Error('BRIDGE_TIMEOUT')); }, 60000);
        pending.set(id, { resolve, reject, timer, message });
        if (ready) send(id);
    }) };
    const close = () => {
        if (closed) return;
        closed = true; target.removeEventListener('message', listener); target.removeEventListener('unload', close);
        for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error('BRIDGE_CLOSED')); }
        pending.clear();
    };
    target.addEventListener('unload', close);
    return { bridge, close };
}
