import type { UiMessage } from '../bridge/types';
import validateSelection from '../../../../packages/contracts/generated/validate-selection';
import validateDocument from '../../../../packages/contracts/generated/validate-document-command';
import validateConversation from '../../../../packages/contracts/generated/validate-conversation-command';
import validateProvider from '../../../../packages/contracts/generated/validate-provider-command';
import validateMatrix from '../../../../packages/contracts/generated/validate-matrix-command';
import validateJob from '../../../../packages/contracts/generated/validate-job-command';
import validateResearch from '../../../../packages/contracts/generated/validate-research-command';
import validateMcp from '../../../../packages/contracts/generated/validate-mcp-command';

export function serializeUiResponse(id: string, result: unknown, error: string | null): string {
    const message = JSON.stringify({ channel: 'evidra-ui-v1', id, result, error });
    if (message.length > 1000000) throw new Error('UI_RESPONSE_TOO_LARGE');
    return message;
}
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
export function parseUiMessage(value: unknown): UiMessage {
    if (!plain(value) || typeof value.op !== 'string')
        throw new Error('INVALID_UI_MESSAGE');
    if (value.op.startsWith('mcp.')) {
        if (!validateMcp(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('research.')) {
        if (!validateResearch(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('jobs.')) {
        if (!validateJob(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('matrix.')) {
        if (!validateMatrix(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('conversation.')) {
        if (!validateConversation(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('provider.')) {
        if (!validateProvider(value)) throw new Error('INVALID_UI_MESSAGE');
        return value;
    }
    if (value.op.startsWith('documents.')) {
        if (!validateDocument(value)) throw new Error('INVALID_UI_MESSAGE');
        if (value.op === 'documents.preview' && value.request.region) {
            const [left, bottom, right, top] = value.request.region;
            if (left >= right || bottom >= top) throw new Error('INVALID_UI_MESSAGE');
        }
        return value;
    }
    const fields: Record<string, string[]> = { status: [], 'engine.choose': [], 'engine.verify': [], 'workspace.close': [], 'workspace.open': [], 'engine.start': ['fingerprint', 'consent'], 'notebook.list': ['offset'], 'notebook.create': ['name', 'idempotency_key'], 'notebook.select': ['id'], preferences: ['locale', 'theme', 'mode'],
        'sources.state': [], 'sources.history': ['notebook_id', 'offset'], 'sources.read': ['notebook_id', 'snapshot_id', 'offset'],
        'sources.preview': ['notebook_id', 'selection', 'capture'], 'sources.create': ['notebook_id', 'request'],
        'sources.revoke': ['notebook_id', 'source_id', 'expected_revision'],
        'sources.preview.page': ['notebook_id', 'preview_id', 'offset'] };
    const keys = fields[value.op];
    if (!keys || Object.keys(value).length !== keys.length + 1 || keys.some(k => !Object.hasOwn(value, k)))
        throw new Error('INVALID_UI_MESSAGE');
    const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
    const integer = (v: unknown, min: number) => Number.isSafeInteger(v) && (v as number) >= min;
    if (value.op.startsWith('sources.') && value.op !== 'sources.state'
        && (typeof value.notebook_id !== 'string' || !/^[a-f0-9-]{36}$/.test(value.notebook_id))) throw new Error('INVALID_UI_MESSAGE');
    switch (value.op) {
        case 'sources.preview.page':
            if (typeof value.preview_id !== 'string' || !/^[a-f0-9]{32}$/.test(value.preview_id) || !integer(value.offset, 0)) throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'sources.preview':
            if (typeof value.capture !== 'boolean' || !validateSelection(value.selection) || (value.selection.selectors?.length ?? 0) !== 0)
                throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'sources.read':
            if (typeof value.snapshot_id !== 'string' || !/^(?:[a-f0-9]{32}|[a-f0-9-]{36})$/.test(value.snapshot_id)) throw new Error('INVALID_UI_MESSAGE');
            if (!integer(value.offset, 0)) throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'sources.history':
            if (!integer(value.offset, 0)) throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'sources.create':
            if (!plain(value.request) || Object.keys(value.request).sort().join(',') !== 'expected_revision,idempotency_key,preview_id'
                || typeof value.request.preview_id !== 'string' || !/^[a-f0-9]{32}$/.test(value.request.preview_id)
                || !text(value.request.idempotency_key, 200) || !integer(value.request.expected_revision, 1)) throw new Error('INVALID_UI_MESSAGE');
            break;
        case 'sources.revoke':
            if (typeof value.source_id !== 'string' || !/^[a-f0-9]{64}$/.test(value.source_id) || !integer(value.expected_revision, 1)) throw new Error('INVALID_UI_MESSAGE');
            break;
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
