import { verifyPackage, type EnginePlatform, type OwnedSession, type PackageIO } from './engine';
import type { NativeGlobals, NativeProcess, NativeSubprocess } from '../bridge/native-types';
import { nativeDiagnostic, parseEngineDiagnostic } from '../security/diagnostics';
// This fixed script only validates filesystem structure. Paths arrive as environment data.
// GetAttributes is used because Gecko's IOUtils.stat follows reparse points on Windows.
const CHECK_PATH = `$ErrorActionPreference='Stop';try{$p=$env:EVIDRA_CHECK_PATH;if($p -notmatch '^[A-Za-z]:\\\\' -or $p.Substring(2).Contains(':')){throw 'path'};$cursor=$p;while($cursor){if(([IO.File]::GetAttributes($cursor) -band [IO.FileAttributes]::ReparsePoint) -ne 0){throw 'reparse'};$cursor=[IO.Path]::GetDirectoryName($cursor)};if($env:EVIDRA_CHECK_TREE -eq '1'){$queue=New-Object 'Collections.Generic.Queue[string]';$queue.Enqueue($p);while($queue.Count){$d=$queue.Dequeue();foreach($f in [IO.Directory]::EnumerateFileSystemEntries($d)){$a=[IO.File]::GetAttributes($f);if(($a -band [IO.FileAttributes]::ReparsePoint) -ne 0){throw 'reparse'};if(($a -band [IO.FileAttributes]::Directory) -ne 0){$queue.Enqueue($f)}}}};exit 0}catch{[Console]::Error.WriteLine('UNSAFE_NATIVE_PATH');exit 1}`;
export function nativeEngine(g: NativeGlobals): EnginePlatform {
    const subprocess = g.ChromeUtils.importESModule('resource://gre/modules/Subprocess.sys.mjs').Subprocess as NativeSubprocess;
    const environment = subprocess.getEnvironment();
    const local = environment.LOCALAPPDATA, systemRoot = environment.SystemRoot ?? environment.SYSTEMROOT;
    if (!local || !systemRoot)
        throw new Error('WINDOWS_PATHS_UNAVAILABLE');
    const system = g.PathUtils.join(systemRoot, 'System32');
    async function command(executable: string, args: string[], env?: Record<string, string>): Promise<string> {
        const process = await subprocess.call({ command: g.PathUtils.join(system, ...executable.split('\\')), arguments: args, stderr: 'pipe', ...(env ? { environment: env, environmentAppend: true } : {}) });
        let timedOut = false;
        const timeout = g.setTimeout(() => { timedOut = true; void process.kill(0); }, 10000);
        const readAll = async (stream: {
            readString(): Promise<string>;
        }) => { let result = ''; while (true) {
            const chunk = await stream.readString();
            if (!chunk)
                return result;
            if (result.length + chunk.length > 65536)
                throw new Error('NATIVE_OUTPUT_LIMIT');
            result += chunk;
        } };
        const output = readAll(process.stdout), errors = readAll(process.stderr);
        let result: {
            exitCode: number;
        };
        let stdout: string, stderr: string;
        try {
            [result, stdout, stderr] = await Promise.all([process.wait(), output, errors]);
        }
        catch (error) {
            await process.kill(0);
            throw new Error('NATIVE_COMMAND_FAILED', { cause: error });
        }
        finally {
            g.clearTimeout(timeout);
        }
        if (timedOut)
            throw new Error('NATIVE_COMMAND_TIMEOUT', { cause: { operation: executable, timeout_seconds: 10, exitCode: result.exitCode } });
        if (result.exitCode !== 0)
            throw new Error(`NATIVE_COMMAND_FAILED`, { cause: { operation: executable, exitCode: result.exitCode, reason: stderr.trim() === 'UNSAFE_NATIVE_PATH' ? 'UNSAFE_NATIVE_PATH' : 'OUTPUT_REDACTED' } });
        return stdout;
    }
    async function checkPath(path: string, tree = false) { await command('WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', CHECK_PATH], { EVIDRA_CHECK_PATH: path, EVIDRA_CHECK_TREE: tree ? '1' : '0' }); }
    const io: PackageIO = {
        join: g.PathUtils.join.bind(g.PathUtils),
        readJson: async (path) => { await checkPath(path); if ((await g.IOUtils.stat(path)).size > 4000000)
            throw new Error('MANIFEST_TOO_LARGE'); return g.IOUtils.readJSON(path); },
        hashText: async (text) => Array.from(new Uint8Array(await g.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join(''),
        hashFile: async (path) => { const before = await g.IOUtils.stat(path); if (before.type !== 'regular')
            throw new Error('UNSAFE_PAYLOAD_PATH'); const sha256 = await g.IOUtils.computeHexDigest(path, 'sha256'); const after = await g.IOUtils.stat(path); if (before.size !== after.size || before.lastModified !== after.lastModified || before.creationTime !== after.creationTime)
            throw new Error('PAYLOAD_CHANGED_DURING_HASH'); return { sha256, size: after.size }; },
        listFiles: async (root) => { await checkPath(root, true); const files: string[] = []; async function walk(dir: string, prefix: string) { for (const path of await g.IOUtils.getChildren(dir)) {
            const name = g.PathUtils.filename(path);
            const info = await g.IOUtils.stat(path);
            if (info.type === 'directory')
                await walk(path, prefix + name + '/');
            else if (info.type === 'regular') {
                if (prefix || name !== 'engine-manifest.json')
                    files.push(prefix + name);
            }
            else
                throw new Error('UNSAFE_PAYLOAD_PATH');
            if (files.length > 10000)
                throw new Error('PAYLOAD_TOO_LARGE');
        } } await walk(root, ''); return files; }
    };
    async function start(root: string, profile: string): Promise<OwnedSession> {
        const data = g.PathUtils.join(local!, 'Evidra', 'profiles', profile);
        await g.IOUtils.makeDirectory(data);
        await checkPath(data);
        const session = g.PathUtils.join(data, 'session-' + g.crypto.randomUUID());
        await g.IOUtils.makeDirectory(session, { ignoreExisting: false });
        const sidOutput = await command('whoami.exe', ['/user', '/fo', 'csv', '/nh']);
        const sids = sidOutput.match(/S-1-\d+(?:-\d+)+/g);
        if (sids?.length !== 1)
            throw new Error('WINDOWS_SID_UNAVAILABLE');
        await command('icacls.exe', [session, '/inheritance:r', '/grant:r', `*${sids[0]}:(OI)(CI)F`]);
        const token = Array.from(g.crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
        const handshake = g.PathUtils.join(session, 'handshake.json'), temporary = g.PathUtils.join(session, 'handshake.tmp'), connection = g.PathUtils.join(session, 'connection.json');
        let child: NativeProcess | null = null, exited = false, exitCode: number | null = null;
        let startupDiagnostic: unknown = null;
        try {
            await g.IOUtils.writeJSON(handshake, { protocol_version: 1, profile_instance_id: profile, session_token: token, data_dir: data, port: 0, connection_path: connection }, { tmpPath: temporary, mode: 'create' });
            child = await subprocess.call({ command: g.PathUtils.join(root, 'evidra-engine.exe'), arguments: ['serve', '--handshake', handshake], stderr: 'pipe', workdir: root });
            await child.stdin.close();
            // Drain pipes continuously. Only strict structural engine diagnostics are retained.
            const drain = async (stream: {
                readString(length?: number): Promise<string>;
            }, diagnostic: boolean) => { let buffer = ''; while (true) {
                const chunk = await stream.readString();
                if (!chunk)
                    break;
                if (diagnostic && buffer.length < 8192)
                    buffer += chunk.slice(0, 8192 - buffer.length);
            } if (diagnostic)
                startupDiagnostic = parseEngineDiagnostic(buffer); };
            const drains = Promise.all([drain(child.stdout, false), drain(child.stderr, true)]);
            const completion = child.wait().then(async (result) => { exited = true; exitCode = result.exitCode; await drains; });
            const deadline = Date.now() + 15000;
            while (!await g.IOUtils.exists(connection)) {
                if (exited) {
                    await completion;
                    throw new Error('ENGINE_EXITED', { cause: { exitCode, diagnostic: startupDiagnostic } });
                }
                if (Date.now() >= deadline)
                    throw new Error('ENGINE_START_TIMEOUT');
                await new Promise(resolve => g.setTimeout(resolve, 100));
            }
            await checkPath(connection);
            const receipt = await g.IOUtils.readJSON(connection);
            if (exited)
                throw new Error('ENGINE_EXITED', { cause: { exitCode, diagnostic: startupDiagnostic } });
            const owned = child;
            let stopped = false;
            return { receipt, token, stop: async () => { if (stopped)
                    return; stopped = true; if (!exited)
                    await owned.kill(5000); await completion; } };
        }
        catch (error) {
            if (child && !exited)
                await child.kill(5000);
            throw new Error(error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : 'ENGINE_START_FAILED', { cause: error });
        }
        finally {
            for (const path of [handshake, temporary]) {
                if (await g.IOUtils.exists(path))
                    await g.IOUtils.remove(path);
            }
        }
    }
    return { verify: root => verifyPackage(root, io), start, fetch: g.fetch.bind(g), every: (fn, ms) => { const timer = g.setInterval(fn, ms); return () => g.clearInterval(timer); }, reportError: error => g.Zotero.logError(new Error(JSON.stringify(nativeDiagnostic(error)))) };
}
