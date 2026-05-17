<# 
  Validate-IndexContracts.ps1
  Verifies index.html has required DOM contract IDs and required script includes.
  Deterministic: PASS/FAIL with explicit missing items.
#>

param(
  [Parameter(Mandatory=$false)]
  [string]$IndexPath = ".\public\index.html"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $IndexPath)) {
  throw "[Validate-IndexContracts] index.html not found at: $IndexPath"
}

$html = Get-Content -Raw -Encoding UTF8 $IndexPath

$requiredIds = @(
  'id="globeContainer"',
  'id="debugMsg"',
  'id="telemetryStatus"',
  'id="telemetryNodes"',
  'id="dossierPanel"',
  'id="leadContent"',
  'id="leadPanelTitle"'
)

$requiredScripts = @(
  'three.min.js',
  'leads_loader.js',
  'globe/core.js',
  'globe/textures.js',
  'globe/layers.js',
  'globe/nodes.js',
  'globe/ui.js',
  'globe/dossiers.js',
  'globe/telemetry.js',
  'globe/interaction.js',
  'scene.js'
)

$missingIds = @()
foreach ($id in $requiredIds) {
  if ($html -notmatch [regex]::Escape($id)) { $missingIds += $id }
}

$missingScripts = @()
foreach ($s in $requiredScripts) {
  if ($html -notmatch [regex]::Escape($s)) { $missingScripts += $s }
}

# Ensure ordering: leads_loader before scene.js, core before scene.js, nodes before interaction, etc.
function IndexOfString($hay, $needle) {
  return $hay.IndexOf($needle, [System.StringComparison]::OrdinalIgnoreCase)
}

$checks = @(
  @{ name="leads_loader BEFORE scene.js"; a="leads_loader.js"; b="scene.js" },
  @{ name="core BEFORE scene.js";        a="globe/core.js";    b="scene.js" },
  @{ name="nodes BEFORE interaction";    a="globe/nodes.js";   b="globe/interaction.js" },
  @{ name="interaction BEFORE scene.js"; a="globe/interaction.js"; b="scene.js" }
)

$orderFails = @()
foreach ($c in $checks) {
  $ia = IndexOfString $html $c.a
  $ib = IndexOfString $html $c.b
  if ($ia -lt 0 -or $ib -lt 0) {
    $orderFails += ("{0} (missing one: {1}, {2})" -f $c.name, $c.a, $c.b)
  } elseif ($ia -gt $ib) {
    $orderFails += ("{0} (wrong order: {1} after {2})" -f $c.name, $c.a, $c.b)
  }
}

if ($missingIds.Count -eq 0 -and $missingScripts.Count -eq 0 -and $orderFails.Count -eq 0) {
  Write-Host "[Validate-IndexContracts] PASS"
  exit 0
}

Write-Host "[Validate-IndexContracts] FAIL"

if ($missingIds.Count -gt 0) {
  Write-Host "Missing DOM IDs:"
  $missingIds | ForEach-Object { Write-Host ("  - {0}" -f $_) }
}

if ($missingScripts.Count -gt 0) {
  Write-Host "Missing script references:"
  $missingScripts | ForEach-Object { Write-Host ("  - {0}" -f $_) }
}

if ($orderFails.Count -gt 0) {
  Write-Host "Ordering violations:"
  $orderFails | ForEach-Object { Write-Host ("  - {0}" -f $_) }
}

exit 1
