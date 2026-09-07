import type { EventPage, RunRecord, UiBridge } from '../bridge/types';
import { validateEventPage } from '../security/stream';

export async function readRunStream(bridge: UiBridge, scope: { notebook_id: string; snapshot_id: string }, run_id: string,
    cursor: number, signal: AbortSignal, receive: (page: EventPage) => void): Promise<RunRecord | null> {
    while (!signal.aborted) {
        const raw = await bridge.request({ op: 'conversation.events', ...scope, run_id, cursor });
        if (signal.aborted) return null;
        const page = validateEventPage(raw, cursor);
        receive(page); cursor = page.cursor;
        const terminal = page.items.some(event => event.kind !== 'draft');
        if (terminal || !page.items.length && ['COMPLETE', 'FAILED', 'CANCELLED'].includes(page.state)) {
            const run = await bridge.request({ op: 'conversation.run', ...scope, run_id }) as RunRecord;
            if (signal.aborted) return null;
            if (!['COMPLETE', 'FAILED', 'CANCELLED'].includes(run.state) || run.state === 'COMPLETE' && !run.output) throw new Error('STREAM_INCOMPLETE');
            return run;
        }
        if (page.items.length < 8) await new Promise<void>(resolve => {
            const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
            const timer = setTimeout(finish, 300);
            signal.addEventListener('abort', finish, { once: true });
            if (signal.aborted) finish();
        });
    }
    return null;
}
