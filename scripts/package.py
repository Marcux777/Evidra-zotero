"""Build Windows artifacts from captured local inputs; never publish or update remotely."""

import argparse
import json
import platform
import shutil
import sys
import zipfile
from datetime import UTC, datetime
from pathlib import Path

from package_notices import collect_notices
from run_tools import ROOT, Commands, build_inputs, new_run, sha256, write_json

sys.path.insert(0, str(ROOT / "services/engine/src"))
from evidra.distribution import EngineManifest


def archive_folder(folder: Path, destination: Path) -> None:
    with zipfile.ZipFile(destination, "x", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(folder.rglob("*")):
            if path.is_symlink() or path.is_junction():
                raise RuntimeError("Linked package input")
            if path.is_file():
                name = f"{folder.name}/{path.relative_to(folder).as_posix()}"
                info = zipfile.ZipInfo(name, date_time=(2026, 9, 5, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, path.read_bytes())
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None or len(set(archive.namelist())) != len(archive.namelist()):
            raise RuntimeError("Corrupt or duplicate archive entries")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if sys.platform != "win32" or platform.machine().lower() not in {"amd64", "x86_64"}:
        raise RuntimeError("WINDOWS_BUILD_NOT_RUN: Windows x64 is required")
    directory = new_run("packages", args.output)
    commands = Commands(directory)
    before = build_inputs()
    write_json(directory / "inputs-before.json", before)
    report = {
        "status": "BUILDING",
        "revision": before["revision"],
        "input_sha256": before["sha256"],
    }
    try:
        commands.run(
            "plugin",
            [
                "node",
                "scripts/build-plugin.mjs",
                "--output",
                str(directory),
                "--stage",
                str(directory / "plugin-stage"),
            ],
        )
        commands.run(
            "pyinstaller",
            [
                sys.executable,
                "-m",
                "PyInstaller",
                "--noconfirm",
                "--distpath",
                str(directory / "dist"),
                "--workpath",
                str(directory / "build"),
                "scripts/evidra-engine.spec",
            ],
        )
        payload = directory / "dist/evidra-engine"
        notices = collect_notices(payload, directory / "build/evidra-engine/Analysis-00.toc")
        write_json(directory / "notice-audit.json", notices)
        files = [
            {
                "path": p.relative_to(payload).as_posix(),
                "size": p.stat().st_size,
                "sha256": sha256(p),
            }
            for p in sorted(payload.rglob("*"))
            if p.is_file()
        ]
        manifest = EngineManifest(
            manifest_version=1,
            protocol_version=1,
            engine_version="0.1.0",
            platform="win32",
            architecture="x86_64",
            entrypoint="evidra-engine.exe",
            files=files,
        )
        write_json(payload / "engine-manifest.json", manifest.model_dump())
        # Invoke the plugin's actual verifier on the complete onedir, including notices.
        commands.run("verify-engine", ["node", "scripts/verify-package.mjs", str(payload)])
        archive = directory / "evidra-engine-0.1.0-windows-x64.zip"
        archive_folder(payload, archive)
        after = build_inputs()
        write_json(directory / "inputs-after.json", after)
        if before["files"] != after["files"] or before["revision"] != after["revision"]:
            raise RuntimeError("BUILD_INPUTS_CHANGED")
        with zipfile.ZipFile(
            directory / "source-inputs.zip", "x", zipfile.ZIP_DEFLATED
        ) as source_zip:
            for entry in before["files"]:
                source_zip.writestr(entry["path"], (ROOT / entry["path"]).read_bytes())
        artifact_paths = [directory / "evidra-0.1.0.xpi", archive]
        artifacts = [
            {"file": p.name, "size": p.stat().st_size, "sha256": sha256(p)} for p in artifact_paths
        ]
        release = {
            "schema_version": 1,
            "software_version": "0.1.0",
            "protocol_version": 1,
            "platform": "win32",
            "architecture": "x86_64",
            "built_at": datetime.now(UTC).isoformat(),
            "source_revision": before["revision"],
            "source_git_status": before["git_status"],
            "build_input_sha256": before["sha256"],
            "build_inputs": before["files"],
            "source_archive_sha256": sha256(directory / "source-inputs.zip"),
            "engine_manifest_sha256": sha256(payload / "engine-manifest.json"),
            "artifacts": artifacts,
            "signed": False,
            "published": False,
            "clean_windows": "NOT_VERIFIED",
            "native_acceptance": "NOT_VERIFIED",
        }
        write_json(directory / "release-manifest.json", release)
        sums = [f"{a['sha256']}  {a['file']}" for a in artifacts]
        sums.append(f"{sha256(directory / 'release-manifest.json')}  release-manifest.json")
        (directory / "SHA256SUMS.txt").write_text("\n".join(sums) + "\n", encoding="ascii")
        docs = directory / "documentation"
        docs.mkdir()
        for source in [
            ROOT / "README.md",
            *[
                ROOT / "docs" / name
                for name in (
                    "ARCHITECTURE.md",
                    "INSTALL_WINDOWS.md",
                    "PRIVACY_AND_LIMITS.md",
                    "THIRD_PARTY_NOTICES.md",
                    "TEST_REPORT.md",
                    "ACCEPTANCE_MATRIX.md",
                    "STATE.md",
                )
            ],
        ]:
            shutil.copyfile(source, docs / source.name)
        report.update(
            status="BUILT",
            artifacts=artifacts,
            payload=str(payload),
            engine_files=len(files),
            notice_distributions=len(notices["packages"]),
            release_manifest=str(directory / "release-manifest.json"),
            release_manifest_sha256=sha256(directory / "release-manifest.json"),
        )
    except BaseException as exc:
        report.update(status="FAILED", failure={"type": type(exc).__name__, "message": str(exc)})
        raise
    finally:
        report["commands"] = commands.results
        write_json(directory / "package-report.json", report)
        print(
            json.dumps(
                {
                    "report": str(directory / "package-report.json"),
                    "status": report["status"],
                }
            ),
            flush=True,
        )


if __name__ == "__main__":
    main()
