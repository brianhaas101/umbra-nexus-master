<#
  Guard-NoShadowCoreFiles.ps1
  Release-guard:
  FAILS if shadow copies of core runtime files exist in high-risk locations.
  These are common causes of "we fixed it but it came back" (editing wrong file).
#>

param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$targets = @(
  @{ name="public\nodes.js (should NOT exist)"; path=(Join-Path $Root "public\nodes.js") },
  @{ name="public\scripts\scene.js (should NOT exist)"; path=(Join-Path $Root "public\scripts\scene.js") },
  @{ name="public\scripts\nodes.js (should NOT exist)"; path=(Join-Path $Root "public\scripts\nodes.js") }
)

$fails = @()

foreach ($t in $targets) {
  if (Test-Path $t.path) {
    # allow if clearly quarantined
    $leaf = Split-Path $t.path -Leaf
    if ($leaf -match "\.DUPLICATE\.") { continue }
    $fails += ("Shadow file present: {0} => {1}" -f $t.name, $t.path)
  }
}

if ($fails.Count -eq 0) {
  Write-Host "[Guard-NoShadowCoreFiles] PASS"
  exit 0
}

Write-Host "[Guard-NoShadowCoreFiles] FAIL"
$fails | ForEach-Object { Write-Host ("- {0}" -f $_) }
exit 1
