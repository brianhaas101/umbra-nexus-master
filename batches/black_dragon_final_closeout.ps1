$ErrorActionPreference = "Stop"

$Required = @(
  ".\batches\verify_canonical_city_processing.ps1",
  ".\batches\integrity_hardening_gate.ps1",
  ".\batches\phase2_validate_tile_layer1.ps1",
  ".\batches\phase2_validate_node_layer1.ps1",
  ".\batches\phase2_validate_dossier_layer1.ps1",
  ".\batches\phase2_validate_boundary_layer1.ps1",
  ".\batches\phase2_generate_replay_index_layer1.ps1",
  ".\batches\phase2_validate_replay_index_layer1.ps1",
  ".\batches\normalize_runtime_asset_discovery.ps1",
  ".\batches\audit_globe_runtime_scaffold.ps1",
  ".\batches\validate_runtime_loader.ps1",
  ".\batches\create_client_handoff_freeze.ps1"
)

foreach ($Step in $Required) {
  if (!(Test-Path $Step)) {
    throw "Missing closeout script: $Step"
  }

  Write-Host ""
  Write-Host "RUNNING:" $Step
  pwsh -File $Step
}

Write-Host ""
Write-Host "BLACK DRAGON CLOSEOUT COMPLETE"
Write-Host "Status: ready_for_access_package"
Write-Host "Create and send credentials outside repo/log/chat artifacts."
