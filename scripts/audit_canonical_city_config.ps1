$ErrorActionPreference = "Stop"

$Registry = "config\canonical_city_registry.json"
$Aliases = "config\city_alias_map.json"
$ReportDir = "logs\founder_geospatial_audit"
$Report = Join-Path $ReportDir "canonical_city_config_audit.txt"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

"UMBRA NEXUS - CANONICAL CITY CONFIG AUDIT" | Out-File $Report
"Generated: $(Get-Date -Format o)" | Out-File $Report -Append
"" | Out-File $Report -Append

"=== FILE HASHES ===" | Out-File $Report -Append
Get-FileHash $Registry -Algorithm SHA256 | Format-List | Out-File $Report -Append
Get-FileHash $Aliases -Algorithm SHA256 | Format-List | Out-File $Report -Append

"" | Out-File $Report -Append
"=== REGISTRY SAMPLE ===" | Out-File $Report -Append
Get-Content $Registry -TotalCount 80 | Out-File $Report -Append

"" | Out-File $Report -Append
"=== ALIAS SAMPLE ===" | Out-File $Report -Append
Get-Content $Aliases -TotalCount 80 | Out-File $Report -Append

Write-Host "Canonical audit complete:"
Write-Host $Report