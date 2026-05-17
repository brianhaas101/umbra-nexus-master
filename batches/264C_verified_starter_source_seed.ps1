$ErrorActionPreference = "Stop"

$Root = Resolve-Path "."
$OutDir = Join-Path $Root "logs\black_dragon\tier2_hydration"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Batch = [ordered]@{
  batch = "264C"
  purpose = "verified_starter_source_seed"
  status = "materialized_not_promoted"
  cities = @(
    "New Orleans",
    "Nashville",
    "New York City",
    "Seattle",
    "San Antonio"
  )
  hardlocks = [ordered]@{
    no_synthetic_fillers = $true
    no_runtime_promotion = $true
    no_contact_enablement = $true
    no_placeholder_entities = $true
    no_false_targets = $true
    provenance_required = $true
    manual_review_required = $true
    city_local_sources_only = $true
    no_cross_city_contamination = $true
  }
  outputs = [ordered]@{
    promoted_entities = 0
    inferred_relationships = 0
    inferred_contacts = 0
    runtime_promotions = 0
  }
}

$Path = Join-Path $OutDir "batch_264C_verified_starter_source_seed.json"
$Batch | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $Path

Write-Host "Batch 264C materialized:"
Write-Host $Path
