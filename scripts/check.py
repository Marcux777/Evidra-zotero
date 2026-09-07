"""Run the root development checks once and retain exact return codes and test counts."""

import argparse
import json
import xml.etree.ElementTree as ET
from pathlib import Path

from run_tools import Commands, build_inputs, new_run, write_json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    directory = new_run("checks", args.output)
    commands = Commands(directory)
    before = build_inputs()
    write_json(directory / "inputs-before.json", before)
    report = {
        "status": "RUNNING",
        "directory": str(directory),
        "input_sha256": before["sha256"],
        "revision": before["revision"],
        "tests": {},
    }
    write_json(directory / "report.json", report)
    uv = ["uv", "run", "--project", "services/engine", "--no-sync"]
    steps = [
        ("npm-ci", ["npm", "ci", "--no-audit", "--no-fund"]),
        ("uv-sync", ["uv", "sync", "--project", "services/engine", "--frozen"]),
        ("typecheck", ["npm", "run", "typecheck"]),
        (
            "vitest",
            [
                "npm",
                "test",
                "--",
                "--reporter=default",
                "--reporter=json",
                f"--outputFile.json={directory / 'vitest.json'}",
            ],
        ),
        ("ruff", [*uv, "ruff", "check", "services/engine"]),
        (
            "pytest",
            [
                *uv,
                "pytest",
                "services/engine/tests",
                f"--junitxml={directory / 'pytest.xml'}",
            ],
        ),
        (
            "mypy",
            [
                *uv,
                "mypy",
                "--config-file",
                "services/engine/pyproject.toml",
                "services/engine/src/evidra",
            ],
        ),
        ("contracts", ["npm", "run", "generate:contracts"]),
        ("plugin", ["npm", "run", "build:plugin"]),
    ]
    try:
        for name, argv in steps:
            commands.run(name, argv)
            if name == "vitest":
                data = json.loads(
                    (directory / "vitest.json").read_text(encoding="utf-8")
                )
                report["tests"]["vitest"] = {
                    k: data[k]
                    for k in (
                        "numTotalTests",
                        "numPassedTests",
                        "numFailedTests",
                        "numPendingTests",
                        "numTotalTestSuites",
                    )
                }
            if name == "pytest":
                suites = (
                    ET.parse(directory / "pytest.xml").getroot().findall("testsuite")
                )
                report["tests"]["pytest"] = {
                    key: sum(int(s.get(key, "0")) for s in suites)
                    for key in ("tests", "failures", "errors", "skipped")
                }
            write_json(directory / "report.json", report)
        after = build_inputs()
        write_json(directory / "inputs-after.json", after)
        if before["files"] != after["files"]:
            raise RuntimeError(
                "CHECK_INPUTS_CHANGED: inspect generated contracts and rerun affected checks"
            )
        report["status"] = "PASSED"
    except BaseException as exc:
        report.update(
            status="FAILED", failure={"type": type(exc).__name__, "message": str(exc)}
        )
        raise
    finally:
        report["commands"] = commands.results
        report["unrun"] = [
            name
            for name, _ in steps
            if name not in {r["name"] for r in commands.results}
        ]
        write_json(directory / "report.json", report)
        print(
            json.dumps(
                {
                    "report": str(directory / "report.json"),
                    "status": report["status"],
                    "tests": report["tests"],
                }
            ),
            flush=True,
        )


if __name__ == "__main__":
    main()
