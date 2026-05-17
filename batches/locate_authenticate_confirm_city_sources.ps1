param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) {
  throw "Missing checklist CSV: $ChecklistCsv"
}

$Rows = Import-Csv $ChecklistCsv

$SourceMap = @{
  # Dallas
  "Dallas|city_boundary" = @("Dallas City GIS Services","https://gis.dallascityhall.com/","official_gis_portal")
  "Dallas|neighborhoods_or_districts" = @("Dallas Neighborhoods Plus","https://dallascityhall.com/departments/pnv/Pages/Neighborhood-Plus.aspx","official_city_page")
  "Dallas|council_districts" = @("Dallas City Council Districts","https://dallascityhall.com/government/citycouncil/Pages/default.aspx","official_city_page")
  "Dallas|police_beats_or_reporting_districts" = @("Dallas Police Department","https://dallaspolice.net/","official_public_safety")
  "Dallas|fire_stations_or_service_areas" = @("Dallas Fire-Rescue","https://dallascityhall.com/departments/fire-rescue/Pages/default.aspx","official_public_safety")
  "Dallas|parcels_or_zoning" = @("Dallas Zoning","https://dallascityhall.com/departments/sustainabledevelopment/planning/Pages/zoning.aspx","official_city_page")
  "Dallas|parks" = @("Dallas Park and Recreation","https://www.dallasparks.org/","official_city_page")
  "Dallas|public_safety_incidents_or_calls" = @("Dallas OpenData Public Safety","https://www.dallasopendata.com/","official_open_data")
  "Dallas|civic_governance" = @("Dallas City Council","https://dallascityhall.com/government/citycouncil/Pages/default.aspx","official_city_page")

  # Houston
  "Houston|city_boundary" = @("Houston GIS Open Data","https://cohgis-mycity.opendata.arcgis.com/","official_gis_portal")
  "Houston|neighborhoods_or_districts" = @("Houston Super Neighborhoods","https://www.houstontx.gov/superneighborhoods/","official_city_page")
  "Houston|council_districts" = @("Houston City Council","https://www.houstontx.gov/council/","official_city_page")
  "Houston|police_beats_or_reporting_districts" = @("Houston Police Department","https://www.houstontx.gov/police/","official_public_safety")
  "Houston|fire_stations_or_service_areas" = @("Houston Fire Department","https://www.houstontx.gov/fire/","official_public_safety")
  "Houston|parcels_or_zoning" = @("Houston Planning and Development","https://www.houstontx.gov/planning/","official_city_page")
  "Houston|parks" = @("Houston Parks and Recreation","https://www.houstontx.gov/parks/","official_city_page")
  "Houston|public_safety_incidents_or_calls" = @("Houston Police Department Crime Statistics","https://www.houstontx.gov/police/cs/index.htm","official_public_safety")
  "Houston|civic_governance" = @("Houston City Council","https://www.houstontx.gov/council/","official_city_page")

  # Austin
  "Austin|city_boundary" = @("Austin Open Data Portal","https://data.austintexas.gov/","official_open_data")
  "Austin|neighborhoods_or_districts" = @("Austin Neighborhood Planning","https://www.austintexas.gov/department/neighborhood-planning","official_city_page")
  "Austin|council_districts" = @("Austin City Council","https://www.austintexas.gov/austin-city-council","official_city_page")
  "Austin|police_beats_or_reporting_districts" = @("Austin Police Department","https://www.austintexas.gov/department/police","official_public_safety")
  "Austin|fire_stations_or_service_areas" = @("Austin Fire Department","https://www.austintexas.gov/department/fire","official_public_safety")
  "Austin|parcels_or_zoning" = @("Austin Zoning","https://www.austintexas.gov/department/zoning","official_city_page")
  "Austin|parks" = @("Austin Parks and Recreation","https://www.austintexas.gov/department/parks-and-recreation","official_city_page")
  "Austin|public_safety_incidents_or_calls" = @("Austin Police Department Incident Reports","https://data.austintexas.gov/Public-Safety/","official_open_data")
  "Austin|civic_governance" = @("Austin City Council","https://www.austintexas.gov/austin-city-council","official_city_page")

  # Fort Worth
  "Fort Worth|city_boundary" = @("Fort Worth Open Data","https://data.fortworthtexas.gov/","official_open_data")
  "Fort Worth|neighborhoods_or_districts" = @("Fort Worth Neighborhoods","https://www.fortworthtexas.gov/departments/neighborhoods","official_city_page")
  "Fort Worth|council_districts" = @("Fort Worth City Council","https://www.fortworthtexas.gov/government/elected-officials/city-council","official_city_page")
  "Fort Worth|police_beats_or_reporting_districts" = @("Fort Worth Police Department","https://police.fortworthtexas.gov/","official_public_safety")
  "Fort Worth|fire_stations_or_service_areas" = @("Fort Worth Fire Department","https://www.fortworthtexas.gov/departments/fire","official_public_safety")
  "Fort Worth|parcels_or_zoning" = @("Fort Worth Zoning","https://www.fortworthtexas.gov/departments/development-services/zoning","official_city_page")
  "Fort Worth|parks" = @("Fort Worth Park & Recreation","https://www.fortworthtexas.gov/departments/parks","official_city_page")
  "Fort Worth|public_safety_incidents_or_calls" = @("Fort Worth Police Crime Data","https://police.fortworthtexas.gov/Public/crime-data","official_public_safety")
  "Fort Worth|civic_governance" = @("Fort Worth City Council","https://www.fortworthtexas.gov/government/elected-officials/city-council","official_city_page")

  # El Paso
  "El Paso|city_boundary" = @("El Paso Open Data","https://data.elpasotexas.gov/","official_open_data")
  "El Paso|neighborhoods_or_districts" = @("El Paso Neighborhood Services","https://www.elpasotexas.gov/community-and-human-development/neighborhood-services/","official_city_page")
  "El Paso|council_districts" = @("El Paso City Council","https://www.elpasotexas.gov/city-council/","official_city_page")
  "El Paso|police_beats_or_reporting_districts" = @("El Paso Police Department","https://www.elpasotexas.gov/police-department/","official_public_safety")
  "El Paso|fire_stations_or_service_areas" = @("El Paso Fire Department","https://www.elpasotexas.gov/fire-department/","official_public_safety")
  "El Paso|parcels_or_zoning" = @("El Paso Planning and Inspections","https://www.elpasotexas.gov/planning-and-inspections/","official_city_page")
  "El Paso|parks" = @("El Paso Parks and Recreation","https://www.elpasotexas.gov/parks-and-recreation/","official_city_page")
  "El Paso|public_safety_incidents_or_calls" = @("El Paso Police Crime Information","https://www.elpasotexas.gov/police-department/crime-information/","official_public_safety")
  "El Paso|civic_governance" = @("El Paso City Council","https://www.elpasotexas.gov/city-council/","official_city_page")
}

foreach ($Row in $Rows) {
  if ($Row.saturation_status -eq "verified_layer") { continue }

  $Key = "$($Row.city)|$($Row.parity_layer)"

  if ($SourceMap.ContainsKey($Key)) {
    $Candidate = $SourceMap[$Key]

    $Row.source_name = $Candidate[0]
    $Row.source_url = $Candidate[1]
    $Row.source_type = $Candidate[2]
    $Row.city_specific = "pass"
    $Row.provenance_status = "verified_candidate"
    $Row.authentication_status = "candidate_located"
    $Row.replay_status = "pending"
    $Row.saturation_status = "candidate_found"
    $Row.eligible_for_lock = "false"
    $Row.notes = "City-local official candidate located; requires confirmation."
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

$Candidates = @($Rows | Where-Object { $_.saturation_status -eq "candidate_found" }).Count
$Verified = @($Rows | Where-Object { $_.saturation_status -eq "verified_layer" }).Count
$Total = @($Rows).Count
$Remaining = $Total - $Candidates - $Verified

Write-Host "Locator pass complete"
Write-Host "Verified layers:" $Verified
Write-Host "New candidates:" $Candidates
Write-Host "Remaining gaps:" $Remaining
