// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let unmount = () => {};
afterEach(() => { act(unmount); document.body.replaceChildren(); });

test('MCP panel keeps uncertain connection creation stable and shows external evidence before human review', async () => {
    const { Mcp } = await import('../src/ui/Mcp');
    const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
    const record = { id: 'b'.repeat(32), label: 'Client', ...scope, allow_proposals: false, state: 'ACTIVE', created_at: '2026-09-01T00:00:00Z', expires_at: '2026-09-01T01:00:00Z', last_used_at: null, revoked_at: null };
    const note: any = { id: 'c'.repeat(32), artifact_id: 'd'.repeat(32), revision: 1, origin: 'EXTERNAL_CLIENT', connection_id: record.id, declared_model: 'Client model claim', text: '<script>untrusted draft</script>', review_state: 'UNREVIEWED', author: 'mcp:test', created_at: record.created_at,
        evidence: [{ id: 'e'.repeat(64), source_id: 'f'.repeat(64), source_identity: { profile_instance_id: 'fixture', library_id: 1, item_key: 'STUDY001' }, content_key: 'STUDY001', source_kind: 'abstract', excerpt: 'Exact original quotation', document_version_id: '1'.repeat(64), start: 0, end: 24, page_index: null, historical: false }] };
    const requests: any[] = []; let fail = true, notesFailure = '', connectionsFailure = '';
    let heldNotes: Promise<void> | null = null;
    const bridge: any = { request: async (command: any) => {
        parseUiMessage(command); requests.push(command);
        if (command.op === 'mcp.connections') {
            if (connectionsFailure) throw new Error(connectionsFailure);
            return { items: [record], offset: command.offset, limit: 20, total: 1 };
        }
        if (command.op === 'mcp.notes') {
            if (notesFailure) throw new Error(notesFailure);
            if (heldNotes) await heldNotes;
            return { items: [note], offset: 0, limit: 1, total: 1 };
        }
        if (command.op === 'mcp.create') {
            if (fail) { fail = false; throw new Error('ENGINE_HTTP_ERROR'); }
            return { connection: record, connection_file: 'C:\\Private\\connection.json', executable: 'C:\\Evidra\\evidra-engine.exe' };
        }
        if (command.op === 'mcp.review') return { ...note, revision: 2, review_state: 'APPROVED' };
        if (command.op === 'mcp.revoke') return { ...record, state: 'REVOKED' };
        throw new Error('Unexpected command');
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<Mcp bridge={bridge} {...scope} locale="en-US"/>));
    const button = (text: string) => [...node.querySelectorAll('button')].find(b => b.textContent === text)!;
    await act(async () => button('External clients').click());
    expect(node.textContent).toContain('Exact original quotation');
    expect(node.textContent).toContain('Client model claim');
    expect(node.textContent).toContain('Client-declared model; unverified');
    expect(node.querySelector('script')).toBeNull();
    await act(async () => {
        const input = node.querySelector('input[name=mcp_label]')!;
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Client');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Create connection').click());
    expect(button('Create connection').disabled).toBe(true);
    await act(async () => button('Retry the same operation').click());
    const creates = requests.filter(r => r.op === 'mcp.create');
    expect(creates).toHaveLength(2); expect(creates[0]).toEqual(creates[1]);
    expect(JSON.stringify(creates[0])).not.toContain('token');
    expect(node.textContent).toContain('codex mcp add evidra --');
    expect(node.textContent).toContain('claude mcp add --transport stdio --scope local');
    await act(async () => {
        const reason = node.querySelector('textarea[name=mcp_review_reason]')!;
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(reason, 'Checked the original evidence');
        reason.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Approve proposal').click());
    expect(requests.find(r => r.op === 'mcp.review').request).toMatchObject({ expected_revision: 1, action: 'APPROVED' });
    expect(note.review_state).toBe('UNREVIEWED');
    for (const cause of ['SOURCE_REVOKED', 'NOT_FOUND']) {
        notesFailure = '';
        await act(async () => button('Refresh clients and proposals').click());
        expect(node.textContent).toContain('Exact original quotation');
        notesFailure = cause;
        await act(async () => button('Refresh clients and proposals').click());
        expect(node.textContent).toContain(cause);
        expect(node.textContent).not.toContain('Exact original quotation');
        expect(node.textContent).not.toContain('Client model claim');
        expect(button('Revoke connection'), 'Content denial must retain the independent revoke control').toBeDefined();
        expect(button('Revoke connection').disabled).toBe(false);
        if (cause === 'SOURCE_REVOKED') expect(node.textContent).toContain('codex mcp add evidra --');
        await act(async () => button('Revoke connection').click());
        expect(requests.at(-1)).toMatchObject({ op: 'mcp.revoke', ...scope, connection_id: record.id });
        expect(node.textContent).toContain('Revoked');
    }
    // Session/auth failures invalidate lifecycle state even if the preceding metadata read succeeded.
    for (const origin of ['connections', 'notes']) {
        notesFailure = ''; connectionsFailure = '';
        await act(async () => button('Refresh clients and proposals').click());
        expect(node.textContent).toContain('Exact original quotation');
        expect(button('Revoke connection').disabled).toBe(false);
        if (origin === 'connections') connectionsFailure = 'BRIDGE_EXPIRED';
        else notesFailure = 'UNAUTHENTICATED';
        await act(async () => button('Refresh clients and proposals').click());
        expect(node.textContent).toContain(origin === 'connections' ? 'BRIDGE_EXPIRED' : 'UNAUTHENTICATED');
        expect(button('Revoke connection')).toBeUndefined();
        expect(node.textContent).not.toContain('Exact original quotation');
    }
    notesFailure = ''; connectionsFailure = '';
    let releaseNotes!: () => void;
    heldNotes = new Promise<void>(resolve => { releaseNotes = resolve; });
    await act(async () => button('Refresh clients and proposals').click());
    expect(button('Revoke connection').disabled).toBe(false);
    connectionsFailure = 'BRIDGE_EXPIRED';
    await act(async () => button('Refresh clients and proposals').click());
    expect(button('Revoke connection')).toBeUndefined();
    await act(async () => releaseNotes());
    expect(node.textContent).not.toContain('Exact original quotation');
});
