param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"

$CitiesPath = "ops\geo_provenance\$WaveId\wave_cities.json"

if (!(Test-Path $CitiesPath)) {
  throw "Missing wave city definition file: $CitiesPath"
}

$Cities = Get-Content $CitiesPath -Raw | ConvertFrom-Json

if ($Cities.Count -ne 5) {
  throw "Wave must contain exactly 5 cities. Found: $($Cities.Count)"
}

New-Item -ItemType Directory -Force -Path $WaveDir | Out-Null

foreach ($City in $Cities) {
  powershell -ExecutionPolicy Bypass -File scripts\bootstrap_geo_city_ingestion.ps1 `
    -CityId $City.city_id `
    -CanonicalName $City.canonical_name `
    -Slug $City.slug
}

Write-Host ""
Write-Host "Geo wave bootstrapped:"
Write-Host $WaveId
Write-Host ""