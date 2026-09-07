$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    & rtk proxy npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
    & rtk proxy uv sync --project services/engine --frozen
    if ($LASTEXITCODE -ne 0) { throw 'uv sync failed' }
    & rtk proxy npm run build:plugin
    if ($LASTEXITCODE -ne 0) { throw 'Plugin build failed' }
    Write-Output 'Development dependencies and XPI are ready. Use scripts/package.ps1 for the Windows engine; use only an isolated synthetic Zotero test profile.'
} finally { Pop-Location }
