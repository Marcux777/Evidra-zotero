// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { Protocol } from '../src/ui/Protocol';
import { Screening } from '../src/ui/Screening';
import { Research } from '../src/ui/Research';
import { NotePreview } from '../src/ui/NotePreview';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let unmount = () => {};
afterEach(() => { act(unmount); document.body.replaceChildren(); });
test('protocol explicit save preserves uncertain command and shows immutable revision after identical retry', async () => {
    const requests: any[] = []; let lost = true;
    const protocol = { id: 'a'.repeat(32), revision: 1, question: 'Question', objective: 'Objective', review_type: 'EXPLORATORY',
        form_version_id: 'b'.repeat(32), criteria: [{ id: 'c1', text: 'Criterion', kind: 'INCLUSION', applicability: 'BOTH' }] };
    const bridge: any = { request: async (command: any) => {
        requests.push(command);
        if (command.op === 'research.protocols') return { items: [protocol], offset: 0, limit: 1, total: 1 };
        if (command.op === 'matrix.forms') return { items: [{ id: 'b'.repeat(32), revision: 1, name: 'Form' }], offset: 0, limit: 1, total: 1 };
        if (command.op === 'research.protocol.write') { if (lost) { lost = false; throw new Error('BRIDGE_TIMEOUT'); } return { ...protocol, revision: 2 }; }
        throw new Error(command.op);
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<Protocol bridge={bridge} notebook_id="n" snapshot_id="s" locale="en-US" onSelect={() => {}}/>));
    const button = (text: string) => [...node.querySelectorAll('button')].find(b => b.textContent === text)!;
    await act(async () => button('Save new protocol version').click());
    expect(node.textContent).toContain('The outcome is uncertain');
    const first = requests.find(r => r.op === 'research.protocol.write');
    expect(first.request.idempotency_key).toMatch(/^[a-f0-9]{64}$/);
    await act(async () => button('Retry the same operation').click());
    expect(requests.filter(r => r.op === 'research.protocol.write')).toEqual([first, first]);
    expect(node.textContent).toContain('Version 2');
});

test('first human decisions show conflicts and refresh the selected reviewer revision after an external change', async () => {
    const writes: any[] = [];
    let rows: any[] = [];
    const protocol: any = { id: 'a'.repeat(32), criteria: [{ id: 'c1', text: 'Criterion', kind: 'INCLUSION', applicability: 'BOTH' }] };
    const source: any = { id: 'c'.repeat(64), title: 'Study' };
    const bridge: any = { request: async (command: any) => {
        if (command.op === 'research.screening') return { items: rows, offset: 0, limit: 20, total: rows.length, snapshot_members: 1, observed_decision_events: writes.length };
        writes.push(command);
        const decision = { ...command.request, id: 'decision' + writes.length, revision: command.request.expected_revision + 1 };
        const decisions = [...(rows[0]?.decisions ?? []).filter((d: any) => d.reviewer !== decision.reviewer), decision];
        rows = [{ source_id: source.id, stage: 'TITLE_ABSTRACT', decisions, conflict: new Set(decisions.map(d => d.decision)).size > 1 }];
        return decision;
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<Screening bridge={bridge} notebook_id="n" snapshot_id="s" locale="en-US" protocol={protocol} source={source}/>));
    function input(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
        Object.getOwnPropertyDescriptor(element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')!.set!.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await act(async () => {
        input(node.querySelector('input:not([type=checkbox])')!, 'Reviewer A');
        input(node.querySelector('textarea')!, 'Relevant population');
        (node.querySelector('input[type=checkbox]') as HTMLInputElement).click();
    });
    const save = [...node.querySelectorAll('button')].find(b => b.textContent === 'Save human decision')!;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    expect(writes).toHaveLength(1);
    expect(writes[0].request).toMatchObject({ expected_revision: 0, source_id: source.id, reviewer: 'Reviewer A', decision: 'UNCERTAIN' });
    expect(node.textContent).toContain('Reviewer A: Uncertain');
    await act(async () => {
        input(node.querySelector('input:not([type=checkbox])')!, 'Reviewer B');
        const choices = [...node.querySelectorAll('select')]; choices[1]!.value = 'EXCLUDE'; choices[1]!.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await act(async () => save.click());
    expect(node.textContent).toContain('Conflicting local decisions');
    rows[0].decisions[1].revision = 2;
    await act(async () => [...node.querySelectorAll('button')].find(b => b.textContent === 'Refresh')!.click());
    await act(async () => save.click());
    expect(writes[2].request.expected_revision).toBe(2);
});

test('cancel remains available during a slow exact-preview read and stale content cannot replace its receipt', async () => {
    let release!: (value: any) => void;
    const waiting = new Promise<any>(resolve => { release = resolve; });
    const run: any = { id: 'd'.repeat(32), kind: 'SCREENING', state: 'RUNNING', revision: 1, created_at: '2026-09-01T12:00:00Z', artifact_version_id: null };
    const protocol: any = { id: 'a'.repeat(32), revision: 1, question: 'Question', objective: 'Objective', review_type: 'EXPLORATORY', form_version_id: 'b'.repeat(32), criteria: [] };
    const writes: any[] = [];
    const bridge: any = { request: async (command: any) => {
        if (command.op === 'provider.list' || command.op === 'sources.read') return { items: [], offset: 0, limit: 50, total: 0 };
        if (command.op === 'matrix.forms') return { items: [], offset: 0, limit: 1, total: 0 };
        if (command.op === 'research.protocols') return { items: [protocol], offset: 0, limit: 1, total: 1 };
        if (command.op === 'research.runs') return { items: [run], offset: 0, limit: 20, total: 1 };
        if (command.op === 'research.run') return run;
        if (command.op === 'research.preview') return waiting;
        if (command.op === 'research.control') { writes.push(command); return { ...run, revision: 2, state: 'CANCELLED' }; }
        throw new Error(command.op);
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<Research bridge={bridge} notebook_id="n" snapshot_id="s" locale="en-US" profilesEpoch={0}/>));
    await act(async () => node.querySelector('button')!.click());
    await act(async () => [...node.querySelectorAll('button')].find(b => b.textContent?.startsWith('Screening proposal · Running'))!.click());
    const cancel = [...node.querySelectorAll('button')].find(b => b.textContent === 'Cancel run')!;
    expect(cancel.disabled).toBe(false);
    await act(async () => cancel.click());
    expect(writes[0].request).toMatchObject({ action: 'cancel', expected_revision: 1 });
    expect(node.textContent).toContain('Cancelled');
    await act(async () => release({ prompt: 'Stale source content' }));
    expect(node.textContent).not.toContain('Stale source content');
});

test('note creation requires the concrete sanitized preview and separate approval before publication', async () => {
    const commands: any[] = [];
    const note: any = { id: 'preview', title: 'Note', html: '<div><h1>Concrete preview</h1><script>bad()</script></div>', uuid: 'provenance', artifact_revision: 2,
        destination: { library_id: 1, item_key: 'PARENT01' } };
    const bridge: any = { request: async (command: any) => {
        commands.push(command);
        if (command.op === 'research.notes.preview') return note;
        if (command.op === 'research.notes.approve') return { ...note, id: 'intent', state: 'APPROVED' };
        if (command.op === 'research.notes.publish') return { ...note, id: 'intent', state: 'COMPLETE', note_key: 'NOTE0001' };
        throw new Error(command.op);
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<NotePreview bridge={bridge} notebook_id="n" snapshot_id="s" locale="en-US"
        artifact={{ id: 'artifact', revision: 2 } as any} preview={{ inputs: { studies: [{ source_id: 's1', title: 'Study', identity: note.destination }] } } as any}/>));
    const button = (text: string) => [...node.querySelectorAll('button')].find(b => b.textContent === text);
    expect(button('Create or reconcile approved note')).toBeUndefined();
    await act(async () => { const input = node.querySelector('input')!; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Note'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await act(async () => button('Prepare note preview')!.click());
    expect(node.querySelector('script')).toBeNull(); expect(node.textContent).toContain('Concrete preview');
    expect(button('Create or reconcile approved note')).toBeUndefined();
    await act(async () => button('Approve this note preview')!.click());
    expect(commands[1].request).toMatchObject({ preview_id: 'preview', expected_artifact_revision: 2 });
    await act(async () => button('Create or reconcile approved note')!.click());
    expect(commands.map(c => c.op)).toEqual(['research.notes.preview', 'research.notes.approve', 'research.notes.publish']);
    expect(node.textContent).toContain('NOTE0001');
});
