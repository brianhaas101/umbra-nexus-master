$ErrorActionPreference = "Stop"

$ReplayPath = ".\logs\black_dragon\tier2_hydration\batch_265_validated_source_replay.json"
$RepairPath = ".\logs\black_dragon\tier2_hydration\batch_266_entity_geo_relationship_repair.json"
$OutDir = ".\logs\black_dragon\tier2_hydration"

if (!(Test-Path $ReplayPath)) { throw "Missing replay audit: $ReplayPath" }
if (!(Test-Path $RepairPath)) { throw "Missing repair audit: $RepairPath" }

$Replay = Get-Content $ReplayPath -Raw | ConvertFrom-Json
$Repair = Get-Content $RepairPath -Raw | ConvertFrom-Json

$ExpectedCities = @($Replay.replay_sources | Select-Object -ExpandProperty city -Unique)

if ($ExpectedCities.Count -ne 5) {
  throw "Expected exactly 5 replay cities. Found: $($ExpectedCities.Count)"
}

$CityRows = foreach ($City in $ExpectedCities) {
  $Row = @($Repair.city_repair_matrix | Where-Object { $_.city -eq $City })[0]

  [pscustomobject]@{
    city = $City
    source_count = if ($Row) { $Row.source_count } else { 0 }
    replay_stability = $Replay.replay_stability
    repair_status = if ($Row) { $Row.repair_status } else { "missing" }
    parity_status = if ($Row -and $Row.source_count -ge 1) { "pass" } else { "fail" }
  }
}

$ParityPass = (@($CityRows | Where-Object { $_.parity_status -eq "pass" }).Count -eq $ExpectedCities.Count)
$ReplayPass = ($Replay.replay_stability -eq "pass")
$RepairPass = ($Repair.repair_status -eq "pass")

$Locked = ($ParityPass -and $ReplayPass -and $RepairPass)

$Matrix = [ordered]@{
  batch = "267"
  purpose = "matrix_refresh"
  input_batches = @("265","266")
  expected_city_count = $ExpectedCities.Count
  actual_city_count = @($CityRows | Where-Object { $_.parity_status -eq "pass" }).Count
  matrix_parity = if ($ParityPass) { "pass" } else { "fail" }
  replay_stability = $Replay.replay_stability
  repair_status = $Repair.repair_status
  five_city_lock_status = if ($Locked) { "locked" } else { "not_locked" }
  hardlocks = $Repair.hardlocks
  city_matrix = @($CityRows)
}

$Path = Join-Path $OutDir "batch_267_matrix_refresh.json"
$Matrix | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $Path

Write-Host "Batch 267 complete:"
Write-Host $Path
Write-Host "Matrix parity:" $Matrix.matrix_parity
Write-Host "Replay stability:" $Matrix.replay_stability
Write-Host "Five-city lock status:" $Matrix.five_city_lock_status
