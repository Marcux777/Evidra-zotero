"""Windows implementation of the private-path primitives (ACLs, reparse points).

Moved verbatim from `handshake.py` by the platform-layer split (ADR 0004). Unsupported and
untested on Linux hosts; importing it elsewhere fails explicitly.
"""

import os
import stat
import subprocess
import sys
from pathlib import Path
from typing import TextIO

if sys.platform != "win32":
    raise ImportError("evidra.security._platform_windows requires Windows")

from evidra.domain.errors import EvidraError


def check_path_shape(value: Path) -> None:
    if not value.is_absolute() or ".." in value.parts:
        raise ValueError("An absolute local path without traversal is required")
    if value.drive.startswith("\\\\") or ":" in str(value)[2:]:
        raise ValueError("Network paths and alternate data streams are forbidden")


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


def create_private_file(path: Path) -> TextIO:
    """Create a new file for writing; fails if it exists. Privacy comes from the inherited ACL."""
    return path.open("x", encoding="utf-8")


def rename_noreplace(source: Path, destination: Path) -> None:
    source.rename(destination)  # Windows rename fails if the destination already exists.
