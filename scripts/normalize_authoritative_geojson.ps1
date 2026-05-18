param(
  [string]$InputGeoJson,
  [string]$OutputGeoJson
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputGeoJson)) {
  throw "Input GeoJSON not found: $InputGeoJson"
}

$GeoJson = Get-Content $InputGeoJson -Raw | ConvertFrom-Json

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

$Normalized = [PSCustomObject]@{
  type = "FeatureCollection"
  normalization_standard = "UMBRA_GEO_NORMALIZATION_V1"
  normalized_crs = "EPSG:4326"
  features = $GeoJson.features
}

$Normalized |
  ConvertTo-Json -Depth 100 |
  Out-File -Encoding utf8 $OutputGeoJson

$Hash = (
  Get-FileHash $OutputGeoJson -Algorithm SHA256
).Hash

Write-Host ""
Write-Host "Normalization complete:"
Write-Host $OutputGeoJson
Write-Host ""
Write-Host "Normalized SHA256:"
Write-Host $Hash
Write-Host ""