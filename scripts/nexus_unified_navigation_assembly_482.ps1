$Root = "C:\Dev\Nexus_MASTER"

$ArchitecturePath =
Join-Path $Root "public\data\certification\master\nexus_unified_hub_architecture_481.json"

$JsonOut =
Join-Path $Root "public\data\certification\master\nexus_unified_navigation_assembly_482.json"

$MdOut =
Join-Path $Root "public\data\certification\master\NEXUS_UNIFIED_NAVIGATION_ASSEMBLY_482.md"

if (-not (Test-Path $ArchitecturePath)) {
    throw "Batch 481 required."
}

$Architecture =
Get-Content $ArchitecturePath -Raw |
ConvertFrom-Json

$Navigation = @(

    [PSCustomObject]@{
        order = 1
        center = "COMMAND_CENTER"
        label = "Command Center"
        category = "PRIMARY"
        defaultLanding = $true
    }

    [PSCustomObject]@{
        order = 2
        center = "INTELLIGENCE_CENTER"
        label = "Intelligence Center"
        category = "PRIMARY"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 3
        center = "DOSSIER_CENTER"
        label = "Dossier Center"
        category = "PRIMARY"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 4
        center = "OPERATIONS_CENTER"
        label = "Operations Center"
        category = "PRIMARY"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 5
        center = "AUTOMATION_CENTER"
        label = "Automation Center"
        category = "PRIMARY"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 6
        center = "GOVERNANCE_CENTER"
        label = "Governance Center"
        category = "PRIMARY"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 7
        center = "RUNTIME_CENTER"
        label = "Runtime Center"
        category = "ADVANCED"
        defaultLanding = $false
    }

    [PSCustomObject]@{
        order = 8
        center = "SYSTEM_SETTINGS"
        label = "System Settings"
        category = "ADVANCED"
        defaultLanding = $false
    }
)

$CenterSummary = @()

foreach($center in $Architecture.centers){

    $CenterSummary += [PSCustomObject]@{
        center = $center.center
        surfaces = $center.surfaceCount
        workspaces = $center.workspaces
        dashboards = $center.dashboards
        controls = $center.controls
        priority = $center.priority
    }
}

$Result = [PSCustomObject]@{

    batch = 482

    generatedAt =
    (Get-Date).ToString("s")

    name =
    "NEXUS_UNIFIED_NAVIGATION_ASSEMBLY_482"

    defaultEntry =
    "COMMAND_CENTER"

    navigation =
    $Navigation

    centers =
    $CenterSummary

    operatorFlow = @(
        "COMMAND_CENTER",
        "INTELLIGENCE_CENTER",
        "DOSSIER_CENTER",
        "OPERATIONS_CENTER",
        "AUTOMATION_CENTER",
        "GOVERNANCE_CENTER"
    )

    advancedSystems = @(
        "RUNTIME_CENTER",
        "SYSTEM_SETTINGS"
    )
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines =
New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS UNIFIED NAVIGATION ASSEMBLY 482")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("Default Entry: COMMAND_CENTER")
$Lines.Add("")
$Lines.Add("## Navigation")
$Lines.Add("")

foreach($item in ($Navigation | Sort-Object order)){

    $Lines.Add(
        $item.order.ToString() +
        ". " +
        $item.label +
        " [" +
        $item.category +
        "]"
    )
}

$Lines.Add("")
$Lines.Add("## Operator Flow")
$Lines.Add("")

foreach($flow in $Result.operatorFlow){
    $Lines.Add("- " + $flow)
}

$Lines.Add("")
$Lines.Add("## Centers")
$Lines.Add("")

foreach($c in $CenterSummary){

    $Lines.Add("### " + $c.center)
    $Lines.Add("- Surfaces: " + $c.surfaces)
    $Lines.Add("- Workspaces: " + $c.workspaces)
    $Lines.Add("- Dashboards: " + $c.dashboards)
    $Lines.Add("- Controls: " + $c.controls)
    $Lines.Add("")
}

[System.IO.File]::WriteAllLines(
    $MdOut,
    $Lines,
    [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS UNIFIED NAVIGATION ASSEMBLY 482 COMPLETE"
Write-Host ""

foreach($item in ($Navigation | Sort-Object order)){

    Write-Host (
        $item.order.ToString() +
        ". " +
        $item.label
    )
}

Write-Host ""
Write-Host "DEFAULT ENTRY: COMMAND_CENTER"
Write-Host ""
