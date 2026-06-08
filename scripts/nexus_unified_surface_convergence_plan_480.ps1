$Root = "C:\Dev\Nexus_MASTER"

$InventoryPath = Join-Path $Root "public\data\certification\master\nexus_live_surface_inventory_479.json"
$JsonOut = Join-Path $Root "public\data\certification\master\nexus_unified_surface_convergence_plan_480.json"
$MdOut = Join-Path $Root "public\data\certification\master\NEXUS_UNIFIED_SURFACE_CONVERGENCE_PLAN_480.md"

if (-not (Test-Path $InventoryPath)) {
  throw "Batch 479 inventory is required."
}

$Inventory = Get-Content $InventoryPath -Raw | ConvertFrom-Json

$Plan = @()

foreach ($surface in $Inventory.surfaces) {
  $file = $surface.file.ToLower()

  $center = "SYSTEM_SETTINGS"
  $priority = "SUPPLEMENTAL"

  if ($file -match "command|executive|founder") {
    $center = "COMMAND_CENTER"
    $priority = "PRIMARY"
  }
  elseif ($file -match "intel|intelligence|summary") {
    $center = "INTELLIGENCE_CENTER"
    $priority = "PRIMARY"
  }
  elseif ($file -match "dossier|relationship") {
    $center = "DOSSIER_CENTER"
    $priority = "PRIMARY"
  }
  elseif ($file -match "mission|task|watchlist|alert|operations|decision|queue") {
    $center = "OPERATIONS_CENTER"
    $priority = "PRIMARY"
  }
  elseif ($file -match "automation|autonomous|orchestration|directive|workflow") {
    $center = "AUTOMATION_CENTER"
    $priority = "SECONDARY"
  }
  elseif ($file -match "governance|continuity") {
    $center = "GOVERNANCE_CENTER"
    $priority = "SECONDARY"
  }
  elseif ($file -match "runtime|registry|control_layer") {
    $center = "RUNTIME_CENTER"
    $priority = "SUPPLEMENTAL"
  }
  elseif ($file -match "security|guard|access") {
    $center = "SYSTEM_SETTINGS"
    $priority = "SUPPLEMENTAL"
  }

  $Plan += [PSCustomObject]@{
    file = $surface.file
    type = $surface.type
    phase = $surface.phase
    center = $center
    priority = $priority
  }
}

$Summary = @()

foreach ($group in ($Plan | Group-Object center)) {
  $Summary += [PSCustomObject]@{
    center = $group.Name
    surfaces = @($group.Group).Count
    primary = @($group.Group | Where-Object { $_.priority -eq "PRIMARY" }).Count
    secondary = @($group.Group | Where-Object { $_.priority -eq "SECONDARY" }).Count
    supplemental = @($group.Group | Where-Object { $_.priority -eq "SUPPLEMENTAL" }).Count
  }
}

$Result = [PSCustomObject]@{
  batch = "480B"
  generatedAt = (Get-Date).ToString("s")
  name = "NEXUS_UNIFIED_SURFACE_CONVERGENCE_PLAN_480B"
  total_surfaces = @($Plan).Count
  summary = $Summary
  plan = $Plan
}

$Result | ConvertTo-Json -Depth 20 | Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS UNIFIED SURFACE CONVERGENCE PLAN 480B")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("Total Surfaces: " + $Result.total_surfaces)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")

foreach ($s in $Summary) {
  $Lines.Add("- " + $s.center + ": " + $s.surfaces + " surfaces | primary=" + $s.primary + " secondary=" + $s.secondary + " supplemental=" + $s.supplemental)
}

$Lines.Add("")

foreach ($group in ($Plan | Group-Object center | Sort-Object Name)) {
  $Lines.Add("## " + $group.Name)
  $Lines.Add("")

  foreach ($item in ($group.Group | Sort-Object priority, file)) {
    $Lines.Add("- [" + $item.priority + "] [" + $item.phase + "] [" + $item.type + "] " + $item.file)
  }

  $Lines.Add("")
}

[System.IO.File]::WriteAllLines($MdOut, $Lines, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "NEXUS UNIFIED SURFACE CONVERGENCE PLAN 480B COMPLETE"
Write-Host ("SURFACES: " + $Result.total_surfaces)
Write-Host ("JSON: " + $JsonOut)
Write-Host ("MARKDOWN: " + $MdOut)
Write-Host ""
