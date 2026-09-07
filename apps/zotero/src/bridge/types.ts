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
export type SourceAccess = components['schemas']['SourceAccess'];
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
export type DocumentCommand = components['schemas']['DocumentCommand'];
export type ConversationCommand = components['schemas']['ConversationCommand'];
export type MatrixCommand = components['schemas']['MatrixCommand'];
export type JobCommand = components['schemas']['JobCommand'];
export type ResearchCommand = components['schemas']['ResearchCommand'];
export type McpCommand = components['schemas']['McpCommand'];
export type ExportCommand = components['schemas']['ExportCommand'];
export type ExportOptions = components['schemas']['ExportOptions'];
export type ExportPreview = components['schemas']['ExportPreview'];
export type ExportArtifact = components['schemas']['ExportArtifact'];
export type ExportData = components['schemas']['ExportData'];
export type UploadReceipt = components['schemas']['UploadReceipt'];
export type ImportPreview = components['schemas']['ImportPreview'];
export type ImportSourcePage = components['schemas']['ImportSourcePage'];
export type ImportMappingState = components['schemas']['ImportMappingState'];
export type ImportedNotebook = components['schemas']['ImportedNotebook'];
export type ImportedRecordPage = components['schemas']['ImportedRecordPage'];
export type ImportedRecord = ImportedRecordPage['items'][number];
export type ImportedRecordDetail = components['schemas']['ImportedRecordDetail'];
export type ImportVisibility = components['schemas']['ImportVisibility'];
export type ImportPage = components['schemas']['ImportPage'];
export type McpSetup = components['schemas']['McpSetup'];
export type ConnectionPage = components['schemas']['ConnectionPage'];
export type ExternalNote = components['schemas']['ExternalNote'];
export type ExternalNotePage = components['schemas']['ExternalNotePage'];
export type ProtocolVersion = components['schemas']['ProtocolVersion'];
export type ProtocolWrite = components['schemas']['ProtocolWrite'];
export type ProtocolPage = components['schemas']['ProtocolPage'];
export type Criterion = components['schemas']['Criterion'];
export type ScreeningWrite = components['schemas']['ScreeningWrite'];
export type ScreeningPage = components['schemas']['ScreeningPage'];
export type ResearchRun = components['schemas']['ResearchRun'];
export type ResearchRunPage = components['schemas']['ResearchRunPage'];
export type ResearchPrepare = components['schemas']['ResearchPrepare'];
export type ResearchPreview = components['schemas']['ResearchPreview'];
export type ResearchControl = components['schemas']['ResearchControl'];
export type ResearchAccessPage = components['schemas']['ResearchAccessPage'];
export type ArtifactVersion = components['schemas']['ArtifactVersion'];
export type ArtifactReview = components['schemas']['ArtifactReview'];
export type ArtifactPage = components['schemas']['ArtifactPage'];
export type NotePreview = components['schemas']['NotePreview'];
export type NotePreviewWrite = components['schemas']['NotePreviewWrite'];
export type ApprovedWriteOutbox = components['schemas']['ApprovedWriteOutbox'];
export type OutboxBegin = components['schemas']['OutboxBegin'];
export type OutboxPage = components['schemas']['OutboxPage'];
export type JobRecord = components['schemas']['JobRecord'];
export type JobWrite = components['schemas']['JobWrite'];
export type JobControl = components['schemas']['JobControl'];
export type JobPage = components['schemas']['JobPage'];
export type UnitRecord = components['schemas']['UnitRecord'];
export type UnitPage = components['schemas']['UnitPage'];
export type BatchPreview = components['schemas']['BatchPreview'];
export type JobAccessPage = components['schemas']['JobAccessPage'];
export type FormVersion = components['schemas']['FormVersion'];
export type FormPage = components['schemas']['FormPage'];
export type FieldDefinition = components['schemas']['FieldDefinition'];
export type MatrixCell = components['schemas']['MatrixCell'];
export type MatrixPage = components['schemas']['MatrixPage'];
export type MatrixQuery = components['schemas']['MatrixQuery'];
export type ExtractionProposal = components['schemas']['ExtractionProposal'];
export type ProposalPage = components['schemas']['ProposalPage'];
export type DecisionPage = components['schemas']['DecisionPage'];
export type DecisionWrite = components['schemas']['DecisionWrite'];
export type BulkPreview = components['schemas']['BulkPreview'];
export type ProviderCommand = components['schemas']['ProviderCommand'];
export type ConversationRecord = components['schemas']['ConversationRecord'];
export type ConversationPage = components['schemas']['ConversationPage'];
export type RunRecord = components['schemas']['RunRecord'];
export type RunPrepare = components['schemas']['RunPrepare'];
export type RunPage = components['schemas']['RunPage'];
export type EventPage = components['schemas']['EventPage'];
export type ProviderProfile = components['schemas']['ProviderProfile'];
export type ProfileSpec = components['schemas']['ProfileSpec'];
export type ProfilePage = components['schemas']['ProfilePage'];
export type ModelPage = components['schemas']['ModelPage'];
export type ProviderSettings = components['schemas']['Settings'];
export type Consent = components['schemas']['Consent'];
export type SecretReceipt = components['schemas']['SecretReceipt'];
export type UsagePage = components['schemas']['UsagePage'];
export type BudgetWrite = components['schemas']['BudgetWrite'];
export type Budget = components['schemas']['Budget'];
export type PriceConfig = components['schemas']['PriceConfig'];
export type VectorJob = components['schemas']['VectorJob'];
export type DocumentPage = components['schemas']['DocumentPage'];
export type DocumentStatus = components['schemas']['DocumentStatus'];
export type RegisteredDocument = components['schemas']['RegisteredDocument'];
export type DocumentOperation = components['schemas']['Operation'];
export type Evidence = components['schemas']['Evidence'];
export type EvidenceTextView = components['schemas']['EvidenceTextView'];
export type OriginalViewChunk = components['schemas']['OriginalViewChunk'];
export type OriginalStructure = components['schemas']['OriginalStructure'];
export type SearchPage = components['schemas']['SearchPage'];
export type ParserLimits = components['schemas']['ParserLimits'];
export type PagePreview = components['schemas']['PagePreview'];
export type PagePreviewRequest = components['schemas']['PagePreviewRequest'];
export type TextStage = components['schemas']['TextStage'];
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
} | DocumentCommand | ConversationCommand | ProviderCommand | MatrixCommand | JobCommand | ResearchCommand | McpCommand | ExportCommand;
export interface UiBridge {
    request(message: UiMessage): Promise<unknown>;
}
