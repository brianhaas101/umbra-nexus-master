param(
  [string]$GeoJsonPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $GeoJsonPath)) {
  throw "GeoJSON not found: $GeoJsonPath"
}

$GeoJson = Get-Content $GeoJsonPath -Raw | ConvertFrom-Json

$FeatureCount = $GeoJson.features.Count
$GeometryTypes = @()
$AllLon = New-Object System.Collections.Generic.List[double]
$AllLat = New-Object System.Collections.Generic.List[double]

foreach ($Feature in $GeoJson.features) {
  $Geometry = $Feature.geometry
  if ($null -eq $Geometry) { continue }

  $GeometryTypes += $Geometry.type

  if ($Geometry.type -eq "Polygon") {
    foreach ($Ring in $Geometry.coordinates) {
      foreach ($Point in $Ring) {
        $AllLon.Add([double]$Point[0])
        $AllLat.Add([double]$Point[1])
      }
    }
  }
  elseif ($Geometry.type -eq "MultiPolygon") {
    foreach ($Polygon in $Geometry.coordinates) {
      foreach ($Ring in $Polygon) {
        foreach ($Point in $Ring) {
          $AllLon.Add([double]$Point[0])
          $AllLat.Add([double]$Point[1])
        }
      }
    }
  }
  else {
    throw "Unsupported geometry type: $($Geometry.type)"
  }
}

$BBox = @(
  ($AllLon | Measure-Object -Minimum).Minimum,
  ($AllLat | Measure-Object -Minimum).Minimum,
  ($AllLon | Measure-Object -Maximum).Maximum,
  ($AllLat | Measure-Object -Maximum).Maximum
)

$ArtifactHash = (Get-FileHash $GeoJsonPath -Algorithm SHA256).Hash

$Result = [PSCustomObject]@{
  feature_count = $FeatureCount
  geometry_types = @($GeometryTypes | Sort-Object -Unique)
  bbox = $BBox
  artifact_sha256 = $ArtifactHash
  metadata_extraction_mode = "geometry_type_aware_bbox"
}

$Result | ConvertTo-Json -Depth 8
