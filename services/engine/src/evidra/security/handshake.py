"""One-use startup input and credential-free receipt in a private session directory.

The OS-specific guarantees (Windows ACLs; POSIX 0700/0600, ownership, no-follow, no-replace
rename) live in `_platform_windows` and `_platform_posix`, chosen by `sys.platform`.
"""

import json
import os
import secrets
import stat
import sys
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError, field_validator

from evidra.domain.errors import EvidraError

if sys.platform == "win32":
    from evidra.security import _platform_windows as _platform
else:
    from evidra.security import _platform_posix as _platform

assert_no_reparse_points = _platform.assert_no_reparse_points
protect_path = _platform.protect_path
validate_private_path = _platform.validate_private_path
create_private_file = _platform.create_private_file
rename_noreplace = _platform.rename_noreplace


class Handshake(BaseModel):
    model_config = ConfigDict(extra="forbid")
    protocol_version: Literal[1]
    profile_instance_id: str = Field(min_length=1, max_length=200)
    session_token: SecretStr
    data_dir: Path
    port: int = Field(ge=0, le=65535)
    connection_path: Path

    @field_validator("session_token")
    @classmethod
    def validate_token(cls, value: SecretStr) -> SecretStr:
        import re

        if not re.fullmatch(r"[0-9a-f]{64}", value.get_secret_value()):
            raise ValueError("A 256-bit hexadecimal session credential is required")
        return value

    @field_validator("port")
    @classmethod
    def validate_port(cls, value: int) -> int:
        if value == 23119:
            raise ValueError("Reserved port")
        return value

    @field_validator("data_dir", "connection_path")
    @classmethod
    def validate_path(cls, value: Path) -> Path:
        _platform.check_path_shape(value)
        return value


def consume_handshake(path: Path) -> Handshake:
    claimed = path.with_name(f".claimed-{secrets.token_hex(16)}.json")
    try:
        validate_private_path(path.parent)
        validate_private_path(path)
        before = path.stat()
        if not stat.S_ISREG(before.st_mode):
            raise EvidraError("INVALID_HANDSHAKE", "A regular handshake file is required.")
        rename_noreplace(path, claimed)
        try:
            validate_private_path(claimed)
            with claimed.open("rb") as stream:
                opened = os.fstat(stream.fileno())
                if (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino):
                    raise EvidraError("UNSAFE_PATH", "The handshake file changed during claim.")
                payload = stream.read(8193)
            if len(payload) > 8192:
                raise EvidraError("INVALID_HANDSHAKE", "The handshake is too large.")
            handshake = Handshake.model_validate_json(payload)
            if handshake.connection_path.parent != path.parent:
                raise EvidraError(
                    "UNSAFE_PATH", "The receipt must be in the private session directory."
                )
            if handshake.connection_path == path or handshake.connection_path.exists():
                raise EvidraError("UNSAFE_PATH", "The receipt destination must be new.")
            assert_no_reparse_points(handshake.connection_path)
            assert_no_reparse_points(handshake.data_dir)
            return handshake
        finally:
            claimed.unlink()
    except (OSError, ValidationError) as exc:
        raise EvidraError("INVALID_HANDSHAKE", "Cannot consume the startup handshake.") from exc


def write_connection_receipt(handshake: Handshake, port: int) -> tuple[int, int]:
    if not 1 <= port <= 65535 or port == 23119:
        raise EvidraError("INVALID_RUNTIME", "Invalid negotiated engine port.")
    destination = handshake.connection_path
    temporary = destination.with_name(f".receipt-{secrets.token_hex(16)}.json")
    validate_private_path(destination.parent)
    assert_no_reparse_points(destination)
    if destination.exists():
        raise EvidraError("UNSAFE_PATH", "The receipt destination must be new.")
    payload = {
        "protocol_version": 1,
        "host": "127.0.0.1",
        "port": port,
        "profile_instance_id": handshake.profile_instance_id,
    }
    try:
        with create_private_file(temporary) as stream:
            json.dump(payload, stream)
            stream.flush()
            os.fsync(stream.fileno())
        validate_private_path(temporary)
        rename_noreplace(temporary, destination)
        validate_private_path(destination)
        identity = destination.stat()
        return identity.st_dev, identity.st_ino
    except OSError as exc:
        raise EvidraError("RECEIPT_ERROR", "Cannot publish the engine connection receipt.") from exc
    finally:
        temporary.unlink(missing_ok=True)


def remove_connection_receipt(path: Path, identity: tuple[int, int]) -> None:
    validate_private_path(path.parent)
    validate_private_path(path)
    current = path.stat()
    if (current.st_dev, current.st_ino) != identity:
        raise EvidraError("UNSAFE_PATH", "The connection receipt has been replaced.")
    path.unlink()
