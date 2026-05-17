<#
  Fetch-DevEndpoints.ps1
  Verifies local dev server returns 200 for required endpoints.
  Usage:
    .\server\tools\ps\Fetch-DevEndpoints.ps1 -BaseUrl http://127.0.0.1:3000
#>

param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [switch]$IncludeDataJson
)

$ErrorActionPreference = "Stop"

function Test-Url([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 6
    return [pscustomobject]@{ Url=$url; Status=$r.StatusCode; Ok=($r.StatusCode -eq 200) }
  } catch {
    return [pscustomobject]@{ Url=$url; Status=0; Ok=$false; Error=$_.Exception.Message }
  }
}

$paths = @(
  "/",
  "/style.css",
  "/leads_loader.js",
  "/globe/core.js",
  "/globe/textures.js",
  "/globe/layers.js",
  "/globe/nodes.js",
  "/globe/ui.js",
  "/globe/dossiers.js",
  "/globe/telemetry.js",
  "/globe/interaction.js",
  "/scene.js"
)

if ($IncludeDataJson) {
  $paths += "/data/leads_master.json"
}

$results = foreach ($p in $paths) {
  Test-Url ($BaseUrl.TrimEnd("/") + $p)
}

$results | Format-Table -AutoSize

$bad = $results | Where-Object { -not $_.Ok }
if ($bad) {
  Write-Host "[Fetch-DevEndpoints] FAIL: one or more endpoints not OK."
  exit 1
}

Write-Host "[Fetch-DevEndpoints] PASS"
exit 0
