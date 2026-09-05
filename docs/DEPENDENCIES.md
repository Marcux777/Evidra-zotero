# Dependency decisions

All dependencies are pinned in the project manifests and lockfiles. Installation is local to this project under the user's 2026-09-05 authorization to install the dependencies needed to build and test Evidra with npm/uv. No global package, service, model, provider account or system configuration is installed by these dependency steps.

| Addition | Verified version/license metadata | Purpose and primary documentation |
|---|---|---|
| Ajv, build dependency | npm 8.20.0 / MIT | Compile Pydantic-derived JSON Schema into standalone validation code. The generated code is bundled with esbuild; schema compilation stays at build time so the Zotero renderer requires no dynamic Function evaluation. [Standalone documentation](https://ajv.js.org/standalone.html). |
| Pillow, engine dependency | PyPI 12.3.0 / MIT-CMU; Python >=3.10 | Encode bounded PDFium page/region previews as PNG through an established image library. Windows x64 wheels support the project's Python 3.12. [Installation documentation](https://pillow.readthedocs.io/en/stable/installation/basic-installation.html). |

The initially installed pypdfium2 exposes bitmap conversion to Pillow but does not declare/install Pillow. The installed environment confirmed `PIL` was absent. Ajv avoids maintaining a custom general JSON Schema validator. These additions support required v1 behavior rather than adding a new feature or provider.

Executed at the Task 2 boundary:

- `rtk npm view ajv version license engines --json`: version 8.20.0, MIT.
- PyPI JSON metadata lookup for Pillow: version 12.3.0, Python >=3.10, MIT-CMU.
- `rtk npm install --package-lock-only --ignore-scripts --no-audit --no-fund`: exit 0.
- `rtk npm ci --no-audit --no-fund`: exit 0; 128 packages installed. Existing transitive whatwg-encoding deprecation warning remains visible.
- `rtk uv lock --project services/engine --python C:/Users/marcu/AppData/Roaming/uv/python/cpython-3.12.11-windows-x86_64-none/python.exe --no-python-downloads`: exit 0, added Pillow 12.3.0 only.
- `rtk uv sync --project services/engine --frozen --python C:/Users/marcu/AppData/Roaming/uv/python/cpython-3.12.11-windows-x86_64-none/python.exe --no-python-downloads`: exit 0, installed Pillow and rebuilt the editable local package; no interpreter download.
- `rtk npm ls ajv --depth=0`: installed Ajv 8.20.0.
- In-memory Pillow 2×2 RGB PNG encode/decode: format PNG, size (2, 2). This checks the required codec capability, not the future PDF parser.

No permanent tests were added for manifest changes. The actual generated validator and document-preview behavior receive boundary tests in their implementation tasks. `.local/dependency-license-inventory.json` records the earlier installed dependency set; final packaging must inventory the final bundled files, including these additions, before producing third-party notices.
