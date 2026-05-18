param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"
$CitiesPath = "$WaveDir\wave_cities.json"

if (!(Test-Path $CitiesPath)) {
  throw "Missing wave city definition file: $CitiesPath"
}

$Cities = Get-Content $CitiesPath -Raw | ConvertFrom-Json

foreach ($City in $Cities) {
  $CityDir = Join-Path $WaveDir $City.slug

  if (!(Test-Path $CityDir)) {
    throw "Missing city workspace: $CityDir"
  }

  $SearchTerms = @(
    "$($City.canonical_name) official city limits GIS",
    "$($City.canonical_name) city boundary GIS",
    "$($City.canonical_name) municipal boundary ArcGIS",
    "$($City.canonical_name) open data city limits",
    "$($City.canonical_name) administrative boundary feature service"
  )

  $Review = [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    slug = $City.slug
    wave_id = $WaveId
    review_status = "PENDING_FOUNDER_REVIEW"
    approval_status = "NONE_APPROVED"
    search_terms = $SearchTerms
    candidates = @()
    rejection_keywords = @(
      "council district",
      "neighborhood",
      "zip code",
      "police",
      "fire",
      "school",
      "ward",
      "county",
      "annexation",
      "historic",
      "parcel",
      "zoning"
    )
    approval_requirements = @(
      "official municipal publisher",
      "current city boundary or city limits",
      "polygon or multipolygon geometry",
      "downloadable GeoJSON or FeatureServer query endpoint",
      "not district/neighborhood/annexation/history layer"
    )
  }

  $OutPath = Join-Path $CityDir "source_candidate_review.json"

  $Review |
    ConvertTo-Json -Depth 10 |
    Out-File -Encoding utf8 $OutPath

  Write-Host "Created review scaffold:"
  Write-Host $OutPath
}

Write-Host ""
Write-Host "Source discovery review scaffolds created for:"
Write-Host $WaveId
Write-Host ""