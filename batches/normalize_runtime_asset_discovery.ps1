$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\globe_integrity"
$RuntimeRoot = ".\data\clients\$ClientId\globe_materialization"

New-Item -ItemType Directory -Force $OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $RuntimeRoot $City.city_id

  $Checks = [ordered]@{
    asset_manifest = Join-Path $CityRoot "asset_manifest.json"
    tile_manifest = Join-Path $CityRoot "tiles\tile_manifest.json"
    node_manifest = Join-Path $CityRoot "nodes\node_manifest.json"
    dossier_manifest = Join-Path $CityRoot "dossiers\dossier_manifest.json"
    boundary_manifest = Join-Path $CityRoot "boundaries\boundary_manifest.json"
    adjacency_manifest = Join-Path $CityRoot "adjacency\adjacency_manifest.json"
    replay_manifest = Join-Path $CityRoot "replay\replay_manifest.json"
  }

  $Missing = foreach ($Key in $Checks.Keys) {
    if (!(Test-Path $Checks[$Key])) { $Key }
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    runtime_root_exists = Test-Path $CityRoot
    required_runtime_assets = $Checks.Count
    missing_runtime_assets = @($Missing).Count
    runtime_asset_status = if (@($Missing).Count -eq 0) { "complete" } else { "incomplete" }
    operational_density_status = "scaffold_complete_payload_partial"
    passed = ((Test-Path $CityRoot) -and @($Missing).Count -eq 0)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "runtime_asset_discovery_normalized.csv"
$Json = Join-Path $OutDir "runtime_asset_discovery_normalized.json"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  runtime_complete = @($Results | Where-Object passed).Count
  runtime_incomplete = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_runtime_assets_normalized" } else { "fail_runtime_assets_missing" }
  note = "Counts deterministic scaffold/runtime manifests as runtime assets. Does not claim full operational payload density."
  failed = $Failed
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Runtime asset discovery normalization complete"
Write-Host "Canonical cities:" $Canonical.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_runtime_assets_normalized" } else { "fail_runtime_assets_missing" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Runtime asset discovery normalization failed."
}
