param(
  [string]$WaveDir = "ops\geo_provenance\wave_001"
)

$ErrorActionPreference = "Stop"

$Cities = @(
  @{ slug = "nyc_real"; name = "New York, NY" },
  @{ slug = "la_real"; name = "Los Angeles, CA" },
  @{ slug = "chicago_real"; name = "Chicago, IL" },
  @{ slug = "houston_real"; name = "Houston, TX" },
  @{ slug = "dc_real"; name = "Washington, DC" }
)

$Results = @()

foreach ($City in $Cities) {
  $CityDir = Join-Path $WaveDir $City.slug

  $Results += [ordered]@{
    city = $City.name
    workspace = Test-Path $CityDir
    acquisition_record = Test-Path (Join-Path $CityDir "acquisition_record_001.json")
    geometry_validation = Test-Path (Join-Path $CityDir "geometry_validation_001.json")
    normalization_record = Test-Path (Join-Path $CityDir "normalization_record_001.json")
  }
}

$Results | ConvertTo-Json -Depth 8