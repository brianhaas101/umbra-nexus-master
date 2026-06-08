$Root = "C:\Dev\Nexus_MASTER"

$ClassificationPath =
  Join-Path $Root "public\data\certification\master\nexus_capability_classification_matrix_476.json"

$JsonOut =
  Join-Path $Root "public\data\certification\master\nexus_command_center_activation_matrix_477.json"

$MdOut =
  Join-Path $Root "public\data\certification\master\NEXUS_COMMAND_CENTER_ACTIVATION_MATRIX_477.md"

if (-not (Test-Path $ClassificationPath)) {
  throw "Missing Batch 476 output."
}

$Classification =
  Get-Content $ClassificationPath -Raw |
  ConvertFrom-Json

$ActivateSystems =
  $Classification.matrix |
  Where-Object { $_.action -eq "ACTIVATE" }

$IndexText = ""

if (Test-Path ".\index.html") {
  $IndexText = Get-Content ".\index.html" -Raw
}

function ReadText($Path) {
  if (Test-Path $Path) {
    return Get-Content $Path -Raw -ErrorAction SilentlyContinue
  }
  return ""
}

$Results = @()

foreach ($item in $ActivateSystems) {

  $file = $item.file

  $fullPath = Join-Path $Root $file

  $text = ReadText $fullPath

  $loaded =
    $IndexText -match [regex]::Escape((Split-Path $file -Leaf))

  $runtimeConnected =
    $text -match "Runtime|runtime"

  $intelligenceConnected =
    $text -match "Intelligence|intel"

  $commandConnected =
    $text -match "Command|command"

  $dossierConnected =
    $text -match "Dossier|dossier"

  $uiReachable =
    $text -match "panel|drawer|workspace|surface|dashboard|ui"

  $score = 0

  if ($loaded) { $score++ }
  if ($runtimeConnected) { $score++ }
  if ($intelligenceConnected) { $score++ }
  if ($commandConnected) { $score++ }
  if ($dossierConnected) { $score++ }
  if ($uiReachable) { $score++ }

  $status = "DISCONNECTED"

  if ($score -ge 5) {
    $status = "READY"
  }
  elseif ($score -ge 3) {
    $status = "PARTIAL"
  }

  $Results += [PSCustomObject]@{
    file = $file
    domain = $item.domain
    loaded = $loaded
    runtimeConnected = $runtimeConnected
    intelligenceConnected = $intelligenceConnected
    commandConnected = $commandConnected
    dossierConnected = $dossierConnected
    uiReachable = $uiReachable
    score = $score
    status = $status
  }
}

$Summary = [ordered]@{
  ready =
    @($Results | Where-Object {$_.status -eq "READY"}).Count

  partial =
    @($Results | Where-Object {$_.status -eq "PARTIAL"}).Count

  disconnected =
    @($Results | Where-Object {$_.status -eq "DISCONNECTED"}).Count
}

$Result = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  batch = 477
  name = "NEXUS_COMMAND_CENTER_ACTIVATION_MATRIX_477"
  summary = $Summary
  systems = $Results
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS COMMAND CENTER ACTIVATION MATRIX 477")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")
$Lines.Add("- READY: " + $Summary.ready)
$Lines.Add("- PARTIAL: " + $Summary.partial)
$Lines.Add("- DISCONNECTED: " + $Summary.disconnected)
$Lines.Add("")
$Lines.Add("## SYSTEMS")
$Lines.Add("")

foreach($r in $Results){
  $Lines.Add(
    "- [" +
    $r.status +
    "] " +
    $r.file +
    " | score=" +
    $r.score
  )
}

[System.IO.File]::WriteAllLines(
  $MdOut,
  $Lines,
  [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS COMMAND CENTER ACTIVATION MATRIX 477 COMPLETE"
Write-Host ""
Write-Host ("READY: " + $Summary.ready)
Write-Host ("PARTIAL: " + $Summary.partial)
Write-Host ("DISCONNECTED: " + $Summary.disconnected)
Write-Host ""
