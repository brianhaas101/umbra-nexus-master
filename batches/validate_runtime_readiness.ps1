$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

# 1. Stop obsolete gates by replacing legacy tile-readiness with runtime readiness
@'
$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\runtime_validation"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Cross = Import-Csv ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"
$Root = ".\data\clients\$ClientId\globe_materialization"

$Results = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $Replay = Join-Path $CityRoot "replay\$($City.city_id)_replay_index.json"

  $Sat = $Cross | Where-Object {
    $_.city_id -eq $City.city_id -or
    $_.canonical_name -eq $City.canonical_name
  } | Select-Object -First 1

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    saturation_matched = [bool]$Sat
    materialization_root = Test-Path $CityRoot
    replay_registered = Test-Path $Replay
    runtime_ready = ([bool]$Sat -and (Test-Path $CityRoot) -and (Test-Path $Replay))
  }
}

$Failed = @($Results | Where-Object { !$_.runtime_ready })

$Csv = Join-Path $OutDir "runtime_readiness_validation.csv"
$Json = Join-Path $OutDir "runtime_readiness_validation.json"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  runtime_ready = @($Results | Where-Object runtime_ready).Count
  failed = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_runtime_ready" } else { "fail_runtime_ready" }
  failed_rows = $Failed
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Runtime readiness validation complete"
Write-Host "Runtime ready:" @($Results | Where-Object runtime_ready).Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_runtime_ready" } else { "fail_runtime_ready" })

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Runtime readiness failed."
}
