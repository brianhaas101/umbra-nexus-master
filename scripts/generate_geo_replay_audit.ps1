param(
  [string]$ReplayDir = "ops\geo_provenance\wave_001\replay"
)

$ErrorActionPreference = "Stop"

$ReportDir = "logs\founder_geospatial_audit"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$ReportPath = Join-Path `
  $ReportDir `
  "geo_replay_audit.txt"

"UMBRA NEXUS - GEO REPLAY AUDIT" |
  Out-File -Encoding utf8 $ReportPath

"Generated: $(Get-Date -Format o)" |
  Out-File -Encoding utf8 $ReportPath -Append

"" |
  Out-File -Encoding utf8 $ReportPath -Append

$Files = Get-ChildItem `
  -Path $ReplayDir `
  -Filter "*.provenance.json"

if ($Files.Count -eq 0) {
  "FAIL: no provenance replay records found" |
    Out-File -Encoding utf8 $ReportPath -Append

  Write-Host ""
  Write-Host "Replay audit failed"
  Write-Host $ReportPath
  Write-Host ""

  exit 1
}

foreach ($File in $Files) {

  "=== RECORD ===" |
    Out-File -Encoding utf8 $ReportPath -Append

  "Path: $($File.FullName)" |
    Out-File -Encoding utf8 $ReportPath -Append

  $Record = Get-Content `
    $File.FullName `
    -Raw |
    ConvertFrom-Json

  "city_id: $($Record.city_id)" |
    Out-File -Encoding utf8 $ReportPath -Append

  "canonical_name: $($Record.canonical_name)" |
    Out-File -Encoding utf8 $ReportPath -Append

  "verification_status: $($Record.verification_status)" |
    Out-File -Encoding utf8 $ReportPath -Append

  "normalized_crs: $($Record.normalized_crs)" |
    Out-File -Encoding utf8 $ReportPath -Append

  "geometry_sha256: $($Record.geometry_sha256)" |
    Out-File -Encoding utf8 $ReportPath -Append

  "raw_artifact_sha256: $($Record.raw_artifact_sha256)" |
    Out-File -Encoding utf8 $ReportPath -Append

  if ($Record.mutation_allowed -ne $false) {
    "FAIL mutation_allowed not false" |
      Out-File -Encoding utf8 $ReportPath -Append
  }
  else {
    "PASS mutation lock intact" |
      Out-File -Encoding utf8 $ReportPath -Append
  }

  "" |
    Out-File -Encoding utf8 $ReportPath -Append
}

Write-Host ""
Write-Host "Replay audit complete:"
Write-Host $ReportPath
Write-Host ""