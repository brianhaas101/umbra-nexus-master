param(
  [string]$GeoJsonPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $GeoJsonPath)) {
  throw "GeoJSON file does not exist: $GeoJsonPath"
}

$GeoJson = Get-Content $GeoJsonPath -Raw | ConvertFrom-Json

if ($GeoJson.features.Count -lt 1) {
  throw "GeoJSON has no features"
}

$Geometry = $GeoJson.features[0].geometry

if ($Geometry.type -ne "Polygon") {
  throw "Only Polygon geometry currently supported"
}

$Coords = $Geometry.coordinates[0]

$Lons = @()
$Lats = @()

foreach ($Pair in $Coords) {
  $Lons += [double]$Pair[0]
  $Lats += [double]$Pair[1]
}

$MinLon = ($Lons | Measure-Object -Minimum).Minimum
$MaxLon = ($Lons | Measure-Object -Maximum).Maximum

$MinLat = ($Lats | Measure-Object -Minimum).Minimum
$MaxLat = ($Lats | Measure-Object -Maximum).Maximum

$BBox = @(
  $MinLon,
  $MinLat,
  $MaxLon,
  $MaxLat
)

$GeometryJson = (
  $Geometry | ConvertTo-Json -Depth 20 -Compress
)

$Bytes = [System.Text.Encoding]::UTF8.GetBytes($GeometryJson)

$Sha256 = (
  [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA256]::Create().ComputeHash($Bytes)
  )
).Replace("-", "")

$Result = [PSCustomObject]@{
  geometry_type = $Geometry.type
  bbox = $BBox
  geometry_sha256 = $Sha256
}

Write-Host ""
$Result | ConvertTo-Json -Depth 8
Write-Host ""