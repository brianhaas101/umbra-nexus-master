param(
  [string]$Public = (Resolve-Path ".\public").Path,
  [string]$OutDir = ".\_umbra_audit"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$files = Get-ChildItem $Public -Recurse -File -Include *.js,*.html

# Duplicate filenames
$files |
  Group-Object Name |
  Where-Object { $_.Count -gt 1 } |
  Sort-Object Count -Descending |
  ForEach-Object {
    "==== DUP NAME: $($_.Name) (x$($_.Count)) ===="
    $_.Group | Select-Object FullName, Length, LastWriteTime | Format-Table -AutoSize | Out-String
  } | Out-File (Join-Path $OutDir "dupe_names.txt")

# Duplicate content hashes
$files |
  ForEach-Object {
    $h = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    [PSCustomObject]@{ Hash=$h; FullName=$_.FullName; Length=$_.Length; LastWriteTime=$_.LastWriteTime }
  } |
  Group-Object Hash |
  Where-Object { $_.Count -gt 1 } |
  Sort-Object Count -Descending |
  ForEach-Object {
    "==== DUP HASH: $($_.Name) (x$($_.Count)) ===="
    $_.Group | Select-Object FullName, Length, LastWriteTime | Format-Table -AutoSize | Out-String
  } | Out-File (Join-Path $OutDir "dupe_hashes.txt")

Write-Host "Wrote dupes to $OutDir"
