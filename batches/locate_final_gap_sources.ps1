param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) {
  throw "Missing checklist CSV: $ChecklistCsv"
}

$Rows = Import-Csv $ChecklistCsv

$FinalGapMap = @{
  "Dallas|streets_or_transport_corridors" = @("Dallas Transportation and Public Works","https://dallascityhall.com/departments/public-works/Pages/default.aspx","official_public_works")
  "Dallas|public_facilities" = @("Dallas City GIS Services","https://gis.dallascityhall.com/","official_gis_portal")
  "Dallas|schools" = @("Dallas ISD","https://www.dallasisd.org/","official_school_district")
  "Dallas|permits_or_code_enforcement" = @("Dallas Right-of-Way Permit Management","https://dallascityhall.com/departments/public-works/Pages/right-of-way-management.aspx","official_permits")
  "Dallas|public_works_or_infrastructure" = @("Dallas Transportation and Public Works","https://dallascityhall.com/departments/public-works/Pages/default.aspx","official_public_works")

  "Houston|streets_or_transport_corridors" = @("Houston Public Works","https://www.houstonpublicworks.org/","official_public_works")
  "Houston|public_facilities" = @("Houston GIS Open Data","https://cohgis-mycity.opendata.arcgis.com/","official_gis_portal")
  "Houston|schools" = @("Houston ISD","https://www.houstonisd.org/","official_school_district")
  "Houston|permits_or_code_enforcement" = @("Houston Permitting Center","https://www.houstonpermittingcenter.org/","official_permits")
  "Houston|public_works_or_infrastructure" = @("Houston Public Works","https://www.houstonpublicworks.org/","official_public_works")

  "Austin|streets_or_transport_corridors" = @("Austin Transportation and Public Works","https://www.austintexas.gov/transportation-public-works","official_public_works")
  "Austin|public_facilities" = @("Austin Open Data Portal","https://data.austintexas.gov/","official_open_data")
  "Austin|schools" = @("Austin ISD","https://www.austinisd.org/","official_school_district")
  "Austin|permits_or_code_enforcement" = @("Austin Development Services","https://www.austintexas.gov/department/development-services","official_permits")
  "Austin|public_works_or_infrastructure" = @("Austin Transportation and Public Works","https://www.austintexas.gov/transportation-public-works","official_public_works")

  "Fort Worth|streets_or_transport_corridors" = @("Fort Worth Transportation and Public Works","https://www.fortworthtexas.gov/departments/tpw","official_public_works")
  "Fort Worth|public_facilities" = @("Fort Worth Open Data","https://data.fortworthtexas.gov/","official_open_data")
  "Fort Worth|schools" = @("Fort Worth ISD","https://www.fwisd.org/","official_school_district")
  "Fort Worth|permits_or_code_enforcement" = @("Fort Worth Permits","https://www.fortworthtexas.gov/departments/development-services/permits","official_permits")
  "Fort Worth|public_works_or_infrastructure" = @("Fort Worth Transportation and Public Works","https://www.fortworthtexas.gov/departments/tpw","official_public_works")

  "El Paso|streets_or_transport_corridors" = @("El Paso Streets and Maintenance","https://www.elpasotexas.gov/streets-and-maintenance/","official_public_works")
  "El Paso|public_facilities" = @("El Paso Open Data","https://data.elpasotexas.gov/","official_open_data")
  "El Paso|schools" = @("El Paso ISD","https://www.episd.org/","official_school_district")
  "El Paso|permits_or_code_enforcement" = @("El Paso Planning and Inspections","https://www.elpasotexas.gov/planning-and-inspections/","official_permits")
  "El Paso|public_works_or_infrastructure" = @("El Paso Streets and Maintenance","https://www.elpasotexas.gov/streets-and-maintenance/","official_public_works")
}

foreach ($Row in $Rows) {
  if ($Row.saturation_status -eq "verified_layer") { continue }

  $Key = "$($Row.city)|$($Row.parity_layer)"

  if ($FinalGapMap.ContainsKey($Key)) {
    $Candidate = $FinalGapMap[$Key]

    $Row.source_name = $Candidate[0]
    $Row.source_url = $Candidate[1]
    $Row.source_type = $Candidate[2]
    $Row.city_specific = "pass"
    $Row.provenance_status = "verified_candidate"
    $Row.authentication_status = "candidate_located"
    $Row.replay_status = "pending"
    $Row.saturation_status = "candidate_found"
    $Row.eligible_for_lock = "false"
    $Row.notes = "Final gap candidate located; requires confirmation."
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistCsv

Write-Host "Final gap locator pass complete"
Write-Host "Candidates now:" (@($Rows | Where-Object { $_.saturation_status -eq "candidate_found" }).Count)
Write-Host "Verified now:" (@($Rows | Where-Object { $_.saturation_status -eq "verified_layer" }).Count)
