// @vitest-environment node
import { expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
import { readEventBatch } from '../src/security/stream';

test('conversation command boundary allows only scoped typed commands and no image/source invention', () => {
    const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
    const command = { op: 'conversation.events', ...scope, run_id: 'b'.repeat(32), cursor: 4 };
    expect(parseUiMessage(command)).toEqual(command);
    for (const invalid of [{ ...command, url: 'https://example.org' }, { ...command, cursor: -1 },
        { ...command, run_id: '../secret' }, { ...command, image: 'arbitrary-bytes' }]) {
        expect(() => parseUiMessage(invalid)).toThrow('INVALID_UI_MESSAGE');
    }
});

test('bounded native SSE decodes split UTF-8 and fails closed on malformed cursor/EOF', async () => {
    const batch = { items: [{ cursor: 1, kind: 'draft', text: 'citação', code: null }], cursor: 1, state: 'RUNNING' };
    const data = new TextEncoder().encode(`id: 1\nevent: batch\ndata: ${JSON.stringify(batch)}\n\n`);
    const response = new Response(new ReadableStream({ start(controller) {
        for (const byte of data) controller.enqueue(new Uint8Array([byte])); controller.close();
    } }), { headers: { 'Content-Type': 'text/event-stream' } });
    expect(await readEventBatch(response, 0)).toEqual(batch);
    for (const text of [`id: 1\nevent: batch\ndata: ${JSON.stringify(batch)}`, `id: 2\nevent: batch\ndata: ${JSON.stringify(batch)}\n\n`]) {
        await expect(readEventBatch(new Response(text, { headers: { 'Content-Type': 'text/event-stream' } }), 0)).rejects.toThrow(/STREAM_/);
    }
    await expect(readEventBatch(new Response('x'.repeat(131073), { headers: { 'Content-Type': 'text/event-stream' } }), 0)).rejects.toThrow('STREAM_BATCH_TOO_LARGE');
});
