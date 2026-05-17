<# 
  Check-PortUsage.ps1
  Shows which process (PID + name) is listening on a given TCP port.
  Run from repo root: Umbra\Nexus
#>

param(
  [Parameter(Mandatory=$false)]
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

Write-Host "[Check-PortUsage] Port=$Port"

# Prefer Get-NetTCPConnection (Windows 10/11)
try {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
} catch {
  $conns = @()
}

if ($conns -and $conns.Count -gt 0) {
  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    $p = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($p) {
      Write-Host ("LISTENING 0.0.0.0:{0}  PID={1}  NAME={2}" -f $Port, $pid, $p.ProcessName)
    } else {
      Write-Host ("LISTENING 0.0.0.0:{0}  PID={1}  NAME=<unknown>" -f $Port, $pid)
    }
  }
  exit 0
}

# Fallback: netstat parsing (still accurate enough)
$netstat = (netstat -ano | Select-String -Pattern "LISTENING" | Select-String -Pattern (":$Port\s"))
if ($netstat) {
  Write-Host "[Check-PortUsage] netstat fallback:"
  $netstat | ForEach-Object { $_.Line }
  exit 0
}

Write-Host ("[Check-PortUsage] No listener found on :{0}" -f $Port)
exit 0
