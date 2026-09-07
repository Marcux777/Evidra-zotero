param([string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    $packageArgs = @('run', '--project', 'services/engine', '--frozen', 'python', 'scripts/package.py')
    if ($OutputDirectory) { $packageArgs += @('--output', $OutputDirectory) }
    & rtk proxy uv @packageArgs
    if ($LASTEXITCODE -ne 0) { throw "Package failed (exit $LASTEXITCODE); inspect the reported logs." }
} finally { Pop-Location }
