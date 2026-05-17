param(
  [string]$ChecklistCsv
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $ChecklistCsv)) {
  throw "Missing checklist CSV: $ChecklistCsv"
}

$Rows = Import-Csv $ChecklistCsv
$OutDir = ".\logs\black_dragon\full_saturation"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Report = $Rows |
  Group-Object city |
  ForEach-Object {
    $CityRows = @($_.Group)
    $Verified = @($CityRows | Where-Object { $_.saturation_status -eq "verified_layer" -and $_.eligible_for_lock -eq "true" }).Count
    $Required = $CityRows.Count
    $Pct = [math]::Round(($Verified / $Required) * 100, 2)

    [pscustomobject]@{
      city = $_.Name
      required_layers = $Required
      verified_layers = $Verified
      missing_layers = $Required - $Verified
      saturation_percent = $Pct
      lock_status = if ($Verified -eq $Required) { "locked" } else { "not_locked" }
    }
  }

$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Path = Join-Path $OutDir "saturation_audit_${Stamp}.csv"
$Report | Export-Csv -NoTypeInformation -Encoding UTF8 $Path

$Report | Format-Table
Write-Host "Saturation audit:"
Write-Host $Path
