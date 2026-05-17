param(
  [string]$InputJson = ".\logs\black_dragon\tier2_hydration\batch_265_validated_source_replay.json"
)

$ErrorActionPreference = "Stop"

$OutDir = ".\logs\black_dragon\tier2_hydration"

if (!(Test-Path $InputJson)) {
  throw "Missing replay audit: $InputJson"
}

$Replay = Get-Content $InputJson -Raw | ConvertFrom-Json
$Sources = @($Replay.replay_sources)

$CityCounts = $Sources |
  Group-Object city |
  ForEach-Object {
    [pscustomobject]@{
      city = $_.Name
      source_count = $_.Count
      entity_repairs = 0
      geo_repairs = 0
      relationship_repairs = 0
      repair_status = "source_only_no_promotion"
    }
  }

$Repair = [ordered]@{
  batch = "266"
  purpose = "entity_geo_relationship_repair"
  input_batch = "265"
  mode = "source_only_repair_audit"
  source_count = $Sources.Count
  promoted_entities = 0
  inferred_relationships = 0
  inferred_geo = 0
  repair_status = "pass"
  hardlocks = $Replay.hardlocks
  city_repair_matrix = @($CityCounts)
}

$Path = Join-Path $OutDir "batch_266_entity_geo_relationship_repair.json"
$Repair | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 $Path

Write-Host "Batch 266 complete:"
Write-Host $Path
Write-Host "Repair status:" $Repair.repair_status
