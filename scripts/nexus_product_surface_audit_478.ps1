$Root = "C:\Dev\Nexus_MASTER"

$Audit475 =
Join-Path $Root "public\data\certification\master\nexus_runtime_activation_audit_475.json"

$JsonOut =
Join-Path $Root "public\data\certification\master\nexus_product_surface_audit_478.json"

$MdOut =
Join-Path $Root "public\data\certification\master\NEXUS_PRODUCT_SURFACE_AUDIT_478.md"

if (-not (Test-Path $Audit475)) {
    throw "Batch 475 required."
}

$Audit =
Get-Content $Audit475 -Raw |
ConvertFrom-Json

$Systems =
$Audit.systems |
Where-Object { $_.status -eq "ACTIVE" }

$Domains = [ordered]@{
    COMMAND = @()
    DOSSIER = @()
    INTELLIGENCE = @()
    OPERATIONS = @()
    AUTOMATION = @()
    GOVERNANCE = @()
    CONTINUITY = @()
    RUNTIME = @()
    SECURITY = @()
}

foreach($s in $Systems){

    $f = $s.file.ToLower()

    if($f -match "command"){
        $Domains.COMMAND += $s
        continue
    }

    if($f -match "dossier"){
        $Domains.DOSSIER += $s
        continue
    }

    if($f -match "intel|intelligence"){
        $Domains.INTELLIGENCE += $s
        continue
    }

    if($f -match "mission|watchlist|task|operations"){
        $Domains.OPERATIONS += $s
        continue
    }

    if($f -match "automation|autonomous"){
        $Domains.AUTOMATION += $s
        continue
    }

    if($f -match "governance"){
        $Domains.GOVERNANCE += $s
        continue
    }

    if($f -match "continuity"){
        $Domains.CONTINUITY += $s
        continue
    }

    if($f -match "runtime|bridge"){
        $Domains.RUNTIME += $s
        continue
    }

    if($f -match "security|guard"){
        $Domains.SECURITY += $s
        continue
    }
}

$Summary = @()

foreach($key in $Domains.Keys){

    $items = $Domains[$key]

    $Summary += [PSCustomObject]@{

        domain = $key

        systems =
        @($items).Count

        workspaces =
        @($items | Where-Object {$_.file -match "workspace"}).Count

        dashboards =
        @($items | Where-Object {$_.file -match "dashboard"}).Count

        controls =
        @($items | Where-Object {$_.file -match "control"}).Count

        certifications =
        @($items | Where-Object {$_.file -match "certification"}).Count
    }
}

$Result = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("s")
    batch = 478
    name = "NEXUS_PRODUCT_SURFACE_AUDIT_478"
    domains = $Summary
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS PRODUCT SURFACE AUDIT 478")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")

foreach($d in $Summary){

    $Lines.Add("## " + $d.domain)
    $Lines.Add("")
    $Lines.Add("- Systems: " + $d.systems)
    $Lines.Add("- Workspaces: " + $d.workspaces)
    $Lines.Add("- Dashboards: " + $d.dashboards)
    $Lines.Add("- Controls: " + $d.controls)
    $Lines.Add("- Certifications: " + $d.certifications)
    $Lines.Add("")
}

[System.IO.File]::WriteAllLines(
    $MdOut,
    $Lines,
    [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS PRODUCT SURFACE AUDIT 478 COMPLETE"
Write-Host ""

foreach($d in $Summary){
    Write-Host (
        $d.domain + " : " +
        $d.systems + " systems"
    )
}
