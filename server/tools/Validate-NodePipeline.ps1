<# 
  Validate-NodePipeline.ps1
  Static “pipeline sanity” validator:
  - Ensures the v1 builder exists in globe/nodes.js (buildCityEntityHierarchy)
  - Ensures scene.js references it (typeof G.buildCityEntityHierarchy === "function")
  - Ensures core.js provides ensureWorldWeld + ensureWorldGroup
  - Ensures there are no duplicate shadow files that are likely to confuse runtime
#>

param(
  [Parameter(Mandatory=$false)]
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

function MustExist($p) {
  if (-not (Test-Path $p)) { throw "[Validate-NodePipeline] Missing file: $p" }
}

$nodes = Join-Path $Root "public\globe\nodes.js"
$scene = Join-Path $Root "public\scene.js"
$core  = Join-Path $Root "public\globe\core.js"

MustExist $nodes
MustExist $scene
MustExist $core

$nodesTxt = Get-Content -Raw -Encoding UTF8 $nodes
$sceneTxt = Get-Content -Raw -Encoding UTF8 $scene
$coreTxt  = Get-Content -Raw -Encoding UTF8 $core

$fails = @()

# v1 builder presence
if ($nodesTxt -notmatch "buildCityEntityHierarchy") {
  $fails += "globe/nodes.js missing buildCityEntityHierarchy (v1 hierarchy builder)."
}

# scene uses v1 builder path
if ($sceneTxt -notmatch "typeof\s+G\.buildCityEntityHierarchy\s*===\s*""function""") {
  $fails += "scene.js does not check/use G.buildCityEntityHierarchy === 'function' (v1 path may never run)."
}

# core provides weld/group
if ($coreTxt -notmatch "ensureWorldWeld") { $fails += "core.js missing ensureWorldWeld." }
if ($coreTxt -notmatch "ensureWorldGroup") { $fails += "core.js missing ensureWorldGroup." }

# Shadow file warning: if these exist, they frequently cause confusion
$shadowCandidates = @(
  (Join-Path $Root "public\nodes.js"),
  (Join-Path $Root "public\scripts\scene.js"),
  (Join-Path $Root "public\scripts\nodes.js")
)

$shadows = @()
foreach ($p in $shadowCandidates) {
  if (Test-Path $p) { $shadows += $p }
}

if ($shadows.Count -gt 0) {
  $fails += ("Shadow/duplicate-prone file(s) exist (not necessarily loaded, but high-risk):`n  - " + ($shadows -join "`n  - "))
}

if ($fails.Count -eq 0) {
  Write-Host "[Validate-NodePipeline] PASS"
  exit 0
}

Write-Host "[Validate-NodePipeline] FAIL"
$fails | ForEach-Object { Write-Host ("- {0}" -f $_) }
exit 1
