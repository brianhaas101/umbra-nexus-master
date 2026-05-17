param(
  [string]$ChecklistCsv,
  [string]$ProfileJson
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) { throw "Missing checklist: $ChecklistCsv" }
if (!(Test-Path $ProfileJson)) { throw "Missing profile JSON: $ProfileJson" }

$Rows = Import-Csv $ChecklistCsv
$ProfilesRaw = Get-Content $ProfileJson -Raw | ConvertFrom-Json

$Profiles = @{}
foreach ($P in $ProfilesRaw) {
  $Profiles[$P.city] = $P
}

function PickSource($P, $Layer) {
  switch ($Layer) {
    "city_boundary" { return @("Profile GIS",$P.gis,"official_gis_portal") }
    "neighborhoods_or_districts" { return @("Profile GIS",$P.gis,"official_gis_portal") }
    "council_districts" { return @("Profile council",$P.council,"official_city_governance") }
    "police_beats_or_reporting_districts" { return @("Profile police",$P.police,"official_public_safety") }
    "fire_stations_or_service_areas" { return @("Profile fire",$P.fire,"official_public_safety") }
    "parcels_or_zoning" { return @("Profile permits",$P.permits,"official_planning_permits") }
    "streets_or_transport_corridors" { return @("Profile public works",$P.public_works,"official_public_works") }
    "public_facilities" { return @("Profile GIS",$P.gis,"official_gis_portal") }
    "parks" { return @("Profile parks",$P.parks,"official_parks") }
    "schools" { return @("Profile schools",$P.schools,"official_school_district") }
    "public_safety_incidents_or_calls" { return @("Profile open data",$P.open_data,"official_open_data") }
    "permits_or_code_enforcement" { return @("Profile permits",$P.permits,"official_planning_permits") }
    "civic_governance" { return @("Profile council",$P.council,"official_city_governance") }
    "public_works_or_infrastructure" { return @("Profile public works",$P.public_works,"official_public_works") }
    default { return $null }
  }
}

foreach ($Row in $Rows) {
  if (!$Profiles.ContainsKey($Row.city)) { continue }

  $P = $Profiles[$Row.city]
  $C = PickSource $P $Row.parity_layer

  if ($null -eq $C) { continue }

  $Row.source_name = $C[0]
  $Row.source_url = $C[1]
  $Row.source_type = $C[2]
  $Row.city_specific = "pass"
  $Row.provenance_status = "verified_candidate"
  $Row.authentication_status = "json_profile_candidate"
  $Row.replay_status = "pending"
  $Row.saturation_status = "candidate_found"
  $Row.eligible_for_lock = "false"
  $Row.notes = "Loaded from JSON city profile; requires confirmation and strict validation."
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

Write-Host "Profile loader complete"
Write-Host "Rows:" @($Rows).Count
Write-Host "Candidates:" @($Rows | Where-Object { $_.saturation_status -eq "candidate_found" }).Count
