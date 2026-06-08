$Root = "C:\Dev\Nexus_MASTER"

$JsonOut = Join-Path $Root "public\data\certification\master\nexus_master_runtime_audit_473.json"
$MdOut = Join-Path $Root "public\data\certification\master\NEXUS_MASTER_RUNTIME_AUDIT_473.md"

function Safe-GetContent($Path) {
    if (Test-Path $Path) {
        return Get-Content $Path -Raw
    }
    return ""
}

function Count-Files($Path, $Filter) {
    if (Test-Path $Path) {
        return @(Get-ChildItem $Path -Recurse -File -Filter $Filter -ErrorAction SilentlyContinue).Count
    }
    return 0
}

function Find-Files($Path, $Pattern) {
    if (Test-Path $Path) {
        return Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match $Pattern } |
            Select-Object FullName, Length, LastWriteTime
    }
    return @()
}

function Run-Git($Args) {
    try {
        return (git -C $Root $Args 2>$null) -join "`n"
    } catch {
        return ""
    }
}

function Test-PathRel($RelPath) {
    return Test-Path (Join-Path $Root $RelPath)
}

$IndexPath = Join-Path $Root "index.html"
$IndexHtml = Safe-GetContent $IndexPath

$ScriptTags = @()
if ($IndexHtml.Length -gt 0) {
    $Matches = [regex]::Matches($IndexHtml, '<script[^>]+src="([^"]+)"[^>]*>')
    foreach ($m in $Matches) {
        $ScriptTags += [PSCustomObject]@{
            src = $m.Groups[1].Value
            lineHint = "index.html"
        }
    }
}

$RuntimeJsFiles = Find-Files (Join-Path $Root "public\globe") "\.js$"
$RuntimeJsonFiles = Find-Files (Join-Path $Root "public\data") "\.json$"

$PhaseFiles = Find-Files (Join-Path $Root "public\globe") "phase[0-9].*\.js$"
$Phase10Files = Find-Files (Join-Path $Root "public\globe") "phase10.*\.js$"
$RuntimeBridgeFiles = Find-Files (Join-Path $Root "public\globe\runtime") ".*"

$SrcIntelligenceFiles = Find-Files (Join-Path $Root "src\intelligence") ".*"
$PublicIntelligenceFiles = Find-Files (Join-Path $Root "public\data\intelligence") ".*"

$SecurityFiles = Find-Files (Join-Path $Root "public\globe\security") ".*"
$PerformanceFiles = Find-Files (Join-Path $Root "public\globe\performance") ".*"

$WindowGlobals = @()
$EventProducers = @()
$EventConsumers = @()
$RuntimeReferences = @()

$SearchRoots = @(
    "public\globe",
    "src",
    "scripts"
)

foreach ($rel in $SearchRoots) {
    $abs = Join-Path $Root $rel
    if (Test-Path $abs) {
        $files = Get-ChildItem $abs -Recurse -File -Include *.js,*.ts,*.mjs,*.html -ErrorAction SilentlyContinue

        foreach ($file in $files) {
            $text = Safe-GetContent $file.FullName

            if ($text.Length -eq 0) {
                continue
            }

            $globalMatches = [regex]::Matches($text, 'window\.([A-Za-z0-9_]+)')
            foreach ($gm in $globalMatches) {
                $WindowGlobals += [PSCustomObject]@{
                    global = $gm.Groups[1].Value
                    file = $file.FullName.Replace($Root + "\", "")
                }
            }

            if ($text -match "dispatchEvent|CustomEvent|emit\(") {
                $EventProducers += [PSCustomObject]@{
                    file = $file.FullName.Replace($Root + "\", "")
                    hasDispatchEvent = $text -match "dispatchEvent"
                    hasCustomEvent = $text -match "CustomEvent"
                    hasEmit = $text -match "emit\("
                }
            }

            if ($text -match "addEventListener|subscribe|on\(") {
                $EventConsumers += [PSCustomObject]@{
                    file = $file.FullName.Replace($Root + "\", "")
                    hasAddEventListener = $text -match "addEventListener"
                    hasSubscribe = $text -match "subscribe"
                    hasOn = $text -match "on\("
                }
            }

            if ($text -match "UmbraPhase10|UmbraPhase9|Umbra|Nexus|Dossier|City|Command|Founder|Intelligence") {
                $RuntimeReferences += [PSCustomObject]@{
                    file = $file.FullName.Replace($Root + "\", "")
                }
            }
        }
    }
}

$UniqueGlobals = $WindowGlobals |
    Group-Object global |
    ForEach-Object {
        [PSCustomObject]@{
            global = $_.Name
            count = $_.Count
            files = @($_.Group | Select-Object -ExpandProperty file -Unique)
        }
    } |
    Sort-Object global

$CapabilityChecks = [ordered]@{
    root_index_exists = Test-Path $IndexPath
    has_script_tags = @($ScriptTags).Count -gt 0

    phase9_certification_exists = Test-PathRel "src\phase9-final-audit-certification.js"
    phase10_runtime_certification_exists = Test-PathRel "public\globe\runtime\phase10_runtime_certification_465.js"
    phase10_intelligence_certification_exists = Test-PathRel "public\globe\runtime\phase10_intelligence_runtime_certification_470.js"
    phase10_operational_certification_exists = Test-PathRel "public\globe\runtime\phase10_operational_execution_certification_472.js"

    globe_core_exists = Test-PathRel "public\globe\core.js"
    city_map_exists = Test-PathRel "public\globe\city_map.js"
    command_deck_exists = Test-PathRel "public\globe\command_deck_runtime.js"
    founder_dashboard_exists = Test-PathRel "public\globe\founder_dashboard_runtime.js"

    dossier_bridge_exists = Test-PathRel "public\globe\runtime\dossier_open_bridge.js"
    dossier_mount_exists = Test-PathRel "public\globe\runtime\dossier_mount_restore.js"
    city_click_bridge_exists = Test-PathRel "public\globe\runtime\city_click_tilemap_bridge.js"

    intel_loader_bridge_exists = Test-PathRel "public\globe\runtime\intel_loader_bridge.js"
    intel_alias_bridge_exists = Test-PathRel "public\globe\runtime\intel_runtime_alias_bridge.js"

    security_runtime_exists = Test-PathRel "public\globe\security\frontend_runtime_guard.js"
    access_control_exists = Test-PathRel "public\globe\security\access_control_runtime.js"

    performance_runtime_exists = Test-PathRel "public\globe\performance\movement_performance_mode.js"

    public_intelligence_data_exists = Test-PathRel "public\data\intelligence"
    src_intelligence_exists = Test-PathRel "src\intelligence"

    black_dragon_client_exists = Test-PathRel "clients\CLIENT-BD-001"
}

$CapabilityPassed = @($CapabilityChecks.GetEnumerator() | Where-Object { $_.Value -eq $true }).Count
$CapabilityTotal = @($CapabilityChecks.GetEnumerator()).Count
$CapabilityFailed = $CapabilityTotal - $CapabilityPassed

$Tags = Run-Git "tag --list"
$Log = Run-Git "log --oneline --decorate -20"
$Branch = Run-Git "branch --show-current"
$Status = Run-Git "status --short"

$BuildOutput = ""
$BuildPassed = $false

try {
    Push-Location $Root
    $BuildOutput = npm run build 2>&1 | Out-String
    $BuildPassed = $LASTEXITCODE -eq 0
    Pop-Location
} catch {
    $BuildOutput = $_.Exception.Message
    $BuildPassed = $false
}

$RiskFlags = @()

if ($Status -match "^\s*M|^\s*D|^\s*\?\?") {
    $RiskFlags += "Working tree contains modified, deleted, or untracked files. Future batches must stage only intended files."
}

if ($CapabilityFailed -gt 0) {
    $RiskFlags += "Some expected runtime capabilities are missing from static audit."
}

if (-not $BuildPassed) {
    $RiskFlags += "Production build failed."
}

if (@($ScriptTags).Count -gt 60) {
    $RiskFlags += "Large number of root script bindings. Audit duplicate or legacy runtime loading before major UI changes."
}

$Result = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("s")
    batch = 473
    name = "NEXUS_MASTER_RUNTIME_AUDIT_473"
    branch = $Branch.Trim()
    buildPassed = $BuildPassed
    gitStatusShort = $Status
    recentLog = $Log
    tags = $Tags
    metrics = [PSCustomObject]@{
        scriptTagsInRootIndex = @($ScriptTags).Count
        publicGlobeJsFiles = @($RuntimeJsFiles).Count
        publicDataJsonFiles = @($RuntimeJsonFiles).Count
        phaseFiles = @($PhaseFiles).Count
        phase10Files = @($Phase10Files).Count
        runtimeBridgeFiles = @($RuntimeBridgeFiles).Count
        srcIntelligenceFiles = @($SrcIntelligenceFiles).Count
        publicIntelligenceFiles = @($PublicIntelligenceFiles).Count
        securityFiles = @($SecurityFiles).Count
        performanceFiles = @($PerformanceFiles).Count
        uniqueWindowGlobals = @($UniqueGlobals).Count
        eventProducerFiles = @($EventProducers).Count
        eventConsumerFiles = @($EventConsumers).Count
        runtimeReferenceFiles = @($RuntimeReferences).Count
        capabilityPassed = $CapabilityPassed
        capabilityFailed = $CapabilityFailed
        capabilityTotal = $CapabilityTotal
    }
    capabilityChecks = $CapabilityChecks
    scriptTags = $ScriptTags
    uniqueWindowGlobals = $UniqueGlobals
    eventProducers = $EventProducers
    eventConsumers = $EventConsumers
    phase10Files = $Phase10Files
    runtimeBridgeFiles = $RuntimeBridgeFiles
    riskFlags = $RiskFlags
    buildOutputTail = (($BuildOutput -split "`n") | Select-Object -Last 30) -join "`n"
}

$Result | ConvertTo-Json -Depth 50 | Set-Content $JsonOut -Encoding UTF8

$Md = @()
$Md += "# NEXUS MASTER RUNTIME AUDIT 473"
$Md += ""
$Md += "Generated: $($Result.generatedAt)"
$Md += ""
$Md += "## Summary"
$Md += ""
$Md += "- Build passed: $BuildPassed"
$Md += "- Branch: $($Result.branch)"
$Md += "- Script tags in root index: $(@($ScriptTags).Count)"
$Md += "- Public globe JS files: $(@($RuntimeJsFiles).Count)"
$Md += "- Public data JSON files: $(@($RuntimeJsonFiles).Count)"
$Md += "- Phase files: $(@($PhaseFiles).Count)"
$Md += "- Phase 10 files: $(@($Phase10Files).Count)"
$Md += "- Runtime bridge files: $(@($RuntimeBridgeFiles).Count)"
$Md += "- Unique window globals: $(@($UniqueGlobals).Count)"
$Md += "- Event producer files: $(@($EventProducers).Count)"
$Md += "- Event consumer files: $(@($EventConsumers).Count)"
$Md += "- Capability checks: $CapabilityPassed / $CapabilityTotal"
$Md += ""
$Md += "## Capability Checks"
$Md += ""

foreach ($item in $CapabilityChecks.GetEnumerator()) {
    $mark = if ($item.Value) { "[PASS]" } else { "[FAIL]" }
    $Md += "- $mark $($item.Key)"
}

$Md += ""
$Md += "## Risk Flags"
$Md += ""

if (@($RiskFlags).Count -eq 0) {
    $Md += "- None"
} else {
    foreach ($risk in $RiskFlags) {
        $Md += "- $risk"
    }
}

$Md += ""
$Md += "## Phase 10 Files"
$Md += ""

foreach ($file in $Phase10Files) {
    $Md += "- $($file.FullName.Replace($Root + '\', ''))"
}

$Md += ""
$Md += "## Runtime Bridge Files"
$Md += ""

foreach ($file in $RuntimeBridgeFiles) {
    $Md += "- $($file.FullName.Replace($Root + '\', ''))"
}

$Md += ""
$Md += "## Window Globals"
$Md += ""

foreach ($g in $UniqueGlobals | Select-Object -First 200) {
    $Md += "- $($g.global) ($($g.count))"
}

$Md += ""
$Md += "## Recent Git Log"
$Md += ""
$Md += "```txt"
$Md += $Log
$Md += "```"
$Md += ""
$Md += "## Build Output Tail"
$Md += ""
$Md += "```txt"
$Md += $Result.buildOutputTail
$Md += "```"

$Md -join "`n" | Set-Content $MdOut -Encoding UTF8

Write-Host ""
Write-Host "NEXUS MASTER RUNTIME AUDIT 473 COMPLETE"
Write-Host "Build passed: $BuildPassed"
Write-Host "Capability checks: $CapabilityPassed / $CapabilityTotal"
Write-Host "JSON: $JsonOut"
Write-Host "Markdown: $MdOut"
Write-Host ""
