$ErrorActionPreference = "Stop"

$RegistryPath = "config\canonical_city_registry.json"
$ReportDir = "logs\founder_geospatial_audit"
$WaveJson = Join-Path $ReportDir "founder_geospatial_wave_001.json"
$WaveTxt = Join-Path $ReportDir "founder_geospatial_wave_001.txt"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Registry = Get-Content $RegistryPath -Raw | ConvertFrom-Json

$PriorityCities = @(
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Washington, DC"
)

$WaveCities = foreach ($Name in $PriorityCities) {
  $Registry | Where-Object { $_.canonical_name -eq $Name }
}

$Payload = [PSCustomObject]@{
  wave_id = "GEO-WAVE-001"
  generated_at = (Get-Date -Format o)
  mode = "read_only_planning"
  mutation_allowed = $false
  city_count = $WaveCities.Count
  cities = $WaveCities
}

$Payload | ConvertTo-Json -Depth 8 | Out-File -Encoding utf8 $WaveJson

"UMBRA NEXUS - FOUNDER GEOSPATIAL WAVE 001" | Out-File -Encoding utf8 $WaveTxt
"Generated: $($Payload.generated_at)" | Out-File -Encoding utf8 $WaveTxt -Append
"Mode: read_only_planning" | Out-File -Encoding utf8 $WaveTxt -Append
"Mutation allowed: false" | Out-File -Encoding utf8 $WaveTxt -Append
"City count: $($Payload.city_count)" | Out-File -Encoding utf8 $WaveTxt -Append
"" | Out-File -Encoding utf8 $WaveTxt -Append

$WaveCities |
  Select-Object city_id, canonical_name, bounds_status, scaffold_status, tiles_url |
  Format-Table -AutoSize |
  Out-File -Encoding utf8 $WaveTxt -Append

Write-Host "Founder wave created:"
Write-Host $WaveTxt
Write-Host $WaveJson