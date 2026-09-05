import { test, expect } from 'vitest';
import { webcrypto } from 'node:crypto';
import { Lifecycle } from '../src/bootstrap/lifecycle';
import { ZoteroBridge } from '../src/bridge/zotero';
import type { NativeGlobals } from '../src/bridge/native-types';
function host() {
    const prefs = new Map<string, string>();
    let profile = 'C:\\isolated\\profile-a';
    const menus = new Set<string>(), sections = new Set<string>();
    const g = { Zotero: { version: '10.0.1', isWin: true, initializationPromise: Promise.resolve(), Prefs: { get: (key: string) => prefs.get(key), set: (key: string, value: string) => prefs.set(key, value), clear: (key: string) => prefs.delete(key) }, getMainWindows: () => [window], getMainWindow: () => window, MenuManager: { registerMenu: () => { menus.add('menu'); return 'menu'; }, unregisterMenu: (id: string) => menus.delete(id) }, ItemPaneManager: { registerSection: () => { sections.add('section'); return 'section'; }, unregisterSection: (id: string) => sections.delete(id) } }, Services: { appinfo: { OS: 'WINNT', XPCOMABI: 'x86_64-msvc' }, dirsvc: { get: () => ({ path: profile }) } }, ChromeUtils: { importESModule: () => ({ Subprocess: { getEnvironment: () => ({ LOCALAPPDATA: 'C:\\isolated\\local', SystemRoot: 'C:\\Windows' }) } }) }, PathUtils: { join: (...paths: string[]) => paths.join('\\') }, Ci: { nsIFile: {} }, crypto: webcrypto, fetch: globalThis.fetch, setTimeout, clearTimeout, setInterval, clearInterval } as unknown as NativeGlobals;
    return { g, prefs, menus, sections, changeProfile: () => { profile = 'C:\\isolated\\profile-b'; } };
}
test('shutdown removes dialogs synchronously even when the native close event is queued', async () => {
    const { g, menus, sections } = host();
    const oldShow = HTMLDialogElement.prototype.showModal, oldClose = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    HTMLDialogElement.prototype.close = function () { this.open = false; setTimeout(() => this.dispatchEvent(new Event('close')), 0); };
    const lifecycle = new Lifecycle(g);
    try {
        await lifecycle.startup();
        lifecycle.open(window);
        expect(document.querySelector('dialog iframe')).not.toBeNull();
        await lifecycle.shutdown();
        expect(document.querySelector('dialog')).toBeNull();
        expect(document.querySelector('link[href="evidra.ftl"]')).toBeNull();
        expect(menus.size).toBe(0);
        expect(sections.size).toBe(0);
    }
    finally {
        await lifecycle.shutdown();
        HTMLDialogElement.prototype.showModal = oldShow;
        HTMLDialogElement.prototype.close = oldClose;
        document.querySelectorAll('dialog').forEach(node => node.remove());
    }
});
test('profile identity is stable for reopen and changes when saved preferences are cloned to another profile', async () => {
    const { g, prefs, changeProfile } = host();
    let bridge = new ZoteroBridge(g, () => { });
    await bridge.initialize();
    const first = prefs.get('extensions.evidra.profileInstanceId');
    expect(first).toMatch(/^[a-f0-9-]{36}$/);
    await bridge.shutdown();
    bridge = new ZoteroBridge(g, () => { });
    await bridge.initialize();
    expect(prefs.get('extensions.evidra.profileInstanceId')).toBe(first);
    await bridge.shutdown();
    changeProfile();
    bridge = new ZoteroBridge(g, () => { });
    await bridge.initialize();
    expect(prefs.get('extensions.evidra.profileInstanceId')).not.toBe(first);
    await bridge.shutdown();
});
test('saved-package verification records safe causal diagnostics while the UI receives only the public failure code', async () => {
    const { g, prefs } = host();
    const logs: Error[] = [];
    g.Zotero.logError = error => logs.push(error as Error);
    let bridge = new ZoteroBridge(g, () => {});
    await bridge.initialize(); await bridge.shutdown();
    prefs.set('extensions.evidra.engineRoot', 'C:\\private\\package');
    const token = 'f'.repeat(64);
    const filesystemCause = Object.assign(new Error(`C:\\private\\package ${token}`), { name: 'PermissionError', errno: 13, winerror: 5, path: 'C:\\private\\package', token });
    g.ChromeUtils.importESModule = () => ({ Subprocess: {
        getEnvironment: () => ({ LOCALAPPDATA: 'C:\\isolated\\local', SystemRoot: 'C:\\Windows' }),
        call: async () => { throw new Error('NATIVE_COMMAND_FAILED', { cause: filesystemCause }); }
    } });
    bridge = new ZoteroBridge(g, () => {});
    try {
        await bridge.initialize();
        const status = await bridge.dispatch({ op: 'status' }, window, () => {});
        expect(status).toMatchObject({ error: 'NATIVE_COMMAND_FAILED' });
        expect(logs).toHaveLength(1);
        expect(JSON.parse(logs[0]!.message)).toMatchObject({ causes: [{ code: 'NATIVE_COMMAND_FAILED' }, { type: 'PermissionError', errno: 13, winerror: 5 }] });
        expect(logs[0]!.message).not.toContain(token);
        expect(logs[0]!.message).not.toContain('private');
        expect(JSON.stringify(status)).not.toContain(token);
    }
    finally { await bridge.shutdown(); }
});
