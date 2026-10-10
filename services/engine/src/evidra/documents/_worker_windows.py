"""Windows worker isolation: Job Object limits, suspended start, handle inheritance list.

Moved verbatim from `parser_worker.py` by the platform-layer split (ADR 0004). Unsupported and
untested on Linux hosts; importing it elsewhere fails explicitly.
"""

import _winapi
import ctypes
import json
import msvcrt
import os
import subprocess
import sys
import tempfile
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from ctypes import wintypes
from typing import Any, BinaryIO, cast

import pywintypes  # type: ignore[import-untyped]
import win32file  # type: ignore[import-untyped]
import win32job  # type: ignore[import-untyped]
import win32process  # type: ignore[import-untyped]

from evidra.documents._worker_common import CHILD_CODES, child_diagnostic, diagnostic
from evidra.domain.documents import ParserLimits
from evidra.domain.errors import EvidraError

if sys.platform != "win32":
    raise ImportError("evidra.documents._worker_windows requires Windows")


class _JobMessages:
    """Observe kernel allocation denials even if PDFium returns an empty page afterward.

    pywin32 312 does not bind completion-port association. These two typed calls use the
    same documented Windows Job API; the completion value is a PID, not an OVERLAPPED.
    """

    def __init__(self, job: Any) -> None:
        self.port = win32file.CreateIoCompletionPort(-1, None, 0, 1)
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        associate = kernel.SetInformationJobObject
        associate.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
        associate.restype = wintypes.BOOL
        self.dequeue = kernel.GetQueuedCompletionStatus
        self.dequeue.argtypes = [
            wintypes.HANDLE,
            ctypes.POINTER(wintypes.DWORD),
            ctypes.POINTER(ctypes.c_size_t),
            ctypes.POINTER(ctypes.c_void_p),
            wintypes.DWORD,
        ]
        self.dequeue.restype = wintypes.BOOL
        association = (ctypes.c_void_p * 2)(1, int(self.port))
        if not associate(
            int(job),
            win32job.JobObjectAssociateCompletionPortInformation,
            association,
            ctypes.sizeof(association),
        ):
            self.port.Close()
            raise ctypes.WinError(ctypes.get_last_error())

    def check(self) -> None:
        message, key, process = wintypes.DWORD(), ctypes.c_size_t(), ctypes.c_void_p()
        while self.dequeue(
            int(self.port), ctypes.byref(message), ctypes.byref(key), ctypes.byref(process), 0
        ):
            if key.value != 1:
                raise EvidraError("PARSER_LIMIT_SETUP", "The worker notification key differs.")
            if message.value in {
                win32job.JOB_OBJECT_MSG_JOB_MEMORY_LIMIT,
                win32job.JOB_OBJECT_MSG_PROCESS_MEMORY_LIMIT,
            }:
                raise EvidraError(
                    "PARSER_MEMORY_LIMIT",
                    "The parser exceeded its memory limit.",
                    details={"job_message": message.value},
                )
        if ctypes.get_last_error() != 258:  # WAIT_TIMEOUT means the port was drained.
            raise ctypes.WinError(ctypes.get_last_error())

    def close(self) -> None:
        self.port.Close()


@contextmanager
def run_worker(
    source: BinaryIO,
    request: dict[str, Any],
    limits: ParserLimits,
    check: Callable[[], None],
    progress: Callable[[int], None],
) -> Iterator[BinaryIO]:
    """Assign a suspended child before resume; only four specified handles can be inherited.

    CPython 3.12's _winapi is the same launcher used by subprocess, but preserves the initial
    thread handle for ResumeThread. Its STARTUPINFOEX handle_list prevents blanket inheritance.
    Output is spooled instead of accumulated in the engine. Its declared bound is memory_bytes.
    """
    job = win32job.CreateJobObject(None, "")
    process: int | None = None
    thread: int | None = None
    inherited: list[int] = []
    messages: _JobMessages | None = None
    started = time.monotonic()
    with (
        tempfile.TemporaryFile("w+b") as stdin,
        tempfile.TemporaryFile("w+b") as stdout,
        tempfile.TemporaryFile("w+b") as stderr,
    ):
        try:
            info = win32job.QueryInformationJobObject(
                job, win32job.JobObjectExtendedLimitInformation
            )
            info["BasicLimitInformation"]["LimitFlags"] = (
                win32job.JOB_OBJECT_LIMIT_PROCESS_MEMORY
                | win32job.JOB_OBJECT_LIMIT_JOB_MEMORY
                | win32job.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
                | win32job.JOB_OBJECT_LIMIT_ACTIVE_PROCESS
            )
            info["BasicLimitInformation"]["ActiveProcessLimit"] = 1
            info["ProcessMemoryLimit"] = info["JobMemoryLimit"] = limits.memory_bytes
            win32job.SetInformationJobObject(job, win32job.JobObjectExtendedLimitInformation, info)
            applied = win32job.QueryInformationJobObject(
                job, win32job.JobObjectExtendedLimitInformation
            )
            if any(
                applied[k] != info[k]
                for k in ("ProcessMemoryLimit", "JobMemoryLimit", "BasicLimitInformation")
            ):
                raise EvidraError("PARSER_LIMIT_SETUP", "The worker limits could not be verified.")
            messages = _JobMessages(job)
            current = _winapi.GetCurrentProcess()
            for stream in (stdin, stdout, stderr, source):
                inherited.append(
                    _winapi.DuplicateHandle(
                        current,
                        msvcrt.get_osfhandle(stream.fileno()),
                        current,
                        0,
                        True,
                        _winapi.DUPLICATE_SAME_ACCESS,
                    )
                )
            stdin.write(
                json.dumps(
                    {**request, "handle": inherited[3], "limits": limits.model_dump()}
                ).encode("utf-8")
            )
            stdin.seek(0)
            startup = subprocess.STARTUPINFO(lpAttributeList={"handle_list": inherited})
            startup.dwFlags = subprocess.STARTF_USESTDHANDLES
            startup.hStdInput, startup.hStdOutput, startup.hStdError = inherited[:3]
            environment = dict(os.environ)
            executable = sys.executable
            if not getattr(sys, "frozen", False):
                # CPython's Windows venv executable is a redirector that spawns a second
                # process. Reproduce its documented 3.12 launcher environment directly so
                # the actual interpreter is the sole suspended process assigned to the job.
                executable = vars(sys)["_base_executable"]
                if not isinstance(executable, str) or not executable:
                    raise EvidraError(
                        "PARSER_RUNTIME_UNAVAILABLE", "The actual interpreter is unavailable."
                    )
                environment["__PYVENV_LAUNCHER__"] = sys.executable
            arguments = [executable]
            if not getattr(sys, "frozen", False):
                arguments.extend(["-m", "evidra"])
            arguments.append("--parser-worker")
            check()
            process, thread, _pid, _tid = _winapi.CreateProcess(
                executable,
                subprocess.list2cmdline(arguments),
                None,
                None,
                True,
                subprocess.CREATE_NO_WINDOW | win32process.CREATE_SUSPENDED,
                environment,
                None,
                startup,
            )
            # No program instruction has run and no document bytes have been read yet.
            win32job.AssignProcessToJobObject(job, process)
            if not win32job.IsProcessInJob(process, job):
                raise EvidraError("PARSER_LIMIT_SETUP", "The worker job could not be verified.")
            win32process.ResumeThread(thread)
            _winapi.CloseHandle(thread)
            thread = None
            for handle in inherited:
                _winapi.CloseHandle(handle)
            inherited.clear()
            while _winapi.WaitForSingleObject(process, 25) == _winapi.WAIT_TIMEOUT:
                check()
                messages.check()
                if time.monotonic() - started > limits.timeout_seconds:
                    raise EvidraError(
                        "PARSER_TIMEOUT", "The parser exceeded its configured time limit."
                    )
                if (
                    os.fstat(stdout.fileno()).st_size > limits.memory_bytes
                    or os.fstat(stderr.fileno()).st_size > 65536
                ):
                    raise EvidraError(
                        "PARSER_OUTPUT_LIMIT", "The parser output exceeded its bounded channel."
                    )
                progress(os.fstat(stdout.fileno()).st_size)
            check()
            messages.check()
            if (
                os.fstat(stdout.fileno()).st_size > limits.memory_bytes
                or os.fstat(stderr.fileno()).st_size > 65536
            ):
                raise EvidraError(
                    "PARSER_OUTPUT_LIMIT", "The parser output exceeded its bounded channel."
                )
            returncode = _winapi.GetExitCodeProcess(process)
            stderr.seek(0)
            error_output = stderr.read(65537)
            if returncode:
                details = child_diagnostic(error_output)
                causes = details.get("causes", [])
                codes = [cause["code"] for cause in causes]
                reason = next((code for code in codes if code in CHILD_CODES), "PARSER_FAILED")
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
        except (OSError, pywintypes.error) as exc:
            raise EvidraError(
                "PARSER_PROCESS_ERROR",
                "The isolated worker could not be started.",
                details=diagnostic(exc),
            ) from exc
        finally:
            # Closing the only job handle is the final kill-on-close guarantee, including errors.
            job.Close()
            if messages is not None:
                messages.close()
            if thread is not None:
                _winapi.CloseHandle(thread)
            for handle in inherited:
                _winapi.CloseHandle(handle)
            if process is not None:
                if _winapi.WaitForSingleObject(process, 5000) == _winapi.WAIT_TIMEOUT:
                    _winapi.TerminateProcess(process, 1)
                    if _winapi.WaitForSingleObject(process, 5000) == _winapi.WAIT_TIMEOUT:
                        _winapi.CloseHandle(process)
                        raise EvidraError("PARSER_CLEANUP_FAILED", "The owned worker did not exit.")
                _winapi.CloseHandle(process)


def open_worker_stream(handle: int) -> BinaryIO:
    """Adopt the inherited file handle that the engine duplicated into this process."""
    return os.fdopen(msvcrt.open_osfhandle(handle, os.O_RDONLY | os.O_BINARY), "rb")


def apply_child_limits(limits: ParserLimits, parent_pid: int | None = None) -> None:
    """Limits are enforced by the parent's Job Object; nothing to do in the child."""
