<#
  Capture-ServerLog.ps1
  Runs a command and captures output to server/tools/reports/<timestamp>_server.log
  Usage example:
    .\server\tools\ps\Capture-ServerLog.ps1 -Command "npm run dev"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$Command,
  [string]$Root = ".",
  [string]$OutDir = "server\tools\reports"
)

$ErrorActionPreference = "Stop"

$destBase = Join-Path $Root $OutDir
New-Item -ItemType Directory -Force -Path $destBase | Out-Null

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = Join-Path $destBase ("{0}_server.log" -f $stamp)

Write-Host "[Capture-ServerLog] Logging to: $logPath"
Write-Host "[Capture-ServerLog] Command: $Command"
Write-Host "[Capture-ServerLog] Stop with Ctrl+C"

# Start via cmd so normal npm scripts behave
cmd /c "$Command 1>> `"$logPath`" 2>>&1"
