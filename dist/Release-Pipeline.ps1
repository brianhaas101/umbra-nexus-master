<#
  Release-Pipeline.ps1
  Runs: Smoke-Nexus -> Build-ReleaseManifest -> Write-ReleaseLockMD -> Verify-ReleaseManifest
  Usage:
    .\server\tools\ps\Release-Pipeline.ps1 -Root . -BaseUrl http://127.0.0.1:3000 -Label FOUNDERV1
#>

param(
  [string]$Root = ".",
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$Label = "FOUNDERV1"
)

$ErrorActionPreference = "Stop"

$rootAbs = (Resolve-Path $Root).Path
$psDir = Join-Path $rootAbs "server\tools\ps"
$relDir = Join-Path $rootAbs "server\tools\release"

# 1) Smoke test
& (Join-Path $psDir "Smoke-Nexus.ps1") -Root $Root -BaseUrl $BaseUrl -IndexPath ".\public\index.html" -JsonPath ".\public\data\leads_master.json"
if ($LASTEXITCODE -ne 0) { throw "[Release-Pipeline] Smoke test failed." }

# 2) Build manifest
& (Join-Path $psDir "Build-ReleaseManifest.ps1") -Root $Root -OutDir "server\tools\release" -Label $Label
if ($LASTEXITCODE -ne 0) { throw "[Release-Pipeline] Manifest build failed." }

# Select newest manifest for this label
$latest = Get-ChildItem -Path $relDir -Filter ("release_manifest_{0}_*.json" -f $Label) |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latest) { throw "[Release-Pipeline] Could not find manifest output." }

# 3) Write lock MD
& (Join-Path $psDir "Write-ReleaseLockMD.ps1") -ManifestPath $latest.FullName -OutDir "server\tools\release"
if ($LASTEXITCODE -ne 0) { throw "[Release-Pipeline] RELEASE_LOCK.md write failed." }

# 4) Verify immediately
& (Join-Path $psDir "Verify-ReleaseManifest.ps1") -ManifestPath $latest.FullName
if ($LASTEXITCODE -ne 0) { throw "[Release-Pipeline] Manifest verify failed." }

Write-Host "[Release-Pipeline] PASS. Locked release created:"
Write-Host ("- Manifest: {0}" -f $latest.FullName)
Write-Host ("- Lock:     {0}" -f (Join-Path $relDir "RELEASE_LOCK.md"))
exit 0
