param(
  [Parameter(Mandatory=$true)]
  [string]$CitiesCsv,

  [Parameter(Mandatory=$true)]
  [string]$ProfileJson
)

$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\integrity_hardening"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Cities = $CitiesCsv.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }

if ($Cities.Count -ne 5) {
  throw "Exactly 5 cities required. Received: $($Cities.Count)"
}

if (!(Test-Path $ProfileJson)) {
  throw "Missing profile JSON: $ProfileJson"
}

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Profiles = @(Get-Content $ProfileJson -Raw | ConvertFrom-Json)

$ProfileCities = @{}
foreach ($P in $Profiles) {
  $ProfileCities[$P.city] = $P
}

$Results = foreach ($City in $Cities) {
  $CanonicalMatch = $Canonical | Where-Object { $_.city -eq $City } | Select-Object -First 1
  $ProfileMatch = $ProfileCities.ContainsKey($City)

  [pscustomobject]@{
    city = $City
    canonical_match = [bool]$CanonicalMatch
    city_id = if ($CanonicalMatch) { $CanonicalMatch.city_id } else { "" }
    canonical_name = if ($CanonicalMatch) { $CanonicalMatch.canonical_name } else { "" }
    profile_match = [bool]$ProfileMatch
    passed = ([bool]$CanonicalMatch -and [bool]$ProfileMatch)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Csv = Join-Path $OutDir "pre_wave_integrity_gate_$Stamp.csv"
$Json = Join-Path $OutDir "pre_wave_integrity_gate_$Stamp.json"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  cities = $Cities
  profile_json = $ProfileJson
  failed_count = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass" } else { "fail" }
  results = $Results
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Pre-wave integrity gate complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Pre-wave gate failed. Do not run saturation wave."
}
