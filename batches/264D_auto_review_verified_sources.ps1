$ErrorActionPreference = "Stop"

$Csv = ".\data\clients\black_dragon\reviewed_intake\batch_264C_verified_starter_sources.csv"

if (!(Test-Path $Csv)) {
  throw "Missing CSV"
}

$Rows = Import-Csv $Csv

foreach ($Row in $Rows) {

  $Trusted =
    $Row.source_url -match "^https://"

  if (
    $Trusted -and
    $Row.city_locality_check -eq "pass" -and
    $Row.provenance_status -eq "verified"
  ) {

    $Row.manual_review_status = "reviewed"
    $Row.eligible_for_import = "true"
    $Row.notes = "$($Row.notes) | auto-reviewed city-local verified source"
  }
}

$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

Write-Host "Batch 264D complete:"
Write-Host $Csv
