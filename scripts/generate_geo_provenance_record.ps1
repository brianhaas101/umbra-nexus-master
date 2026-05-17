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

$Record = [PSCustomObject]@{
  city_id = $CityId
  canonical_name = $CanonicalName
  source_name = $SourceName
  source_type = $SourceType
  source_url = $SourceUrl
  source_license = $SourceLicense
  retrieval_timestamp = (Get-Date -Format o)
  raw_artifact_path = $RawArtifactPath
  raw_artifact_sha256 = $RawHash
  geometry_format = $GeometryFormat
  original_crs = $OriginalCRS
  normalized_crs = "EPSG:4326"
  bbox = @()
  geometry_sha256 = $null
  spatial_confidence_class = "E"
  verification_status = "RAW_INTAKE_ONLY"
  mutation_allowed = $false
}

$SafeCityId = $CityId.Replace(":", "_")
$OutPath = Join-Path $OutDir "$SafeCityId.provenance.json"

$Record |
  ConvertTo-Json -Depth 8 |
  Out-File -Encoding utf8 $OutPath

Write-Host ""
Write-Host "Generated provenance record:"
Write-Host $OutPath
Write-Host ""
