$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\production_runtime"
$OutDir = ".\logs\$ClientId\production_readiness"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Cross = @(Import-Csv ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv")

$Rows = foreach ($City in $Canonical) {
  $Sat = $Cross | Where-Object {
    $_.city_id -eq $City.city_id -or $_.canonical_name -eq $City.canonical_name
  } | Select-Object -First 1

  $ProdManifest = Join-Path $Root "$($City.city_id)\production_asset_manifest.json"

  $SourceCount = 0
  if (Test-Path $ProdManifest) {
    $M = Get-Content $ProdManifest -Raw | ConvertFrom-Json
    $SourceCount = [int]$M.source_count
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    saturation_registered = [bool]$Sat
    production_manifest_exists = Test-Path $ProdManifest
    source_count = $SourceCount
    passed = ([bool]$Sat -and (Test-Path $ProdManifest) -and $SourceCount -ge 9)
  }
}

$Failed = @($Rows | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "runtime_readiness_production_gate.csv"
$Json = Join-Path $OutDir "runtime_readiness_production_gate.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  passed = @($Rows | Where-Object passed).Count
  failed = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_production_runtime_ready" } else { "fail_production_runtime_ready" }
  failed_rows = $Failed
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Production runtime readiness gate complete"
Write-Host "Passed:" @($Rows | Where-Object passed).Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_production_runtime_ready" } else { "fail_production_runtime_ready" })

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Production runtime readiness failed."
}
