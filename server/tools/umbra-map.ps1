param(
  [string]$Root = (Resolve-Path ".\").Path,
  [string]$OutDir = ".\_umbra_audit"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$target = Join-Path $Root "public"

tree /F /A $target | Out-File (Join-Path $OutDir "tree_public.txt")

Get-ChildItem $target -Recurse -File |
  Select-Object FullName, Length, LastWriteTime |
  Sort-Object FullName |
  Out-File (Join-Path $OutDir "files_public.txt")

Get-ChildItem $target -Recurse -File -Filter *.js |
  Select-Object FullName, Length, LastWriteTime |
  Sort-Object FullName |
  Out-File (Join-Path $OutDir "js_public.txt")

Write-Host "Wrote audit to $OutDir"
