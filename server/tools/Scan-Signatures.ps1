<#
  Scan-Signatures.ps1
  Scans /public for signature console.log lines so you can verify which files
  are instrumented and quickly compare against what the browser logs show.
#>

param(
  [string]$Root = ".",
  [string]$SignaturePrefix = "\[SIGNATURE\]"
)

$ErrorActionPreference = "Stop"

$public = Join-Path $Root "public"
if (-not (Test-Path $public)) { throw "[Scan-Signatures] Missing: $public" }

$files = Get-ChildItem -Path $public -Recurse -Include *.js,*.html -File

$withSig = @()
$withoutSig = @()

foreach ($f in $files) {
  $txt = Get-Content -Raw -Encoding UTF8 $f.FullName
  if ($txt -match $SignaturePrefix) { $withSig += $f.FullName }
  else { $withoutSig += $f.FullName }
}

Write-Host "[Scan-Signatures] SignaturePrefix=$SignaturePrefix"
Write-Host ""
Write-Host "=== WITH SIGNATURE ==="
$withSig | Sort-Object | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "=== WITHOUT SIGNATURE ==="
$withoutSig | Sort-Object | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host ("[Scan-Signatures] Totals: with={0} without={1}" -f $withSig.Count, $withoutSig.Count)
exit 0
