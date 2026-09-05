import type { UiMessage } from '../bridge/types';
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
export function parseUiMessage(value: unknown): UiMessage {
    if (!plain(value) || typeof value.op !== 'string')
        throw new Error('INVALID_UI_MESSAGE');
    const fields: Record<string, string[]> = { status: [], 'engine.choose': [], 'engine.verify': [], 'workspace.close': [], 'workspace.open': [], 'engine.start': ['fingerprint', 'consent'], 'notebook.list': ['offset'], 'notebook.create': ['name', 'idempotency_key'], 'notebook.select': ['id'], preferences: ['locale', 'theme', 'mode'] };
    const keys = fields[value.op];
    if (!keys || Object.keys(value).length !== keys.length + 1 || keys.some(k => !Object.hasOwn(value, k)))
        throw new Error('INVALID_UI_MESSAGE');
    const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
    switch (value.op) {
        case 'engine.start':
            if (value.consent !== true || typeof value.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(value.fingerprint))
                throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'notebook.create':
            if (!text(value.name, 200) || !text(value.idempotency_key, 200))
                throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'notebook.list':
            if (!Number.isSafeInteger(value.offset) || (value.offset as number) < 0)
                throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'notebook.select':
            if (typeof value.id !== 'string' || !/^[a-f0-9-]{36}$/.test(value.id))
                throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'preferences': if (!['pt-BR', 'en-US'].includes(String(value.locale)) || !['system', 'light', 'dark'].includes(String(value.theme)) || !['LOCAL', 'API'].includes(String(value.mode)))
            throw new Error('INVALID_UI_MESSAGE');
    }
    return value as UiMessage;
}
export function isUiEvent(event: {
    source: unknown;
    origin: string;
}, source: unknown): boolean { return source !== null && event.source === source && event.origin === 'null'; }
