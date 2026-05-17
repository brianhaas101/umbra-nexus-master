$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$ClientDisplay = "Black Dragon"

$BaseUrl = "https://tension-dash-learn-metric.trycloudflare.com"
$SetupPath = "/client/setup/black-dragon"
$SetupUrl = "$BaseUrl$SetupPath"

$RegistryFreeze = "registry_freeze_20260511_232934"
$HandoffFreeze = "client_handoff_freeze_20260512_002215"

$OutDir = ".\logs\$ClientId\access_setup"
$ArtifactDir = ".\artifacts\$ClientId\access_setup"

New-Item -ItemType Directory -Force $OutDir,$ArtifactDir | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$SetupManifest = Join-Path $ArtifactDir "client_setup_manifest_$Stamp.json"
$AuditJson = Join-Path $OutDir "client_setup_audit_$Stamp.json"

[ordered]@{
  client_id = $ClientId
  client_display = $ClientDisplay
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  setup_url = $SetupUrl
  registry_freeze = $RegistryFreeze
  handoff_freeze = $HandoffFreeze
  account_model = "isolated_tenant"
  founder_admin_shared_access = $false
  mfa_required = $true
  password_reset_required = $true
  audit_logging_required = $true
  registry_mutation_rights = "denied"
  batch_execution_rights = "denied"
  freeze_deletion_rights = "denied"
  credential_storage = "external_secure_channel_only"
  status = "ready_for_client_setup_link_delivery"
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $SetupManifest

Copy-Item $SetupManifest $AuditJson -Force

Write-Host ""
Write-Host "BLACK DRAGON SETUP PACKAGE READY"
Write-Host ""
Write-Host "Setup URL:"
Write-Host $SetupUrl
Write-Host ""
Write-Host "Registry Freeze:"
Write-Host $RegistryFreeze
Write-Host ""
Write-Host "Handoff Freeze:"
Write-Host $HandoffFreeze
Write-Host ""
Write-Host "Manifest:"
Write-Host $SetupManifest
Write-Host ""
Write-Host "Audit:"
Write-Host $AuditJson
Write-Host ""
Write-Host "Send setup link through secure channel only."

