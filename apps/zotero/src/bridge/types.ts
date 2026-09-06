import type { components } from '../../../../packages/contracts/generated/api';
export type Notebook = components['schemas']['Notebook'];
export type NotebookPage = components['schemas']['NotebookPage'];
export type NotebookCreate = components['schemas']['NotebookCreate'];
export type EngineManifest = components['schemas']['EngineManifest'];
export type RuntimeStatus = components['schemas']['RuntimeStatus'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type SourceInput = components['schemas']['SourceInput'];
export type SourceSync = components['schemas']['SourceSync'];
export type Source = components['schemas']['Source'];
export type SourceIdentity = components['schemas']['SourceIdentity'];
export type SourceContent = components['schemas']['SourceContent'];
export type SourcePage = components['schemas']['SourcePage'];
export type SelectionSpec = components['schemas']['SelectionSpec'];
export type Selector = components['schemas']['Selector'];
export type PreviewPage = components['schemas']['PreviewPage'];
export type Snapshot = components['schemas']['Snapshot'];
export type SnapshotPage = components['schemas']['SnapshotPage'];
export type SnapshotSourcePage = components['schemas']['SnapshotSourcePage'];
export type IdentityPage = components['schemas']['IdentityPage'];
export type SnapshotCreate = components['schemas']['SnapshotCreate'];
export type AttachmentRole = components['schemas']['AttachmentRole'];
export type SourceChange = components['schemas']['SourceChange'];
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
} | {
    op: 'sources.state';
} | {
    op: 'sources.history'; notebook_id: string; offset: number;
} | {
    op: 'sources.read'; notebook_id: string; snapshot_id: string; offset: number;
} | {
    op: 'sources.preview'; notebook_id: string; selection: SelectionSpec; capture: boolean;
} | {
    op: 'sources.preview.page'; notebook_id: string; preview_id: string; offset: number;
} | {
    op: 'sources.create'; notebook_id: string; request: SnapshotCreate;
} | {
    op: 'sources.revoke'; notebook_id: string; source_id: string; expected_revision: number;
};
export interface UiBridge {
    request(message: UiMessage): Promise<unknown>;
}
