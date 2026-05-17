param(
  [string]$ClientId = "black_dragon",
  [string]$CitiesCsv
)

$ErrorActionPreference = "Stop"

if (-not $CitiesCsv) {
  throw "CitiesCsv is required."
}

$Cities = $CitiesCsv -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }

if ($Cities.Count -ne 5) {
  throw "Exactly 5 cities required. Received: $($Cities.Count)"
}

$Root = Resolve-Path "."
$ConfigPath = Join-Path $Root "config\black_dragon\long_beach_parity_manifest.json"
$LogDir = Join-Path $Root "logs\$ClientId\full_saturation"
$DataDir = Join-Path $Root "data\clients\$ClientId\full_saturation"

New-Item -ItemType Directory -Force $LogDir,$DataDir | Out-Null

if (!(Test-Path $ConfigPath)) {
  throw "Missing Long Beach parity manifest."
}

$Manifest = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$WaveId = Get-Date -Format "yyyyMMdd_HHmmss"

$Checklist = foreach ($City in $Cities) {

  foreach ($Layer in $Manifest.required_layers) {

    [pscustomobject]@{
      wave_id = $WaveId
      city = $City
      parity_layer = $Layer
      source_name = ""
      source_url = ""
      source_type = ""
      city_specific = "pending"
      provenance_status = "pending"
      authentication_status = "pending"
      replay_status = "pending"
      saturation_status = "gap_unfilled"
      eligible_for_lock = "false"
      notes = "Needs verified city-local parity source."
    }
  }
}

$ChecklistPath = Join-Path $DataDir "wave_${WaveId}_long_beach_parity_checklist.csv"
$Checklist | Export-Csv -NoTypeInformation -Encoding UTF8 $ChecklistPath

$GapReport = foreach ($City in $Cities) {

  [pscustomobject]@{
    wave_id = $WaveId
    city = $City
    required_layers = $Manifest.required_layers.Count
    verified_layers = 0
    missing_layers = $Manifest.required_layers.Count
    saturation_percent = 0
    lock_status = "not_locked"
    reason = "No verified parity layers imported yet."
  }
}

$GapPath = Join-Path $LogDir "wave_${WaveId}_saturation_gap_report.csv"
$GapReport | Export-Csv -NoTypeInformation -Encoding UTF8 $GapPath

$Audit = [ordered]@{
  wave_id = $WaveId
  client_id = $ClientId
  cities = $Cities
  benchmark = "Long Beach"
  benchmark_role = "schema_process_parity_only"
  copied_long_beach_data = $false
  full_saturation_lock = "not_locked"
  checklist_csv = $ChecklistPath
  gap_report_csv = $GapPath
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
    copied_benchmark_data_forbidden = $true
  }
}

$AuditPath = Join-Path $LogDir "wave_${WaveId}_full_saturation_audit.json"
$Audit | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $AuditPath

Write-Host ""
Write-Host "Full-saturation replicator initialized"
Write-Host "Wave ID:" $WaveId
Write-Host "Checklist:" $ChecklistPath
Write-Host "Gap report:" $GapPath
Write-Host "Audit:" $AuditPath
Write-Host "Status: not_locked"
