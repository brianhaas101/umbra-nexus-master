$Root = "C:\Dev\Nexus_MASTER"

$ActivationAudit =
  Join-Path $Root "public\data\certification\master\nexus_runtime_activation_audit_475.json"

$JsonOut =
  Join-Path $Root "public\data\certification\master\nexus_capability_classification_matrix_476.json"

$MdOut =
  Join-Path $Root "public\data\certification\master\NEXUS_CAPABILITY_CLASSIFICATION_MATRIX_476.md"

if (-not (Test-Path $ActivationAudit)) {
  throw "Missing Batch 475 activation audit."
}

$Audit =
  Get-Content $ActivationAudit -Raw |
  ConvertFrom-Json

$Systems =
  $Audit.systems |
  Where-Object { $_.status -eq "EXISTS_NOT_LOADED" }

function Get-Domain($file) {

  $f = $file.ToLower()

  if ($f -match "executive|dashboard") { return "EXECUTIVE" }
  if ($f -match "command") { return "COMMAND" }
  if ($f -match "dossier") { return "DOSSIER" }
  if ($f -match "intelligence|intel") { return "INTELLIGENCE" }
  if ($f -match "priority|queue|workflow|mission|task|operations") { return "OPERATIONS" }
  if ($f -match "autonomous|automation|directive") { return "AUTOMATION" }
  if ($f -match "governance|continuity") { return "GOVERNANCE" }
  if ($f -match "runtime|bridge|repair") { return "RUNTIME" }
  if ($f -match "security|guard") { return "SECURITY" }
  if ($f -match "black_dragon|client") { return "CLIENT" }

  return "LEGACY"
}

function Get-Action($file) {

  $f = $file.ToLower()

  if ($f -match "before_|restored_|backup|pre_hub_restore") {
    return "ARCHIVE"
  }

  if ($f -match "black_dragon|client") {
    return "CLIENT_SPECIFIC"
  }

  if ($f -match "command_surface|enterprise_command_surface") {
    return "ACTIVATE"
  }

  if ($f -match "intelligence_presentation|priority_queue|intelligence_data_flow") {
    return "ACTIVATE"
  }

  if ($f -match "bridge|runtime_health") {
    return "ACTIVATE"
  }

  return "MERGE"
}

$Matrix = foreach ($s in $Systems) {

  [PSCustomObject]@{
    file = $s.file
    domain = Get-Domain $s.file
    action = Get-Action $s.file
  }
}

$Summary = [ordered]@{
  activate =
    @($Matrix | Where-Object {$_.action -eq "ACTIVATE"}).Count

  merge =
    @($Matrix | Where-Object {$_.action -eq "MERGE"}).Count

  archive =
    @($Matrix | Where-Object {$_.action -eq "ARCHIVE"}).Count

  client_specific =
    @($Matrix | Where-Object {$_.action -eq "CLIENT_SPECIFIC"}).Count
}

$Result = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  batch = 476
  name = "NEXUS_CAPABILITY_CLASSIFICATION_MATRIX_476"
  summary = $Summary
  matrix = $Matrix
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS CAPABILITY CLASSIFICATION MATRIX 476")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")
$Lines.Add("- ACTIVATE: " + $Summary.activate)
$Lines.Add("- MERGE: " + $Summary.merge)
$Lines.Add("- ARCHIVE: " + $Summary.archive)
$Lines.Add("- CLIENT_SPECIFIC: " + $Summary.client_specific)
$Lines.Add("")
$Lines.Add("## ACTIVATE")
$Lines.Add("")

foreach($item in ($Matrix | Where-Object {$_.action -eq "ACTIVATE"})) {
  $Lines.Add("- [" + $item.domain + "] " + $item.file)
}

$Lines.Add("")
$Lines.Add("## MERGE")
$Lines.Add("")

foreach($item in ($Matrix | Where-Object {$_.action -eq "MERGE"})) {
  $Lines.Add("- [" + $item.domain + "] " + $item.file)
}

[System.IO.File]::WriteAllLines(
  $MdOut,
  $Lines,
  [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS CAPABILITY CLASSIFICATION MATRIX 476 COMPLETE"
Write-Host ""
Write-Host ("ACTIVATE: " + $Summary.activate)
Write-Host ("MERGE: " + $Summary.merge)
Write-Host ("ARCHIVE: " + $Summary.archive)
Write-Host ("CLIENT_SPECIFIC: " + $Summary.client_specific)
Write-Host ""
