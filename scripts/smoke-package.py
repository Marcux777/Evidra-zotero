"""Real frozen-process acceptance with synthetic data and no Python/Node on child PATH."""

import argparse
import hashlib
import json
import os
import secrets
import socket
import subprocess
import sys
import threading
import time
import zipfile
from pathlib import Path

import httpx
from run_tools import ROOT, Commands, new_run, sha256, write_json

sys.path.insert(0, str(ROOT / "services/engine/tests"))
sys.path.insert(0, str(ROOT / "services/engine/src"))
from evidra.distribution import EngineManifest
from evidra.domain.sources import SourceInput
from evidra.security.handshake import protect_path
from pdf_fixtures import pdf_bytes
from test_documents import document_scope, finished, ingest, register
from test_exports import decision_fixture, export
from test_runtime_notebooks import HEADERS
from test_scopes import source, sync


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("package", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    package = args.package.resolve(strict=True)
    directory = new_run("package-smoke", args.output)
    commands = Commands(directory)
    report = {
        "status": "RUNNING",
        "classification": "SYNTHETIC_DATA_REAL_PACKAGED_WINDOWS_PROCESS",
        "clean_windows": "NOT_VERIFIED",
        "checks": [],
        "sessions": [],
        "package": str(package),
    }
    release = json.loads((package / "release-manifest.json").read_text(encoding="utf-8"))
    report["release_manifest_sha256"] = sha256(package / "release-manifest.json")
    try:
        for artifact in release["artifacts"]:
            path = package / artifact["file"]
            if path.stat().st_size != artifact["size"] or sha256(path) != artifact["sha256"]:
                raise RuntimeError("RELEASE_ARTIFACT_MISMATCH")
        report["checks"].append("release artifact sizes and hashes")
        archive_path = package / "evidra-engine-0.1.0-windows-x64.zip"
        destination = directory / "disposable Windows path with spaces"
        destination.mkdir()
        with zipfile.ZipFile(archive_path) as archive:
            manifest = EngineManifest.model_validate_json(
                archive.read("evidra-engine/engine-manifest.json")
            )
            expected = {
                "evidra-engine/engine-manifest.json",
                *["evidra-engine/" + f.path for f in manifest.files],
            }
            if (
                set(archive.namelist()) != expected
                or len(archive.namelist()) != len(expected)
                or archive.testzip()
            ):
                raise RuntimeError("PACKAGE_ARCHIVE_PATH_MISMATCH")
            for name in archive.namelist():
                if not (destination / name).resolve().is_relative_to(destination):
                    raise RuntimeError("PACKAGE_ARCHIVE_TRAVERSAL")
            archive.extractall(destination)
        payload = destination / "evidra-engine"
        commands.run(
            "integrity-and-corruption",
            [
                "node",
                "scripts/verify-package.mjs",
                str(payload),
                "--exercise-rejection",
            ],
        )
        report["checks"].append(
            "actual payload verifier rejects corrupted manifest and changed bytes"
        )
        executable = payload / "evidra-engine.exe"
        data_dir = directory / "synthetic engine data"
        notebook_id = prefix = form_id = None
        for sequence in (1, 2):
            session = directory / f"session-{sequence}"
            session.mkdir()
            protect_path(session)
            token = secrets.token_hex(32)
            HEADERS["Authorization"] = "Bearer " + token
            handshake = session / "handshake.json"
            receipt = session / "connection.json"
            write_json(
                handshake,
                {
                    "protocol_version": 1,
                    "profile_instance_id": "profile-a",
                    "session_token": token,
                    "data_dir": str(data_dir),
                    "port": 0,
                    "connection_path": str(receipt),
                },
            )
            environment = {
                key: value
                for key, value in os.environ.items()
                if key.upper() not in {"PATH", "PYTHONPATH", "PYTHONHOME", "VIRTUAL_ENV"}
            }
            environment["PATH"] = str(Path(os.environ["SystemRoot"]) / "System32")
            session_report = {
                "sequence": sequence,
                "child_path": environment["PATH"],
                "command": [str(executable), "serve", "--handshake", str(handshake)],
                "checks": [],
            }
            report["sessions"].append(session_report)
            process = None
            stop = threading.Event()
            keeper = None
            heartbeat_errors = []
            try:
                with (
                    (directory / "logs" / f"engine-{sequence}.stdout.log").open("wb") as stdout,
                    (directory / "logs" / f"engine-{sequence}.stderr.log").open("wb") as stderr,
                ):
                    process = subprocess.Popen(
                        session_report["command"],
                        cwd=session,
                        env=environment,
                        stdout=stdout,
                        stderr=stderr,
                        creationflags=subprocess.CREATE_NO_WINDOW,
                    )
                    session_report["pid"] = process.pid
                    deadline = time.monotonic() + 30
                    while not receipt.exists():
                        if process.poll() is not None or time.monotonic() > deadline:
                            raise RuntimeError(
                                f"PACKAGED_ENGINE_START_FAILED: exit={process.poll()}"
                            )
                        time.sleep(0.05)
                    connection = json.loads(receipt.read_text(encoding="utf-8"))
                    if (
                        connection["host"] != "127.0.0.1"
                        or connection["port"] == 23119
                        or connection["protocol_version"] != 1
                        or handshake.exists()
                    ):
                        raise RuntimeError("INVALID_PACKAGED_ENGINE_HANDSHAKE")
                    session_report["connection"] = connection
                    session_report["checks"].append(
                        "private one-use handshake and negotiated loopback protocol"
                    )
                    url = f"http://127.0.0.1:{connection['port']}"
                    with httpx.Client(base_url=url, timeout=15, trust_env=False) as client:

                        def heartbeat(stop=stop, heartbeat_errors=heartbeat_errors):
                            try:
                                while not stop.wait(10):
                                    response = client.post("/v1/bridge/heartbeat", headers=HEADERS)
                                    response.raise_for_status()
                            except BaseException as exc:
                                heartbeat_errors.append(type(exc).__name__)

                        keeper = threading.Thread(target=heartbeat, daemon=True)
                        keeper.start()
                        assert client.get("/v1/status").status_code == 401
                        status = client.get("/v1/status", headers=HEADERS)
                        assert (
                            status.status_code == 200
                            and status.json()["heartbeat_interval_seconds"] == 10
                            and status.json()["heartbeat_timeout_seconds"] == 30
                        )
                        session_report["checks"].append(
                            "authenticated status; absent credential denied"
                        )
                        if sequence == 1:
                            prefix, form, proposal, decision, _ = decision_fixture(client)
                            notebook_id, form_id = prefix.split("/")[3], form["id"]
                            evidence = client.get(
                                prefix + "/evidence/" + proposal["evidence_ids"][0],
                                headers=HEADERS,
                            )
                            assert (
                                evidence.status_code == 200
                                and "42 percent" in evidence.json()["excerpt"]
                            )
                            assert decision["new"]["review_state"] == "APPROVED"
                            raw, _, artifact = export(client, prefix, "json")
                            portable = json.loads(raw)
                            assert any(
                                record["kind"] == "decision" and record["data"] == decision
                                for record in portable["records"]
                            )
                            (directory / "synthetic-notebook.json").write_bytes(raw)
                            session_report["export"] = {
                                "bytes": len(raw),
                                "sha256": hashlib.sha256(raw).hexdigest(),
                                "artifact_id": artifact["id"],
                            }
                            session_report["checks"].extend(
                                [
                                    "notebook and scoped immutable snapshot",
                                    "offline lexical search and exact original evidence",
                                    "human-reviewed matrix cell",
                                    "authenticated export bytes and checksum",
                                ]
                            )
                            pdf = directory / "synthetic two-page.pdf"
                            pdf.write_bytes(
                                pdf_bytes(
                                    [
                                        {"lines": [(40, 440, "Frozen PDFium first page.")]},
                                        {
                                            "lines": [(40, 440, "Frozen PDFium second page.")],
                                            "rotation": 90,
                                        },
                                    ],
                                    labels=True,
                                )
                            )
                            item = source(key="PDFTEST1")
                            _, _, selection, pdf_prefix = document_scope(
                                client, [item], key="pdf-smoke"
                            )
                            document = register(
                                client,
                                pdf_prefix,
                                selection["items"][0]["id"],
                                pdf,
                                "PDFTEST1PDF",
                            )
                            parse_start = time.perf_counter()
                            parsed = finished(
                                client, pdf_prefix, ingest(client, pdf_prefix, document)
                            )
                            assert (
                                parsed["state"] == "COMPLETE" and parsed["pages_processed"] == 2
                            ), parsed
                            session_report["parser"] = {
                                "bytes": pdf.stat().st_size,
                                "pages": parsed["pages_processed"],
                                "coverage": parsed["coverage"],
                                "elapsed_seconds": time.perf_counter() - parse_start,
                            }
                            cache_start = time.perf_counter()
                            cached = finished(
                                client,
                                pdf_prefix,
                                ingest(client, pdf_prefix, document, key="cache-2"),
                            )
                            assert cached["document_version_id"] == parsed["document_version_id"]
                            session_report["parser"]["cache_hit_seconds"] = (
                                time.perf_counter() - cache_start
                            )
                            session_report["checks"].append(
                                "frozen PDFium child parses two real synthetic pages"
                            )
                        else:
                            native_sources = [
                                {key: record["data"][key] for key in SourceInput.model_fields}
                                for record in portable["records"] if record["kind"] == "source"
                            ]
                            revalidated = sync(client, notebook_id, native_sources,
                                purpose="revalidation", snapshot_id=prefix.split("/")[5])
                            assert revalidated.status_code == 200, revalidated.text
                            assert (
                                client.get(
                                    f"/v1/notebooks/{notebook_id}", headers=HEADERS
                                ).status_code
                                == 200
                            )
                            matrix = client.post(
                                prefix + "/matrix/query",
                                headers=HEADERS,
                                json={"form_version_id": form_id, "offset": 0},
                            ).json()
                            assert (
                                matrix["items"][0]["review_state"] == "APPROVED"
                                and matrix["items"][0]["value"]["normalized"] == 42
                            )
                            session_report["checks"].append(
                                "restart preserves the approved matrix value"
                            )
                        stop.set()
                        keeper.join(timeout=12)
                        if keeper.is_alive() or heartbeat_errors:
                            raise RuntimeError(f"HEARTBEAT_HELPER_FAILED: {heartbeat_errors}")
                        assert (
                            client.post("/v1/bridge/heartbeat", headers=HEADERS).status_code == 200
                        )
                    print(
                        json.dumps(
                            {
                                "session": sequence,
                                "state": "waiting for real heartbeat expiry",
                            }
                        ),
                        flush=True,
                    )
                    session_report["exit_code"] = process.wait(timeout=40)
                    assert process.returncode == 0 and not receipt.exists()
                    with socket.socket() as probe:
                        assert probe.connect_ex(("127.0.0.1", connection["port"])) != 0
                    session_report["checks"].append(
                        "30-second expiry exits normally and removes receipt/socket"
                    )
                assert all(
                    token.encode() not in path.read_bytes()
                    for path in (directory / "logs").glob(f"engine-{sequence}.*.log")
                )
                assert token not in json.dumps(session_report)
                session_report["checks"].append("session secret absent from logs and process argv")
            finally:
                stop.set()
                if keeper is not None:
                    keeper.join(timeout=12)
                if process is not None and process.poll() is None:
                    process.terminate()
                    process.wait(timeout=10)
                    session_report["forced_cleanup_after_failure"] = True
                handshake.unlink(missing_ok=True)
                write_json(directory / "report.json", report)
        report["status"] = "PASSED"
    except BaseException as exc:
        report.update(status="FAILED", failure={"type": type(exc).__name__, "message": str(exc)})
        raise
    finally:
        report["commands"] = commands.results
        report["check_count"] = len(report["checks"]) + sum(
            len(session["checks"]) for session in report["sessions"]
        )
        write_json(directory / "report.json", report)
        print(
            json.dumps(
                {
                    "report": str(directory / "report.json"),
                    "status": report["status"],
                    "checks": report["check_count"],
                }
            ),
            flush=True,
        )


if __name__ == "__main__":
    main()
