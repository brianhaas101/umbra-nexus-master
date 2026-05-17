<#
  Validate-LeadsMasterJson.ps1
  Validates JSON structure of public/data/leads_master.json (or any path you pass).
  Produces server/tools/reports/<timestamp>_leads_validation.json
#>

param(
  [string]$JsonPath = ".\public\data\leads_master.json",
  [string]$OutDir = "server\tools\reports"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $JsonPath)) { throw "[Validate-LeadsMasterJson] Missing: $JsonPath" }

$raw = Get-Content -Raw -Encoding UTF8 $JsonPath
try {
  $data = $raw | ConvertFrom-Json -Depth 64
} catch {
  throw "[Validate-LeadsMasterJson] INVALID JSON: $($_.Exception.Message)"
}

# Accept either:
#  A) { cities:[...], entities:[...] }
#  B) any object that contains those properties
$cities = @()
$entities = @()
if ($data.PSObject.Properties.Name -contains "cities") { $cities = @($data.cities) }
if ($data.PSObject.Properties.Name -contains "entities") { $entities = @($data.entities) }

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function IsNum($x) {
  $n = [double]::NaN
  return [double]::TryParse([string]$x, [ref]$n)
}

# City checks
if (-not $cities -or $cities.Count -eq 0) { $errors.Add("cities array missing or empty") }
else {
  $i = 0
  foreach ($c in $cities) {
    $i++
    $cid = [string]($c.city_id)
    if ([string]::IsNullOrWhiteSpace($cid)) { $errors.Add("cities[$i] missing city_id") }
    if (-not (IsNum $c.lat)) { $errors.Add("cities[$i] invalid lat") }
    if (-not (IsNum $c.lon)) { $errors.Add("cities[$i] invalid lon") }
  }
}

# Entity checks
if (-not $entities) { $warnings.Add("entities array missing (allowed for demo)") }
elseif ($entities.Count -gt 0) {
  $i = 0
  foreach ($e in $entities) {
    $i++
    $eid = [string]($e.entity_id)
    $cid = [string]($e.city_id)
    if ([string]::IsNullOrWhiteSpace($eid)) { $errors.Add("entities[$i] missing entity_id") }
    if ([string]::IsNullOrWhiteSpace($cid)) { $errors.Add("entities[$i] missing city_id") }
    if (-not (IsNum $e.lat)) { $errors.Add("entities[$i] invalid lat") }
    if (-not (IsNum $e.lon)) { $errors.Add("entities[$i] invalid lon") }
  }
}

# Cross-ref: entity.city_id must exist in cities
if ($cities -and $cities.Count -gt 0 -and $entities -and $entities.Count -gt 0) {
  $citySet = @{}
  foreach ($c in $cities) { $citySet[[string]$c.city_id] = $true }
  $i = 0
  foreach ($e in $entities) {
    $i++
    $cid = [string]$e.city_id
    if (-not $citySet.ContainsKey($cid)) { $errors.Add("entities[$i] city_id not found in cities: $cid") }
  }
}

# Emit report
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$destBase = Join-Path "." $OutDir
New-Item -ItemType Directory -Force -Path $destBase | Out-Null
$outPath = Join-Path $destBase ("{0}_leads_validation.json" -f $stamp)

$report = [pscustomobject]@{
  jsonPath = (Resolve-Path $JsonPath).Path
  citiesCount = ($cities | Measure-Object).Count
  entitiesCount = ($entities | Measure-Object).Count
  errors = $errors
  warnings = $warnings
  ok = ($errors.Count -eq 0)
  timestamp = (Get-Date).ToString("o")
}

$report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $outPath

Write-Host "[Validate-LeadsMasterJson] Report: $outPath"
if (-not $report.ok) {
  Write-Host "[Validate-LeadsMasterJson] FAIL"
  $errors | ForEach-Object { Write-Host ("- {0}" -f $_) }
  exit 1
}

Write-Host "[Validate-LeadsMasterJson] PASS"
if ($warnings.Count -gt 0) {
  Write-Host "[Validate-LeadsMasterJson] Warnings:"
  $warnings | ForEach-Object { Write-Host ("- {0}" -f $_) }
}
exit 0
