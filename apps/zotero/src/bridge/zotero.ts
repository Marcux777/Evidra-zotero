import { EngineController } from '../bootstrap/engine';
import { nativeEngine } from '../bootstrap/native-engine';
import { isUiEvent, parseUiMessage } from '../security/messages';
import { nativeDiagnostic } from '../security/diagnostics';
import { catalog } from '../ui/i18n';
import type { NativeGlobals, NativePicker } from './native-types';
import type { BridgeStatus, Locale, Mode, Notebook, Theme, UiMessage } from './types';
const PREFIX = 'extensions.evidra.';
export class ZoteroBridge {
    #g: NativeGlobals;
    #engine: EngineController | null = null;
    #profile = '';
    #setupError: string | null = null;
    #frames = new Set<() => void>();
    #open: (window: Window) => void;
    constructor(globals: NativeGlobals, open: (window: Window) => void) { this.#g = globals; this.#open = open; }
    pref(key: string): string | null { const value = this.#g.Zotero.Prefs.get(PREFIX + key, true); return typeof value === 'string' ? value : null; }
    #set(key: string, value: string) { this.#g.Zotero.Prefs.set(PREFIX + key, value, true); }
    get locale(): Locale { return this.pref('locale') === 'en-US' ? 'en-US' : 'pt-BR'; }
    async initialize() {
        const g = this.#g;
        if (!g.Zotero.isWin || g.Services.appinfo.OS !== 'WINNT' || !g.Services.appinfo.XPCOMABI.startsWith('x86_64-'))
            throw new Error('UNSUPPORTED_PLATFORM');
        if (!/^10\.0\.(?:[1-9]\d*)$/.test(g.Zotero.version))
            throw new Error('UNSUPPORTED_ZOTERO_VERSION');
        // Bind the random identity to the actual profile, so cloned preference files cannot reuse it.
        const path = g.Services.dirsvc.get('ProfD', g.Ci.nsIFile).path;
        const binding = Array.from(new Uint8Array(await g.crypto.subtle.digest('SHA-256', new TextEncoder().encode(path.toLowerCase()))), b => b.toString(16).padStart(2, '0')).join('');
        const saved = this.pref('profileInstanceId');
        if (this.pref('profileBinding') !== binding || !saved || !/^[a-f0-9-]{36}$/.test(saved)) {
            this.#profile = g.crypto.randomUUID();
            this.#set('profileInstanceId', this.#profile);
            this.#set('profileBinding', binding);
            g.Zotero.Prefs.clear(PREFIX + 'selectedNotebook', true);
            g.Zotero.Prefs.clear(PREFIX + 'engineRoot', true);
        }
        else
            this.#profile = saved;
        this.#engine = new EngineController(nativeEngine(g), this.#profile);
        const root = this.pref('engineRoot');
        if (root) {
            try {
                await this.#engine.choose(root);
            }
            catch (error) {
                this.#g.Zotero.logError(new Error(JSON.stringify(nativeDiagnostic(error))));
                this.#setupError = publicCode(error);
            }
        }
    }
    async dispatch(message: UiMessage, window: Window, close: () => void): Promise<unknown> {
        const engine = this.#engine;
        if (!engine)
            throw new Error('BRIDGE_NOT_READY');
        switch (message.op) {
            case 'status': {
                let selected: Notebook | null = null;
                const id = this.pref('selectedNotebook');
                if (id && engine.view().state === 'running')
                    selected = await engine.request('GET', `/v1/notebooks/${id}`) as Notebook;
                const theme = this.pref('theme'), mode = this.pref('mode');
                return { ...engine.view(), version: this.#g.Zotero.version, locale: this.locale, theme: theme === 'light' || theme === 'dark' ? theme : 'system', mode: mode === 'API' ? 'API' : 'LOCAL', selected, error: this.#setupError ?? engine.view().error } satisfies BridgeStatus;
            }
            case 'engine.choose': {
                const Picker = this.#g.ChromeUtils.importESModule('chrome://zotero/content/modules/filePicker.mjs').FilePicker as new () => NativePicker;
                const picker = new Picker();
                picker.init(window, catalog(this.locale).choose, picker.modeOpen);
                picker.appendFilter('engine-manifest.json', 'engine-manifest.json');
                if (await picker.show() !== picker.returnOK)
                    return null;
                if (this.#g.PathUtils.filename(picker.file) !== 'engine-manifest.json')
                    throw new Error('INVALID_MANIFEST_FILENAME');
                const root = this.#g.PathUtils.parent(picker.file);
                const result = await engine.choose(root);
                this.#set('engineRoot', root);
                this.#setupError = null;
                return result;
            }
            case 'engine.verify': return engine.verify();
            case 'engine.start':
                await engine.start(message.fingerprint, message.consent);
                this.#setupError = null;
                return engine.view();
            case 'notebook.list': return engine.request('GET', `/v1/notebooks?offset=${message.offset}&limit=50`);
            case 'notebook.create': return engine.request('POST', '/v1/notebooks', { name: message.name, idempotency_key: message.idempotency_key });
            case 'notebook.select': {
                const notebook = await engine.request('GET', `/v1/notebooks/${message.id}`) as Notebook;
                this.#set('selectedNotebook', notebook.id);
                return notebook;
            }
            case 'preferences':
                this.#set('locale', message.locale);
                this.#set('theme', message.theme);
                this.#set('mode', message.mode);
                return null;
            case 'workspace.open':
                this.#open(this.#g.Zotero.getMainWindow() ?? window);
                return null;
            case 'workspace.close':
                close();
                return null;
        }
    }
    mount(parent: HTMLElement, window: Window, compact: boolean, close: () => void): () => void {
        const iframe = window.document.createElementNS('http://www.w3.org/1999/xhtml', 'iframe') as HTMLIFrameElement;
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('title', 'Evidra');
        iframe.style.cssText = 'inline-size:100%;block-size:100%;min-block-size:28rem;border:0;';
        iframe.src = `chrome://evidra/content/ui.html${compact ? '?surface=reader' : ''}`;
        let active = true;
        let frameWindow: Window | null = null;
        const pending = new Set<string>();
        const listener = (event: MessageEvent) => {
            if (!active || !event.isTrusted || !isUiEvent(event, frameWindow) || typeof event.data !== 'string' || event.data.length > 16384)
                return;
            let envelope: {
                channel?: unknown;
                id?: unknown;
                request?: unknown;
            };
            try {
                envelope = JSON.parse(event.data) as typeof envelope;
            }
            catch {
                return;
            }
            if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope) || envelope.channel !== 'evidra-ui-v1' || typeof envelope.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(envelope.id) || Object.keys(envelope).sort().join(',') !== 'channel,id,request' || pending.has(envelope.id) || pending.size >= 16)
                return;
            const id = envelope.id;
            pending.add(id);
            const send = (result: unknown, error: string | null) => { pending.delete(id); if (active)
                frameWindow?.postMessage(JSON.stringify({ channel: 'evidra-ui-v1', id, result, error }), '*'); };
            void Promise.resolve().then(() => this.dispatch(parseUiMessage(envelope.request), window, close)).then(value => send(value, null), error => { this.#g.Zotero.logError(new Error(JSON.stringify(nativeDiagnostic(error)))); send(null, publicCode(error)); });
        };
        const loaded = (event: Event) => {
            if (!active || event.target !== iframe || frameWindow) return;
            frameWindow = iframe.contentWindow;
            if (!frameWindow) return;
            frameWindow.addEventListener('message', listener);
            frameWindow.postMessage(JSON.stringify({ channel: 'evidra-ui-v1', ready: true }), '*');
        };
        // Opt in to the owned content frame's load event in privileged Gecko.
        const addLoadListener = iframe.addEventListener as (type: string, listener: EventListener, options: AddEventListenerOptions, wantsUntrusted: boolean) => void;
        addLoadListener.call(iframe, 'load', loaded, { once: true }, true);
        parent.append(iframe);
        const cleanup = () => { active = false; pending.clear(); iframe.removeEventListener('load', loaded); frameWindow?.removeEventListener('message', listener); frameWindow = null; iframe.remove(); this.#frames.delete(cleanup); };
        this.#frames.add(cleanup);
        return cleanup;
    }
    async shutdown() { for (const cleanup of this.#frames)
        cleanup(); await this.#engine?.stop(); this.#engine = null; }
}
export function publicCode(error: unknown): string { return error instanceof Error && /^[A-Z_]{1,80}$/.test(error.message) ? error.message : 'OPERATION_FAILED'; }
