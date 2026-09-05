# Provider and MCP implementation reference

Verified against official documentation and installed MCP types on 2026-09-05. These references guide implementation; they do not mean a live provider was called or an adapter has passed its tests. No credential, model catalog, localhost model endpoint or paid API was probed during research.

## Generation and streaming

| Adapter | Native wire contract | Structured response | Official reference |
|---|---|---|---|
| Ollama | POST /api/chat for turns; NDJSON stream, final done:true with evaluation counts/timing/done_reason. GET /api/tags and POST /api/show expose available model details. | format accepts JSON Schema (or json mode); image content must follow Ollama message format. | [Chat](https://docs.ollama.com/api/chat), [schema](https://docs.ollama.com/capabilities/structured-outputs), [catalog](https://docs.ollama.com/api/tags), [errors](https://docs.ollama.com/api/errors) |
| LM Studio | Explicit loopback base /v1; chat/completions SSE and models catalog. Responses support exists but is not assumed by this adapter. | response_format with json_schema when capability is supported. | [Compatibility](https://lmstudio.ai/docs/developer/openai-compat), [chat](https://lmstudio.ai/docs/developer/openai-compat/chat-completions), [schema](https://lmstudio.ai/docs/developer/openai-compat/structured-output) |
| OpenAI API | POST https://api.openai.com/v1/responses; input/instructions/max_output_tokens, store:false, stream:true. Consume response.output_text.delta, terminal completed/failed/incomplete and error events, ignoring unrelated event types without treating them as text. | text.format uses type=json_schema, name, schema, strict. Do not use Chat Completions as the first-party default. | [Responses](https://developers.openai.com/api/reference/resources/responses/methods/create/), [events](https://developers.openai.com/api/reference/resources/responses/streaming-events/), [schema](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Anthropic API | POST https://api.anthropic.com/v1/messages; x-api-key, anthropic-version:2023-06-01, model/max_tokens/messages and top-level system. Stream message_start, content_block_* text deltas, message_delta usage and message_stop; handle ping/error. Ignore hidden-thinking/signature deltas. | Current format is output_config.format; verify exact payload/model support when implementing. Do not reuse OpenAI request/event shapes. | [Messages](https://platform.claude.com/docs/en/api/messages/create), [streaming](https://platform.claude.com/docs/en/build-with-claude/streaming), [schema](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [errors](https://platform.claude.com/docs/en/api/errors) |
| Gemini API | POST https://generativelanguage.googleapis.com/v1beta/models/{id}:generateContent, or :streamGenerateContent?alt=sse. contents/parts, systemInstruction, generationConfig. Consume candidate text, finishReason/safety and usageMetadata; credentials belong in headers, not URL. | generationConfig responseMimeType application/json plus the documented schema field; distinguish Gemini's supported schema subset from arbitrary JSON Schema. | [generateContent](https://ai.google.dev/api/generate-content), [schema](https://ai.google.dev/gemini-api/docs/structured-output), [models](https://ai.google.dev/api/models) |
| Explicit OpenAI-compatible | Explicit base URL and capabilities, POST /chat/completions, choices[].delta.content SSE and terminal finish_reason/[DONE]. Manual model ID, catalog only when supported. | Use declared/reportable response_format support; otherwise text instructions plus local validation. | [Baseline protocol](https://developers.openai.com/api/reference/resources/chat/completions/methods/create); custom profiles also need the selected provider's documentation. |

No tool/function execution is requested. No SDK retry behavior is inherited: httpx transport performs one attempt and no redirects. A transport failure retains its causal exception privately; public/log messages redact credentials and user content. A quota error pauses the selected route. It never selects another provider or key.

Cancellation for ordinary foreground generation means closing the stream/request and stopping future calls. This does not establish free/no-billing cancellation. OpenAI's cancel endpoint applies to background Responses only; Evidra's default foreground streams cannot rely on it. Post-send timeout or cancellation keeps billing unknown unless a provider has confirmed usage.

## Embeddings and capability boundaries

Only explicitly local Ollama /api/embed and LM Studio /v1/embeddings are in scope. Generation and embedding models are independent. Record effective model/digest, dimension and normalization with each index generation. Anthropic has no native embedding model and must not silently substitute Voyage or another provider. Remote embedding APIs are not used in v1 even when a provider offers them.

Ollama and LM Studio are third-party runners: loopback alone does not prove that a model is local. Reject explicitly remote/cloud model records and names. Native offline-network smoke remains separate from URL validation.

Capabilities carry PROVIDER_REPORTED, PROBED, USER_DECLARED or UNSUPPORTED provenance. Optional probes use synthetic content and explicit authorization; catalog lookup does not send research documents. Manual model configuration remains available after a catalog failure, with capability uncertainty visible.

Provider-reported usage is authoritative when present. Unknown usage/cost is not zero. Character counts are not token counts. Verified preflight endpoints: OpenAI `POST /v1/responses/input_tokens` returns `input_tokens` and is documented as exact for the supplied model/input; Anthropic `POST /v1/messages/count_tokens` returns an explicitly estimated `input_tokens`; Gemini `POST /v1beta/models/{id}:countTokens` accepts `generateContentRequest` and returns `totalTokens`. These endpoints do not return a price/quota guarantee or output forecast. Monetary limits still require versioned prices and output limits; estimated input counts must not be presented as a guaranteed hard cap.

Sources: [OpenAI count input](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count), [Anthropic count tokens](https://platform.claude.com/docs/en/api/messages/count_tokens), [Gemini count tokens](https://ai.google.dev/api/tokens).

Schema correction from follow-up verification: Gemini native `generationConfig.responseJsonSchema` is the current JSON Schema field; `responseSchema` is a deprecated OpenAPI subset, and `_responseJsonSchema` is deprecated. Use camelCase reference fields with `responseMimeType: "application/json"`. Validate the provider's supported keyword set. Anthropic `output_config.format` contains `{type:"json_schema",schema:...}`; unsupported constraints such as minimum/minLength must not be falsely claimed as enforced natively. Preserve validation against the original local schema even when a documented provider-compatible schema is used.

## Installed MCP SDK

Installed distribution: mcp==2.1.1, mcp-types==2.1.1. The v1 FastMCP import intentionally raises in v2; use the supported `mcp.server.mcpserver.MCPServer` instead. Inspected interfaces: MCPServer.tool(..., structured_output=...), MCPServer.run(transport='stdio'), list_tools(), call_tool(name, arguments, context=None). Low-level server is mcp.server.lowlevel.Server; mcp.server.stdio.stdio_server is an async context manager. Inspect exact type aliases before writing serialization code: Python Tool fields use input_schema/output_schema, not assumed camelCase constructor names.

Only eight tools are authorized: get_notebook_status, list_sources, search_evidence, read_evidence, get_protocol, get_matrix, propose_extractions, propose_note. The stdio process forwards to the existing engine; no SQLite writer or administrative credential. Proposals are EXTERNAL_CLIENT, never approval.

## Official external-client configuration

Use the absolute packaged executable path and the selected scoped connection file. Preview the text for manual copy/merge; never overwrite existing user configuration and never include the token in arguments.

Codex's TOML uses `[mcp_servers.evidra]`, command, args and enabled. Official CLI supports `codex mcp add <name> -- <stdio command>`. [Codex MCP](https://developers.openai.com/codex/mcp), [configuration](https://developers.openai.com/codex/config-reference).

Claude Code's `.mcp.json` uses `mcpServers.evidra` with command/args/env. User/local/project scopes are distinct. [Claude Code MCP](https://code.claude.com/docs/en/mcp).

Gemini CLI's `.gemini/settings.json` uses `mcpServers.evidra` with command/args/env; `/mcp` reports available servers. [Gemini CLI MCP](https://geminicli.com/docs/tools/mcp-server/).

Authentication and subscriptions remain owned by those official clients. Evidra does not read their authentication files, browser cookies or session tokens, and does not embed their chat interfaces.
