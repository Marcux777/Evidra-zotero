"""One-use startup input and credential-free receipt, protected by Windows ACLs."""

import json
import os
import secrets
import stat
import subprocess
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, ValidationError, field_validator

from evidra.domain.errors import EvidraError


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
        if not value.is_absolute() or ".." in value.parts:
            raise ValueError("An absolute local path without traversal is required")
        if value.drive.startswith("\\\\") or ":" in str(value)[2:]:
            raise ValueError("Network paths and alternate data streams are forbidden")
        return value


def assert_no_reparse_points(path: Path) -> None:
    if not path.is_absolute() or ".." in path.parts or path.drive.startswith("\\\\"):
        raise EvidraError("UNSAFE_PATH", "An absolute local path without traversal is required.")
    if ":" in str(path)[2:]:
        raise EvidraError("UNSAFE_PATH", "Alternate data streams are forbidden.")
    for component in [*reversed(path.parents), path]:
        try:
            info = component.lstat()
        except FileNotFoundError:
            continue
        if info.st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
            raise EvidraError("UNSAFE_PATH", "Reparse points are forbidden.")
        if component == path and stat.S_ISREG(info.st_mode) and info.st_nlink != 1:
            raise EvidraError("UNSAFE_PATH", "Linked files are forbidden.")


_ACL_COMMON = r"""
$ErrorActionPreference = 'Stop'
$securityModule = 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1'
Import-Module (Join-Path $PSHOME $securityModule) -ErrorAction Stop
$target = $env:EVIDRA_ACL_TARGET
$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
$item = Get-Item -LiteralPath $target -Force
if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Reparse point' }
"""
_ACL_PROTECT = r"""
$acl = Get-Acl -LiteralPath $target
$acl.SetOwner($sid)
$acl.SetAccessRuleProtection($true, $false)
foreach ($rule in @($acl.Access)) { [void]$acl.RemoveAccessRuleSpecific($rule) }
if ($item.PSIsContainer) {
  $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid, 'FullControl',
      'ContainerInherit,ObjectInherit', 'None', 'Allow')
} else {
  $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
      $sid, 'FullControl', 'Allow')
}
$acl.AddAccessRule($rule)
Set-Acl -LiteralPath $target -AclObject $acl
"""
_ACL_VALIDATE = r"""
$acl = Get-Acl -LiteralPath $target
if ($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -ne $sid.Value) {
  throw 'Unexpected owner'
}
$hasAccess = $false
foreach ($rule in $acl.GetAccessRules($true, $true,
                                    [System.Security.Principal.SecurityIdentifier])) {
  if ($rule.AccessControlType -eq 'Allow') {
    if ($rule.IdentityReference.Value -ne $sid.Value) { throw 'Unexpected ACL principal' }
    if (($rule.FileSystemRights -band [Security.AccessControl.FileSystemRights]::ReadData) -ne 0) {
      $hasAccess = $true
    }
  }
}
if (-not $hasAccess) { throw 'No private access rule' }
"""

_ACL_DIAGNOSTIC = r"""
} catch {
  $reason = 'ACL_OPERATION_FAILED'
  switch -Exact ($_.Exception.Message) {
    'Reparse point' { $reason = 'REPARSE_POINT' }
    'Unexpected owner' { $reason = 'UNEXPECTED_OWNER' }
    'Unexpected ACL principal' { $reason = 'UNEXPECTED_PRINCIPAL' }
    'No private access rule' { $reason = 'NO_PRIVATE_ACCESS' }
  }
  $fields = @($reason, $_.Exception.GetType().FullName, $_.CategoryInfo.Category.ToString(),
              $_.InvocationInfo.ScriptLineNumber, $_.Exception.HResult)
  [Console]::Error.WriteLine('EVIDRA_ACL_DIAGNOSTIC:' + [string]::Join('|', $fields))
  exit 1
}
"""


def _acl_operation(path: Path, *, protect: bool) -> None:
    if os.name != "nt":
        raise EvidraError("UNSUPPORTED_PLATFORM", "Windows ACL support is required.")
    assert_no_reparse_points(path)
    executable = Path(os.environ["SystemRoot"]) / "System32/WindowsPowerShell/v1.0/powershell.exe"
    script = "try {\n" + _ACL_COMMON + (_ACL_PROTECT if protect else "")
    script += _ACL_VALIDATE + _ACL_DIAGNOSTIC
    try:
        subprocess.run(
            [str(executable), "-NoProfile", "-NonInteractive", "-Command", script],
            env=os.environ | {"EVIDRA_ACL_TARGET": str(path)},
            check=True,
            capture_output=True,
            timeout=15,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise EvidraError(
            "ACL_ERROR",
            "Windows private ACL verification failed.",
            details={"operation": "protect_acl" if protect else "validate_acl"},
        ) from exc


def protect_path(path: Path) -> None:
    _acl_operation(path, protect=True)


def validate_private_path(path: Path) -> None:
    _acl_operation(path, protect=False)


def consume_handshake(path: Path) -> Handshake:
    claimed = path.with_name(f".claimed-{secrets.token_hex(16)}.json")
    try:
        validate_private_path(path.parent)
        validate_private_path(path)
        before = path.stat()
        if not stat.S_ISREG(before.st_mode):
            raise EvidraError("INVALID_HANDSHAKE", "A regular handshake file is required.")
        path.rename(claimed)  # Windows rename fails if the destination already exists.
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
        with temporary.open("x", encoding="utf-8") as stream:
            json.dump(payload, stream)
            stream.flush()
            os.fsync(stream.fileno())
        validate_private_path(temporary)
        temporary.rename(destination)
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
