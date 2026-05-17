$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = Resolve-Path "."
$OutDir = ".\logs\$ClientId\globe_integrity"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$ManifestPath = ".\manifest.json"
$CanonicalPath = ".\config\canonical_city_registry.json"
$CrossRefPath = ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"

if (!(Test-Path $ManifestPath)) { throw "Missing manifest.json" }
if (!(Test-Path $CanonicalPath)) { throw "Missing canonical registry. Run build_canonical_city_registry_adapter.ps1 first." }
if (!(Test-Path $CrossRefPath)) { throw "Missing canonical cross-reference CSV." }

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Canonical = Get-Content $CanonicalPath -Raw | ConvertFrom-Json
$Cross = Import-Csv $CrossRefPath

$TileRoot = ".\assets\city_tiles"
$DossierRoots = @(
  ".\data\dossiers",
  ".\data\clients\$ClientId\dossiers",
  ".\public\data\dossiers",
  ".\public\data\clients\$ClientId\dossiers"
) | Where-Object { Test-Path $_ }

$NodeRoots = @(
  ".\data\nodes",
  ".\data\clients\$ClientId\nodes",
  ".\public\data\nodes",
  ".\public\data\clients\$ClientId\nodes"
) | Where-Object { Test-Path $_ }

$Results = foreach ($City in $Canonical) {
  $CityId = $City.city_id
  $Name = $City.canonical_name

  $CrossMatch = $Cross | Where-Object { $_.city_id -eq $CityId -or $_.canonical_name -eq $Name } | Select-Object -First 1

  $TilePath = Join-Path $TileRoot $CityId
  $TileExists = Test-Path $TilePath
  $TileCount = if ($TileExists) { @(Get-ChildItem $TilePath -Recurse -File -ErrorAction SilentlyContinue).Count } else { 0 }

  $DossierHits = foreach ($RootPath in $DossierRoots) {
    Get-ChildItem $RootPath -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Name -match [regex]::Escape($CityId) -or
        $_.Name -match [regex]::Escape(($Name -replace '[,\s]+','_'))
      }
  }

  $NodeHits = foreach ($RootPath in $NodeRoots) {
    Get-ChildItem $RootPath -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object {
        $_.Name -match [regex]::Escape($CityId) -or
        $_.Name -match [regex]::Escape(($Name -replace '[,\s]+','_'))
      }
  }

  [pscustomobject]@{
    city_id = $CityId
    canonical_name = $Name
    state = $City.state
    saturation_matched = [bool]$CrossMatch
    tile_folder_exists = $TileExists
    tile_file_count = $TileCount
    dossier_file_count = @($DossierHits).Count
    node_file_count = @($NodeHits).Count
    scaffold_status = $City.scaffold_status
    bounds_status = $City.bounds_status
    coverage_status = if (
      [bool]$CrossMatch -and
      $TileExists -and
      $TileCount -gt 0
    ) { "covered" } else { "needs_review" }
  }
}

$MissingCoverage = @($Results | Where-Object { $_.coverage_status -ne "covered" })
$MissingTiles = @($Results | Where-Object { !$_.tile_folder_exists -or $_.tile_file_count -eq 0 })
$MissingDossiers = @($Results | Where-Object { $_.dossier_file_count -eq 0 })
$MissingNodes = @($Results | Where-Object { $_.node_file_count -eq 0 })
$UnmatchedSaturation = @($Results | Where-Object { !$_.saturation_matched })

$Csv = Join-Path $OutDir "globe_city_coverage_audit.csv"
$Json = Join-Path $OutDir "globe_city_coverage_audit.json"

$Results | Sort-Object canonical_name | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  purpose = "globe_city_coverage_integrity_audit"
  canonical_city_count = @($Canonical).Count
  saturation_matched_count = @($Results | Where-Object { $_.saturation_matched }).Count
  covered_city_count = @($Results | Where-Object { $_.coverage_status -eq "covered" }).Count
  needs_review_count = $MissingCoverage.Count
  missing_tile_count = $MissingTiles.Count
  missing_dossier_count = $MissingDossiers.Count
  missing_node_count = $MissingNodes.Count
  unmatched_saturation_count = $UnmatchedSaturation.Count
  gate_status = if (
    $MissingCoverage.Count -eq 0 -and
    $UnmatchedSaturation.Count -eq 0
  ) { "pass" } else { "fail_review_required" }
  reports = [ordered]@{
    csv = $Csv
    json = $Json
  }
  hardlocks = [ordered]@{
    no_phase_2_until_gate_pass = $true
    manifest_city_id_required = $true
    tile_presence_required = $true
    saturation_match_required = $true
    dossier_and_node_review_required = $true
  }
  missing_tiles = @($MissingTiles | Select-Object city_id,canonical_name,tile_file_count)
  missing_dossiers = @($MissingDossiers | Select-Object city_id,canonical_name,dossier_file_count)
  missing_nodes = @($MissingNodes | Select-Object city_id,canonical_name,node_file_count)
  unmatched_saturation = @($UnmatchedSaturation | Select-Object city_id,canonical_name)
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Globe city coverage audit complete"
Write-Host "Canonical cities:" @($Canonical).Count
Write-Host "Saturation matched:" @($Results | Where-Object { $_.saturation_matched }).Count
Write-Host "Covered cities:" @($Results | Where-Object { $_.coverage_status -eq "covered" }).Count
Write-Host "Needs review:" $MissingCoverage.Count
Write-Host "Missing tiles:" $MissingTiles.Count
Write-Host "Missing dossiers:" $MissingDossiers.Count
Write-Host "Missing nodes:" $MissingNodes.Count
Write-Host "Gate:" $(if ($MissingCoverage.Count -eq 0 -and $UnmatchedSaturation.Count -eq 0) { "pass" } else { "fail_review_required" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
