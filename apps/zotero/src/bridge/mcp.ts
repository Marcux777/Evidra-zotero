import type { McpCommand } from './types';

export function mcpCommand(message: McpCommand,
    request: (method: 'GET' | 'POST', path: string, body?: unknown) => Promise<unknown>) {
    switch (message.op) {
        case 'mcp.connections': return request('GET', `/mcp/connections?offset=${message.offset}&limit=20`);
        case 'mcp.notes': return request('GET', `/mcp/notes?offset=${message.offset}&limit=1`);
        case 'mcp.create': return request('POST', '/mcp/connections', message.request);
        case 'mcp.revoke': return request('POST', `/mcp/connections/${message.connection_id}/revoke`, message.request);
        case 'mcp.review': return request('POST', `/mcp/notes/${message.version_id}/review`, message.request);
    }
}

/** Per-window retry commands share this privileged token owner; renderer never receives a token. */
export class McpCredentials {
    #tokens = new Map<string, string>();
    constructor(private crypto: Crypto) {}
    forCommand(message: Extract<McpCommand, { op: 'mcp.create' }>) {
        const key = `${message.notebook_id}:${message.snapshot_id}:${message.request.idempotency_key}`;
        let token = this.#tokens.get(key);
        if (!token) {
            token = Array.from(this.crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
            this.#tokens.set(key, token);
        }
        return token;
    }
    clear() { this.#tokens.clear(); }
}
