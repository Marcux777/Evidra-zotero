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
    read(path: string, options?: { offset?: number; maxBytes?: number }): Promise<Uint8Array<ArrayBuffer>>;
    write(path: string, data: Uint8Array<ArrayBuffer>, options: { mode: 'create' | 'overwrite'; tmpPath?: string }): Promise<number>;
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
    modeSave: number;
    returnReplace: number;
    defaultString: string;
}
export interface NativeCreator {
    firstName?: string;
    lastName: string;
    fieldMode: number;
    creatorTypeID: number;
}
export interface NativeExportTranslation {
    getTranslators(): Promise<{ translatorID: string }[]>;
    setItems(items: NativeSourceItem[]): void;
    setTranslator(id: string): boolean;
    setDisplayOptions(options: { exportNotes: false; exportFileData: false; exportTags: false; includeAnnotations: false; exportCharset: 'UTF-8' }): void;
    setHandler(type: 'itemDone' | 'error', handler: (translation: NativeExportTranslation, value: unknown) => void): void;
    translate(): Promise<unknown>;
    string: string;
}
export interface NativeZotero {
    Item: new (type: string) => NativeSourceItem & {
        setField(field: string | number, value: string | number): boolean;
        setCreators(creators: NativeCreator[]): void;
        setNote(html: string): void;
        addTag(tag: string): void;
        saveTx(): Promise<number | boolean>;
    };
    ItemFields: { getName(id: number): string };
    URI: { getItemURI(item: NativeSourceItem): string };
    Translate: { Export: new () => NativeExportTranslation };
    EditorInstanceUtilities: {
        _transformTextToHTML(text: string): string;
    };
    Reader: {
        open(itemID: number, location?: NativeReaderLocation, options?: { openInWindow: boolean }): Promise<NativeReader | undefined>;
        getByTabID(tabID: string): NativeReader | undefined;
    };
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
    Libraries: NativeSourceAPI['Libraries'];
    Items: NativeSourceAPI['Items'];
    Collections: NativeSourceAPI['Collections'];
    Searches: NativeSourceAPI['Searches'];
    ItemTypes: NativeSourceAPI['ItemTypes'];
    Search: NativeSourceAPI['Search'];
    Notifier: {
        registerObserver(observer: { notify(event: string, type: string, ids: (string | number)[], extraData: Record<string, unknown>): Promise<void> }, types: string[], id: string): string;
        unregisterObserver(id: string): void;
    };
}

/** Read-only source APIs from Zotero 10.0.1. No editing or direct database calls. */
export interface NativeSourceItem {
    id: number;
    key: string;
    libraryID: number;
    parentID: number | false;
    parentKey: string | false;
    itemTypeID: number;
    version: number;
    deleted: boolean;
    attachmentContentType: string;
    attachmentPath: string;
    attachmentLinkMode: number;
    attachmentCharset: string | null;
    attachmentSyncState: number;
    attachmentSyncedModificationTime: number | null;
    attachmentSyncedHash: string | null;
    attachmentLastProcessedModificationTime: number | null;
    attachmentLastRead: number | null;
    isRegularItem(): boolean;
    isAttachment(): boolean;
    isNote(): boolean;
    isAnnotation(): boolean;
    isFileAttachment(): boolean;
    isPDFAttachment(): boolean;
    getField(name: string | number, unformatted?: boolean): string | number;
    getUsedFields(): number[];
    getCreators(): NativeCreator[];
    getTags(): { tag: string }[];
    getAttachments(includeTrashed?: boolean): number[];
    getNotes(includeTrashed?: boolean): number[];
    getAnnotations(includeTrashed?: boolean): NativeSourceItem[];
    getNote(): string;
    annotationText: string;
    annotationComment: string;
    getFilePath(): string | false;
    getFilePathAsync(): Promise<string | false>;
    loadAllData(): Promise<void>;
}
export interface NativeReaderLocation {
    pageIndex?: number;
    position?: { pageIndex: number; rects: number[][] };
}
export interface NativePDFProxy {
    getDownloadInfo(): Promise<{ length: number }>;
    getData(): Promise<Uint8Array<ArrayBuffer>>;
}
export interface NativePDFView {
    initializedPromise: Promise<void>;
    _iframeWindow?: { PDFViewerApplication?: { pdfDocument: NativePDFProxy | null } };
}
export interface NativeReader {
    itemID: number;
    _initPromise: Promise<void>;
    _internalReader: { _lastView: NativePDFView };
    navigate(location: NativeReaderLocation): Promise<void>;
}
export interface NativeSourceCollection {
    id: number;
    key: string;
    libraryID: number;
    deleted: boolean;
    loadAllData(): Promise<void>;
    getChildItems(asIDs: true, includeTrashed?: boolean): number[];
    getDescendents(nested: false, type: 'item', includeTrashed?: boolean): { id: number; type: string }[];
}
export interface NativeSourceSearch {
    key: string;
    libraryID: number;
    loadAllData(): Promise<void>;
    search(): Promise<number[]>;
}
export interface NativeSourceAPI {
    Libraries: {
        exists(id: number): boolean;
        get(id: number): { libraryID: number; libraryType: string; libraryTypeID: number | null; groupID?: number; archived?: boolean; editable: boolean; filesEditable: boolean };
    };
    Items: {
        get(id: number): NativeSourceItem | false;
        getAsync(id: number): Promise<NativeSourceItem | false>;
        getByLibraryAndKeyAsync(library: number, key: string): Promise<NativeSourceItem | false>;
    };
    Collections: { getByLibraryAndKeyAsync(library: number, key: string): Promise<NativeSourceCollection | false> };
    Searches: { getByLibraryAndKeyAsync(library: number, key: string): Promise<NativeSourceSearch | false> };
    ItemTypes: { getName(id: number): string };
    Search: new () => { libraryID: number; addCondition(name: string, operator: string, value?: string): void; search(): Promise<number[]> };
}
export interface NativeSourcePane {
    getCollectionTreeRows(): { ref: { libraryID: number }; isLibrary(includeGroups: true): boolean }[];
    getSelectedLibraryIDs(): number[];
    getSelectedCollections(): NativeSourceCollection[];
    getSelectedSavedSearches(): NativeSourceSearch[];
    getSelectedItems(): NativeSourceItem[];
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
    plainText(html: string): string;
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
