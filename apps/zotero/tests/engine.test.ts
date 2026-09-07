// @vitest-environment node
import { expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, readdir, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type { EnginePlatform } from '../src/bootstrap/engine';
import type { NativeGlobals } from '../src/bridge/native-types';
import { nativeEngine } from '../src/bootstrap/native-engine';
import { nativeDiagnostic } from '../src/security/diagnostics';
async function engine() { expect(existsSync(new URL('../src/bootstrap/engine.ts', import.meta.url)), 'missing engine verification and consent').toBe(true); return import('../src/bootstrap/engine'); }
test('failed atomic handshake write removes the real secret temporary file and preserves the cause', async () => {
    const local = await mkdtemp(join(tmpdir(), 'evidra-handshake-'));
    const failure = new Error('simulated disk write failure');
    let temporary = '', handshake = '', engineLaunches = 0;
    const globals = {
        PathUtils: { join }, crypto, fetch, setTimeout, clearTimeout, setInterval, clearInterval,
        ChromeUtils: { importESModule: () => ({ Subprocess: {
            getEnvironment: () => ({ LOCALAPPDATA: local, SystemRoot: 'C:\\Windows' }),
            call: async ({ command }: { command: string }) => {
                if (command.endsWith('evidra-engine.exe')) engineLaunches++;
                let output = command.endsWith('whoami.exe') ? '"fixture","S-1-5-21-123"' : '';
                return { stdout: { readString: async () => { const value = output; output = ''; return value; } }, stderr: { readString: async () => '' }, wait: async () => ({ exitCode: 0 }), kill: async () => ({ exitCode: 0 }) };
            }
        } }) },
        IOUtils: {
            makeDirectory: async (path: string) => { await mkdir(path, { recursive: true }); },
            writeJSON: async (path: string, value: unknown, options: { tmpPath: string }) => {
                handshake = path; temporary = options.tmpPath;
                await writeFile(temporary, JSON.stringify(value));
                throw failure;
            },
            exists: async (path: string) => existsSync(path),
            remove: async (path: string) => rm(path)
        }
    } as unknown as NativeGlobals;
    try {
        const rejected = await nativeEngine(globals).start('fixture', 'profile').catch(error => error as Error);
        expect(existsSync(temporary)).toBe(false);
        expect(existsSync(handshake)).toBe(false);
        expect(engineLaunches).toBe(0);
        expect(rejected).toMatchObject({ message: 'ENGINE_START_FAILED', cause: failure });
    }
    finally { await rm(local, { recursive: true, force: true }); }
});
test('verifies every real payload file and rejects changed, extra and unsafe manifest entries', async () => {
    const { verifyPackage } = await engine();
    const dir = await mkdtemp(join(tmpdir(), 'evidra-payload-'));
    const digest = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
    const io = { readJson: async (p: string) => JSON.parse(await readFile(p, 'utf8')), listFiles: async () => (await readdir(dir)).filter(n => n !== 'engine-manifest.json'), join, hashFile: async (p: string) => ({ sha256: digest(await readFile(p)), size: (await stat(p)).size }), hashText: async (s: string) => digest(Buffer.from(s)) };
    const manifest = { manifest_version: 1, protocol_version: 1, engine_version: '0.1.0', platform: 'win32', architecture: 'x86_64', entrypoint: 'evidra-engine.exe', files: [{ path: 'evidra-engine.exe', size: 3, sha256: digest(Buffer.from('exe')) }, { path: 'runtime.dll', size: 3, sha256: digest(Buffer.from('dll')) }] };
    try {
        await writeFile(join(dir, 'evidra-engine.exe'), 'exe');
        await writeFile(join(dir, 'runtime.dll'), 'dll');
        await writeFile(join(dir, 'engine-manifest.json'), JSON.stringify(manifest));
        const approved = await verifyPackage(dir, io);
        expect(approved.manifest.files.length).toBe(2);
        expect(approved.fingerprint).toMatch(/^[a-f0-9]{64}$/);
        await writeFile(join(dir, 'runtime.dll'), 'bad');
        await expect(verifyPackage(dir, io)).rejects.toThrow('PAYLOAD_HASH_MISMATCH');
        await writeFile(join(dir, 'runtime.dll'), 'dll');
        await writeFile(join(dir, 'injected.dll'), 'bad');
        await expect(verifyPackage(dir, io)).rejects.toThrow('PAYLOAD_FILE_SET_MISMATCH');
        await rm(join(dir, 'injected.dll'));
        manifest.files[1]!.path = '../runtime.dll';
        await writeFile(join(dir, 'engine-manifest.json'), JSON.stringify(manifest));
        await expect(verifyPackage(dir, io)).rejects.toThrow('UNSAFE_PAYLOAD_PATH');
        await rm(join(dir, 'runtime.dll'));
        await writeFile(join(dir, 'Lorem ipsum.txt'), 'dll');
        manifest.files[1]!.path = 'Lorem ipsum.txt';
        await writeFile(join(dir, 'engine-manifest.json'), JSON.stringify(manifest));
        expect((await verifyPackage(dir, io)).manifest.files[1]!.path).toBe('Lorem ipsum.txt');
    }
    finally {
        await rm(dir, { recursive: true, force: true });
    }
});
test('controller requires current consent, validates receipt, hides credential, heartbeats and stops only owned process', async () => {
    const { EngineController } = await engine();
    const requests: {
        url: string;
        init: RequestInit;
    }[] = [];
    let killed = 0;
    let heartbeat: (() => void) | null = null;
    const platform: EnginePlatform = { reportError: error => { throw error; }, verify: async () => ({ fingerprint: 'a'.repeat(64), manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'a'.repeat(64) }], entrypoint: 'evidra-engine.exe' } }), start: async () => ({ receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, token: 'd'.repeat(64), stop: async () => { killed++; } }), fetch: async (url: string, init: RequestInit) => { requests.push({ url, init }); return new Response(JSON.stringify({ status: 'ok', protocol_version: 1, profile_instance_id: 'profile', heartbeat_interval_seconds: 10, heartbeat_timeout_seconds: 30 })); }, every: (fn: () => void, ms: number) => { expect(ms).toBe(10000); heartbeat = fn; return () => { heartbeat = null; }; } };
    const controller = new EngineController(platform, 'profile');
    await controller.choose('private-path');
    await expect(controller.start('b'.repeat(64), true)).rejects.toThrow('PAYLOAD_CHANGED');
    expect(killed).toBe(0);
    await controller.start('a'.repeat(64), true);
    expect(controller.view().state).toBe('running');
    expect(JSON.stringify(controller.view())).not.toContain('d'.repeat(64));
    expect(JSON.stringify(controller)).not.toContain('d'.repeat(64));
    expect(requests[0]!.url).toBe('http://127.0.0.1:49234/v1/status');
    expect(new Headers(requests[0]!.init.headers).get('Authorization')).toBe(`Bearer ${'d'.repeat(64)}`);
    const notebook = '/v1/notebooks/11111111-1111-4111-8111-111111111111';
    const snapshot = `${notebook}/snapshots/${'a'.repeat(32)}`;
    const requiredRoutes: ['GET' | 'POST' | 'PUT' | 'DELETE', string][] = [
        ['GET', `${snapshot}/protocols?offset=0&limit=1`], ['POST', `${snapshot}/protocols`],
        ['GET', `${snapshot}/protocols/${'f'.repeat(32)}`], ['GET', `${snapshot}/screening/${'f'.repeat(32)}?offset=0&limit=20`],
        ['POST', `${snapshot}/screening/decisions`], ['GET', `${snapshot}/research/runs?offset=0&limit=20`],
        ['POST', `${snapshot}/research/runs`], ['GET', `${snapshot}/research/runs/${'f'.repeat(32)}`],
        ['GET', `${snapshot}/research/runs/${'f'.repeat(32)}/preview`], ['GET', `${snapshot}/research/runs/${'f'.repeat(32)}/access?offset=0&limit=20`],
        ['POST', `${snapshot}/research/runs/${'f'.repeat(32)}/control`], ['GET', `${snapshot}/artifacts/${'f'.repeat(32)}`],
        ['GET', `${snapshot}/artifacts/${'f'.repeat(32)}/versions?offset=0&limit=1`], ['POST', `${snapshot}/artifacts/${'f'.repeat(32)}/review`],
        ['POST', `${snapshot}/notes/previews`], ['POST', `${snapshot}/notes/approve`], ['GET', `${snapshot}/notes/outbox?offset=0&limit=1`],
        ['GET', `${snapshot}/notes/outbox/${'f'.repeat(32)}`], ['POST', `${snapshot}/notes/outbox/${'f'.repeat(32)}/begin`], ['POST', `${snapshot}/notes/outbox/${'f'.repeat(32)}/ack`],
        ['GET', `${snapshot}/jobs?offset=0&limit=10`], ['POST', `${snapshot}/jobs`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}`], ['POST', `${snapshot}/jobs/${'f'.repeat(32)}/control`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/access?offset=0&limit=50`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/units?offset=0&limit=20`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/units/${'e'.repeat(32)}/batches/0`], ['POST', `${snapshot}/job-cache/clear`],
        ['GET', `${snapshot}/forms?offset=0&limit=1`], ['GET', `${snapshot}/forms/template`],
        ['GET', `${snapshot}/forms/${'f'.repeat(32)}`], ['POST', `${snapshot}/forms`],
        ...['query', 'proposals', 'decisions', 'proposals/query', 'decisions/query', 'bulk-preview', 'bulk-approve'].map(path => ['POST', `${snapshot}/matrix/${path}`] as ['POST', string]),
        ['GET', '/v1/providers/profiles?offset=0&limit=50'], ['GET', '/v1/providers/settings'],
        ['PUT', '/v1/providers/settings'], ['PUT', '/v1/providers/profiles/local'],
        ['GET', '/v1/providers/profiles/local/models?offset=0&limit=50'],
        ['GET', '/v1/providers/profiles/local/secret'], ['PUT', '/v1/providers/profiles/local/secret'], ['DELETE', '/v1/providers/profiles/local/secret'],
        ['POST', '/v1/providers/profiles/local/resume'], ['POST', '/v1/providers/prices'],
        ['GET', `${notebook}/providers/local/consent`], ['PUT', `${notebook}/providers/local/consent`],
        ['GET', `${snapshot}/conversations?offset=0&limit=50`], ['POST', `${snapshot}/conversations`],
        ['GET', `${snapshot}/conversations/${'f'.repeat(32)}`], ['GET', `${snapshot}/conversations/${'f'.repeat(32)}/runs?offset=0&limit=50`],
        ['POST', `${snapshot}/conversations/${'f'.repeat(32)}/runs`], ['GET', `${snapshot}/runs/${'f'.repeat(32)}`],
        ['POST', `${snapshot}/runs/${'f'.repeat(32)}/start`], ['POST', `${snapshot}/runs/${'f'.repeat(32)}/cancel`],
        ['POST', `${snapshot}/vectors`], ['GET', `${snapshot}/vectors/${'f'.repeat(32)}`], ['POST', `${snapshot}/vectors/${'f'.repeat(32)}/cancel`],
        ['GET', `${snapshot}/provider-calls?offset=0&limit=50`], ['PUT', `${snapshot}/provider-budgets`],
        ['GET', `${snapshot}/provider-budgets/call/${'f'.repeat(32)}`],
        ['GET', `${snapshot}/documents?offset=0&limit=50`],
        ['POST', `${snapshot}/documents/register`],
        ['POST', `${snapshot}/documents/missing`], ['POST', `${snapshot}/documents/verify`],
        ['POST', `${snapshot}/documents/ingest`], ['POST', `${snapshot}/documents/text`],
        ['POST', `${snapshot}/documents/text/${'c'.repeat(32)}`], ['POST', `${snapshot}/documents/preview`],
        ['GET', `${snapshot}/operations/${'d'.repeat(32)}`], ['POST', `${snapshot}/operations/${'d'.repeat(32)}/cancel`],
        ['GET', `${snapshot}/operations/${'d'.repeat(32)}/preview`],
        ['GET', `${snapshot}/evidence/${'e'.repeat(64)}`], ['POST', `${snapshot}/search`],
        ['GET', `${notebook}/snapshots?offset=0&limit=50`],
        ['GET', `${notebook}/snapshots?offset=0&limit=1`],
        ['GET', `${snapshot}/identities?offset=0&limit=100`],
        ['GET', `${snapshot}/sources?offset=0&limit=50`],
        ['GET', `${notebook}/snapshots/22222222-2222-4222-8222-222222222222/sources?offset=0&limit=50`],
        ['GET', `${notebook}/snapshots/22222222-2222-4222-8222-222222222222/identities?offset=0&limit=100`],
        ['GET', `${notebook}/sources/previews/${'b'.repeat(32)}?offset=50&limit=50`],
        ['POST', `${notebook}/sources/sync`], ['POST', '/v1/sources/invalidate'],
        ['POST', `${notebook}/sources/preview`], ['POST', `${notebook}/snapshots`],
        ['POST', `${notebook}/sources/${'c'.repeat(64)}/revoke`],
        ['GET', '/v1/notebooks?offset=9007199254740991&limit=50'], ['GET', notebook],
        ['GET', '/v1/notebooks'], ['POST', '/v1/notebooks']
    ];
    for (const [method, path] of requiredRoutes) {
        await controller.request(method, path, method === 'POST' ? { check: 'route-boundary' } : undefined);
        const sent = requests.at(-1)!;
        expect(sent.url).toBe(`http://127.0.0.1:49234${path}`);
        expect(sent.init).toMatchObject({ method, credentials: 'omit', redirect: 'error' });
        expect(new Headers(sent.init.headers).get('Authorization')).toBe(`Bearer ${'d'.repeat(64)}`);
        expect(new Headers(sent.init.headers).get('X-Evidra-Client')).toBe('bridge');
    }
    const rejectedRoutes: [string, string][] = [
        ['GET', `${snapshot}/notes/outbox?offset=0&limit=20`], ['GET', `${snapshot}/research/runs?offset=0&limit=50`],
        ['GET', `${snapshot}/notes/outbox/${'f'.repeat(32)}/begin`], ['POST', `${snapshot}/artifacts/${'f'.repeat(32)}`],
        ['POST', `${snapshot}/notes/outbox/${'f'.repeat(32)}/delete`], ['POST', `${snapshot}/research/runs/${'f'.repeat(32)}/control?offset=0&limit=20`],
        ['GET', `${snapshot}/jobs?offset=0&limit=50`], ['GET', `${snapshot}/job-cache/clear`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/control`], ['POST', `${snapshot}/jobs/${'f'.repeat(32)}/access?offset=0&limit=50`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/units?offset=0&limit=50`],
        ['GET', `${snapshot}/jobs/${'f'.repeat(32)}/units/${'e'.repeat(32)}/batches/10001`],
        ['POST', `${snapshot}/runs/${'f'.repeat(32)}/events?cursor=0`],
        ['GET', `${snapshot}/runs/${'f'.repeat(32)}/events?cursor=0&token=private`],
        ['PUT', '/v1/providers/profiles/local/models'], ['DELETE', '/v1/providers/profiles/local'],
        ['GET', `${snapshot}/provider-budgets/unknown/${'f'.repeat(32)}`],
        ['GET', `${snapshot}/documents/register`], ['GET', `${snapshot}/documents?path=C:/private.pdf`],
        ['POST', `${snapshot}/operations/${'d'.repeat(32)}/preview`],
        ['GET', `${snapshot}/documents?offset=0&limit=100`], ['GET', `${snapshot}/search`],
        ['GET', `${snapshot}/evidence/${'e'.repeat(64)}/../register`],
        ['GET', '/v1/sources/invalidate'], ['POST', '/v1/status'], ['GET', '/v1/bridge/heartbeat'],
        ['DELETE', `${notebook}/snapshots`], ['POST', `${snapshot}/sources?offset=0&limit=50`],
        ['GET', `${notebook}/sources/sync`], ['POST', `${notebook}/snapshots?offset=0&limit=50`],
        ['GET', `${snapshot}/sources`], ['GET', `${snapshot}/sources?offset=0&limit=100`],
        ['GET', `${snapshot}/identities?offset=0&limit=50`], ['GET', `${notebook}/snapshots?offset=0&limit=100`],
        ['GET', `${notebook}/sources/previews/${'b'.repeat(32)}?offset=0&limit=1`],
        ['GET', `${notebook}/snapshots?offset=0&limit=50&extra=true`],
        ['GET', `${notebook}/snapshots?offset=0&offset=1&limit=50`],
        ['GET', `${notebook}/snapshots?offset=-1&limit=50`],
        ['GET', `${notebook}/snapshots?offset=9007199254740992&limit=50`],
        ['GET', `${notebook}/snapshots?offset=1.5&limit=50`],
        ['GET', `${notebook}/snapshots/${'a'.repeat(33)}/sources?offset=0&limit=50`],
        ['POST', `${notebook}/sources/${'c'.repeat(63)}/revoke`],
        ['GET', `${notebook}/../status`], ['GET', `${notebook}/%2e%2e/status`],
        ['GET', `${notebook}\n`], ['GET', `${notebook}/snapshots?offset=0&limit=50\n`],
        ['GET', `${notebook}\\snapshots?offset=0&limit=50`],
        ['GET', `${notebook}/snapshots?offset=0&limit=50#fragment`],
        ['GET', '/v1/unknown'], ['GET', 'https://example.invalid/v1/status']
    ];
    const beforeRejected = requests.length;
    for (const [method, path] of rejectedRoutes)
        await expect(controller.request(method as 'GET', path)).rejects.toThrow('INVALID_ENGINE_ROUTE');
    expect(requests).toHaveLength(beforeRejected);
    heartbeat!();
    await new Promise(resolve => setImmediate(resolve));
    expect(requests.at(-1)!.url).toContain('/v1/bridge/heartbeat');
    await controller.stop();
    expect(killed).toBe(1);
    expect(heartbeat).toBeNull();
    await expect(controller.request('GET', '/v1/notebooks')).rejects.toThrow('ENGINE_NOT_RUNNING');
});
test('shutdown waits for an in-flight owned startup and leaves no child or failed restart state', async () => {
    const { EngineController } = await engine();
    let release!: () => void;
    let began!: () => void;
    let killed = 0;
    let stopped = false;
    const entered = new Promise<void>(resolve => { began = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    const platform: EnginePlatform = { reportError: error => { throw error; }, verify: async () => ({ fingerprint: 'a'.repeat(64), manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'a'.repeat(64) }], entrypoint: 'evidra-engine.exe' } }), start: async () => { began(); await gate; return { receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, token: 'd'.repeat(64), stop: async () => { killed++; } }; }, fetch: async () => { throw new Error('should not reach HTTP'); }, every: () => { throw new Error('should not heartbeat'); } };
    const controller = new EngineController(platform, 'profile');
    await controller.choose('fixture');
    const startup = controller.start('a'.repeat(64), true).catch(error => error as Error);
    await entered;
    const shutdown = controller.stop().then(() => { stopped = true; });
    await new Promise(resolve => setImmediate(resolve));
    expect(stopped).toBe(false);
    release();
    await shutdown;
    expect((await startup as Error).message).toBe('START_CANCELLED');
    expect(killed).toBe(1);
    expect(controller.view().state).toBe('stopped');
});
test.each(['authorization', 'network'] as const)('heartbeat %s failure preserves and reports its cause before child cleanup without leaking inputs', async kind => {
    const { EngineController } = await engine();
    const token = 'e'.repeat(64), raw = `C:\\private\\payload ${token}`;
    const networkFailure = new TypeError(raw, { cause: Object.assign(new Error(raw), { code: 'ECONNREFUSED', errno: -4078, path: raw, token }) });
    const reports: { original: Error; safe: ReturnType<typeof nativeDiagnostic> }[] = [];
    let heartbeat: (() => void) | null = null, reportsAtStop = 0;
    const platform: EnginePlatform = {
        verify: async () => ({ fingerprint: 'a'.repeat(64), manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', entrypoint: 'evidra-engine.exe', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'a'.repeat(64) }] } }),
        start: async () => ({ token, receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, stop: async () => { reportsAtStop = reports.length; } }),
        fetch: async url => {
            if (url.endsWith('/v1/status')) return new Response(JSON.stringify({ status: 'ok', protocol_version: 1, profile_instance_id: 'profile', heartbeat_interval_seconds: 10, heartbeat_timeout_seconds: 30 }));
            if (kind === 'network') throw networkFailure;
            return new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: raw, retryable: false, run_id: null, details: { input: raw } }), { status: 401 });
        },
        every: fn => { heartbeat = fn; return () => { heartbeat = null; }; },
        reportError: error => reports.push({ original: error as Error, safe: nativeDiagnostic(error) })
    };
    const controller = new EngineController(platform, 'profile');
    try {
        await controller.choose('package'); await controller.start('a'.repeat(64), true);
        heartbeat!(); await new Promise(resolve => setImmediate(resolve));
        expect(controller.view()).toMatchObject({ state: 'failed', error: 'HEARTBEAT_FAILED' });
        expect(reportsAtStop).toBe(1);
        expect(reports[0]!.original.message).toBe('HEARTBEAT_FAILED');
        if (kind === 'network') {
            expect(reports[0]!.original.cause).toBe(networkFailure);
            expect(reports[0]!.safe.causes).toMatchObject([{ code: 'HEARTBEAT_FAILED' }, { type: 'TypeError' }, { system_code: 'ECONNREFUSED', errno: -4078 }]);
        }
        else expect(reports[0]!.safe.causes).toMatchObject([{ code: 'HEARTBEAT_FAILED' }, { code: 'UNAUTHENTICATED' }, { operation: 'engine_http', http_status: 401 }]);
        expect(JSON.stringify(reports[0]!.safe)).not.toContain(token);
        expect(JSON.stringify(reports[0]!.safe)).not.toContain('private');
        expect(JSON.stringify(controller.view())).not.toContain(token);
    }
    finally { await controller.stop(); }
});
