import { ZoteroBridge } from '../bridge/zotero';
import type { NativeGlobals } from '../bridge/native-types';
import { catalog } from '../ui/i18n';
import { nativeDiagnostic } from '../security/diagnostics';
const HTML = 'http://www.w3.org/1999/xhtml';
export class Lifecycle {
    #g: NativeGlobals;
    #bridge: ZoteroBridge;
    #windows = new Map<Window, () => void>();
    #dialogs = new Map<Window, HTMLDialogElement>();
    #sections = new Map<HTMLElement, () => void>();
    #menu: string | null = null;
    #section: string | null = null;
    #active = false;
    #dialogCleanup = new Map<Window, () => void>();
    constructor(globals: NativeGlobals) { this.#g = globals; this.#bridge = new ZoteroBridge(globals, window => this.open(window)); }
    async startup() {
        await this.#g.Zotero.initializationPromise;
        await this.#bridge.initialize();
        this.#active = true;
        try {
            for (const window of this.#g.Zotero.getMainWindows())
                this.addWindow(window);
            const menu = this.#g.Zotero.MenuManager.registerMenu({ menuID: 'evidra-workspace', pluginID: 'evidra@evidra.local', target: 'main/menubar/tools', menus: [{ menuType: 'menuitem', l10nID: 'evidra-open-workspace', onCommand: (event, context) => { const window = context.window ?? (event.target as Node).ownerDocument?.defaultView; if (window)
                            this.open(window); } }] });
            if (!menu)
                throw new Error('MENU_REGISTRATION_FAILED');
            this.#menu = menu;
            const section = this.#g.Zotero.ItemPaneManager.registerSection({ paneID: 'evidra-notebooks', pluginID: 'evidra@evidra.local', header: { l10nID: 'evidra-section', icon: 'chrome://evidra/content/icon.svg' }, sidenav: { l10nID: 'evidra-section', icon: 'chrome://evidra/content/icon.svg' }, onRender: ({ doc, body }) => { if (this.#sections.has(body) || !doc.defaultView)
                    return; this.#sections.set(body, this.#bridge.mount(body, doc.defaultView, true, () => { })); }, onDestroy: ({ body }) => { this.#sections.get(body)?.(); this.#sections.delete(body); } });
            if (!section)
                throw new Error('SECTION_REGISTRATION_FAILED');
            this.#section = section;
        }
        catch (error) {
            await this.shutdown();
            throw error;
        }
    }
    addWindow(window: Window) {
        if (!this.#active || this.#windows.has(window))
            return;
        const doc = window.document, link = doc.createElementNS(HTML, 'link');
        link.setAttribute('rel', 'localization');
        link.setAttribute('href', 'evidra.ftl');
        doc.documentElement.append(link);
        const style = doc.createElementNS(HTML, 'link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', 'chrome://evidra/content/native.css');
        doc.documentElement.append(style);
        this.#windows.set(window, () => { link.remove(); style.remove(); });
    }
    open(window: Window) {
        if (!this.#active)
            return;
        this.addWindow(window);
        const existing = this.#dialogs.get(window);
        if (existing) {
            existing.focus();
            return;
        }
        const doc = window.document, previous = doc.activeElement as HTMLElement | null;
        const dialog = doc.createElementNS(HTML, 'dialog') as HTMLDialogElement;
        dialog.className = 'evidra-workspace';
        dialog.setAttribute('aria-label', catalog(this.#bridge.locale).reopen);
        doc.documentElement.append(dialog);
        const unmount = this.#bridge.mount(dialog, window, false, () => dialog.close());
        let cleaned = false;
        const cleanup = () => { if (cleaned)
            return; cleaned = true; dialog.removeEventListener('close', cleanup); unmount(); this.#dialogs.delete(window); this.#dialogCleanup.delete(window); dialog.remove(); if (previous?.isConnected)
            previous.focus(); };
        dialog.addEventListener('close', cleanup, { once: true });
        dialog.showModal();
        this.#dialogs.set(window, dialog);
        this.#dialogCleanup.set(window, cleanup);
    }
    removeWindow(window: Window) { this.#bridge.closeWindow(window); this.#dialogs.get(window)?.close(); this.#dialogCleanup.get(window)?.(); for (const [body, cleanup] of this.#sections) {
        if (body.ownerDocument.defaultView === window) {
            cleanup();
            this.#sections.delete(body);
        }
    } this.#windows.get(window)?.(); this.#windows.delete(window); }
    async shutdown() { this.#active = false; for (const window of this.#windows.keys())
        this.removeWindow(window); for (const cleanup of this.#sections.values())
        cleanup(); this.#sections.clear(); if (this.#menu)
        this.#g.Zotero.MenuManager.unregisterMenu(this.#menu); if (this.#section)
        this.#g.Zotero.ItemPaneManager.unregisterSection(this.#section); this.#menu = null; this.#section = null; await this.#bridge.shutdown(); }
}
export function reportNativeError(globals: NativeGlobals, error: unknown) { globals.Zotero.logError(new Error(`Evidra: ${JSON.stringify(nativeDiagnostic(error))}`)); }
