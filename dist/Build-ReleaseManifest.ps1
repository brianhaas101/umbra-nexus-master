<#
  Build-ReleaseManifest.ps1
  Creates a deterministic manifest of critical runtime files.
  Usage:
    .\server\tools\ps\Build-ReleaseManifest.ps1 -Root "C:\...\Umbra\Nexus" -OutDir "server\tools\release" -Label "FOUNDERV1"
#>

param(
  [string]$Root = ".",
  [string]$OutDir = "server\tools\release",
  [string]$Label = "FOUNDERV1",
  [string[]]$ExtraPaths = @()
)

$ErrorActionPreference = "Stop"

$rootAbs = (Resolve-Path $Root).Path
$destDir = Join-Path $rootAbs $OutDir
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$manifestPath = Join-Path $destDir ("release_manifest_{0}_{1}.json" -f $Label, $stamp)

# Core runtime contract (edit ONLY if you deliberately change the contract)
$core = @(
  "public\index.html",
  "public\scene.js",
  "public\globe\core.js",
  "public\globe\nodes.js",
  "public\globe\interaction.js",
  "public\globe\layers.js",
  "public\globe\textures.js",
  "public\globe\telemetry.js",
  "public\globe\ui.js",
  "public\globe\dossiers.js",
  "public\leads_loader.js",
  "public\style.css"
)

$all = @()
$all += $core
$all += $ExtraPaths

function FileEntry([string]$rel) {
  $p = Join-Path $rootAbs $rel
  if (-not (Test-Path $p)) {
    return [pscustomobject]@{
      path = $rel
      exists = $false
      sha256 = $null
      bytes = 0
    }
  }

  $h = Get-FileHash -Algorithm SHA256 -Path $p
  $bytes = (Get-Item $p).Length

  return [pscustomobject]@{
    path = $rel -replace "\\","/"
    exists = $true
    sha256 = $h.Hash.ToLowerInvariant()
    bytes = [int64]$bytes
  }
}

$files = foreach ($rel in ($all | Select-Object -Unique)) { FileEntry $rel }

$manifest = [pscustomobject]@{
  label = $Label
  root = $rootAbs
  created_at = (Get-Date).ToString("o")
  algorithm = "SHA256"
  files = $files
}

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -Path $manifestPath
Write-Host "[Build-ReleaseManifest] Wrote: $manifestPath"
exit 0
