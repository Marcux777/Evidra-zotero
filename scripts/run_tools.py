"""Small portable command receipts; the local workflow harness can invoke these runners."""

import hashlib
import json
import os
import shutil
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def sha256(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def write_json(path: Path, value: object) -> None:
    path.write_text(
        json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def new_run(kind: str, output: Path | None = None) -> Path:
    path = (
        output
        or ROOT / ".local" / kind / datetime.now(UTC).strftime("%Y%m%dT%H%M%S%fZ")
    ).resolve()
    path.mkdir(parents=True, exist_ok=False)
    (path / "logs").mkdir()
    return path


class Commands:
    def __init__(self, directory: Path):
        self.directory = directory
        self.results: list[dict] = []

    def run(
        self, name: str, argv: list[str], *, cwd: Path = ROOT, env: dict | None = None
    ) -> dict:
        executable = shutil.which(argv[0])
        if executable is None:
            raise FileNotFoundError(f"Required executable is unavailable: {argv[0]}")
        command = [executable, *argv[1:]]
        stdout = self.directory / "logs" / f"{name}.stdout.log"
        stderr = self.directory / "logs" / f"{name}.stderr.log"
        result = {
            "name": name,
            "argv": command,
            "cwd": str(cwd),
            "started_at": datetime.now(UTC).isoformat(),
            "stdout": str(stdout),
            "stderr": str(stderr),
        }
        self.results.append(result)
        started = time.perf_counter()
        try:
            with stdout.open("wb") as out, stderr.open("wb") as err:
                process = subprocess.run(
                    command,
                    cwd=cwd,
                    env=env or os.environ,
                    stdout=out,
                    stderr=err,
                    check=False,
                )
            result.update(
                exit_code=process.returncode,
                elapsed_seconds=time.perf_counter() - started,
            )
            result.update(stdout_sha256=sha256(stdout), stderr_sha256=sha256(stderr))
            write_json(self.directory / "commands.json", self.results)
            if process.returncode:
                print(json.dumps(result), flush=True)
                process.check_returncode()
            print(
                json.dumps(
                    {
                        "command": name,
                        "exit_code": process.returncode,
                        "seconds": result["elapsed_seconds"],
                    }
                ),
                flush=True,
            )
            return result
        except BaseException as exc:
            result.setdefault("exit_code", None)
            result["exception"] = {"type": type(exc).__name__, "message": str(exc)}
            write_json(self.directory / "commands.json", self.results)
            raise


def build_inputs() -> dict:
    """Capture actual bytes, not git object bytes (Windows newline conversion is material)."""
    candidates = [
        ROOT / name
        for name in (
            "package.json",
            "package-lock.json",
            "tsconfig.json",
            "vitest.config.ts",
            "services/engine/pyproject.toml",
            "services/engine/uv.lock",
        )
    ]
    for folder in (
        "apps/zotero",
        "packages/contracts",
        "services/engine/src",
        "services/engine/tests",
        "scripts",
    ):
        candidates.extend(
            path
            for path in (ROOT / folder).rglob("*")
            if path.is_file() and "__pycache__" not in path.parts
        )
    entries = [
        {
            "path": p.relative_to(ROOT).as_posix(),
            "size": p.stat().st_size,
            "sha256": sha256(p),
        }
        for p in sorted(set(candidates))
    ]
    canonical = json.dumps(entries, separators=(",", ":"), sort_keys=True).encode()
    revision = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
    status = subprocess.check_output(
        ["git", "status", "--porcelain"], cwd=ROOT, text=True
    )
    return {
        "revision": revision,
        "git_status": status,
        "files": entries,
        "sha256": hashlib.sha256(canonical).hexdigest(),
    }
