$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\globe_integrity"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$CanonicalPath = ".\config\canonical_city_registry.json"

if (!(Test-Path $CanonicalPath)) {
  throw "Missing canonical registry."
}

$Canonical = Get-Content $CanonicalPath -Raw | ConvertFrom-Json

$SearchRoots = @(
  ".\assets",
  ".\public",
  ".\data",
  ".\generated",
  ".\output",
  ".\exports",
  ".\runtime",
  ".\cache",
  ".\archive",
  ".\staging"
) | Where-Object { Test-Path $_ }

$Results = @()

foreach ($City in $Canonical) {

  $CityId = $City.city_id
  $CanonicalName = $City.canonical_name

  $Slug = ($CanonicalName -replace '[,\s]+','_').ToLowerInvariant()
  $CityOnly = ($City.city -replace '[,\s]+','_').ToLowerInvariant()

  $TileHits = 0
  $DossierHits = 0
  $NodeHits = 0
  $BoundaryHits = 0
  $AnyHits = 0

  foreach ($Root in $SearchRoots) {

    $Hits = Get-ChildItem $Root -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $N = $_.FullName.ToLowerInvariant()

        $N.Contains($CityId.ToLowerInvariant()) -or
        $N.Contains($Slug) -or
        $N.Contains($CityOnly)
      }

    foreach ($Hit in $Hits) {

      $AnyHits++

      $Path = $Hit.FullName.ToLowerInvariant()

      if ($Path -match 'tile|tiles') { $TileHits++ }
      if ($Path -match 'dossier|profile|brief|report') { $DossierHits++ }
      if ($Path -match 'node|graph|edge|network') { $NodeHits++ }
      if ($Path -match 'boundary|bounds|geojson|polygon|shape') { $BoundaryHits++ }
    }
  }

  $Results += [pscustomobject]@{
    city_id = $CityId
    canonical_name = $CanonicalName
    asset_hits = $AnyHits
    tile_hits = $TileHits
    dossier_hits = $DossierHits
    node_hits = $NodeHits
    boundary_hits = $BoundaryHits
    has_assets = ($AnyHits -gt 0)
  }

  Write-Host "Scanned:" $CanonicalName "Hits:" $AnyHits
}

$Csv = Join-Path $OutDir "filesystem_asset_discovery.csv"
$Json = Join-Path $OutDir "filesystem_asset_discovery.json"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

$WithAssets = @($Results | Where-Object { $_.has_assets })
$WithoutAssets = @($Results | Where-Object { !$_.has_assets })

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_city_count = @($Canonical).Count
  cities_with_assets = $WithAssets.Count
  cities_without_assets = $WithoutAssets.Count
  tile_asset_cities = @($Results | Where-Object { $_.tile_hits -gt 0 }).Count
  dossier_asset_cities = @($Results | Where-Object { $_.dossier_hits -gt 0 }).Count
  node_asset_cities = @($Results | Where-Object { $_.node_hits -gt 0 }).Count
  boundary_asset_cities = @($Results | Where-Object { $_.boundary_hits -gt 0 }).Count
  gate_status = if ($WithAssets.Count -gt 0) {
    "asset_recovery_possible"
  } else {
    "generation_required"
  }
} |
ConvertTo-Json -Depth 10 |
Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Filesystem discovery complete"
Write-Host "Cities with assets:" $WithAssets.Count
Write-Host "Cities without assets:" $WithoutAssets.Count
Write-Host "Gate:" $(if ($WithAssets.Count -gt 0) { "asset_recovery_possible" } else { "generation_required" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
