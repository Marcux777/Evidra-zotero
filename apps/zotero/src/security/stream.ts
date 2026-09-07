import type { EventPage } from '../bridge/types';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
/** Cursor and terminal status are independently checked; a closed transport is never completion. */
export function validateEventPage(value: unknown, cursor: number): EventPage {
    if (!object(value) || Object.keys(value).sort().join(',') !== 'cursor,items,state'
        || !Array.isArray(value.items) || value.items.length > 8 || !Number.isSafeInteger(value.cursor)
        || !['PREPARED', 'RUNNING', 'COMPLETE', 'FAILED', 'CANCELLED'].includes(String(value.state))) throw new Error('INVALID_STREAM');
    let next = cursor;
    for (const event of value.items) {
        if (!object(event) || Object.keys(event).sort().join(',') !== 'code,cursor,kind,text'
            || event.cursor !== next + 1 || !['draft', 'complete', 'failed', 'cancelled'].includes(String(event.kind))
            || !(event.text === null || typeof event.text === 'string' && event.text.length <= 4000)
            || !(event.code === null || typeof event.code === 'string' && /^[A-Z_]{1,80}$/.test(event.code))) throw new Error('INVALID_STREAM');
        if (event.kind === 'draft' ? typeof event.text !== 'string' || event.code !== null : event.text !== null) throw new Error('INVALID_STREAM');
        next++;
    }
    if (value.cursor !== next) throw new Error('STREAM_CURSOR_GAP');
    return value as unknown as EventPage;
}

export async function readEventBatch(response: Response, cursor: number): Promise<EventPage> {
    if (!response.headers.get('Content-Type')?.startsWith('text/event-stream') || !response.body) throw new Error('INVALID_STREAM');
    const reader = response.body.getReader(), decoder = new TextDecoder('utf-8', { fatal: true });
    let text = '', bytes = 0;
    try {
        for (;;) {
            const next = await reader.read();
            if (next.done) break;
            bytes += next.value.byteLength;
            if (bytes > 131072) throw new Error('STREAM_BATCH_TOO_LARGE');
            text += decoder.decode(next.value, { stream: true });
        }
        text += decoder.decode();
        const match = /^id: (0|[1-9][0-9]*)\nevent: batch\ndata: ([^\n]+)\n\n$/.exec(text);
        if (!match) throw new Error('STREAM_INCOMPLETE');
        const value = validateEventPage(JSON.parse(match[2]!), cursor);
        if (Number(match[1]) !== value.cursor) throw new Error('STREAM_CURSOR_GAP');
        return value;
    } catch (error) {
        try { await reader.cancel(); }
        catch (cleanup) { throw new Error('STREAM_CLEANUP_FAILED', { cause: new AggregateError([error, cleanup]) }); }
        throw error;
    } finally { reader.releaseLock(); }
}
