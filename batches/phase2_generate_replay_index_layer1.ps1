$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $ReplayDir = Join-Path $CityRoot "replay"
  New-Item -ItemType Directory -Force $ReplayDir | Out-Null

  $Assets = [ordered]@{
    asset_manifest = Join-Path $CityRoot "asset_manifest.json"
    tile_manifest = Join-Path $CityRoot "tiles\tile_manifest.json"
    node_manifest = Join-Path $CityRoot "nodes\node_manifest.json"
    dossier_manifest = Join-Path $CityRoot "dossiers\dossier_manifest.json"
    boundary_manifest = Join-Path $CityRoot "boundaries\boundary_manifest.json"
    adjacency_manifest = Join-Path $CityRoot "adjacency\adjacency_manifest.json"
  }

  $ReplayAssets = foreach ($Key in $Assets.Keys) {
    $Path = $Assets[$Key]

    [ordered]@{
      asset_type = $Key
      path = $Path
      exists = Test-Path $Path
    }
  }

  $Missing = @($ReplayAssets | Where-Object { !$_.exists })

  $ReplayIndexPath = Join-Path $ReplayDir "$($City.city_id)_replay_index.json"
  $ReplayManifestPath = Join-Path $ReplayDir "replay_manifest.json"

  [ordered]@{
    replay_id = "$($City.city_id)_replay_index"
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    replay_status = if ($Missing.Count -eq 0) { "replay_index_created" } else { "replay_index_incomplete" }
    replay_version = 1
    replay_assets = $ReplayAssets
    missing_asset_count = $Missing.Count
  } | ConvertTo-Json -Depth 30 | Set-Content -Encoding UTF8 $ReplayIndexPath

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    replay_status = if ($Missing.Count -eq 0) { "scaffold_replay_created" } else { "scaffold_replay_incomplete" }
    replay_version = 1
    replay_index = $ReplayIndexPath
    replay_asset_count = $ReplayAssets.Count
    missing_asset_count = $Missing.Count
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $ReplayManifestPath

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    replay_assets = $ReplayAssets.Count
    missing_asset_count = $Missing.Count
    replay_index = $ReplayIndexPath
    replay_manifest = $ReplayManifestPath
    status = if ($Missing.Count -eq 0) { "replay_initialized" } else { "replay_incomplete" }
  }
}

$Csv = Join-Path $OutDir "replay_index_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "replay_index_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Replay index layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Replay assets per city:" 6
Write-Host "Cities with missing replay assets:" @($Rows | Where-Object { $_.missing_asset_count -gt 0 }).Count
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
