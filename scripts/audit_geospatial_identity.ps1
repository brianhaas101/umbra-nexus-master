$ErrorActionPreference = "Stop"

$ReportDir = "logs\founder_geospatial_audit"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Report = Join-Path $ReportDir "geospatial_identity_audit.txt"

"UMBRA NEXUS - GEOSPATIAL IDENTITY AUDIT" | Out-File $Report
"Generated: $(Get-Date -Format o)" | Out-File $Report -Append
"" | Out-File $Report -Append

"=== CANONICAL CITY REGISTRIES ===" | Out-File $Report -Append
Get-ChildItem -Recurse -Include canonical_city_registry.json -ErrorAction SilentlyContinue |
  Select-Object FullName |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== CITY ALIAS MAPS ===" | Out-File $Report -Append
Get-ChildItem -Recurse -Include city_alias_map.json -ErrorAction SilentlyContinue |
  Select-Object FullName |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== MANIFESTS WITH CITY IDS ===" | Out-File $Report -Append
Get-ChildItem -Recurse -Include manifest.json,*.csv,*.json -ErrorAction SilentlyContinue |
  Select-String -Pattern "city_id" |
  Select-Object Path, LineNumber, Line |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== NON-CANONICAL CITY ASSET NAMES ===" | Out-File $Report -Append
Get-ChildItem public,dist -Recurse -Directory -ErrorAction SilentlyContinue |
  Where-Object {
    $_.FullName -match "assets\\cities|assets\\city_tiles" -and
    $_.Name -notmatch "^city_[a-f0-9]{8}$" -and
    $_.Name -notmatch "^\d+$"
  } |
  Select-Object FullName |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== GEOJSON / COORDINATE FILES ===" | Out-File $Report -Append
Get-ChildItem -Recurse -Include *.geojson,*.json,*.csv -ErrorAction SilentlyContinue |
  Select-String -Pattern "coordinates","latitude","longitude","lat","lon","bbox","geometry" |
  Select-Object Path, LineNumber, Line |
  Out-File $Report -Append

Write-Host "Audit complete:"
Write-Host $Report