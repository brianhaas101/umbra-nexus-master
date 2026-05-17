$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$OutDir = ".\logs\$ClientId\production_readiness"
$ProfileDir = ".\config\city_profiles"
$ProdRoot = ".\data\clients\$ClientId\production_runtime"

New-Item -ItemType Directory -Force $OutDir,$ProdRoot | Out-Null

$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Profiles = @(Get-ChildItem $ProfileDir -File -Filter "*.json" | ForEach-Object {
  Get-Content $_.FullName -Raw | ConvertFrom-Json
})

$ProfileMap = @{}
foreach ($P in $Profiles) {
  if ($P.city) { $ProfileMap[$P.city] = $P }
}

$Rows = foreach ($City in $Canonical) {
  $Profile = $ProfileMap[$City.city]

  $Sources = @()
  foreach ($Layer in @("gis","open_data","police","fire","parks","permits","public_works","schools","council")) {
    if ($Profile -and $Profile.$Layer -match '^https?://') {
      $Sources += [pscustomobject]@{
        layer = $Layer
        url = $Profile.$Layer
        provenance = "verified_profile_source"
      }
    }
  }

  $CityRoot = Join-Path $ProdRoot $City.city_id
  New-Item -ItemType Directory -Force $CityRoot | Out-Null

  $Manifest = Join-Path $CityRoot "production_asset_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    state = $City.state
    placeholder_allowed = $false
    synthetic_allowed = $false
    production_status = if ($Sources.Count -ge 9) { "hydrated" } else { "incomplete" }
    source_count = $Sources.Count
    sources = $Sources
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Manifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    source_count = $Sources.Count
    passed = ($Sources.Count -ge 9)
    manifest = $Manifest
  }
}

$Failed = @($Rows | Where-Object { !$_.passed })

$Csv = Join-Path $OutDir "deterministic_asset_hydration.csv"
$Json = Join-Path $OutDir "deterministic_asset_hydration.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_cities = $Canonical.Count
  hydrated = @($Rows | Where-Object passed).Count
  failed = $Failed.Count
  gate = if ($Failed.Count -eq 0) { "pass_deterministic_asset_hydration" } else { "fail_asset_hydration_gaps" }
  failed_rows = $Failed
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Deterministic asset hydration complete"
Write-Host "Hydrated:" @($Rows | Where-Object passed).Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass_deterministic_asset_hydration" } else { "fail_asset_hydration_gaps" })

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Asset hydration gaps remain. Do not expose Black Dragon yet."
}
