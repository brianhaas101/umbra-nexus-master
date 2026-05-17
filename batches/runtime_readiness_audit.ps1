$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$Canonical = Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json
$Cross = Import-Csv .\logs\black_dragon\full_saturation\canonical_cross_reference.csv

$Results = foreach ($City in $Canonical) {

  $CrossMatch = $Cross |
    Where-Object {
      $_.city_id -eq $City.city_id -or
      $_.canonical_name -eq $City.canonical_name
    } |
    Select-Object -First 1

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    saturation_registered = [bool]$CrossMatch
    scaffold_status = $City.scaffold_status
    bounds_status = $City.bounds_status

    runtime_ready =
      (
        [bool]$CrossMatch -and
        $City.scaffold_status -match 'saturation_registered|materialized|runtime_ready'
      )
  }
}

$Failed = @(
  $Results | Where-Object { !$_.runtime_ready }
)

$Csv = ".\logs\$ClientId\globe_integrity\runtime_readiness_audit.csv"
$Json = ".\logs\$ClientId\globe_integrity\runtime_readiness_audit.json"

$Results |
  Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  runtime_ready_cities = @($Results | Where-Object runtime_ready).Count
  runtime_failed_cities = $Failed.Count
  gate = if ($Failed.Count -eq 0) {
    "pass_runtime_ready"
  } else {
    "fail_runtime_ready"
  }
} |
ConvertTo-Json -Depth 10 |
Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Runtime readiness audit complete"
Write-Host "Canonical cities:" $Canonical.Count
Write-Host "Runtime ready:" @($Results | Where-Object runtime_ready).Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_runtime_ready" } else { "fail_runtime_ready" })
