$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Results = foreach ($City in $Canonical) {
  $DossierDir = Join-Path (Join-Path $Root $City.city_id) "dossiers"
  $Manifest = Join-Path $DossierDir "dossier_manifest.json"
  $Files = @(Get-ChildItem $DossierDir -File -Filter "*_dossier_*.json" -ErrorAction SilentlyContinue)

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    manifest_exists = Test-Path $Manifest
    dossier_files = $Files.Count
    passed = ((Test-Path $Manifest) -and $Files.Count -eq 6)
  }
}

$Failed = @($Results | Where-Object { !$_.passed })

$Csv = ".\logs\$ClientId\globe_materialization\dossier_layer1_validation.csv"
$Results | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host ""
Write-Host "Dossier layer 1 validation complete"
Write-Host "Cities checked:" $Results.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Dossier layer 1 validation failed."
}
