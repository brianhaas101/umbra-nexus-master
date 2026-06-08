$Root = "C:\Dev\Nexus_MASTER"

$InventoryPath =
Join-Path $Root "public\data\certification\master\nexus_live_surface_inventory_479.json"

if (-not (Test-Path $InventoryPath)) {
    throw "Batch 479 required."
}

$Inventory =
Get-Content $InventoryPath -Raw |
ConvertFrom-Json

$Plan = @()

foreach($surface in $Inventory.surfaces){

    $file = $surface.file.ToLower()

    $center = "SYSTEM_SETTINGS"
    $priority = "SUPPLEMENTAL"

    if($file -match "command|executive"){
        $center = "COMMAND_CENTER"
        $priority = "PRIMARY"
    }
    elseif($file -match "intel|intelligence"){
        $center = "INTELLIGENCE_CENTER"
        $priority = "PRIMARY"
    }
    elseif($file -match "dossier"){
        $center = "DOSSIER_CENTER"
        $priority = "PRIMARY"
    }
    elseif($file -match "mission|task|watchlist|alert|queue"){
        $center = "OPERATIONS_CENTER"
        $priority = "PRIMARY"
    }
    elseif($file -match "automation|autonomous"){
        $center = "AUTOMATION_CENTER"
        $priority = "SECONDARY"
    }
    elseif($file -match "governance"){
        $center = "GOVERNANCE_CENTER"
        $priority = "SECONDARY"
    }
    elseif($file -match "continuity"){
        $center = "GOVERNANCE_CENTER"
        $priority = "SECONDARY"
    }
    elseif($file -match "runtime|registry"){
        $center = "RUNTIME_CENTER"
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

$Result = [PSCustomObject]@{
    batch = 480
    generatedAt = (Get-Date).ToString("s")
    total_surfaces = $Plan.Count
    plan = $Plan
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS UNIFIED SURFACE CONVERGENCE PLAN 480")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("Total Surfaces: " + $Result.total_surfaces)
$Lines.Add("")

foreach($group in ($Plan | Group-Object center)){

    $Lines.Add("## " + $group.Name)
    $Lines.Add("")

    foreach($item in $group.Group){
        $Lines.Add(
            "- [" +
            $item.priority +
            "] " +
            $item.file
        )
    }

    $Lines.Add("")
}

[System.IO.File]::WriteAllLines(
    $MdOut,
    $Lines,
    [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS UNIFIED SURFACE CONVERGENCE PLAN 480 COMPLETE"
Write-Host ""
Write-Host ("SURFACES: " + $Result.total_surfaces)
Write-Host ""
