"""Deterministic XPI archive and resource inspection; no native installation."""
import json
import sys
import zipfile
from pathlib import Path

root, target = (Path(value).resolve() for value in sys.argv[1:])
with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob("*")):
        if file.is_file():
            name = file.relative_to(root).as_posix()
            info = zipfile.ZipInfo(name, date_time=(2026, 9, 5, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, file.read_bytes())
with zipfile.ZipFile(target) as archive:
    names = archive.namelist()
    required = {"manifest.json", "bootstrap.js", "chrome.manifest", "content/native.js", "content/ui.js", "content/ui.html", "content/ui.css", "content/native.css", "content/icon.svg", "locale/pt-BR/evidra.ftl", "locale/en-US/evidra.ftl", "THIRD_PARTY_NOTICES.txt"}
    if set(names) != required or archive.testzip() is not None:
        raise RuntimeError("XPI_RESOURCE_MISMATCH")
    manifest = json.loads(archive.read("manifest.json"))
    if manifest["applications"]["zotero"]["strict_max_version"] != "10.0.*":
        raise RuntimeError("XPI_COMPATIBILITY_MISMATCH")
    print(json.dumps({"files": names, "resource_count": len(names), "bytes": target.stat().st_size}))
