/** Narrow declarations checked against Zotero 10.0.1 / Gecko 140 source. */
export interface NativeFile {
    path: string;
}
export interface NativeProcess {
    stdout: {
        readString(length?: number): Promise<string>;
    };
    stderr: {
        readString(length?: number): Promise<string>;
    };
    stdin: {
        close(): Promise<void>;
    };
    wait(): Promise<{
        exitCode: number;
    }>;
    kill(timeout?: number): Promise<{
        exitCode: number;
    }>;
}
export interface NativeSubprocess {
    getEnvironment(): Record<string, string>;
    call(options: {
        command: string;
        arguments: string[];
        stderr: 'pipe';
        workdir?: string;
        environment?: Record<string, string>;
        environmentAppend?: boolean;
    }): Promise<NativeProcess>;
}
export interface NativeIO {
    readJSON(path: string): Promise<unknown>;
    writeJSON(path: string, value: unknown, options: {
        tmpPath: string;
        mode: 'create';
    }): Promise<void>;
    readUTF8(path: string): Promise<string>;
    stat(path: string): Promise<{
        type: 'regular' | 'directory' | 'other';
        size: number;
        lastModified: number;
        creationTime: number;
    }>;
    getChildren(path: string): Promise<string[]>;
    makeDirectory(path: string, options?: {
        ignoreExisting?: boolean;
        createAncestors?: boolean;
    }): Promise<void>;
    exists(path: string): Promise<boolean>;
    remove(path: string, options?: {
        ignoreAbsent?: boolean;
        recursive?: boolean;
    }): Promise<void>;
    computeHexDigest(path: string, method: 'sha256'): Promise<string>;
}
export interface NativePicker {
    init(window: Window, title: string, mode: number): void;
    appendFilter(title: string, filter: string): void;
    show(): Promise<number>;
    file: string;
    modeOpen: number;
    returnOK: number;
}
export interface NativeZotero {
    version: string;
    isWin: boolean;
    initializationPromise: Promise<void>;
    Prefs: {
        get(key: string, global: boolean): unknown;
        set(key: string, value: string, global: boolean): void;
        clear(key: string, global: boolean): void;
    };
    getMainWindows(): Window[];
    getMainWindow(): Window | null;
    MenuManager: {
        registerMenu(options: {
            menuID: string;
            pluginID: string;
            target: string;
            menus: {
                menuType: 'menuitem';
                l10nID: string;
                onCommand: (event: Event, context: {
                    window: Window;
                }) => void;
            }[];
        }): string | false;
        unregisterMenu(id: string): boolean;
    };
    ItemPaneManager: {
        registerSection(options: {
            paneID: string;
            pluginID: string;
            header: {
                l10nID: string;
                icon: string;
            };
            sidenav: {
                l10nID: string;
                icon: string;
            };
            onRender: (args: {
                doc: Document;
                body: HTMLElement;
            }) => void;
            onDestroy: (args: {
                body: HTMLElement;
            }) => void;
        }): string | false;
        unregisterSection(id: string): boolean;
    };
    logError(error: unknown): void;
}
export interface NativeServices {
    appinfo: {
        OS: string;
        XPCOMABI: string;
    };
    dirsvc: {
        get(key: string, type: unknown): NativeFile;
    };
    scriptloader: {
        loadSubScript(url: string, scope: object): void;
    };
}
export interface NativeGlobals {
    Zotero: NativeZotero;
    Services: NativeServices;
    IOUtils: NativeIO;
    PathUtils: {
        join(...paths: string[]): string;
        parent(path: string): string;
        filename(path: string): string;
    };
    ChromeUtils: {
        importESModule(uri: string): Record<string, unknown>;
    };
    Ci: {
        nsIFile: unknown;
    };
    crypto: Crypto;
    fetch: typeof fetch;
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    setInterval: typeof setInterval;
    clearInterval: typeof clearInterval;
}
