$Root = "C:\Dev\Nexus_MASTER"

$PlanPath =
Join-Path $Root "public\data\certification\master\nexus_unified_surface_convergence_plan_480.json"

$JsonOut =
Join-Path $Root "public\data\certification\master\nexus_unified_hub_architecture_481.json"

$MdOut =
Join-Path $Root "public\data\certification\master\NEXUS_UNIFIED_HUB_ARCHITECTURE_481.md"

if (-not (Test-Path $PlanPath)) {
    throw "Batch 480B required."
}

$Plan =
Get-Content $PlanPath -Raw |
ConvertFrom-Json

$Centers =
$Plan.plan |
Group-Object center

$HubArchitecture = @()

foreach($center in $Centers){

    $HubArchitecture += [PSCustomObject]@{

        center =
        $center.Name

        surfaceCount =
        @($center.Group).Count

        workspaces =
        @(
            $center.Group |
            Where-Object {$_.type -eq "WORKSPACE"}
        ).Count

        dashboards =
        @(
            $center.Group |
            Where-Object {$_.type -eq "DASHBOARD"}
        ).Count

        controls =
        @(
            $center.Group |
            Where-Object {$_.type -eq "CONTROL"}
        ).Count

        priority =
        (
            $center.Group |
            Select-Object -First 1
        ).priority
    }
}

$Navigation = @(
    "COMMAND_CENTER",
    "INTELLIGENCE_CENTER",
    "DOSSIER_CENTER",
    "OPERATIONS_CENTER",
    "AUTOMATION_CENTER",
    "GOVERNANCE_CENTER",
    "RUNTIME_CENTER",
    "SYSTEM_SETTINGS"
)

$Result = [PSCustomObject]@{

    batch = 481

    generatedAt =
    (Get-Date).ToString("s")

    name =
    "NEXUS_UNIFIED_HUB_ARCHITECTURE_481"

    navigation =
    $Navigation

    centers =
    $HubArchitecture

    finalOperatorModel = @{

        entry =
        "COMMAND_CENTER"

        intelligence =
        "INTELLIGENCE_CENTER"

        dossiers =
        "DOSSIER_CENTER"

        execution =
        "OPERATIONS_CENTER"

        automation =
        "AUTOMATION_CENTER"

        governance =
        "GOVERNANCE_CENTER"

        runtime =
        "RUNTIME_CENTER"
    }
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines =
New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS UNIFIED HUB ARCHITECTURE 481")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Navigation")
$Lines.Add("")

foreach($n in $Navigation){
    $Lines.Add("- " + $n)
}

$Lines.Add("")
$Lines.Add("## Centers")
$Lines.Add("")

foreach($c in $HubArchitecture){

    $Lines.Add("### " + $c.center)
    $Lines.Add("")
    $Lines.Add("- Surface Count: " + $c.surfaceCount)
    $Lines.Add("- Workspaces: " + $c.workspaces)
    $Lines.Add("- Dashboards: " + $c.dashboards)
    $Lines.Add("- Controls: " + $c.controls)
    $Lines.Add("- Priority: " + $c.priority)
    $Lines.Add("")
}

$Lines.Add("## Final Operator Flow")
$Lines.Add("")
$Lines.Add("COMMAND -> INTELLIGENCE -> DOSSIER -> OPERATIONS -> AUTOMATION -> GOVERNANCE")
$Lines.Add("")

[System.IO.File]::WriteAllLines(
    $MdOut,
    $Lines,
    [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS UNIFIED HUB ARCHITECTURE 481 COMPLETE"
Write-Host ""

foreach($c in $HubArchitecture){

    Write-Host (
        $c.center +
        " : " +
        $c.surfaceCount +
        " surfaces"
    )
}

Write-Host ""
Write-Host "PRIMARY ENTRY:"
Write-Host "COMMAND_CENTER"
Write-Host ""
