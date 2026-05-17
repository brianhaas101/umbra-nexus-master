<#
  Snapshot-Public.ps1
  Copies /public into server/tools/snapshots/<timestamp>_public
  Use before risky edits.
#>

param(
  [string]$Root = ".",
  [string]$PublicDir = "public",
  [string]$OutDir = "server\tools\snapshots"
)

$ErrorActionPreference = "Stop"

$src = Join-Path $Root $PublicDir
if (-not (Test-Path $src)) { throw "[Snapshot-Public] Missing: $src" }

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$destBase = Join-Path $Root $OutDir
$dest = Join-Path $destBase ("{0}_public" -f $stamp)

New-Item -ItemType Directory -Force -Path $destBase | Out-Null

Write-Host "[Snapshot-Public] Copying..."
Write-Host ("  SRC : {0}" -f (Resolve-Path $src))
Write-Host ("  DEST: {0}" -f $dest)

Copy-Item -Path $src -Destination $dest -Recurse -Force

Write-Host "[Snapshot-Public] DONE"
exit 0
