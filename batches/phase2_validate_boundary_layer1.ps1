$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $BoundaryDir = Join-Path (Join-Path $Root $City.city_id) "boundaries"
  $Manifest = Join-Path $BoundaryDir "boundary_manifest.json"
  $Files = @(Get-ChildItem $BoundaryDir -File -Filter "*_boundary.scaffold.json" -ErrorAction SilentlyContinue)

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    manifest_exists = Test-Path $Manifest
    boundary_files = $Files.Count
    passed = ((Test-Path $Manifest) -and $Files.Count -eq 1)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = ".\logs\$ClientId\globe_materialization\boundary_layer1_validation.csv"
$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Boundary layer 1 validation complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Boundary layer 1 validation failed."
}
