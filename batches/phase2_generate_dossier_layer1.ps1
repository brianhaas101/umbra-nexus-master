$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$Root = ".\data\clients\$ClientId\globe_materialization"
$OutDir = ".\logs\$ClientId\globe_materialization"
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)

$Rows = foreach ($City in $Canonical) {
  $CityRoot = Join-Path $Root $City.city_id
  $DossierDir = Join-Path $CityRoot "dossiers"
  New-Item -ItemType Directory -Force $DossierDir | Out-Null

  $Dossiers = @()

  foreach ($Layer in @("civic","safety","infrastructure","education","parks","governance")) {
    $DossierId = "$($City.city_id)_dossier_$Layer"
    $DossierPath = Join-Path $DossierDir "$DossierId.json"

    [ordered]@{
      dossier_id = $DossierId
      city_id = $City.city_id
      canonical_name = $City.canonical_name
      dossier_layer = $Layer
      dossier_status = "placeholder_content_pending"
      provenance = "phase2_deterministic_dossier_scaffold"
      generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $DossierPath

    $Dossiers += [ordered]@{
      dossier_id = $DossierId
      dossier_layer = $Layer
      path = $DossierPath
      status = "created"
    }
  }

  $Manifest = Join-Path $DossierDir "dossier_manifest.json"

  [ordered]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    generated_utc = (Get-Date).ToUniversalTime().ToString("o")
    dossier_status = "scaffold_dossiers_created"
    dossier_version = 1
    dossier_count = $Dossiers.Count
    dossiers = $Dossiers
  } | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Manifest

  [pscustomobject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    dossier_count = $Dossiers.Count
    dossier_manifest = $Manifest
    status = "dossiers_initialized"
  }
}

$Csv = Join-Path $OutDir "dossier_generation_layer1_$Stamp.csv"
$Json = Join-Path $OutDir "dossier_generation_layer1_$Stamp.json"

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv
$Rows | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Dossier layer 1 complete"
Write-Host "Cities:" $Rows.Count
Write-Host "Dossiers per city:" 6
Write-Host "Total dossier records:" (($Rows | Measure-Object dossier_count -Sum).Sum)
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
