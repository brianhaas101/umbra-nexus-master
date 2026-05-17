<# 
  Restart-DevServer.ps1
  Cleanly restarts your static server for /public.
  Default server: npx serve -l 3000 .
  Assumes run from repo root: Umbra\Nexus
#>

param(
  [Parameter(Mandatory=$false)]
  [int]$Port = 3000,

  [Parameter(Mandatory=$false)]
  [string]$PublicDir = ".\public",

  [Parameter(Mandatory=$false)]
  [string]$Command = "npx",

  [Parameter(Mandatory=$false)]
  [string[]]$Args = @("serve", "-l", "3000", ".")
)

$ErrorActionPreference = "Stop"

function Get-ListenerPids([int]$p) {
  $pids = @()
  try {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction Stop
    if ($conns) { $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique }
  } catch {}
  return $pids
}

Write-Host "[Restart-DevServer] Port=$Port PublicDir=$PublicDir"

# Kill listeners
$pids = Get-ListenerPids $Port
if ($pids -and $pids.Count -gt 0) {
  Write-Host "[Restart-DevServer] Killing existing listener(s)..."
  foreach ($pid in $pids) {
    try {
      Stop-Process -Id $pid -Force -ErrorAction Stop
      Write-Host ("  KILLED PID={0}" -f $pid)
    } catch {
      Write-Host ("  FAILED PID={0}: {1}" -f $pid, $_.Exception.Message)
    }
  }
} else {
  Write-Host "[Restart-DevServer] No existing listener on port."
}

Start-Sleep -Milliseconds 250

# Validate public dir exists
if (-not (Test-Path $PublicDir)) {
  throw "[Restart-DevServer] PublicDir not found: $PublicDir"
}

# Force args to match port if default template was used
if ($Args -contains "3000") {
  $Args = $Args | ForEach-Object { if ($_ -eq "3000") { "$Port" } else { $_ } }
}

Write-Host "[Restart-DevServer] Starting server..."
Write-Host ("  CMD: {0} {1}" -f $Command, ($Args -join " "))
Write-Host ("  CWD: {0}" -f (Resolve-Path $PublicDir))

# Start in a new window so your current terminal stays usable
Start-Process -FilePath $Command -ArgumentList $Args -WorkingDirectory (Resolve-Path $PublicDir) -WindowStyle Normal

Write-Host "[Restart-DevServer] Done."
exit 0
