param(
  [string]$GeoJsonPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $GeoJsonPath)) {
  throw "Normalized GeoJSON not found: $GeoJsonPath"
}

$GeoJson = Get-Content $GeoJsonPath -Raw | ConvertFrom-Json

if ($GeoJson.normalized_crs -ne "EPSG:4326") {
  throw "Invalid normalized CRS"
}

if (-not $GeoJson.features) {
  throw "No features found"
}

foreach ($Feature in $GeoJson.features) {

  if ($null -eq $Feature.geometry) {
    throw "Null geometry detected"
  }

  $Type = $Feature.geometry.type

  if ($Type -notin @("Polygon", "MultiPolygon")) {
    throw "Unsupported geometry type: $Type"
  }
}

Write-Host ""
Write-Host "NORMALIZED GEOJSON VALIDATION PASS"
Write-Host ""