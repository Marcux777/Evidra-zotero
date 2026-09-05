# ADR 0002 — Native research workspace and evidence inspector

Date: 2026-09-05. Status: selected implementation direction within approved SPEC §5.

The workspace uses a wide native HTML dialog/panel inside Zotero's own main window, plus the supported item/context-pane section beside the reader. All target-specific calls stay in ZoteroBridge. A raw custom Zotero_Tabs.add type is insufficient: target 10.0.1 restoration and undo-close require content hooks, and saved unknown types fail after plugin removal. We therefore do not create a custom Zotero tab type or patch the host's session methods. The main-window panel uses platform DOM/dialog APIs, keeps its application controls local, and restores focus on close. Research data and selected notebook remain persistent independently of panel lifecycle. This implements SPEC §5's explicit tab-or-panel choice; it is not an external website or browser link.

The main layout is a compact notebook/navigation rail, an expansive working surface and an evidence inspector. The inspector becomes a separate selectable view when the available pane is too narrow. Dense matrices retain their column context in a horizontal viewport; surrounding forms and actions reflow, and long lists render a bounded window with accessible row positions. No placeholder areas or disabled future-feature navigation ship.

Use local system fonts (Segoe UI/system-ui), a small semantic type scale, selectable quotation text, tabular counters and restrained emphasis. Surface hierarchy comes from spacing and structural dividers. Light/dark themes follow the host where available and offer an explicit user setting. Status badges include readable text, never color alone; model draft, proposed support, valid anchor and human approval are distinct labels. Focus is visible, actions use native buttons, tab groups support arrow keys, and overlays restore focus.

Use the same local CSS system everywhere, with shared color/spacing/type tokens, logical properties and no remote fonts/assets. Do not introduce animation dependencies; routine research interactions need immediate feedback and reduced-motion support. The initial engine/notebook view expands into real feature views as services become available during implementation.

Untrusted Markdown is rendered in an isolated, script-restricted content surface. HTML is disabled in markdown-it and the result passes a DOMPurify allowlist. Images and executable/unsafe links are removed from model/document text. Privileged UI requests are typed, source-checked and operation-limited; content never receives the engine token, arbitrary fetch, filesystem access or Zotero objects.

For a protected file handshake on Windows, create a random session directory and apply a current-user-only DACL before writing secrets. Mozilla Subprocess can call the Windows system whoami/icacls executables with argument arrays to establish the current SID/DACL. Prefix a numeric SID with `*` in icacls, e.g. `*S-1-5-...:(OI)(CI)F`. Reject failure; do not rely on a random filename as an ACL. The engine independently validates ownership/DACL and file identity when consuming the one-use request.

References: [Zotero 10 APIs](https://www.zotero.org/support/dev/zotero_10_for_developers), [target tab implementation](https://raw.githubusercontent.com/zotero/zotero/10.0.1/chrome/content/zotero/tabs.js), [item pane extension API](https://raw.githubusercontent.com/zotero/zotero/10.0.1/chrome/content/zotero/xpcom/pluginAPI/itemPaneManager.js), [Mozilla Subprocess](https://firefox-source-docs.mozilla.org/toolkit/modules/subprocess/toolkit_modules/subprocess/index.html).

This ADR defines intended behavior; actual native validation is tracked in ACCEPTANCE_MATRIX.md and is not established by this design document.
