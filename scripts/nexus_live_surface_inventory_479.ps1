$Root = "C:\Dev\Nexus_MASTER"

$ActivationAudit =
Join-Path $Root "public\data\certification\master\nexus_runtime_activation_audit_475.json"

$JsonOut =
Join-Path $Root "public\data\certification\master\nexus_live_surface_inventory_479.json"

$MdOut =
Join-Path $Root "public\data\certification\master\NEXUS_LIVE_SURFACE_INVENTORY_479.md"

if (-not (Test-Path $ActivationAudit)) {
    throw "Batch 475 required."
}

$Audit =
Get-Content $ActivationAudit -Raw |
ConvertFrom-Json

$Systems =
$Audit.systems |
Where-Object { $_.status -eq "ACTIVE" }

$SurfacePatterns = @(
    "workspace",
    "dashboard",
    "panel",
    "drawer",
    "queue",
    "rail",
    "feed",
    "control",
    "surface",
    "registry"
)

$Surfaces = @()

foreach($s in $Systems){

    $file = $s.file
    $lower = $file.ToLower()

    foreach($pattern in $SurfacePatterns){

        if($lower -match $pattern){

            $type = $pattern

            $phase = "UNKNOWN"

            if($lower -match "phase4"){ $phase = "PHASE_4" }
            elseif($lower -match "phase5"){ $phase = "PHASE_5" }
            elseif($lower -match "phase6"){ $phase = "PHASE_6" }
            elseif($lower -match "phase7"){ $phase = "PHASE_7" }
            elseif($lower -match "phase8"){ $phase = "PHASE_8" }
            elseif($lower -match "phase9"){ $phase = "PHASE_9" }
            elseif($lower -match "phase10"){ $phase = "PHASE_10" }

            $Surfaces += [PSCustomObject]@{
                file = $file
                type = $type.ToUpper()
                phase = $phase
                active = $true
            }

            break
        }
    }
}

$Summary = [ordered]@{
    total_surfaces = @($Surfaces).Count
    workspaces =
      @($Surfaces | Where-Object {$_.type -eq "WORKSPACE"}).Count

    dashboards =
      @($Surfaces | Where-Object {$_.type -eq "DASHBOARD"}).Count

    panels =
      @($Surfaces | Where-Object {$_.type -eq "PANEL"}).Count

    drawers =
      @($Surfaces | Where-Object {$_.type -eq "DRAWER"}).Count

    queues =
      @($Surfaces | Where-Object {$_.type -eq "QUEUE"}).Count

    rails =
      @($Surfaces | Where-Object {$_.type -eq "RAIL"}).Count

    feeds =
      @($Surfaces | Where-Object {$_.type -eq "FEED"}).Count

    controls =
      @($Surfaces | Where-Object {$_.type -eq "CONTROL"}).Count

    surfaces =
      @($Surfaces | Where-Object {$_.type -eq "SURFACE"}).Count

    registries =
      @($Surfaces | Where-Object {$_.type -eq "REGISTRY"}).Count
}

$Result = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("s")
    batch = 479
    name = "NEXUS_LIVE_SURFACE_INVENTORY_479"
    summary = $Summary
    surfaces = $Surfaces
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS LIVE SURFACE INVENTORY 479")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")

foreach($k in $Summary.Keys){
    $Lines.Add("- " + $k + ": " + $Summary[$k])
}

$Lines.Add("")
$Lines.Add("## Surfaces")
$Lines.Add("")

foreach($s in $Surfaces){
    $Lines.Add(
        "- [" +
        $s.phase +
        "] [" +
        $s.type +
        "] " +
        $s.file
    )
}

[System.IO.File]::WriteAllLines(
    $MdOut,
    $Lines,
    [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS LIVE SURFACE INVENTORY 479 COMPLETE"
Write-Host ""
Write-Host ("TOTAL SURFACES: " + $Summary.total_surfaces)
Write-Host ("WORKSPACES: " + $Summary.workspaces)
Write-Host ("DASHBOARDS: " + $Summary.dashboards)
Write-Host ("PANELS: " + $Summary.panels)
Write-Host ("DRAWERS: " + $Summary.drawers)
Write-Host ("QUEUES: " + $Summary.queues)
Write-Host ("RAILS: " + $Summary.rails)
Write-Host ("FEEDS: " + $Summary.feeds)
Write-Host ("CONTROLS: " + $Summary.controls)
Write-Host ("SURFACES: " + $Summary.surfaces)
Write-Host ("REGISTRIES: " + $Summary.registries)
Write-Host ""
