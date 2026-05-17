<# 
  Kill-Port.ps1
  Kills the process(es) listening on a given TCP port.
  Safety: requires -ForceKill to actually terminate.
#>

param(
  [Parameter(Mandatory=$false)]
  [int]$Port = 3000,

  [Parameter(Mandatory=$false)]
  [switch]$ForceKill
)

$ErrorActionPreference = "Stop"

Write-Host "[Kill-Port] Port=$Port"

$pids = @()

try {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  }
} catch {
  # Fallback: netstat parse
  $lines = netstat -ano | Select-String -Pattern "LISTENING" | Select-String -Pattern (":$Port\s")
  foreach ($m in $lines) {
    $parts = ($m.Line -split "\s+") | Where-Object { $_ -ne "" }
    # netstat format: Proto LocalAddress ForeignAddress State PID
    $pid = $parts[-1]
    if ($pid -match "^\d+$") { $pids += [int]$pid }
  }
  $pids = $pids | Select-Object -Unique
}

if (-not $pids -or $pids.Count -eq 0) {
  Write-Host ("[Kill-Port] No listener found on :{0}" -f $Port)
  exit 0
}

Write-Host "[Kill-Port] Found listener PIDs:"
$pids | ForEach-Object {
  $p = Get-Process -Id $_ -ErrorAction SilentlyContinue
  if ($p) { Write-Host ("  PID={0}  NAME={1}" -f $_, $p.ProcessName) }
  else { Write-Host ("  PID={0}  NAME=<unknown>" -f $_) }
}

if (-not $ForceKill) {
  Write-Host "[Kill-Port] Dry run only. Re-run with -ForceKill to terminate."
  exit 0
}

foreach ($pid in $pids) {
  try {
    Stop-Process -Id $pid -Force -ErrorAction Stop
    Write-Host ("[Kill-Port] KILLED PID={0}" -f $pid)
  } catch {
    Write-Host ("[Kill-Port] FAILED to kill PID={0}: {1}" -f $pid, $_.Exception.Message)
  }
}

exit 0
