"""Medição do limite de memória do worker do PDFium em Linux: RLIMIT_DATA vs RLIMIT_AS (F2).

Roda o worker real (`evidra.documents.parser_worker.worker_main`) num filho com um único limite
de memória aplicado antes da leitura do documento, sobre fixtures normais e bombas de PDF, e
registra desfecho, pico de RSS (`wait4` -> ru_maxrss), VmPeak/VmData/VmHWM do próprio filho e
bytes de saída. Não grava nada no repositório: imprime JSON e uma tabela.

Uso (raiz do repositório):
    uv run --project services/engine python scripts/spikes/worker_memory_probe.py [--json out.json]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "services" / "engine" / "tests"))
from pdf_fixtures import pdf_bytes  # noqa: E402

MIB = 1024 * 1024
CHILD = r"""
import atexit, json, os, resource, sys
kind, limit, report = sys.argv[1], int(sys.argv[2]), sys.argv[3]
from evidra.documents import parser_worker
parser_worker.apply_child_limits = lambda limits: None   # a sonda aplica o seu próprio limite
if kind != "NONE":
    which = resource.RLIMIT_DATA if kind == "DATA" else resource.RLIMIT_AS
    resource.setrlimit(which, (limit, limit))
def at_exit():
    out = {}
    for line in open("/proc/self/status"):
        key, _, value = line.partition(":")
        if key in ("VmPeak", "VmHWM", "VmData"):
            out[key] = int(value.split()[0]) // 1024   # MiB
    open(report, "w").write(json.dumps(out))
atexit.register(at_exit)
parser_worker.worker_main()
"""


def bomb(decompressed: int) -> bytes:
    """One page whose content stream inflates to `decompressed` bytes of whitespace."""
    packer = zlib.compressobj(9)
    chunk = b" " * MIB
    parts = [packer.compress(chunk) for _ in range(decompressed // MIB)] + [packer.flush()]
    stream = b"".join(parts)
    objects = [
        b"<</Type/Catalog/Pages 2 0 R>>",
        b"<</Type/Pages/Kids[3 0 R]/Count 1>>",
        b"<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>",
        b"<</Filter/FlateDecode/Length %d>>\nstream\n" % len(stream) + stream + b"\nendstream",
    ]
    out, offsets = b"%PDF-1.4\n", []
    for number, body in enumerate(objects, 1):
        offsets.append(len(out))
        out += b"%d 0 obj\n" % number + body + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 5\n0000000000 65535 f \n" + b"".join(b"%010d 00000 n \n" % o for o in offsets)
    return out + b"trailer\n<</Size 5/Root 1 0 R>>\nstartxref\n%d\n%%%%EOF\n" % xref


def fixtures() -> dict[str, bytes]:
    return {
        "small-5p": pdf_bytes([{"lines": [(40, 440, "decisive finding " * 5)]} for _ in range(5)]),
        "text-500p": pdf_bytes([{"lines": [(40, 440, "a" * 1000)]} for _ in range(500)]),
        "dense-100k-lines": pdf_bytes(
            [{"lines": [(40 + i % 10, 40 + i % 400, "limited allocation") for i in range(100_000)]}]
        ),
        "bomb-256MiB": bomb(256 * MIB),
        "bomb-1GiB": bomb(1024 * MIB),
        "bomb-4GiB": bomb(4096 * MIB),
    }


def run(kind: str, limit: int, pdf: Path) -> dict:
    with tempfile.TemporaryDirectory() as scratch:
        report = Path(scratch) / "report.json"
        descriptor = os.open(pdf, os.O_RDONLY)
        request = {"kind": "ingest", "handle": descriptor,
                   "limits": {"max_file_bytes": 2_000_000_000, "max_pages": 10000,
                              "memory_bytes": 4096 * MIB, "timeout_seconds": 600}}
        with tempfile.TemporaryFile("w+b") as stdin, tempfile.TemporaryFile("w+b") as stdout, \
                tempfile.TemporaryFile("w+b") as stderr:
            stdin.write(json.dumps(request).encode())
            stdin.seek(0)
            process = subprocess.Popen(
                [sys.executable, "-c", CHILD, kind, str(limit), str(report)],
                stdin=stdin, stdout=stdout, stderr=stderr, pass_fds=(descriptor,), start_new_session=True)
            _, status, usage = os.wait4(process.pid, 0)
            os.close(descriptor)
            stdout.seek(0)
            lines = stdout.read().decode(errors="replace").splitlines()
            stderr.seek(0)
            error = stderr.read().decode(errors="replace")
        code = os.waitstatus_to_exitcode(status)
        outcome = "OK" if any('"type": "done"' in line for line in lines) else (
            "LIMIT-PAGE" if any('"limit"' in line for line in lines) else "FAIL")
        causes = []
        if error.strip().startswith("{"):
            try:
                causes = [c["type"] for c in json.loads(error)["causes"]]
            except (ValueError, KeyError):
                causes = ["unparsed-stderr"]
        mem = json.loads(report.read_text()) if report.exists() else {}
        return {"kind": kind, "limit_mib": limit // MIB, "exit": code, "outcome": outcome,
                "causes": causes, "rss_peak_mib": round(usage.ru_maxrss / 1024),
                "stdout_kib": round(sum(len(x) for x in lines) / 1024), **mem}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()
    rows = []
    with tempfile.TemporaryDirectory() as scratch:
        paths = {}
        for name, data in fixtures().items():
            path = Path(scratch) / f"{name}.pdf"
            path.write_bytes(data)
            paths[name] = path
        for name, path in paths.items():
            for kind, limit in [("NONE", 0)] + [(k, m * MIB) for k in ("DATA", "AS") for m in (64, 128, 256, 512, 1024)]:
                row = {"fixture": name, "bytes": path.stat().st_size, **run(kind, limit, path)}
                rows.append(row)
                print(f"{name:18} {kind:5} {row['limit_mib']:5} -> {row['outcome']:10} exit={row['exit']:4} "
                      f"rss={row['rss_peak_mib']:5}MiB VmPeak={row.get('VmPeak','?')} VmData={row.get('VmData','?')} {row['causes']}", flush=True)
    if args.json:
        args.json.write_text(json.dumps(rows, indent=1))


if __name__ == "__main__":
    main()
