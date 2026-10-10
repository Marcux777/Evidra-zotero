"""Linux guarantees of the private session directory, handshake claim and receipt (ADR 0004)."""

import errno
import json
import os
import shutil
import stat
import subprocess
import sys
from pathlib import Path

import pytest

from evidra.domain.errors import EvidraError

pytestmark = pytest.mark.skipif(sys.platform == "win32", reason="POSIX guarantees")

TOKEN = "ab" * 32


def private_dir(parent: Path, name: str = "session") -> Path:
    from evidra.security.handshake import protect_path

    directory = parent / name
    directory.mkdir()
    protect_path(directory)
    return directory


def private_file(path: Path, text: str = "{}") -> Path:
    from evidra.security.handshake import create_private_file

    with create_private_file(path) as stream:
        stream.write(text)
    return path


def handshake_body(directory: Path, **override: object) -> dict[str, object]:
    return {
        "protocol_version": 1,
        "profile_instance_id": "profile-a",
        "session_token": TOKEN,
        "data_dir": str(directory.parent / "data"),
        "port": 0,
        "connection_path": str(directory / "connection.json"),
    } | override


def reason(failure: pytest.ExceptionInfo[EvidraError]) -> str | None:
    details = failure.value.details
    return details.get("reason") if details else None


# --- 0700 / 0600 -----------------------------------------------------------------------------
def test_protect_path_sets_exact_private_modes(tmp_path: Path) -> None:
    from evidra.security.handshake import protect_path, validate_private_path

    directory = tmp_path / "session"
    directory.mkdir(mode=0o755)
    os.chmod(directory, 0o755)
    protect_path(directory)
    assert stat.S_IMODE(directory.stat().st_mode) == 0o700
    file = directory / "f"
    file.write_text("x")
    os.chmod(file, 0o666)
    protect_path(file)
    assert stat.S_IMODE(file.stat().st_mode) == 0o600
    validate_private_path(directory)
    validate_private_path(file)


@pytest.mark.parametrize("mode", [0o755, 0o750, 0o770, 0o701, 0o500])
def test_directory_must_be_exactly_0700(tmp_path: Path, mode: int) -> None:
    from evidra.security.handshake import validate_private_path

    directory = tmp_path / "d"
    directory.mkdir()
    os.chmod(directory, mode)
    with pytest.raises(EvidraError) as failure:
        validate_private_path(directory)
    assert reason(failure) == "NOT_PRIVATE_MODE"
    os.chmod(directory, 0o700)  # let pytest clean up


@pytest.mark.parametrize("mode", [0o644, 0o640, 0o666, 0o700, 0o400, 0o601])
def test_file_must_be_exactly_0600(tmp_path: Path, mode: int) -> None:
    from evidra.security.handshake import validate_private_path

    file = tmp_path / "f"
    file.write_text("x")
    os.chmod(file, mode)
    with pytest.raises(EvidraError) as failure:
        validate_private_path(file)
    assert reason(failure) == "NOT_PRIVATE_MODE"


# --- owner -----------------------------------------------------------------------------------
def test_foreign_owner_is_refused(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from evidra.security.handshake import protect_path, validate_private_path

    directory = private_dir(tmp_path)
    file = private_file(directory / "f")
    monkeypatch.setattr(os, "geteuid", lambda: os.stat(file).st_uid + 1)
    with pytest.raises(EvidraError) as validated:
        validate_private_path(file)
    assert reason(validated) == "UNEXPECTED_OWNER"
    with pytest.raises(EvidraError) as protected:
        protect_path(directory)
    assert reason(protected) == "UNEXPECTED_OWNER"


# --- symbolic links, hard links, special files -----------------------------------------------
def test_symlink_final_and_intermediate_are_refused(tmp_path: Path) -> None:
    from evidra.security.handshake import assert_no_reparse_points, validate_private_path

    real = private_dir(tmp_path, "real")
    file = private_file(real / "f")
    final_link = tmp_path / "final-link"
    final_link.symlink_to(file)
    dir_link = tmp_path / "dir-link"
    dir_link.symlink_to(real, target_is_directory=True)
    for candidate in (final_link, dir_link / "f", dir_link):
        with pytest.raises(EvidraError) as failure:
            assert_no_reparse_points(candidate)
        assert failure.value.code == "UNSAFE_PATH"
        with pytest.raises(EvidraError):
            validate_private_path(candidate)


def test_root_owned_symlink_is_accepted_but_user_owned_is_not(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """System layouts such as /home -> /var/home are root-owned; a user cannot plant one."""
    from evidra.security import _platform_posix as platform

    target = private_dir(tmp_path, "target")
    link = tmp_path / "link"
    link.symlink_to(target, target_is_directory=True)
    path = link / "f"
    with pytest.raises(EvidraError):
        platform.assert_no_reparse_points(path)
    real_lstat = os.lstat

    def as_root(candidate: object, *args: object, **kwargs: object) -> os.stat_result:
        info = real_lstat(candidate, *args, **kwargs)  # type: ignore[arg-type]
        if str(candidate) == str(link):
            fields = list(info)
            fields[4] = 0  # st_uid
            return os.stat_result(fields)
        return info

    monkeypatch.setattr(platform.os, "lstat", as_root)
    platform.assert_no_reparse_points(path)


def test_hard_linked_file_is_refused(tmp_path: Path) -> None:
    from evidra.security.handshake import assert_no_reparse_points, validate_private_path

    directory = private_dir(tmp_path)
    file = private_file(directory / "f")
    os.link(file, directory / "alias")
    with pytest.raises(EvidraError) as shape:
        assert_no_reparse_points(file)
    assert shape.value.code == "UNSAFE_PATH"
    with pytest.raises(EvidraError):
        validate_private_path(file)


def test_fifo_is_refused_without_blocking(tmp_path: Path) -> None:
    from evidra.security.handshake import validate_private_path

    directory = private_dir(tmp_path)
    fifo = directory / "pipe"
    os.mkfifo(fifo, 0o600)
    with pytest.raises(EvidraError) as failure:
        validate_private_path(fifo)
    assert reason(failure) == "NOT_REGULAR_OR_DIRECTORY"


def test_traversal_and_relative_paths_are_refused() -> None:
    from evidra.security.handshake import assert_no_reparse_points

    for bad in (Path("relative/f"), Path("/tmp/a/../b")):
        with pytest.raises(EvidraError) as failure:
            assert_no_reparse_points(bad)
        assert failure.value.code == "UNSAFE_PATH"


# --- extended ACL ----------------------------------------------------------------------------
def test_extended_acl_is_refused_by_name(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from evidra.security.handshake import validate_private_path

    directory = private_dir(tmp_path)
    file = private_file(directory / "f")
    monkeypatch.setattr(os, "listxattr", lambda *_a, **_k: ["system.posix_acl_access"])
    with pytest.raises(EvidraError) as failure:
        validate_private_path(file)
    assert reason(failure) == "EXTENDED_ACL"


def test_real_posix_acl_is_refused(tmp_path: Path) -> None:
    from evidra.security.handshake import validate_private_path

    setfacl = shutil.which("setfacl")
    if setfacl is None:
        pytest.skip("setfacl is not installed")
    directory = private_dir(tmp_path)
    file = private_file(directory / "f")
    done = subprocess.run([setfacl, "-m", "u:nobody:r", str(file)], capture_output=True)
    if done.returncode != 0:
        pytest.skip("filesystem does not support POSIX ACLs")
    os.chmod(file, 0o600)  # setfacl turns the group bits into the ACL mask; restore the mode
    with pytest.raises(EvidraError) as failure:
        validate_private_path(file)
    assert reason(failure) in {"EXTENDED_ACL", "NOT_PRIVATE_MODE"}


def test_filesystem_without_xattr_support_is_not_an_acl(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from evidra.security.handshake import validate_private_path

    file = private_file(private_dir(tmp_path) / "f")

    def unsupported(*_a: object, **_k: object) -> list[str]:
        raise OSError(errno.ENOTSUP, "not supported")

    monkeypatch.setattr(os, "listxattr", unsupported)
    validate_private_path(file)


# --- O_EXCL creation -------------------------------------------------------------------------
@pytest.mark.parametrize("umask", [0o000, 0o277])
def test_created_file_is_0600_under_any_umask(tmp_path: Path, umask: int) -> None:
    from evidra.security.handshake import create_private_file

    previous = os.umask(umask)
    try:
        with create_private_file(tmp_path / "f") as stream:
            stream.write("x")
    finally:
        os.umask(previous)
    assert stat.S_IMODE((tmp_path / "f").stat().st_mode) == 0o600


def test_creation_is_exclusive_and_never_follows_a_planted_link(tmp_path: Path) -> None:
    from evidra.security.handshake import create_private_file

    existing = private_file(tmp_path / "existing", "keep")
    with pytest.raises(FileExistsError):
        create_private_file(existing)
    assert existing.read_text() == "keep"
    victim = tmp_path / "victim"
    victim.write_text("victim")
    (tmp_path / "planted").symlink_to(victim)
    with pytest.raises(OSError):
        create_private_file(tmp_path / "planted")
    assert victim.read_text() == "victim"


# --- RENAME_NOREPLACE ------------------------------------------------------------------------
def test_rename_noreplace_never_replaces(tmp_path: Path) -> None:
    from evidra.security.handshake import rename_noreplace

    source = tmp_path / "source"
    source.write_text("new")
    destination = tmp_path / "destination"
    rename_noreplace(source, destination)
    assert destination.read_text() == "new" and not source.exists()
    source.write_text("second")
    with pytest.raises(FileExistsError):
        rename_noreplace(source, destination)
    assert destination.read_text() == "new" and source.read_text() == "second"


def test_receipt_publication_loses_race_without_replacing(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A file that appears after the existence check must not be replaced by the receipt."""
    from evidra.security import handshake as security

    directory = private_dir(tmp_path)
    handshake = security.Handshake.model_validate(handshake_body(directory))
    destination = handshake.connection_path
    original = security.create_private_file

    def create_then_race(path: Path):  # type: ignore[no-untyped-def]
        destination.write_text("attacker")
        return original(path)

    monkeypatch.setattr(security, "create_private_file", create_then_race)
    with pytest.raises(EvidraError) as failure:
        security.write_connection_receipt(handshake, 49200)
    assert failure.value.code == "RECEIPT_ERROR"
    assert destination.read_text() == "attacker"
    assert [entry.name for entry in directory.iterdir()] == ["connection.json"]


# --- handshake claim and receipt, end to end ---------------------------------------------------
def test_consume_claims_once_and_receipt_is_private(tmp_path: Path) -> None:
    from evidra.security.handshake import (
        consume_handshake,
        remove_connection_receipt,
        validate_private_path,
        write_connection_receipt,
    )

    directory = private_dir(tmp_path)
    handshake = private_file(directory / "handshake.json", json.dumps(handshake_body(directory)))
    parsed = consume_handshake(handshake)
    assert not handshake.exists()
    assert parsed.session_token.get_secret_value() == TOKEN
    assert [entry.name for entry in directory.iterdir()] == []
    with pytest.raises(EvidraError):
        consume_handshake(handshake)
    identity = write_connection_receipt(parsed, 49200)
    receipt = parsed.connection_path
    validate_private_path(receipt)
    assert stat.S_IMODE(receipt.stat().st_mode) == 0o600
    assert json.loads(receipt.read_text()) == {
        "protocol_version": 1,
        "host": "127.0.0.1",
        "port": 49200,
        "profile_instance_id": "profile-a",
    }
    assert TOKEN not in receipt.read_text()
    with pytest.raises(EvidraError):
        write_connection_receipt(parsed, 49200)
    remove_connection_receipt(receipt, identity)
    assert not receipt.exists()


def test_consume_refuses_group_readable_handshake_and_public_directory(tmp_path: Path) -> None:
    from evidra.security.handshake import consume_handshake

    directory = private_dir(tmp_path)
    leaky = directory / "handshake.json"
    leaky.write_text(json.dumps(handshake_body(directory)))
    os.chmod(leaky, 0o644)
    with pytest.raises(EvidraError) as failure:
        consume_handshake(leaky)
    assert TOKEN not in str(failure.value)
    assert leaky.exists(), "a refused handshake must not be claimed or deleted"
    os.chmod(directory, 0o755)
    private_file_in_public = private_file(
        directory / "second.json", json.dumps(handshake_body(directory))
    )
    with pytest.raises(EvidraError):
        consume_handshake(private_file_in_public)
    os.chmod(directory, 0o700)


def test_consume_refuses_symlinked_handshake(tmp_path: Path) -> None:
    from evidra.security.handshake import consume_handshake

    directory = private_dir(tmp_path)
    real = private_file(directory / "real.json", json.dumps(handshake_body(directory)))
    link = directory / "handshake.json"
    link.symlink_to(real)
    with pytest.raises(EvidraError):
        consume_handshake(link)
    assert real.exists()


def test_consume_rejects_inode_swapped_after_validation(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The file that is read must be the file that was validated, not one swapped in between."""
    from evidra.security import handshake as security

    directory = private_dir(tmp_path)
    handshake = private_file(directory / "handshake.json", json.dumps(handshake_body(directory)))
    decoy = private_file(directory / "decoy", json.dumps(handshake_body(directory, port=1)))
    real_rename = security.rename_noreplace

    def swap_then_rename(source: Path, destination: Path) -> None:
        os.replace(decoy, source)  # attacker-controlled name is replaced just before the claim
        real_rename(source, destination)

    monkeypatch.setattr(security, "rename_noreplace", swap_then_rename)
    with pytest.raises(EvidraError):
        security.consume_handshake(handshake)
    assert not any(entry.name.startswith(".claimed-") for entry in directory.iterdir())


def test_handshake_paths_allow_colons_on_linux_but_not_relative_or_traversal(
    tmp_path: Path,
) -> None:
    from pydantic import ValidationError

    from evidra.security.handshake import Handshake

    ok = Handshake.model_validate(
        handshake_body(
            tmp_path, data_dir=str(tmp_path / "a:b"), connection_path=str(tmp_path / "c")
        )
    )
    assert ok.data_dir.name == "a:b"
    for bad in ("relative/dir", str(tmp_path / ".." / "x")):
        with pytest.raises(ValidationError):
            Handshake.model_validate(handshake_body(tmp_path, data_dir=bad))


# --- MCP connection file uses the same primitives ----------------------------------------------
def test_mcp_connection_file_is_private_and_not_replaced(tmp_path: Path) -> None:
    from evidra.mcp.connection import ConnectionFile, read_connection, write_connection

    path = tmp_path / "mcp" / "connection.json"
    value = ConnectionFile(port=49300, token="cd" * 32)
    write_connection(path, value)
    assert stat.S_IMODE(path.parent.stat().st_mode) == 0o700
    assert stat.S_IMODE(path.stat().st_mode) == 0o600
    assert read_connection(path).token.get_secret_value() == "cd" * 32
    with pytest.raises(EvidraError):
        write_connection(path, ConnectionFile(port=49301, token="ef" * 32))
    assert read_connection(path).port == 49300
