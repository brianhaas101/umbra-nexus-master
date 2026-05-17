param(
  [string]$CitiesCsv
)

$ErrorActionPreference = "Stop"

$Cities = $CitiesCsv -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }

if ($Cities.Count -ne 5) {
  throw "Exactly 5 cities required. Received: $($Cities.Count)"
}

$Root = Resolve-Path "."
$LogDir = Join-Path $Root "logs\black_dragon\tier2_hydration"
$DataDir = Join-Path $Root "data\clients\black_dragon\reviewed_intake"

New-Item -ItemType Directory -Force $LogDir | Out-Null
New-Item -ItemType Directory -Force $DataDir | Out-Null

$WaveId = Get-Date -Format "yyyyMMdd_HHmmss"

$Rows = foreach ($City in $Cities) {
  [pscustomobject]@{
    city = $City
    source_name = ""
    source_type = ""
    source_url = ""
    city_locality_check = "pending"
    manual_review_status = "pending"
    provenance_status = "pending"
    eligible_for_import = "false"
    notes = "wave_seed_generated"
  }
}

$CsvPath = Join-Path $DataDir "wave_${WaveId}_starter_sources.csv"
$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $CsvPath

$Manifest = [ordered]@{
  wave_id = $WaveId
  cities = $Cities
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  status = "wave_initialized"
  starter_csv = $CsvPath
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
}

$ManifestPath = Join-Path $LogDir "wave_${WaveId}_manifest.json"
$Manifest | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $ManifestPath

Write-Host "Wave initialized"
Write-Host "Wave ID:" $WaveId
Write-Host "CSV:" $CsvPath
Write-Host "Manifest:" $ManifestPath
Write-Host "Cities:" ($Cities -join ", ")
