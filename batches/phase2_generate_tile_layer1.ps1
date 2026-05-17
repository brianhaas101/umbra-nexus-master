$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $TileDir = Join-Path $CityRoot "tiles"
  New-Item -ItemType Directory -Force $TileDir | Out-Null

  $TileGrid = @()

  foreach ($Z in 0..2) {
    foreach ($X in 0..1) {
      foreach ($Y in 0..1) {
        $TilePath = Join-Path $TileDir "$Z`_$X`_$Y.tile.json"

        [ordered]@{
          city_id = $City.city_id
          canonical_name = $City.canonical_name
          z = $Z
          x = $X
          y = $Y
          tile_status = "placeholder_geometry_pending"
          provenance = "phase2_deterministic_scaffold"
          generated_utc = (Get-Date).ToUniversalTime().ToString("o")
        } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $TilePath

        $TileGrid += [ordered]@{
          z = $Z
          x = $X
          y = $Y
          path = $TilePath
          status = "created"
        }
      }
    }
  }

  $TileManifest = Join-Path $TileDir "tile_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    tile_status = "scaffold_tiles_created"
    tile_version = 1
    tile_count = $TileGrid.Count
    tile_grid = $TileGrid
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $TileManifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    tile_count = $TileGrid.Count
    tile_manifest = $TileManifest
    status = "tiles_initialized"
  }
}

$Csv = Join-Path $OutDir "tile_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "tile_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Tile generation layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Tiles per city:" 12
Write-Host "Total tile records:" (($Rows | Measure-Object tile_count -Sum).Sum)
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
