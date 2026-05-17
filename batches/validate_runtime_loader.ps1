$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\runtime_validation"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id

  $Replay = Join-Path $CityRoot "replay\$($City.city_id)_replay_index.json"
  $Adj = Join-Path $CityRoot "adjacency\$($City.city_id)_adjacency.json"
  $Tiles = @(Get-ChildItem (Join-Path $CityRoot "tiles") -File -Filter "*.tile.json" -ErrorAction SilentlyContinue)
  $Nodes = @(Get-ChildItem (Join-Path $CityRoot "nodes") -File -Filter "*_node_*.json" -ErrorAction SilentlyContinue)
  $Dossiers = @(Get-ChildItem (Join-Path $CityRoot "dossiers") -File -Filter "*_dossier_*.json" -ErrorAction SilentlyContinue)

  $EdgeCount = 0
  if (Test-Path $Adj) {
    $A = Get-Content $Adj -Raw | ConvertFrom-Json
    $EdgeCount = @($A.edges).Count
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    replay_index = Test-Path $Replay
    tile_count = $Tiles.Count
    node_count = $Nodes.Count
    dossier_count = $Dossiers.Count
    edge_count = $EdgeCount
    passed = ((Test-Path $Replay) -and $Tiles.Count -eq 12 -and $Nodes.Count -eq 6 -and $Dossiers.Count -eq 6 -and $EdgeCount -ge 6)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "runtime_loader_validation.csv"
$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Runtime loader validation complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Runtime loader validation failed."
}
