"""POSIX (Linux) implementation of the private-path primitives (ADR 0004).

Guarantees, each covered by `tests/test_handshake_posix.py`:

* private directories are exactly `0700` and private files exactly `0600`, owned by the effective
  user, with no extended POSIX ACL entries;
* paths are opened with `O_NOFOLLOW` and checked on the descriptor (`fstat`), so a symbolic link
  or a file swapped in after the path check is refused;
* ancestors above the Evidra data root (the first component named `Evidra`) may be reached
  through symbolic links owned by root or the current user (for example `~/.local/share`), but
  every component must be owned by root or the current user and sit in a directory that group and
  others cannot write (sticky directories such as `/tmp` excepted); from `Evidra/` downward no
  symbolic link is accepted, and the final component is never one;
* a regular file with more than one hard link is refused, on the path walk and again on the
  descriptor (`verify_descriptor`, tested without the path walk);
* refusals name the component and its depth, never the full path (`details`);
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

_ROOT_NAME = "Evidra"
_MAX_LINK_HOPS = 40
DIR_MODE = 0o700
FILE_MODE = 0o600
_RENAME_NOREPLACE = 1
_AT_FDCWD = -100
_ACL_ATTRIBUTES = frozenset({"system.posix_acl_access", "system.posix_acl_default"})
_OPEN_FLAGS = os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK


def check_path_shape(value: Path) -> None:
    if not value.is_absolute() or ".." in value.parts or "\0" in str(value):
        raise ValueError("An absolute local path without traversal is required")


def _refuse(
    reason: str, message: str, component: Path, depth: int, inside_root: bool
) -> EvidraError:
    # Only the component's own name and depth are reported, never the full private path.
    return EvidraError(
        "UNSAFE_PATH",
        message,
        details={
            "reason": reason,
            "component": component.name or "/",
            "depth": depth,
            "inside_evidra_root": inside_root,
        },
    )


def walk_path(path: Path) -> Path:
    """Verify each component and return the canonical path (symbolic links resolved).

    Above the Evidra data root (the first component named `Evidra`) a symbolic link is accepted
    when root or the current user owns it, and every component must be owned by root or the
    current user, inside a directory that group/other cannot write (a sticky directory such as
    `/tmp` is accepted). From `Evidra/` downward no symbolic link is accepted at all. The final
    component is never a symbolic link, and a regular final file has exactly one hard link.
    """
    if not path.is_absolute() or ".." in path.parts or "\0" in str(path):
        raise EvidraError("UNSAFE_PATH", "An absolute local path without traversal is required.")
    owner = os.geteuid()
    resolved = Path(path.anchor)
    pending = list(path.parts[1:])
    inside_root = False
    hops = depth = 0
    while pending:
        part = pending.pop(0)
        if part == ".":
            continue
        if part == "..":  # only reachable through a symbolic link target
            resolved = resolved.parent
            continue
        candidate = resolved / part
        depth += 1
        try:
            info = os.lstat(candidate)
        except FileNotFoundError:
            return resolved.joinpath(part, *pending)  # the rest does not exist yet
        if stat.S_ISLNK(info.st_mode):
            if not pending:
                raise _refuse(
                    "FINAL_COMPONENT_SYMLINK",
                    "The final component is a symbolic link.",
                    candidate,
                    depth,
                    inside_root,
                )
            if inside_root:
                raise _refuse(
                    "SYMLINK_INSIDE_EVIDRA_ROOT",
                    "Symbolic links are forbidden inside the Evidra data root.",
                    candidate,
                    depth,
                    True,
                )
            if part == _ROOT_NAME:
                raise _refuse(
                    "SYMLINK_AS_EVIDRA_ROOT",
                    "The Evidra data root must be a real directory.",
                    candidate,
                    depth,
                    False,
                )
            if info.st_uid not in (0, owner):
                raise _refuse(
                    "SYMLINK_FOREIGN_OWNER",
                    "A symbolic link owned by another user is forbidden.",
                    candidate,
                    depth,
                    False,
                )
            hops += 1
            if hops > _MAX_LINK_HOPS:
                raise _refuse(
                    "SYMLINK_LOOP", "Too many symbolic links.", candidate, depth, inside_root
                )
            target = Path(os.readlink(candidate))
            if target.is_absolute():
                resolved = Path(target.anchor)
                pending = list(target.parts[1:]) + pending
            else:
                pending = list(target.parts) + pending
            continue
        if info.st_uid not in (0, owner):
            raise _refuse(
                "FOREIGN_OWNER",
                "A path component is owned by another user.",
                candidate,
                depth,
                inside_root,
            )
        container = os.lstat(resolved)
        if container.st_mode & 0o022 and not container.st_mode & stat.S_ISVTX:
            raise _refuse(
                "WRITABLE_DIRECTORY",
                "A directory writable by group or others contains the path.",
                resolved,
                depth - 1,
                inside_root,
            )
        if not pending and stat.S_ISREG(info.st_mode) and info.st_nlink != 1:
            raise _refuse(
                "LINKED_FILE", "Linked files are forbidden.", candidate, depth, inside_root
            )
        if part == _ROOT_NAME and stat.S_ISDIR(info.st_mode):
            inside_root = True
        resolved = candidate
    return resolved


def assert_no_reparse_points(path: Path) -> None:
    walk_path(path)


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


def verify_descriptor(descriptor: int, operation: str = "validate_private_path") -> None:
    """The authoritative check, on the open descriptor: type, owner, exact mode, links, ACL."""
    info = os.fstat(descriptor)
    if info.st_uid != os.geteuid():
        raise _acl_error(operation, "UNEXPECTED_OWNER")
    if stat.S_ISDIR(info.st_mode):
        expected = DIR_MODE
    elif stat.S_ISREG(info.st_mode):
        expected = FILE_MODE
        if info.st_nlink != 1:
            raise _acl_error(operation, "LINKED_FILE")
    else:
        raise _acl_error(operation, "NOT_REGULAR_OR_DIRECTORY")
    if stat.S_IMODE(info.st_mode) != expected:
        raise _acl_error(operation, "NOT_PRIVATE_MODE")
    if _extended_acl(descriptor):
        raise _acl_error(operation, "EXTENDED_ACL")


def validate_private_path(path: Path) -> None:
    descriptor = _open_private(path, "validate_private_path")
    try:
        verify_descriptor(descriptor)
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
