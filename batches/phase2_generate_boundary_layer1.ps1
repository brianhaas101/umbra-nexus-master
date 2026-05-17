$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $BoundaryDir = Join-Path $CityRoot "boundaries"
  New-Item -ItemType Directory -Force $BoundaryDir | Out-Null

  $BoundaryPath = Join-Path $BoundaryDir "$($City.city_id)_boundary.scaffold.json"

  [ordered]@{
    boundary_id = "$($City.city_id)_boundary"
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    boundary_status = "placeholder_geometry_pending"
    geometry_type = "unverified_scaffold"
    source_authority = "canonical_city_registry"
    provenance = "phase2_deterministic_boundary_scaffold"
    bounds_status = $City.bounds_status
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $BoundaryPath

  $Manifest = Join-Path $BoundaryDir "boundary_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    boundary_status = "scaffold_boundary_created"
    boundary_version = 1
    boundary_count = 1
    boundaries = @(
      [ordered]@{
        boundary_id = "$($City.city_id)_boundary"
        path = $BoundaryPath
        status = "created"
      }
    )
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Manifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    boundary_count = 1
    boundary_manifest = $Manifest
    status = "boundary_initialized"
  }
}

$Csv = Join-Path $OutDir "boundary_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "boundary_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Boundary layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Boundaries per city:" 1
Write-Host "Total boundary records:" (($Rows | Measure-Object boundary_count -Sum).Sum)
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
