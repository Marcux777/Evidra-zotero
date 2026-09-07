import type { ResearchCommand } from './types';

export function researchCommand(message: Exclude<ResearchCommand, { op: 'research.notes.publish' }>,
    request: (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>) {
    switch (message.op) {
        case 'research.protocols': return request('GET', `/protocols?offset=${message.offset}&limit=1`);
        case 'research.protocol.read': return request('GET', `/protocols/${message.protocol_id}`);
        case 'research.protocol.write': return request('POST', '/protocols', message.request);
        case 'research.screening': return request('GET', `/screening/${message.protocol_id}?offset=${message.offset}&limit=20`);
        case 'research.screening.decide': return request('POST', '/screening/decisions', message.request);
        case 'research.runs': return request('GET', `/research/runs?offset=${message.offset}&limit=20`);
        case 'research.prepare': return request('POST', '/research/runs', message.request);
        case 'research.run': return request('GET', `/research/runs/${message.run_id}`);
        case 'research.preview': return request('GET', `/research/runs/${message.run_id}/preview`);
        case 'research.control': return request('POST', `/research/runs/${message.run_id}/control`, message.request);
        case 'research.artifact': return request('GET', `/artifacts/${message.version_id}`);
        case 'research.versions': return request('GET', `/artifacts/${message.version_id}/versions?offset=${message.offset}&limit=1`);
        case 'research.review': return request('POST', `/artifacts/${message.version_id}/review`, message.request);
        case 'research.notes.preview': return request('POST', '/notes/previews', message.request);
        case 'research.notes.approve': return request('POST', '/notes/approve', message.request);
        case 'research.notes.read': return request('GET', `/notes/outbox/${message.intent_id}`);
        case 'research.notes.list': return request('GET', `/notes/outbox?offset=${message.offset}&limit=1`);
    }
}
