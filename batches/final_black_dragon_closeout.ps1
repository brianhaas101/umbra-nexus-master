$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$Steps = @(
  ".\batches\normalize_runtime_asset_discovery.ps1",
  ".\batches\phase2_generate_replay_index_layer1.ps1",
  ".\batches\phase2_validate_replay_index_layer1.ps1",
  ".\batches\audit_globe_runtime_scaffold.ps1",
  ".\batches\validate_runtime_loader.ps1",
  ".\batches\create_client_handoff_freeze.ps1"
)

foreach ($Step in $Steps) {
  if (!(Test-Path $Step)) {
    throw "Missing finish script: $Step"
  }

  Write-Host ""
  Write-Host "RUNNING:" $Step
  pwsh -File $Step
}

Write-Host ""
Write-Host "BLACK DRAGON CLOSEOUT COMPLETE"
Write-Host "Status: ready_after_access_package"
Write-Host "Next: create credentials outside repo artifacts."
