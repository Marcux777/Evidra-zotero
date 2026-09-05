# ADR 0001 — Adopt the supplied architecture

Date: 2026-09-05. Status: accepted by the user's implementation request and specification §0.

Implement the native Zotero extension and the Python engine as specified in SPEC.md. Use the empty project directory as the sole writable checkout on codex/implement-evidra; no existing branch or user changes need isolation. Keep SQLite ownership in one engine and authorization in shared domain services. Use generated TypeScript contracts from Pydantic/OpenAPI.

Alternatives considered: a separate web application conflicts with the native integration requirement; embedding all processing inside Zotero would couple parsing/model I/O to the host and violate the chosen engine stack. Neither is adopted.

A supplied design already approved for implementation does not require another design approval. Native validation remains blocked on the installed Zotero 9.0.6 until a permitted Zotero 10.0.1 test environment is available. Do not mutate the personal library or restart its application. No backward compatibility is added.

Dependency versions are resolved from npm/PyPI metadata on this date; lockfiles provide exact transitive versions. Python must remain 3.12. Environment setup requires explicit package-install authority under the user's local policy.
