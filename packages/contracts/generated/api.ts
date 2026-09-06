export interface paths {
    "/v1/notebooks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Notebooks */
        get: operations["list_notebooks_v1_notebooks_get"];
        put?: never;
        /** Create Notebook */
        post: operations["create_notebook_v1_notebooks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Notebook */
        get: operations["get_notebook_v1_notebooks__notebook_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/sources/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sync Sources */
        post: operations["sync_sources_v1_notebooks__notebook_id__sources_sync_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/invalidate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Invalidate Sources */
        post: operations["invalidate_sources_v1_sources_invalidate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/sources/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Preview Selection */
        post: operations["preview_selection_v1_notebooks__notebook_id__sources_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/sources/previews/{preview_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Preview */
        get: operations["read_preview_v1_notebooks__notebook_id__sources_previews__preview_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Snapshots */
        get: operations["list_snapshots_v1_notebooks__notebook_id__snapshots_get"];
        put?: never;
        /** Create Snapshot */
        post: operations["create_snapshot_v1_notebooks__notebook_id__snapshots_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Sources */
        get: operations["read_sources_v1_notebooks__notebook_id__snapshots__snapshot_id__sources_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/identities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Source Identities */
        get: operations["source_identities_v1_notebooks__notebook_id__snapshots__snapshot_id__identities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/sources/{source_id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke Source */
        post: operations["revoke_source_v1_notebooks__notebook_id__sources__source_id__revoke_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register Attachment */
        post: operations["register_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/missing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Missing Attachment */
        post: operations["missing_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_missing_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Documents */
        get: operations["list_documents_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/ingest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest Document */
        post: operations["ingest_document_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_ingest_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/operations/{operation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Operation */
        get: operations["read_operation_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/operations/{operation_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel Operation */
        post: operations["cancel_operation_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/evidence/{evidence_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Evidence */
        get: operations["read_evidence_v1_notebooks__notebook_id__snapshots__snapshot_id__evidence__evidence_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify Evidence File */
        post: operations["verify_evidence_file_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search */
        post: operations["search_v1_notebooks__notebook_id__snapshots__snapshot_id__search_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/text": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Stage Text */
        post: operations["stage_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/text/{stage_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Append Text */
        post: operations["append_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text__stage_id__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Render Preview */
        post: operations["render_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/operations/{operation_id}/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Preview */
        get: operations["read_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__preview_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Profiles */
        get: operations["profiles_v1_providers_profiles_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/profiles/{profile_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Write Profile */
        put: operations["write_profile_v1_providers_profiles__profile_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/profiles/{profile_id}/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resume Profile */
        post: operations["resume_profile_v1_providers_profiles__profile_id__resume_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/profiles/{profile_id}/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Catalog */
        get: operations["catalog_v1_providers_profiles__profile_id__models_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Settings */
        get: operations["settings_v1_providers_settings_get"];
        /** Write Settings */
        put: operations["write_settings_v1_providers_settings_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/profiles/{profile_id}/secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Secret Status */
        get: operations["secret_status_v1_providers_profiles__profile_id__secret_get"];
        /** Write Secret */
        put: operations["write_secret_v1_providers_profiles__profile_id__secret_put"];
        post?: never;
        /** Delete Secret */
        delete: operations["delete_secret_v1_providers_profiles__profile_id__secret_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/providers/{profile_id}/consent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Consent */
        get: operations["read_consent_v1_notebooks__notebook_id__providers__profile_id__consent_get"];
        /** Consent */
        put: operations["consent_v1_notebooks__notebook_id__providers__profile_id__consent_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/providers/prices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Price */
        post: operations["price_v1_providers_prices_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-budgets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Budget */
        put: operations["budget_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_budgets_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-calls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Calls */
        get: operations["calls_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_calls_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-calls/{call_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Call */
        get: operations["call_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_calls__call_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Status */
        get: operations["status_v1_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/bridge/heartbeat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Heartbeat */
        post: operations["heartbeat_v1_bridge_heartbeat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AttachmentRegister */
        AttachmentRegister: {
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /** Path */
            path: string;
        };
        /** AttachmentRole */
        AttachmentRole: {
            identity: components["schemas"]["SourceIdentity"];
            /** Key */
            key: string;
            /**
             * Role
             * @enum {string}
             */
            role: "unassigned" | "principal" | "supplement";
        };
        /** Budget */
        Budget: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "call" | "job" | "session";
            /** Identity */
            identity: string;
            /** Currency */
            currency: string;
            /** Ceiling */
            ceiling: string;
            /** Revision */
            revision: number;
        };
        /** BudgetWrite */
        BudgetWrite: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "call" | "job" | "session";
            /** Identity */
            identity: string;
            /** Currency */
            currency: string;
            /** Ceiling */
            ceiling: number | string;
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** Capability */
        Capability: {
            /** Supported */
            supported: boolean;
            /**
             * Provenance
             * @enum {string}
             */
            provenance: "PROVIDER_REPORTED" | "PROBED" | "USER_DECLARED" | "UNSUPPORTED";
            /** Source */
            source?: string | null;
        };
        /** Consent */
        Consent: {
            /** Notebook Id */
            notebook_id: string;
            /** Profile Id */
            profile_id: string;
            /** Profile Revision */
            profile_revision: number;
            /** Revision */
            revision: number;
            /** Categories */
            categories: ("excerpts" | "metadata" | "images" | "history")[];
            /** Granted */
            granted: boolean;
            /** Base Url */
            base_url: string;
        };
        /** ConsentWrite */
        ConsentWrite: {
            /** Categories */
            categories: ("excerpts" | "metadata" | "images" | "history")[];
            /** Granted */
            granted: boolean;
            /** Profile Revision */
            profile_revision: number;
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** ContentIdentity */
        ContentIdentity: {
            /** Key */
            key: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
        };
        /** DocumentPage */
        DocumentPage: {
            /** Items */
            items: components["schemas"]["DocumentStatus"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** DocumentStatus */
        DocumentStatus: {
            /** Document Id */
            document_id: string | null;
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /**
             * Source Kind
             * @enum {string}
             */
            source_kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /** Title */
            title: string;
            /**
             * Coverage
             * @enum {string}
             */
            coverage: "METADATA_ONLY" | "PARTIAL_TEXT" | "FULL_TEXT_PARSED" | "NEEDS_OCR" | "UNREADABLE" | "MISSING_FILE" | "STALE";
            /**
             * Parsed Coverage
             * @enum {string}
             */
            parsed_coverage: "METADATA_ONLY" | "PARTIAL_TEXT" | "FULL_TEXT_PARSED" | "NEEDS_OCR" | "UNREADABLE" | "MISSING_FILE" | "STALE";
            /** Historical */
            historical: boolean;
            /** Document Version Id */
            document_version_id?: string | null;
            /** Page Count */
            page_count?: number | null;
            /**
             * Pages Processed
             * @default 0
             */
            pages_processed: number;
            /**
             * Bytes Processed
             * @default 0
             */
            bytes_processed: number;
            /** Reason */
            reason?: string | null;
            operation?: components["schemas"]["Operation"] | null;
        };
        /** DocumentTargetRequest */
        DocumentTargetRequest: {
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
        };
        /** ErrorResponse */
        ErrorResponse: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /**
             * Retryable
             * @default false
             */
            retryable: boolean;
            /** Run Id */
            run_id?: string | null;
            /** Details */
            details?: {
                [key: string]: number | string;
            } | null;
        };
        /** Evidence */
        Evidence: {
            /** Id */
            id: string;
            /** Source Id */
            source_id: string;
            source_identity: components["schemas"]["SourceIdentity"];
            /** Content Key */
            content_key: string;
            /**
             * Source Kind
             * @enum {string}
             */
            source_kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /** Document Version Id */
            document_version_id: string;
            /** Document Sha256 */
            document_sha256: string;
            /** Document Bytes */
            document_bytes: number;
            /** Excerpt */
            excerpt: string;
            /** Start */
            start: number;
            /** End */
            end: number;
            /** Page Index */
            page_index: number | null;
            /** Page Label */
            page_label: string | null;
            /**
             * Precision
             * @enum {string}
             */
            precision: "rectangles" | "page" | "text";
            /** Rectangles */
            rectangles: [
                number,
                number,
                number,
                number
            ][];
            /** Historical */
            historical: boolean;
            /** Parser Version */
            parser_version: string;
        };
        /** EvidenceFileCheck */
        EvidenceFileCheck: {
            /** Evidence Id */
            evidence_id: string;
            /** Path */
            path: string;
        };
        /** HealthStatus */
        HealthStatus: {
            /**
             * Status
             * @default ok
             */
            status: string;
            /**
             * Protocol Version
             * @default 1
             */
            protocol_version: number;
        };
        /** IdentityPage */
        IdentityPage: {
            /** Items */
            items: components["schemas"]["SourceAccess"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** IngestRequest */
        IngestRequest: {
            /** Document Id */
            document_id: string;
            /** Idempotency Key */
            idempotency_key: string;
            limits?: components["schemas"]["ParserLimits"];
        };
        /** Invalidation */
        Invalidation: {
            /** Identities */
            identities: components["schemas"]["SourceIdentity"][];
            /**
             * Reason
             * @enum {string}
             */
            reason: "changed" | "deleted" | "missing" | "library_missing" | "archived";
        };
        /** InvalidationResult */
        InvalidationResult: {
            /** Invalidated Count */
            invalidated_count: number;
        };
        /** ModelInfo */
        ModelInfo: {
            /** Model */
            model: string;
            /** Digest */
            digest?: string | null;
            /**
             * Cloud
             * @default false
             */
            cloud: boolean;
        };
        /** ModelPage */
        ModelPage: {
            /** Items */
            items: components["schemas"]["ModelInfo"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** Notebook */
        Notebook: {
            /** Id */
            id: string;
            /** Profile Instance Id */
            profile_instance_id: string;
            /** Name */
            name: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Revision */
            revision: number;
            /** Initial Snapshot Id */
            initial_snapshot_id: string;
        };
        /** NotebookCreate */
        NotebookCreate: {
            /** Name */
            name: string;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** NotebookPage */
        NotebookPage: {
            /** Items */
            items: components["schemas"]["Notebook"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** Operation */
        Operation: {
            /** Id */
            id: string;
            /** Document Id */
            document_id: string;
            /**
             * State
             * @enum {string}
             */
            state: "QUEUED" | "RUNNING" | "COMPLETE" | "PAUSED" | "CANCELLED" | "FAILED";
            /**
             * Kind
             * @enum {string}
             */
            kind: "ingest" | "preview";
            /**
             * Coverage
             * @enum {string}
             */
            coverage: "METADATA_ONLY" | "PARTIAL_TEXT" | "FULL_TEXT_PARSED" | "NEEDS_OCR" | "UNREADABLE" | "MISSING_FILE" | "STALE";
            /** Reason */
            reason?: string | null;
            /** Document Version Id */
            document_version_id?: string | null;
            /** Sha256 */
            sha256?: string | null;
            /** Page Count */
            page_count?: number | null;
            /**
             * Pages Processed
             * @default 0
             */
            pages_processed: number;
            /**
             * Bytes Processed
             * @default 0
             */
            bytes_processed: number;
            /**
             * Cache Hit
             * @default false
             */
            cache_hit: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** PagePreview */
        PagePreview: {
            /** Document Version Id */
            document_version_id: string;
            /** Page Index */
            page_index: number;
            /** Region */
            region: [
                number,
                number,
                number,
                number
            ];
            /** Width */
            width: number;
            /** Height */
            height: number;
            /** Sha256 */
            sha256: string;
            /**
             * Mime Type
             * @default image/png
             * @constant
             */
            mime_type: "image/png";
            /** Data Base64 */
            data_base64: string;
            /**
             * Destination
             * @default local_preview
             * @constant
             */
            destination: "local_preview";
        };
        /** PagePreviewRequest */
        PagePreviewRequest: {
            /** Document Version Id */
            document_version_id: string;
            /** Page Index */
            page_index: number;
            /**
             * Region
             * @default null
             */
            region: [
                number,
                number,
                number,
                number
            ] | null;
            /**
             * Scale
             * @default 1
             */
            scale: number;
            /** Idempotency Key */
            idempotency_key: string;
            limits?: components["schemas"]["ParserLimits"];
        };
        /** ParserLimits */
        ParserLimits: {
            /**
             * Max File Bytes
             * @default 200000000
             */
            max_file_bytes: number;
            /**
             * Max Pages
             * @default 1000
             */
            max_pages: number;
            /**
             * Memory Bytes
             * @default 536870912
             */
            memory_bytes: number;
            /**
             * Timeout Seconds
             * @default 120
             */
            timeout_seconds: number;
        };
        /** PreviewPage */
        PreviewPage: {
            /** Id */
            id: string;
            /** Stage Id */
            stage_id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Expected Revision */
            expected_revision: number;
            /** Items */
            items: components["schemas"]["Source"][];
            /** Removed */
            removed: components["schemas"]["RemovedSource"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Included Count */
            included_count: number;
            /** Removed Count */
            removed_count: number;
            /** Added Count */
            added_count: number;
            /** Dropped Count */
            dropped_count: number;
            /** Changed Count */
            changed_count: number;
            /** Possible Duplicate Count */
            possible_duplicate_count: number;
        };
        /** PreviewRequest */
        PreviewRequest: {
            selection: components["schemas"]["SelectionSpec"];
            /** Stage Id */
            stage_id: string;
        };
        /** PriceConfig */
        "PriceConfig-Input": {
            /** Version */
            version: string;
            /**
             * Adapter
             * @enum {string}
             */
            adapter: "ollama" | "lm_studio" | "openai" | "anthropic" | "gemini" | "openai_compatible";
            /** Model */
            model: string;
            /** Currency */
            currency: string;
            /**
             * Effective Date
             * Format: date
             */
            effective_date: string;
            /** Source */
            source: string;
            /** Input Per Million */
            input_per_million: number | string;
            /** Output Per Million */
            output_per_million: number | string;
        };
        /** PriceConfig */
        "PriceConfig-Output": {
            /** Version */
            version: string;
            /**
             * Adapter
             * @enum {string}
             */
            adapter: "ollama" | "lm_studio" | "openai" | "anthropic" | "gemini" | "openai_compatible";
            /** Model */
            model: string;
            /** Currency */
            currency: string;
            /**
             * Effective Date
             * Format: date
             */
            effective_date: string;
            /** Source */
            source: string;
            /** Input Per Million */
            input_per_million: string;
            /** Output Per Million */
            output_per_million: string;
        };
        /** ProfilePage */
        ProfilePage: {
            /** Items */
            items: components["schemas"]["ProviderProfile"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ProfileSpec */
        ProfileSpec: {
            /**
             * Adapter
             * @enum {string}
             */
            adapter: "ollama" | "lm_studio" | "openai" | "anthropic" | "gemini" | "openai_compatible";
            /**
             * Mode
             * @enum {string}
             */
            mode: "LOCAL" | "API";
            /**
             * Purpose
             * @enum {string}
             */
            purpose: "generation" | "embedding";
            /** Base Url */
            base_url: string;
            /** Model */
            model: string;
            /** Digest */
            digest?: string | null;
            /**
             * Cloud
             * @default false
             */
            cloud: boolean;
            /** Capabilities */
            capabilities: {
                [key: string]: components["schemas"]["Capability"];
            };
        };
        /** ProfileWrite */
        ProfileWrite: {
            spec: components["schemas"]["ProfileSpec"];
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** ProviderProfile */
        ProviderProfile: {
            /**
             * Adapter
             * @enum {string}
             */
            adapter: "ollama" | "lm_studio" | "openai" | "anthropic" | "gemini" | "openai_compatible";
            /**
             * Mode
             * @enum {string}
             */
            mode: "LOCAL" | "API";
            /**
             * Purpose
             * @enum {string}
             */
            purpose: "generation" | "embedding";
            /** Base Url */
            base_url: string;
            /** Model */
            model: string;
            /** Digest */
            digest?: string | null;
            /**
             * Cloud
             * @default false
             */
            cloud: boolean;
            /** Capabilities */
            capabilities: {
                [key: string]: components["schemas"]["Capability"];
            };
            /** Id */
            id: string;
            /** Revision */
            revision: number;
            /** Paused Code */
            paused_code?: string | null;
        };
        /** RegisteredDocument */
        RegisteredDocument: {
            /** Id */
            id: string;
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /**
             * Source Kind
             * @enum {string}
             */
            source_kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /** Revision */
            revision: number;
            /**
             * Coverage
             * @enum {string}
             */
            coverage: "METADATA_ONLY" | "PARTIAL_TEXT" | "FULL_TEXT_PARSED" | "NEEDS_OCR" | "UNREADABLE" | "MISSING_FILE" | "STALE";
            /** Reason */
            reason?: string | null;
        };
        /** RemovedSource */
        RemovedSource: {
            identity: components["schemas"]["SourceIdentity"];
            /** Title */
            title: string | null;
            /**
             * Reason
             * @enum {string}
             */
            reason: "excluded" | "year" | "type" | "tags" | "pdf" | "unavailable";
        };
        /** ResumeWrite */
        ResumeWrite: {
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** Revocation */
        Revocation: {
            /** Expected Revision */
            expected_revision: number;
        };
        /** RuntimeStatus */
        RuntimeStatus: {
            /**
             * Status
             * @default ok
             */
            status: string;
            /**
             * Protocol Version
             * @default 1
             */
            protocol_version: number;
            /** Profile Instance Id */
            profile_instance_id: string;
            /**
             * Heartbeat Interval Seconds
             * @default 10
             */
            heartbeat_interval_seconds: number;
            /**
             * Heartbeat Timeout Seconds
             * @default 30
             */
            heartbeat_timeout_seconds: number;
        };
        /** SearchHit */
        SearchHit: {
            /** Evidence Id */
            evidence_id: string;
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /**
             * Source Kind
             * @enum {string}
             */
            source_kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /** Excerpt */
            excerpt: string;
            /** Page Index */
            page_index: number | null;
            /** Page Label */
            page_label: string | null;
            /** Historical */
            historical: boolean;
            /** Score */
            score: number;
        };
        /** SearchPage */
        SearchPage: {
            /** Items */
            items: components["schemas"]["SearchHit"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Documents Retrieved */
            documents_retrieved: number;
        };
        /** SearchRequest */
        SearchRequest: {
            /** Query */
            query: string;
            /**
             * Offset
             * @default 0
             */
            offset: number;
            /**
             * Limit
             * @default 40
             */
            limit: number;
        };
        /** SecretDelete */
        SecretDelete: {
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** SecretReceipt */
        SecretReceipt: {
            /**
             * Storage
             * @enum {string}
             */
            storage: "KEYRING" | "MEMORY_ONLY" | "MISSING";
            /**
             * Revision
             * @default 0
             */
            revision: number;
            /** Code */
            code?: string | null;
            /** Cause Type */
            cause_type?: string | null;
            /**
             * Keyring Entry May Remain
             * @default false
             */
            keyring_entry_may_remain: boolean;
        };
        /** SecretWrite */
        SecretWrite: {
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
            /**
             * Value
             * Format: password
             */
            value: string;
            /**
             * Memory Only
             * @default false
             */
            memory_only: boolean;
        };
        /** SelectionSpec */
        SelectionSpec: {
            /** Selectors */
            selectors?: components["schemas"]["Selector"][];
            /**
             * Include Selected Containers
             * @default false
             */
            include_selected_containers: boolean;
            /**
             * Include Descendants
             * @default false
             */
            include_descendants: boolean;
            /** Year Min */
            year_min?: number | null;
            /** Year Max */
            year_max?: number | null;
            /** Item Types */
            item_types?: string[];
            /** Tags */
            tags?: string[];
            /**
             * Tag Mode
             * @default AND
             * @enum {string}
             */
            tag_mode: "AND" | "OR";
            /**
             * Pdf Only
             * @default false
             */
            pdf_only: boolean;
            /**
             * Include Notes
             * @default false
             */
            include_notes: boolean;
            /**
             * Include Annotations
             * @default false
             */
            include_annotations: boolean;
            /** Exclusions */
            exclusions?: components["schemas"]["SourceIdentity"][];
            /** Attachment Roles */
            attachment_roles?: components["schemas"]["AttachmentRole"][];
        };
        /** Selector */
        Selector: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "library" | "collection" | "search" | "item";
            /** Library Id */
            library_id: number;
            /** Key */
            key?: string | null;
        };
        /** Settings */
        Settings: {
            /**
             * Block Paid Apis
             * @default true
             */
            block_paid_apis: boolean;
            /**
             * Revision
             * @default 0
             */
            revision: number;
        };
        /** SettingsWrite */
        SettingsWrite: {
            /** Block Paid Apis */
            block_paid_apis: boolean;
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** Snapshot */
        Snapshot: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Revision */
            revision: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            selection: components["schemas"]["SelectionSpec"];
            /** Member Count */
            member_count: number;
        };
        /** SnapshotCreate */
        SnapshotCreate: {
            /** Preview Id */
            preview_id: string;
            /** Expected Revision */
            expected_revision: number;
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** SnapshotPage */
        SnapshotPage: {
            /** Items */
            items: components["schemas"]["Snapshot"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** SnapshotSource */
        SnapshotSource: {
            source: components["schemas"]["Source"];
            /**
             * State
             * @enum {string}
             */
            state: "current" | "stale";
        };
        /** SnapshotSourcePage */
        SnapshotSourcePage: {
            /** Items */
            items: components["schemas"]["SnapshotSource"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Unavailable Count */
            unavailable_count: number;
        };
        /** Source */
        Source: {
            identity: components["schemas"]["SourceIdentity"];
            /** Version */
            version: string;
            /** Title */
            title: string;
            /** Year */
            year?: number | null;
            /** Item Type */
            item_type: string;
            /** Tags */
            tags?: string[];
            /** Doi */
            doi?: string | null;
            /** Remote Library Id */
            remote_library_id?: string | null;
            /** Remote Group Id */
            remote_group_id?: number | null;
            /** Contents */
            contents?: components["schemas"]["SourceContent"][];
            /** Id */
            id: string;
            /** Version Id */
            version_id: string;
            /**
             * Year State
             * @enum {string}
             */
            year_state: "known" | "missing";
        };
        /** SourceAccess */
        SourceAccess: {
            identity: components["schemas"]["SourceIdentity"];
            /** Contents */
            contents: components["schemas"]["ContentIdentity"][];
        };
        /** SourceChange */
        SourceChange: {
            /** Revision */
            revision: number;
        };
        /** SourceContent */
        SourceContent: {
            /** Key */
            key: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /**
             * Role
             * @default unassigned
             * @enum {string}
             */
            role: "unassigned" | "principal" | "supplement";
            /**
             * Title
             * @default
             */
            title: string;
            /**
             * Version
             * @default
             */
            version: string;
        };
        /** SourceIdentity */
        SourceIdentity: {
            /** Profile Instance Id */
            profile_instance_id: string;
            /** Library Id */
            library_id: number;
            /** Item Key */
            item_key: string;
        };
        /** SourceInput */
        SourceInput: {
            identity: components["schemas"]["SourceIdentity"];
            /** Version */
            version: string;
            /** Title */
            title: string;
            /** Year */
            year?: number | null;
            /** Item Type */
            item_type: string;
            /** Tags */
            tags?: string[];
            /** Doi */
            doi?: string | null;
            /** Remote Library Id */
            remote_library_id?: string | null;
            /** Remote Group Id */
            remote_group_id?: number | null;
            /** Contents */
            contents?: components["schemas"]["SourceContent"][];
        };
        /** SourcePage */
        SourcePage: {
            /** Items */
            items: components["schemas"]["Source"][];
            /**
             * Offset
             * @default 0
             */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Stage Id */
            stage_id: string | null;
        };
        /** SourceSync */
        SourceSync: {
            /** Items */
            items: components["schemas"]["SourceInput"][];
            /**
             * Purpose
             * @enum {string}
             */
            purpose: "selection" | "revalidation";
            /** Stage Id */
            stage_id: string | null;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Final */
            final: boolean;
        };
        /** TextPart */
        TextPart: {
            /** Offset */
            offset: number;
            /** Text */
            text: string;
            /** Final */
            final: boolean;
        };
        /** TextRegister */
        TextRegister: {
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /** Total Characters */
            total_characters: number;
            /** Sha256 */
            sha256: string;
        };
        /** TextStage */
        TextStage: {
            /** Id */
            id: string;
            /** Offset */
            offset: number;
            /** Total Characters */
            total_characters: number;
            document?: components["schemas"]["RegisteredDocument"] | null;
        };
        /** UsagePage */
        UsagePage: {
            /** Items */
            items: components["schemas"]["UsageRecord"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** UsageRecord */
        UsageRecord: {
            /** Call Id */
            call_id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /** Profile Id */
            profile_id: string;
            /** Profile Revision */
            profile_revision: number;
            /** Job Id */
            job_id: string;
            /** Session Id */
            session_id: string;
            /** Repair Of */
            repair_of: string | null;
            /**
             * State
             * @enum {string}
             */
            state: "RESERVED" | "SENT" | "CONFIRMED" | "BILLING_UNKNOWN" | "NOT_SENT";
            /** Reserved */
            reserved: string | null;
            /** Currency */
            currency: string | null;
            /** Price Version */
            price_version: string | null;
            /** Input Tokens */
            input_tokens: number | null;
            /** Output Tokens */
            output_tokens: number | null;
            /** Cost */
            cost: string | null;
            /** Error */
            error: string | null;
            /** Created At */
            created_at: string;
            /** Updated At */
            updated_at: string;
        };
        /** GenerationEvent */
        GenerationEvent: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "delta" | "usage" | "final" | "error";
            /**
             * Text
             * @default null
             */
            text: string | null;
            /**
             * Input Tokens
             * @default null
             */
            input_tokens: number | null;
            /**
             * Output Tokens
             * @default null
             */
            output_tokens: number | null;
            /**
             * Code
             * @default null
             */
            code: string | null;
            /**
             * Usage Confirmed
             * @default false
             */
            usage_confirmed: boolean;
            /**
             * Schema Mode
             * @default none
             * @enum {string}
             */
            schema_mode: "native" | "local_validation" | "none";
        };
        /** ImageInput */
        ImageInput: {
            /**
             * Mime Type
             * @enum {string}
             */
            mime_type: "image/png" | "image/jpeg" | "image/webp";
            /** Data */
            data: string;
        };
        /** Message */
        Message: {
            /**
             * Role
             * @enum {string}
             */
            role: "user" | "assistant";
            /** Text */
            text: string;
            /** Images */
            images?: components["schemas"]["ImageInput"][];
        };
        /** OllamaOptions */
        OllamaOptions: {
            /**
             * Num Ctx
             * @default null
             */
            num_ctx: number | null;
            /**
             * Temperature
             * @default null
             */
            temperature: number | null;
            /**
             * Seed
             * @default null
             */
            seed: number | null;
            /**
             * Think
             * @default null
             */
            think: boolean | null;
        };
        /** GenerationRequest */
        GenerationRequest: {
            /** Messages */
            messages: components["schemas"]["Message"][];
            /**
             * System
             * @default
             */
            system: string;
            /** Max Output Tokens */
            max_output_tokens: number;
            /**
             * Output Schema
             * @default null
             */
            output_schema: {
                [key: string]: unknown;
            } | null;
            /**
             * Categories
             * @default [
             *       "excerpts"
             *     ]
             */
            categories: ("excerpts" | "metadata" | "images" | "history")[];
            /** @default null */
            ollama_options: components["schemas"]["OllamaOptions"] | null;
        };
        /** EmbeddingBatch */
        EmbeddingBatch: {
            /** Model */
            model: string;
            /** Digest */
            digest: string | null;
            /** Dimensions */
            dimensions: number;
            /** Normalized */
            normalized: boolean;
            /** Vectors */
            vectors: number[][];
        };
        /** DocumentEvidenceCommand */
        DocumentEvidenceCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.evidence" | "documents.open";
            /** Evidence Id */
            evidence_id: string;
        };
        /** DocumentIndexCommand */
        DocumentIndexCommand: {
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.index";
            limits: components["schemas"]["ParserLimits"];
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** DocumentListCommand */
        DocumentListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.list";
            /** Offset */
            offset: number;
        };
        /** DocumentOperationCommand */
        DocumentOperationCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.cancel" | "documents.operation" | "documents.preview.read";
            /** Operation Id */
            operation_id: string;
        };
        /** DocumentPreviewCommand */
        DocumentPreviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.preview";
            request: components["schemas"]["PagePreviewRequest"];
        };
        /** DocumentSearchCommand */
        DocumentSearchCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "documents.search";
            request: components["schemas"]["SearchRequest"];
        };
        DocumentCommand: components["schemas"]["DocumentListCommand"] | components["schemas"]["DocumentIndexCommand"] | components["schemas"]["DocumentSearchCommand"] | components["schemas"]["DocumentEvidenceCommand"] | components["schemas"]["DocumentOperationCommand"] | components["schemas"]["DocumentPreviewCommand"];
        /** EngineManifest */
        EngineManifest: {
            /**
             * Manifest Version
             * @constant
             */
            manifest_version: 1;
            /**
             * Protocol Version
             * @constant
             */
            protocol_version: 1;
            /** Engine Version */
            engine_version: string;
            /**
             * Platform
             * @constant
             */
            platform: "win32";
            /**
             * Architecture
             * @constant
             */
            architecture: "x86_64";
            /**
             * Entrypoint
             * @constant
             */
            entrypoint: "evidra-engine.exe";
            /** Files */
            files: components["schemas"]["PayloadFile"][];
        };
        /** PayloadFile */
        PayloadFile: {
            /** Path */
            path: string;
            /** Size */
            size: number;
            /** Sha256 */
            sha256: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_notebooks_v1_notebooks_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotebookPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_notebook_v1_notebooks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotebookCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Notebook"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_notebook_v1_notebooks__notebook_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Notebook"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    sync_sources_v1_notebooks__notebook_id__sources_sync_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SourceSync"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SourcePage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    invalidate_sources_v1_sources_invalidate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Invalidation"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvalidationResult"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    preview_selection_v1_notebooks__notebook_id__sources_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreviewRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreviewPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_preview_v1_notebooks__notebook_id__sources_previews__preview_id__get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                preview_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PreviewPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_snapshots_v1_notebooks__notebook_id__snapshots_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_snapshot_v1_notebooks__notebook_id__snapshots_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SnapshotCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Snapshot"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_sources_v1_notebooks__notebook_id__snapshots__snapshot_id__sources_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotSourcePage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    source_identities_v1_notebooks__notebook_id__snapshots__snapshot_id__identities_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IdentityPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    revoke_source_v1_notebooks__notebook_id__sources__source_id__revoke_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                source_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Revocation"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SourceChange"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    register_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_register_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttachmentRegister"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisteredDocument"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    missing_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_missing_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentTargetRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisteredDocument"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    list_documents_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    ingest_document_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_ingest_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IngestRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Operation"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_operation_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                operation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Operation"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    cancel_operation_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                operation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Operation"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_evidence_v1_notebooks__notebook_id__snapshots__snapshot_id__evidence__evidence_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                evidence_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Evidence"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    verify_evidence_file_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EvidenceFileCheck"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Evidence"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    search_v1_notebooks__notebook_id__snapshots__snapshot_id__search_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SearchRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    stage_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TextRegister"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TextStage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    append_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text__stage_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                stage_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TextPart"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TextStage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    render_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PagePreviewRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Operation"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__operations__operation_id__preview_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                operation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PagePreview"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    profiles_v1_providers_profiles_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfilePage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    write_profile_v1_providers_profiles__profile_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderProfile"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    resume_profile_v1_providers_profiles__profile_id__resume_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResumeWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProviderProfile"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    catalog_v1_providers_profiles__profile_id__models_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModelPage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    settings_v1_providers_settings_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Settings"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    write_settings_v1_providers_settings_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingsWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Settings"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    secret_status_v1_providers_profiles__profile_id__secret_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SecretReceipt"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    write_secret_v1_providers_profiles__profile_id__secret_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SecretWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SecretReceipt"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    delete_secret_v1_providers_profiles__profile_id__secret_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SecretDelete"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SecretReceipt"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_consent_v1_notebooks__notebook_id__providers__profile_id__consent_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Consent"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    consent_v1_notebooks__notebook_id__providers__profile_id__consent_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConsentWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Consent"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    price_v1_providers_prices_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PriceConfig-Input"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PriceConfig-Output"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    budget_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_budgets_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BudgetWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Budget"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    calls_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_calls_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UsagePage"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    call_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_calls__call_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UsageRecord"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthStatus"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    status_v1_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeStatus"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    heartbeat_v1_bridge_heartbeat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RuntimeStatus"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
