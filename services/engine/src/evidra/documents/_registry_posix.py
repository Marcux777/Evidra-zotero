"""POSIX (Linux) file verification for registered attachments (ADR 0004).

Guarantees, each covered by `tests/test_registry_posix.py`:

* the path must be absolute, without `.`/`..` parts or NUL, and every component is checked with
  `lstat`: a symbolic link is refused (`REPARSE_POINT`) unless it is owned by root, which is how
  system layouts such as `/home -> /var/home` look and which an unprivileged user cannot plant;
* the final component must be a regular file with exactly one hard link (`NOT_REGULAR_FILE`,
  `LINKED_FILE`); FIFOs, devices and directories are refused without blocking;
* the file is opened component by component with `O_NOFOLLOW` relative to a directory descriptor,
  so a component swapped for a link after the path check fails instead of being followed; the
  descriptor is verified with `fstat` (type, `st_nlink`, `st_dev`, `st_ino`), and the kernel's own
  name for the open file (`/proc/self/fd/N`) must equal the canonical path, so a file deleted or
  moved afterwards is `DOCUMENT_STALE`;
* identity is `[st_dev, st_ino, st_size, st_mtime_ns]`, rechecked after reading.
"""

import json
import os
import stat
import sys
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import BinaryIO

if sys.platform == "win32":
    raise ImportError("evidra.documents._registry_posix requires a POSIX host")

from evidra.domain.errors import EvidraError

OPEN_ERRORS: tuple[type[BaseException], ...] = (OSError,)
_OPEN_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK


def _shape(path: Path) -> None:
    if not path.is_absolute() or "\0" in str(path):
        raise EvidraError("INVALID_DOCUMENT_PATH", "A local absolute file is required.")
    if any(part in {".", ".."} for part in path.parts[1:]):
        raise EvidraError("INVALID_DOCUMENT_PATH", "The attachment path is invalid.")


def _canonical(path: Path) -> Path:
    """Validate every component and return the path with root-owned symlinks resolved."""
    _shape(path)
    resolved = Path(path.anchor)
    for part in path.parts[1:]:
        candidate = resolved / part
        value = os.lstat(candidate)
        if stat.S_ISLNK(value.st_mode):
            if value.st_uid != 0:
                raise EvidraError(
                    "REPARSE_POINT", "Linked or redirected attachments are not permitted."
                )
            resolved = Path(os.path.realpath(candidate))
        else:
            resolved = candidate
    return resolved


def validate_components(path: Path) -> None:
    canonical = _canonical(path)
    value = os.stat(canonical, follow_symlinks=False)
    for parent in canonical.parents:
        if not stat.S_ISDIR(os.stat(parent, follow_symlinks=False).st_mode):
            raise EvidraError("INVALID_DOCUMENT_PATH", "An attachment parent is not a directory.")
    if not stat.S_ISREG(value.st_mode):
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular file.")
    if value.st_nlink != 1:
        raise EvidraError("LINKED_FILE", "Hard-linked attachments are not permitted.")


def file_identity(stream: BinaryIO, path: Path) -> str:
    value = os.fstat(stream.fileno())
    if not stat.S_ISREG(value.st_mode):
        raise EvidraError("NOT_REGULAR_FILE", "The attachment is not a regular disk file.")
    if value.st_nlink == 0:
        raise EvidraError("DOCUMENT_STALE", "The attachment was deleted while it was open.")
    if value.st_nlink != 1:
        raise EvidraError("LINKED_FILE", "The opened attachment has more than one hard link.")
    try:
        named = os.readlink(f"/proc/self/fd/{stream.fileno()}")
        expected = str(_canonical(path))
    except (OSError, EvidraError) as exc:
        raise EvidraError(
            "DOCUMENT_STALE", "The attachment path changed while opening it."
        ) from exc
    if named != expected:
        raise EvidraError("DOCUMENT_STALE", "The attachment path changed while opening it.")
    return json.dumps(
        [value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns], separators=(",", ":")
    )


def _open_nofollow(canonical: Path) -> int:
    """Open `canonical` one component at a time with `O_NOFOLLOW`, relative to a directory fd.

    A component swapped for a symbolic link between the path check and the open fails with ELOOP
    instead of being followed, and no path string is ever resolved by the kernel as a whole.
    """
    parts = canonical.parts
    directory = os.open(parts[0], os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        for part in parts[1:-1]:
            try:
                following = os.open(
                    part,
                    os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC,
                    dir_fd=directory,
                )
            except OSError:
                # O_DIRECTORY|O_NOFOLLOW reports a symbolic link as ENOTDIR; name it as what it is.
                try:
                    swapped = stat.S_ISLNK(os.lstat(part, dir_fd=directory).st_mode)
                except OSError:
                    swapped = False
                if swapped:
                    raise EvidraError(
                        "REPARSE_POINT", "Linked or redirected attachments are not permitted."
                    ) from None
                raise
            os.close(directory)
            directory = following
        return os.open(parts[-1], _OPEN_FLAGS, dir_fd=directory)
    finally:
        os.close(directory)


@contextmanager
def open_stream(path: Path) -> Iterator[BinaryIO]:
    with os.fdopen(_open_nofollow(_canonical(path)), "rb") as stream:
        yield stream


def classify_error(exc: BaseException) -> EvidraError:
    code = getattr(exc, "errno", None)
    if code in {2, 20}:  # ENOENT, ENOTDIR
        return EvidraError("MISSING_FILE", "The local attachment is missing.")
    if code == 40:  # ELOOP: the final component is a symbolic link (O_NOFOLLOW)
        return EvidraError("REPARSE_POINT", "Linked or redirected attachments are not permitted.")
    return EvidraError(
        "DOCUMENT_FILE_ERROR",
        "The attachment could not be opened safely.",
        details={"errno": code},
    )
