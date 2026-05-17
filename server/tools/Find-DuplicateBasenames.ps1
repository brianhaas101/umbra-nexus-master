<#
  Find-DuplicateBasenames.ps1
  Reports duplicate file basenames under /public (e.g., nodes.js in two paths).
  This does NOT delete anything. It produces a report you can act on.
#>

param(
  [string]$Root = ".",
  [string]$Scope = "public",        # typically "public"
  [string[]]$Extensions = @(".js",".html",".css",".json")
)

$ErrorActionPreference = "Stop"

$base = Join-Path $Root $Scope
if (-not (Test-Path $base)) { throw "[Find-DuplicateBasenames] Missing: $base" }

$files = Get-ChildItem -Path $base -Recurse -File | Where-Object {
  $Extensions -contains $_.Extension.ToLower()
}

$groups = $files | Group-Object -Property Name | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending

if (-not $groups -or $groups.Count -eq 0) {
  Write-Host "[Find-DuplicateBasenames] PASS: no duplicate basenames found."
  exit 0
}

Write-Host "[Find-DuplicateBasenames] DUPLICATE BASENAMES FOUND:"
foreach ($g in $groups) {
  Write-Host ""
  Write-Host ("{0}  (count={1})" -f $g.Name, $g.Count)
  $g.Group | Sort-Object FullName | ForEach-Object { Write-Host ("  - {0}" -f $_.FullName) }
}

exit 1
