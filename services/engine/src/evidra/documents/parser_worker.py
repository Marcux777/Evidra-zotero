"""One bounded Windows PDFium worker; PDFium is imported only in the child process."""

import _winapi
import base64
import ctypes
import hashlib
import io
import json
import math
import msvcrt
import os
import subprocess
import sys
import tempfile
import time
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from ctypes import wintypes
from typing import Any, BinaryIO, Literal, cast

import pywintypes  # type: ignore[import-untyped]
import win32file  # type: ignore[import-untyped]
import win32job  # type: ignore[import-untyped]
import win32process  # type: ignore[import-untyped]

from evidra.domain.documents import (
    PagePreview,
    PagePreviewRequest,
    ParsedPage,
    ParserLimits,
    Rectangle,
)
from evidra.domain.errors import EvidraError

PARSER_VERSION = "pypdfium2-5.13.0/pdfium-153.0.7999.0/evidra-1"
CHILD_CODES = {
    "INCOMPLETE_TEXT",
    "TEXT_LIMIT",
    "TEXT_ENCODING_ERROR",
    "INVALID_TEXT_DOCUMENT",
    "UNSUPPORTED_TEXT_FORMAT",
    "PAGE_LIMIT",
    "INVALID_PAGE",
    "INVALID_REGION",
    "PREVIEW_PIXEL_LIMIT",
    "PREVIEW_TRANSPORT_LIMIT",
    "FILE_LIMIT",
    "PARSER_VERSION_MISMATCH",
    "EVIDENCE_INVARIANT",
    "INVALID_TEXT_OFFSET",
    "INVALID_ORIGINAL_UNIT",
}


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


def diagnostic(error: BaseException) -> dict[str, Any]:
    causes: list[dict[str, str | int | None]] = []
    seen: set[int] = set()
    current: BaseException | None = error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        causes.append(
            {
                "type": type(current).__name__,
                "code": current.code if isinstance(current, EvidraError) else None,
                "errno": getattr(current, "errno", None),
                "winerror": getattr(current, "winerror", None),
                "pdfium_error": getattr(current, "err_code", None),
            }
        )
        current = current.__cause__ or (
            current.__context__ if not current.__suppress_context__ else None
        )
    return {"causes": causes}


def child_diagnostic(output: bytes) -> dict[str, Any]:
    """Only the structured causal protocol reaches logs; unexpected stderr is hashed."""
    try:
        value = json.loads(output)
    except (ValueError, UnicodeDecodeError):
        return {"stderr_bytes": len(output), "stderr_sha256": hashlib.sha256(output).hexdigest()}
    causes = value.get("causes") if isinstance(value, dict) else None
    allowed = {"type", "code", "errno", "winerror", "pdfium_error"}
    if (
        not isinstance(causes, list)
        or len(causes) > 32
        or any(
            not isinstance(cause, dict)
            or set(cause) != allowed
            or any(
                v is not None
                and not isinstance(v, int)
                and (not isinstance(v, str) or not v.isidentifier() or len(v) > 80)
                for v in cause.values()
            )
            for cause in causes
        )
    ):
        return {"stderr_bytes": len(output), "stderr_sha256": hashlib.sha256(output).hexdigest()}
    return {"causes": causes}


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


def _page(pdf: Any, index: int) -> ParsedPage:
    import pypdfium2.raw as raw  # type: ignore[import-untyped]

    page, textpage = None, None
    try:
        label_size = raw.FPDF_GetPageLabel(pdf, index, None, 0)
        label = pdf.get_page_label(index) if label_size else None
        page = pdf[index]
        textpage = page.get_textpage()
        count = textpage.count_chars()
        original = textpage.get_text_bounded(errors="strict")
        mapping = len(original) == count
        boxes: list[Rectangle | None] = []
        unicode_errors = False
        for position in range(count):
            issue = raw.FPDFText_HasUnicodeMapError(textpage, position)
            generated = raw.FPDFText_IsGenerated(textpage, position)
            if issue == -1 or generated == -1:
                raise EvidraError("TEXT_MAPPING_ERROR", "Character mapping could not be inspected.")
            unicode_errors |= bool(issue)
            if not mapping:
                continue
            character = original[position]
            if (
                issue
                or raw.FPDFText_GetUnicode(textpage, position) != ord(character)
                or raw.FPDFText_GetTextIndexFromCharIndex(textpage, position) != position
                or raw.FPDFText_GetCharIndexFromTextIndex(textpage, position) != position
                or generated
                and not character.isspace()
            ):
                mapping = False
                continue
            if character.isspace():
                boxes.append(None)
                continue
            box = textpage.get_charbox(position)
            if not all(math.isfinite(v) for v in box) or box[0] >= box[2] or box[1] >= box[3]:
                mapping = False
                continue
            boxes.append(box)
        quality: Literal["TEXT", "EMPTY", "UNMAPPABLE", "ERROR"]
        if unicode_errors:
            quality, reason = "UNMAPPABLE", "UNICODE_MAP_ERROR"
        elif not original.strip():
            quality, reason = "EMPTY", "NO_EXTRACTABLE_TEXT"
        else:
            quality, reason = "TEXT", None
        return ParsedPage(
            page_index=index,
            page_label=label,
            original_text=original,
            quality=quality,
            diagnostic=reason,
            crop_box=page.get_cropbox(fallback_ok=False),
            media_box=page.get_mediabox(fallback_ok=False),
            bbox=page.get_bbox(),
            rotation=page.get_rotation(),
            char_boxes=boxes if mapping else [],
            mapping_verified=mapping and not unicode_errors,
        )
    except MemoryError:
        raise
    except Exception as exc:
        return ParsedPage(
            page_index=index,
            page_label=None,
            original_text="",
            quality="ERROR",
            diagnostic=json.dumps(diagnostic(exc), separators=(",", ":")),
            crop_box=None,
            media_box=None,
            bbox=None,
            rotation=None,
            char_boxes=[],
            mapping_verified=False,
        )
    finally:
        if textpage is not None:
            textpage.close()
        if page is not None:
            page.close()


def _preview(pdf: Any, request: dict[str, Any], limits: ParserLimits) -> PagePreview:
    body = PagePreviewRequest.model_validate(request["preview"])
    if body.page_index >= len(pdf):
        raise EvidraError("INVALID_PAGE", "The selected physical page does not exist.")
    page = pdf[body.page_index]
    bitmap = None
    try:
        bounds = page.get_bbox()
        region = body.region or bounds
        if not (
            bounds[0] <= region[0] < region[2] <= bounds[2]
            and bounds[1] <= region[1] < region[3] <= bounds[3]
        ):
            raise EvidraError("INVALID_REGION", "The selected region is outside the visible page.")
        width, height = (
            math.ceil(page.get_width() * body.scale),
            math.ceil(page.get_height() * body.scale),
        )
        if width * height > min(16_000_000, limits.memory_bytes // 16):
            raise EvidraError(
                "PREVIEW_PIXEL_LIMIT", "Reduce the scale of the selected page preview."
            )
        bitmap = page.render(scale=body.scale, may_draw_forms=False, draw_annots=False)
        converter = bitmap.get_posconv(page)
        points = [
            converter.to_bitmap(x, y)
            for x in (region[0], region[2])
            for y in (region[1], region[3])
        ]
        crop = (
            min(p[0] for p in points),
            min(p[1] for p in points),
            max(p[0] for p in points),
            max(p[1] for p in points),
        )
        with bitmap.to_pil() as full:
            with full.crop(crop) as selected, io.BytesIO() as output:
                selected.save(output, format="PNG")
                png = output.getvalue()
                if len(png) > 600_000:
                    raise EvidraError(
                        "PREVIEW_TRANSPORT_LIMIT",
                        "Reduce the preview region or scale to fit the display channel.",
                    )
                return PagePreview(
                    document_version_id=body.document_version_id,
                    page_index=body.page_index,
                    region=region,
                    width=selected.width,
                    height=selected.height,
                    sha256=hashlib.sha256(png).hexdigest(),
                    data_base64=base64.b64encode(png).decode("ascii"),
                )
    finally:
        if bitmap is not None:
            bitmap.close()
        page.close()


def worker_main() -> None:
    """Private stdin protocol; no socket, shell, document actions or host database access."""
    try:
        request = json.loads(sys.stdin.buffer.read(65537))
        limits = ParserLimits.model_validate(request["limits"])
        fd = msvcrt.open_osfhandle(request["handle"], os.O_RDONLY | os.O_BINARY)
        with os.fdopen(fd, "rb") as stream:
            size = os.fstat(fd).st_size
            if size > limits.max_file_bytes:
                raise EvidraError("FILE_LIMIT", "The file exceeds its configured byte limit.")
            if request.get("source_kind") == "text_attachment":
                from evidra.documents.text_parser import TEXT_FILE_PARSER_VERSION, parse_text

                if request["kind"] == "original_view":
                    from evidra.documents.original_parser import original_content

                    result = original_content(
                        stream,
                        request["media_type"],
                        limits,
                        start=request["start"],
                        end=request["end"],
                        unit_index=request["unit_index"],
                        representation=request["representation"],
                        offset=request["offset"],
                    )
                    # The inherited Windows stdout encoding is not necessarily UTF-8.
                    print(json.dumps(result.model_dump(), ensure_ascii=True))
                    return
                if request["kind"] != "ingest":
                    raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "Text files have no PDF preview.")
                page = parse_text(stream, request["media_type"], limits)
                print(
                    json.dumps(
                        {
                            "type": "header",
                            "page_count": 1,
                            "parser_version": TEXT_FILE_PARSER_VERSION,
                        }
                    )
                )
                print(json.dumps({"type": "page", "page": page.model_dump()}, ensure_ascii=True))
                print(json.dumps({"type": "done", "page_count": 1}))
                return
            import pypdfium2 as pdfium

            if str(pdfium.PDFIUM_INFO) != "153.0.7999.0":
                raise EvidraError("PARSER_VERSION_MISMATCH", "The bundled PDFium version differs.")
            with pdfium.PdfDocument(stream) as pdf:
                count = len(pdf)
                if count > limits.max_pages:
                    print(
                        json.dumps({"type": "limit", "reason": "PAGE_LIMIT", "page_count": count})
                    )
                    return
                if request["kind"] == "preview":
                    print(_preview(pdf, request, limits).model_dump_json())
                    return
                print(
                    json.dumps(
                        {"type": "header", "page_count": count, "parser_version": PARSER_VERSION}
                    )
                )
                for index in range(count):
                    print(
                        json.dumps(
                            {"type": "page", "page": _page(pdf, index).model_dump()},
                            ensure_ascii=True,
                        )
                    )
                    sys.stdout.flush()
                print(json.dumps({"type": "done", "page_count": count}))
    except BaseException as exc:
        print(json.dumps(diagnostic(exc), separators=(",", ":")), file=sys.stderr)
        raise SystemExit(1) from None
