$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"

$OutDir = ".\logs\$ClientId\integrity_hardening"
$FreezeDir = ".\artifacts\$ClientId\registry_freeze_$Stamp"

New-Item -ItemType Directory -Force $OutDir | Out-Null
New-Item -ItemType Directory -Force $FreezeDir | Out-Null

# 1. Rebuild canonical registry from manifest authority
pwsh -File .\batches\build_canonical_city_registry_adapter.ps1

# 2. Verify saturation coverage
pwsh -File .\batches\verify_canonical_city_processing.ps1

# 3. Load sources
$Manifest = @(Get-Content .\manifest.json -Raw | ConvertFrom-Json)
$Canonical = @(Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json)
$Alias = Get-Content .\config\city_alias_map.json -Raw | ConvertFrom-Json
$Cross = @(Import-Csv .\logs\$ClientId\full_saturation\canonical_cross_reference.csv)
$Processing = Get-Content .\logs\$ClientId\globe_integrity\canonical_processing_verification.json -Raw | ConvertFrom-Json

# 4. Structural checks
$Checks = @()

function Add-Check($Name, $Pass, $Details) {
  $script:Checks += [pscustomobject]@{
    check = $Name
    passed = [bool]$Pass
    details = $Details
  }
}

$DuplicateCityIds = @($Canonical | Group-Object city_id | Where-Object Count -gt 1)
$DuplicateNames = @($Canonical | Group-Object canonical_name | Where-Object Count -gt 1)
$MissingTileUrls = @($Canonical | Where-Object { [string]::IsNullOrWhiteSpace($_.tiles_url) })
$BadTileUrls = @($Canonical | Where-Object { $_.tiles_url -notmatch [regex]::Escape($_.city_id) })
$UnmatchedCross = @($Cross | Where-Object { $_.matched -ne "True" -and $_.matched -ne $true })

Add-Check "manifest_count_equals_116" ($Manifest.Count -eq 116) "manifest=$($Manifest.Count)"
Add-Check "canonical_count_equals_116" ($Canonical.Count -eq 116) "canonical=$($Canonical.Count)"
Add-Check "cross_reference_count_equals_116" ($Cross.Count -eq 116) "cross=$($Cross.Count)"
Add-Check "processed_count_equals_116" ($Processing.processed_cities -eq 116) "processed=$($Processing.processed_cities)"
Add-Check "unprocessed_count_zero" ($Processing.unprocessed_cities -eq 0) "unprocessed=$($Processing.unprocessed_cities)"
Add-Check "duplicate_city_ids_zero" ($DuplicateCityIds.Count -eq 0) "duplicates=$($DuplicateCityIds.Count)"
Add-Check "duplicate_canonical_names_zero" ($DuplicateNames.Count -eq 0) "duplicates=$($DuplicateNames.Count)"
Add-Check "missing_tile_urls_zero" ($MissingTileUrls.Count -eq 0) "missing=$($MissingTileUrls.Count)"
Add-Check "bad_tile_url_city_id_refs_zero" ($BadTileUrls.Count -eq 0) "bad=$($BadTileUrls.Count)"
Add-Check "unmatched_cross_reference_zero" ($UnmatchedCross.Count -eq 0) "unmatched=$($UnmatchedCross.Count)"

$Failed = @($Checks | Where-Object { !$_.passed })

# 5. Write reports
$Csv = Join-Path $OutDir "integrity_hardening_gate_$Stamp.csv"
$Json = Join-Path $OutDir "integrity_hardening_gate_$Stamp.json"

$Checks | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  gate = if ($Failed.Count -eq 0) { "pass" } else { "fail" }
  failed_count = $Failed.Count
  checks = $Checks
  duplicate_city_ids = $DuplicateCityIds
  duplicate_names = $DuplicateNames
  missing_tile_urls = $MissingTileUrls
  bad_tile_urls = $BadTileUrls
  unmatched_cross_reference = $UnmatchedCross
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

# 6. Freeze registry artifacts only if hardening passes
if ($Failed.Count -eq 0) {
  Copy-Item .\manifest.json $FreezeDir
  Copy-Item .\config\canonical_city_registry.json $FreezeDir
  Copy-Item .\config\city_alias_map.json $FreezeDir
  Copy-Item .\logs\$ClientId\full_saturation\canonical_cross_reference.csv $FreezeDir
  Copy-Item .\logs\$ClientId\full_saturation\canonical_cross_reference.json $FreezeDir
  Copy-Item .\logs\$ClientId\globe_integrity\canonical_processing_verification.json $FreezeDir
}

Write-Host ""
Write-Host "Integrity hardening complete"
Write-Host "Checks:" $Checks.Count
Write-Host "Failed:" $Failed.Count
Write-Host "Gate:" $(if ($Failed.Count -eq 0) { "pass" } else { "fail" })
Write-Host "CSV:" $Csv
Write-Host "JSON:" $Json
Write-Host "Freeze:" $FreezeDir

if ($Failed.Count -gt 0) {
  $Failed | Format-Table
  throw "Integrity hardening failed. Do not run full audit yet."
}
