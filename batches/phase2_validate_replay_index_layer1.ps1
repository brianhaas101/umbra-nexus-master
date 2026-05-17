$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $ReplayDir = Join-Path (Join-Path $Root $City.city_id) "replay"
  $Manifest = Join-Path $ReplayDir "replay_manifest.json"
  $Index = Join-Path $ReplayDir "$($City.city_id)_replay_index.json"

  $Missing = 999
  $AssetCount = 0

  if (Test-Path $Index) {
    $Replay = Get-Content $Index -Raw | ConvertFrom-Json
    $Missing = [int]$Replay.missing_asset_count
    $AssetCount = @($Replay.replay_assets).Count
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    manifest_exists = Test-Path $Manifest
    replay_index_exists = Test-Path $Index
    replay_asset_count = $AssetCount
    missing_asset_count = $Missing
    passed = ((Test-Path $Manifest) -and (Test-Path $Index) -and $AssetCount -eq 6 -and $Missing -eq 0)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = ".\logs\$ClientId\globe_materialization\replay_index_layer1_validation.csv"
$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Replay index layer 1 validation complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Replay index layer 1 validation failed."
}
