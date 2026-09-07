import { expect, test } from 'vitest';
import { parseUiMessage } from '../src/security/messages';
import { ExportBridge } from '../src/bridge/exports';
import { createHash, webcrypto } from 'node:crypto';
import { mkdtemp, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';

const scope = { notebook_id: '11111111-1111-4111-8111-111111111111', snapshot_id: 'a'.repeat(32) };

test('generated export commands admit explicit actions and reject file, translator and authority injection', () => {
    const command = { op: 'exports.preview', ...scope, request: { format: 'bibtex', source_ids: ['b'.repeat(64)], include_pdfs: false, excel: false } };
    expect(parseUiMessage(command)).toEqual(command);
    expect(parseUiMessage({ op: 'exports.save', ...scope, artifact_id: 'c'.repeat(32) }).op).toBe('exports.save');
    for (const invalid of [
        { ...command, path: 'C:\\private' },
        { ...command, request: { ...command.request, translator_id: 'external' } },
        { ...command, op: 'exports.read_file' },
        { op: 'imports.commit', ...scope, request: { preview_id: 'c'.repeat(32), confirmed: false, mappings: [], idempotency_key: 'a' } },
        { op: 'imports.records', ...scope, import_id: 'c'.repeat(32), offset: 1000001 },
    ]) expect(() => parseUiMessage(invalid)).toThrow('INVALID_UI_MESSAGE');
});

test('picker-owned real file transfers verify checksums, bounded chunks, cancellations and changed scope', async () => {
    const owned = resolve('.local/task11'), directory = await mkdtemp(join(owned, 'bridge-files-'));
    const bytes = Buffer.from('exact original export\n'.repeat(2600)), hash = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
    const artifact = { id: 'c'.repeat(32), filename: 'notebook.json', media_type: 'application/json', bytes: bytes.length, sha256: hash(bytes) };
    const paths = { output: join(directory, 'chosen.json'), input: join(directory, 'chosen.zip') }, requests: { method: string; path: string; body: any }[] = [];
    let pickerPath = paths.output, pickerResult = 0, pickerCount = 0, revoked = false, revokeInPicker = false, corrupt = false, transferred = Buffer.alloc(0), writes = 0;
    class Picker {
        modeOpen = 0; modeSave = 1; returnOK = 0; returnReplace = 2; file = pickerPath; defaultString = '';
        init() {} appendFilter() {} async show() { pickerCount++; if (revokeInPicker) revoked = true; return pickerResult; }
    }
    const globals: any = { crypto: webcrypto, PathUtils: { filename: basename }, ChromeUtils: { importESModule: (uri: string) => { expect(uri).toBe('chrome://zotero/content/modules/filePicker.mjs'); return { FilePicker: Picker }; } },
        IOUtils: {
            write: async (path: string, data: Uint8Array, options: { mode: string }) => { expect(path).toBe(paths.output); writes++; await writeFile(path, data, { flag: options.mode === 'create' ? 'wx' : 'w' }); },
            computeHexDigest: async (path: string) => hash(await readFile(path)),
            stat: async (path: string) => { const value = await stat(path); return { type: value.isFile() ? 'regular' : 'directory', size: value.size, lastModified: value.mtimeMs, creationTime: value.birthtimeMs }; },
            read: async (path: string, options: { offset: number; maxBytes: number }) => { expect(options.maxBytes).toBeLessThanOrEqual(24000); const data = await readFile(path); return new Uint8Array(data.subarray(options.offset, options.offset + options.maxBytes)); },
        } };
    const sources: any = { withDocuments: async (_book: string, _snapshot: string, fn: any) => { const check = () => { if (revoked) throw new Error('SOURCE_REVOKED'); }; check(); return fn([], check); } };
    const engine: any = { request: async (method: string, path: string, body: any) => {
        requests.push({ method, path, body }); if (body) expect(Buffer.byteLength(JSON.stringify(body))).toBeLessThan(65536);
        if (path.endsWith('/exports/previews')) return { id: artifact.id, format: 'json', bibliography: [] };
        if (path.endsWith('/exports')) return artifact;
        if (path.endsWith('/validate') || path.endsWith('/discard')) return null;
        if (path.includes('/data?offset=')) { const offset = Number(path.split('=')[1]); const part = Buffer.from(bytes.subarray(offset, offset + 24000)); if (corrupt) part[0] = 0; return { offset, total: bytes.length, data_base64: part.toString('base64') }; }
        if (path.endsWith('/imports/uploads')) return { id: 'd'.repeat(32), bytes: body.bytes, offset: 0 };
        if (path.endsWith(`/imports/uploads/${'d'.repeat(32)}`)) { expect(body.offset).toBe(transferred.length); transferred = Buffer.concat([transferred, Buffer.from(body.data_base64, 'base64')]); return { id: 'd'.repeat(32), offset: transferred.length, bytes: bytes.length }; }
        if (path.endsWith('/inspect')) return { id: 'd'.repeat(32), name: 'Inspected', source_count: 0 };
        throw new Error(path);
    } };
    const bridge = new ExportBridge(globals, sources, engine, 'fixture'), window = {} as Window;
    try {
        await bridge.dispatch({ op: 'exports.preview', ...scope, request: { format: 'json', excel: false, include_pdfs: false } }, window, 'en-US');
        await bridge.dispatch({ op: 'exports.create', ...scope, request: { preview_id: artifact.id, idempotency_key: 'create' } }, window, 'en-US');
        pickerResult = 1;
        expect(await bridge.dispatch({ op: 'exports.save', ...scope, artifact_id: artifact.id }, window, 'en-US')).toBeNull();
        expect(writes).toBe(0);
        pickerResult = 0; corrupt = true;
        await expect(bridge.dispatch({ op: 'exports.save', ...scope, artifact_id: artifact.id }, window, 'en-US')).rejects.toThrow('EXPORT_CHECKSUM_MISMATCH');
        expect(writes).toBe(0);
        corrupt = false; revokeInPicker = true;
        await expect(bridge.dispatch({ op: 'exports.save', ...scope, artifact_id: artifact.id }, window, 'en-US')).rejects.toThrow('SOURCE_REVOKED');
        expect(writes).toBe(0); revoked = false; revokeInPicker = false;
        const receipt = await bridge.dispatch({ op: 'exports.save', ...scope, artifact_id: artifact.id }, window, 'en-US');
        expect(receipt).toEqual({ filename: 'chosen.json', bytes: bytes.length, sha256: hash(bytes), saved: true });
        expect(await readFile(paths.output)).toEqual(bytes); expect(writes).toBe(1);
        const selected = pickerCount;
        expect(await bridge.dispatch({ op: 'exports.save', ...scope, artifact_id: artifact.id }, window, 'en-US')).toEqual(receipt);
        expect(pickerCount).toBe(selected); expect(writes).toBe(1);
        pickerPath = paths.input; await writeFile(paths.input, bytes);
        expect(await bridge.dispatch({ op: 'imports.choose', ...scope }, window, 'en-US')).toMatchObject({ name: 'Inspected' });
        expect(transferred).toEqual(bytes);
        expect(requests.filter(r => r.path.includes('/data?')).length).toBeGreaterThan(2);
        expect(JSON.stringify(requests)).not.toContain(directory);
    } finally { if (dirname(resolve(directory)) !== owned) throw new Error('Unsafe test cleanup'); await rm(directory, { recursive: true }); }
});

