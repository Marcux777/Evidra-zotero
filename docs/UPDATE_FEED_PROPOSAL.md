# Authorized HTTPS update metadata and repository publication

The actual Zotero10.0.1 runtime rejects a plugin without `applications.zotero.update_url` (`omni.ja`, `modules/Extension.sys.mjs:1878`). An embedded JSON feed parses successfully but its `providesUpdatesSecurely` getter returns false; default `extensions.checkUpdateSecurity=true` then makes the addon unusable (`XPIDatabase.sys.mjs:444-445,2693-2700`). This is a required host admission boundary, not an Evidra model-provider call.

The first native attempt failed before bootstrap and the isolated instance was closed normally; receipts are under `.local/native-smoke/`. No security preference was weakened and no fake HTTPS endpoint was registered.

## Concrete proposal

- The user first authorized the limited two-file feed publication, then explicitly requested publication of the full project as `Evidra-zotero`, correcting its visibility to public. The final target is one public repository, `Marcux777/Evidra-zotero`; no separate update repository is needed.
- Publish committed reviewed project files and the exact approved empty `updates.json` (77bytes, SHA256 `901686d6fab93aba6f5b115b5002f7fa630af72c09a2d59402b15549c14bd96a`). Uncommitted implementation remains local until reviewed. No ignored model/runtime caches, synthetic databases, handshakes or local receipts are published.
- Canonical feed URL: `https://raw.githubusercontent.com/Marcux777/Evidra-zotero/main/updates.json`.
- Use that HTTPS URL in Evidra's manifest only after publication/readback verifies exact bytes and a source review approves the change.
- The later public-project request authorizes application source publication. No release, binary, model, library content or credentials are part of the update feed. Adding an actual downloadable update later remains a separate remote action requiring authorization.
- Zotero may make ordinary update checks to this URL. An empty feed offers no update download and sends no research content. Offline operation still needs separate native evidence; this proposal does not pass it.

GitHub connector and installed CLI both identify the authenticated account as `Marcux777`. Read-only repository search found no accessible `evidra-zotero` repository and the local checkout had no Git remote before this publication. If the named repository already exists at creation time, stop and inspect rather than overwrite it. Creation, pushed commit and feed readback will be recorded separately.

Authorization was required by SPEC.md:719, “Não publicar releases ou registrar atualizador remoto sem autorização”, and AGENTS.md's explicit target/scope/confirmation rule for remote writes. The user answered “Autorizo essa publicação limitada”, then requested the named project repository and corrected “privado” to “publico*”. This explicit publication authority is separate from the isolated-profile test permission.
