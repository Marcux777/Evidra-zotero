"""POSIX (Linux) worker isolation (ADR 0004; measurements in its "Limite de memória" section).

The Windows implementation assigns a suspended child to a Job Object. Linux has no unprivileged
parent-side equivalent, so isolation is split between the child, which constrains itself before it
imports PDFium or reads a byte, and the parent, which owns its process group.

Child (`apply_child_limits`, first action of `worker_main`, before `pypdfium2` is imported)
* its own user, PID, mount and network namespaces (`os.unshare`): the worker has no network (a
  fresh loopback only, unrelated to the engine's) and runs as PID 2 under a PID 1 that exits with
  it, so every descendant, `setsid` or not, is killed with it. A fresh procfs is mounted in the
  new mount namespace, so the worker sees only PIDs 1 and 2 and none of the user's processes
  (their command lines, environments and memory). All capabilities are dropped;
* a Landlock ruleset that handles every write-like filesystem right, plus connecting to pathname
  UNIX sockets (ABI 9 `RESOLVE_UNIX`), and allows none: the worker can still read what the user
  can read (and write to the descriptors it inherited), but it can not create, modify, truncate,
  rename or delete any file, and it can not reach the user's D-Bus, agents or `docker.sock`
  (pathname sockets cross the network namespace), so a compromised parser can neither plant
  persistence nor ask another process to act for it;
* when the kernel refuses any of this (`os.unshare`, mounting procfs, Landlock) the worker fails
  with `PARSER_SANDBOX_UNAVAILABLE`; there is no unsandboxed fallback;
* `RLIMIT_DATA`, `RLIMIT_CPU`, `RLIMIT_NOFILE`, `RLIMIT_FSIZE` with soft == hard, so they cannot
  be raised, and `RLIMIT_CORE = 0`; `PR_SET_DUMPABLE = 0`; `PR_SET_NO_NEW_PRIVS`;
* `PR_SET_PDEATHSIG = SIGKILL`, then `getppid()` is compared with the PID received on the command
  line, which closes the window in which the parent died before the signal was armed;
* a wall-clock `alarm` as a last backstop;
* a watchdog thread that reads its own `VmData` every 10 ms and, within 3% of the memory limit,
  writes a `MemoryError` diagnostic and exits. This is the only positive evidence of memory
  exhaustion available when PDFium would otherwise abort without a word.

Parent (`run_worker`)
* `start_new_session=True` (own session and process group), no `preexec_fn`;
* only descriptors 0, 1, 2 and the verified source file are inherited (`pass_fds`);
* secrets in the engine environment are not passed on;
* the child is spawned from one process-lifetime thread, because `PDEATHSIG` is tied to the
  *thread* that forked and a recycled pool thread would otherwise kill a healthy worker;
* wall-clock timeout, cancellation and any error send SIGKILL to the whole group, then reap;
* the child is reaped with `os.wait4` so the exit signal and CPU time are known. `ru_maxrss` is
  recorded but is NOT the child's own peak: at `exec` the kernel folds the pre-exec address space
  (the engine's) into it, so a 130 MiB worker started by a 700 MiB engine reports ~700 MiB. The
  child's peak is sampled from `/proc/<pid>/status` `VmHWM` (a lower bound: the last sample before
  death);
* a termination is attributed to a limit only with positive evidence (see `_classify_signal`):
  a Python `MemoryError`, the watchdog report, the CPU limit, or the file-size limit. A bare native
  abort stays `PARSER_FAILED` with the facts (signal, peak RSS, CPU time, armed limits).

Measured on this host (Fedora 43, Python 3.12, PDFium 153): `RLIMIT_AS` cannot be used, because
the interpreter plus PDFium reach `VmPeak` ~283 MiB before any document is read and benign PDFs
fail below 512 MiB; `RLIMIT_DATA` runs them from 64 MiB. PDFium aborts (SIGABRT, empty stderr) when
an allocation fails, so a single allocation larger than the remaining headroom is reported as
`PARSER_FAILED`, not as a memory limit: no cause is claimed that the process did not demonstrate.
"""

import ctypes
import json
import math
import os
import platform
import re
import resource
import signal
import struct
import subprocess
import sys
import tempfile
import threading
import time
from collections.abc import Callable, Iterator
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from typing import Any, BinaryIO, NoReturn, cast

if sys.platform == "win32":
    raise ImportError("evidra.documents._worker_posix requires a POSIX host")

from evidra.documents._worker_common import CHILD_CODES, child_diagnostic, diagnostic
from evidra.domain.documents import ParserLimits
from evidra.domain.errors import EvidraError

_STDERR_LIMIT = 65536
_SECRET_NAME = re.compile(r"KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL", re.IGNORECASE)
_MS_NOSUID, _MS_NODEV, _MS_NOEXEC = 2, 4, 8
_MS_REC, _MS_PRIVATE = 16384, 1 << 18
_PROC_FSTYPE = "proc"
# Landlock syscalls (same numbers on x86_64 and aarch64) and the write-like access rights.
_LANDLOCK_SYSCALLS = (444, 445, 446)  # create_ruleset, add_rule, restrict_self
_LANDLOCK_WRITE_RIGHTS = (  # (first ABI that has it, bit)
    (1, 1 << 1),  # WRITE_FILE
    (1, 1 << 4),  # REMOVE_DIR
    (1, 1 << 5),  # REMOVE_FILE
    (1, 1 << 6),  # MAKE_CHAR
    (1, 1 << 7),  # MAKE_DIR
    (1, 1 << 8),  # MAKE_REG
    (1, 1 << 9),  # MAKE_SOCK
    (1, 1 << 10),  # MAKE_FIFO
    (1, 1 << 11),  # MAKE_BLOCK
    (1, 1 << 12),  # MAKE_SYM
    (2, 1 << 13),  # REFER
    (3, 1 << 14),  # TRUNCATE
    (5, 1 << 15),  # IOCTL_DEV
    (9, 1 << 16),  # RESOLVE_UNIX: connect to pathname UNIX sockets (D-Bus, agents, docker.sock)
)
# Without RESOLVE_UNIX a sandboxed worker can still reach any pathname UNIX socket of the user
# (verified), which crosses the network namespace; so an older kernel is refused, not degraded.
_LANDLOCK_MIN_ABI = 9
_PR_SET_DUMPABLE = 4
_PR_SET_PDEATHSIG = 1
_PR_SET_NO_NEW_PRIVS = 38
_MAX_OPEN_FILES = 256
_MIB = 1024 * 1024
_WATCHDOG_RATIO = 0.97
_WATCHDOG_INTERVAL = 0.01
_SPAWNER = ThreadPoolExecutor(max_workers=1, thread_name_prefix="evidra-worker-spawner")


def _cpu_seconds(limits: ParserLimits) -> int:
    return math.ceil(limits.timeout_seconds) + 1


def _command(parent_pid: int) -> list[str]:
    if getattr(sys, "frozen", False):
        arguments = [sys.executable, "--parser-worker"]
    else:
        arguments = [sys.executable, "-m", "evidra", "--parser-worker"]
    return [*arguments, "--parent-pid", str(parent_pid)]


def _environment() -> dict[str, str]:
    return {k: v for k, v in os.environ.items() if not _SECRET_NAME.search(k)}


def open_worker_stream(handle: int) -> BinaryIO:
    """Adopt the inherited source descriptor (same number in the child, via `pass_fds`)."""
    return os.fdopen(handle, "rb")


def _prctl(library: Any, option: int, value: int, name: str) -> None:
    if library.prctl(option, value, 0, 0, 0) != 0:
        raise EvidraError(
            "PARSER_LIMIT_SETUP",
            "The worker could not restrict itself.",
            details={"call": name, "errno": ctypes.get_errno()},
        )


def _vm_data_bytes() -> int:
    with open("/proc/self/status", "rb") as status:
        for line in status:
            if line.startswith(b"VmData:"):
                return int(line.split()[1]) * 1024
    return 0


def _memory_watchdog(limit: int) -> None:
    threshold = int(limit * _WATCHDOG_RATIO)
    report = json.dumps(
        {
            "causes": [
                {
                    "type": "MemoryError",
                    "code": "PARSER_MEMORY_LIMIT",
                    "errno": None,
                    "winerror": None,
                    "pdfium_error": None,
                }
            ]
        }
    ).encode()
    while True:
        if _vm_data_bytes() >= threshold:
            os.write(2, report)
            os._exit(1)
        time.sleep(_WATCHDOG_INTERVAL)


def _sandbox_unavailable(reason: str, exc: BaseException | None = None) -> EvidraError:
    error = EvidraError(
        "PARSER_SANDBOX_UNAVAILABLE",
        "The worker cannot be isolated in its own namespaces; refusing to run unsandboxed.",
        details={"reason": reason, "errno": getattr(exc, "errno", None)},
    )
    if exc is not None:
        error.__cause__ = exc
    return error


def _supervise(child: int, *, reraise: bool) -> NoReturn:
    """Wait for `child` and end this process the same way (exit code, or the same signal)."""
    while True:
        try:
            _, status = os.waitpid(child, 0)
            break
        except ChildProcessError:
            os._exit(1)
    if os.WIFSIGNALED(status):
        number, code = os.WTERMSIG(status), 128 + os.WTERMSIG(status)
    else:
        number, code = 0, os.WEXITSTATUS(status)
    if not number and reraise and 128 < code < 128 + signal.NSIG:
        number = code - 128  # PID 1 reports a signal death of the worker as 128 + n
    if number and reraise:
        if number not in (signal.SIGKILL, signal.SIGSTOP):  # their action cannot be changed
            signal.signal(number, signal.SIG_DFL)
        os.kill(os.getpid(), number)  # the engine sees the worker's own signal
    os._exit(code)


def _drop_capabilities() -> None:
    """Empty the effective, permitted and inheritable sets (a new user namespace grants all)."""
    numbers = {"x86_64": 126, "aarch64": 91}
    number = numbers.get(platform.machine())
    if number is None:
        raise _sandbox_unavailable(f"capset is not known for {platform.machine()}")

    class Header(ctypes.Structure):
        _fields_ = [("version", ctypes.c_uint32), ("pid", ctypes.c_int)]

    class Data(ctypes.Structure):
        _fields_ = [
            ("effective", ctypes.c_uint32),
            ("permitted", ctypes.c_uint32),
            ("inheritable", ctypes.c_uint32),
        ]

    header, data = Header(0x20080522, 0), (Data * 2)()  # _LINUX_CAPABILITY_VERSION_3
    library = ctypes.CDLL(None, use_errno=True)
    if library.syscall(number, ctypes.byref(header), ctypes.byref(data)) != 0:
        raise _sandbox_unavailable("capset failed", OSError(ctypes.get_errno(), "capset"))


def _private_proc(library: Any) -> None:
    """In the new mount namespace: stop propagation, then mount a procfs of the new PID ns."""
    for source, target, fstype, flags in (
        (None, b"/", None, _MS_REC | _MS_PRIVATE),
        (b"proc", b"/proc", _PROC_FSTYPE.encode(), _MS_NOSUID | _MS_NODEV | _MS_NOEXEC),
    ):
        done = library.mount(source, target, fstype, ctypes.c_ulong(flags), None)
        if done != 0:
            raise _sandbox_unavailable(
                "mount", OSError(ctypes.get_errno(), "mount " + target.decode())
            )


def _deny_filesystem_writes(library: Any) -> None:
    """Landlock: handle every write-like right and grant none (reads are not restricted)."""
    create, _add, restrict = _LANDLOCK_SYSCALLS
    abi = library.syscall(create, None, 0, 1)  # LANDLOCK_CREATE_RULESET_VERSION
    if abi < 1:
        raise _sandbox_unavailable(
            "landlock", OSError(ctypes.get_errno(), "landlock is not available")
        )
    if abi < _LANDLOCK_MIN_ABI:
        raise _sandbox_unavailable(f"landlock ABI {abi} < {_LANDLOCK_MIN_ABI} (RESOLVE_UNIX)")
    handled = 0
    for first_abi, bit in _LANDLOCK_WRITE_RIGHTS:
        if abi >= first_abi:
            handled |= bit
    attribute = struct.pack("Q", handled)
    ruleset = library.syscall(create, attribute, len(attribute), 0)
    if ruleset < 0:
        raise _sandbox_unavailable(
            "landlock", OSError(ctypes.get_errno(), "landlock_create_ruleset")
        )
    try:
        if library.syscall(restrict, ruleset, 0) != 0:
            raise _sandbox_unavailable(
                "landlock", OSError(ctypes.get_errno(), "landlock_restrict_self")
            )
    finally:
        os.close(ruleset)


def _enter_sandbox(library: Any) -> None:
    """Move into new user, PID and network namespaces and become PID 2 below a reaping PID 1.

    The caller must still be single-threaded (a user namespace cannot be unshared otherwise), so
    this runs before the watchdog thread and the alarm. Returns only in the final worker process;
    the two supervisor processes above it never return.
    """
    try:
        os.unshare(os.CLONE_NEWUSER | os.CLONE_NEWNS | os.CLONE_NEWPID | os.CLONE_NEWNET)
    except (AttributeError, OSError) as exc:
        raise _sandbox_unavailable("unshare", exc) from exc
    init = os.fork()
    if init:  # still in the engine's PID namespace: end the way PID 1 ends
        _supervise(init, reraise=True)
    # PID 1 of the new namespace: when it exits the kernel kills every process in it.
    _prctl(library, _PR_SET_PDEATHSIG, signal.SIGKILL, "PR_SET_PDEATHSIG")
    if os.getpid() != 1:
        raise _sandbox_unavailable("the child is not PID 1 of its namespace")
    _private_proc(library)  # needs the namespace's capabilities, so before they are dropped
    _drop_capabilities()  # PID 1 only waits: it keeps nothing
    worker = os.fork()
    if worker:
        _supervise(worker, reraise=False)
    # PID 2: the worker proper. A fresh PDEATHSIG, then verify the reaper is still its parent.
    _prctl(library, _PR_SET_PDEATHSIG, signal.SIGKILL, "PR_SET_PDEATHSIG")
    if os.getppid() != 1:
        raise EvidraError("PARSER_PARENT_GONE", "The namespace init exited before the worker ran.")
    _drop_capabilities()
    _deny_filesystem_writes(library)


def apply_child_limits(limits: ParserLimits, parent_pid: int | None = None) -> None:
    library = ctypes.CDLL(None, use_errno=True)
    # Armed first: if the engine is already gone the group would otherwise run unattended.
    if parent_pid is not None:
        _prctl(library, _PR_SET_PDEATHSIG, signal.SIGKILL, "PR_SET_PDEATHSIG")
        if os.getppid() != parent_pid:
            raise EvidraError("PARSER_PARENT_GONE", "The engine that started this worker exited.")
    _prctl(library, _PR_SET_DUMPABLE, 0, "PR_SET_DUMPABLE")
    _prctl(library, _PR_SET_NO_NEW_PRIVS, 1, "PR_SET_NO_NEW_PRIVS")
    cpu = _cpu_seconds(limits)
    _, nofile_hard = resource.getrlimit(resource.RLIMIT_NOFILE)
    files = min(_MAX_OPEN_FILES, nofile_hard)
    for which, value in (
        (resource.RLIMIT_CORE, 0),
        (resource.RLIMIT_DATA, limits.memory_bytes),
        (resource.RLIMIT_CPU, cpu),
        (resource.RLIMIT_FSIZE, limits.memory_bytes),
        (resource.RLIMIT_NOFILE, files),
    ):
        resource.setrlimit(which, (value, value))
    _enter_sandbox(library)  # forks: timers and threads are created after it, in the worker
    signal.alarm(cpu + 10)  # wall-clock backstop independent of the engine
    threading.Thread(
        target=_memory_watchdog, args=(limits.memory_bytes,), name="memory-watchdog", daemon=True
    ).start()


def _vm_hwm_mib(pid: int) -> int | None:
    try:
        with open(f"/proc/{pid}/status", "rb") as status:
            for line in status:
                if line.startswith(b"VmHWM:"):
                    return int(line.split()[1]) // 1024
    except OSError:
        pass
    return None


def _tree_hwm_mib(root: int) -> int | None:
    """Largest `VmHWM` over the spawned process and its descendants (supervisors + worker)."""
    peak: int | None = None
    pending, seen = [root], 0
    while pending and seen < 16:
        pid = pending.pop()
        seen += 1
        sample = _vm_hwm_mib(pid)
        if sample is not None:
            peak = max(sample, peak or 0)
        try:
            with open(f"/proc/{pid}/task/{pid}/children") as children:
                pending.extend(int(child) for child in children.read().split())
        except OSError:
            pass
    return peak


def _size(stream: Any) -> int:
    return os.fstat(stream.fileno()).st_size


def _spawn(command: list[str], **options: Any) -> "subprocess.Popen[bytes]":
    return _SPAWNER.submit(lambda: subprocess.Popen(command, **options)).result()


def _reap(process: "subprocess.Popen[bytes]", *, block: bool) -> Any:
    """Return `(status, rusage)` once the child has exited, else None; records the exit code."""
    done, status, usage = os.wait4(process.pid, 0 if block else os.WNOHANG)
    if done == 0:
        return None
    process.returncode = os.waitstatus_to_exitcode(status)
    return usage


def _terminate_group(process: "subprocess.Popen[bytes]") -> None:
    if process.returncode is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        try:
            if _reap(process, block=False) is not None:
                return
        except ChildProcessError:  # already reaped elsewhere
            process.returncode = process.returncode or -signal.SIGKILL
            return
        time.sleep(0.01)
    raise EvidraError("PARSER_CLEANUP_FAILED", "The owned worker did not exit.")


def _classify_signal(
    number: int, usage: Any, limits: ParserLimits, error_output: bytes, sampled_peak: int | None
) -> EvidraError:
    """Attribute a signal death to a limit only with positive evidence; never invent a cause."""
    cpu = usage.ru_utime + usage.ru_stime
    facts: dict[str, Any] = {
        "signal": number,
        "peak_rss_mib": sampled_peak,  # the child's own VmHWM, sampled; None if never readable
        "ru_maxrss_mib": round(
            usage.ru_maxrss / 1024
        ),  # includes the pre-exec parent address space
        "cpu_seconds": round(cpu, 2),
        "memory_limit_mib": limits.memory_bytes // _MIB,
        "cpu_limit_seconds": _cpu_seconds(limits),
        **child_diagnostic(error_output),
    }
    if number in (signal.SIGALRM, signal.SIGXCPU) or (
        number == signal.SIGKILL and cpu >= _cpu_seconds(limits) - 0.25
    ):
        return EvidraError(
            "PARSER_TIMEOUT",
            "The parser exceeded its configured time limit.",
            details={**facts, "evidence": "cpu_limit"},
        )
    if number == signal.SIGXFSZ:
        return EvidraError(
            "PARSER_OUTPUT_LIMIT",
            "The parser output exceeded its bounded channel.",
            details={**facts, "evidence": "file_size_limit"},
        )
    return EvidraError(
        "PARSER_FAILED",
        "The parser process was terminated by a signal.",
        details={**facts, "evidence": "none"},
    )


@contextmanager
def run_worker(
    source: BinaryIO,
    request: dict[str, Any],
    limits: ParserLimits,
    check: Callable[[], None],
    progress: Callable[[int], None],
) -> Iterator[BinaryIO]:
    """Run one bounded child; yield its spooled stdout only if it exited cleanly and in bounds."""
    process: subprocess.Popen[bytes] | None = None
    usage: Any = None
    sampled_peak: int | None = None
    started = time.monotonic()
    with (
        tempfile.TemporaryFile("w+b") as stdin,
        tempfile.TemporaryFile("w+b") as stdout,
        tempfile.TemporaryFile("w+b") as stderr,
    ):
        try:
            handle = source.fileno()
            stdin.write(
                json.dumps({**request, "handle": handle, "limits": limits.model_dump()}).encode()
            )
            stdin.seek(0)
            check()
            process = _spawn(
                _command(os.getpid()),
                stdin=stdin,
                stdout=stdout,
                stderr=stderr,
                pass_fds=(handle,),
                close_fds=True,
                start_new_session=True,
                env=_environment(),
            )
            while True:
                usage = _reap(process, block=False)
                if usage is not None:
                    break
                sample = _tree_hwm_mib(process.pid)
                if sample is not None:
                    sampled_peak = max(sample, sampled_peak or 0)
                check()
                if time.monotonic() - started > limits.timeout_seconds:
                    raise EvidraError(
                        "PARSER_TIMEOUT", "The parser exceeded its configured time limit."
                    )
                if _size(stdout) > limits.memory_bytes or _size(stderr) > _STDERR_LIMIT:
                    raise EvidraError(
                        "PARSER_OUTPUT_LIMIT", "The parser output exceeded its bounded channel."
                    )
                progress(_size(stdout))
                time.sleep(0.025)
            check()
            if _size(stdout) > limits.memory_bytes or _size(stderr) > _STDERR_LIMIT:
                raise EvidraError(
                    "PARSER_OUTPUT_LIMIT", "The parser output exceeded its bounded channel."
                )
            returncode = cast(int, process.returncode)
            stderr.seek(0)
            error_output = stderr.read(_STDERR_LIMIT + 1)
            if returncode < 0:
                raise _classify_signal(-returncode, usage, limits, error_output, sampled_peak)
            if returncode:
                details = child_diagnostic(error_output)
                causes = details.get("causes", [])
                codes = [cause["code"] for cause in causes]
                reason = next((code for code in codes if code in CHILD_CODES), "PARSER_FAILED")
                if reason == "PARSER_FAILED" and "PARSER_PARENT_GONE" in codes:
                    reason = "PARSER_PARENT_GONE"
                if any(cause["type"] == "MemoryError" for cause in causes):
                    reason = "PARSER_MEMORY_LIMIT"
                raise EvidraError(
                    reason,
                    "The parser process failed.",
                    details={"returncode": returncode, **details},
                )
            if error_output:
                raise EvidraError(
                    "PARSER_DIAGNOSTIC",
                    "The parser reported an unexpected diagnostic.",
                    details=child_diagnostic(error_output),
                )
            stdout.seek(0)
            yield cast(BinaryIO, stdout)
        except OSError as exc:
            raise EvidraError(
                "PARSER_PROCESS_ERROR",
                "The isolated worker could not be started.",
                details=diagnostic(exc),
            ) from exc
        finally:
            if process is not None:
                _terminate_group(process)
