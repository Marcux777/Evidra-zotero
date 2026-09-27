// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { Protocol } from '../src/ui/Protocol';
import { Triage } from '../src/ui/Triage';
import { relevanceValid } from '../src/ui/Relevance';
import { parseUiMessage } from '../src/security/messages';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let unmount = () => {};
afterEach(() => { act(unmount); document.body.replaceChildren(); });

const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'd'.repeat(32) };
const protocol: any = { id: 'a'.repeat(32), notebook_id: scope.notebook_id, revision: 1, question: 'Relevant to my agent?', objective: 'Reuse',
    review_type: 'EXPLORATORY', form_version_id: 'b'.repeat(32), author: 'local', created_at: '2026-09-27T00:00:00Z',
    criteria: [{ id: 'atari', text: 'Evaluates on Atari', kind: 'INCLUSION', applicability: 'BOTH' },
        { id: 'robots', text: 'Robot hardware', kind: 'EXCLUSION', applicability: 'BOTH' }],
    project: { description: 'DQN variant', methods: [], data: [], constraints: [], seeking: ['METHOD'] },
    rubric: [{ grade: 0, label: 'Out', definition: 'Unrelated' }, { grade: 3, label: 'Core', definition: 'Comparable' }] };
const evidence = '4'.repeat(64);
const output: any = { kind: 'SCREENING', decision: 'INCLUDE', criterion_ids: ['atari', 'robots'], evidence_ids: [evidence], rationale: 'Atari results',
    verdicts: [{ criterion_id: 'atari', verdict: 'MET', evidence_ids: [evidence] }, { criterion_id: 'robots', verdict: 'NOT_MET', evidence_ids: [evidence] }],
    relevance_grade: 3, reusable: [{ kind: 'METHOD', text: 'Replay buffer', use: 'Baseline for the variant', evidence_ids: [evidence] }], concerns: [],
    card: { summary: 'Human-level Atari agent', contributions: [], strengths: [{ text: 'Strong baseline', evidence_ids: [evidence] }], limitations: [], questions: ['Seeds?'] } };
const row = (id: string, title: string, extra: any = {}) => ({ source_id: id.repeat(64), title, year: 2015, run_id: null, run_state: null, run_reason: null,
    artifact_version_id: null, review_state: null, artifact_available: false, output: null, human: [], conflict: false, ...extra });

function render(element: any) {
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    return { node, mount: () => act(async () => root.render(element)) };
}
const button = (node: HTMLElement, text: string) => [...node.querySelectorAll('button')].find(b => b.textContent === text)!;
async function type(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    await act(async () => {
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')!.set!.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

test('protocol saves the researcher project and an explicit relevance rubric', async () => {
    const writes: any[] = [];
    const bridge: any = { request: async (command: any) => {
        if (command.op === 'research.protocols') return { items: [], offset: 0, limit: 1, total: 0 };
        if (command.op === 'matrix.forms') return { items: [{ id: 'b'.repeat(32), revision: 1, name: 'Form' }], offset: 0, limit: 1, total: 1 };
        if (command.op === 'research.protocol.write') { expect(parseUiMessage(command)).toEqual(command); writes.push(command); return { ...protocol, revision: 1 }; }
        throw new Error(command.op);
    } };
    const { node, mount } = render(<Protocol bridge={bridge} {...scope} locale="en-US" onSelect={() => {}}/>);
    await mount();
    const field = (label: string) => [...node.querySelectorAll('label')].find(l => l.textContent?.startsWith(label))!.querySelector('textarea, input') as HTMLTextAreaElement;
    await type(field('Research question'), 'Which studies can my agent reuse?');
    await type(field('Objective'), 'Reuse components');
    await type(node.querySelector('fieldset fieldset textarea') as HTMLTextAreaElement, 'Evaluates on Atari');
    await type(field('Project description'), 'A sample-efficient DQN variant');
    await type(field('Methods you use'), 'replay buffer\n\ndistributional heads\n');
    await act(async () => ([...node.querySelectorAll('label')].find(l => l.textContent === 'Baseline')!.querySelector('input') as HTMLInputElement).click());
    await act(async () => button(node, 'Use suggested rubric').click());
    await act(async () => button(node, 'Save new protocol version').click());
    expect(writes).toHaveLength(1);
    expect(writes[0].request.project).toEqual({ description: 'A sample-efficient DQN variant', methods: ['replay buffer', 'distributional heads'],
        data: [], constraints: [], seeking: ['BASELINE'] });
    expect(writes[0].request.rubric.map((r: any) => [r.grade, r.label])).toEqual([[0, 'Out of scope'], [1, 'Context'], [2, 'Useful component'], [3, 'Core']]);
});

test('triage prepares and starts one batch, shows relevance and adopts only after human approval', async () => {
    const commands: any[] = [];
    let rows = [row('1', 'Atari study', { run_id: 'e'.repeat(32), run_state: 'COMPLETE', artifact_version_id: 'f'.repeat(32), review_state: 'UNREVIEWED',
        artifact_available: true, output }), row('2', 'Unscreened study')];
    const view = (state: string, revision: number) => ({ batch: { id: 'c'.repeat(32), notebook_id: scope.notebook_id, snapshot_id: scope.snapshot_id, revision,
        protocol_version_id: protocol.id, stage: 'TITLE_ABSTRACT', profile_id: 'local', state, reason: null, estimated_input_tokens: 1200, max_output_tokens: 4096,
        created_at: '2026-09-27T00:00:00Z', items: [{ source_id: '2'.repeat(64), title: 'Unscreened study', run_id: '9'.repeat(32), skipped: null },
            { source_id: '3'.repeat(64), title: 'No abstract', run_id: null, skipped: 'NO_CONTENT' }] }, run_states: state === 'PREPARED' ? { PREPARED: 1 } : { COMPLETE: 1 } });
    const bridge: any = { request: async (command: any) => {
        expect(parseUiMessage(command)).toEqual(command); commands.push(command);
        switch (command.op) {
            case 'research.queue': return { items: rows, offset: 0, limit: 20, total: rows.length };
            case 'research.batch.prepare': return view('PREPARED', 0);
            case 'research.batch.control': return view('COMPLETE', 2);
            case 'research.artifact': return { id: 'f'.repeat(32), revision: 1, review_state: 'UNREVIEWED', output };
            case 'research.review': return { id: '8'.repeat(32), revision: 2, review_state: 'APPROVED', output };
            case 'research.screening.adopt': rows = [{ ...rows[0], human: [{ reviewer: 'Marcus', decision: 'INCLUDE', revision: 1,
                adopted_artifact_version_id: '8'.repeat(32) }] as any, review_state: 'APPROVED', artifact_version_id: '8'.repeat(32) }, rows[1]!];
                return rows[0]!.human[0];
        }
        throw new Error(command.op);
    } };
    const settings = { profile_id: 'local', context_tokens: 32768, max_output_tokens: 4096, ollama_options: null };
    const { node, mount } = render(<Triage bridge={bridge} {...scope} locale="en-US" protocol={protocol} question="Relevant?" settings={settings} onInspect={() => {}}/>);
    await mount();
    expect(node.textContent).toContain('Atari study (2015)');
    expect(node.textContent).toContain('Model proposal: Include · Relevance: 3 · Core');
    expect(node.textContent).toContain('atari: Met · robots: Not met');
    expect(node.textContent).toContain('Replay buffer');
    expect(node.textContent).toContain('Human-level Atari agent');
    expect(node.textContent).toContain('Unscreened study');
    await act(async () => button(node, 'Prepare batch').click());
    const prepared = commands.find(c => c.op === 'research.batch.prepare');
    expect(prepared.request).toMatchObject({ protocol_version_id: protocol.id, stage: 'TITLE_ABSTRACT', selection: 'ALL', source_ids: null, profile_id: 'local' });
    expect(node.textContent).toContain('Prepared runs: 1');
    expect(node.textContent).toContain('No abstract · no indexed text for this stage');
    expect(commands.filter(c => c.op === 'research.batch.control')).toEqual([]);
    await act(async () => button(node, 'Start batch').click());
    expect(commands.find(c => c.op === 'research.batch.control').request).toMatchObject({ action: 'start', expected_revision: 0 });
    // Approval needs a named reviewer; the proposal alone never becomes a decision.
    expect(button(node, 'Approve and record decision').disabled).toBe(true);
    await type([...node.querySelectorAll('label')].find(l => l.textContent?.startsWith('Local reviewer label'))!.querySelector('input')!, 'Marcus');
    await act(async () => button(node, 'Approve and record decision').click());
    const ops = commands.map(c => c.op);
    expect(ops.slice(ops.indexOf('research.artifact'))).toEqual(['research.artifact', 'research.review', 'research.screening.adopt', 'research.queue']);
    const review = commands.find(c => c.op === 'research.review'), adopt = commands.find(c => c.op === 'research.screening.adopt');
    expect(review.request).toMatchObject({ action: 'APPROVED', expected_revision: 1, corrected_output: null });
    expect(adopt.request).toMatchObject({ artifact_version_id: '8'.repeat(32), reviewer: 'Marcus', expected_revision: 0 });
    expect(node.textContent).toContain('Decision recorded.');
    expect(node.textContent).toContain('Marcus: Include');
    expect([...node.querySelectorAll('button')].some(b => b.textContent === 'Approve and record decision')).toBe(false);
});

test('client relevance rules mirror the engine so corrections cannot get stuck', () => {
    expect(relevanceValid(output, protocol, 'FULL_TEXT')).toBe(true);
    expect(relevanceValid({ ...output, card: null }, protocol, 'FULL_TEXT')).toBe(false);
    expect(relevanceValid({ ...output, card: null }, protocol, 'TITLE_ABSTRACT')).toBe(true);
    expect(relevanceValid({ ...output, card: null, decision: 'EXCLUDE' }, protocol, 'TITLE_ABSTRACT')).toBe(false);
    expect(relevanceValid({ ...output, card: null, relevance_grade: null }, protocol, 'TITLE_ABSTRACT')).toBe(false);
    expect(relevanceValid({ ...output, card: null, relevance_grade: null, decision: 'UNCERTAIN' }, protocol, 'TITLE_ABSTRACT')).toBe(true);
    expect(relevanceValid({ ...output, card: null, relevance_grade: 2 }, protocol, 'TITLE_ABSTRACT')).toBe(false);
    expect(relevanceValid({ ...output, card: null, verdicts: output.verdicts.slice(0, 1) }, protocol, 'TITLE_ABSTRACT')).toBe(false);
    expect(relevanceValid({ ...output, card: null, verdicts: [{ ...output.verdicts[0], evidence_ids: [] }, output.verdicts[1]] }, protocol, 'TITLE_ABSTRACT')).toBe(false);
    expect(relevanceValid({ kind: 'SCREENING', decision: 'INCLUDE', criterion_ids: ['atari'], evidence_ids: [evidence], rationale: 'x' } as any,
        { ...protocol, rubric: [] }, 'TITLE_ABSTRACT')).toBe(true);
});
