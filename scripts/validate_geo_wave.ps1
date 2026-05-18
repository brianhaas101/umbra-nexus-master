param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"

if (!(Test-Path $WaveDir)) {
  throw "Wave directory not found: $WaveDir"
}

$ExcludedDirs = @(
  "raw",
  "normalized",
  "replay",
  "manifests",
  "reports"
)

$CityDirs = Get-ChildItem $WaveDir -Directory |
  Where-Object {
    $ExcludedDirs -notcontains $_.Name
  }

$Results = @()

foreach ($CityDir in $CityDirs) {
  $SessionPath = Join-Path $CityDir.FullName "ingestion_session_001.json"
  $NormalizationPath = Join-Path $CityDir.FullName "normalization_record_001.json"

  if (!(Test-Path $SessionPath)) {
    throw "Missing session file: $SessionPath"
  }

  if (!(Test-Path $NormalizationPath)) {
    throw "Missing normalization record: $NormalizationPath"
  }

  $Session = Get-Content $SessionPath -Raw | ConvertFrom-Json
  $Normalization = Get-Content $NormalizationPath -Raw | ConvertFrom-Json

  $NormalizedArtifact = $Normalization.normalized_artifact
  $ExpectedHash = $Normalization.normalized_artifact_sha256

  if (!(Test-Path $NormalizedArtifact)) {
    throw "Missing normalized artifact: $NormalizedArtifact"
  }

  powershell -ExecutionPolicy Bypass -File scripts\verify_normalized_geojson_replay.ps1 `
    -GeoJsonPath $NormalizedArtifact `
    -ExpectedHash $ExpectedHash

  powershell -ExecutionPolicy Bypass -File scripts\validate_normalized_geojson.ps1 `
    -GeoJsonPath $NormalizedArtifact

  powershell -ExecutionPolicy Bypass -File scripts\validate_geojson_topology.ps1 `
    -GeoJsonPath $NormalizedArtifact

  $Results += [ordered]@{
    city_id = $Session.city_id
    canonical_name = $Session.canonical_name
    replay_validation = "PASS"
    normalized_validation = "PASS"
    topology_validation = "PASS"
    normalized_artifact_sha256 = $ExpectedHash
  }
}

$ReportDir = Join-Path $WaveDir "reports"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$ReportPath = Join-Path $ReportDir "wave_validation_report.json"

$Report = [ordered]@{
  wave_id = $WaveId
  validation_status = "PASS"
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("o")
  city_count = $Results.Count
  cities = $Results
}

$Report | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 $ReportPath

Write-Host ""
Write-Host "Wave validation complete:"
Write-Host $ReportPath
Write-Host ""