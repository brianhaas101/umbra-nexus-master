$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $AdjDir = Join-Path (Join-Path $Root $City.city_id) "adjacency"
  $Manifest = Join-Path $AdjDir "adjacency_manifest.json"
  $File = Join-Path $AdjDir "$($City.city_id)_adjacency.json"

  $EdgeCount = 0
  if (Test-Path $File) {
    $Adj = Get-Content $File -Raw | ConvertFrom-Json
    $EdgeCount = @($Adj.edges).Count
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    manifest_exists = Test-Path $Manifest
    adjacency_file_exists = Test-Path $File
    edge_count = $EdgeCount
    passed = ((Test-Path $Manifest) -and (Test-Path $File) -and $EdgeCount -ge 6)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = ".\logs\$ClientId\globe_materialization\adjacency_layer1_validation.csv"
$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Adjacency layer 1 validation complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Adjacency layer 1 validation failed."
}
