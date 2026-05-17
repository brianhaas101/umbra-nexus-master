<#
  Smoke-Nexus.ps1
  Runs a deterministic local smoke test chain and returns fail-fast.
  Requires the other scripts (11–19) to be present in the same folder.
#>

param(
  [string]$Root = ".",
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$IndexPath = ".\public\index.html",
  [string]$JsonPath = ".\public\data\leads_master.json"
)

$ErrorActionPreference = "Stop"

$psDir = Join-Path $Root "server\tools\ps"
$repDir = Join-Path $Root "server\tools\reports"
New-Item -ItemType Directory -Force -Path $repDir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$out = Join-Path $repDir ("{0}_smoke_nexus.txt" -f $stamp)

function Run-Step([string]$name, [scriptblock]$sb) {
  Add-Content -Encoding UTF8 -Path $out -Value ("`n=== {0} ===" -f $name)
  try {
    & $sb 2>&1 | ForEach-Object {
      Add-Content -Encoding UTF8 -Path $out -Value $_
      Write-Host $_
    }
    Add-Content -Encoding UTF8 -Path $out -Value ("[OK] {0}" -f $name)
  } catch {
    Add-Content -Encoding UTF8 -Path $out -Value ("[FAIL] {0} :: {1}" -f $name, $_.Exception.Message)
    throw
  }
}

Write-Host "[Smoke-Nexus] Report -> $out"
Add-Content -Encoding UTF8 -Path $out -Value ("Smoke Nexus @ {0}" -f (Get-Date).ToString("o"))
Add-Content -Encoding UTF8 -Path $out -Value ("Root={0}" -f (Resolve-Path $Root))

Run-Step "Guard-NoShadowCoreFiles" {
  & (Join-Path $psDir "Guard-NoShadowCoreFiles.ps1") -Root $Root
}

Run-Step "Assert-IndexLoadsExpected" {
  & (Join-Path $psDir "Assert-IndexLoadsExpected.ps1") -IndexPath $IndexPath
}

Run-Step "Validate-LeadsMasterJson" {
  & (Join-Path $psDir "Validate-LeadsMasterJson.ps1") -JsonPath $JsonPath -OutDir "server\tools\reports"
}

Run-Step "Assert-FunctionsInServedJs" {
  & (Join-Path $psDir "Assert-FunctionsInServedJs.ps1") -BaseUrl $BaseUrl
}

Run-Step "Fetch-DevEndpoints" {
  & (Join-Path $psDir "Fetch-DevEndpoints.ps1") -BaseUrl $BaseUrl -IncludeDataJson
}

Write-Host "[Smoke-Nexus] PASS"
exit 0
