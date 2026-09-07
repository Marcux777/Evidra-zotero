"""Collect verbatim installed dependency notices and bind them to analyzed build inputs."""

import ast
import importlib.metadata as metadata
import re
import shutil
import sys
import tomllib
from pathlib import Path

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name
from run_tools import ROOT, sha256, write_json


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, (tuple, list)):
        for child in value:
            yield from strings(child)
    elif isinstance(value, dict):
        for child in value.values():
            yield from strings(child)


def collect_notices(payload: Path, analysis_path: Path) -> dict:
    distributions = {
        canonicalize_name(d.metadata["Name"]): d for d in metadata.distributions()
    }
    project = tomllib.loads(
        (ROOT / "services/engine/pyproject.toml").read_text(encoding="utf-8")
    )
    pending = list(project["project"]["dependencies"])
    required: set[str] = set()
    while pending:
        requirement = Requirement(pending.pop())
        if requirement.marker and not requirement.marker.evaluate({"extra": ""}):
            continue
        name = canonicalize_name(requirement.name)
        if name in required:
            continue
        dist = distributions[name]
        if dist.version not in requirement.specifier:
            raise RuntimeError(f"Installed runtime version mismatch: {requirement}")
        required.add(name)
        pending.extend(dist.requires or [])
    analyzed_paths = {
        str(Path(p).resolve()).casefold()
        for p in strings(ast.literal_eval(analysis_path.read_text(encoding="utf-8")))
        if Path(p).is_absolute()
    }
    analyzed: set[str] = set()
    for name, dist in distributions.items():
        if any(
            str(Path(dist.locate_file(f)).resolve()).casefold() in analyzed_paths
            for f in dist.files or []
        ):
            analyzed.add(name)
    selected = (required | analyzed | {"pyinstaller"}) - {"evidra-engine"}
    result = {"analysis_sha256": sha256(analysis_path), "packages": [], "python": {}}
    notices = payload / "THIRD_PARTY_NOTICES"
    notices.mkdir()
    for name in sorted(selected):
        dist = distributions[name]
        files = [
            entry
            for entry in dist.files or []
            if re.search(r"license|licence|copying|notice", str(entry), re.I)
            and Path(dist.locate_file(entry)).is_file()
        ]
        if not files:
            raise RuntimeError(f"No installed license/notice files: {name}")
        target = notices / name
        target.mkdir()
        row = {
            "name": dist.metadata["Name"],
            "version": dist.version,
            "runtime_dependency": name in required,
            "analyzed_input": name in analyzed,
            "license_expression": dist.metadata.get("License-Expression"),
            "files": [],
        }
        for index, entry in enumerate(sorted(files)):
            original = Path(dist.locate_file(entry))
            destination = (
                target / f"{index:03}_{re.sub(r'[^A-Za-z0-9_. -]', '_', original.name)}"
            )
            shutil.copyfile(original, destination)
            if sha256(original) != sha256(destination):
                raise RuntimeError(f"Notice copy mismatch: {name}")
            row["files"].append(
                {
                    "installed_relative_path": str(entry).replace("\\", "/"),
                    "path": destination.relative_to(payload).as_posix(),
                    "sha256": sha256(destination),
                    "bytes": destination.stat().st_size,
                }
            )
        result["packages"].append(row)
    python_license = Path(sys.base_prefix) / "LICENSE.txt"
    if not python_license.is_file():
        raise FileNotFoundError(
            f"Python distribution license is required: {python_license}"
        )
    shutil.copyfile(python_license, notices / "PYTHON-LICENSE.txt")
    result["python"] = {
        "version": sys.version,
        "path": "THIRD_PARTY_NOTICES/PYTHON-LICENSE.txt",
        "sha256": sha256(python_license),
    }
    write_json(notices / "inventory.json", result)
    summary = [
        "# Third-party notices",
        "",
        "Verbatim license and notice texts accompany this executable under `THIRD_PARTY_NOTICES/`.",
        "`inventory.json` records versions, whether dependency metadata or the PyInstaller "
        "analysis includes each package, and the hashes of the exact copied texts.",
        "The PyInstaller bootloader and Python runtime notices are included. "
        "No model weights are included.",
        "",
        "| Distribution | Version | Runtime dependency | Analyzed input | Notice files |",
        "|---|---|---|---|---|",
    ]
    summary.extend(
        f"| {p['name']} | {p['version']} | {p['runtime_dependency']} | "
        f"{p['analyzed_input']} | {len(p['files'])} |"
        for p in result["packages"]
    )
    (payload / "THIRD_PARTY_NOTICES.md").write_text(
        "\n".join(summary) + "\n", encoding="utf-8"
    )
    return result
