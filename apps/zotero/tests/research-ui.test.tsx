// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { Protocol } from '../src/ui/Protocol';
import { Screening } from '../src/ui/Screening';
import { Research } from '../src/ui/Research';
import { NotePreview } from '../src/ui/NotePreview';
import { ResearchArtifact } from '../src/ui/ResearchArtifact';
import { parseUiMessage } from '../src/security/messages';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let unmount = () => {};
afterEach(() => { act(unmount); document.body.replaceChildren(); });

function researchFixture() {
    const studies = ['Alpha', 'Beta', 'Unused'].map((title, i) => ({ title, source_id: String(i + 1).repeat(64),
        identity: { profile_instance_id: 'profile', library_id: i + 1, item_key: `STUDY00${i + 1}` } }));
    const evidence = studies.map((study, i) => ({ id: String(i + 4).repeat(64), source_id: study.source_id,
        source_identity: study.identity, excerpt: `${study.title} original quotation`, content_key: `CONTENT${i + 1}`, page_index: i, source_kind: 'PDF' }));
    const cells = studies.map((study, i) => ({ id: `cell-${i}`, basis: i === 1 ? 'UNREVIEWED' : 'REVIEWED', evidence_ids: [evidence[i]!.id],
        cell: { source_id: study.source_id, source_title: study.title, field_key: `result_${i}`, value: `${study.title} cell value`, value_state: 'FOUND',
            form_version_id: 'f'.repeat(32), field_origin_form_version_id: 'f'.repeat(32), proposal_id: String(i + 7).repeat(32), revision: i + 1,
            review_state: i === 1 ? 'UNREVIEWED' : 'CORRECTED' } }));
    const coverage = { complete: false, included_studies: 2, snapshot_members: 3, reviewed_cells: 1, unreviewed_cells: 1, evidence_chunks: 3, candidate_chunks: 3 };
    const artifact: any = { id: 'a'.repeat(32), artifact_id: 'b'.repeat(32), revision: 1, review_state: 'UNREVIEWED', author: 'model',
        created_at: '2026-09-01T12:00:00Z', coverage, output: { kind: 'SYNTHESIS', sections: cells.slice(0, 2).map((cell, i) => ({
            heading: `Result ${i + 1}`, text: `Context ${i + 1}`, cell_ids: [cell.id], evidence_ids: cell.evidence_ids, basis: cell.basis, comparability: 'No aggregate ranking' })), limitations: ['Partial collection'] } };
    const preview: any = { inputs: { studies, evidence, cells, protocol: { criteria: [] } } };
    return { artifact, preview };
}

test('research results expose their own anchors and cells while unused preparation evidence stays separate', async () => {
    const { artifact, preview } = researchFixture(), original = structuredClone(artifact), commands: any[] = [];
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<ResearchArtifact bridge={{ request: async (command: any) => { parseUiMessage(command); commands.push(command); return artifact; } } as any}
        notebook_id="11111111-1111-1111-1111-111111111111" snapshot_id={'d'.repeat(32)} locale="en-US" artifact={artifact} preview={preview} onChange={() => {}}/>));
    const result = (heading: string) => [...node.querySelectorAll('h4')].find(h => h.textContent === heading)!.closest('article')!;
    expect(result('Result 1').textContent).toContain('Alpha original quotation');
    expect(result('Result 1').textContent).toContain('Alpha cell value');
    expect(result('Result 1').textContent).toContain('result_0');
    expect(result('Result 1').textContent).toContain('1/STUDY001');
    expect(result('Result 1').textContent).not.toContain('Beta original quotation');
    expect(result('Result 1').textContent).not.toContain('Unused original quotation');
    expect(result('Result 2').textContent).toContain('Beta original quotation');
    expect(result('Result 2').textContent).toContain('Unreviewed');
    expect(result('Result 2').textContent).not.toContain('Alpha original quotation');
    const unused = [...node.querySelectorAll('details')].find(d => d.querySelector('summary')?.textContent === 'Other preparation excerpts — not linked to these results')!;
    expect(unused.textContent).toContain('Unused original quotation');
    expect(unused.textContent).not.toContain('Alpha original quotation');
    const editor = [...node.querySelectorAll('fieldset')].find(field => field.querySelector(':scope > legend')?.textContent === 'Text 1')!;
    const checkbox = (text: string) => [...editor.querySelectorAll('label')].find(label => label.textContent === text)!.querySelector('input[type=checkbox]') as HTMLInputElement;
    await act(async () => checkbox('Alpha · result_0').click());
    await act(async () => checkbox('Beta · result_1').click());
    await act(async () => checkbox('Beta original quotation').click());
    await act(async () => {
        const reason = [...node.querySelectorAll('fieldset')].find(field => field.querySelector(':scope > legend')?.textContent === 'Human review')!.querySelector(':scope > label textarea')!;
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(reason, 'Select the relevant cell'); reason.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => [...node.querySelectorAll('button')].find(button => button.textContent === 'Save correction')!.click());
    expect(commands).toHaveLength(1);
    expect(commands[0].request.corrected_output.sections[0]).toMatchObject({ cell_ids: ['cell-1'], evidence_ids: [preview.inputs.evidence[1].id], basis: 'UNREVIEWED' });
    expect(artifact).toEqual(original);
});

test('human audit corrections select prepared anchors and compatible sources without changing the proposal', async () => {
    const { artifact, preview } = researchFixture();
    artifact.output = { kind: 'AUDIT', claims: [
        { text: 'The reported result', start: 0, end: 19, support: 'INSUFFICIENT_EVIDENCE', evidence_ids: [], explanation: 'Anchor was missed',
            references: [{ citation: 'Study reference', source_id: null, relationship: 'INDIRECT_MENTION' }] },
        { text: 'is 42 percent.', start: 20, end: 34, support: 'SUPPORTED_PROPOSAL', evidence_ids: [preview.inputs.evidence[1].id], explanation: 'Check citation',
            references: [{ citation: 'Erroneous reference', source_id: preview.inputs.studies[1].source_id, relationship: 'DIRECT' }] }
    ], collection_limitations: 'Collection only' };
    const original = structuredClone(artifact), commands: any[] = []; let corrected: any;
    const bridge: any = { request: async (command: any) => {
        expect(parseUiMessage(command)).toEqual(command); commands.push(command);
        return { ...artifact, id: 'c'.repeat(32), previous_version_id: artifact.id, revision: 2, review_state: 'CORRECTED', output: command.request.corrected_output };
    } };
    const node = document.createElement('div'); document.body.append(node); const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<ResearchArtifact bridge={bridge} notebook_id="11111111-1111-1111-1111-111111111111" snapshot_id={'d'.repeat(32)}
        locale="en-US" artifact={artifact} preview={preview} onChange={value => { corrected = value; }}/>));
    const fieldset = (legend: string) => [...node.querySelectorAll('fieldset')].find(f => f.querySelector(':scope > legend')?.textContent === legend)!;
    const claim = fieldset('The reported result');
    function choose(select: HTMLSelectElement, value: string) { select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); }
    await act(async () => choose(claim.querySelector('select')!, 'SUPPORTED_PROPOSAL'));
    const anchor = [...claim.querySelectorAll('label')].find(l => l.textContent?.includes('Alpha original quotation'))?.querySelector('input[type=checkbox]');
    expect(anchor).not.toBeNull(); expect(anchor).not.toBeUndefined();
    await act(async () => (anchor as HTMLInputElement).click());
    const firstReference = fieldset('Study reference');
    await act(async () => choose(firstReference.querySelector('select')!, 'DIRECT'));
    const source = firstReference.querySelector('select[aria-label="Reference source"]') as HTMLSelectElement;
    expect([...source.options].some(option => option.value === preview.inputs.studies[1].source_id)).toBe(false);
    await act(async () => choose(source, preview.inputs.studies[0].source_id));
    await act(async () => choose(fieldset('Erroneous reference').querySelector('select')!, 'NOT_IN_NOTEBOOK'));
    await act(async () => {
        const reason = fieldset('Human review').querySelector(':scope > label textarea')!;
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(reason, 'Selected original excerpt and corrected attribution');
        reason.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const save = [...node.querySelectorAll('button')].find(button => button.textContent === 'Save correction')!;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    expect(commands).toHaveLength(1);
    expect(commands[0].request).toMatchObject({ action: 'CORRECTED', expected_revision: 1 });
    expect(corrected).toMatchObject({ revision: 2, review_state: 'CORRECTED', previous_version_id: original.id });
    expect(corrected.output.claims[0]).toMatchObject({ support: 'SUPPORTED_PROPOSAL', evidence_ids: [preview.inputs.evidence[0].id],
        references: [{ citation: 'Study reference', source_id: preview.inputs.studies[0].source_id, relationship: 'DIRECT' }] });
    expect(corrected.output.claims[1].references[0]).toEqual({ citation: 'Erroneous reference', relationship: 'NOT_IN_NOTEBOOK', source_id: null });
    expect(artifact).toEqual(original);
});
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
