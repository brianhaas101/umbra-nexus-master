param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId,

  [Parameter(Mandatory = $true)]
  [string]$CitySlug,

  [Parameter(Mandatory = $true)]
  [string]$SourceFileName
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"

$RawDir = "$WaveDir\raw"
$NormalizedDir = "$WaveDir\normalized"
$CityDir = "$WaveDir\$CitySlug"

if (!(Test-Path $RawDir)) {
  New-Item -ItemType Directory -Force -Path $RawDir | Out-Null
}

if (!(Test-Path $NormalizedDir)) {
  New-Item -ItemType Directory -Force -Path $NormalizedDir | Out-Null
}

if (!(Test-Path $CityDir)) {
  throw "Missing city workspace: $CityDir"
}

$Download = Get-ChildItem "$env:USERPROFILE\Downloads" -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $Download) {
  throw "No downloadable artifact found in Downloads"
}

$RawPath = Join-Path $RawDir $SourceFileName

Move-Item -Force $Download.FullName $RawPath

$RawHash = (Get-FileHash $RawPath -Algorithm SHA256).Hash

Write-Host ""
Write-Host "RAW SHA256:"
Write-Host $RawHash
Write-Host ""

powershell -ExecutionPolicy Bypass -File `
  scripts\extract_authoritative_geojson_metadata.ps1 `
  -GeoJsonPath $RawPath

$NormalizedPath = Join-Path `
  $NormalizedDir `
  ($SourceFileName.Replace("_source.geojson", "_normalized.geojson"))

powershell -ExecutionPolicy Bypass -File `
  scripts\normalize_authoritative_geojson.ps1 `
  -InputGeoJson $RawPath `
  -OutputGeoJson $NormalizedPath

$NormalizedHash = (
  Get-FileHash $NormalizedPath -Algorithm SHA256
).Hash

Write-Host ""
Write-Host "NORMALIZED SHA256:"
Write-Host $NormalizedHash
Write-Host ""

powershell -ExecutionPolicy Bypass -File `
  scripts\verify_normalized_geojson_replay.ps1 `
  -GeoJsonPath $NormalizedPath `
  -ExpectedHash $NormalizedHash

powershell -ExecutionPolicy Bypass -File `
  scripts\validate_normalized_geojson.ps1 `
  -GeoJsonPath $NormalizedPath

powershell -ExecutionPolicy Bypass -File `
  scripts\validate_geojson_topology.ps1 `
  -GeoJsonPath $NormalizedPath

Write-Host ""
Write-Host "CITY PIPELINE COMPLETE:"
Write-Host $CitySlug
Write-Host ""