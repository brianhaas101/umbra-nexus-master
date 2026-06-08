$Root = "C:\Dev\Nexus_MASTER"
$JsonOut = Join-Path $Root "public\data\certification\master\nexus_runtime_dependency_map_474.json"
$MdOut = Join-Path $Root "public\data\certification\master\NEXUS_RUNTIME_DEPENDENCY_MAP_474.md"

function Read-Text($Path) {
  if (Test-Path $Path) {
    return Get-Content $Path -Raw -ErrorAction SilentlyContinue
  }
  return ""
}

function Rel($Path) {
  return $Path.Replace($Root + "\", "")
}

function Resolve-ScriptPath($Src) {
  $clean = $Src.TrimStart("/")
  return Join-Path $Root ("public\" + $clean.Replace("/", "\"))
}

function Find-CodeFiles($Base) {
  if (-not (Test-Path $Base)) {
    return @()
  }

  return Get-ChildItem $Base -Recurse -File -Include *.js,*.mjs,*.ts,*.html,*.ps1 -ErrorAction SilentlyContinue
}

$IndexPath = Join-Path $Root "index.html"
$IndexHtml = Read-Text $IndexPath

$ScriptTags = @()
$scriptMatches = [regex]::Matches($IndexHtml, '<script[^>]+src="([^"]+)"[^>]*>')

$order = 0
foreach ($m in $scriptMatches) {
  $order++
  $src = $m.Groups[1].Value
  $resolved = Resolve-ScriptPath $src

  $ScriptTags += [PSCustomObject]@{
    order = $order
    src = $src
    resolvedPath = $resolved
    exists = Test-Path $resolved
  }
}

$CodeFiles = @()
$CodeFiles += Find-CodeFiles (Join-Path $Root "public\globe")
$CodeFiles += Find-CodeFiles (Join-Path $Root "src")
$CodeFiles += Find-CodeFiles (Join-Path $Root "scripts")

$LoadedFiles = @(
  $ScriptTags |
    Where-Object { $_.exists } |
    ForEach-Object { Rel $_.resolvedPath }
)

$DependencyRows = @()
$GlobalWrites = @()
$GlobalReads = @()
$EventProducers = @()
$EventConsumers = @()
$RuntimeReferences = @()

foreach ($file in $CodeFiles) {
  $text = Read-Text $file.FullName
  if ($text.Length -eq 0) {
    continue
  }

  $rel = Rel $file.FullName
  $isLoaded = $LoadedFiles -contains $rel

  $writeMatches = [regex]::Matches($text, 'window\.([A-Za-z0-9_]+)\s*=')
  foreach ($wm in $writeMatches) {
    $GlobalWrites += [PSCustomObject]@{
      global = $wm.Groups[1].Value
      file = $rel
      loaded = $isLoaded
    }
  }

  $readMatches = [regex]::Matches($text, 'window\.([A-Za-z0-9_]+)')
  foreach ($rm in $readMatches) {
    $GlobalReads += [PSCustomObject]@{
      global = $rm.Groups[1].Value
      file = $rel
      loaded = $isLoaded
    }
  }

  $eventNames = @()

  $customEvents = [regex]::Matches($text, 'new\s+CustomEvent\(\s*["'']([^"'']+)["'']')
  foreach ($em in $customEvents) {
    $eventNames += $em.Groups[1].Value
    $EventProducers += [PSCustomObject]@{
      event = $em.Groups[1].Value
      file = $rel
      loaded = $isLoaded
      method = "CustomEvent"
    }
  }

  $dispatches = [regex]::Matches($text, 'dispatchEvent')
  if ($dispatches.Count -gt 0 -and $customEvents.Count -eq 0) {
    $EventProducers += [PSCustomObject]@{
      event = "UNKNOWN_DISPATCH_EVENT"
      file = $rel
      loaded = $isLoaded
      method = "dispatchEvent"
    }
  }

  $listeners = [regex]::Matches($text, 'addEventListener\(\s*["'']([^"'']+)["'']')
  foreach ($lm in $listeners) {
    $EventConsumers += [PSCustomObject]@{
      event = $lm.Groups[1].Value
      file = $rel
      loaded = $isLoaded
      method = "addEventListener"
    }
  }

  $importantRefs = [regex]::Matches($text, 'Umbra[A-Za-z0-9_]+|Nexus[A-Za-z0-9_]+|Dossier[A-Za-z0-9_]+|City[A-Za-z0-9_]+|Command[A-Za-z0-9_]+|Founder[A-Za-z0-9_]+|Intelligence[A-Za-z0-9_]+')
  foreach ($ir in $importantRefs) {
    $RuntimeReferences += [PSCustomObject]@{
      reference = $ir.Value
      file = $rel
      loaded = $isLoaded
    }
  }

  $DependencyRows += [PSCustomObject]@{
    file = $rel
    loadedFromIndex = $isLoaded
    globalWrites = $writeMatches.Count
    globalReads = $readMatches.Count
    customEvents = $customEvents.Count
    eventListeners = $listeners.Count
    runtimeReferences = $importantRefs.Count
  }
}

$DuplicateGlobals = $GlobalWrites |
  Group-Object global |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    [PSCustomObject]@{
      global = $_.Name
      writers = $_.Count
      files = @($_.Group | Select-Object -ExpandProperty file -Unique)
      loadedWriters = @($_.Group | Where-Object { $_.loaded } | Select-Object -ExpandProperty file -Unique)
    }
  } |
  Sort-Object global

$EventNames = @()
$EventNames += $EventProducers | Select-Object -ExpandProperty event
$EventNames += $EventConsumers | Select-Object -ExpandProperty event
$EventNames = $EventNames | Sort-Object -Unique

$EventMap = foreach ($event in $EventNames) {
  $producers = @($EventProducers | Where-Object { $_.event -eq $event })
  $consumers = @($EventConsumers | Where-Object { $_.event -eq $event })

  [PSCustomObject]@{
    event = $event
    producers = @($producers | Select-Object -ExpandProperty file -Unique)
    consumers = @($consumers | Select-Object -ExpandProperty file -Unique)
    producerCount = $producers.Count
    consumerCount = $consumers.Count
    status = if ($producers.Count -gt 0 -and $consumers.Count -gt 0) {
      "CONNECTED"
    } elseif ($producers.Count -gt 0) {
      "PRODUCER_ONLY"
    } else {
      "CONSUMER_ONLY"
    }
  }
}

$OrphanLoadedScripts = $ScriptTags |
  Where-Object { -not $_.exists } |
  Select-Object order, src, resolvedPath, exists

$UnloadedCodeFiles = $DependencyRows |
  Where-Object {
    $_.loadedFromIndex -eq $false -and
    ($_.globalWrites -gt 0 -or $_.customEvents -gt 0 -or $_.eventListeners -gt 0)
  } |
  Sort-Object file

$RiskFlags = @()

if (@($DuplicateGlobals).Count -gt 0) {
  $RiskFlags += "Duplicate window global writers detected."
}

if (@($OrphanLoadedScripts).Count -gt 0) {
  $RiskFlags += "Index references missing script files."
}

if (@($EventMap | Where-Object { $_.status -ne "CONNECTED" }).Count -gt 0) {
  $RiskFlags += "Some events are producer-only or consumer-only."
}

if (@($ScriptTags).Count -gt 60) {
  $RiskFlags += "Root index has high script-tag count. Consider loader consolidation."
}

$Result = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  batch = 474
  name = "NEXUS_RUNTIME_DEPENDENCY_MAP_474"
  metrics = [PSCustomObject]@{
    scriptTags = @($ScriptTags).Count
    missingScriptTags = @($OrphanLoadedScripts).Count
    codeFilesScanned = @($CodeFiles).Count
    dependencyRows = @($DependencyRows).Count
    globalWrites = @($GlobalWrites).Count
    globalReads = @($GlobalReads).Count
    duplicateGlobals = @($DuplicateGlobals).Count
    eventProducers = @($EventProducers).Count
    eventConsumers = @($EventConsumers).Count
    eventMapEntries = @($EventMap).Count
    connectedEvents = @($EventMap | Where-Object { $_.status -eq "CONNECTED" }).Count
    producerOnlyEvents = @($EventMap | Where-Object { $_.status -eq "PRODUCER_ONLY" }).Count
    consumerOnlyEvents = @($EventMap | Where-Object { $_.status -eq "CONSUMER_ONLY" }).Count
    unloadedRuntimeRelevantFiles = @($UnloadedCodeFiles).Count
  }
  scriptTags = $ScriptTags
  dependencyRows = $DependencyRows
  duplicateGlobals = $DuplicateGlobals
  eventMap = $EventMap
  orphanLoadedScripts = $OrphanLoadedScripts
  unloadedRuntimeRelevantFiles = $UnloadedCodeFiles
  riskFlags = $RiskFlags
}

$Result | ConvertTo-Json -Depth 50 | Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS RUNTIME DEPENDENCY MAP 474")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")
$Lines.Add("- Script tags: " + @($ScriptTags).Count)
$Lines.Add("- Missing script tags: " + @($OrphanLoadedScripts).Count)
$Lines.Add("- Code files scanned: " + @($CodeFiles).Count)
$Lines.Add("- Dependency rows: " + @($DependencyRows).Count)
$Lines.Add("- Global writes: " + @($GlobalWrites).Count)
$Lines.Add("- Global reads: " + @($GlobalReads).Count)
$Lines.Add("- Duplicate globals: " + @($DuplicateGlobals).Count)
$Lines.Add("- Event producers: " + @($EventProducers).Count)
$Lines.Add("- Event consumers: " + @($EventConsumers).Count)
$Lines.Add("- Event map entries: " + @($EventMap).Count)
$Lines.Add("- Connected events: " + @($EventMap | Where-Object { $_.status -eq "CONNECTED" }).Count)
$Lines.Add("- Producer-only events: " + @($EventMap | Where-Object { $_.status -eq "PRODUCER_ONLY" }).Count)
$Lines.Add("- Consumer-only events: " + @($EventMap | Where-Object { $_.status -eq "CONSUMER_ONLY" }).Count)
$Lines.Add("- Unloaded runtime-relevant files: " + @($UnloadedCodeFiles).Count)
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
$Lines.Add("## Missing Script Tags")
$Lines.Add("")

if (@($OrphanLoadedScripts).Count -eq 0) {
  $Lines.Add("- None")
} else {
  foreach ($item in $OrphanLoadedScripts) {
    $Lines.Add("- " + $item.src)
  }
}

$Lines.Add("")
$Lines.Add("## Duplicate Window Globals")
$Lines.Add("")

foreach ($item in ($DuplicateGlobals | Select-Object -First 100)) {
  $Lines.Add("- " + $item.global + " writers=" + $item.writers)
}

$Lines.Add("")
$Lines.Add("## Event Map Issues")
$Lines.Add("")

foreach ($item in ($EventMap | Where-Object { $_.status -ne "CONNECTED" } | Select-Object -First 150)) {
  $Lines.Add("- " + $item.status + " :: " + $item.event + " producers=" + $item.producerCount + " consumers=" + $item.consumerCount)
}

$Lines.Add("")
$Lines.Add("## First 80 Script Load Order Entries")
$Lines.Add("")

foreach ($item in ($ScriptTags | Select-Object -First 80)) {
  $Lines.Add("- " + $item.order + " :: " + $item.src + " exists=" + $item.exists)
}

[System.IO.File]::WriteAllLines($MdOut, $Lines, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "NEXUS RUNTIME DEPENDENCY MAP 474 COMPLETE"
Write-Host ("JSON: " + $JsonOut)
Write-Host ("Markdown: " + $MdOut)
Write-Host ("Script tags: " + @($ScriptTags).Count)
Write-Host ("Duplicate globals: " + @($DuplicateGlobals).Count)
Write-Host ("Event entries: " + @($EventMap).Count)
Write-Host ""
