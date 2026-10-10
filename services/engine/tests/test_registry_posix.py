"""Linux verification of registered attachments: links, special files, swaps, identity."""

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any

import pytest

from evidra.domain.errors import EvidraError

pytestmark = pytest.mark.skipif(sys.platform == "win32", reason="POSIX file verification")


def make(tmp_path: Path, name: str = "paper.pdf", data: bytes = b"%PDF-1.4\nbody\n") -> Path:
    directory = tmp_path / "storage" / "ABCD1234"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / name
    path.write_bytes(data)
    return path


def code(failure: pytest.ExceptionInfo[EvidraError]) -> str:
    return failure.value.code


def test_open_verified_reads_the_file_and_binds_identity(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    with open_verified(path) as opened:
        info = path.stat()
        assert json.loads(opened.identity) == [
            info.st_dev,
            info.st_ino,
            info.st_size,
            info.st_mtime_ns,
        ]
        assert opened.size == info.st_size
        assert opened.stream.read(5) == b"%PDF-"
        digest = opened.digest(lambda: None)
        assert digest == hashlib.sha256(path.read_bytes()).hexdigest()
    with open_verified(path, expected=opened.identity):
        pass


def test_symlinked_final_component_and_directory_are_refused(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    real = make(tmp_path)
    final = tmp_path / "final-link.pdf"
    final.symlink_to(real)
    folder = tmp_path / "folder-link"
    folder.symlink_to(real.parent, target_is_directory=True)
    for candidate in (final, folder / real.name):
        with pytest.raises(EvidraError) as failure, open_verified(candidate):
            pass
        assert code(failure) == "REPARSE_POINT"


def test_hard_linked_attachment_is_refused(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    os.link(path, tmp_path / "alias.pdf")
    with pytest.raises(EvidraError) as failure, open_verified(path):
        pass
    assert code(failure) == "LINKED_FILE"


def test_descriptor_identity_refuses_hard_link_without_the_path_check(tmp_path: Path) -> None:
    """The fstat barrier on its own: the path walk is not involved."""
    from evidra.documents._registry_posix import file_identity

    path = make(tmp_path)
    os.link(path, tmp_path / "alias.pdf")
    with path.open("rb") as stream, pytest.raises(EvidraError) as failure:
        file_identity(stream, path)
    assert code(failure) == "LINKED_FILE"


def test_descriptor_identity_refuses_non_regular_without_the_path_check(tmp_path: Path) -> None:
    from evidra.documents._registry_posix import file_identity

    with open("/dev/null", "rb") as stream, pytest.raises(EvidraError) as failure:
        file_identity(stream, Path("/dev/null"))
    assert code(failure) == "NOT_REGULAR_FILE"


def test_fifo_directory_and_device_are_not_regular_files(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    fifo = tmp_path / "pipe.pdf"
    os.mkfifo(fifo)
    for special in (fifo, tmp_path, Path("/dev/null")):
        with pytest.raises(EvidraError) as failure, open_verified(special):
            pass
        assert code(failure) == "NOT_REGULAR_FILE"


def test_missing_file_and_missing_parent_are_missing(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    file = make(tmp_path)
    for target in (tmp_path / "absent.pdf", tmp_path / "no-dir" / "x.pdf", file / "child"):
        with pytest.raises(EvidraError) as failure, open_verified(target):
            pass
        assert code(failure) == "MISSING_FILE"


@pytest.mark.parametrize("raw", ["relative/file.pdf", "/tmp/a/../b.pdf"])
def test_non_absolute_or_dotted_paths_are_invalid(raw: str) -> None:
    from evidra.documents.registry import open_verified

    with pytest.raises(EvidraError) as failure, open_verified(Path(raw)):
        pass
    assert code(failure) == "INVALID_DOCUMENT_PATH"


def test_registered_file_replaced_before_open_is_stale(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    with open_verified(path) as opened:
        identity = opened.identity
    replacement = tmp_path / "replacement"
    replacement.write_bytes(b"%PDF-1.4\nother\n")
    os.replace(replacement, path)
    with pytest.raises(EvidraError) as failure, open_verified(path, expected=identity):
        pass
    assert code(failure) == "DOCUMENT_STALE"


def test_file_changed_while_open_is_stale_on_exit(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    with pytest.raises(EvidraError) as failure, open_verified(path) as opened:
        opened.stream.read(5)
        with path.open("ab") as writer:
            writer.write(b"appended after registration")
    assert code(failure) == "DOCUMENT_STALE"


def test_file_deleted_while_open_is_reported(tmp_path: Path) -> None:
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    with pytest.raises(EvidraError) as failure, open_verified(path):
        path.unlink()
    assert code(failure) in {"MISSING_FILE", "DOCUMENT_STALE"}


def test_directory_swapped_for_a_symlink_after_the_check_is_not_followed(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The kernel must not resolve a swapped component: O_NOFOLLOW per component (ELOOP)."""
    from evidra.documents import registry

    path = make(tmp_path)
    decoy_dir = tmp_path / "decoy"
    decoy_dir.mkdir()
    (decoy_dir / path.name).write_bytes(b"%PDF-1.4\nDECOY\n")
    original = registry.validate_components

    def validate_then_swap(candidate: Path) -> None:
        original(candidate)
        stash = path.parent.with_name("stash")
        os.rename(path.parent, stash)
        os.symlink(decoy_dir, path.parent, target_is_directory=True)

    monkeypatch.setattr(registry, "validate_components", validate_then_swap)
    with pytest.raises(EvidraError) as failure, registry.open_verified(path) as opened:
        opened.stream.read()
    assert code(failure) in {"REPARSE_POINT", "DOCUMENT_STALE"}


def test_root_owned_symlink_component_is_accepted(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Layouts such as /home -> /var/home are root-owned links a user cannot plant."""
    from evidra.documents import _registry_posix as platform
    from evidra.documents.registry import open_verified

    path = make(tmp_path)
    link = tmp_path / "home-like"
    link.symlink_to(tmp_path / "storage", target_is_directory=True)
    real_lstat = os.lstat

    def as_root(candidate: Any, *args: Any, **kwargs: Any) -> os.stat_result:
        info = real_lstat(candidate, *args, **kwargs)
        if str(candidate) == str(link):
            return os.stat_result([*list(info)[:4], 0, *list(info)[5:]])
        return info

    monkeypatch.setattr(platform.os, "lstat", as_root)
    with open_verified(link / "ABCD1234" / path.name) as opened:
        assert opened.stream.read(5) == b"%PDF-"
    with pytest.raises(EvidraError):  # the same link owned by the user is refused
        monkeypatch.undo()
        with open_verified(link / "ABCD1234" / path.name):
            pass


# --- each barrier on its own (the layers are redundant by design) ------------------------------
def test_path_check_alone_refuses_hard_link(tmp_path: Path) -> None:
    from evidra.documents._registry_posix import validate_components

    path = make(tmp_path)
    os.link(path, tmp_path / "alias.pdf")
    with pytest.raises(EvidraError) as failure:
        validate_components(path)
    assert code(failure) == "LINKED_FILE"


def test_descriptor_check_alone_detects_a_moved_file(tmp_path: Path) -> None:
    """The descriptor's kernel name must equal the path even when the inode is still linked."""
    from evidra.documents._registry_posix import file_identity

    path = make(tmp_path)
    with path.open("rb") as stream:
        os.rename(path, tmp_path / "moved.pdf")  # same inode, nlink still 1, different name
        path.write_bytes(b"%PDF-1.4\nanother file at the old name\n")
        with pytest.raises(EvidraError) as failure:
            file_identity(stream, path)
    assert code(failure) == "DOCUMENT_STALE"


def test_descriptor_check_alone_reports_a_deleted_file_as_stale(tmp_path: Path) -> None:
    from evidra.documents._registry_posix import file_identity

    path = make(tmp_path)
    with path.open("rb") as stream:
        path.unlink()
        with pytest.raises(EvidraError) as failure:
            file_identity(stream, path)
    assert code(failure) == "DOCUMENT_STALE"


def test_component_walk_alone_refuses_a_symlinked_directory(tmp_path: Path) -> None:
    """O_NOFOLLOW per component, with no earlier path check: ELOOP, never followed."""
    from evidra.documents._registry_posix import _open_nofollow

    real = make(tmp_path)
    link = tmp_path / "link"
    link.symlink_to(real.parent, target_is_directory=True)
    with pytest.raises(EvidraError) as swapped:
        _open_nofollow(link / real.name)
    assert code(swapped) == "REPARSE_POINT"  # not MISSING_FILE, which is what ENOTDIR implies
    final = tmp_path / "final.pdf"
    final.symlink_to(real)
    with pytest.raises(OSError) as final_failure:
        _open_nofollow(final)
    assert final_failure.value.errno == 40
    descriptor = _open_nofollow(real)
    os.close(descriptor)


def test_component_walk_alone_never_blocks_on_a_fifo(tmp_path: Path) -> None:
    import threading

    from evidra.documents._registry_posix import _open_nofollow

    fifo = tmp_path / "pipe.pdf"
    os.mkfifo(fifo)
    opened: list[int] = []
    worker = threading.Thread(target=lambda: opened.append(_open_nofollow(fifo)), daemon=True)
    worker.start()
    worker.join(3)
    blocked = worker.is_alive()
    if blocked:  # release the blocked open so the thread can end before failing
        os.close(os.open(fifo, os.O_RDWR | os.O_NONBLOCK))
        worker.join(3)
    for descriptor in opened:
        os.close(descriptor)
    assert not blocked, "opening a FIFO without a writer blocked"
