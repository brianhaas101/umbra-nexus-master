$ErrorActionPreference = "Stop"

$WavePath = "logs\founder_geospatial_audit\founder_geospatial_wave_001.json"
$OutDir = "logs\founder_geospatial_audit\wave_001_payloads"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$Wave = Get-Content $WavePath -Raw | ConvertFrom-Json

foreach ($City in $Wave.cities) {
  $Payload = [PSCustomObject]@{
    city_id = $City.city_id
    canonical_name = $City.canonical_name
    city = $City.city
    state = $City.state

    verified_centroid_lat = $null
    verified_centroid_lon = $null

    boundary_source_name = $null
    boundary_source_url = $null
    boundary_source_retrieved_at = $null
    boundary_source_sha256 = $null

    boundary_crs = "EPSG:4326"
    boundary_bbox = $null
    boundary_geometry_sha256 = $null

    spatial_confidence_class = "E"
    verification_status = "UNVERIFIED_SCAFFOLD"
    verified_by_process = "founder_geo_wave_001"
    verification_timestamp = $null

    mutation_allowed = $false
  }

  $OutPath = Join-Path $OutDir "$($City.city_id)_verification_payload.json"
  $Payload | ConvertTo-Json -Depth 8 | Out-File -Encoding utf8 $OutPath
}

Write-Host "Created verification payloads:"
Write-Host $OutDir