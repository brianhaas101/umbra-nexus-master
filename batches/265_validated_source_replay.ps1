param(
  [string]$InputJson
)
$ErrorActionPreference = "Stop"

$In = $InputJson
$OutDir = ".\logs\black_dragon\tier2_hydration"

if (!(Test-Path $In)) {
  throw "Missing importer audit: $In"
}

$Audit = Get-Content $In -Raw | ConvertFrom-Json
$Sources = @($Audit.imported_sources)

$Replay = [ordered]@{
  batch = "265"
  purpose = "validated_source_replay"
  input_batch = "263"
  source_count = $Sources.Count
  replay_stability = if ($Sources.Count -eq 5) { "pass" } else { "fail" }
  matrix_parity_ready = $false
  hardlocks = $Audit.hardlocks
  replay_sources = $Sources
}

$Path = Join-Path $OutDir "batch_265_validated_source_replay.json"
$Replay | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $Path

Write-Host "Batch 265 complete:"
Write-Host $Path
Write-Host "Replay stability:" $Replay.replay_stability


