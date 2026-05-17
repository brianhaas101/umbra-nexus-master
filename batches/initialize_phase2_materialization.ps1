$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$Root = ".\data\clients\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$BuildQueue = @()

foreach ($City in $Canonical) {

  $CityRoot = Join-Path $Root $City.city_id

  $TileDir = Join-Path $CityRoot "tiles"
  $NodeDir = Join-Path $CityRoot "nodes"
  $DossierDir = Join-Path $CityRoot "dossiers"
  $AdjacencyDir = Join-Path $CityRoot "adjacency"
  $ReplayDir = Join-Path $CityRoot "replay"

  $TileManifest = Join-Path $TileDir "tile_manifest.json"
  $NodeManifest = Join-Path $NodeDir "node_manifest.json"
  $DossierManifest = Join-Path $DossierDir "dossier_manifest.json"
  $AdjacencyManifest = Join-Path $AdjacencyDir "adjacency_manifest.json"
  $ReplayManifest = Join-Path $ReplayDir "replay_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    tile_status = "queued"
    tile_grid = @()
    tile_version = 1
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $TileManifest

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    node_status = "queued"
    nodes = @()
    node_version = 1
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $NodeManifest

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    dossier_status = "queued"
    dossiers = @()
    dossier_version = 1
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $DossierManifest

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    adjacency_status = "queued"
    connected_cities = @()
    adjacency_version = 1
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $AdjacencyManifest

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    replay_status = "queued"
    replay_assets = @()
    replay_version = 1
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $ReplayManifest

  $BuildQueue += [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    tile_manifest = $TileManifest
    node_manifest = $NodeManifest
    dossier_manifest = $DossierManifest
    adjacency_manifest = $AdjacencyManifest
    replay_manifest = $ReplayManifest
    materialization_status = "initialized"
  }
}

$QueueCsv = ".\logs\$ClientId\globe_materialization\materialization_build_queue.csv"
$QueueJson = ".\logs\$ClientId\globe_materialization\materialization_build_queue.json"

$BuildQueue | Export-Csv -NoTypeInformation -Encoding UTF8 $QueueCsv
$BuildQueue | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $QueueJson

Write-Host ""
Write-Host "Phase 2 deterministic materialization initialized"
Write-Host "Cities initialized:" $BuildQueue.Count
Write-Host "Queue CSV:" $QueueCsv
Write-Host "Queue JSON:" $QueueJson
