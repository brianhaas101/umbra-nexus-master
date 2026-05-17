$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\globe_integrity"

New-Item -ItemType Directory -Force $OutDir | Out-Null

$CanonicalPath = ".\config\canonical_city_registry.json"
$CrossRefPath = ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"

if (!(Test-Path $CanonicalPath)) {
  throw "Missing canonical registry."
}

if (!(Test-Path $CrossRefPath)) {
  throw "Missing canonical cross-reference."
}

$Canonical = Get-Content $CanonicalPath -Raw | ConvertFrom-Json
$Cross = Import-Csv $CrossRefPath

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

$AssetRows = @()

foreach ($City in $Canonical) {

  $CityId = $City.city_id
  $Name = $City.canonical_name

  $Slug = ($Name -replace '[,\s]+','_').ToLowerInvariant()
  $CityOnly = ($City.city -replace '[,\s]+','_').ToLowerInvariant()

  foreach ($Root in $SearchRoots) {

    Get-ChildItem $Root -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {

        $P = $_.FullName.ToLowerInvariant()

        $P.Contains($CityId.ToLowerInvariant()) -or
        $P.Contains($Slug) -or
        $P.Contains($CityOnly)

      } | ForEach-Object {

        $P = $_.FullName.ToLowerInvariant()

        $Type = "other"

        if ($P -match 'tile|tiles|city_tiles') {
          $Type = "tile_or_map"
        }
        elseif ($P -match 'dossier|profile|brief|report') {
          $Type = "dossier"
        }
        elseif ($P -match 'node|graph|edge|network') {
          $Type = "node_or_graph"
        }
        elseif ($P -match 'boundary|bounds|geojson|polygon|shape') {
          $Type = "boundary"
        }

        $AssetRows += [pscustomobject]@{
          city_id = $CityId
          canonical_name = $Name
          asset_type = $Type
          path = $_.FullName
          bytes = $_.Length
          modified_utc = $_.LastWriteTimeUtc.ToString("o")
        }
      }
  }
}

$Summary = foreach ($City in $Canonical) {

  $Rows = @($AssetRows | Where-Object {
    $_.city_id -eq $City.city_id
  })

  $Sat = $Cross | Where-Object {
    $_.city_id -eq $City.city_id -or
    $_.canonical_name -eq $City.canonical_name
  } | Select-Object -First 1

  $HasMap = @($Rows | Where-Object {
    $_.asset_type -eq "tile_or_map"
  }).Count -gt 0

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    total_assets = $Rows.Count
    has_globe_map_asset = $HasMap
    saturated = [bool]$Sat

    processed_status =
      if ($HasMap -and [bool]$Sat) {
        "mapped_and_processed"
      }
      elseif ($HasMap -and ![bool]$Sat) {
        "mapped_but_not_processed"
      }
      elseif (!$HasMap -and [bool]$Sat) {
        "processed_but_no_map_asset"
      }
      else {
        "no_map_no_processing"
      }
  }
}

$MappedButNotProcessed = @(
  $Summary | Where-Object {
    $_.processed_status -eq "mapped_but_not_processed"
  }
)

$MappedAndProcessed = @(
  $Summary | Where-Object {
    $_.processed_status -eq "mapped_and_processed"
  }
)

Write-Host ""
Write-Host "Globe map verification complete"
Write-Host "Canonical cities:" @($Canonical).Count
Write-Host "Mapped and processed:" $MappedAndProcessed.Count
Write-Host "Mapped but NOT processed:" $MappedButNotProcessed.Count

Write-Host "Gate:" $(if (
  $MappedButNotProcessed.Count -eq 0
) {
  "pass_all_mapped_cities_processed"
}
else {
  "fail_mapped_cities_unprocessed"
})

if ($MappedButNotProcessed.Count -gt 0) {

  Write-Host ""
  Write-Host "Mapped but NOT processed:"
  $MappedButNotProcessed |
    Format-Table canonical_name,city_id,total_assets
}
