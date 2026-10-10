"""Linux isolation of the PDFium worker: limits, classification, process group, descriptors."""

import json
import os
import signal
import subprocess
import sys
import time
import zlib
from pathlib import Path
from typing import Any

import pytest

from evidra.domain.documents import ParserLimits
from evidra.domain.errors import EvidraError

pytestmark = pytest.mark.skipif(sys.platform == "win32", reason="POSIX isolation")
MIB = 1024 * 1024

PRELUDE = """
import json, os, sys, time
from evidra.documents._worker_common import diagnostic
from evidra.documents._worker_posix import apply_child_limits
from evidra.domain.documents import ParserLimits
request = json.loads(sys.stdin.buffer.read())
limits = ParserLimits.model_validate(request["limits"])
try:
    apply_child_limits(limits, int(sys.argv[1]))
except BaseException as exc:
    print(json.dumps(diagnostic(exc)), file=sys.stderr)
    raise SystemExit(1)
HANDLE = request["handle"]


def host_pid():
    # This process's PID as the engine's namespace sees it (first NSpid entry).
    for line in open("/proc/self/status"):
        if line.startswith("NSpid:"):
            return int(line.split()[1])
"""


class Spawned:
    def __init__(self) -> None:
        self.pids: list[int] = []


@pytest.fixture
def worker(monkeypatch: pytest.MonkeyPatch) -> Any:
    from evidra.documents import _worker_posix as platform

    spawned = Spawned()
    original = platform._spawn

    def recording(command: list[str], **options: Any) -> Any:
        process = original(command, **options)
        spawned.pids.append(process.pid)
        return process

    monkeypatch.setattr(platform, "_spawn", recording)

    def scenario(body: str, *extra: str) -> None:
        code = PRELUDE + body
        monkeypatch.setattr(
            platform, "_command", lambda parent_pid: [sys.executable, "-c", code, str(parent_pid)]
        )

    def raw(code: str) -> None:  # a child that does NOT call apply_child_limits itself
        monkeypatch.setattr(
            platform, "_command", lambda parent_pid: [sys.executable, "-c", code, str(parent_pid)]
        )

    spawned.raw = raw  # type: ignore[attr-defined]
    spawned.scenario = scenario  # type: ignore[attr-defined]
    spawned.platform = platform  # type: ignore[attr-defined]
    return spawned


def run(
    tmp_path: Path,
    limits: ParserLimits,
    check: Any = lambda: None,
    request: dict[str, Any] | None = None,
    content: bytes = b"%PDF-1.4\n",
) -> str:
    from evidra.documents._worker_posix import run_worker

    source = tmp_path / "source.pdf"
    source.write_bytes(content)
    with (
        source.open("rb") as stream,
        run_worker(
            stream, request or {"kind": "ingest"}, limits, check, lambda _size: None
        ) as output,
    ):
        return output.read().decode()


def alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    try:  # a zombie still answers signal 0
        return Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()[0] != "Z"
    except FileNotFoundError:
        return False


def gone(*pids: int, within: float = 3.0) -> bool:
    deadline = time.monotonic() + within
    while time.monotonic() < deadline:
        if not any(alive(pid) for pid in pids):
            return True
        time.sleep(0.02)
    return False


def bomb_pdf(decompressed: int) -> bytes:
    packer = zlib.compressobj(9)
    parts = [packer.compress(b" " * MIB) for _ in range(decompressed // MIB)] + [packer.flush()]
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


# --- the real worker --------------------------------------------------------------------------
def test_real_worker_parses_a_pdf_under_the_isolation(tmp_path: Path) -> None:
    from pdf_fixtures import pdf_bytes

    output = run(
        tmp_path,
        ParserLimits(memory_bytes=64 * MIB, timeout_seconds=30),
        content=pdf_bytes([{"lines": [(40, 440, "decisive finding")]}]),
    )
    lines = [json.loads(line) for line in output.splitlines()]
    assert [line["type"] for line in lines] == ["header", "page", "done"]
    assert "decisive finding" in lines[1]["page"]["original_text"]


def test_real_worker_contains_a_decompression_bomb(
    tmp_path: Path, worker: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    """PDFium aborts on allocation failure; the process is dead, bounded, and not mislabeled."""
    with pytest.raises(EvidraError) as failure:
        run(
            tmp_path,
            ParserLimits(memory_bytes=128 * MIB, timeout_seconds=60),
            content=bomb_pdf(256 * MIB),
        )
    error = failure.value
    assert error.details is not None
    assert gone(*worker.pids)
    if error.code == "PARSER_MEMORY_LIMIT":  # the watchdog or Python saw the exhaustion
        assert error.details["returncode"] == 1
        assert any(c["type"] == "MemoryError" for c in error.details["causes"])
    else:  # PDFium aborted on a single allocation larger than the headroom
        assert error.code == "PARSER_FAILED"
        assert error.details["signal"] == signal.SIGABRT
        assert error.details["evidence"] == "none"  # no cause is claimed without evidence
        assert error.details["memory_limit_mib"] == 128
        peak = error.details["peak_rss_mib"]  # the child's own VmHWM; ru_maxrss is the engine's
        assert peak is None or peak < 128 + 150  # unbounded it would inflate to 256+ MiB


# --- classification, with children that fail in a controlled way ------------------------------
def test_python_memory_error_is_a_memory_limit(tmp_path: Path, worker: Any) -> None:
    worker.scenario("""
try:
    hold = [bytearray(8 * 1024 * 1024) for _ in range(200)]
except MemoryError as exc:
    print(json.dumps(diagnostic(exc)), file=sys.stderr)
    raise SystemExit(1)
""")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(memory_bytes=64 * MIB, timeout_seconds=30))
    assert failure.value.code == "PARSER_MEMORY_LIMIT"


def test_watchdog_reports_exhaustion_before_the_native_abort(tmp_path: Path, worker: Any) -> None:
    """Growth stops 2% short of the rlimit: no MemoryError, no abort; only the watchdog sees it."""
    worker.scenario("""
from evidra.documents._worker_posix import _vm_data_bytes
target = int(limits.memory_bytes * 0.985)
hold = []
while _vm_data_bytes() < target:
    hold.append(bytearray(256 * 1024))
time.sleep(5)
print("survived")
""")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(memory_bytes=128 * MIB, timeout_seconds=30))
    assert failure.value.code == "PARSER_MEMORY_LIMIT"
    assert failure.value.details["returncode"] == 1  # type: ignore[index]
    assert gone(*worker.pids)


def test_native_abort_without_evidence_is_not_called_a_memory_limit(
    tmp_path: Path, worker: Any
) -> None:
    worker.scenario("os.abort()")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(memory_bytes=512 * MIB, timeout_seconds=30))
    error = failure.value
    assert error.code == "PARSER_FAILED"
    assert error.details["evidence"] == "none"  # type: ignore[index]
    assert error.details["memory_limit_mib"] == 512  # type: ignore[index]


def test_clean_exit_with_unexpected_stderr_is_refused(tmp_path: Path, worker: Any) -> None:
    worker.scenario('print("noise", file=sys.stderr)')
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert failure.value.code == "PARSER_DIAGNOSTIC"


def test_child_error_code_is_preserved(tmp_path: Path, worker: Any) -> None:
    worker.scenario("""
from evidra.domain.errors import EvidraError
print(json.dumps(diagnostic(EvidraError("PAGE_LIMIT", "too many"))), file=sys.stderr)
raise SystemExit(1)
""")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert failure.value.code == "PAGE_LIMIT"


# --- CPU, wall clock --------------------------------------------------------------------------
def test_cpu_loop_is_killed_by_the_wall_clock_and_the_kernel_limit(
    tmp_path: Path, worker: Any
) -> None:
    worker.scenario("while True:\n    pass")
    started = time.monotonic()
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=1))
    assert failure.value.code == "PARSER_TIMEOUT"
    assert time.monotonic() - started < 6
    assert gone(*worker.pids)


def test_kernel_cpu_limit_kills_the_child_with_no_parent_involved(tmp_path: Path) -> None:
    code = PRELUDE + "while True:\n    pass"
    request = {
        "kind": "ingest",
        "handle": 0,
        "limits": ParserLimits(timeout_seconds=1).model_dump(),
    }
    started = time.monotonic()
    process = subprocess.run(
        [sys.executable, "-c", code, str(os.getpid())],
        input=json.dumps(request).encode(),
        capture_output=True,
        timeout=30,
    )
    assert process.returncode == -signal.SIGKILL  # soft == hard: no SIGXCPU grace
    assert 1.5 < time.monotonic() - started < 8


# --- process group, parent death ---------------------------------------------------------------
def test_cancellation_kills_the_whole_process_group(tmp_path: Path, worker: Any) -> None:
    marker = tmp_path / "pids.json"
    grandchild_file = tmp_path / "grandchild.pid"
    worker.scenario(f"""
import subprocess
GRANDCHILD = (
    "import os, time\\n"
    "for l in open('/proc/self/status'):\\n"
    "    if l.startswith('NSpid:'): open({str(grandchild_file)!r}, 'w').write(l.split()[1])\\n"
    "time.sleep(300)\\n"
)
subprocess.Popen([sys.executable, "-c", GRANDCHILD])
while not os.path.exists({str(grandchild_file)!r}) or not open({str(grandchild_file)!r}).read():
    time.sleep(0.01)
GC = int(open({str(grandchild_file)!r}).read())
open({str(marker)!r}, "w").write(json.dumps([host_pid(), GC]))
time.sleep(300)
""")

    def cancelled() -> None:
        if marker.exists() and marker.read_text().endswith("]"):
            raise EvidraError("CANCELLED", "The operation was cancelled.")

    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=60), check=cancelled)
    assert failure.value.code == "CANCELLED"
    worker_pid, grandchild = json.loads(marker.read_text())
    assert worker_pid != worker.pids[0]  # the worker is below two supervisors
    assert gone(worker.pids[0], worker_pid, grandchild)


def test_child_runs_in_its_own_session_and_group(tmp_path: Path, worker: Any) -> None:
    worker.scenario("time.sleep(1)")
    seen: list[tuple[int, int]] = []

    def observe() -> None:
        if worker.pids and not seen:
            pid = worker.pids[0]
            seen.append((os.getsid(pid), os.getpgid(pid)))

    run(tmp_path, ParserLimits(timeout_seconds=30), check=observe)
    session, group = seen[0]
    assert session == group == worker.pids[0]
    assert group != os.getpgid(0) and session != os.getsid(0)


def test_parent_death_kills_the_child(tmp_path: Path) -> None:
    marker = tmp_path / "child.pid"
    source = tmp_path / "source.pdf"
    source.write_bytes(b"%PDF-1.4\n")
    harness = f"""
import sys, time
from pathlib import Path
from evidra.documents import _worker_posix as platform
from evidra.documents._worker_posix import run_worker
from evidra.domain.documents import ParserLimits
code = {PRELUDE!r} + "open({str(marker)!r}, 'w').write(str(host_pid()))\\ntime.sleep(300)\\n"
platform._command = lambda parent_pid: [sys.executable, "-c", code, str(parent_pid)]
with open({str(source)!r}, "rb") as stream:
    limits = ParserLimits(timeout_seconds=120)
    with run_worker(stream, {{"kind": "ingest"}}, limits, lambda: None, lambda n: None):
        pass
"""
    parent = subprocess.Popen([sys.executable, "-c", harness])
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline and not (marker.exists() and marker.read_text()):
        time.sleep(0.05)
    child = int(marker.read_text())
    assert alive(child)
    parent.kill()
    parent.wait()
    assert gone(child, within=5), "PDEATHSIG must kill the worker when the engine dies"


def test_child_refuses_to_run_when_its_parent_is_not_the_expected_one(tmp_path: Path) -> None:
    code = PRELUDE + "print('ran')"
    request = {"kind": "ingest", "handle": 0, "limits": ParserLimits().model_dump()}
    process = subprocess.run(
        [sys.executable, "-c", code, str(os.getpid() + 1)],  # not our pid
        input=json.dumps(request).encode(),
        capture_output=True,
        timeout=30,
    )
    assert process.returncode == 1 and process.stdout == b""
    assert json.loads(process.stderr)["causes"][0]["code"] == "PARSER_PARENT_GONE"


# --- descriptors, limits, environment ----------------------------------------------------------
def test_no_descriptor_is_leaked_to_the_child(tmp_path: Path, worker: Any) -> None:
    sentinel = tmp_path / "parent-private.txt"
    sentinel.write_text("parent secret")
    leaked = os.open(sentinel, os.O_RDONLY)
    os.set_inheritable(leaked, True)  # inheritable on purpose: close_fds must still drop it
    try:
        worker.scenario("""
targets = {}
for fd in os.listdir("/proc/self/fd"):
    try:
        targets[fd] = os.readlink("/proc/self/fd/" + fd)
    except OSError:
        targets[fd] = "<closed>"
print(json.dumps({"targets": targets, "handle": HANDLE}))
""")
        report = json.loads(run(tmp_path, ParserLimits(timeout_seconds=30)))
    finally:
        os.close(leaked)
    targets: dict[str, str] = report["targets"]
    assert str(sentinel) not in targets.values()
    assert str(tmp_path / "source.pdf") == targets[str(report["handle"])]  # the verified source
    for fd in ("0", "1", "2"):
        assert "(deleted)" in targets[fd]  # the three unnamed spool files
    other = {
        fd: target
        for fd, target in targets.items()
        if fd not in {"0", "1", "2", str(report["handle"])}
    }
    allowed = {"/dev/urandom", "<closed>"}  # interpreter, the listing itself
    assert all(v in allowed or v.endswith("/status") for v in other.values()), other  # watchdog


def test_child_limits_are_visible_in_proc_and_core_is_zero(tmp_path: Path, worker: Any) -> None:
    import re

    worker.scenario("time.sleep(1.5)")
    seen: list[dict[str, tuple[str, str]]] = []

    def observe() -> None:
        if not worker.pids or seen:
            return
        try:
            text = Path(f"/proc/{worker.pids[0]}/limits").read_text()
        except OSError:
            return
        table = {
            m.group(1).strip(): (m.group(2), m.group(3))
            for m in re.finditer(r"^(Max [a-z ]+?)\s{2,}(\S+)\s+(\S+)", text, re.MULTILINE)
        }
        if table.get("Max cpu time") == ("31", "31"):  # the child has applied its limits
            seen.append(table)

    run(tmp_path, ParserLimits(memory_bytes=96 * MIB, timeout_seconds=30), check=observe)
    assert seen, "the child limits were never observed in /proc/<pid>/limits"
    table = seen[0]
    assert table["Max core file size"] == ("0", "0")
    assert table["Max data size"] == (str(96 * MIB), str(96 * MIB))
    assert table["Max file size"] == (str(96 * MIB), str(96 * MIB))
    assert table["Max open files"][0] == table["Max open files"][1]
    assert int(table["Max open files"][0]) <= 256


def test_child_is_not_dumpable_and_cannot_gain_privileges(tmp_path: Path, worker: Any) -> None:
    worker.scenario("""
import ctypes
PR_GET_DUMPABLE = 3
fields = {}
for line in open("/proc/self/status").read().splitlines():
    key, _, value = line.partition(":")
    fields[key] = value.strip()
dumpable = ctypes.CDLL(None).prctl(PR_GET_DUMPABLE, 0, 0, 0, 0)
print(json.dumps({"no_new_privs": fields["NoNewPrivs"], "dumpable": dumpable}))
""")
    report = json.loads(run(tmp_path, ParserLimits(timeout_seconds=30)))
    assert report == {"no_new_privs": "1", "dumpable": 0}


def test_secrets_are_not_passed_to_the_child(
    tmp_path: Path, worker: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("TYPESAFE_API_KEY", "must-not-leak")
    monkeypatch.setenv("EVIDRA_PROVIDER_TOKEN", "must-not-leak")
    monkeypatch.setenv("HARMLESS_SETTING", "ok")
    worker.scenario("print(json.dumps(sorted(os.environ)))")
    names = json.loads(run(tmp_path, ParserLimits(timeout_seconds=30)))
    assert "HARMLESS_SETTING" in names
    assert not {"TYPESAFE_API_KEY", "EVIDRA_PROVIDER_TOKEN"} & set(names)


def test_output_overflow_is_refused(tmp_path: Path, worker: Any) -> None:
    worker.scenario("""
sys.stderr.write("e" * 200000)
sys.stderr.flush()
time.sleep(30)
""")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert failure.value.code == "PARSER_OUTPUT_LIMIT"
    assert gone(*worker.pids)


# --- namespaces: PID, network, user, capabilities ---------------------------------------------
def test_worker_runs_in_its_own_user_pid_and_net_namespaces(tmp_path: Path, worker: Any) -> None:
    mine = {name: os.readlink(f"/proc/self/ns/{name}") for name in ("user", "pid", "net")}
    worker.scenario("""
import ctypes
status = {}
for line in open("/proc/self/status"):
    key, _, value = line.partition(":")
    status[key] = value.split()
print(json.dumps({
    "ns": {n: os.readlink("/proc/self/ns/" + n) for n in ("user", "pid", "net")},
    "nspid": status["NSpid"], "cap_eff": status["CapEff"][0], "cap_prm": status["CapPrm"][0],
    "cap_bnd": status["CapBnd"][0], "no_new_privs": status["NoNewPrivs"][0],
    "ppid": os.getppid(),
}))
""")
    report = json.loads(run(tmp_path, ParserLimits(timeout_seconds=30)))
    for name in ("user", "pid", "net"):
        assert report["ns"][name] != mine[name], f"the worker shares the engine's {name} namespace"
    assert report["nspid"][1:] == ["2"]  # PID 2, below the namespace's init
    assert report["ppid"] == 1
    assert int(report["cap_eff"], 16) == 0 and int(report["cap_prm"], 16) == 0
    assert report["no_new_privs"] == "1"


def test_worker_cannot_reach_the_engine_loopback_or_anything_outside(
    tmp_path: Path, worker: Any
) -> None:
    import socket

    with socket.socket() as server:
        server.bind(("127.0.0.1", 0))
        server.listen()
        port = server.getsockname()[1]
        worker.scenario(f"""
import socket
outcomes = {{}}
for name, address in {{"engine-loopback": ("127.0.0.1", {port}), "external": ("192.0.2.1", 80),
                      "dns-server": ("1.1.1.1", 53)}}.items():
    try:
        with socket.create_connection(address, timeout=2):
            outcomes[name] = "connected"
    except OSError as exc:
        outcomes[name] = exc.errno
interfaces = sorted(
    line.split(":")[0].strip() for line in open("/proc/net/dev").read().splitlines()[2:]
)
print(json.dumps({{"outcomes": outcomes, "interfaces": interfaces}}))
""")
        report = json.loads(run(tmp_path, ParserLimits(timeout_seconds=30)))
        server.settimeout(0.2)
        with pytest.raises(OSError):  # nothing ever reached the engine's listening socket
            server.accept()
    assert "connected" not in report["outcomes"].values(), report
    assert set(report["interfaces"]) <= {"lo"}, report  # only a fresh, unconfigured loopback


def test_grandchild_with_setsid_dies_with_the_worker(tmp_path: Path, worker: Any) -> None:
    marker = tmp_path / "pids.json"
    grandchild_file = tmp_path / "grandchild.pid"
    worker.scenario(f"""
import signal, subprocess
GRANDCHILD = (
    "import os, time\\n"
    "for l in open('/proc/self/status'):\\n"
    "    if l.startswith('NSpid:'): open({str(grandchild_file)!r}, 'w').write(l.split()[1])\\n"
    "time.sleep(300)\\n"
)
subprocess.Popen([sys.executable, "-c", GRANDCHILD], start_new_session=True)  # escapes the group
while not os.path.exists({str(grandchild_file)!r}) or not open({str(grandchild_file)!r}).read():
    time.sleep(0.01)
GC = int(open({str(grandchild_file)!r}).read())
open({str(marker)!r}, "w").write(json.dumps([host_pid(), GC]))
os.kill(os.getpid(), signal.SIGKILL)  # the worker dies; nobody kills the grandchild's group
""")
    with pytest.raises(EvidraError):
        run(tmp_path, ParserLimits(timeout_seconds=60))
    worker_pid, grandchild = json.loads(marker.read_text())
    assert os.getsid(os.getpid()) != grandchild  # sanity: a host pid, not a namespace pid
    assert gone(worker_pid, grandchild), "a setsid grandchild survived the worker"


def test_sandbox_unavailable_fails_explicitly_without_running_the_worker(
    tmp_path: Path, worker: Any
) -> None:
    worker.raw(
        PRELUDE.replace(
            "try:\n    apply_child_limits",
            "def _denied(flags):\n    raise PermissionError(1, 'unshare denied')\n"
            "os.unshare = _denied\ntry:\n    apply_child_limits",
        )
        + "print('the worker ran unsandboxed')\n"
    )
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert failure.value.code == "PARSER_SANDBOX_UNAVAILABLE"
    assert failure.value.details is not None
    assert "the worker ran unsandboxed" not in json.dumps(failure.value.details)


def test_supervisors_mirror_the_workers_exit_code_and_signal(tmp_path: Path, worker: Any) -> None:
    worker.scenario("raise SystemExit(7)")
    with pytest.raises(EvidraError) as failure:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert failure.value.details["returncode"] == 7  # type: ignore[index]
    worker.scenario("import signal\nos.kill(os.getpid(), signal.SIGSEGV)")
    with pytest.raises(EvidraError) as signalled:
        run(tmp_path, ParserLimits(timeout_seconds=30))
    assert signalled.value.details["signal"] == signal.SIGSEGV  # type: ignore[index]
