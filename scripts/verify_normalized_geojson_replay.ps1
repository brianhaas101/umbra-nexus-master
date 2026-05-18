param(
  [string]$GeoJsonPath,
  [string]$ExpectedHash
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $GeoJsonPath)) {
  throw "Normalized GeoJSON not found: $GeoJsonPath"
}

$ActualHash = (
  Get-FileHash $GeoJsonPath -Algorithm SHA256
).Hash

Write-Host ""
Write-Host "EXPECTED SHA256:"
Write-Host $ExpectedHash
Write-Host ""

Write-Host "ACTUAL SHA256:"
Write-Host $ActualHash
Write-Host ""

if ($ActualHash -ne $ExpectedHash) {
  throw "REPLAY VALIDATION FAILED"
}

Write-Host "REPLAY VALIDATION PASS"
Write-Host ""