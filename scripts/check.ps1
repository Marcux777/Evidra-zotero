param([string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    $checkArgs = @('run', '--project', 'services/engine', '--frozen', 'python', 'scripts/check.py')
    if ($OutputDirectory) { $checkArgs += @('--output', $OutputDirectory) }
    & rtk proxy uv @checkArgs
    if ($LASTEXITCODE -ne 0) { throw "Local checks failed (exit $LASTEXITCODE); inspect the reported logs." }
} finally { Pop-Location }
