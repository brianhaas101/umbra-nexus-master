$ErrorActionPreference = "Stop"

$ClientId = "black_dragon"
$Root = ".\data\clients\$ClientId"
$OutDir = ".\logs\$ClientId\production_readiness"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$BadPatterns = @(
  "placeholder",
  "scaffold",
  "synthetic",
  "queued",
  "pending",
  "payload_partial",
  "unverified_scaffold"
)

$Files = Get-ChildItem $Root -Recurse -File -Include *.json,*.csv -ErrorAction SilentlyContinue

$Hits = foreach ($File in $Files) {
  $Text = Get-Content $File.FullName -Raw -ErrorAction SilentlyContinue

  foreach ($Pattern in $BadPatterns) {
    if ($Text -match $Pattern) {
      [pscustomobject]@{
        file = $File.FullName
        pattern = $Pattern
      }
    }
  }
}

$Csv = Join-Path $OutDir "placeholder_blocker_scan.csv"
$Json = Join-Path $OutDir "placeholder_blocker_scan.json"

$Hits | Export-Csv -NoTypeInformation -Encoding UTF8 $Csv

[ordered]@{
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  scanned_files = $Files.Count
  blocker_hits = @($Hits).Count
  gate = if (@($Hits).Count -eq 0) { "pass_no_placeholders" } else { "fail_placeholders_detected" }
  hits = $Hits
} | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $Json

Write-Host ""
Write-Host "Placeholder blocker scan complete"
Write-Host "Files scanned:" $Files.Count
Write-Host "Blocker hits:" @($Hits).Count
Write-Host "Gate:" $(if (@($Hits).Count -eq 0) { "pass_no_placeholders" } else { "fail_placeholders_detected" })

if (@($Hits).Count -gt 0) {
  $Hits | Select-Object -First 50 | Format-Table
  throw "Placeholder/scaffold blockers detected. Do not prepare Black Dragon access."
}
