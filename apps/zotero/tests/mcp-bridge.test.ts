import { webcrypto } from 'node:crypto';
import { expect, test } from 'vitest';
import { McpCredentials, mcpCommand } from '../src/bridge/mcp';
import { parseUiMessage } from '../src/security/messages';

test('MCP generated commands prohibit secrets and privileges while native retries retain a distinct scoped token', async () => {
    const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
    const create = { op: 'mcp.create', ...scope, request: { label: 'External', allow_proposals: false, expires_in_seconds: 900, idempotency_key: 'c'.repeat(64) } } as const;
    expect(parseUiMessage(create)).toEqual(create);
    const credentials = new McpCredentials(webcrypto as Crypto);
    const token = credentials.forCommand(create);
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(credentials.forCommand(create)).toBe(token);
    expect(credentials.forCommand({ ...create, snapshot_id: 'b'.repeat(32) })).not.toBe(token);
    expect(JSON.stringify(credentials)).not.toContain(token);
    const paths: any[] = [];
    await mcpCommand(create, async (...args) => { paths.push(args); });
    await mcpCommand({ op: 'mcp.revoke', ...scope, connection_id: 'd'.repeat(32), request: { idempotency_key: 'revoke' } }, async (...args) => { paths.push(args); });
    expect(paths[0]).toEqual(['POST', '/mcp/connections', create.request]);
    expect(paths[1][1]).toBe(`/mcp/connections/${'d'.repeat(32)}/revoke`);
    for (const invalid of [
        { ...create, request: { ...create.request, token } },
        { ...create, request: { ...create.request, expires_in_seconds: 86401 } },
        { ...create, request: { ...create.request, capabilities: ['manage'] } },
        { ...create, op: 'mcp.apply_note' },
        { ...create, op: 'mcp.run_javascript' },
        { ...create, connection_file: 'C:\\private' },
    ]) expect(() => parseUiMessage(invalid)).toThrow('INVALID_UI_MESSAGE');
    credentials.clear(); expect(credentials.forCommand(create)).not.toBe(token);
});
