param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) {
  throw "Missing checklist CSV: $ChecklistCsv"
}

$Rows = Import-Csv $ChecklistCsv

$AllowedTypes = @{
  "city_boundary" = @("official_gis_portal","official_open_data")
  "neighborhoods_or_districts" = @("official_gis_portal","official_city_page","official_open_data")
  "council_districts" = @("official_city_governance","official_city_page","official_gis_portal","official_open_data")
  "police_beats_or_reporting_districts" = @("official_public_safety","official_gis_portal","official_open_data")
  "fire_stations_or_service_areas" = @("official_public_safety","official_gis_portal","official_open_data")
  "parcels_or_zoning" = @("official_planning_permits","official_city_page","official_gis_portal","official_open_data")
  "streets_or_transport_corridors" = @("official_public_works","official_gis_portal","official_open_data")
  "public_facilities" = @("official_gis_portal","official_open_data","official_city_page")
  "parks" = @("official_parks","official_city_page","official_gis_portal","official_open_data")
  "schools" = @("official_school_district")
  "public_safety_incidents_or_calls" = @("official_public_safety","official_open_data")
  "permits_or_code_enforcement" = @("official_planning_permits","official_open_data","official_city_page")
  "civic_governance" = @("official_city_governance","official_city_page")
  "public_works_or_infrastructure" = @("official_public_works","official_gis_portal","official_open_data")
}

foreach ($Row in $Rows) {
  $Layer = $Row.parity_layer
  $Type = $Row.source_type

  $Valid =
    $Row.saturation_status -eq "verified_layer" -and
    $Row.eligible_for_lock -eq "true" -and
    $Row.source_url -match "^https://" -and
    $Row.city_specific -eq "pass" -and
    $AllowedTypes.ContainsKey($Layer) -and
    ($AllowedTypes[$Layer] -contains $Type)

  if ($Valid) {
    $Row.notes = "$($Row.notes) | strict_validator_pass"
  } else {
    $Row.eligible_for_lock = "false"
    $Row.saturation_status = "strict_validation_failed"
    $Row.notes = "$($Row.notes) | strict_validator_fail"
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

$Passed = @($Rows | Where-Object { $_.saturation_status -eq "verified_layer" -and $_.eligible_for_lock -eq "true" }).Count
$Failed = @($Rows | Where-Object { $_.saturation_status -eq "strict_validation_failed" }).Count

Write-Host "Strict validator complete"
Write-Host "Passed:" $Passed
Write-Host "Failed:" $Failed
