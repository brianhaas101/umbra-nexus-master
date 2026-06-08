$Root = "C:\Dev\Nexus_MASTER"

$OutJson = Join-Path $Root "public\data\certification\master\nexus_master_certification_v1.json"
$OutMd   = Join-Path $Root "public\data\certification\master\NEXUS_MASTER_CERTIFICATION_V1.md"

function Test-Exists($Path) {
    return Test-Path (Join-Path $Root $Path)
}

function Get-Git($Args) {
    try {
        return (git -C $Root $Args 2>$null) -join "`n"
    } catch {
        return ""
    }
}

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

$PhaseChecks = @(
    @{
        phase = 1
        name = "Runtime Foundation"
        evidence = @(
            "public/data/certification/phase_1_runtime_foundation_certification_lock.v1.json",
            "public/data/certification/phase_1_runtime_warning_register.v1.json"
        )
    },
    @{
        phase = 3
        name = "City Saturation / Source Validation"
        evidence = @(
            "public/data/certification/phase_3_city_saturation_certification_lock.v1.json",
            "public/data/certification/phase_3_city_saturation_runtime_manifest.v1.json",
            "public/data/certification/phase_3_source_validation_metrics.v1.json",
            "public/data/certification/phase_3_verification_metrics.v1.json"
        )
    },
    @{
        phase = 9
        name = "Final Audit / Governance / Continuity / Intelligence / Operations"
        evidence = @(
            "src/phase9-final-audit-certification.js",
            "src/phase9-runtime-integration-certification.js",
            "src/phase9-intelligence-certification.js",
            "src/phase9-operations-certification.js"
        )
    },
    @{
        phase = 10
        name = "Runtime Stack / Intelligence Runtime"
        evidence = @(
            "public/globe/runtime/phase10_runtime_certification_465.js",
            "public/globe/runtime/phase10_intelligence_runtime_certification_470.js",
            "public/globe/runtime/phase10_intelligence_runtime_layer_467.js",
            "public/globe/runtime/phase10_intelligence_source_connector_469.js"
        )
    }
)

$PhaseResults = @()

foreach ($phase in $PhaseChecks) {
    $EvidenceResults = @()

    foreach ($item in $phase.evidence) {
        $EvidenceResults += [PSCustomObject]@{
            path = $item
            exists = Test-Exists $item
        }
    }

    $Found = @($EvidenceResults | Where-Object { $_.exists }).Count
    $Total = @($EvidenceResults).Count

    $Status =
        if ($Found -eq $Total) { "COMPLETE" }
        elseif ($Found -gt 0) { "PARTIAL" }
        else { "MISSING" }

    $PhaseResults += [PSCustomObject]@{
        phase = $phase.phase
        name = $phase.name
        status = $Status
        evidenceFound = $Found
        evidenceTotal = $Total
        evidence = $EvidenceResults
    }
}

$RuntimeModules = Get-ChildItem (Join-Path $Root "public\globe\runtime") -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "phase10|runtime|intel" } |
    Select-Object Name, Length, LastWriteTime

$SecurityModules = Get-ChildItem (Join-Path $Root "public\globe\security") -File -ErrorAction SilentlyContinue |
    Select-Object Name, Length, LastWriteTime

$PerformanceModules = Get-ChildItem (Join-Path $Root "public\globe\performance") -File -ErrorAction SilentlyContinue |
    Select-Object Name, Length, LastWriteTime

$CertificationFiles = Get-ChildItem (Join-Path $Root "public\data\certification") -Recurse -File -ErrorAction SilentlyContinue |
    Select-Object FullName, Length, LastWriteTime

$ClientAuditFiles = Get-ChildItem (Join-Path $Root "clients\CLIENT-BD-001") -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "audit|certification|readiness|report" } |
    Select-Object FullName, Length, LastWriteTime

$Tags = Get-Git "tag --list"
$Log = Get-Git "log --oneline --decorate -20"
$Branch = Get-Git "branch --show-current"
$StatusShort = Get-Git "status --short"

$RequiredTags = @(
    "PHASE_9_CERTIFIED",
    "PHASE_10_STARTED",
    "PHASE_10_RUNTIME_STACK_CERTIFIED",
    "PHASE_10_INTELLIGENCE_RUNTIME_LAYER",
    "PHASE_10_INTELLIGENCE_RUNTIME_CERTIFIED"
)

$TagResults = foreach ($tag in $RequiredTags) {
    [PSCustomObject]@{
        tag = $tag
        exists = $Tags -split "`n" | Where-Object { $_ -eq $tag } | ForEach-Object { $true } | Select-Object -First 1
    }
}

foreach ($t in $TagResults) {
    if ($null -eq $t.exists) { $t.exists = $false }
}

$CompletedPhases = @($PhaseResults | Where-Object { $_.status -eq "COMPLETE" }).Count
$PartialPhases = @($PhaseResults | Where-Object { $_.status -eq "PARTIAL" }).Count
$MissingPhases = @($PhaseResults | Where-Object { $_.status -eq "MISSING" }).Count
$ExistingRequiredTags = @($TagResults | Where-Object { $_.exists }).Count

$MasterStatus =
    if (
        $BuildPassed -and
        $MissingPhases -eq 0 -and
        $ExistingRequiredTags -eq $RequiredTags.Count
    ) {
        "MASTER_BASELINE_CERTIFIED"
    } elseif ($BuildPassed -and $MissingPhases -eq 0) {
        "MASTER_BASELINE_CERTIFIED_WITH_TAG_WARNINGS"
    } elseif ($BuildPassed) {
        "MASTER_BASELINE_PARTIAL"
    } else {
        "MASTER_BASELINE_BLOCKED"
    }

$RemainingWork = @()

if (-not $BuildPassed) {
    $RemainingWork += "Production build must pass."
}

if ($ExistingRequiredTags -lt $RequiredTags.Count) {
    $RemainingWork += "Required certification tags are missing or not pushed."
}

if ($PartialPhases -gt 0 -or $MissingPhases -gt 0) {
    $RemainingWork += "Some phase evidence groups are partial or missing."
}

$RemainingWork += "Browser console validation still required for final live runtime proof."
$RemainingWork += "End-to-end operator workflow validation still required: globe -> city -> entity -> dossier -> command action."
$RemainingWork += "Command surface integration should consume certified Phase 10 runtime/intelligence globals."

$Result = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("s")
    branch = $Branch.Trim()
    gitStatusShort = $StatusShort
    latestLog = $Log
    masterStatus = $MasterStatus
    buildPassed = $BuildPassed
    requiredTags = $TagResults
    phaseResults = $PhaseResults
    metrics = [PSCustomObject]@{
        completedPhaseEvidenceGroups = $CompletedPhases
        partialPhaseEvidenceGroups = $PartialPhases
        missingPhaseEvidenceGroups = $MissingPhases
        runtimeModuleCount = @($RuntimeModules).Count
        securityModuleCount = @($SecurityModules).Count
        performanceModuleCount = @($PerformanceModules).Count
        certificationFileCount = @($CertificationFiles).Count
        clientAuditFileCount = @($ClientAuditFiles).Count
    }
    remainingWork = $RemainingWork
    buildOutputTail = (($BuildOutput -split "`n") | Select-Object -Last 30) -join "`n"
}

$Result | ConvertTo-Json -Depth 50 | Set-Content $OutJson -Encoding UTF8

$Md = @()
$Md += "# NEXUS MASTER CERTIFICATION V1"
$Md += ""
$Md += "Generated: $($Result.generatedAt)"
$Md += ""
$Md += "## Master Status"
$Md += ""
$Md += "**$MasterStatus**"
$Md += ""
$Md += "Build Passed: $BuildPassed"
$Md += "Branch: $($Result.branch)"
$Md += ""
$Md += "## Phase Evidence"
$Md += ""

foreach ($phase in $PhaseResults) {
    $Md += "### Phase $($phase.phase) — $($phase.name)"
    $Md += ""
    $Md += "Status: **$($phase.status)**"
    $Md += "Evidence: $($phase.evidenceFound) / $($phase.evidenceTotal)"
    $Md += ""
    foreach ($item in $phase.evidence) {
        $mark = if ($item.exists) { "✓" } else { "✗" }
        $Md += "- $mark `$($item.path)`"
    }
    $Md += ""
}

$Md += "## Required Tags"
$Md += ""

foreach ($tag in $TagResults) {
    $mark = if ($tag.exists) { "✓" } else { "✗" }
    $Md += "- $mark $($tag.tag)"
}

$Md += ""
$Md += "## Runtime Footprint"
$Md += ""
$Md += "- Runtime modules: $(@($RuntimeModules).Count)"
$Md += "- Security modules: $(@($SecurityModules).Count)"
$Md += "- Performance modules: $(@($PerformanceModules).Count)"
$Md += "- Certification files: $(@($CertificationFiles).Count)"
$Md += "- Client audit/readiness files: $(@($ClientAuditFiles).Count)"
$Md += ""
$Md += "## Remaining Work"
$Md += ""

foreach ($item in $RemainingWork) {
    $Md += "- $item"
}

$Md += ""
$Md += "## Recent Git Log"
$Md += ""
$Md += '```txt'
$Md += $Log
$Md += '```'
$Md += ""
$Md += "## Build Output Tail"
$Md += ""
$Md += '```txt'
$Md += $Result.buildOutputTail
$Md += '```'

$Md -join "`n" | Set-Content $OutMd -Encoding UTF8

Write-Host ""
Write-Host "NEXUS MASTER CERTIFICATION GENERATED" -ForegroundColor Cyan
Write-Host "Status: $MasterStatus"
Write-Host "JSON: $OutJson"
Write-Host "Markdown: $OutMd"
Write-Host ""
