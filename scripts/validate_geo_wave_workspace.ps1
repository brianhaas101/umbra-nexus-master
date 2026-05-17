$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\wave_001"
$ManifestPath = Join-Path $WaveDir "intake_manifest.json"
$ReportDir = "logs\founder_geospatial_audit"
$Report = Join-Path $ReportDir "geo_wave_workspace_validation.txt"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

"UMBRA NEXUS - GEO WAVE WORKSPACE VALIDATION" | Out-File -Encoding utf8 $Report
"Generated: $(Get-Date -Format o)" | Out-File -Encoding utf8 $Report -Append
"" | Out-File -Encoding utf8 $Report -Append

$RequiredDirs = @(
  "$WaveDir\raw",
  "$WaveDir\normalized",
  "$WaveDir\replay"
)

$RequiredFiles = @(
  $ManifestPath,
  "ops\geo_provenance\wave_001_sources.json",
  "ops\geo_provenance\README.md",
  "docs\founder_geospatial_verification_contract.md",
  "docs\founder_geospatial_ingestion_pipeline.md"
)

"=== DIRECTORY CHECK ===" | Out-File -Encoding utf8 $Report -Append
foreach ($Dir in $RequiredDirs) {
  if (Test-Path $Dir) {
    "PASS directory exists: $Dir" | Out-File -Encoding utf8 $Report -Append
  } else {
    "FAIL missing directory: $Dir" | Out-File -Encoding utf8 $Report -Append
  }
}

"" | Out-File -Encoding utf8 $Report -Append
"=== FILE CHECK ===" | Out-File -Encoding utf8 $Report -Append
foreach ($File in $RequiredFiles) {
  if (Test-Path $File) {
    "PASS file exists: $File" | Out-File -Encoding utf8 $Report -Append
  } else {
    "FAIL missing file: $File" | Out-File -Encoding utf8 $Report -Append
  }
}

"" | Out-File -Encoding utf8 $Report -Append
"=== MANIFEST CHECK ===" | Out-File -Encoding utf8 $Report -Append

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

"wave_id: $($Manifest.wave_id)" | Out-File -Encoding utf8 $Report -Append
"mutation_allowed: $($Manifest.mutation_allowed)" | Out-File -Encoding utf8 $Report -Append
"crs_required: $($Manifest.crs_required)" | Out-File -Encoding utf8 $Report -Append
"status: $($Manifest.status)" | Out-File -Encoding utf8 $Report -Append
"city_count: $($Manifest.cities.Count)" | Out-File -Encoding utf8 $Report -Append

"" | Out-File -Encoding utf8 $Report -Append
"=== HASHES ===" | Out-File -Encoding utf8 $Report -Append

foreach ($File in $RequiredFiles) {
  if (Test-Path $File) {
    Get-FileHash $File -Algorithm SHA256 |
      Format-List |
      Out-File -Encoding utf8 $Report -Append
  }
}

Write-Host "Workspace validation complete:"
Write-Host $Report