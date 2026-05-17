param(
  [string]$Public = (Resolve-Path ".\public").Path,
  [string]$OutDir = ".\_umbra_audit"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Script tags
Select-String -Path (Join-Path $Public "*.html") -Pattern "<script\s+src=" |
  Select-Object Path, LineNumber, Line |
  Out-File (Join-Path $OutDir "script_tags.txt")

# Known-bad refs / shadowing smells
$patterns = @(
  "public/nodes.js",
  "./nodes.js",
  "scripts/scene.js",
  "/scripts/scene.js",
  "/public/nodes.js",
  "/public/scene.js"
)

Select-String -Path (Join-Path $Public "*.html"), (Join-Path $Public "**\*.js") -Pattern $patterns |
  Select-Object Path, LineNumber, Line |
  Out-File (Join-Path $OutDir "bad_refs.txt")

Write-Host "Wrote wiring scan to $OutDir"
