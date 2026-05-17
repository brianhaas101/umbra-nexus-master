$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"

$ManifestPath = ".\manifest.json"
$CrossRefPath = ".\logs\$ClientId\full_saturation\canonical_cross_reference.csv"

if (!(Test-Path $ManifestPath)) {
  throw "Missing manifest.json"
}

if (!(Test-Path $CrossRefPath)) {
  throw "Missing canonical cross-reference CSV."
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Cross = Import-Csv $CrossRefPath

# ---------------------------------------------------
# Find unresolved saturated cities
# ---------------------------------------------------

$Missing = $Cross |
  Where-Object { $_.matched -eq "False" }

Write-Host ""
Write-Host "Unresolved saturated cities:" $Missing.Count

# ---------------------------------------------------
# Generate deterministic IDs
# ---------------------------------------------------

function New-DeterministicCityId {
  param([string]$Name)

  $Hash = [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA1]::Create().ComputeHash(
      [System.Text.Encoding]::UTF8.GetBytes($Name.ToLowerInvariant())
    )
  ).Replace("-", "").Substring(0,8).ToLowerInvariant()

  return "city_$Hash"
}

# ---------------------------------------------------
# State lookup
# ---------------------------------------------------

$StateMap = @{
  "Akron" = "OH"
  "Allentown" = "PA"
  "Ann Arbor" = "MI"
  "Aurora" = "CO"
  "Austin" = "TX"
  "Bellevue" = "WA"
  "Bloomington" = "MN"
  "Boise" = "ID"
  "Chandler" = "AZ"
  "Charlotte" = "NC"
  "Cincinnati" = "OH"
  "Cleveland" = "OH"
  "Colorado Springs" = "CO"
  "Columbus" = "OH"
  "Dallas" = "TX"
  "Denver" = "CO"
  "Detroit" = "MI"
  "Duluth" = "MN"
  "Durham" = "NC"
  "El Paso" = "TX"
  "Erie" = "PA"
  "Eugene" = "OR"
  "Flint" = "MI"
  "Fort Collins" = "CO"
  "Fort Worth" = "TX"
  "Fresno" = "CA"
  "Grand Rapids" = "MI"
  "Greensboro" = "NC"
  "Gresham" = "OR"
  "Henderson" = "NV"
  "Hillsboro" = "OR"
  "Houston" = "TX"
  "Idaho Falls" = "ID"
  "Jacksonville" = "FL"
  "Lakewood" = "CO"
  "Lansing" = "MI"
  "Las Cruces" = "NM"
  "Las Vegas" = "NV"
  "Los Angeles" = "CA"
  "Meridian" = "ID"
  "Mesa" = "AZ"
  "Miami" = "FL"
  "Minneapolis" = "MN"
  "Nampa" = "ID"
  "North Las Vegas" = "NV"
  "Orem" = "UT"
  "Orlando" = "FL"
  "Philadelphia" = "PA"
  "Phoenix" = "AZ"
  "Pittsburgh" = "PA"
  "Pocatello" = "ID"
  "Portland" = "OR"
  "Provo" = "UT"
  "Raleigh" = "NC"
  "Reading" = "PA"
  "Reno" = "NV"
  "Rio Rancho" = "NM"
  "Rochester" = "MN"
  "Roswell" = "NM"
  "Sacramento" = "CA"
  "Salem" = "OR"
  "Salt Lake City" = "UT"
  "San Diego" = "CA"
  "San Jose" = "CA"
  "Santa Fe" = "NM"
  "Scottsdale" = "AZ"
  "Seattle" = "WA"
  "Sparks" = "NV"
  "Spokane" = "WA"
  "St Paul" = "MN"
  "St Petersburg" = "FL"
  "Tacoma" = "WA"
  "Tampa" = "FL"
  "Toledo" = "OH"
  "Tucson" = "AZ"
  "Vancouver" = "WA"
  "West Jordan" = "UT"
  "West Valley City" = "UT"
  "Winston-Salem" = "NC"
"Kansas City" = "MO"
"St Louis" = "MO"
"Springfield" = "MO"
"Columbia" = "MO"
"Independence" = "MO"
"Nashville" = "TN"
"Memphis" = "TN"
"Knoxville" = "TN"
"Chattanooga" = "TN"
"Clarksville" = "TN"
  "Broken Arrow" = "OK"
  "Edmond" = "OK"
  "Norman" = "OK"
  "Bowling Green" = "KY"
  "Covington" = "KY"
  "Lexington" = "KY"
  "Louisville" = "KY"
  "Owensboro" = "KY"
}

# ---------------------------------------------------
# Append missing cities safely
# ---------------------------------------------------

$Added = @()

foreach ($Row in $Missing) {

  $City = $Row.saturation_city.Trim()

  if (!$StateMap.ContainsKey($City)) {
    Write-Warning "No state mapping for: $City"
    continue
  }

  $State = $StateMap[$City]

  $Canonical = "$City, $State"

  $Exists = $Manifest |
    Where-Object { $_.name -eq $Canonical }

  if ($Exists) {
    continue
  }

  $Entry = [ordered]@{
    city_id = New-DeterministicCityId $Canonical
    name = $Canonical
    scaffold_status = "saturation_registered"
    bounds_status = "pending_boundary_validation"
    tiles_url = "/assets/city_tiles/$((New-DeterministicCityId $Canonical))/{z}/{x}/{y}.jpg"
  }

  $Manifest += [pscustomobject]$Entry
  $Added += [pscustomobject]$Entry
}

# ---------------------------------------------------
# Backup manifest
# ---------------------------------------------------

$Backup = ".\manifest.backup_$(Get-Date -Format yyyyMMdd_HHmmss).json"
Copy-Item $ManifestPath $Backup

# ---------------------------------------------------
# Save updated manifest
# ---------------------------------------------------

$Manifest |
  Sort-Object name |
  ConvertTo-Json -Depth 20 |
  Set-Content -Encoding UTF8 $ManifestPath

# ---------------------------------------------------
# Export reconciliation report
# ---------------------------------------------------

$ReconPath = ".\logs\$ClientId\full_saturation\manifest_reconciliation_report.json"

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  added_city_count = $Added.Count
  backup_manifest = $Backup
  reconciled_cities = $Added
} |
ConvertTo-Json -Depth 20 |
Set-Content -Encoding UTF8 $ReconPath

Write-Host ""
Write-Host "Manifest reconciliation complete"
Write-Host "Cities added:" $Added.Count
Write-Host "Backup:" $Backup
Write-Host "Report:" $ReconPath




