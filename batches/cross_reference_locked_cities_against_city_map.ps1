$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = Resolve-Path "."
$OutDir = Join-Path $Root "logs\$ClientId\full_saturation"
$ReportPath = Join-Path $OutDir "city_map_cross_reference_report.json"
$CsvPath = Join-Path $OutDir "city_map_cross_reference_report.csv"

# 1. Find candidate city-map inventory files
$MapFiles = @(
  ".\public\data\cities.json",
  ".\public\data\city_map.json",
  ".\public\data\clients\$ClientId\cities.json",
  ".\public\data\clients\$ClientId\city_map.json",
  ".\data\cities.json",
  ".\data\city_map.json",
  ".\config\cities.json",
  ".\manifest.json"
) | Where-Object { Test-Path $_ }

if ($MapFiles.Count -eq 0) {
  throw "No city map inventory file found. Need authoritative map-system city list before continuing."
}

# 2. Extract city names from map files
$MapCities = New-Object System.Collections.Generic.HashSet[string]

function Add-CityName {
  param([string]$Name)
  if (![string]::IsNullOrWhiteSpace($Name)) {
    [void]$MapCities.Add($Name.Trim())
  }
}

foreach ($File in $MapFiles) {
  $Raw = Get-Content $File -Raw

  try {
    $Json = $Raw | ConvertFrom-Json

    $Json | ConvertTo-Json -Depth 100 | Select-String -Pattern '"city"\s*:\s*"([^"]+)"','"name"\s*:\s*"([^"]+)"','"label"\s*:\s*"([^"]+)"' -AllMatches |
      ForEach-Object {
        foreach ($M in $_.Matches) {
          Add-CityName $M.Groups[1].Value
        }
      }
  } catch {
    Select-String -Path $File -Pattern '([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})' -AllMatches |
      ForEach-Object {
        foreach ($M in $_.Matches) {
          Add-CityName $M.Groups[1].Value
        }
      }
  }
}

# 3. Collect locked saturation cities
$AuditFiles = Get-ChildItem ".\logs\$ClientId\full_saturation\saturation_audit_*.csv" |
  Sort-Object LastWriteTime

if ($AuditFiles.Count -eq 0) {
  throw "No saturation audit CSV files found."
}

$LockedRows = foreach ($File in $AuditFiles) {
  Import-Csv $File.FullName | Where-Object { $_.lock_status -eq "locked" } | ForEach-Object {
    [pscustomobject]@{
      city = $_.city
      audit_file = $File.FullName
      required_layers = $_.required_layers
      verified_layers = $_.verified_layers
      saturation_percent = $_.saturation_percent
      lock_status = $_.lock_status
    }
  }
}

$LatestByCity = $LockedRows |
  Group-Object city |
  ForEach-Object { $_.Group | Sort-Object audit_file | Select-Object -Last 1 }

# 4. Cross-reference
$Results = foreach ($Row in $LatestByCity) {
  $InMap = $MapCities.Contains($Row.city)

  [pscustomobject]@{
    city = $Row.city
    in_city_map_system = $InMap
    lock_status = $Row.lock_status
    verified_layers = $Row.verified_layers
    required_layers = $Row.required_layers
    saturation_percent = $Row.saturation_percent
    status = if ($InMap) { "ok" } else { "drift_not_in_city_map" }
  }
}

$Drift = @($Results | Where-Object { $_.in_city_map_system -eq $false })
$Ok = @($Results | Where-Object { $_.in_city_map_system -eq $true })

# 5. Write reports
$Results | Sort-Object city | Export-Csv -NoTypeInformation -Encoding UTF8 $CsvPath

$Report = [ordered]@{
  purpose = "city_map_cross_reference_gate"
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  map_files_used = $MapFiles
  map_city_count = $MapCities.Count
  locked_city_count = @($LatestByCity).Count
  matched_locked_city_count = @($Ok).Count
  drift_city_count = @($Drift).Count
  gate_status = if (@($Drift).Count -eq 0) { "pass" } else { "fail_do_not_advance" }
  drift_cities = @($Drift | Select-Object city,status)
  hardlock = [ordered]@{
    no_cross_city_contamination = $true
    city_map_membership_required = $true
    no_expansion_until_drift_resolved = $true
  }
}

$Report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $ReportPath

Write-Host ""
Write-Host "City map cross-reference complete"
Write-Host "Map cities:" $MapCities.Count
Write-Host "Locked cities:" @($LatestByCity).Count
Write-Host "Matched:" @($Ok).Count
Write-Host "Drift:" @($Drift).Count
Write-Host "Gate:" $Report.gate_status
Write-Host "CSV:" $CsvPath
Write-Host "JSON:" $ReportPath

if (@($Drift).Count -gt 0) {
  Write-Host ""
  Write-Host "Drift cities:"
  $Drift | Sort-Object city | Format-Table city,status
}
