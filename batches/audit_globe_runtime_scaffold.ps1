$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_integrity"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Required = @(
  "asset_manifest.json",
  "tiles\tile_manifest.json",
  "nodes\node_manifest.json",
  "dossiers\dossier_manifest.json",
  "boundaries\boundary_manifest.json",
  "adjacency\adjacency_manifest.json",
  "replay\replay_manifest.json"
)

$Results = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id

  $Missing = foreach ($Rel in $Required) {
    $Path = Join-Path $CityRoot $Rel
    if (!(Test-Path $Path)) { $Rel }
  }

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    required_manifests = $Required.Count
    missing_manifests = @($Missing).Count
    scaffold_coverage = if (@($Missing).Count -eq 0) { "complete" } else { "incomplete" }
    operational_density = "partial"
    passed = (@($Missing).Count -eq 0)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "globe_runtime_scaffold_audit_$Stamp.csv"
$Json = Join-Path $OutDir "globe_runtime_scaffold_audit_$Stamp.json"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  passed_cities = @($Results | Where-Object passed).Count
  failed_cities = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_runtime_scaffold_complete" } else { "fail_runtime_scaffold_incomplete" }
  note = "This audit validates deterministic scaffold coverage, not full operational content density."
  results = $Results
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Globe runtime scaffold audit complete"
Write-Host "Canonical cities:" $Canonical.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_runtime_scaffold_complete" } else { "fail_runtime_scaffold_incomplete" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Runtime scaffold audit failed."
}
