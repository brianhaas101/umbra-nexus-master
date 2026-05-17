$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$LayerOrder = @("civic","safety","infrastructure","education","parks","governance")

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $AdjDir = Join-Path $CityRoot "adjacency"
  New-Item -ItemType Directory -Force $AdjDir | Out-Null

  $Edges = @()

  # Intra-city deterministic ring across node layers
  for ($i = 0; $i -lt $LayerOrder.Count; $i++) {
    $FromLayer = $LayerOrder[$i]
    $ToLayer = $LayerOrder[($i + 1) % $LayerOrder.Count]

    $EdgeId = "$($City.city_id)_edge_$FromLayer`_to_$ToLayer"

    $Edges += [ordered]@{
      edge_id = $EdgeId
      edge_type = "intra_city_layer_ring"
      from_city_id = $City.city_id
      to_city_id = $City.city_id
      from_node_id = "$($City.city_id)_node_$FromLayer"
      to_node_id = "$($City.city_id)_node_$ToLayer"
      status = "scaffold_edge_created"
      provenance = "phase2_deterministic_adjacency_scaffold"
    }
  }

  # State-level peer links, deterministic, non-geographic
  $Peers = @($Canonical | Where-Object {
    $_.state -eq $City.state -and $_.city_id -ne $City.city_id
  } | Sort-Object canonical_name | Select-Object -First 2)

  foreach ($Peer in $Peers) {
    $Edges += [ordered]@{
      edge_id = "$($City.city_id)_peer_$($Peer.city_id)"
      edge_type = "state_peer_city_reference"
      from_city_id = $City.city_id
      to_city_id = $Peer.city_id
      from_node_id = "$($City.city_id)_node_civic"
      to_node_id = "$($Peer.city_id)_node_civic"
      status = "scaffold_edge_created"
      provenance = "phase2_deterministic_state_peer_scaffold"
    }
  }

  $AdjPath = Join-Path $AdjDir "$($City.city_id)_adjacency.json"
  $Manifest = Join-Path $AdjDir "adjacency_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    adjacency_status = "scaffold_adjacency_created"
    adjacency_version = 1
    edge_count = $Edges.Count
    edges = $Edges
  } | ConvertTo-Json -Depth 30 | Set-Content -Encoding UTF8 $AdjPath

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    adjacency_status = "scaffold_adjacency_created"
    adjacency_version = 1
    adjacency_files = @(
      [ordered]@{
        path = $AdjPath
        edge_count = $Edges.Count
        status = "created"
      }
    )
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Manifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    edge_count = $Edges.Count
    adjacency_file = $AdjPath
    adjacency_manifest = $Manifest
    status = "adjacency_initialized"
  }
}

$Csv = Join-Path $OutDir "adjacency_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "adjacency_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Adjacency layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Minimum edges per city:" (($Rows | Measure-Object edge_count -Minimum).Minimum)
Write-Host "Total edge records:" (($Rows | Measure-Object edge_count -Sum).Sum)
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
