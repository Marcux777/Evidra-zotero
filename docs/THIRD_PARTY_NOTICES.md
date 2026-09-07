# Third-party notices

The build audits the installed dependency versions and copies their license/notice files verbatim. The inventory of installed packages alone is not treated as a completed bundle audit.

The XPI includes `THIRD_PARTY_NOTICES.txt`. Its package set comes from actual esbuild module inputs, plus Ajv whose standalone generated validator code is embedded. This covers React/React DOM/scheduler, DOMPurify, Markdown-it and the transitive packages actually present in the generated bundle. `build-receipt.json` records each included notice hash and version.

The Windows engine includes `THIRD_PARTY_NOTICES.md` and `THIRD_PARTY_NOTICES/inventory.json`, with exact copied file hashes. The selection combines installed runtime dependency metadata, actual PyInstaller Analysis inputs and the PyInstaller bootloader notice. Python's distribution license is included. The PDFium and pypdfium2 notice tree is copied from the installed pypdfium2 distribution, alongside FastAPI, MCP, Uvicorn and their applicable runtime dependencies. All notice files are part of the engine integrity manifest and archive checks.

The PyInstaller analysis and local `notice-audit.json` record which installed packages were analyzed, rather than claiming that all development dependencies are shipped. Model weights and papers are never included. No remote updater, release or publication is performed by the packaging scripts. The existing approved Zotero update manifest is empty.

The final package report and release manifest identify the actual audit results and artifact hashes. Copying license notices does not sign a binary or establish a trusted publisher identity.
