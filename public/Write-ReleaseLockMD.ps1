<#
  Write-ReleaseLockMD.ps1
  Creates server/tools/release/RELEASE_LOCK.md based on a manifest.
  Usage:
    .\server\tools\ps\Write-ReleaseLockMD.ps1 -ManifestPath .\server\tools\release\release_manifest_FOUNDERV1_*.json
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$ManifestPath,
  [string]$OutDir = "server\tools\release"
)

$ErrorActionPreference = "Stop"

$mp = Resolve-Path $ManifestPath
$raw = Get-Content -Raw -Encoding UTF8 $mp.Path
$man = $raw | ConvertFrom-Json -Depth 12

$root = [string]$man.root
$destDir = Join-Path $root $OutDir
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$lockPath = Join-Path $destDir "RELEASE_LOCK.md"

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Umbra Nexus — Release Lock")
$lines.Add("")
$lines.Add("**Label:** $($man.label)")
$lines.Add("**Created:** $($man.created_at)")
$lines.Add("**Algorithm:** $($man.algorithm)")
$lines.Add("**Manifest:** $([System.IO.Path]::GetFileName($mp.Path))")
$lines.Add("")
$lines.Add("## Locked Files")
$lines.Add("")
$lines.Add("| Path | Bytes | SHA256 |")
$lines.Add("|---|---:|---|")

foreach ($f in $man.files) {
  $lines.Add("| " + $f.path + " | " + $f.bytes + " | `" + $f.sha256 + "` |")
}

$lines.Add("")
$lines.Add("## Guard Rules")
$lines.Add("")
$lines.Add("- Any change to the locked files requires a **new manifest** and a refreshed RELEASE_LOCK.md.")
$lines.Add("- If Verify-ReleaseManifest fails, treat it as a **release break** until resolved.")
$lines.Add("")

$lines | Set-Content -Encoding UTF8 -Path $lockPath
Write-Host "[Write-ReleaseLockMD] Wrote: $lockPath"
exit 0
