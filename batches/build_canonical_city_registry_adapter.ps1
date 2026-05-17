$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$ManifestPath = ".\manifest.json"

if (!(Test-Path $ManifestPath)) {
  throw "Missing manifest.json"
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

# -----------------------------------------
# Build canonical registry
# -----------------------------------------

$Canonical = foreach ($Row in $Manifest) {

  $Full = $Row.name.Trim()

  $City = $Full
  $State = ""

  if ($Full -match "^(.*?),\s*([A-Z]{2})$") {
    $City = $Matches[1].Trim()
    $State = $Matches[2].Trim()
  }

  [pscustomobject]@{
    city_id = $Row.city_id
    canonical_name = $Full
    city = $City
    state = $State
    scaffold_status = $Row.scaffold_status
    bounds_status = $Row.bounds_status
    tiles_url = $Row.tiles_url
  }
}

# -----------------------------------------
# Export canonical registry
# -----------------------------------------

$CanonicalPath = ".\config\canonical_city_registry.json"
$Canonical | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $CanonicalPath

# -----------------------------------------
# Build alias map
# -----------------------------------------

$AliasMap = @{}

foreach ($Row in $Canonical) {

  $Key = $Row.city.ToLowerInvariant()

  if (!$AliasMap.ContainsKey($Key)) {
    $AliasMap[$Key] = @{
      canonical_name = $Row.canonical_name
      city_id = $Row.city_id
      state = $Row.state
    }
  }
}

$AliasPath = ".\config\city_alias_map.json"
$AliasMap | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 $AliasPath

# -----------------------------------------
# Re-run cross reference correctly
# -----------------------------------------

$AuditFiles = Get-ChildItem ".\logs\$ClientId\full_saturation\saturation_audit_*.csv"

$LockedRows = foreach ($File in $AuditFiles) {
  Import-Csv $File.FullName |
    Where-Object { $_.lock_status -eq "locked" }
}

$Results = foreach ($Row in $LockedRows) {

  $Key = $Row.city.Trim().ToLowerInvariant()

  $Resolved = $AliasMap[$Key]

  [pscustomobject]@{
    saturation_city = $Row.city
    canonical_name = if ($Resolved) { $Resolved.canonical_name } else { "" }
    city_id = if ($Resolved) { $Resolved.city_id } else { "" }
    matched = [bool]$Resolved
    verified_layers = $Row.verified_layers
    saturation_percent = $Row.saturation_percent
    lock_status = $Row.lock_status
  }
}

$Unique = $Results |
  Sort-Object saturation_city -Unique

$Matched = @($Unique | Where-Object { $_.matched }).Count
$Missing = @($Unique | Where-Object { !$_.matched }).Count

$OutCsv = ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"
$OutJson = ".\logs\$ClientId\full_saturation\canonical_cross_reference.json"

$Unique | Export-Csv -NoTypeInformation -Encoding UTF8 $OutCsv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  canonical_registry = $CanonicalPath
  alias_map = $AliasPath
  locked_city_count = @($Unique).Count
  matched_city_count = $Matched
  unmatched_city_count = $Missing
  gate_status = if ($Missing -eq 0) { "pass" } else { "fail" }
} |
ConvertTo-Json -Depth 10 |
Set-Content -Encoding UTF8 $OutJson

Write-Host ""
Write-Host "Canonical registry adapter complete"
Write-Host "Canonical registry:" $CanonicalPath
Write-Host "Alias map:" $AliasPath
Write-Host "Matched:" $Matched
Write-Host "Missing:" $Missing
Write-Host "Gate:" $(if ($Missing -eq 0) { "pass" } else { "fail" })
Write-Host "Cross reference CSV:" $OutCsv
Write-Host "Cross reference JSON:" $OutJson
