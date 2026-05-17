<#
  Guard-ReleaseLock.ps1
  Enforces: no shadow core files + release manifest must verify.
  Usage:
    .\server\tools\ps\Guard-ReleaseLock.ps1 -Root . -ManifestPath .\server\tools\release\release_manifest_FOUNDERV1_*.json
#>

param(
  [string]$Root = ".",
  [Parameter(Mandatory=$true)]
  [string]$ManifestPath
)

$ErrorActionPreference = "Stop"

$psDir = Join-Path (Resolve-Path $Root).Path "server\tools\ps"

# 1) Shadow files
& (Join-Path $psDir "Guard-NoShadowCoreFiles.ps1") -Root $Root
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2) Manifest verify
& (Join-Path $psDir "Verify-ReleaseManifest.ps1") -ManifestPath $ManifestPath
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "[Guard-ReleaseLock] PASS"
exit 0
