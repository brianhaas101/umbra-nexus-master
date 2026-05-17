param(
  [string]$Csv = ".\data\clients\black_dragon\reviewed_intake\batch_264C_verified_starter_sources.csv"
)

$ErrorActionPreference = "Stop"

$OutDir = ".\logs\black_dragon\tier2_hydration"
New-Item -ItemType Directory -Force $OutDir | Out-Null

if (!(Test-Path $Csv)) {
  throw "Missing CSV: $Csv"
}

$Rows = Import-Csv $Csv

$Eligible = $Rows | Where-Object {
  $_.city_locality_check -eq "pass" -and
  $_.manual_review_status -eq "reviewed" -and
  $_.provenance_status -eq "verified" -and
  $_.eligible_for_import -eq "true" -and
  $_.source_url -match "^https?://"
}

$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Audit = [ordered]@{
  batch = "263"
  purpose = "city_local_csv_to_reviewed_intake_importer"
  source_csv = $Csv
  run_id = $Stamp
  total_rows = @($Rows).Count
  imported_count = @($Eligible).Count
  rejected_count = @($Rows).Count - @($Eligible).Count
  imported_sources = @($Eligible)
}

$Path = Join-Path $OutDir "batch_263_importer_${Stamp}.json"
$Audit | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $Path

Write-Host "Batch 263 complete:"
Write-Host $Path
Write-Host "Imported:" @($Eligible).Count
Write-Host "Rejected:" (@($Rows).Count - @($Eligible).Count)
