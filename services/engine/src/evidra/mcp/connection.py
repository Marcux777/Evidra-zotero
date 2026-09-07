"""Private reusable scoped connection files, with no admin credential or database path."""

import json
import os
import stat
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, ValidationError, field_validator

from evidra.domain.errors import EvidraError
from evidra.mcp.models import ConnectionCreate
from evidra.providers.models import StrictModel
from evidra.security.handshake import assert_no_reparse_points, protect_path, validate_private_path


class ConnectionFile(StrictModel):
    protocol_version: Literal[1] = 1
    host: Literal["127.0.0.1"] = "127.0.0.1"
    port: int = Field(ge=1, le=65535)
    token: SecretStr

    @field_validator("token")
    @classmethod
    def token_shape(cls, value: SecretStr) -> SecretStr:
        return ConnectionCreate.token_shape(value)

    @field_validator("port")
    @classmethod
    def port_shape(cls, value: int) -> int:
        if value == 23119:
            raise ValueError("Reserved port")
        return value


def write_connection(path: Path, value: ConnectionFile) -> None:
    assert_no_reparse_points(path)
    if not path.parent.exists():
        path.parent.mkdir(parents=True)
        protect_path(path.parent)
    validate_private_path(path.parent)
    temporary = path.with_suffix(".pending")
    try:
        with temporary.open("x", encoding="utf-8") as stream:
            json.dump(
                {**value.model_dump(mode="json"), "token": value.token.get_secret_value()}, stream
            )
            stream.flush()
            os.fsync(stream.fileno())
        validate_private_path(temporary)
        temporary.rename(path)
        validate_private_path(path)
    except OSError as exc:
        raise EvidraError("INVALID_RUNTIME", "Cannot write the private MCP connection.") from exc
    finally:
        temporary.unlink(missing_ok=True)


def read_connection(path: Path) -> ConnectionFile:
    try:
        validate_private_path(path.parent)
        validate_private_path(path)
        before = path.stat()
        if not stat.S_ISREG(before.st_mode):
            raise EvidraError("INVALID_RUNTIME", "A regular connection file is required.")
        with path.open("rb") as stream:
            opened = os.fstat(stream.fileno())
            if (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino):
                raise EvidraError("UNSAFE_PATH", "Connection file was replaced.")
            payload = stream.read(8193)
        if len(payload) > 8192:
            raise EvidraError("BODY_TOO_LARGE", "Connection file exceeds its limit.")
        return ConnectionFile.model_validate_json(payload)
    except (OSError, ValidationError) as exc:
        raise EvidraError("INVALID_RUNTIME", "Cannot read the private MCP connection.") from exc
