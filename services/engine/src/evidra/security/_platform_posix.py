"""POSIX (Linux) implementation of the private-path primitives (ADR 0004).

Guarantees, each covered by `tests/test_handshake_posix.py`:

* private directories are exactly `0700` and private files exactly `0600`, owned by the effective
  user, with no extended POSIX ACL entries;
* paths are opened with `O_NOFOLLOW` and checked on the descriptor (`fstat`), so a symbolic link
  or a file swapped in after the path check is refused;
* a symbolic link anywhere in the path is refused, except one owned by root (system layouts such
  as `/home -> /var/home`), which an unprivileged user cannot plant;
* a regular file with more than one hard link is refused;
* new private files are created with `O_CREAT | O_EXCL | O_NOFOLLOW` and mode `0600`, then forced
  to `0600` with `fchmod` so a restrictive umask or an inherited default cannot widen them;
* publication and claim use `renameat2(RENAME_NOREPLACE)`: an existing destination is never
  replaced, and there is no check-then-rename window. Where the kernel or filesystem lacks it,
  the call fails with an explicit error; there is no fallback to a plain rename.
"""

import ctypes
import errno
import os
import stat
import sys
from pathlib import Path
from typing import TextIO

if sys.platform == "win32":
    raise ImportError("evidra.security._platform_posix requires a POSIX host")

from evidra.domain.errors import EvidraError

DIR_MODE = 0o700
FILE_MODE = 0o600
_RENAME_NOREPLACE = 1
_AT_FDCWD = -100
_ACL_ATTRIBUTES = frozenset({"system.posix_acl_access", "system.posix_acl_default"})
_OPEN_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK


def check_path_shape(value: Path) -> None:
    if not value.is_absolute() or ".." in value.parts or "\0" in str(value):
        raise ValueError("An absolute local path without traversal is required")


def assert_no_reparse_points(path: Path) -> None:
    """Refuse traversal, symbolic links not owned by root, and multiply linked regular files."""
    if not path.is_absolute() or ".." in path.parts or "\0" in str(path):
        raise EvidraError("UNSAFE_PATH", "An absolute local path without traversal is required.")
    for component in [*reversed(path.parents), path]:
        try:
            info = os.lstat(component)
        except FileNotFoundError:
            continue
        if stat.S_ISLNK(info.st_mode) and info.st_uid != 0:
            raise EvidraError("UNSAFE_PATH", "Symbolic links are forbidden.")
        if component == path and stat.S_ISREG(info.st_mode) and info.st_nlink != 1:
            raise EvidraError("UNSAFE_PATH", "Linked files are forbidden.")


def _acl_error(operation: str, reason: str) -> EvidraError:
    return EvidraError(
        "ACL_ERROR",
        "Private path verification failed.",
        details={"operation": operation, "reason": reason},
    )


def _extended_acl(descriptor: int) -> bool:
    try:
        names = os.listxattr(descriptor)
    except OSError as exc:
        if exc.errno in (errno.ENOTSUP, errno.ENODATA, errno.ENOSYS):
            return False  # the filesystem has no extended attributes, hence no ACL entries
        raise
    return not _ACL_ATTRIBUTES.isdisjoint(names)


def _open_private(path: Path, operation: str) -> int:
    assert_no_reparse_points(path)
    try:
        return os.open(path, _OPEN_FLAGS)
    except OSError as exc:  # ELOOP: final component is a symlink; ENOENT; EACCES
        raise _acl_error(operation, "CANNOT_OPEN") from exc


def validate_private_path(path: Path) -> None:
    descriptor = _open_private(path, "validate_private_path")
    try:
        info = os.fstat(descriptor)
        if info.st_uid != os.geteuid():
            raise _acl_error("validate_private_path", "UNEXPECTED_OWNER")
        if stat.S_ISDIR(info.st_mode):
            expected = DIR_MODE
        elif stat.S_ISREG(info.st_mode):
            expected = FILE_MODE
            if info.st_nlink != 1:
                raise _acl_error("validate_private_path", "LINKED_FILE")
        else:
            raise _acl_error("validate_private_path", "NOT_REGULAR_OR_DIRECTORY")
        if stat.S_IMODE(info.st_mode) != expected:
            raise _acl_error("validate_private_path", "NOT_PRIVATE_MODE")
        if _extended_acl(descriptor):
            raise _acl_error("validate_private_path", "EXTENDED_ACL")
    finally:
        os.close(descriptor)


def protect_path(path: Path) -> None:
    """Restrict an existing directory to 0700 or file to 0600, then verify; owner must match."""
    descriptor = _open_private(path, "protect_path")
    try:
        info = os.fstat(descriptor)
        if info.st_uid != os.geteuid():
            raise _acl_error("protect_path", "UNEXPECTED_OWNER")
        if stat.S_ISDIR(info.st_mode):
            os.fchmod(descriptor, DIR_MODE)
        elif stat.S_ISREG(info.st_mode) and info.st_nlink == 1:
            os.fchmod(descriptor, FILE_MODE)
        else:
            raise _acl_error("protect_path", "NOT_REGULAR_OR_DIRECTORY")
    finally:
        os.close(descriptor)
    validate_private_path(path)


def create_private_file(path: Path) -> TextIO:
    """Create a new 0600 file for writing; fails if the name exists or is a symbolic link."""
    descriptor = os.open(
        path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, FILE_MODE
    )
    try:
        os.fchmod(descriptor, FILE_MODE)
        return os.fdopen(descriptor, "w", encoding="utf-8")
    except BaseException:
        os.close(descriptor)
        raise


def _renameat2() -> "ctypes._NamedFuncPointer":
    library = ctypes.CDLL(None, use_errno=True)
    try:
        return library.renameat2
    except AttributeError as exc:
        raise EvidraError(
            "UNSUPPORTED_PLATFORM", "renameat2 with RENAME_NOREPLACE is required."
        ) from exc


def rename_noreplace(source: Path, destination: Path) -> None:
    """Atomically rename without replacing; raises FileExistsError if the destination exists."""
    result = _renameat2()(
        _AT_FDCWD, os.fsencode(source), _AT_FDCWD, os.fsencode(destination), _RENAME_NOREPLACE
    )
    if result != 0:
        code = ctypes.get_errno()
        if code in (errno.EINVAL, errno.ENOSYS):
            raise EvidraError(
                "UNSUPPORTED_PLATFORM",
                "The filesystem or kernel does not support RENAME_NOREPLACE.",
                details={"errno": code},
            )
        raise OSError(code, os.strerror(code), str(destination))
