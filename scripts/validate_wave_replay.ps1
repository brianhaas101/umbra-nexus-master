param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"

$NormalizationRecords = Get-ChildItem $WaveDir -Recurse -File -Filter "normalization_record_001.json"

$Results = @()

foreach ($RecordFile in $NormalizationRecords) {
  $Record = Get-Content $RecordFile.FullName -Raw | ConvertFrom-Json

  $Path = $Record.normalized_artifact
  $Expected = $Record.normalized_artifact_sha256

  if (!(Test-Path $Path)) {
    throw "Missing normalized artifact: $Path"
  }

  $Actual = (Get-FileHash $Path -Algorithm SHA256).Hash

  if ($Actual -ne $Expected) {
    throw "Replay hash mismatch: $Path"
  }

  $Results += [ordered]@{
    city_id = $Record.city_id
    canonical_name = $Record.canonical_name
    normalized_artifact = $Path
    expected_sha256 = $Expected
    actual_sha256 = $Actual
    replay_status = "PASS"
  }
}

$ReportDir = Join-Path $WaveDir "reports"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$OutPath = Join-Path $ReportDir "wave_replay_validation_report.json"

$Report = [ordered]@{
  wave_id = $WaveId
  replay_status = "PASS"
  checked_at_utc = (Get-Date).ToUniversalTime().ToString("o")
  checked_count = $Results.Count
  results = $Results
}

$Report | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 $OutPath

Write-Host ""
Write-Host "Wave replay validation PASS:"
Write-Host $OutPath
Write-Host ""