import { createRoot } from 'react-dom/client';
import { App } from './App';
import type { UiBridge, UiMessage } from '../bridge/types';
const pending = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
}>();
let sequence = 0;
const listener = (event: MessageEvent) => {
    if (event.source !== window.parent || typeof event.data !== 'string' || event.data.length > 1000000)
        return;
    let value: {
        channel?: unknown;
        id?: unknown;
        result?: unknown;
        error?: unknown;
    };
    try {
        value = JSON.parse(event.data) as typeof value;
    }
    catch {
        return;
    }
    if (value.channel !== 'evidra-ui-v1' || typeof value.id !== 'string')
        return;
    const request = pending.get(value.id);
    if (!request)
        return;
    pending.delete(value.id);
    clearTimeout(request.timer);
    if (typeof value.error === 'string')
        request.reject(new Error(value.error));
    else
        request.resolve(value.result);
};
window.addEventListener('message', listener);
const bridge: UiBridge = { request: (request: UiMessage) => new Promise((resolve, reject) => { const id = `ui-${++sequence}`; const timer = setTimeout(() => { pending.delete(id); reject(new Error('BRIDGE_TIMEOUT')); }, 60000); pending.set(id, { resolve, reject, timer }); window.parent.postMessage(JSON.stringify({ channel: 'evidra-ui-v1', id, request }), '*'); }) };
window.addEventListener('unload', () => { window.removeEventListener('message', listener); for (const request of pending.values()) {
    clearTimeout(request.timer);
    request.reject(new Error('BRIDGE_CLOSED'));
} pending.clear(); });
createRoot(document.getElementById('root')!).render(<App bridge={bridge} compact={new URLSearchParams(location.search).get('surface') === 'reader'}/>);
