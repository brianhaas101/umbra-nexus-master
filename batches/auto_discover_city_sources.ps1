param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) {
  throw "Missing checklist CSV: $ChecklistCsv"
}

$Rows = Import-Csv $ChecklistCsv

$DiscoveryPatterns = @{
  "Miami" = @{
    base = "https://www.miamigov.com/"
    open_data = "https://data.miamigov.com/"
    gis = "https://gis.miamigov.com/"
    police = "https://www.miami-police.org/"
    fire = "https://www.miamigov.com/Government/Departments-Organizations/Fire-Rescue"
    parks = "https://www.miamigov.com/Parks-Public-Places"
    permits = "https://www.miamigov.com/Building-Permitting"
    public_works = "https://www.miamigov.com/Government/Departments-Organizations/Resilience-and-Public-Works"
    schools = "https://www3.dadeschools.net/"
    council = "https://www.miamigov.com/Government/City-Officials"
  }

  "Orlando" = @{
    base = "https://www.orlando.gov/"
    open_data = "https://data.cityoforlando.net/"
    gis = "https://www.orlando.gov/Our-Government/Departments-Offices/Information-Technology/GIS"
    police = "https://www.orlando.gov/Public-Safety/OPD"
    fire = "https://www.orlando.gov/Public-Safety/OFD"
    parks = "https://www.orlando.gov/Parks-the-Environment"
    permits = "https://www.orlando.gov/Building-Development"
    public_works = "https://www.orlando.gov/Our-Government/Departments-Offices/Public-Works"
    schools = "https://www.ocps.net/"
    council = "https://www.orlando.gov/Our-Government/Mayor-City-Council"
  }

  "Tampa" = @{
    base = "https://www.tampa.gov/"
    open_data = "https://data.tampa.gov/"
    gis = "https://www.tampa.gov/gis"
    police = "https://www.tampa.gov/police"
    fire = "https://www.tampa.gov/fire-rescue"
    parks = "https://www.tampa.gov/parks-and-recreation"
    permits = "https://www.tampa.gov/construction-services"
    public_works = "https://www.tampa.gov/public-works"
    schools = "https://www.hillsboroughschools.org/"
    council = "https://www.tampa.gov/city-council"
  }

  "Jacksonville" = @{
    base = "https://www.jacksonville.gov/"
    open_data = "https://data.jacksonville.gov/"
    gis = "https://maps.coj.net/"
    police = "https://www.jaxsheriff.org/"
    fire = "https://www.jacksonville.gov/departments/fire-and-rescue"
    parks = "https://www.jacksonville.gov/departments/parks-and-recreation"
    permits = "https://www.jacksonville.gov/departments/planning-and-development"
    public_works = "https://www.jacksonville.gov/departments/public-works"
    schools = "https://dcps.duvalschools.org/"
    council = "https://www.jacksonville.gov/city-council"
  }

  "St Petersburg" = @{
    base = "https://www.stpete.org/"
    open_data = "https://data.stpete.org/"
    gis = "https://egis.stpete.org/"
    police = "https://police.stpete.org/"
    fire = "https://www.stpete.org/residents/public_safety/fire_rescue.php"
    parks = "https://www.stpete.org/residents/parks___recreation/"
    permits = "https://www.stpete.org/business/building_permitting/"
    public_works = "https://www.stpete.org/government/departments/public_works/"
    schools = "https://www.pcsb.org/"
    council = "https://www.stpete.org/government/mayor___city_council/city_council/"
  }
}

function Resolve-LayerSource {
  param($City, $Layer)

  if (!$DiscoveryPatterns.ContainsKey($City)) { return $null }

  $P = $DiscoveryPatterns[$City]

  switch ($Layer) {
    "city_boundary" { return @("Official city GIS/open data portal",$P.gis,"official_gis_portal") }
    "neighborhoods_or_districts" { return @("Official city GIS/open data portal",$P.gis,"official_gis_portal") }
    "council_districts" { return @("Official city council/governance source",$P.council,"official_city_governance") }
    "police_beats_or_reporting_districts" { return @("Official police/public safety source",$P.police,"official_public_safety") }
    "fire_stations_or_service_areas" { return @("Official fire/rescue source",$P.fire,"official_public_safety") }
    "parcels_or_zoning" { return @("Official permits/planning source",$P.permits,"official_planning_permits") }
    "streets_or_transport_corridors" { return @("Official public works source",$P.public_works,"official_public_works") }
    "public_facilities" { return @("Official city GIS/open data portal",$P.gis,"official_gis_portal") }
    "parks" { return @("Official parks source",$P.parks,"official_parks") }
    "schools" { return @("Official local school district source",$P.schools,"official_school_district") }
    "public_safety_incidents_or_calls" { return @("Official open data/public safety source",$P.open_data,"official_open_data") }
    "permits_or_code_enforcement" { return @("Official permits/planning source",$P.permits,"official_planning_permits") }
    "civic_governance" { return @("Official city council/governance source",$P.council,"official_city_governance") }
    "public_works_or_infrastructure" { return @("Official public works source",$P.public_works,"official_public_works") }
    default { return $null }
  }
}

foreach ($Row in $Rows) {
  if ($Row.saturation_status -eq "verified_layer") { continue }

  $Candidate = Resolve-LayerSource -City $Row.city -Layer $Row.parity_layer

  if ($Candidate) {
    $Row.source_name = $Candidate[0]
    $Row.source_url = $Candidate[1]
    $Row.source_type = $Candidate[2]
    $Row.city_specific = "pass"
    $Row.provenance_status = "verified_candidate"
    $Row.authentication_status = "candidate_located_dynamic"
    $Row.replay_status = "pending"
    $Row.saturation_status = "candidate_found"
    $Row.eligible_for_lock = "false"
    $Row.notes = "Dynamic city-local candidate located; requires confirmation."
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

$Candidates = @($Rows | Where-Object { $_.saturation_status -eq "candidate_found" }).Count
$Verified = @($Rows | Where-Object { $_.saturation_status -eq "verified_layer" }).Count
$Total = @($Rows).Count
$Remaining = $Total - $Candidates - $Verified

Write-Host "Dynamic discovery pass complete"
Write-Host "Verified layers:" $Verified
Write-Host "Candidates:" $Candidates
Write-Host "Remaining gaps:" $Remaining
