$Canonical = Get-Content .\config\canonical_city_registry.json -Raw | ConvertFrom-Json
$Cross = Import-Csv .\logs\black_dragon\full_saturation\canonical_cross_reference.csv

$Remaining = foreach ($City in $Canonical) {

  $Match = $Cross | Where-Object {
    $_.city_id -eq $City.city_id -or
    $_.canonical_name -eq $City.canonical_name
  } | Select-Object -First 1

  if (!$Match) {
    [pscustomobject]@{
      city_id = $City.city_id
      canonical_name = $City.canonical_name
      state = $City.state
    }
  }
}

$Remaining |
  Sort-Object state,canonical_name |
  Format-Table

Write-Host ""
Write-Host "Remaining unsaturated canonical cities:" @($Remaining).Count
