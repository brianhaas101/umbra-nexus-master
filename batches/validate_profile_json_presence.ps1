$ErrorActionPreference = "Stop"

$ProfileDir = ".\config\city_profiles"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$ExpectedStates = @(
  "california_final.json",
  "dc_final.json",
  "ohio.json",
  "michigan.json",
  "minnesota.json",
  "kentucky.json",
  "tennessee.json"
)

$Results = foreach ($File in $ExpectedStates) {

  $Path = Join-Path $ProfileDir $File

  [pscustomobject]@{
    profile = $File
    exists = Test-Path $Path
  }
}

$Failed = @($Results | Where-Object { !$_.exists })

$Csv = ".\logs\black_dragon\integrity_hardening\profile_presence_validation.csv"

$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Profile presence validation complete"
Write-Host "Profiles checked:" $Results.Count
Write-Host "Missing:" $Failed.Count
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Missing required profile JSON files."
}

Write-Host "Gate: pass"
