param(
  [string]$CityId,
  [string]$CanonicalName,
  [string]$SourceName,
  [string]$SourceType,
  [string]$SourceUrl,
  [string]$SourceLicense,
  [string]$RawArtifactPath,
  [string]$GeometryFormat,
  [string]$OriginalCRS
)

$ErrorActionPreference = "Stop"

$OutDir = "ops\geo_provenance\wave_001\replay"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if (-not (Test-Path $RawArtifactPath)) {
  throw "Raw artifact does not exist: $RawArtifactPath"
}

$RawHash = (
  Get-FileHash $RawArtifactPath -Algorithm SHA256
).Hash

$GeoJson = Get-Content $RawArtifactPath -Raw | ConvertFrom-Json

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

$GeometryBytes = (
  [System.Text.Encoding]::UTF8.GetBytes($GeometryJson)
)

$GeometrySha256 = (
  [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA256]::Create().ComputeHash($GeometryBytes)
  )
).Replace("-", "")

$Record = [PSCustomObject]@{
  city_id = $CityId
  canonical_name = $CanonicalName

  source_name = $SourceName
  source_type = $SourceType
  source_url = $SourceUrl
  source_license = $SourceLicense

  retrieval_timestamp = (
    Get-Date -Format o
  )

  raw_artifact_path = $RawArtifactPath
  raw_artifact_sha256 = $RawHash

  geometry_format = $GeometryFormat

  original_crs = $OriginalCRS
  normalized_crs = "EPSG:4326"

  bbox = $BBox

  geometry_sha256 = $GeometrySha256

  spatial_confidence_class = "D"

  verification_status = "GEOMETRY_EXTRACTED"

  mutation_allowed = $false
}

$SafeCityId = $CityId.Replace(":", "_")

$OutPath = Join-Path `
  $OutDir `
  "$SafeCityId.provenance.json"

$Record |
  ConvertTo-Json -Depth 8 |
  Out-File -Encoding utf8 $OutPath

Write-Host ""
Write-Host "Generated provenance record:"
Write-Host $OutPath
Write-Host ""