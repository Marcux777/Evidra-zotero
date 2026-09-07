import type { ConversationCommand, ProviderCommand } from './types';
import type { EngineController } from '../bootstrap/engine';

export async function conversationCommand(message: ConversationCommand,
    request: (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>): Promise<unknown> {
    switch (message.op) {
        case 'conversation.list': return request('GET', `/conversations?offset=${message.offset}&limit=50`);
        case 'conversation.create': return request('POST', '/conversations', message.request);
        case 'conversation.read': return request('GET', `/conversations/${message.conversation_id}`);
        case 'conversation.history': return request('GET', `/conversations/${message.conversation_id}/runs?offset=${message.offset}&limit=50`);
        case 'conversation.prepare': return request('POST', `/conversations/${message.conversation_id}/runs`, message.request);
        case 'conversation.run': return request('GET', `/runs/${message.run_id}`);
        case 'conversation.start': return request('POST', `/runs/${message.run_id}/start`);
        case 'conversation.cancel': return request('POST', `/runs/${message.run_id}/cancel`);
        case 'conversation.events': return request('GET', `/runs/${message.run_id}/events?cursor=${message.cursor}`);
        case 'conversation.vectors.build': return request('POST', '/vectors', message.request);
        case 'conversation.vectors.read': return request('GET', `/vectors/${message.job_id}`);
        case 'conversation.vectors.cancel': return request('POST', `/vectors/${message.job_id}/cancel`);
    }
}

export async function providerCommand(message: ProviderCommand, engine: EngineController): Promise<unknown> {
    switch (message.op) {
        case 'provider.list': return engine.request('GET', `/v1/providers/profiles?offset=${message.offset}&limit=50`);
        case 'provider.write': return engine.request('PUT', `/v1/providers/profiles/${message.profile_id}`, message.request);
        case 'provider.resume': return engine.request('POST', `/v1/providers/profiles/${message.profile_id}/resume`, message.request);
        case 'provider.models': return engine.request('GET', `/v1/providers/profiles/${message.profile_id}/models?offset=${message.offset}&limit=50`);
        case 'provider.settings': return engine.request('GET', '/v1/providers/settings');
        case 'provider.settings.write': return engine.request('PUT', '/v1/providers/settings', message.request);
        case 'provider.secret': return engine.request('GET', `/v1/providers/profiles/${message.profile_id}/secret`);
        case 'provider.secret.write': return engine.request('PUT', `/v1/providers/profiles/${message.profile_id}/secret`, message.request);
        case 'provider.secret.delete': return engine.request('DELETE', `/v1/providers/profiles/${message.profile_id}/secret`, message.request);
        case 'provider.consent': return engine.request('GET', `/v1/notebooks/${message.notebook_id}/providers/${message.profile_id}/consent`);
        case 'provider.consent.write': return engine.request('PUT', `/v1/notebooks/${message.notebook_id}/providers/${message.profile_id}/consent`, message.request);
        case 'provider.price': return engine.request('POST', '/v1/providers/prices', message.request);
        case 'provider.budget': return engine.request('PUT', `/v1/notebooks/${message.notebook_id}/snapshots/${message.snapshot_id}/provider-budgets`, message.request);
        case 'provider.budget.read': return engine.request('GET', `/v1/notebooks/${message.notebook_id}/snapshots/${message.snapshot_id}/provider-budgets/${message.kind}/${message.identity}`);
        case 'provider.calls': return engine.request('GET', `/v1/notebooks/${message.notebook_id}/snapshots/${message.snapshot_id}/provider-calls?offset=${message.offset}&limit=50`);
    }
}
