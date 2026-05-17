param(
  [string]$RecordPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RecordPath)) {
  throw "Record does not exist: $RecordPath"
}

$Record = Get-Content $RecordPath -Raw | ConvertFrom-Json

$RequiredFields = @(
  "city_id",
  "canonical_name",
  "source_name",
  "source_type",
  "source_url",
  "source_license",
  "retrieval_timestamp",
  "raw_artifact_path",
  "raw_artifact_sha256",
  "geometry_format",
  "original_crs",
  "normalized_crs",
  "bbox",
  "geometry_sha256",
  "mutation_allowed"
)

$Failures = @()

foreach ($Field in $RequiredFields) {
  if ($null -eq $Record.$Field) {
    $Failures += "Missing required field: $Field"
  }
}

if ($Record.normalized_crs -ne "EPSG:4326") {
  $Failures += "normalized_crs must equal EPSG:4326"
}

if ($Record.mutation_allowed -ne $false) {
  $Failures += "mutation_allowed must be false"
}

if ($Record.bbox.Count -ne 4) {
  $Failures += "bbox must contain 4 coordinates"
}

if ([string]::IsNullOrWhiteSpace($Record.geometry_sha256)) {
  $Failures += "geometry_sha256 missing"
}

Write-Host ""

if ($Failures.Count -eq 0) {
  Write-Host "VALIDATION PASS"
}
else {
  Write-Host "VALIDATION FAIL"
  Write-Host ""

  foreach ($Failure in $Failures) {
    Write-Host $Failure
  }

  exit 1
}

Write-Host ""