param(
  [string]$Public = (Resolve-Path ".\public").Path,
  [string]$OutDir = ".\_umbra_audit"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$files = Get-ChildItem $Public -Recurse -File -Filter *.js | Select-Object -ExpandProperty FullName

$results = foreach ($f in $files) {
  $cmd = "node -c `"$f`""
  $p = Start-Process powershell -ArgumentList "-NoProfile","-Command",$cmd -PassThru -NoNewWindow -Wait
  [PSCustomObject]@{ File=$f; ExitCode=$p.ExitCode }
}

$results | Where-Object { $_.ExitCode -ne 0 } | Out-File (Join-Path $OutDir "syntax_failures.txt")
$results | Out-File (Join-Path $OutDir "syntax_all.txt")

Write-Host "Wrote syntax report to $OutDir"
