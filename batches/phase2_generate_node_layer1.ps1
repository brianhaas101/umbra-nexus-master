$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $NodeDir = Join-Path $CityRoot "nodes"
  New-Item -ItemType Directory -Force $NodeDir | Out-Null

  $Nodes = @()

  foreach ($Layer in @("civic","safety","infrastructure","education","parks","governance")) {
    $NodeId = "$($City.city_id)_node_$Layer"
    $NodePath = Join-Path $NodeDir "$NodeId.json"

    [ordered]@{
      node_id = $NodeId
      city_id = $City.city_id
      canonical_name = $City.canonical_name
      node_layer = $Layer
      node_status = "placeholder_relationships_pending"
      provenance = "phase2_deterministic_node_scaffold"
      generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $NodePath

    $Nodes += [ordered]@{
      node_id = $NodeId
      node_layer = $Layer
      path = $NodePath
      status = "created"
    }
  }

  $Manifest = Join-Path $NodeDir "node_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    node_status = "scaffold_nodes_created"
    node_version = 1
    node_count = $Nodes.Count
    nodes = $Nodes
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Manifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    node_count = $Nodes.Count
    node_manifest = $Manifest
    status = "nodes_initialized"
  }
}

$Csv = Join-Path $OutDir "node_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "node_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Node graph layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Nodes per city:" 6
Write-Host "Total node records:" (($Rows | Measure-Object node_count -Sum).Sum)
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
