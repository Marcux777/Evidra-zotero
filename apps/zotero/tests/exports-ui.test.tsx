// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
import { Exports } from '../src/ui/Exports';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let unmount = () => {};
afterEach(() => { act(unmount); document.body.replaceChildren(); });
const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };
const source: any = { id: 'b'.repeat(64), identity: { profile_instance_id: 'fixture', library_id: 1, item_key: 'STUDY001' }, title: 'Original study', contents: [] };
const sourcePage = { items: [{ source, state: 'CURRENT' }], offset: 0, limit: 1, total: 1, unavailable_count: 0 };
const preview = { id: 'c'.repeat(32), format: 'json', bytes: 120, pdf_bytes: 0, records: 1, counts: { decision: 1 }, omitted_records: 0, bibliography: [], incomplete_sources: [] };
const empty = { items: [], offset: 0, limit: 0, total: 0 };
async function render(bridge: any) {
    const node = document.createElement('div'); document.body.append(node);
    const root = createRoot(node); unmount = () => root.unmount();
    await act(async () => root.render(<Exports bridge={bridge} {...scope} locale="en-US"/>));
    const button = (text: string) => [...node.querySelectorAll('button')].find(b => b.textContent === text)!;
    await act(async () => button('Open export tools').click());
    return { node, button };
}

test('explicit export buttons preview first, keep uncertain keys stable, and save only the created artifact', async () => {
    const requests: any[] = []; let fail = true, held: Promise<void> | null = null, release = () => {};
    const randomUUID = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined });
    try {
        const { node, button } = await render({ request: async (command: any) => {
            parseUiMessage(command); requests.push(command);
            if (command.op === 'sources.read') return sourcePage;
            if (command.op === 'imports.list') return empty;
            if (command.op === 'exports.preview') return preview;
            if (command.op === 'exports.create') { if (fail) { fail = false; throw new Error('ENGINE_HTTP_ERROR'); } if (held) await held; return { id: preview.id, filename: 'notebook.json', bytes: 120, sha256: 'd'.repeat(64) }; }
            if (command.op === 'exports.save') return { saved: true };
            throw new Error(command.op);
        } });
        const select = node.querySelector('select[name=export_format]')!;
        await act(async () => select.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
        expect(requests.some(r => r.op === 'exports.preview')).toBe(false);
        expect(button('Create export artifact')).toBeUndefined();
        await act(async () => button('Preview export').click());
        expect(node.textContent).toContain('Bytes: 120');
        await act(async () => button('Create export artifact').click());
        expect(button('Create export artifact').disabled).toBe(true);
        held = new Promise(resolve => { release = resolve; });
        await act(async () => button('Retry the same operation').click());
        expect(button('Retry the same operation').disabled).toBe(true);
        await act(async () => button('Create export artifact').click());
        expect(requests.filter(r => r.op === 'exports.create')).toHaveLength(2);
        await act(async () => release());
        const creates = requests.filter(r => r.op === 'exports.create');
        expect(creates[0]).toEqual(creates[1]); expect(creates[0].request.idempotency_key).toMatch(/^[a-f0-9]{64}$/);
        await act(async () => button('Choose destination and save').click());
        expect(requests.at(-1)).toEqual({ op: 'exports.save', ...scope, artifact_id: preview.id });
        expect(node.textContent).toContain('Saved and checksum verified');
    } finally { if (randomUUID) Object.defineProperty(crypto, 'randomUUID', randomUUID); else delete (crypto as any).randomUUID; }
});

test('staged mappings preserve retry revision and imported values need current access before display', async () => {
    const contents = Array.from({ length: 55 }, (_, i) => ({ key: `NOTE${String(i).padStart(4, '0')}`, kind: 'human_note', version: '1' }));
    const study = { ...source, contents }, requests: any[] = []; let failed = false, imported = false, visible = true;
    const importId = 'e'.repeat(32), group = 'f'.repeat(64);
    const receipt = { id: importId, name: 'Imported notebook', origin_profile_id: 'foreign', imported_at: '2026-09-01T00:00:00Z', record_count: 1 };
    const cell = { value: { original: '87,50', normalized: 87.5 }, value_state: 'FOUND', review_state: 'APPROVED', revision: 1, field_key: 'accuracy', form_version_id: '1'.repeat(32), decision_form_version_id: '1'.repeat(32) };
    const record = { id: 'import:record', kind: 'decision', origin: 'IMPORTED', original_record_id: 'decision:original', origin_profile_id: 'foreign', origin_notebook_id: 'original', origin_group_id: group, imported_at: receipt.imported_at,
        data: { id: '2'.repeat(32), author: 'original author', created_at: receipt.imported_at, action: 'APPROVED', rationale: 'Original rationale', old: { ...cell, value: null, value_state: null, review_state: 'UNREVIEWED' }, new: cell, proposal_id: '3'.repeat(32) } };
    const { node, button } = await render({ request: async (command: any) => {
        parseUiMessage(command); requests.push(structuredClone(command));
        if (command.op === 'sources.read') return { ...sourcePage, items: [{ source: study, state: 'CURRENT' }] };
        if (command.op === 'imports.list') return imported ? { items: [receipt], offset: 0, limit: 1, total: 1 } : empty;
        if (command.op === 'imports.choose') return { id: preview.id, name: receipt.name, profile_instance_id: 'foreign', records: 1, pdf_bytes: 0, source_count: 1, mapping_revision: 0 };
        if (command.op === 'imports.sources') return { items: [{ identity: source.identity, contents }], offset: 0, limit: 1, total: 1 };
        if (command.op === 'imports.map') {
            expect(new TextEncoder().encode(JSON.stringify(command.request)).byteLength).toBeLessThan(65536);
            if (!failed) { failed = true; throw new Error('ENGINE_HTTP_ERROR'); }
            return { revision: command.request.expected_revision + 1, mapped_sources: command.request.final ? 1 : 0, total_sources: 1 };
        }
        if (command.op === 'imports.commit') { imported = true; return receipt; }
        if (command.op === 'imports.records') return { items: [record], offset: 0, limit: 1, total: 1, omitted_records: 0 };
        if (command.op === 'imports.status') return { visible, records: visible ? 1 : 0, omitted_records: visible ? 0 : 1 };
        if (command.op === 'imports.reference') return { record: { ...record, id: 'import:form', kind: 'form', data: { name: 'Original immutable form', revision: 1, fields: [{ key: 'accuracy', label: 'Accuracy', question: 'Reported original accuracy?', kind: 'number', unit: 'percent' }] } } };
        throw new Error(command.op);
    } });
    await act(async () => button('Choose backup to inspect').click());
    expect(button('Confirm mappings and import history').disabled).toBe(true);
    await act(async () => button('fixture:1:STUDY001').click());
    await act(async () => button('Original study · fixture / 1 / STUDY001').click());
    expect(node.querySelectorAll('select')).toHaveLength(21); // Format and a bounded 20-content page.
    await act(async () => button('Confirmed source mappings').click());
    expect(button('Confirm mappings and import history').disabled).toBe(true);
    await act(async () => button('Retry the same operation').click());
    const maps = requests.filter(r => r.op === 'imports.map');
    expect(maps).toHaveLength(3); expect(maps[0]).toEqual(maps[1]);
    expect(maps[2].request).toMatchObject({ offset: 50, final: true, expected_revision: 1 });
    const review = [...node.querySelectorAll('input[type=checkbox]')].find(input => input.parentElement?.textContent?.includes('I reviewed')) as HTMLInputElement;
    await act(async () => review.click());
    await act(async () => button('Confirm mappings and import history').click());
    expect(requests.find(r => r.op === 'imports.commit').request).toMatchObject({ confirmed: true, expected_mapping_revision: 2 });
    expect(button('Confirm mappings and import history').disabled).toBe(true);
    await act(async () => button('Inspect imported research').click());
    expect(node.textContent).not.toContain('87,50');
    await act(async () => button('Inspect record').click());
    expect(node.textContent).toContain('87,50'); expect(node.textContent).toContain('87.5');
    expect(node.textContent).toContain('IMPORTED HISTORY — no local approval');
    await act(async () => button(`Form version · ${'1'.repeat(32)}`).click());
    expect(requests.at(-1).request.origin_group_id).toBe(group);
    expect(node.textContent).toContain('Original immutable form'); expect(node.textContent).toContain('percent');
    visible = false;
    await act(async () => button('Inspect record').click());
    expect(node.textContent).not.toContain('87,50'); expect(node.textContent).not.toContain('Original immutable form');
    expect(node.textContent).toContain('SOURCE_REVOKED');
});
