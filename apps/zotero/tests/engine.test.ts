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
    const platform: EnginePlatform = { verify: async () => ({ fingerprint: 'a'.repeat(64), manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'a'.repeat(64) }], entrypoint: 'evidra-engine.exe' } }), start: async () => ({ receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, token: 'd'.repeat(64), stop: async () => { killed++; } }), fetch: async (url: string, init: RequestInit) => { requests.push({ url, init }); return new Response(JSON.stringify({ status: 'ok', protocol_version: 1, profile_instance_id: 'profile', heartbeat_interval_seconds: 10, heartbeat_timeout_seconds: 30 })); }, every: (fn: () => void, ms: number) => { expect(ms).toBe(10000); heartbeat = fn; return () => { heartbeat = null; }; } };
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
    const platform: EnginePlatform = { verify: async () => ({ fingerprint: 'a'.repeat(64), manifest: { manifest_version: 1, protocol_version: 1, platform: 'win32', architecture: 'x86_64', engine_version: '0.1.0', files: [{ path: 'evidra-engine.exe', size: 3, sha256: 'a'.repeat(64) }], entrypoint: 'evidra-engine.exe' } }), start: async () => { began(); await gate; return { receipt: { protocol_version: 1, host: '127.0.0.1', port: 49234, profile_instance_id: 'profile' }, token: 'd'.repeat(64), stop: async () => { killed++; } }; }, fetch: async () => { throw new Error('should not reach HTTP'); }, every: () => { throw new Error('should not heartbeat'); } };
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
