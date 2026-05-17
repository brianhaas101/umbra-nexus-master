$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\production_runtime"
$OutDir = ".\logs\$ClientId\production_readiness"

New-Item -ItemType Directory -Force $Root,$OutDir | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Profiles = Get-ChildItem .\config\city_profiles\*.json | ForEach-Object {
  Get-Content $_.FullName -Raw | ConvertFrom-Json
}

$ProfileMap = @{}
foreach ($P in $Profiles) {
  if ($P.city) { $ProfileMap[$P.city] = $P }
}

$Rows = foreach ($City in $Canonical) {
  $Profile = $ProfileMap[$City.city]

  $Sources = @()
  if ($Profile) {
    foreach ($Key in @("gis","open_data","police","fire","parks","permits","public_works","schools","council")) {
      if ($Profile.$Key -and $Profile.$Key -match '^https?://') {
        $Sources += [pscustomobject]@{
          layer = $Key
          url = $Profile.$Key
          provenance = "verified_city_profile"
        }
      }
    }
  }

  $CityRoot = Join-Path $Root $City.city_id
  New-Item -ItemType Directory -Force $CityRoot | Out-Null

  $AssetPath = Join-Path $CityRoot "production_asset_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    production_status = if ($Sources.Count -ge 9) { "hydrated" } else { "incomplete" }
    placeholder_allowed = $false
    synthetic_allowed = $false
    source_count = $Sources.Count
    sources = $Sources
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $AssetPath

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    source_count = $Sources.Count
    asset_manifest = $AssetPath
    passed = ($Sources.Count -ge 9)
  }
}

$Failed = @($Rows | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "production_hydration_validation.csv"
$Json = Join-Path $OutDir "production_hydration_validation.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  hydrated_cities = @($Rows | Where-Object passed).Count
  failed_cities = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_production_hydration" } else { "fail_production_hydration" }
  failed = $Failed
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Production hydration validation complete"
Write-Host "Canonical cities:" $Canonical.Count
Write-Host "Hydrated cities:" @($Rows | Where-Object passed).Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_production_hydration" } else { "fail_production_hydration" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Production hydration failed. Do not expose client access."
}
