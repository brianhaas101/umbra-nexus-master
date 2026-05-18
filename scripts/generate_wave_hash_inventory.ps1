param(
  [Parameter(Mandatory = $true)]
  [string]$WaveId
)

$ErrorActionPreference = "Stop"

$WaveDir = "ops\geo_provenance\$WaveId"

if (!(Test-Path $WaveDir)) {
  throw "Wave directory not found: $WaveDir"
}

$Records = Get-ChildItem $WaveDir -Recurse -File -Filter "*.json" |
  Where-Object {
    $_.FullName -notmatch "\\reports\\"
  }

$Inventory = @()

foreach ($Record in $Records) {
  $Inventory += [ordered]@{
    path = $Record.FullName.Replace((Get-Location).Path + "\", "")
    sha256 = (Get-FileHash $Record.FullName -Algorithm SHA256).Hash
    length_bytes = $Record.Length
  }
}

$ReportDir = Join-Path $WaveDir "reports"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$OutPath = Join-Path $ReportDir "wave_hash_inventory.json"

$Report = [ordered]@{
  wave_id = $WaveId
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("o")
  inventory_count = $Inventory.Count
  records = $Inventory
}

$Report | ConvertTo-Json -Depth 10 | Out-File -Encoding utf8 $OutPath

Write-Host ""
Write-Host "Wave hash inventory written:"
Write-Host $OutPath
Write-Host ""
