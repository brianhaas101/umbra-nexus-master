$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\globe_integrity"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$CanonicalPath = ".\config\canonical_city_registry.json"
$CrossRefPath = ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"

if (!(Test-Path $CanonicalPath)) { throw "Missing canonical registry." }
if (!(Test-Path $CrossRefPath)) { throw "Missing canonical cross-reference." }

$Canonical = @(Get-Content $CanonicalPath -Raw | ConvertFrom-Json)
$Cross = @(Import-Csv $CrossRefPath)

$Results = foreach ($City in $Canonical) {
  $Match = $Cross | Where-Object {
    $_.city_id -eq $City.city_id -or
    $_.canonical_name -eq $City.canonical_name
  } | Select-Object -First 1

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    saturated = [bool]$Match
    status = if ($Match) { "processed" } else { "not_processed" }
  }
}

$Processed = @($Results | Where-Object { $_.saturated })
$Unprocessed = @($Results | Where-Object { !$_.saturated })

$Csv = Join-Path $OutDir "canonical_processing_verification.csv"
$Json = Join-Path $OutDir "canonical_processing_verification.json"

$Results | Sort-Object canonical_name | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  purpose = "canonical_city_processing_verification"
  canonical_cities = $Canonical.Count
  processed_cities = $Processed.Count
  unprocessed_cities = $Unprocessed.Count
  gate_status = if ($Unprocessed.Count -eq 0 -and $Processed.Count -eq $Canonical.Count) {
    "pass_all_canonical_cities_processed"
  } else {
    "fail_processing_gap"
  }
  unprocessed = @($Unprocessed | Select-Object city_id,canonical_name)
  reports = @{
    csv = $Csv
    json = $Json
  }
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Canonical processing verification complete"
Write-Host "Canonical cities:" $Canonical.Count
Write-Host "Processed cities:" $Processed.Count
Write-Host "Unprocessed cities:" $Unprocessed.Count
Write-Host "Gate:" $(if ($Unprocessed.Count -eq 0 -and $Processed.Count -eq $Canonical.Count) { "pass_all_canonical_cities_processed" } else { "fail_processing_gap" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json

if ($Unprocessed.Count -gt 0) {
  $Unprocessed | Format-Table canonical_name,city_id
}
