param(
  [string]$ClientId = "black_dragon",
  [string]$CitiesCsv
)

$ErrorActionPreference = "Stop"

if (-not $CitiesCsv) {
  throw "CitiesCsv required."
}

$Cities = $CitiesCsv -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }

if ($Cities.Count -lt 1) {
  throw "At least 1 city required. Received: $($Cities.Count)"
}

Write-Host "Starting Gen3 strict full-saturation wave:"
Write-Host ($Cities -join ", ")

pwsh -File .\batches\city_replicator_full_saturation.ps1 `
  -ClientId $ClientId `
  -CitiesCsv $CitiesCsv

$LatestAudit = Get-ChildItem ".\logs\$ClientId\full_saturation\wave_*_full_saturation_audit.json" |
  Sort-Object LastWriteTime |
  Select-Object -Last 1

$Audit = Get-Content $LatestAudit.FullName -Raw | ConvertFrom-Json
$ChecklistCsv = $Audit.checklist_csv

Write-Host "Checklist located:"
Write-Host $ChecklistCsv

# Pass 1: known dynamic templates
pwsh -File .\batches\auto_discover_city_sources.ps1 -ChecklistCsv $ChecklistCsv

# Pass 2: profile synthesis for configured cities
pwsh -File .\batches\auto_generate_city_patterns.ps1 -ChecklistCsv $ChecklistCsv

# Confirm and validate
pwsh -File .\batches\confirm_verified_parity_layers.ps1 -ChecklistCsv $ChecklistCsv
pwsh -File .\batches\strict_validate_full_saturation.ps1 -ChecklistCsv $ChecklistCsv
pwsh -File .\batches\audit_full_saturation.ps1 -ChecklistCsv $ChecklistCsv

Write-Host "Gen3 strict full-saturation wave pipeline complete."


