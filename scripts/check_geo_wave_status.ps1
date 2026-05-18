param(
  [string]$WaveDir = "ops\geo_provenance\wave_001"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $WaveDir)) {
  throw "Wave directory not found: $WaveDir"
}

$CityDirs = Get-ChildItem $WaveDir -Directory |
  Where-Object {
    $_.Name -notmatch "^raw$|^normalized$"
  }

$Results = @()

foreach ($CityDir in $CityDirs) {

  $SessionFile = Join-Path $CityDir.FullName "ingestion_session_001.json"

  $CanonicalName = $CityDir.Name

  if (Test-Path $SessionFile) {
    try {
      $Session = Get-Content $SessionFile -Raw | ConvertFrom-Json

      if ($Session.canonical_name) {
        $CanonicalName = $Session.canonical_name
      }
    }
    catch {
    }
  }

  $Results += [ordered]@{
    city = $CanonicalName
    workspace = $true
    acquisition_record = Test-Path (Join-Path $CityDir.FullName "acquisition_record_001.json")
    geometry_validation = Test-Path (Join-Path $CityDir.FullName "geometry_validation_001.json")
    normalization_record = Test-Path (Join-Path $CityDir.FullName "normalization_record_001.json")
    topology_manifest_present = Test-Path (Join-Path $WaveDir "wave_001_topology_manifest.json")
    completion_manifest_present = Test-Path (Join-Path $WaveDir "wave_001_completion_manifest.json")
  }
}

$Results | ConvertTo-Json -Depth 8