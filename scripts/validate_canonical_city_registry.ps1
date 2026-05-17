$ErrorActionPreference = "Stop"

$RegistryPath = "config\canonical_city_registry.json"
$AliasPath = "config\city_alias_map.json"

$ReportDir = "logs\founder_geospatial_audit"
$Report = Join-Path $ReportDir "canonical_city_registry_validation.txt"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Registry = Get-Content $RegistryPath -Raw | ConvertFrom-Json
$Aliases = Get-Content $AliasPath -Raw | ConvertFrom-Json

"UMBRA NEXUS - CANONICAL CITY REGISTRY VALIDATION" | Out-File $Report
"Generated: $(Get-Date -Format o)" | Out-File $Report -Append
"" | Out-File $Report -Append

"=== SUMMARY ===" | Out-File $Report -Append
"Registry count: $($Registry.Count)" | Out-File $Report -Append
"Alias count: $($Aliases.PSObject.Properties.Count)" | Out-File $Report -Append
"" | Out-File $Report -Append

"=== MISSING REQUIRED FIELDS ===" | Out-File $Report -Append

$Required = @(
  "city_id",
  "canonical_name",
  "city",
  "state",
  "scaffold_status",
  "bounds_status",
  "tiles_url"
)

foreach ($City in $Registry) {

  foreach ($Field in $Required) {

    $HasField = $City.PSObject.Properties.Name.Contains($Field)

    if (-not $HasField) {
      "$($City.city_id) missing field: $Field" |
        Out-File $Report -Append

      continue
    }

    $Value = [string]$City.$Field

    if ([string]::IsNullOrWhiteSpace($Value)) {
      "$($City.city_id) empty field: $Field" |
        Out-File $Report -Append
    }
  }
}

"" | Out-File $Report -Append
"=== UNVERIFIED OR PENDING BOUNDS ===" | Out-File $Report -Append

$Registry |
  Where-Object {
    $_.bounds_status -ne "verified_boundary"
  } |
  Select-Object `
    city_id,
    canonical_name,
    bounds_status,
    scaffold_status |
  Format-Table -AutoSize |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== DUPLICATE CITY IDS ===" | Out-File $Report -Append

$Registry |
  Group-Object city_id |
  Where-Object { $_.Count -gt 1 } |
  Select-Object Name, Count |
  Format-Table -AutoSize |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== DUPLICATE CANONICAL NAMES ===" | Out-File $Report -Append

$Registry |
  Group-Object canonical_name |
  Where-Object { $_.Count -gt 1 } |
  Select-Object Name, Count |
  Format-Table -AutoSize |
  Out-File $Report -Append

"" | Out-File $Report -Append
"=== ALIASES POINTING TO MISSING CITY IDS ===" | Out-File $Report -Append

$KnownIds = @{}

foreach ($City in $Registry) {
  $KnownIds[$City.city_id] = $true
}

foreach ($Alias in $Aliases.PSObject.Properties) {

  $AliasValue = $Alias.Value

  if (-not $KnownIds.ContainsKey($AliasValue.city_id)) {

    "$($Alias.Name) -> missing city_id: $($AliasValue.city_id)" |
      Out-File $Report -Append
  }
}

"" | Out-File $Report -Append
"=== VALIDATION COMPLETE ===" | Out-File $Report -Append

Write-Host ""
Write-Host "Validation complete:"
Write-Host $Report
Write-Host ""