import type { components } from '../../../../packages/contracts/generated/api';
export type Notebook = components['schemas']['Notebook'];
export type NotebookPage = components['schemas']['NotebookPage'];
export type NotebookCreate = components['schemas']['NotebookCreate'];
export type EngineManifest = components['schemas']['EngineManifest'];
export type RuntimeStatus = components['schemas']['RuntimeStatus'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type Locale = 'pt-BR' | 'en-US';
export type Theme = 'system' | 'light' | 'dark';
export type Mode = 'LOCAL' | 'API';
export interface EnginePreview {
    fingerprint: string;
    version: string;
    files: number;
    consentRequired: boolean;
}
export interface BridgeStatus {
    state: 'stopped' | 'running' | 'starting' | 'failed';
    version: string;
    locale: Locale;
    theme: Theme;
    mode: Mode;
    selected: Notebook | null;
    engine: EnginePreview | null;
    error: string | null;
}
export type UiMessage = {
    op: 'status' | 'engine.choose' | 'engine.verify' | 'workspace.close' | 'workspace.open';
} | {
    op: 'engine.start';
    fingerprint: string;
    consent: true;
} | {
    op: 'notebook.list';
    offset: number;
} | ({
    op: 'notebook.create';
} & NotebookCreate) | {
    op: 'notebook.select';
    id: string;
} | {
    op: 'preferences';
    locale: Locale;
    theme: Theme;
    mode: Mode;
};
export interface UiBridge {
    request(message: UiMessage): Promise<unknown>;
}
