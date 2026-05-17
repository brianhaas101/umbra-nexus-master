$ErrorActionPreference = "Stop"

$RegistryPath = "config\canonical_city_registry.json"
$ReportDir = "logs\founder_geospatial_audit"
$JsonReport = Join-Path $ReportDir "city_bounds_status_summary.json"
$TxtReport = Join-Path $ReportDir "city_bounds_status_summary.txt"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Registry = Get-Content $RegistryPath -Raw | ConvertFrom-Json

$StatusCounts = $Registry |
  Group-Object bounds_status |
  ForEach-Object {
    [PSCustomObject]@{
      bounds_status = $_.Name
      count = $_.Count
    }
  }

$ScaffoldCounts = $Registry |
  Group-Object scaffold_status |
  ForEach-Object {
    [PSCustomObject]@{
      scaffold_status = $_.Name
      count = $_.Count
    }
  }

$Payload = [PSCustomObject]@{
  generated_at = (Get-Date -Format o)
  registry_count = $Registry.Count
  bounds_status_counts = $StatusCounts
  scaffold_status_counts = $ScaffoldCounts
  verified_cities = @(
    $Registry | Where-Object { $_.bounds_status -eq "verified_reference" }
  )
  unverified_cities = @(
    $Registry | Where-Object { $_.bounds_status -ne "verified_reference" }
  )
}

$Payload | ConvertTo-Json -Depth 8 | Out-File -Encoding utf8 $JsonReport

"UMBRA NEXUS - CITY BOUNDS STATUS SUMMARY" | Out-File -Encoding utf8 $TxtReport
"Generated: $($Payload.generated_at)" | Out-File -Encoding utf8 $TxtReport -Append
"Registry count: $($Payload.registry_count)" | Out-File -Encoding utf8 $TxtReport -Append
"" | Out-File -Encoding utf8 $TxtReport -Append

"=== BOUNDS STATUS COUNTS ===" | Out-File -Encoding utf8 $TxtReport -Append
$StatusCounts | Format-Table -AutoSize | Out-File -Encoding utf8 $TxtReport -Append

"=== SCAFFOLD STATUS COUNTS ===" | Out-File -Encoding utf8 $TxtReport -Append
$ScaffoldCounts | Format-Table -AutoSize | Out-File -Encoding utf8 $TxtReport -Append

"=== VERIFIED CITIES ===" | Out-File -Encoding utf8 $TxtReport -Append
$Payload.verified_cities |
  Select-Object city_id, canonical_name, bounds_status, scaffold_status |
  Format-Table -AutoSize |
  Out-File -Encoding utf8 $TxtReport -Append

Write-Host "Bounds summary complete:"
Write-Host $TxtReport
Write-Host $JsonReport