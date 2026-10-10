"""Windows file verification for registered attachments (reparse points, handle identity).

Moved verbatim from `registry.py` by the platform-layer split (ADR 0004). Unsupported and
untested on Linux hosts; importing it elsewhere fails explicitly.
"""

import json
import msvcrt
import os
import stat
import sys
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import BinaryIO

import pywintypes  # type: ignore[import-untyped]
import win32con  # type: ignore[import-untyped]
import win32file  # type: ignore[import-untyped]

from evidra.domain.errors import EvidraError

if sys.platform != "win32":
    raise ImportError("evidra.documents._registry_windows requires Windows")

OPEN_ERRORS: tuple[type[BaseException], ...] = (OSError, pywintypes.error)


def validate_components(path: Path) -> None:
    # No alternate streams, device namespace, network path or relative path resolution.
    if not path.is_absolute() or len(path.drive) != 2 or path.drive[1] != ":":
        raise EvidraError("INVALID_DOCUMENT_PATH", "A local absolute file is required.")
    if any(":" in p or p in {".", ".."} for p in path.parts[1:]):
        raise EvidraError("INVALID_DOCUMENT_PATH", "The attachment path is invalid.")
    for component in [*reversed(path.parents), path]:
        value = component.lstat()
        if value.st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
            raise EvidraError(
                "REPARSE_POINT", "Linked or redirected attachments are not permitted."
            )
        if component != path and not stat.S_ISDIR(value.st_mode):
            raise EvidraError("INVALID_DOCUMENT_PATH", "An attachment parent is not a directory.")
    if not stat.S_ISREG(value.st_mode):
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular file.")


def file_identity(stream: BinaryIO, path: Path) -> str:
    handle = msvcrt.get_osfhandle(stream.fileno())
    if win32file.GetFileType(handle) != win32file.FILE_TYPE_DISK:
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular disk file.")
    info = win32file.GetFileInformationByHandle(handle)
    if info[0] & stat.FILE_ATTRIBUTE_REPARSE_POINT:
        raise EvidraError("REPARSE_POINT", "The opened attachment is redirected.")
    final = win32file.GetFinalPathNameByHandle(handle, 0)
    if not final.startswith("\\\\?\\") or os.path.normcase(final[4:]) != os.path.normcase(
        str(path)
    ):
        raise EvidraError("DOCUMENT_STALE", "The attachment path changed while opening it.")
    value = os.fstat(stream.fileno())
    return json.dumps(
        [info[4], info[8], info[9], value.st_size, value.st_mtime_ns], separators=(",", ":")
    )


@contextmanager
def open_stream(path: Path) -> Iterator[BinaryIO]:
    """Open without following a final reparse point and without allowing concurrent writers."""
    handle = win32file.CreateFile(
        str(path),
        win32con.GENERIC_READ,
        win32con.FILE_SHARE_READ,
        None,
        win32con.OPEN_EXISTING,
        win32file.FILE_FLAG_OPEN_REPARSE_POINT | win32con.FILE_FLAG_SEQUENTIAL_SCAN,
        None,
    )
    try:
        fd = msvcrt.open_osfhandle(int(handle), os.O_RDONLY | os.O_BINARY)
    except BaseException:
        handle.Close()
        raise
    handle.Detach()  # The CRT file descriptor now owns this exact handle.
    with os.fdopen(fd, "rb") as stream:
        yield stream


def classify_error(exc: BaseException) -> EvidraError:
    if getattr(exc, "winerror", None) in {2, 3}:
        return EvidraError("MISSING_FILE", "The local attachment is missing.")
    return EvidraError(
        "DOCUMENT_FILE_ERROR",
        "The attachment could not be opened safely.",
        details={"winerror": getattr(exc, "winerror", None)},
    )
