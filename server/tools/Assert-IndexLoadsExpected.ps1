<#
  Assert-IndexLoadsExpected.ps1
  - Extracts <script src="..."> from index.html
  - Verifies the loaded list contains required entries
  - Blocks known-bad / stale paths
#>

param(
  [string]$IndexPath = ".\public\index.html"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $IndexPath)) { throw "[Assert-IndexLoadsExpected] Missing: $IndexPath" }

$html = Get-Content -Raw -Encoding UTF8 $IndexPath

# Extract script src values
$rx = [regex]'<script[^>]+src\s*=\s*["'']([^"''>]+)["''][^>]*>'
$matches = $rx.Matches($html)

$srcs = @()
foreach ($m in $matches) { $srcs += $m.Groups[1].Value }
$srcs = $srcs | ForEach-Object { $_.Trim() }

Write-Host "[Assert-IndexLoadsExpected] Script SRCs found:"
$srcs | ForEach-Object { Write-Host ("  - {0}" -f $_) }

$required = @(
  "three.min.js",
  "./leads_loader.js",
  "./globe/core.js",
  "./globe/textures.js",
  "./globe/layers.js",
  "./globe/nodes.js",
  "./globe/ui.js",
  "./globe/dossiers.js",
  "./globe/telemetry.js",
  "./globe/interaction.js",
  "./scene.js"
)

$blocked = @(
  "/public/nodes.js",
  "./nodes.js",
  "/scripts/scene.js",
  "./scripts/scene.js",
  "./public/scene.js",
  "/public/scene.js"
)

$fails = @()

# Required: presence (substring match so querystrings are ok)
foreach ($r in $required) {
  $ok = $false
  foreach ($s in $srcs) {
    if ($s -like "*$r*") { $ok = $true; break }
  }
  if (-not $ok) { $fails += ("Missing required script in index.html: {0}" -f $r) }
}

# Blocked: presence
foreach ($b in $blocked) {
  foreach ($s in $srcs) {
    if ($s -like "*$b*") { $fails += ("Blocked/stale script path present: {0}" -f $s) }
  }
}

if ($fails.Count -eq 0) {
  Write-Host "[Assert-IndexLoadsExpected] PASS"
  exit 0
}

Write-Host "[Assert-IndexLoadsExpected] FAIL"
$fails | ForEach-Object { Write-Host ("- {0}" -f $_) }
exit 1
