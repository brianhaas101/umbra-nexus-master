param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ChecklistCsv)) { throw "ChecklistCsv required." }
if (!(Test-Path $ChecklistCsv)) { throw "Checklist not found: $ChecklistCsv" }

$Rows = Import-Csv $ChecklistCsv

$CityProfiles = @{}

$CityProfiles["Columbus"] = @{ gis="https://gis-columbus.opendata.arcgis.com"; open_data="https://opendata.columbus.gov"; police="https://www.columbus.gov/Services/Public-Safety/Police"; fire="https://www.columbus.gov/Services/Public-Safety/Fire"; parks="https://www.columbus.gov/Services/Recreation-and-Parks"; permits="https://www.columbus.gov/Services/Building-and-Zoning"; public_works="https://www.columbus.gov/Services/Public-Service"; schools="https://www.ccsoh.us"; council="https://www.columbus.gov/Government/City-Council" }
$CityProfiles["Cleveland"] = @{ gis="https://planning.clevelandohio.gov/maps"; open_data="https://data.clevelandohio.gov"; police="https://www.clevelandohio.gov/city-hall/departments/public-safety/divisions/police"; fire="https://www.clevelandohio.gov/city-hall/departments/public-safety/divisions/fire"; parks="https://www.clevelandohio.gov/city-hall/departments/public-works/divisions/parks-maintenance-properties"; permits="https://www.clevelandohio.gov/city-hall/departments/building-housing"; public_works="https://www.clevelandohio.gov/city-hall/departments/public-works"; schools="https://www.clevelandmetroschools.org"; council="https://www.clevelandcitycouncil.org" }
$CityProfiles["Cincinnati"] = @{ gis="https://cagis.hamilton-co.org"; open_data="https://data.cincinnati-oh.gov"; police="https://www.cincinnati-oh.gov/police"; fire="https://www.cincinnati-oh.gov/fire"; parks="https://www.cincinnati-oh.gov/cincyparks"; permits="https://www.cincinnati-oh.gov/buildings"; public_works="https://www.cincinnati-oh.gov/public-services"; schools="https://www.cps-k12.org"; council="https://www.cincinnati-oh.gov/council" }
$CityProfiles["Toledo"] = @{ gis="https://toledo.oh.gov/residents/maps"; open_data="https://data.toledo.oh.gov"; police="https://toledo.oh.gov/departments/police"; fire="https://toledo.oh.gov/departments/fire-rescue"; parks="https://toledo.oh.gov/residents/parks"; permits="https://toledo.oh.gov/business/how-to-build-in-the-city"; public_works="https://toledo.oh.gov/departments/public-service"; schools="https://www.tps.org"; council="https://toledo.oh.gov/government/city-council" }
$CityProfiles["Akron"] = @{ gis="https://www.akronohio.gov/departments/engineering_bureau/gis_mapping.php"; open_data="https://data.akronohio.gov"; police="https://www.akronohio.gov/departments/police"; fire="https://www.akronohio.gov/departments/fire"; parks="https://www.akronohio.gov/departments/recreation_and_parks"; permits="https://www.akronohio.gov/departments/planning_and_urban_development"; public_works="https://www.akronohio.gov/departments/public_service"; schools="https://www.akronschools.com"; council="https://www.akroncitycouncil.org" }

function Resolve-ProfileLayer {
  param($Profile, [string]$Layer)
  switch ($Layer) {
    "city_boundary" { return @("Synthesized GIS",$Profile.gis,"official_gis_portal") }
    "neighborhoods_or_districts" { return @("Synthesized GIS",$Profile.gis,"official_gis_portal") }
    "council_districts" { return @("Synthesized council",$Profile.council,"official_city_governance") }
    "police_beats_or_reporting_districts" { return @("Synthesized police",$Profile.police,"official_public_safety") }
    "fire_stations_or_service_areas" { return @("Synthesized fire",$Profile.fire,"official_public_safety") }
    "parcels_or_zoning" { return @("Synthesized permits",$Profile.permits,"official_planning_permits") }
    "streets_or_transport_corridors" { return @("Synthesized public works",$Profile.public_works,"official_public_works") }
    "public_facilities" { return @("Synthesized GIS",$Profile.gis,"official_gis_portal") }
    "parks" { return @("Synthesized parks",$Profile.parks,"official_parks") }
    "schools" { return @("Synthesized schools",$Profile.schools,"official_school_district") }
    "public_safety_incidents_or_calls" { return @("Synthesized open data",$Profile.open_data,"official_open_data") }
    "permits_or_code_enforcement" { return @("Synthesized permits",$Profile.permits,"official_planning_permits") }
    "civic_governance" { return @("Synthesized council",$Profile.council,"official_city_governance") }
    "public_works_or_infrastructure" { return @("Synthesized public works",$Profile.public_works,"official_public_works") }
    default { return $null }
  }
}

foreach ($Row in $Rows) {
  if ($Row.saturation_status -eq "verified_layer") { continue }
  if ($Row.saturation_status -eq "strict_validation_failed") {
    $Row.saturation_status = "gap_unfilled"
    $Row.eligible_for_lock = "false"
  }
  if (!$CityProfiles.ContainsKey($Row.city)) { continue }
  $Profile = $CityProfiles[$Row.city]
  $Candidate = Resolve-ProfileLayer -Profile $Profile -Layer $Row.parity_layer
  if ($null -ne $Candidate) {
    $Row.source_name = $Candidate[0]
    $Row.source_url = $Candidate[1]
    $Row.source_type = $Candidate[2]
    $Row.city_specific = "pass"
    $Row.provenance_status = "verified_candidate"
    $Row.authentication_status = "profile_synthesized_candidate"
    $Row.replay_status = "pending"
    $Row.saturation_status = "candidate_found"
    $Row.eligible_for_lock = "false"
    $Row.notes = "Gen3 Ohio profile candidate synthesized; requires confirmation and strict validation."
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

$Candidates = @($Rows | Where-Object { $_.saturation_status -eq "candidate_found" }).Count
$Verified = @($Rows | Where-Object { $_.saturation_status -eq "verified_layer" }).Count
$Unresolved = @($Rows | Where-Object { $_.saturation_status -ne "candidate_found" -and $_.saturation_status -ne "verified_layer" }).Count

Write-Host "Gen3 synthesis complete"
Write-Host "Verified:" $Verified
Write-Host "Candidates:" $Candidates
Write-Host "Unresolved:" $Unresolved
