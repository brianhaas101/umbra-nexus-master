$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Root = ".\data\clients\$ClientId\globe_materialization"
$QueueDir = ".\logs\$ClientId\globe_materialization"
New-Item -ItemType Directory -Force $Root,$QueueDir | Out-Null

$Queue = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id

  $Dirs = @(
    "tiles",
    "nodes",
    "dossiers",
    "boundaries",
    "adjacency",
    "replay"
  )

  foreach ($Dir in $Dirs) {
    New-Item -ItemType Directory -Force (Join-Path $CityRoot $Dir) | Out-Null
  }

  $ManifestPath = Join-Path $CityRoot "asset_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    materialization_status = "scaffold_created"
    required_assets = @{
      tiles = "pending"
      nodes = "pending"
      dossiers = "pending"
      boundaries = "pending"
      adjacency = "pending"
      replay = "pending"
    }
  } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $ManifestPath

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    scaffold_path = $CityRoot
    asset_manifest = $ManifestPath
    status = "queued_for_materialization"
  }
}

$QueueCsv = Join-Path $QueueDir "phase2_materialization_queue_$Stamp.csv"
$QueueJson = Join-Path $QueueDir "phase2_materialization_queue_$Stamp.json"

$Queue | Export-Csv -NoTypeInformation -Encoding UTF8 $QueueCsv
$Queue | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $QueueJson

Write-Host ""
Write-Host "Phase 2 materialization scaffold complete"
Write-Host "Cities scaffolded:" $Queue.Count
Write-Host "Root:" $Root
Write-Host "Queue CSV:" $QueueCsv
Write-Host "Queue JSON:" $QueueJson
