$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$Loads = @(
  @{ City = "Long Beach"; Profile = ".\config\city_profiles\california_final.json" },
  @{ City = "Washington"; Profile = ".\config\city_profiles\dc_final.json" }
)

foreach ($Load in $Loads) {
  $Audit = Get-ChildItem ".\logs\$ClientId\full_saturation\wave_*_full_saturation_audit.json" |
    Where-Object { (Get-Content $_.FullName -Raw | ConvertFrom-Json).cities -contains $Load.City } |
    Sort-Object LastWriteTime |
    Select-Object -Last 1

  if (!$Audit) {
    Write-Warning "No wave audit found for $($Load.City)"
    continue
  }

  $ChecklistCsv = (Get-Content $Audit.FullName -Raw | ConvertFrom-Json).checklist_csv

  pwsh -File .\batches\load_city_profiles_json.ps1 `
    -ChecklistCsv $ChecklistCsv `
    -ProfileJson $Load.Profile

  pwsh -File .\batches\confirm_verified_parity_layers.ps1 -ChecklistCsv $ChecklistCsv
  pwsh -File .\batches\strict_validate_full_saturation.ps1 -ChecklistCsv $ChecklistCsv
  pwsh -File .\batches\audit_full_saturation.ps1 -ChecklistCsv $ChecklistCsv
}
