$Root = "C:\Dev\Nexus_MASTER"

$JsonOut = Join-Path $Root "public\data\certification\master\nexus_master_runtime_audit_473.json"
$MdOut = Join-Path $Root "public\data\certification\master\NEXUS_MASTER_RUNTIME_AUDIT_473.md"

function Read-Text($Path) {
  if (Test-Path $Path) {
    return Get-Content $Path -Raw -ErrorAction SilentlyContinue
  }
  return ""
}

function Rel($Path) {
  return $Path.Replace($Root + "\", "")
}

function Find-Files($Base, $Pattern) {
  if (-not (Test-Path $Base)) {
    return @()
  }

  return Get-ChildItem $Base -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match $Pattern } |
    Select-Object FullName, Name, Length, LastWriteTime
}

function Git-Out($Args) {
  try {
    return (git -C $Root $Args 2>$null) -join [Environment]::NewLine
  } catch {
    return ""
  }
}

function Exists-Rel($RelPath) {
  return Test-Path (Join-Path $Root $RelPath)
}

$IndexPath = Join-Path $Root "index.html"
$IndexHtml = Read-Text $IndexPath

$ScriptTags = @()
if ($IndexHtml.Length -gt 0) {
  $Matches = [regex]::Matches($IndexHtml, '<script[^>]+src="([^"]+)"[^>]*>')
  foreach ($m in $Matches) {
    $ScriptTags += [PSCustomObject]@{
      src = $m.Groups[1].Value
    }
  }
}

$PublicGlobe = Join-Path $Root "public\globe"
$PublicData = Join-Path $Root "public\data"
$RuntimeDir = Join-Path $Root "public\globe\runtime"

$RuntimeJsFiles = Find-Files $PublicGlobe "\.js$"
$RuntimeJsonFiles = Find-Files $PublicData "\.json$"
$PhaseFiles = Find-Files $PublicGlobe "phase[0-9].*\.js$"
$Phase9Files = Find-Files $PublicGlobe "phase9.*\.js$"
$Phase10Files = Find-Files $PublicGlobe "phase10.*\.js$"
$RuntimeBridgeFiles = Find-Files $RuntimeDir ".*"

$SrcIntelligenceFiles = Find-Files (Join-Path $Root "src\intelligence") ".*"
$PublicIntelligenceFiles = Find-Files (Join-Path $Root "public\data\intelligence") ".*"
$SecurityFiles = Find-Files (Join-Path $Root "public\globe\security") ".*"
$PerformanceFiles = Find-Files (Join-Path $Root "public\globe\performance") ".*"
$ClientFiles = Find-Files (Join-Path $Root "public\data\clients") ".*"
$CityTileFiles = Find-Files (Join-Path $Root "public\assets\city_tiles") ".*"

$WindowGlobals = @()
$EventProducerFiles = @()
$EventConsumerFiles = @()
$RuntimeReferenceFiles = @()

$SearchRoots = @(
  "public\globe",
  "src",
  "scripts"
)

foreach ($relRoot in $SearchRoots) {
  $absRoot = Join-Path $Root $relRoot

  if (Test-Path $absRoot) {
    $files = Get-ChildItem $absRoot -Recurse -File -Include *.js,*.mjs,*.ts,*.html,*.ps1 -ErrorAction SilentlyContinue

    foreach ($file in $files) {
      $text = Read-Text $file.FullName

      if ($text.Length -eq 0) {
        continue
      }

      $globalMatches = [regex]::Matches($text, 'window\.([A-Za-z0-9_]+)')
      foreach ($gm in $globalMatches) {
        $WindowGlobals += [PSCustomObject]@{
          global = $gm.Groups[1].Value
          file = Rel $file.FullName
        }
      }

      if ($text -match "dispatchEvent|CustomEvent|emit\(") {
        $EventProducerFiles += [PSCustomObject]@{
          file = Rel $file.FullName
        }
      }

      if ($text -match "addEventListener|subscribe|on\(") {
        $EventConsumerFiles += [PSCustomObject]@{
          file = Rel $file.FullName
        }
      }

      if ($text -match "Umbra|Nexus|Dossier|City|Command|Founder|Intelligence|Runtime") {
        $RuntimeReferenceFiles += [PSCustomObject]@{
          file = Rel $file.FullName
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

  phase9_foundation_exists = Exists-Rel "public\globe\phase9_foundation_431.js"
  phase9_governance_certification_exists = Exists-Rel "public\globe\phase9_governance_certification_435.js"
  phase9_continuity_certification_exists = Exists-Rel "src\phase9-continuity-certification.js"

  phase10_runtime_certification_exists = Exists-Rel "public\globe\runtime\phase10_runtime_certification_465.js"
  phase10_intelligence_certification_exists = Exists-Rel "public\globe\runtime\phase10_intelligence_runtime_certification_470.js"
  phase10_operational_certification_exists = Exists-Rel "public\globe\runtime\phase10_operational_execution_certification_472.js"

  globe_core_exists = Exists-Rel "public\globe\core.js"
  city_map_exists = Exists-Rel "public\globe\city_map.js"
  command_deck_exists = Exists-Rel "public\globe\command_deck_runtime.js"
  founder_dashboard_exists = Exists-Rel "public\globe\founder_dashboard_runtime.js"

  dossier_open_bridge_exists = Exists-Rel "public\globe\runtime\dossier_open_bridge.js"
  dossier_mount_restore_exists = Exists-Rel "public\globe\runtime\dossier_mount_restore.js"
  city_click_bridge_exists = Exists-Rel "public\globe\runtime\city_click_tilemap_bridge.js"

  intel_loader_bridge_exists = Exists-Rel "public\globe\runtime\intel_loader_bridge.js"
  intel_alias_bridge_exists = Exists-Rel "public\globe\runtime\intel_runtime_alias_bridge.js"

  security_guard_exists = Exists-Rel "public\globe\security\frontend_runtime_guard.js"
  access_control_exists = Exists-Rel "public\globe\security\access_control_runtime.js"

  performance_mode_exists = Exists-Rel "public\globe\performance\movement_performance_mode.js"

  public_intelligence_data_exists = Exists-Rel "public\data\intelligence"
  src_intelligence_exists = Exists-Rel "src\intelligence"

  client_data_exists = Exists-Rel "public\data\clients"
  black_dragon_client_data_exists = Exists-Rel "public\data\clients\black_dragon"
}

$CapabilityPassed = @($CapabilityChecks.GetEnumerator() | Where-Object { $_.Value -eq $true }).Count
$CapabilityTotal = @($CapabilityChecks.GetEnumerator()).Count
$CapabilityFailed = $CapabilityTotal - $CapabilityPassed

$Branch = Git-Out "branch --show-current"
$Status = Git-Out "status --short"
$Log = Git-Out "log --oneline --decorate -25"
$Tags = Git-Out "tag --list"

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
  $RiskFlags += "Working tree has modified, deleted, or untracked files. Stage only intended files."
}

if ($CapabilityFailed -gt 0) {
  $RiskFlags += "Some static capability checks failed."
}

if (-not $BuildPassed) {
  $RiskFlags += "Production build failed."
}

if (@($ScriptTags).Count -gt 60) {
  $RiskFlags += "Root index has a large number of script tags. Audit legacy and duplicate runtime loading before major UI changes."
}

$Result = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  batch = "473B"
  name = "NEXUS_MASTER_RUNTIME_AUDIT_473B"
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
    phase9Files = @($Phase9Files).Count
    phase10Files = @($Phase10Files).Count
    runtimeBridgeFiles = @($RuntimeBridgeFiles).Count
    srcIntelligenceFiles = @($SrcIntelligenceFiles).Count
    publicIntelligenceFiles = @($PublicIntelligenceFiles).Count
    securityFiles = @($SecurityFiles).Count
    performanceFiles = @($PerformanceFiles).Count
    clientFiles = @($ClientFiles).Count
    cityTileFiles = @($CityTileFiles).Count
    uniqueWindowGlobals = @($UniqueGlobals).Count
    eventProducerFiles = @($EventProducerFiles).Count
    eventConsumerFiles = @($EventConsumerFiles).Count
    runtimeReferenceFiles = @($RuntimeReferenceFiles).Count
    capabilityPassed = $CapabilityPassed
    capabilityFailed = $CapabilityFailed
    capabilityTotal = $CapabilityTotal
  }
  capabilityChecks = $CapabilityChecks
  scriptTags = $ScriptTags
  uniqueWindowGlobals = $UniqueGlobals
  eventProducerFiles = $EventProducerFiles
  eventConsumerFiles = $EventConsumerFiles
  phase9Files = @($Phase9Files | ForEach-Object { Rel $_.FullName })
  phase10Files = @($Phase10Files | ForEach-Object { Rel $_.FullName })
  runtimeBridgeFiles = @($RuntimeBridgeFiles | ForEach-Object { Rel $_.FullName })
  riskFlags = $RiskFlags
  buildOutputTail = (($BuildOutput -split [Environment]::NewLine) | Select-Object -Last 30) -join [Environment]::NewLine
}

$Result | ConvertTo-Json -Depth 50 | Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS MASTER RUNTIME AUDIT 473B")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")
$Lines.Add("- Build passed: " + $BuildPassed)
$Lines.Add("- Branch: " + $Result.branch)
$Lines.Add("- Script tags in root index: " + @($ScriptTags).Count)
$Lines.Add("- Public globe JS files: " + @($RuntimeJsFiles).Count)
$Lines.Add("- Public data JSON files: " + @($RuntimeJsonFiles).Count)
$Lines.Add("- Phase files: " + @($PhaseFiles).Count)
$Lines.Add("- Phase 9 files: " + @($Phase9Files).Count)
$Lines.Add("- Phase 10 files: " + @($Phase10Files).Count)
$Lines.Add("- Runtime bridge files: " + @($RuntimeBridgeFiles).Count)
$Lines.Add("- Source intelligence files: " + @($SrcIntelligenceFiles).Count)
$Lines.Add("- Public intelligence files: " + @($PublicIntelligenceFiles).Count)
$Lines.Add("- Security files: " + @($SecurityFiles).Count)
$Lines.Add("- Performance files: " + @($PerformanceFiles).Count)
$Lines.Add("- Client data files: " + @($ClientFiles).Count)
$Lines.Add("- City tile files: " + @($CityTileFiles).Count)
$Lines.Add("- Unique window globals: " + @($UniqueGlobals).Count)
$Lines.Add("- Event producer files: " + @($EventProducerFiles).Count)
$Lines.Add("- Event consumer files: " + @($EventConsumerFiles).Count)
$Lines.Add("- Runtime reference files: " + @($RuntimeReferenceFiles).Count)
$Lines.Add("- Capability checks: " + $CapabilityPassed + " / " + $CapabilityTotal)
$Lines.Add("")
$Lines.Add("## Capability Checks")
$Lines.Add("")

foreach ($item in $CapabilityChecks.GetEnumerator()) {
  if ($item.Value) {
    $Lines.Add("- [PASS] " + $item.Key)
  } else {
    $Lines.Add("- [FAIL] " + $item.Key)
  }
}

$Lines.Add("")
$Lines.Add("## Risk Flags")
$Lines.Add("")

if (@($RiskFlags).Count -eq 0) {
  $Lines.Add("- None")
} else {
  foreach ($risk in $RiskFlags) {
    $Lines.Add("- " + $risk)
  }
}

$Lines.Add("")
$Lines.Add("## Phase 9 Files")
$Lines.Add("")

foreach ($file in $Phase9Files) {
  $Lines.Add("- " + (Rel $file.FullName))
}

$Lines.Add("")
$Lines.Add("## Phase 10 Files")
$Lines.Add("")

foreach ($file in $Phase10Files) {
  $Lines.Add("- " + (Rel $file.FullName))
}

$Lines.Add("")
$Lines.Add("## Runtime Bridge Files")
$Lines.Add("")

foreach ($file in $RuntimeBridgeFiles) {
  $Lines.Add("- " + (Rel $file.FullName))
}

$Lines.Add("")
$Lines.Add("## Window Globals")
$Lines.Add("")

foreach ($g in ($UniqueGlobals | Select-Object -First 250)) {
  $Lines.Add("- " + $g.global + " (" + $g.count + ")")
}

$Lines.Add("")
$Lines.Add("## Recent Git Log")
$Lines.Add("")
$Lines.Add($Log)
$Lines.Add("")
$Lines.Add("## Build Output Tail")
$Lines.Add("")
$Lines.Add($Result.buildOutputTail)

[System.IO.File]::WriteAllLines($MdOut, $Lines, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "NEXUS MASTER RUNTIME AUDIT 473B COMPLETE"
Write-Host ("Build passed: " + $BuildPassed)
Write-Host ("Capability checks: " + $CapabilityPassed + " / " + $CapabilityTotal)
Write-Host ("JSON: " + $JsonOut)
Write-Host ("Markdown: " + $MdOut)
Write-Host ""
