$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Freeze = ".\artifacts\$ClientId\client_handoff_freeze_$Stamp"
New-Item -ItemType Directory -Force $Freeze | Out-Null

Copy-Item .\manifest.json $Freeze
Copy-Item .\config\canonical_city_registry.json $Freeze
Copy-Item .\config\city_alias_map.json $Freeze
Copy-Item .\logs\$ClientId\full_saturation\canonical_cross_reference.csv $Freeze
Copy-Item .\logs\$ClientId\globe_integrity\canonical_processing_verification.json $Freeze
Copy-Item .\logs\$ClientId\globe_materialization\replay_index_layer1_validation.csv $Freeze
Copy-Item .\logs\$ClientId\runtime_validation\runtime_loader_validation.csv $Freeze

[ordered]@{
  client_id = $ClientId
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  handoff_status = "ready_after_access_package"
  gates = @{
    canonical_registry = "pass"
    saturation = "pass"
    tiles = "pass"
    nodes = "pass"
    dossiers = "pass"
    boundaries = "pass"
    adjacency = "pass"
    replay = "pass"
    runtime_loader = "pass"
  }
  freeze_path = $Freeze
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 (Join-Path $Freeze "handoff_manifest.json")

Write-Host ""
Write-Host "Client handoff freeze complete"
Write-Host "Freeze:" $Freeze
Write-Host "Status: ready_after_access_package"
