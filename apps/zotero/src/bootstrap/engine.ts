import validateManifest from '../../../../packages/contracts/generated/validate-manifest.js';
import type { EngineManifest, EnginePreview, RuntimeStatus } from '../bridge/types';
export interface PackageIO {
    readJson(path: string): Promise<unknown>;
    listFiles(root: string): Promise<string[]>;
    join(...paths: string[]): string;
    hashFile(path: string): Promise<{
        sha256: string;
        size: number;
    }>;
    hashText(text: string): Promise<string>;
}
export interface VerifiedPackage {
    manifest: EngineManifest;
    fingerprint: string;
}
export async function verifyPackage(root: string, io: PackageIO): Promise<VerifiedPackage> {
    const manifest = await io.readJson(io.join(root, 'engine-manifest.json'));
    if (!validateManifest(manifest))
        throw new Error('INVALID_ENGINE_MANIFEST');
    const names = new Set<string>();
    for (const file of manifest.files) {
        if (file.path.split('/').some(p => !p || p === '.' || p === '..' || p.trim() !== p || p.endsWith('.') || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)) || file.path === 'engine-manifest.json' || names.has(file.path.toLowerCase()))
            throw new Error('UNSAFE_PAYLOAD_PATH');
        names.add(file.path.toLowerCase());
    }
    if (!names.has(manifest.entrypoint))
        throw new Error('MISSING_ENTRYPOINT');
    const actual = await io.listFiles(root);
    if (actual.length !== names.size || actual.some(p => !names.has(p.toLowerCase())))
        throw new Error('PAYLOAD_FILE_SET_MISMATCH');
    for (const file of manifest.files) {
        const result = await io.hashFile(io.join(root, ...file.path.split('/')));
        if (result.size !== file.size || result.sha256 !== file.sha256)
            throw new Error('PAYLOAD_HASH_MISMATCH');
    }
    // Canonical order is part of manifest v1: fixed property order and ordinal file path order.
    const canonical = JSON.stringify({ manifest_version: manifest.manifest_version, protocol_version: manifest.protocol_version, engine_version: manifest.engine_version, platform: manifest.platform, architecture: manifest.architecture, entrypoint: manifest.entrypoint, files: [...manifest.files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0).map(f => ({ path: f.path, size: f.size, sha256: f.sha256 })) });
    return { manifest, fingerprint: await io.hashText(canonical) };
}
export interface OwnedSession {
    receipt: unknown;
    token: string;
    stop(): Promise<void>;
}
export interface EnginePlatform {
    verify(root: string): Promise<VerifiedPackage>;
    start(root: string, profile: string): Promise<OwnedSession>;
    fetch(url: string, init: RequestInit): Promise<Response>;
    every(fn: () => void, ms: number): () => void;
}
export class EngineController {
    #platform: EnginePlatform;
    #profile: string;
    #root: string | null = null;
    #preview: EnginePreview | null = null;
    #session: OwnedSession | null = null;
    #url = '';
    #cancelHeartbeat: (() => void) | null = null;
    #state: 'stopped' | 'starting' | 'running' | 'failed' = 'stopped';
    #error: string | null = null;
    #heartbeatBusy = false;
    #generation = 0;
    #requests = new Set<AbortController>();
    #startTask: Promise<void> | null = null;
    constructor(platform: EnginePlatform, profile: string) { this.#platform = platform; this.#profile = profile; }
    view() { return { state: this.#state, engine: this.#preview, error: this.#error }; }
    async choose(root: string) { if (this.#state === 'starting' || this.#state === 'running')
        throw new Error('ENGINE_ALREADY_RUNNING'); this.#root = root; return this.verify(); }
    async verify() { if (!this.#root)
        throw new Error('ENGINE_NOT_CHOSEN'); const pkg = await this.#platform.verify(this.#root); this.#preview = { fingerprint: pkg.fingerprint, version: pkg.manifest.engine_version, files: pkg.manifest.files.length, consentRequired: true }; return this.#preview; }
    async start(fingerprint: string, consent: boolean) {
        if (this.#startTask)
            throw new Error('ENGINE_ALREADY_RUNNING');
        const task = this.#start(fingerprint, consent);
        this.#startTask = task;
        try {
            await task;
        }
        finally {
            if (this.#startTask === task)
                this.#startTask = null;
        }
    }
    async #start(fingerprint: string, consent: boolean) {
        if (!consent || !this.#root)
            throw new Error('ENGINE_CONSENT_REQUIRED');
        if (this.#state === 'starting' || this.#state === 'running')
            throw new Error('ENGINE_ALREADY_RUNNING');
        const generation = ++this.#generation;
        this.#state = 'starting';
        this.#error = null;
        try {
            const current = await this.verify();
            if (current.fingerprint !== fingerprint)
                throw new Error('PAYLOAD_CHANGED');
            if (generation !== this.#generation)
                throw new Error('START_CANCELLED');
            const session = await this.#platform.start(this.#root, this.#profile);
            if (generation !== this.#generation) {
                await session.stop();
                throw new Error('START_CANCELLED');
            }
            this.#session = session;
            const receipt = session.receipt as Record<string, unknown>;
            if (!receipt || Object.keys(receipt).sort().join(',') !== 'host,port,profile_instance_id,protocol_version' || receipt.protocol_version !== 1 || receipt.host !== '127.0.0.1' || receipt.profile_instance_id !== this.#profile || !Number.isInteger(receipt.port) || (receipt.port as number) < 1 || (receipt.port as number) > 65535 || receipt.port === 23119)
                throw new Error('INVALID_CONNECTION_RECEIPT');
            this.#url = `http://127.0.0.1:${receipt.port}`;
            this.#state = 'running';
            const status = await this.request('GET', '/v1/status') as RuntimeStatus;
            if (status.protocol_version !== 1 || status.profile_instance_id !== this.#profile || status.heartbeat_interval_seconds !== 10 || status.heartbeat_timeout_seconds !== 30)
                throw new Error('PROTOCOL_MISMATCH');
            this.#preview = { ...current, consentRequired: false };
            this.#cancelHeartbeat = this.#platform.every(() => { if (this.#heartbeatBusy)
                return; this.#heartbeatBusy = true; void this.request('POST', '/v1/bridge/heartbeat').catch(async () => { await this.stop(); this.#state = 'failed'; this.#error = 'HEARTBEAT_FAILED'; }).finally(() => { this.#heartbeatBusy = false; }); }, 10000);
        }
        catch (error) {
            await this.#closeSession();
            if (generation !== this.#generation) {
                this.#state = 'stopped';
                throw new Error('START_CANCELLED', { cause: error });
            }
            this.#state = 'failed';
            this.#error = error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : 'ENGINE_START_FAILED';
            throw new Error(this.#error, { cause: error });
        }
    }
    async request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
        if (this.#state !== 'running' || !this.#session)
            throw new Error('ENGINE_NOT_RUNNING');
        if (!(/^\/v1\/(status|bridge\/heartbeat|notebooks(?:\?offset=\d+&limit=50|\/[a-f0-9-]{36})?)$/.test(path)))
            throw new Error('INVALID_ENGINE_ROUTE');
        const controller = new AbortController();
        this.#requests.add(controller);
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await this.#platform.fetch(this.#url + path, { method, headers: { Authorization: `Bearer ${this.#session.token}`, 'X-Evidra-Client': 'bridge', 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), credentials: 'omit', redirect: 'error', signal: controller.signal });
            if (!response.ok) {
                const error = await response.json() as {
                    code?: unknown;
                };
                throw new Error(typeof error.code === 'string' && /^[A-Z_]{1,80}$/.test(error.code) ? error.code : 'ENGINE_HTTP_ERROR');
            }
            return await response.json();
        }
        finally {
            clearTimeout(timeout);
            this.#requests.delete(controller);
        }
    }
    async #closeSession() { this.#cancelHeartbeat?.(); this.#cancelHeartbeat = null; for (const request of this.#requests)
        request.abort(); this.#requests.clear(); const owned = this.#session; this.#session = null; this.#url = ''; if (owned)
        await owned.stop(); }
    async stop() { ++this.#generation; this.#state = 'stopped'; await this.#closeSession(); const pending = this.#startTask; if (pending) {
        try {
            await pending;
        }
        catch (error) {
            if (!(error instanceof Error) || error.message !== 'START_CANCELLED')
                throw error;
        }
    } }
}
