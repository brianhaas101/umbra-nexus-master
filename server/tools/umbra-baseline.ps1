param(
  [string]$Public = (Resolve-Path ".\public").Path,
  [string]$OutDir = ".\_umbra_baselines"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$zip = Join-Path $OutDir "public_snapshot_$stamp.zip"

Compress-Archive -Path (Join-Path $Public "*") -DestinationPath $zip -Force
Write-Host "Baseline saved: $zip"
