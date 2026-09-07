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
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/text-view": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Read Original Attachment Text */
        post: operations["read_original_attachment_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text_view_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/documents/original-view": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Read Original Attachment */
        post: operations["read_original_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_original_view_post"];
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
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/provider-budgets/{kind}/{identity}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Budget */
        get: operations["read_budget_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_budgets__kind___identity__get"];
        put?: never;
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
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listing */
        get: operations["listing_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations_get"];
        put?: never;
        /** Create */
        post: operations["create_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/conversations/{conversation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Conversation */
        get: operations["conversation_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/conversations/{conversation_id}/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** History */
        get: operations["history_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__runs_get"];
        put?: never;
        /** Prepare */
        post: operations["prepare_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__runs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/runs/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Run */
        get: operations["run_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/runs/{run_id}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Start */
        post: operations["start_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__start_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/runs/{run_id}/access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Access */
        get: operations["access_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__access_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/runs/{run_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel */
        post: operations["cancel_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/runs/{run_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Events */
        get: operations["events_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/vectors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Build */
        post: operations["build_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/vectors/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Vector Job */
        get: operations["vector_job_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/vectors/{job_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel Vector */
        post: operations["cancel_vector_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors__job_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/forms/template": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Template */
        get: operations["template_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_template_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/forms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Forms */
        get: operations["forms_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_get"];
        put?: never;
        /** Create Form */
        post: operations["create_form_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/forms/{form_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Form */
        get: operations["form_v1_notebooks__notebook_id__snapshots__snapshot_id__forms__form_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/{form_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Matrix */
        get: operations["matrix_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix__form_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Matrix Query */
        post: operations["matrix_query_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_query_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/proposals/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Proposals */
        post: operations["proposals_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_proposals_query_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/decisions/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Decisions */
        post: operations["decisions_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_decisions_query_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/proposals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Propose */
        post: operations["propose_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_proposals_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Decide */
        post: operations["decide_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_decisions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/bulk-preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Preview */
        post: operations["preview_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_bulk_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/matrix/bulk-approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Bulk */
        post: operations["bulk_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_bulk_approve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listing */
        get: operations["listing_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs_get"];
        put?: never;
        /** Prepare */
        post: operations["prepare_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read */
        get: operations["read_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs/{job_id}/access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Access */
        get: operations["access_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__access_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs/{job_id}/units": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Units */
        get: operations["units_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__units_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs/{job_id}/units/{unit_id}/batches/{batch_index}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Preview */
        get: operations["preview_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__units__unit_id__batches__batch_index__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/jobs/{job_id}/control": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Control */
        post: operations["control_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__control_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/job-cache/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Clear Cache */
        post: operations["clear_cache_v1_notebooks__notebook_id__snapshots__snapshot_id__job_cache_clear_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/protocols": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Protocols */
        get: operations["protocols_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols_get"];
        put?: never;
        /** Create Protocol */
        post: operations["create_protocol_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/protocols/{protocol_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Protocol */
        get: operations["protocol_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols__protocol_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/screening/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Decide */
        post: operations["decide_v1_notebooks__notebook_id__snapshots__snapshot_id__screening_decisions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/screening/{protocol_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Screening */
        get: operations["screening_v1_notebooks__notebook_id__snapshots__snapshot_id__screening__protocol_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/research/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Research Runs */
        get: operations["research_runs_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs_get"];
        put?: never;
        /** Prepare Run */
        post: operations["prepare_run_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/research/runs/{run_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Research Run */
        get: operations["research_run_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/research/runs/{run_id}/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Research Preview */
        get: operations["research_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__preview_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/research/runs/{run_id}/access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Research Access */
        get: operations["research_access_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__access_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/research/runs/{run_id}/control": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Research Control */
        post: operations["research_control_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__control_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/artifacts/{version_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Artifact */
        get: operations["artifact_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/artifacts/{version_id}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Artifact Versions */
        get: operations["artifact_versions_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__versions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/artifacts/{version_id}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Artifact Review */
        post: operations["artifact_review_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__review_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Note Preview */
        post: operations["note_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_previews_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Note Approve */
        post: operations["note_approve_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_approve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/outbox": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Note Outbox */
        get: operations["note_outbox_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/outbox/{intent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Note Intent */
        get: operations["note_intent_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/outbox/{intent_id}/begin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Note Begin */
        post: operations["note_begin_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__begin_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/notes/outbox/{intent_id}/ack": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Note Ack */
        post: operations["note_ack_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__ack_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/mcp/connections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Connections */
        get: operations["connections_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections_get"];
        put?: never;
        /** Create */
        post: operations["create_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/mcp/connections/{identity}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke */
        post: operations["revoke_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections__identity__revoke_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/mcp/notes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Notes */
        get: operations["notes_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_notes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/mcp/notes/{identity}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Review */
        post: operations["review_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_notes__identity__review_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/get_notebook_status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Status */
        post: operations["status_v1_mcp_gateway_get_notebook_status_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/list_sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sources */
        post: operations["sources_v1_mcp_gateway_list_sources_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/search_evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search */
        post: operations["search_v1_mcp_gateway_search_evidence_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/read_evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Read */
        post: operations["read_v1_mcp_gateway_read_evidence_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/get_protocol": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Protocol */
        post: operations["protocol_v1_mcp_gateway_get_protocol_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/get_matrix": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Matrix */
        post: operations["matrix_v1_mcp_gateway_get_matrix_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/propose_extractions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Extractions */
        post: operations["extractions_v1_mcp_gateway_propose_extractions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/mcp/gateway/propose_note": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Note */
        post: operations["note_v1_mcp_gateway_propose_note_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/exports/bibliography-access": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Bibliography Access */
        post: operations["bibliography_access_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_bibliography_access_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/exports/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Preview */
        post: operations["preview_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_previews_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/exports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create */
        post: operations["create_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/exports/{identity}/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Validate */
        post: operations["validate_v1_notebooks__notebook_id__snapshots__snapshot_id__exports__identity__validate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/exports/{identity}/data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Data */
        get: operations["data_v1_notebooks__notebook_id__snapshots__snapshot_id__exports__identity__data_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/transfers/{identity}/discard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Discard */
        post: operations["discard_v1_notebooks__notebook_id__snapshots__snapshot_id__transfers__identity__discard_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload */
        post: operations["upload_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/uploads/{identity}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Part */
        post: operations["part_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/uploads/{identity}/inspect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Inspect */
        post: operations["inspect_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__inspect_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Imports */
        get: operations["imports_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_get"];
        put?: never;
        /** Restore */
        post: operations["restore_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/uploads/{identity}/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Original Sources */
        get: operations["original_sources_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__sources_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/uploads/{identity}/mappings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mapping */
        post: operations["mapping_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__mappings_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/{identity}/records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Records */
        get: operations["records_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__records_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/{identity}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Visibility */
        get: operations["visibility_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/{identity}/reference": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reference */
        post: operations["reference_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__reference_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notebooks/{notebook_id}/snapshots/{snapshot_id}/imports/{identity}/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Evidence */
        post: operations["evidence_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__evidence_post"];
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
        /** Answer */
        Answer: {
            /** Claims */
            claims: components["schemas"]["Claim"][];
        };
        /** ApprovedWriteOutbox */
        ApprovedWriteOutbox: {
            /** Id */
            id: string;
            /** Uuid */
            uuid: string;
            /** Artifact Version Id */
            artifact_version_id: string;
            /** Artifact Revision */
            artifact_revision: number;
            /** Run Id */
            run_id: string | null;
            /** Source Id */
            source_id: string;
            destination: components["schemas"]["SourceIdentity"];
            /** Title */
            title: string;
            /** Html */
            html: string;
            /** Html Sha256 */
            html_sha256: string;
            /** Created At */
            created_at: string;
            /**
             * Native Undo Verified
             * @default false
             * @constant
             */
            native_undo_verified: false;
            /** Preview Id */
            preview_id: string;
            /**
             * State
             * @enum {string}
             */
            state: "APPROVED" | "APPLYING" | "COMPLETE";
            /** Author */
            author: string;
            /** Approved At */
            approved_at: string;
            /** Note Key */
            note_key?: string | null;
        };
        /** ArtifactPage */
        ArtifactPage: {
            /** Items */
            items: components["schemas"]["ArtifactVersion"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ArtifactRecord */
        ArtifactRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "artifact";
            data: components["schemas"]["ArtifactVersion"];
        };
        /** ArtifactReview */
        ArtifactReview: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Expected Revision */
            expected_revision: number;
            /**
             * Action
             * @enum {string}
             */
            action: "APPROVED" | "CORRECTED" | "REJECTED";
            /** Rationale */
            rationale: string;
            /**
             * Corrected Output
             * @default null
             */
            corrected_output: (components["schemas"]["ScreeningOutput"] | components["schemas"]["SynthesisOutput"] | components["schemas"]["AuditOutput"]) | null;
        };
        /** ArtifactVersion */
        ArtifactVersion: {
            /** Id */
            id: string;
            /** Artifact Id */
            artifact_id: string;
            /** Revision */
            revision: number;
            /** Previous Version Id */
            previous_version_id: string | null;
            /** Run Id */
            run_id: string;
            /** Output */
            output: components["schemas"]["ScreeningOutput"] | components["schemas"]["SynthesisOutput"] | components["schemas"]["AuditOutput"];
            coverage: components["schemas"]["ResearchCoverage"];
            /**
             * Review State
             * @enum {string}
             */
            review_state: "UNREVIEWED" | "APPROVED" | "CORRECTED" | "REJECTED";
            /** Rationale */
            rationale: string | null;
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
            /**
             * Anchor Validation
             * @default VERIFIED_ORIGINAL_EXCERPTS
             * @constant
             */
            anchor_validation: "VERIFIED_ORIGINAL_EXCERPTS";
            /**
             * Support Validation
             * @default MODEL_PROPOSAL_REQUIRES_HUMAN_REVIEW
             * @constant
             */
            support_validation: "MODEL_PROPOSAL_REQUIRES_HUMAN_REVIEW";
        };
        /** AttachmentCoverage */
        AttachmentCoverage: {
            /** Content Key */
            content_key: string;
            /** Source Kind */
            source_kind: string;
            /** Document Version Id */
            document_version_id?: string | null;
            /** Pages Total */
            pages_total?: number | null;
            /**
             * Pages Processed
             * @default 0
             */
            pages_processed: number;
            /**
             * Chunks Total
             * @default 0
             */
            chunks_total: number;
            /**
             * Chunks Selected
             * @default 0
             */
            chunks_selected: number;
            /**
             * Chunks Processed
             * @default 0
             */
            chunks_processed: number;
            /**
             * Failed Pages
             * @default 0
             */
            failed_pages: number;
            /** Reason */
            reason?: string | null;
        };
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
        /** AuditClaim */
        AuditClaim: {
            /** Text */
            text: string;
            /** Start */
            start: number;
            /** End */
            end: number;
            /**
             * Support
             * @enum {string}
             */
            support: "SUPPORTED_PROPOSAL" | "PARTIALLY_SUPPORTED_PROPOSAL" | "CONTRADICTED_PROPOSAL" | "INSUFFICIENT_EVIDENCE";
            /** Evidence Ids */
            evidence_ids: string[];
            /** Explanation */
            explanation: string;
            /** References */
            references: components["schemas"]["AuditReference"][];
        };
        /** AuditOutput */
        AuditOutput: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "AUDIT";
            /** Claims */
            claims: components["schemas"]["AuditClaim"][];
            /** Collection Limitations */
            collection_limitations: string;
        };
        /** AuditReference */
        AuditReference: {
            /** Citation */
            citation: string;
            /** Source Id */
            source_id: string | null;
            /**
             * Relationship
             * @enum {string}
             */
            relationship: "DIRECT" | "INDIRECT_MENTION" | "NOT_IN_NOTEBOOK";
        };
        /** BatchPreview */
        BatchPreview: {
            /** Unit Id */
            unit_id: string;
            /** Batch Index */
            batch_index: number;
            /** Prompt */
            prompt: string;
            /** Estimated Input Tokens */
            estimated_input_tokens: number;
            /**
             * Estimate Method
             * @default utf8-bytes-plus-overhead-v1
             * @constant
             */
            estimate_method: "utf8-bytes-plus-overhead-v1";
            schema_plan: components["schemas"]["SchemaPlan"];
            profile: components["schemas"]["ProviderProfile"];
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
        /** BulkApprove */
        BulkApprove: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Preview Id */
            preview_id: string;
        };
        /** BulkChange */
        BulkChange: {
            old: components["schemas"]["MatrixCell"];
            proposal: components["schemas"]["ExtractionProposal"];
        };
        /** BulkItem */
        BulkItem: {
            /** Proposal Id */
            proposal_id: string;
            /** Expected Revision */
            expected_revision: number;
        };
        /** BulkPreview */
        BulkPreview: {
            /** Id */
            id: string;
            /** Changes */
            changes: components["schemas"]["BulkChange"][];
            /** Count */
            count: number;
        };
        /** BulkPreviewWrite */
        BulkPreviewWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Items */
            items: components["schemas"]["BulkItem"][];
        };
        /** BulkReceipt */
        BulkReceipt: {
            /** Items */
            items: components["schemas"]["CellDecision"][];
        };
        /** CancelReceipt */
        CancelReceipt: {
            /** Id */
            id: string;
            /** State */
            state: string;
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
            /**
             * Source
             * @default null
             */
            source: string | null;
        };
        /** CellDecision */
        CellDecision: {
            /** Id */
            id: string;
            /** Proposal Id */
            proposal_id: string;
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
            /**
             * Action
             * @enum {string}
             */
            action: "APPROVED" | "CORRECTED" | "REJECTED";
            /** Rationale */
            rationale: string | null;
            old: components["schemas"]["MatrixCell"];
            new: components["schemas"]["MatrixCell"];
        };
        /** CellQuery */
        CellQuery: {
            /** Form Version Id */
            form_version_id: string;
            /** Source Id */
            source_id: string;
            /** Field Key */
            field_key: string;
            /** Offset */
            offset: number;
        };
        /** Citation */
        Citation: {
            /** Evidence Id */
            evidence_id: string;
            /** Excerpt */
            excerpt: string;
        };
        /** Claim */
        Claim: {
            /** Text */
            text: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "source" | "general" | "visual_proposal";
            /** Evidence */
            evidence: components["schemas"]["Citation"][];
        };
        /** ConnectionCreate */
        ConnectionCreate: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Label */
            label: string;
            /**
             * Allow Proposals
             * @default false
             */
            allow_proposals: boolean;
            /**
             * Expires In Seconds
             * @default 3600
             */
            expires_in_seconds: number;
            /**
             * Token
             * Format: password
             */
            token: string;
        };
        /** ConnectionPage */
        ConnectionPage: {
            /** Items */
            items: components["schemas"]["ConnectionRecord"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ConnectionReceipt */
        ConnectionReceipt: {
            connection: components["schemas"]["ConnectionRecord"];
            /** Connection File */
            connection_file: string;
        };
        /** ConnectionRecord */
        ConnectionRecord: {
            /** Id */
            id: string;
            /** Label */
            label: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /** Allow Proposals */
            allow_proposals: boolean;
            /** Created At */
            created_at: string;
            /** Expires At */
            expires_at: string;
            /** Revoked At */
            revoked_at: string | null;
            /** Last Used At */
            last_used_at: string | null;
            /**
             * State
             * @enum {string}
             */
            state: "ACTIVE" | "EXPIRED" | "REVOKED" | "SESSION_CLOSED";
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
        /** ContentRemap */
        ContentRemap: {
            /** Original Key */
            original_key: string;
            /** Target Key */
            target_key: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
        };
        /** ContextEvidence */
        ContextEvidence: {
            /** Id */
            id: string;
            /** Excerpt */
            excerpt: string;
            /** Document Version Id */
            document_version_id: string;
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /** Source Kind */
            source_kind: string;
            /** Start */
            start: number;
            /** End */
            end: number;
        };
        /** ContextPreview */
        ContextPreview: {
            /** Evidence */
            evidence: components["schemas"]["ContextEvidence"][];
            /** Documents Retrieved */
            documents_retrieved: number;
            /** Documents Used */
            documents_used: number;
            /** Candidates */
            candidates: number;
            /** Excluded Overlap */
            excluded_overlap: number;
            /** Excluded Budget */
            excluded_budget: number;
            /** Excluded Limit */
            excluded_limit: number;
            /** Estimated Input Tokens */
            estimated_input_tokens: number;
            /**
             * Estimate Method
             * @default utf8-bytes-plus-overhead-v1
             * @constant
             */
            estimate_method: "utf8-bytes-plus-overhead-v1";
            /** Context Tokens */
            context_tokens: number;
            /** Max Output Tokens */
            max_output_tokens: number;
            /** History Messages */
            history_messages: number;
            /** History */
            history: {
                [key: string]: string;
            }[];
            /** History Evidence Ids */
            history_evidence_ids?: string[];
            /** History Visual Versions */
            history_visual_versions?: string[];
            /** System */
            system: string;
            /** Output Schema */
            output_schema?: {
                [key: string]: unknown;
            } | null;
            /** Schema Mode */
            schema_mode?: ("native" | "local_validation" | "none") | null;
            /** Prompt */
            prompt: string;
            /**
             * Coverage
             * @default RETRIEVED_CHUNKS_ONLY
             * @constant
             */
            coverage: "RETRIEVED_CHUNKS_ONLY";
        };
        /** ConversationCreate */
        ConversationCreate: {
            /** Idempotency Key */
            idempotency_key: string;
        };
        /** ConversationPage */
        ConversationPage: {
            /** Items */
            items: components["schemas"]["ConversationRecord"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ConversationRecord */
        ConversationRecord: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /** Revision */
            revision: number;
        };
        /** ConversationRunRecord */
        ConversationRunRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "conversation_run";
            data: components["schemas"]["RunRecord"];
        };
        /** Criterion */
        Criterion: {
            /** Id */
            id: string;
            /** Text */
            text: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "INCLUSION" | "EXCLUSION";
            /**
             * Applicability
             * @enum {string}
             */
            applicability: "TITLE_ABSTRACT" | "FULL_TEXT" | "BOTH";
        };
        /** DecisionPage */
        DecisionPage: {
            /** Items */
            items: components["schemas"]["CellDecision"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** DecisionRecord */
        DecisionRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "decision";
            data: components["schemas"]["CellDecision"];
        };
        /** DecisionWrite */
        DecisionWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Proposal Id */
            proposal_id: string;
            /** Expected Revision */
            expected_revision: number;
            /**
             * Action
             * @enum {string}
             */
            action: "APPROVED" | "CORRECTED" | "REJECTED";
            /**
             * Value
             * @default null
             */
            value: string | boolean | components["schemas"]["NumericValue"] | string[] | components["schemas"]["ExperimentalResult"][] | null;
            /**
             * Value State
             * @default null
             */
            value_state: ("FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING") | null;
            /**
             * Rationale
             * @default null
             */
            rationale: string | null;
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
        /** DocumentVersionRecord */
        DocumentVersionRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "document_version";
            data: components["schemas"]["PortableDocumentVersion"];
        };
        /** EmptyArgs */
        EmptyArgs: Record<string, never>;
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
        /** EvidenceRecord */
        EvidenceRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "evidence";
            data: components["schemas"]["Evidence"];
        };
        /** EvidenceTextRequest */
        EvidenceTextRequest: {
            /** Evidence Id */
            evidence_id: string;
            /** Path */
            path: string;
            /** Offset */
            offset?: number | null;
        };
        /** EvidenceTextView */
        EvidenceTextView: {
            evidence: components["schemas"]["Evidence"];
            /** Title */
            title: string;
            /** Media Type */
            media_type: string;
            /** Text */
            text: string;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
        };
        /** ExperimentalResult */
        ExperimentalResult: {
            /** Metric */
            metric: string;
            number: components["schemas"]["NumericValue"];
            /** Dataset */
            dataset: string | null;
            /** Condition */
            condition: string | null;
            /** Unit */
            unit: string | null;
            /** Baseline */
            baseline: string | null;
            /**
             * Direction
             * @enum {string}
             */
            direction: "HIGHER_BETTER" | "LOWER_BETTER" | "UNSPECIFIED";
        };
        /** ExportArtifact */
        ExportArtifact: {
            /** Id */
            id: string;
            /** Filename */
            filename: string;
            /** Media Type */
            media_type: string;
            /** Bytes */
            bytes: number;
            /** Sha256 */
            sha256: string;
        };
        /** ExportCreate */
        ExportCreate: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Preview Id */
            preview_id: string;
        };
        /** ExportData */
        ExportData: {
            /** Offset */
            offset: number;
            /** Total */
            total: number;
            /** Data Base64 */
            data_base64: string;
        };
        /** ExportOptions */
        ExportOptions: {
            /**
             * Format
             * @enum {string}
             */
            format: "json" | "markdown" | "csv_studies" | "csv_results" | "backup" | "bibtex" | "ris" | "csl_json";
            /**
             * Excel
             * @default false
             */
            excel: boolean;
            /**
             * Include Pdfs
             * @default false
             */
            include_pdfs: boolean;
            /** Source Ids */
            source_ids?: string[];
        };
        /** ExportPreview */
        ExportPreview: {
            /** Id */
            id: string;
            /**
             * Format
             * @enum {string}
             */
            format: "json" | "markdown" | "csv_studies" | "csv_results" | "backup" | "bibtex" | "ris" | "csl_json";
            /** Bytes */
            bytes: number;
            /** Pdf Bytes */
            pdf_bytes: number;
            /** Records */
            records: number;
            /** Counts */
            counts: {
                [key: string]: number;
            };
            /** Omitted Records */
            omitted_records: number;
            /**
             * Sensitivity
             * @default EXCERPTS_AND_RESEARCH_MAY_BE_SENSITIVE
             * @constant
             */
            sensitivity: "EXCERPTS_AND_RESEARCH_MAY_BE_SENSITIVE";
            /** Bibliography Scope */
            bibliography_scope?: "METADATA_ONLY_NO_ABSTRACT_NOTES_OR_ATTACHMENTS" | null;
            /** Bibliography */
            bibliography?: components["schemas"]["Source"][];
            /** Incomplete Sources */
            incomplete_sources?: string[];
        };
        /** ExternalExtraction */
        ExternalExtraction: {
            proposal: components["schemas"]["ExternalProposalWrite"];
            /** Declared Model */
            declared_model?: string | null;
        };
        /** ExternalNote */
        ExternalNote: {
            /** Id */
            id: string;
            /** Artifact Id */
            artifact_id: string;
            /** Revision */
            revision: number;
            /** Previous Version Id */
            previous_version_id: string | null;
            /** Run Id */
            run_id?: null;
            /** Text */
            text: string;
            /** Evidence */
            evidence: components["schemas"]["Evidence"][];
            /**
             * Origin
             * @default EXTERNAL_CLIENT
             * @constant
             */
            origin: "EXTERNAL_CLIENT";
            /** Connection Id */
            connection_id: string;
            /** Declared Model */
            declared_model: string | null;
            /**
             * Model Validation
             * @default CLIENT_DECLARED_UNVERIFIED
             * @constant
             */
            model_validation: "CLIENT_DECLARED_UNVERIFIED";
            /**
             * Review State
             * @default UNREVIEWED
             * @enum {string}
             */
            review_state: "UNREVIEWED" | "APPROVED" | "REJECTED";
            /** Rationale */
            rationale?: string | null;
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
        };
        /** ExternalNotePage */
        ExternalNotePage: {
            /** Items */
            items: components["schemas"]["ExternalNote"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ExternalNoteRecord */
        ExternalNoteRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "external_note";
            data: components["schemas"]["ExternalNote"];
        };
        /** ExternalNoteReview */
        ExternalNoteReview: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Expected Revision */
            expected_revision: number;
            /**
             * Action
             * @enum {string}
             */
            action: "APPROVED" | "REJECTED";
            /** Rationale */
            rationale: string;
        };
        /** ExternalNoteWrite */
        ExternalNoteWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Text */
            text: string;
            /** Evidence Ids */
            evidence_ids: string[];
            /** Declared Model */
            declared_model?: string | null;
        };
        /** ExternalProposalWrite */
        ExternalProposalWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Value */
            value: string | boolean | components["schemas"]["NumericValue"] | string[] | components["schemas"]["ExperimentalResult"][] | null;
            /**
             * Value State
             * @enum {string}
             */
            value_state: "FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING";
            /** Form Version Id */
            form_version_id: string;
            /** Source Id */
            source_id: string;
            /** Field Key */
            field_key: string;
            /** Evidence Ids */
            evidence_ids: string[];
            /** Run Id */
            run_id?: null;
            /** Rationale */
            rationale: string;
        };
        /** ExtractionProposal */
        ExtractionProposal: {
            /** Value */
            value: string | boolean | components["schemas"]["NumericValue"] | string[] | components["schemas"]["ExperimentalResult"][] | null;
            /**
             * Value State
             * @enum {string}
             */
            value_state: "FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING";
            /** Id */
            id: string;
            /** Form Version Id */
            form_version_id: string;
            /** Field Origin Form Version Id */
            field_origin_form_version_id: string;
            /** Source Id */
            source_id: string;
            /** Field Key */
            field_key: string;
            /** Evidence Ids */
            evidence_ids: string[];
            /** Run Id */
            run_id: string | null;
            /** Rationale */
            rationale: string;
            /**
             * Origin
             * @enum {string}
             */
            origin: "HUMAN_CLIENT" | "MODEL_RUN" | "COVERAGE_CHECK" | "EXTERNAL_CLIENT";
            /** Declared Model */
            declared_model?: string | null;
            /** Principal */
            principal: string;
            /** Model */
            model: string | null;
            /**
             * Coverage
             * @enum {string}
             */
            coverage: "CITED_EVIDENCE_ONLY" | "SEARCH" | "PARTIAL_SCAN" | "FULL_SCAN";
            /** Source Kinds */
            source_kinds: string[];
            visual: components["schemas"]["VisualProvenance"] | null;
            /** Created At */
            created_at: string;
            /**
             * Review State
             * @default UNREVIEWED
             * @enum {string}
             */
            review_state: "UNREVIEWED" | "APPROVED" | "CORRECTED" | "REJECTED";
        };
        /** FieldDefinition */
        FieldDefinition: {
            /** Key */
            key: string;
            /** Label */
            label: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "text" | "number" | "boolean" | "enum" | "list" | "experimental_result";
            /** Question */
            question: string;
            /** Definition */
            definition: string;
            /**
             * Unit
             * @default null
             */
            unit: string | null;
            /** Rules */
            rules?: string[];
            /**
             * Required
             * @default false
             */
            required: boolean;
            /** Options */
            options?: string[];
        };
        /** FormPage */
        FormPage: {
            /** Items */
            items: components["schemas"]["FormVersion"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** FormRecord */
        FormRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "form";
            data: components["schemas"]["FormVersion"];
        };
        /** FormVersion */
        FormVersion: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Revision */
            revision: number;
            /** Name */
            name: string;
            /** Fields */
            fields: components["schemas"]["FieldDefinition"][];
            /** Field Origins */
            field_origins: {
                [key: string]: string;
            };
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
        };
        /** FormWrite */
        FormWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Name */
            name: string;
            /** Expected Revision */
            expected_revision: number;
            /** Fields */
            fields: components["schemas"]["FieldDefinition"][];
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
        /** ImportCommit */
        ImportCommit: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Preview Id */
            preview_id: string;
            /**
             * Confirmed
             * @constant
             */
            confirmed: true;
            /** Expected Mapping Revision */
            expected_mapping_revision: number;
        };
        /** ImportEvent */
        ImportEvent: {
            /** Import Id */
            import_id: string;
            /** Imported At */
            imported_at: string;
        };
        /** ImportEvidenceReference */
        ImportEvidenceReference: {
            /** Evidence Id */
            evidence_id: string;
            /** Origin Group Id */
            origin_group_id: string;
        };
        /** ImportMappingPart */
        ImportMappingPart: {
            /** Idempotency Key */
            idempotency_key: string;
            original: components["schemas"]["SourceIdentity"];
            target: components["schemas"]["SourceIdentity"];
            /** Contents */
            contents: components["schemas"]["ContentRemap"][];
            /** Offset */
            offset: number;
            /** Final */
            final: boolean;
            /** Expected Revision */
            expected_revision: number;
        };
        /** ImportMappingState */
        ImportMappingState: {
            /** Revision */
            revision: number;
            /** Mapped Sources */
            mapped_sources: number;
            /** Total Sources */
            total_sources: number;
        };
        /** ImportPage */
        ImportPage: {
            /** Items */
            items: components["schemas"]["ImportedNotebook"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ImportPreview */
        ImportPreview: {
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Profile Instance Id */
            profile_instance_id: string;
            /** Records */
            records: number;
            /** Pdf Bytes */
            pdf_bytes: number;
            /** Source Count */
            source_count: number;
            /**
             * Mapping Revision
             * @default 0
             */
            mapping_revision: number;
            /**
             * Authority
             * @default IMPORTED_HISTORY_ONLY
             * @constant
             */
            authority: "IMPORTED_HISTORY_ONLY";
        };
        /** ImportReference */
        ImportReference: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "form" | "protocol" | "proposal" | "evidence" | "artifact";
            /** Identity */
            identity: string;
            /** Origin Group Id */
            origin_group_id: string;
        };
        /** ImportSourcePage */
        ImportSourcePage: {
            /** Items */
            items: components["schemas"]["SourceAccess"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ImportVisibility */
        ImportVisibility: {
            /** Visible */
            visible: boolean;
            /** Records */
            records: number;
            /** Omitted Records */
            omitted_records: number;
        };
        /** ImportedNotebook */
        ImportedNotebook: {
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Imported At */
            imported_at: string;
            /** Record Count */
            record_count: number;
            /**
             * Origin
             * @default IMPORTED
             * @constant
             */
            origin: "IMPORTED";
            /**
             * Authority
             * @default HISTORY_ONLY_NO_LOCAL_APPROVAL
             * @constant
             */
            authority: "HISTORY_ONLY_NO_LOCAL_APPROVAL";
        };
        /** ImportedRecordDetail */
        ImportedRecordDetail: {
            /** Record */
            record: components["schemas"]["SourceRecord"] | components["schemas"]["SnapshotRecord"] | components["schemas"]["DocumentVersionRecord"] | components["schemas"]["PagePartRecord"] | components["schemas"]["EvidenceRecord"] | components["schemas"]["FormRecord"] | components["schemas"]["ProtocolRecord"] | components["schemas"]["ProposalRecord"] | components["schemas"]["DecisionRecord"] | components["schemas"]["ScreeningRecord"] | components["schemas"]["ConversationRunRecord"] | components["schemas"]["JobHistoryRecord"] | components["schemas"]["UnitHistoryRecord"] | components["schemas"]["ResearchHistoryRecord"] | components["schemas"]["ResearchPreviewRecord"] | components["schemas"]["ArtifactRecord"] | components["schemas"]["ExternalNoteRecord"] | components["schemas"]["NotePreviewRecord"] | components["schemas"]["OutboxHistoryRecord"];
        };
        /** ImportedRecordPage */
        ImportedRecordPage: {
            /** Items */
            items: (components["schemas"]["SourceRecord"] | components["schemas"]["SnapshotRecord"] | components["schemas"]["DocumentVersionRecord"] | components["schemas"]["PagePartRecord"] | components["schemas"]["EvidenceRecord"] | components["schemas"]["FormRecord"] | components["schemas"]["ProtocolRecord"] | components["schemas"]["ProposalRecord"] | components["schemas"]["DecisionRecord"] | components["schemas"]["ScreeningRecord"] | components["schemas"]["ConversationRunRecord"] | components["schemas"]["JobHistoryRecord"] | components["schemas"]["UnitHistoryRecord"] | components["schemas"]["ResearchHistoryRecord"] | components["schemas"]["ResearchPreviewRecord"] | components["schemas"]["ArtifactRecord"] | components["schemas"]["ExternalNoteRecord"] | components["schemas"]["NotePreviewRecord"] | components["schemas"]["OutboxHistoryRecord"])[];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Omitted Records */
            omitted_records: number;
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
        /** JobAccessPage */
        JobAccessPage: {
            /** Items */
            items: components["schemas"]["SourceAccess"][];
            /** Documents */
            documents: [
                string,
                string
            ][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** JobControl */
        JobControl: {
            /** Idempotency Key */
            idempotency_key: string;
            /**
             * Action
             * @enum {string}
             */
            action: "resume" | "pause" | "cancel" | "skip_uncertain";
            /** Expected Revision */
            expected_revision: number;
        };
        /** JobHistoryRecord */
        JobHistoryRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "job";
            data: components["schemas"]["JobRecord"];
        };
        /** JobPage */
        JobPage: {
            /** Items */
            items: components["schemas"]["JobRecord"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** JobRecord */
        JobRecord: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * Revision
             * @default 0
             */
            revision: number;
            /**
             * State
             * @default PAUSED
             * @enum {string}
             */
            state: "QUEUED" | "RUNNING" | "PAUSED" | "WAITING_PROVIDER" | "PARTIAL" | "SUCCEEDED" | "FAILED" | "CANCELLED";
            /** Reason */
            reason?: string | null;
            request: components["schemas"]["JobWrite"];
            profile: components["schemas"]["ProviderProfile"];
            schema_plan: components["schemas"]["SchemaPlan"];
            /** Total Units */
            total_units: number;
            /**
             * Completed Units
             * @default 0
             */
            completed_units: number;
            /**
             * Failed Units
             * @default 0
             */
            failed_units: number;
            /**
             * Cached Units
             * @default 0
             */
            cached_units: number;
            /** Created At */
            created_at: string;
        };
        /** JobWrite */
        JobWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Form Version Id */
            form_version_id: string;
            /** Field Keys */
            field_keys: string[];
            /** Profile Id */
            profile_id: string;
            /**
             * Method
             * @enum {string}
             */
            method: "SEARCH" | "FULL_SCAN";
            /**
             * Max Chunks Per Unit
             * @default 500
             */
            max_chunks_per_unit: number;
            /**
             * Context Tokens
             * @default 32768
             */
            context_tokens: number;
            /**
             * Max Output Tokens
             * @default 2048
             */
            max_output_tokens: number;
            /** @default null */
            ollama_options: components["schemas"]["OllamaOptions"] | null;
            /**
             * Force New
             * @default false
             */
            force_new: boolean;
        };
        /** MatrixCell */
        MatrixCell: {
            /** Value */
            value: string | boolean | components["schemas"]["NumericValue"] | string[] | components["schemas"]["ExperimentalResult"][] | null;
            /** Value State */
            value_state: ("FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING") | null;
            /** Form Version Id */
            form_version_id: string;
            /** Field Origin Form Version Id */
            field_origin_form_version_id: string;
            /** Decision Form Version Id */
            decision_form_version_id?: string | null;
            /** Source Id */
            source_id: string;
            /** Source Title */
            source_title: string;
            /** Field Key */
            field_key: string;
            /**
             * Revision
             * @default 0
             */
            revision: number;
            /**
             * Review State
             * @default UNREVIEWED
             * @enum {string}
             */
            review_state: "UNREVIEWED" | "APPROVED" | "CORRECTED" | "REJECTED";
            /** Proposal Id */
            proposal_id?: string | null;
        };
        /** MatrixPage */
        MatrixPage: {
            /** Items */
            items: components["schemas"]["MatrixCell"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** MatrixQuery */
        MatrixQuery: {
            /** Form Version Id */
            form_version_id: string;
            /** Offset */
            offset: number;
            /**
             * Source Id
             * @default null
             */
            source_id: string | null;
            /**
             * Review State
             * @default null
             */
            review_state: ("UNREVIEWED" | "APPROVED" | "CORRECTED" | "REJECTED") | null;
            /**
             * Value State
             * @default null
             */
            value_state: ("FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING") | null;
        };
        /** McpNotebookStatus */
        McpNotebookStatus: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /** Name */
            name: string;
            /** Revision */
            revision: number;
            /** Available Sources */
            available_sources: number;
            /** Snapshot Members */
            snapshot_members: number;
            /** Capabilities */
            capabilities: string[];
            coverage: components["schemas"]["DocumentPage"];
            /**
             * Evidence Max Characters
             * @default 2400
             */
            evidence_max_characters: number;
            /**
             * Request Max Bytes
             * @default 65536
             */
            request_max_bytes: number;
        };
        /** McpProtocol */
        McpProtocol: {
            protocol: components["schemas"]["ProtocolVersion"] | null;
            form: components["schemas"]["FormVersion"] | null;
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
        /** NoteApproval */
        NoteApproval: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Preview Id */
            preview_id: string;
            /** Expected Artifact Revision */
            expected_artifact_revision: number;
        };
        /** NotePreview */
        NotePreview: {
            /** Id */
            id: string;
            /** Uuid */
            uuid: string;
            /** Artifact Version Id */
            artifact_version_id: string;
            /** Artifact Revision */
            artifact_revision: number;
            /** Run Id */
            run_id: string | null;
            /** Source Id */
            source_id: string;
            destination: components["schemas"]["SourceIdentity"];
            /** Title */
            title: string;
            /** Html */
            html: string;
            /** Html Sha256 */
            html_sha256: string;
            /** Created At */
            created_at: string;
            /**
             * Native Undo Verified
             * @default false
             * @constant
             */
            native_undo_verified: false;
        };
        /** NotePreviewRecord */
        NotePreviewRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "note_preview";
            data: components["schemas"]["NotePreview"];
        };
        /** NotePreviewWrite */
        NotePreviewWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Artifact Version Id */
            artifact_version_id: string;
            /** Source Id */
            source_id: string;
            /** Title */
            title: string;
            /**
             * Locale
             * @default pt-BR
             * @enum {string}
             */
            locale: "pt-BR" | "en-US";
        };
        /** NoteReadback */
        NoteReadback: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Uuid */
            uuid: string;
            /** Library Id */
            library_id: number;
            /** Parent Key */
            parent_key: string;
            /** Note Key */
            note_key: string;
            /** Html Sha256 */
            html_sha256: string;
            /**
             * Origin
             * @constant
             */
            origin: "ai";
            /**
             * Tag
             * @constant
             */
            tag: "evidra:ai";
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
        /** NumericValue */
        NumericValue: {
            /** Original */
            original: string;
            /** Normalized */
            normalized: number;
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
        /** OriginalViewChunk */
        OriginalViewChunk: {
            /** Unit Index */
            unit_index: number;
            /** Unit Count */
            unit_count: number;
            /** Resource Id */
            resource_id: string;
            /** Extraction Start */
            extraction_start: number;
            /** Extraction End */
            extraction_end: number;
            /** Target First */
            target_first: number;
            /** Target Last */
            target_last: number;
            /**
             * Format
             * @enum {string}
             */
            format: "structure" | "source" | "plain";
            /** Content */
            content: string;
            /** Offset */
            offset: number;
            /** Total */
            total: number;
            /** Payload Sha256 */
            payload_sha256: string;
            evidence: components["schemas"]["Evidence"];
            /** Title */
            title: string;
            /** Media Type */
            media_type: string;
        };
        /** OriginalViewRequest */
        OriginalViewRequest: {
            /** Evidence Id */
            evidence_id: string;
            /** Path */
            path: string;
            /** Unit Index */
            unit_index?: number | null;
            /**
             * Representation
             * @default structure
             * @enum {string}
             */
            representation: "structure" | "source";
            /**
             * Offset
             * @default 0
             */
            offset: number;
        };
        /** OutboxBegin */
        OutboxBegin: {
            intent: components["schemas"]["ApprovedWriteOutbox"];
            /** May Create */
            may_create: boolean;
        };
        /** OutboxHistoryRecord */
        OutboxHistoryRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "outbox_history";
            data: components["schemas"]["ApprovedWriteOutbox"];
        };
        /** OutboxPage */
        OutboxPage: {
            /** Items */
            items: components["schemas"]["ApprovedWriteOutbox"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** PagePartRecord */
        PagePartRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "page_part";
            data: components["schemas"]["PortablePagePart"];
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
        /** PortableDocumentVersion */
        PortableDocumentVersion: {
            /** Id */
            id: string;
            /** Document Id */
            document_id: string;
            /** Source Id */
            source_id: string;
            /** Content Key */
            content_key: string;
            /** Content Version */
            content_version: string;
            /**
             * Source Kind
             * @enum {string}
             */
            source_kind: "pdf" | "abstract" | "human_note" | "human_annotation" | "ai_artifact" | "approved_data" | "text_attachment";
            /** Sha256 */
            sha256: string;
            /** Parser Version */
            parser_version: string;
            /** Policy Version */
            policy_version: string;
            /**
             * Coverage
             * @enum {string}
             */
            coverage: "METADATA_ONLY" | "PARTIAL_TEXT" | "FULL_TEXT_PARSED" | "NEEDS_OCR" | "UNREADABLE" | "MISSING_FILE" | "STALE";
            /** Page Count */
            page_count: number;
            /** Pages Processed */
            pages_processed: number;
            /** Bytes Processed */
            bytes_processed: number;
            /** Created At */
            created_at: string;
        };
        /** PortablePagePart */
        PortablePagePart: {
            /** Document Version Id */
            document_version_id: string;
            /** Page Index */
            page_index: number;
            /** Page Label */
            page_label: string | null;
            /** Start */
            start: number;
            /** Original Text */
            original_text: string;
            /** Final */
            final: boolean;
            /**
             * Quality
             * @enum {string}
             */
            quality: "TEXT" | "EMPTY" | "UNMAPPABLE" | "ERROR";
            /** Diagnostic */
            diagnostic: string | null;
            /** Crop Box */
            crop_box: [
                number,
                number,
                number,
                number
            ] | null;
            /** Media Box */
            media_box: [
                number,
                number,
                number,
                number
            ] | null;
            /** Bbox */
            bbox: [
                number,
                number,
                number,
                number
            ] | null;
            /** Rotation */
            rotation: number | null;
            /** Char Boxes */
            char_boxes: ([
                number,
                number,
                number,
                number
            ] | null)[];
            /** Mapping Verified */
            mapping_verified: boolean;
        };
        /** PortableSnapshot */
        PortableSnapshot: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Revision */
            revision: number;
            /** Created At */
            created_at: string;
            /** Member Ids */
            member_ids: string[];
            selection: components["schemas"]["SelectionSpec"] | null;
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
            /**
             * Digest
             * @default null
             */
            digest: string | null;
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
        /** ProposalPage */
        ProposalPage: {
            /** Items */
            items: components["schemas"]["ExtractionProposal"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ProposalRecord */
        ProposalRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "proposal";
            data: components["schemas"]["ExtractionProposal"];
        };
        /** ProposalWrite */
        ProposalWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Value */
            value: string | boolean | components["schemas"]["NumericValue"] | string[] | components["schemas"]["ExperimentalResult"][] | null;
            /**
             * Value State
             * @enum {string}
             */
            value_state: "FOUND" | "NOT_FOUND_IN_SEARCH" | "NOT_REPORTED_CANDIDATE" | "NOT_APPLICABLE" | "UNREADABLE" | "CONFLICTING";
            /** Form Version Id */
            form_version_id: string;
            /** Source Id */
            source_id: string;
            /** Field Key */
            field_key: string;
            /** Evidence Ids */
            evidence_ids: string[];
            /**
             * Run Id
             * @default null
             */
            run_id: string | null;
            /** Rationale */
            rationale: string;
        };
        /** ProtocolPage */
        ProtocolPage: {
            /** Items */
            items: components["schemas"]["ProtocolVersion"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ProtocolRecord */
        ProtocolRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "protocol";
            data: components["schemas"]["ProtocolVersion"];
        };
        /** ProtocolVersion */
        ProtocolVersion: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Revision */
            revision: number;
            /** Question */
            question: string;
            /** Objective */
            objective: string;
            /**
             * Review Type
             * @enum {string}
             */
            review_type: "EXPLORATORY" | "SYSTEMATIC";
            /** Form Version Id */
            form_version_id: string;
            /** Criteria */
            criteria: components["schemas"]["Criterion"][];
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
        };
        /** ProtocolWrite */
        ProtocolWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Question */
            question: string;
            /** Objective */
            objective: string;
            /**
             * Review Type
             * @enum {string}
             */
            review_type: "EXPLORATORY" | "SYSTEMATIC";
            /** Form Version Id */
            form_version_id: string;
            /** Criteria */
            criteria: components["schemas"]["Criterion"][];
            /** Expected Revision */
            expected_revision: number;
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
        /** ReadArgs */
        ReadArgs: {
            /** Evidence Id */
            evidence_id: string;
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
        /** ResearchAccessPage */
        ResearchAccessPage: {
            /** Items */
            items: components["schemas"]["SourceAccess"][];
            /** Documents */
            documents: [
                string,
                string
            ][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ResearchCell */
        ResearchCell: {
            /** Id */
            id: string;
            cell: components["schemas"]["MatrixCell"];
            /** Evidence Ids */
            evidence_ids: string[];
            /**
             * Basis
             * @enum {string}
             */
            basis: "REVIEWED" | "UNREVIEWED";
        };
        /** ResearchControl */
        ResearchControl: {
            /** Idempotency Key */
            idempotency_key: string;
            /**
             * Action
             * @enum {string}
             */
            action: "start" | "cancel" | "acknowledge_uncertain";
            /** Expected Revision */
            expected_revision: number;
        };
        /** ResearchCoverage */
        ResearchCoverage: {
            /** Snapshot Members */
            snapshot_members: number;
            /** Available Studies */
            available_studies: number;
            /** Included Studies */
            included_studies: number;
            /**
             * Matrix Cells Total
             * @default 0
             */
            matrix_cells_total: number;
            /**
             * Reviewed Cells
             * @default 0
             */
            reviewed_cells: number;
            /**
             * Unreviewed Cells
             * @default 0
             */
            unreviewed_cells: number;
            /**
             * Excluded Cells
             * @default 0
             */
            excluded_cells: number;
            /** Evidence Chunks */
            evidence_chunks: number;
            /** Candidate Chunks */
            candidate_chunks: number;
            /**
             * Complete
             * @default false
             */
            complete: boolean;
            /**
             * Reason
             * @enum {string}
             */
            reason: "MATRIX_COVERAGE" | "STAGE_EXCERPTS_ONLY" | "RETRIEVED_CHUNKS_ONLY";
        };
        /** ResearchHistoryRecord */
        ResearchHistoryRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "research_run";
            data: components["schemas"]["ResearchRun"];
        };
        /** ResearchInputs */
        ResearchInputs: {
            protocol: components["schemas"]["ProtocolVersion"];
            /** Studies */
            studies: components["schemas"]["ResearchStudy"][];
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Cells */
            cells: components["schemas"]["ResearchCell"][];
            /** Evidence */
            evidence: components["schemas"]["Evidence"][];
            coverage: components["schemas"]["ResearchCoverage"];
        };
        /** ResearchPrepare */
        ResearchPrepare: {
            /** Idempotency Key */
            idempotency_key: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "SCREENING" | "SYNTHESIS" | "AUDIT";
            /** Protocol Version Id */
            protocol_version_id: string;
            /** Profile Id */
            profile_id: string;
            /**
             * Source Id
             * @default null
             */
            source_id: string | null;
            /**
             * Stage
             * @default null
             */
            stage: ("TITLE_ABSTRACT" | "FULL_TEXT") | null;
            /** Question */
            question: string;
            /**
             * Pasted Text
             * @default
             */
            pasted_text: string;
            /**
             * Retrieval Query
             * @default
             */
            retrieval_query: string;
            /**
             * Include Unreviewed
             * @default false
             */
            include_unreviewed: boolean;
            /**
             * Context Tokens
             * @default 32768
             */
            context_tokens: number;
            /**
             * Max Output Tokens
             * @default 4096
             */
            max_output_tokens: number;
            /** @default null */
            ollama_options: components["schemas"]["OllamaOptions"] | null;
        };
        /** ResearchPreview */
        ResearchPreview: {
            /** Run Id */
            run_id: string;
            request: components["schemas"]["ResearchPrepare"];
            /** Prompt */
            prompt: string;
            schema_plan: components["schemas"]["SchemaPlan"];
            profile: components["schemas"]["ProviderProfile"];
            inputs: components["schemas"]["ResearchInputs"];
            /** Estimated Input Tokens */
            estimated_input_tokens: number;
            /**
             * Estimate Method
             * @default utf8-bytes-plus-overhead-v1
             * @constant
             */
            estimate_method: "utf8-bytes-plus-overhead-v1";
        };
        /** ResearchPreviewRecord */
        ResearchPreviewRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "research_preview";
            data: components["schemas"]["ResearchPreview"];
        };
        /** ResearchRun */
        ResearchRun: {
            /** Id */
            id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * Revision
             * @default 0
             */
            revision: number;
            /**
             * Kind
             * @enum {string}
             */
            kind: "SCREENING" | "SYNTHESIS" | "AUDIT";
            /**
             * State
             * @default PREPARED
             * @enum {string}
             */
            state: "PREPARED" | "RUNNING" | "PAUSED" | "WAITING_PROVIDER" | "BILLING_UNKNOWN" | "COMPLETE" | "PARTIAL" | "FAILED" | "CANCELLED";
            /** Reason */
            reason?: string | null;
            /** Profile Id */
            profile_id: string;
            /** Call Ids */
            call_ids?: string[];
            /**
             * Checkpointed
             * @default false
             */
            checkpointed: boolean;
            /** Artifact Version Id */
            artifact_version_id?: string | null;
            /** Created At */
            created_at: string;
        };
        /** ResearchRunPage */
        ResearchRunPage: {
            /** Items */
            items: components["schemas"]["ResearchRun"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** ResearchStudy */
        ResearchStudy: {
            /** Source Id */
            source_id: string;
            identity: components["schemas"]["SourceIdentity"];
            /** Title */
            title: string;
            /** Doi */
            doi: string | null;
            /** Year */
            year: number | null;
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
        /** RunAccess */
        RunAccess: {
            /** Items */
            items: components["schemas"]["SourceAccess"][];
            /** Documents */
            documents: [
                string,
                string
            ][];
        };
        /** RunPage */
        RunPage: {
            /** Items */
            items: components["schemas"]["RunSummary"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** RunPrepare */
        RunPrepare: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Expected Revision */
            expected_revision: number;
            /** Profile Id */
            profile_id: string;
            /** Question */
            question: string;
            /** Context Tokens */
            context_tokens: number;
            /** Max Output Tokens */
            max_output_tokens: number;
            /** @default null */
            ollama_options: components["schemas"]["OllamaOptions"] | null;
            /**
             * Evidence Id
             * @default null
             */
            evidence_id: string | null;
            /**
             * Document Version Id
             * @default null
             */
            document_version_id: string | null;
            /**
             * Embedding Profile Id
             * @default null
             */
            embedding_profile_id: string | null;
            /**
             * Preview Operation Id
             * @default null
             */
            preview_operation_id: string | null;
        };
        /** RunRecord */
        RunRecord: {
            /** Id */
            id: string;
            /** Conversation Id */
            conversation_id: string;
            /** Conversation Revision */
            conversation_revision: number;
            /**
             * State
             * @enum {string}
             */
            state: "PREPARED" | "RUNNING" | "COMPLETE" | "FAILED" | "CANCELLED";
            profile: components["schemas"]["ProviderProfile"];
            ollama_options?: components["schemas"]["OllamaOptions"] | null;
            /** Question */
            question: string;
            /**
             * Prompt Version
             * @default conversation-v1
             * @enum {string}
             */
            prompt_version: "conversation-v1" | "conversation-v2";
            context: components["schemas"]["ContextPreview"];
            /** Categories */
            categories: ("excerpts" | "metadata" | "images" | "history")[];
            visual?: components["schemas"]["VisualProvenance"] | null;
            output?: components["schemas"]["Answer"] | null;
            /** Error */
            error?: string | null;
            /** Termination Reason */
            termination_reason?: string | null;
            /** Created At */
            created_at: string;
            /** Anchor Status */
            anchor_status?: "VERIFIED_EXISTENCE_ONLY" | null;
            /**
             * Support Status
             * @default PROPOSED
             * @constant
             */
            support_status: "PROPOSED";
            /**
             * Human Review
             * @default NOT_REVIEWED
             * @constant
             */
            human_review: "NOT_REVIEWED";
        };
        /** RunSummary */
        RunSummary: {
            /** Id */
            id: string;
            /** Question */
            question: string;
            /** State */
            state: string;
            /** Model */
            model: string;
            /** Error */
            error: string | null;
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
        /** SchemaPlan */
        SchemaPlan: {
            /** System */
            system: string;
            /** Output Schema */
            output_schema: {
                [key: string]: unknown;
            } | null;
            /**
             * Mode
             * @enum {string}
             */
            mode: "native" | "local_validation" | "none";
        };
        /** ScreeningDecision */
        ScreeningDecision: {
            /** Id */
            id: string;
            /** Protocol Version Id */
            protocol_version_id: string;
            /** Source Id */
            source_id: string;
            /**
             * Stage
             * @enum {string}
             */
            stage: "TITLE_ABSTRACT" | "FULL_TEXT";
            /** Reviewer */
            reviewer: string;
            /**
             * Decision
             * @enum {string}
             */
            decision: "INCLUDE" | "EXCLUDE" | "UNCERTAIN";
            /** Criterion Ids */
            criterion_ids: string[];
            /** Rationale */
            rationale: string;
            /** Revision */
            revision: number;
            /** Previous Decision */
            previous_decision: ("INCLUDE" | "EXCLUDE" | "UNCERTAIN") | null;
            /** Author */
            author: string;
            /** Created At */
            created_at: string;
        };
        /** ScreeningOutput */
        ScreeningOutput: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "SCREENING";
            /**
             * Decision
             * @enum {string}
             */
            decision: "INCLUDE" | "EXCLUDE" | "UNCERTAIN";
            /** Criterion Ids */
            criterion_ids: string[];
            /** Evidence Ids */
            evidence_ids: string[];
            /** Rationale */
            rationale: string;
        };
        /** ScreeningPage */
        ScreeningPage: {
            /** Items */
            items: components["schemas"]["ScreeningRow"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
            /** Snapshot Members */
            snapshot_members: number;
            /** Currently Available Members */
            currently_available_members: number;
            /** Observed Decision Events */
            observed_decision_events: number;
            /** Historical Search Count */
            historical_search_count?: null;
        };
        /** ScreeningRecord */
        ScreeningRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "screening";
            data: components["schemas"]["ScreeningDecision"];
        };
        /** ScreeningRow */
        ScreeningRow: {
            /** Source Id */
            source_id: string;
            /**
             * Stage
             * @enum {string}
             */
            stage: "TITLE_ABSTRACT" | "FULL_TEXT";
            /** Decisions */
            decisions: components["schemas"]["ScreeningDecision"][];
            /** Conflict */
            conflict: boolean;
        };
        /** ScreeningWrite */
        ScreeningWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Protocol Version Id */
            protocol_version_id: string;
            /** Source Id */
            source_id: string;
            /**
             * Stage
             * @enum {string}
             */
            stage: "TITLE_ABSTRACT" | "FULL_TEXT";
            /** Reviewer */
            reviewer: string;
            /**
             * Decision
             * @enum {string}
             */
            decision: "INCLUDE" | "EXCLUDE" | "UNCERTAIN";
            /** Criterion Ids */
            criterion_ids: string[];
            /** Rationale */
            rationale: string;
            /** Expected Revision */
            expected_revision: number;
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
        /** SnapshotRecord */
        SnapshotRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "snapshot";
            data: components["schemas"]["PortableSnapshot"];
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
        /** SourceArgs */
        SourceArgs: {
            /**
             * Offset
             * @default 0
             */
            offset: number;
            /**
             * Limit
             * @default 20
             */
            limit: number;
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
            /** Media Type */
            media_type?: string | null;
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
        /** SourceRecord */
        SourceRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "source";
            data: components["schemas"]["Source"];
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
        /** SynthesisOutput */
        SynthesisOutput: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "SYNTHESIS";
            /** Sections */
            sections: components["schemas"]["SynthesisSection"][];
            /** Limitations */
            limitations: string[];
        };
        /** SynthesisSection */
        SynthesisSection: {
            /** Heading */
            heading: string;
            /** Text */
            text: string;
            /** Cell Ids */
            cell_ids: string[];
            /** Evidence Ids */
            evidence_ids: string[];
            /**
             * Basis
             * @enum {string}
             */
            basis: "REVIEWED" | "UNREVIEWED" | "MIXED";
            /** Comparability */
            comparability: string;
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
        /** UnitHistoryRecord */
        UnitHistoryRecord: {
            /** Id */
            id: string;
            /**
             * Origin
             * @default LOCAL
             * @enum {string}
             */
            origin: "LOCAL" | "IMPORTED";
            /** Origin Profile Id */
            origin_profile_id: string;
            /** Origin Notebook Id */
            origin_notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string | null;
            /** Access */
            access: components["schemas"]["SourceAccess"][];
            /** Import Id */
            import_id?: string | null;
            /** Imported At */
            imported_at?: string | null;
            /** Original Record Id */
            original_record_id?: string | null;
            /** Origin Group Id */
            origin_group_id?: string | null;
            /** Import Chain */
            import_chain?: components["schemas"]["ImportEvent"][];
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "unit";
            data: components["schemas"]["UnitRecord"];
        };
        /** UnitPage */
        UnitPage: {
            /** Items */
            items: components["schemas"]["UnitRecord"][];
            /** Offset */
            offset: number;
            /** Limit */
            limit: number;
            /** Total */
            total: number;
        };
        /** UnitRecord */
        UnitRecord: {
            /** Id */
            id: string;
            /** Job Id */
            job_id: string;
            /** Source Id */
            source_id: string;
            /** Field Key */
            field_key: string;
            /** Field Origin Form Version Id */
            field_origin_form_version_id: string;
            /**
             * State
             * @default QUEUED
             * @enum {string}
             */
            state: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "BILLING_UNKNOWN";
            /** Reason */
            reason?: string | null;
            /** Coverage */
            coverage: components["schemas"]["AttachmentCoverage"][];
            /**
             * Coverage State
             * @enum {string}
             */
            coverage_state: "SEARCH" | "PARTIAL_SCAN" | "FULL_SCAN";
            /** Batches Total */
            batches_total: number;
            /**
             * Batches Processed
             * @default 0
             */
            batches_processed: number;
            /** Proposal Id */
            proposal_id?: string | null;
            /**
             * Cache Hit
             * @default false
             */
            cache_hit: boolean;
            /** Call Ids */
            call_ids?: string[];
        };
        /** UploadCreate */
        UploadCreate: {
            /** Bytes */
            bytes: number;
            /** Sha256 */
            sha256: string;
        };
        /** UploadPart */
        UploadPart: {
            /** Offset */
            offset: number;
            /** Data Base64 */
            data_base64: string;
        };
        /** UploadReceipt */
        UploadReceipt: {
            /** Id */
            id: string;
            /** Offset */
            offset: number;
            /** Bytes */
            bytes: number;
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
        /** VectorBuild */
        VectorBuild: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Profile Id */
            profile_id: string;
        };
        /** VectorGeneration */
        VectorGeneration: {
            /** Id */
            id: string;
            /** Profile Id */
            profile_id: string;
            /** Model */
            model: string;
            /** Digest */
            digest: string | null;
            /** Dimensions */
            dimensions: number;
            /** Normalized */
            normalized: boolean;
            /** Chunks */
            chunks: number;
        };
        /** VectorJob */
        VectorJob: {
            /** Id */
            id: string;
            /**
             * State
             * @enum {string}
             */
            state: "RUNNING" | "COMPLETE" | "FAILED" | "CANCELLED";
            /** Processed */
            processed: number;
            /** Total */
            total: number;
            /** Error */
            error?: string | null;
            generation?: components["schemas"]["VectorGeneration"] | null;
        };
        /** VisualProvenance */
        VisualProvenance: {
            /** Operation Id */
            operation_id: string;
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
            /** Sha256 */
            sha256: string;
            /** Destination */
            destination: string;
            /**
             * Interpretation
             * @default PROPOSED_REQUIRES_HUMAN_REVIEW
             * @constant
             */
            interpretation: "PROPOSED_REQUIRES_HUMAN_REVIEW";
        };
        /** Write */
        Write: {
            /** Idempotency Key */
            idempotency_key: string;
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
             * Prepared Schema Mode
             * @default null
             */
            prepared_schema_mode: ("native" | "local_validation" | "none") | null;
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
        /** RunEvent */
        RunEvent: {
            /** Cursor */
            cursor: number;
            /**
             * Kind
             * @enum {string}
             */
            kind: "draft" | "complete" | "failed" | "cancelled";
            /**
             * Text
             * @default null
             */
            text: string | null;
            /**
             * Code
             * @default null
             */
            code: string | null;
        };
        /** EventPage */
        EventPage: {
            /** Items */
            items: components["schemas"]["RunEvent"][];
            /** Cursor */
            cursor: number;
            /** State */
            state: string;
        };
        /** McpSetup */
        McpSetup: {
            connection: components["schemas"]["ConnectionRecord"];
            /** Connection File */
            connection_file: string;
            /** Executable */
            executable: string;
        };
        /** Omission */
        Omission: {
            /** Kind */
            kind: string;
            /** Id */
            id: string;
            /**
             * Reason
             * @enum {string}
             */
            reason: "CURRENT_ACCESS_UNAVAILABLE" | "DEPENDENCY_OMITTED";
        };
        /** PortableNotebook */
        PortableNotebook: {
            /**
             * Schema Version
             * @default 1
             * @constant
             */
            schema_version: 1;
            /** Profile Instance Id */
            profile_instance_id: string;
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /** Name */
            name: string;
            /** Exported At */
            exported_at: string;
            /** Records */
            records: (components["schemas"]["SourceRecord"] | components["schemas"]["SnapshotRecord"] | components["schemas"]["DocumentVersionRecord"] | components["schemas"]["PagePartRecord"] | components["schemas"]["EvidenceRecord"] | components["schemas"]["FormRecord"] | components["schemas"]["ProtocolRecord"] | components["schemas"]["ProposalRecord"] | components["schemas"]["DecisionRecord"] | components["schemas"]["ScreeningRecord"] | components["schemas"]["ConversationRunRecord"] | components["schemas"]["JobHistoryRecord"] | components["schemas"]["UnitHistoryRecord"] | components["schemas"]["ResearchHistoryRecord"] | components["schemas"]["ResearchPreviewRecord"] | components["schemas"]["ArtifactRecord"] | components["schemas"]["ExternalNoteRecord"] | components["schemas"]["NotePreviewRecord"] | components["schemas"]["OutboxHistoryRecord"])[];
            /** Omissions */
            omissions: components["schemas"]["Omission"][];
            /**
             * Conventions
             * @default evidra-portable-v1
             * @constant
             */
            conventions: "evidra-portable-v1";
        };
        /** ManifestFile */
        ManifestFile: {
            /** Path */
            path: string;
            /** Bytes */
            bytes: number;
            /** Sha256 */
            sha256: string;
            /** @default null */
            source_identity: components["schemas"]["SourceIdentity"] | null;
            /**
             * Content Key
             * @default null
             */
            content_key: string | null;
            /**
             * Content Version
             * @default null
             */
            content_version: string | null;
        };
        /** BackupManifest */
        BackupManifest: {
            /**
             * Schema Version
             * @default 1
             * @constant
             */
            schema_version: 1;
            /**
             * Format
             * @default evidra-notebook-backup
             * @constant
             */
            format: "evidra-notebook-backup";
            /** Files */
            files: components["schemas"]["ManifestFile"][];
        };
        /** OriginalImage */
        OriginalImage: {
            /** Sha256 */
            sha256: string;
            /** Width */
            width: number;
            /** Height */
            height: number;
            /** Data Base64 */
            data_base64: string;
        };
        /** OriginalLimitation */
        OriginalLimitation: {
            /**
             * Code
             * @enum {string}
             */
            code: "ACTIVE_CONTENT" | "SOURCE_STYLE" | "EXTERNAL_RESOURCE" | "UNSUPPORTED_ELEMENT" | "REMOVED_ATTRIBUTE" | "UNDECLARED_IMAGE" | "IMAGE_FORMAT" | "IMAGE_LIMIT" | "IMAGE_DECODE" | "IMAGE_ANIMATION";
            /** Element */
            element: string;
            /** Reference */
            reference: string;
            /**
             * Count
             * @default 1
             */
            count: number;
        };
        /** OriginalToken */
        OriginalToken: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "start" | "end" | "text" | "image";
            /**
             * Tag
             * @default
             */
            tag: string;
            /** Attributes */
            attributes?: {
                [key: string]: string;
            };
            /**
             * Text
             * @default
             */
            text: string;
            /**
             * Image Index
             * @default null
             */
            image_index: number | null;
        };
        /** OriginalStructure */
        OriginalStructure: {
            /** Tokens */
            tokens: components["schemas"]["OriginalToken"][];
            /** Images */
            images: components["schemas"]["OriginalImage"][];
            /** Limitations */
            limitations: components["schemas"]["OriginalLimitation"][];
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
        /** ConversationCreateCommand */
        ConversationCreateCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.create";
            request: components["schemas"]["ConversationCreate"];
        };
        /** ConversationEventsCommand */
        ConversationEventsCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.events";
            /** Run Id */
            run_id: string;
            /** Cursor */
            cursor: number;
        };
        /** ConversationHistoryCommand */
        ConversationHistoryCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.history";
            /** Conversation Id */
            conversation_id: string;
            /** Offset */
            offset: number;
        };
        /** ConversationListCommand */
        ConversationListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.list";
            /** Offset */
            offset: number;
        };
        /** ConversationPrepareCommand */
        ConversationPrepareCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.prepare";
            /** Conversation Id */
            conversation_id: string;
            request: components["schemas"]["RunPrepare"];
        };
        /** ConversationReadCommand */
        ConversationReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.read";
            /** Conversation Id */
            conversation_id: string;
        };
        /** ConversationRunCommand */
        ConversationRunCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.cancel" | "conversation.run" | "conversation.start";
            /** Run Id */
            run_id: string;
        };
        /** VectorBuildCommand */
        VectorBuildCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.vectors.build";
            request: components["schemas"]["VectorBuild"];
        };
        /** VectorJobCommand */
        VectorJobCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "conversation.vectors.cancel" | "conversation.vectors.read";
            /** Job Id */
            job_id: string;
        };
        ConversationCommand: components["schemas"]["ConversationListCommand"] | components["schemas"]["ConversationCreateCommand"] | components["schemas"]["ConversationReadCommand"] | components["schemas"]["ConversationHistoryCommand"] | components["schemas"]["ConversationPrepareCommand"] | components["schemas"]["ConversationRunCommand"] | components["schemas"]["ConversationEventsCommand"] | components["schemas"]["VectorBuildCommand"] | components["schemas"]["VectorJobCommand"];
        /** PriceConfig */
        PriceConfig: {
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
        /** ProviderBudgetCommand */
        ProviderBudgetCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.budget";
            request: components["schemas"]["BudgetWrite"];
        };
        /** ProviderBudgetReadCommand */
        ProviderBudgetReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.budget.read";
            /**
             * Kind
             * @enum {string}
             */
            kind: "call" | "job" | "session";
            /** Identity */
            identity: string;
        };
        /** ProviderCallsCommand */
        ProviderCallsCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.calls";
            /** Offset */
            offset: number;
        };
        /** ProviderConsentReadCommand */
        ProviderConsentReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.consent";
            /** Profile Id */
            profile_id: string;
        };
        /** ProviderConsentWriteCommand */
        ProviderConsentWriteCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.consent.write";
            /** Profile Id */
            profile_id: string;
            request: components["schemas"]["ConsentWrite"];
        };
        /** ProviderListCommand */
        ProviderListCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.list";
            /** Offset */
            offset: number;
        };
        /** ProviderModelsCommand */
        ProviderModelsCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.models";
            /** Profile Id */
            profile_id: string;
            /** Offset */
            offset: number;
        };
        /** ProviderPriceCommand */
        ProviderPriceCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.price";
            request: components["schemas"]["PriceConfig"];
        };
        /** ProviderResumeCommand */
        ProviderResumeCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.resume";
            /** Profile Id */
            profile_id: string;
            request: components["schemas"]["ResumeWrite"];
        };
        /** ProviderSecretDeleteCommand */
        ProviderSecretDeleteCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.secret.delete";
            /** Profile Id */
            profile_id: string;
            request: components["schemas"]["SecretDelete"];
        };
        /** ProviderSecretReadCommand */
        ProviderSecretReadCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.secret";
            /** Profile Id */
            profile_id: string;
        };
        /** ProviderSecretWriteCommand */
        ProviderSecretWriteCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.secret.write";
            /** Profile Id */
            profile_id: string;
            request: components["schemas"]["SecretWrite"];
        };
        /** ProviderSettingsReadCommand */
        ProviderSettingsReadCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.settings";
        };
        /** ProviderSettingsWriteCommand */
        ProviderSettingsWriteCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.settings.write";
            request: components["schemas"]["SettingsWrite"];
        };
        /** ProviderWriteCommand */
        ProviderWriteCommand: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "provider.write";
            /** Profile Id */
            profile_id: string;
            request: components["schemas"]["ProfileWrite"];
        };
        ProviderCommand: components["schemas"]["ProviderListCommand"] | components["schemas"]["ProviderWriteCommand"] | components["schemas"]["ProviderModelsCommand"] | components["schemas"]["ProviderResumeCommand"] | components["schemas"]["ProviderSettingsReadCommand"] | components["schemas"]["ProviderSettingsWriteCommand"] | components["schemas"]["ProviderSecretReadCommand"] | components["schemas"]["ProviderSecretWriteCommand"] | components["schemas"]["ProviderSecretDeleteCommand"] | components["schemas"]["ProviderConsentReadCommand"] | components["schemas"]["ProviderConsentWriteCommand"] | components["schemas"]["ProviderBudgetCommand"] | components["schemas"]["ProviderBudgetReadCommand"] | components["schemas"]["ProviderPriceCommand"] | components["schemas"]["ProviderCallsCommand"];
        /** FormListCommand */
        FormListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.forms";
            /** Offset */
            offset: number;
        };
        /** FormTemplateCommand */
        FormTemplateCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.template";
        };
        /** FormWriteCommand */
        FormWriteCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.form.write";
            request: components["schemas"]["FormWrite"];
        };
        /** MatrixApproveCommand */
        MatrixApproveCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.approve";
            request: components["schemas"]["BulkApprove"];
        };
        /** MatrixDecideCommand */
        MatrixDecideCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.decide";
            request: components["schemas"]["DecisionWrite"];
        };
        /** MatrixHistoryCommand */
        MatrixHistoryCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.history" | "matrix.proposals";
            request: components["schemas"]["CellQuery"];
        };
        /** MatrixPreviewCommand */
        MatrixPreviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.preview";
            request: components["schemas"]["BulkPreviewWrite"];
        };
        /** MatrixProposeCommand */
        MatrixProposeCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.propose";
            request: components["schemas"]["ProposalWrite"];
        };
        /** MatrixQueryCommand */
        MatrixQueryCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "matrix.query";
            request: components["schemas"]["MatrixQuery"];
        };
        MatrixCommand: components["schemas"]["FormListCommand"] | components["schemas"]["FormTemplateCommand"] | components["schemas"]["FormWriteCommand"] | components["schemas"]["MatrixQueryCommand"] | components["schemas"]["MatrixHistoryCommand"] | components["schemas"]["MatrixProposeCommand"] | components["schemas"]["MatrixDecideCommand"] | components["schemas"]["MatrixPreviewCommand"] | components["schemas"]["MatrixApproveCommand"];
        /** JobAccessCommand */
        JobAccessCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.access";
            /** Job Id */
            job_id: string;
            /**
             * Offset
             * @default 0
             */
            offset: number;
        };
        /** JobCacheCommand */
        JobCacheCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.cache.clear";
        };
        /** JobControlCommand */
        JobControlCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.control";
            /** Job Id */
            job_id: string;
            request: components["schemas"]["JobControl"];
        };
        /** JobListCommand */
        JobListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.list";
            /** Offset */
            offset: number;
        };
        /** JobPreviewCommand */
        JobPreviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.preview";
            /** Job Id */
            job_id: string;
            /** Unit Id */
            unit_id: string;
            /** Batch Index */
            batch_index: number;
        };
        /** JobReadCommand */
        JobReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.read";
            /** Job Id */
            job_id: string;
        };
        /** JobUnitsCommand */
        JobUnitsCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.units";
            /** Job Id */
            job_id: string;
            /** Offset */
            offset: number;
        };
        /** JobWriteCommand */
        JobWriteCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "jobs.prepare";
            request: components["schemas"]["JobWrite"];
        };
        JobCommand: components["schemas"]["JobListCommand"] | components["schemas"]["JobWriteCommand"] | components["schemas"]["JobReadCommand"] | components["schemas"]["JobAccessCommand"] | components["schemas"]["JobUnitsCommand"] | components["schemas"]["JobPreviewCommand"] | components["schemas"]["JobControlCommand"] | components["schemas"]["JobCacheCommand"];
        /** ArtifactReadCommand */
        ArtifactReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.artifact";
            /** Version Id */
            version_id: string;
        };
        /** ArtifactReviewCommand */
        ArtifactReviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.review";
            /** Version Id */
            version_id: string;
            request: components["schemas"]["ArtifactReview"];
        };
        /** ArtifactVersionsCommand */
        ArtifactVersionsCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.versions";
            /** Version Id */
            version_id: string;
            /** Offset */
            offset: number;
        };
        /** NoteApproveCommand */
        NoteApproveCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.notes.approve";
            request: components["schemas"]["NoteApproval"];
        };
        /** NotePreviewCommand */
        NotePreviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.notes.preview";
            request: components["schemas"]["NotePreviewWrite"];
        };
        /** NotePublishCommand */
        NotePublishCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.notes.publish";
            /** Intent Id */
            intent_id: string;
            request: components["schemas"]["Write"];
        };
        /** NoteReadCommand */
        NoteReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.notes.read";
            /** Intent Id */
            intent_id: string;
        };
        /** ProtocolReadCommand */
        ProtocolReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.protocol.read";
            /** Protocol Id */
            protocol_id: string;
        };
        /** ProtocolWriteCommand */
        ProtocolWriteCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.protocol.write";
            request: components["schemas"]["ProtocolWrite"];
        };
        /** ResearchControlCommand */
        ResearchControlCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.control";
            /** Run Id */
            run_id: string;
            request: components["schemas"]["ResearchControl"];
        };
        /** ResearchListCommand */
        ResearchListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.notes.list" | "research.protocols" | "research.runs";
            /** Offset */
            offset: number;
        };
        /** ResearchPrepareCommand */
        ResearchPrepareCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.prepare";
            request: components["schemas"]["ResearchPrepare"];
        };
        /** ResearchRunCommand */
        ResearchRunCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.preview" | "research.run";
            /** Run Id */
            run_id: string;
        };
        /** ScreeningReadCommand */
        ScreeningReadCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.screening";
            /** Protocol Id */
            protocol_id: string;
            /** Offset */
            offset: number;
        };
        /** ScreeningWriteCommand */
        ScreeningWriteCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "research.screening.decide";
            request: components["schemas"]["ScreeningWrite"];
        };
        ResearchCommand: components["schemas"]["ResearchListCommand"] | components["schemas"]["ProtocolWriteCommand"] | components["schemas"]["ProtocolReadCommand"] | components["schemas"]["ScreeningReadCommand"] | components["schemas"]["ScreeningWriteCommand"] | components["schemas"]["ResearchPrepareCommand"] | components["schemas"]["ResearchRunCommand"] | components["schemas"]["ResearchControlCommand"] | components["schemas"]["ArtifactReadCommand"] | components["schemas"]["ArtifactVersionsCommand"] | components["schemas"]["ArtifactReviewCommand"] | components["schemas"]["NotePreviewCommand"] | components["schemas"]["NoteApproveCommand"] | components["schemas"]["NoteReadCommand"] | components["schemas"]["NotePublishCommand"];
        /** ConnectionWrite */
        ConnectionWrite: {
            /** Idempotency Key */
            idempotency_key: string;
            /** Label */
            label: string;
            /**
             * Allow Proposals
             * @default false
             */
            allow_proposals: boolean;
            /**
             * Expires In Seconds
             * @default 3600
             */
            expires_in_seconds: number;
        };
        /** McpCreateCommand */
        McpCreateCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "mcp.create";
            request: components["schemas"]["ConnectionWrite"];
        };
        /** McpListCommand */
        McpListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "mcp.connections" | "mcp.notes";
            /** Offset */
            offset: number;
        };
        /** McpReviewCommand */
        McpReviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "mcp.review";
            /** Version Id */
            version_id: string;
            request: components["schemas"]["ExternalNoteReview"];
        };
        /** McpRevokeCommand */
        McpRevokeCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "mcp.revoke";
            /** Connection Id */
            connection_id: string;
            request: components["schemas"]["Write"];
        };
        McpCommand: components["schemas"]["McpListCommand"] | components["schemas"]["McpCreateCommand"] | components["schemas"]["McpRevokeCommand"] | components["schemas"]["McpReviewCommand"];
        /** ExportCreateCommand */
        ExportCreateCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "exports.create";
            request: components["schemas"]["ExportCreate"];
        };
        /** ExportPreviewCommand */
        ExportPreviewCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "exports.preview";
            request: components["schemas"]["ExportOptions"];
        };
        /** ExportSaveCommand */
        ExportSaveCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "exports.save";
            /** Artifact Id */
            artifact_id: string;
        };
        /** ImportChooseCommand */
        ImportChooseCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.choose";
        };
        /** ImportCommitCommand */
        ImportCommitCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.commit";
            request: components["schemas"]["ImportCommit"];
        };
        /** ImportListCommand */
        ImportListCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.list";
            /** Offset */
            offset: number;
        };
        /** ImportMapCommand */
        ImportMapCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.map";
            /** Preview Id */
            preview_id: string;
            request: components["schemas"]["ImportMappingPart"];
        };
        /** ImportOpenCommand */
        ImportOpenCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.open";
            /** Import Id */
            import_id: string;
            request: components["schemas"]["ImportEvidenceReference"];
        };
        /** ImportRecordsCommand */
        ImportRecordsCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.records";
            /** Import Id */
            import_id: string;
            /** Offset */
            offset: number;
        };
        /** ImportReferenceCommand */
        ImportReferenceCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.reference";
            /** Import Id */
            import_id: string;
            request: components["schemas"]["ImportReference"];
        };
        /** ImportSourcesCommand */
        ImportSourcesCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.sources";
            /** Preview Id */
            preview_id: string;
            /** Offset */
            offset: number;
        };
        /** ImportStatusCommand */
        ImportStatusCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "imports.status";
            /** Import Id */
            import_id: string;
        };
        /** TransferDiscardCommand */
        TransferDiscardCommand: {
            /** Notebook Id */
            notebook_id: string;
            /** Snapshot Id */
            snapshot_id: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            op: "exports.discard";
            /** Transfer Id */
            transfer_id: string;
        };
        ExportCommand: components["schemas"]["ExportPreviewCommand"] | components["schemas"]["ExportCreateCommand"] | components["schemas"]["ExportSaveCommand"] | components["schemas"]["TransferDiscardCommand"] | components["schemas"]["ImportChooseCommand"] | components["schemas"]["ImportCommitCommand"] | components["schemas"]["ImportListCommand"] | components["schemas"]["ImportRecordsCommand"] | components["schemas"]["ImportOpenCommand"] | components["schemas"]["ImportSourcesCommand"] | components["schemas"]["ImportMapCommand"] | components["schemas"]["ImportStatusCommand"] | components["schemas"]["ImportReferenceCommand"];
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
    read_original_attachment_text_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_text_view_post: {
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
                "application/json": components["schemas"]["EvidenceTextRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceTextView"];
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
    read_original_attachment_v1_notebooks__notebook_id__snapshots__snapshot_id__documents_original_view_post: {
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
                "application/json": components["schemas"]["OriginalViewRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OriginalViewChunk"];
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
    read_budget_v1_notebooks__notebook_id__snapshots__snapshot_id__provider_budgets__kind___identity__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                kind: "call" | "job" | "session";
                identity: string;
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
                    "application/json": components["schemas"]["Budget"] | null;
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
    listing_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations_get: {
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
                    "application/json": components["schemas"]["ConversationPage"];
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
    create_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations_post: {
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
                "application/json": components["schemas"]["ConversationCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversationRecord"];
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
    conversation_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                conversation_id: string;
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
                    "application/json": components["schemas"]["ConversationRecord"];
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
    history_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__runs_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                conversation_id: string;
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
                    "application/json": components["schemas"]["RunPage"];
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
    prepare_v1_notebooks__notebook_id__snapshots__snapshot_id__conversations__conversation_id__runs_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                conversation_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RunPrepare"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunRecord"];
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
    run_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["RunRecord"];
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
    start_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__start_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["RunRecord"];
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
    access_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__access_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["RunAccess"];
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
    cancel_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["CancelReceipt"];
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
    events_v1_notebooks__notebook_id__snapshots__snapshot_id__runs__run_id__events_get: {
        parameters: {
            query?: {
                cursor?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                content?: never;
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
    build_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors_post: {
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
                "application/json": components["schemas"]["VectorBuild"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VectorJob"];
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
    vector_job_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
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
                    "application/json": components["schemas"]["VectorJob"];
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
    cancel_vector_v1_notebooks__notebook_id__snapshots__snapshot_id__vectors__job_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
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
                    "application/json": components["schemas"]["VectorJob"];
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
    template_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_template_get: {
        parameters: {
            query?: never;
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
                    "application/json": components["schemas"]["FieldDefinition"][];
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
    forms_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_get: {
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
                    "application/json": components["schemas"]["FormPage"];
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
    create_form_v1_notebooks__notebook_id__snapshots__snapshot_id__forms_post: {
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
                "application/json": components["schemas"]["FormWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FormVersion"];
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
    form_v1_notebooks__notebook_id__snapshots__snapshot_id__forms__form_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                form_id: string;
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
                    "application/json": components["schemas"]["FormVersion"];
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
    matrix_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix__form_id__get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                form_id: string;
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
                    "application/json": components["schemas"]["MatrixPage"];
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
    matrix_query_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_query_post: {
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
                "application/json": components["schemas"]["MatrixQuery"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MatrixPage"];
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
    proposals_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_proposals_query_post: {
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
                "application/json": components["schemas"]["CellQuery"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProposalPage"];
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
    decisions_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_decisions_query_post: {
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
                "application/json": components["schemas"]["CellQuery"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DecisionPage"];
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
    propose_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_proposals_post: {
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
                "application/json": components["schemas"]["ProposalWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExtractionProposal"];
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
    decide_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_decisions_post: {
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
                "application/json": components["schemas"]["DecisionWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CellDecision"];
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
    preview_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_bulk_preview_post: {
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
                "application/json": components["schemas"]["BulkPreviewWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BulkPreview"];
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
    bulk_v1_notebooks__notebook_id__snapshots__snapshot_id__matrix_bulk_approve_post: {
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
                "application/json": components["schemas"]["BulkApprove"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BulkReceipt"];
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
    listing_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs_get: {
        parameters: {
            query?: {
                offset?: number;
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
                    "application/json": components["schemas"]["JobPage"];
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
    prepare_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs_post: {
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
                "application/json": components["schemas"]["JobWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobRecord"];
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
    read_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
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
                    "application/json": components["schemas"]["JobRecord"];
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
    access_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__access_get: {
        parameters: {
            query?: {
                offset?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
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
                    "application/json": components["schemas"]["JobAccessPage"];
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
    units_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__units_get: {
        parameters: {
            query?: {
                offset?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
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
                    "application/json": components["schemas"]["UnitPage"];
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
    preview_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__units__unit_id__batches__batch_index__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
                unit_id: string;
                batch_index: number;
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
                    "application/json": components["schemas"]["BatchPreview"];
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
    control_v1_notebooks__notebook_id__snapshots__snapshot_id__jobs__job_id__control_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                job_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["JobControl"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobRecord"];
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
    clear_cache_v1_notebooks__notebook_id__snapshots__snapshot_id__job_cache_clear_post: {
        parameters: {
            query?: never;
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
                    "application/json": number;
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
    protocols_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols_get: {
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
                    "application/json": components["schemas"]["ProtocolPage"];
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
    create_protocol_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols_post: {
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
                "application/json": components["schemas"]["ProtocolWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProtocolVersion"];
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
    protocol_v1_notebooks__notebook_id__snapshots__snapshot_id__protocols__protocol_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                protocol_id: string;
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
                    "application/json": components["schemas"]["ProtocolVersion"];
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
    decide_v1_notebooks__notebook_id__snapshots__snapshot_id__screening_decisions_post: {
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
                "application/json": components["schemas"]["ScreeningWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScreeningDecision"];
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
    screening_v1_notebooks__notebook_id__snapshots__snapshot_id__screening__protocol_id__get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                protocol_id: string;
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
                    "application/json": components["schemas"]["ScreeningPage"];
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
    research_runs_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs_get: {
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
                    "application/json": components["schemas"]["ResearchRunPage"];
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
    prepare_run_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs_post: {
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
                "application/json": components["schemas"]["ResearchPrepare"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResearchRun"];
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
    research_run_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["ResearchRun"];
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
    research_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__preview_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["ResearchPreview"];
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
    research_access_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__access_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
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
                    "application/json": components["schemas"]["ResearchAccessPage"];
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
    research_control_v1_notebooks__notebook_id__snapshots__snapshot_id__research_runs__run_id__control_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResearchControl"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResearchRun"];
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
    artifact_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                version_id: string;
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
                    "application/json": components["schemas"]["ArtifactVersion"];
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
    artifact_versions_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__versions_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                version_id: string;
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
                    "application/json": components["schemas"]["ArtifactPage"];
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
    artifact_review_v1_notebooks__notebook_id__snapshots__snapshot_id__artifacts__version_id__review_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                version_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArtifactReview"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactVersion"];
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
    note_preview_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_previews_post: {
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
                "application/json": components["schemas"]["NotePreviewWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotePreview"];
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
    note_approve_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_approve_post: {
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
                "application/json": components["schemas"]["NoteApproval"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovedWriteOutbox"];
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
    note_outbox_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox_get: {
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
                    "application/json": components["schemas"]["OutboxPage"];
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
    note_intent_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                intent_id: string;
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
                    "application/json": components["schemas"]["ApprovedWriteOutbox"];
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
    note_begin_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__begin_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                intent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Write"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OutboxBegin"];
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
    note_ack_v1_notebooks__notebook_id__snapshots__snapshot_id__notes_outbox__intent_id__ack_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                intent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NoteReadback"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovedWriteOutbox"];
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
    connections_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections_get: {
        parameters: {
            query?: {
                offset?: number;
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
                    "application/json": components["schemas"]["ConnectionPage"];
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
    create_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections_post: {
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
                "application/json": components["schemas"]["ConnectionCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionReceipt"];
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
    revoke_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_connections__identity__revoke_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Write"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionRecord"];
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
    notes_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_notes_get: {
        parameters: {
            query?: {
                offset?: number;
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
                    "application/json": components["schemas"]["ExternalNotePage"];
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
    review_v1_notebooks__notebook_id__snapshots__snapshot_id__mcp_notes__identity__review_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExternalNoteReview"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExternalNote"];
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
    status_v1_mcp_gateway_get_notebook_status_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SourceArgs"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["McpNotebookStatus"];
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
    sources_v1_mcp_gateway_list_sources_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SourceArgs"];
            };
        };
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
    search_v1_mcp_gateway_search_evidence_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
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
    read_v1_mcp_gateway_read_evidence_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReadArgs"];
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
    protocol_v1_mcp_gateway_get_protocol_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmptyArgs"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["McpProtocol"];
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
    matrix_v1_mcp_gateway_get_matrix_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MatrixQuery"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MatrixPage"];
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
    extractions_v1_mcp_gateway_propose_extractions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExternalExtraction"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExtractionProposal"];
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
    note_v1_mcp_gateway_propose_note_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExternalNoteWrite"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExternalNote"];
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
    bibliography_access_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_bibliography_access_post: {
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
                "application/json": components["schemas"]["ExportOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SourceAccess"][];
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
    preview_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_previews_post: {
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
                "application/json": components["schemas"]["ExportOptions"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExportPreview"];
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
    create_v1_notebooks__notebook_id__snapshots__snapshot_id__exports_post: {
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
                "application/json": components["schemas"]["ExportCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExportArtifact"];
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
    validate_v1_notebooks__notebook_id__snapshots__snapshot_id__exports__identity__validate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": components["schemas"]["ExportPreview"];
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
    data_v1_notebooks__notebook_id__snapshots__snapshot_id__exports__identity__data_get: {
        parameters: {
            query?: {
                offset?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": components["schemas"]["ExportData"];
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
    discard_v1_notebooks__notebook_id__snapshots__snapshot_id__transfers__identity__discard_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": unknown;
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
    upload_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads_post: {
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
                "application/json": components["schemas"]["UploadCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadReceipt"];
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
    part_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UploadPart"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadReceipt"];
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
    inspect_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__inspect_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportPreview"];
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
    imports_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_get: {
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
                    "application/json": components["schemas"]["ImportPage"];
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
    restore_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_post: {
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
                "application/json": components["schemas"]["ImportCommit"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportedNotebook"];
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
    original_sources_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__sources_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": components["schemas"]["ImportSourcePage"];
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
    mapping_v1_notebooks__notebook_id__snapshots__snapshot_id__imports_uploads__identity__mappings_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportMappingPart"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportMappingState"];
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
    records_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__records_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": components["schemas"]["ImportedRecordPage"];
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
    visibility_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
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
                    "application/json": components["schemas"]["ImportVisibility"];
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
    reference_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__reference_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportReference"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportedRecordDetail"];
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
    evidence_v1_notebooks__notebook_id__snapshots__snapshot_id__imports__identity__evidence_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notebook_id: string;
                snapshot_id: string;
                identity: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ImportEvidenceReference"];
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
