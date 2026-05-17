<#
  Verify-ReleaseManifest.ps1
  Verifies a manifest (hashes + size) matches current working tree.
  Usage:
    .\server\tools\ps\Verify-ReleaseManifest.ps1 -ManifestPath .\server\tools\release\release_manifest_FOUNDERV1_*.json
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$ManifestPath
)

$ErrorActionPreference = "Stop"

$mp = Resolve-Path $ManifestPath
$raw = Get-Content -Raw -Encoding UTF8 $mp.Path
$man = $raw | ConvertFrom-Json -Depth 12

$root = [string]$man.root
if ([string]::IsNullOrWhiteSpace($root) -or -not (Test-Path $root)) {
  throw "[Verify-ReleaseManifest] Manifest root invalid or missing: $root"
}

$fails = New-Object System.Collections.Generic.List[string]

foreach ($f in $man.files) {
  $rel = [string]$f.path
  $relWin = $rel -replace "/","\"
  $p = Join-Path $root $relWin

  if (-not (Test-Path $p)) {
    $fails.Add("MISSING: $rel")
    continue
  }

  $h = Get-FileHash -Algorithm SHA256 -Path $p
  $bytes = (Get-Item $p).Length

  $expectedHash = ([string]$f.sha256).ToLowerInvariant()
  $expectedBytes = [int64]$f.bytes

  if ($h.Hash.ToLowerInvariant() -ne $expectedHash) {
    $fails.Add("HASH DRIFT: $rel")
  }
  if ($bytes -ne $expectedBytes) {
    $fails.Add("SIZE DRIFT: $rel (expected $expectedBytes got $bytes)")
  }
}

if ($fails.Count -eq 0) {
  Write-Host "[Verify-ReleaseManifest] PASS: no drift"
  exit 0
}

Write-Host "[Verify-ReleaseManifest] FAIL:"
$fails | ForEach-Object { Write-Host ("- {0}" -f $_) }
exit 1
