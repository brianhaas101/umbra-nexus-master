$Root = "C:\Dev\Nexus_MASTER"

$JsonOut = Join-Path $Root "public\data\certification\master\nexus_runtime_activation_audit_475.json"
$MdOut = Join-Path $Root "public\data\certification\master\NEXUS_RUNTIME_ACTIVATION_AUDIT_475.md"

function ReadText($Path){
  if(Test-Path $Path){
    return Get-Content $Path -Raw -ErrorAction SilentlyContinue
  }
  return ""
}

function Rel($Path){
  return $Path.Replace($Root + "\", "")
}

$IndexPath = Join-Path $Root "index.html"
$IndexText = ReadText $IndexPath

$ScriptTags = [regex]::Matches(
  $IndexText,
  '<script[^>]+src="([^"]+)"'
)

$LoadedSources = @()

foreach($s in $ScriptTags){
  $LoadedSources += $s.Groups[1].Value
}

$CodeFiles = Get-ChildItem `
  "$Root\public\globe" `
  -Recurse `
  -File `
  -Include *.js `
  -ErrorAction SilentlyContinue

$Systems = @()

foreach($file in $CodeFiles){

  $text = ReadText $file.FullName

  $rel = Rel $file.FullName

  $loaded =
    $LoadedSources |
    Where-Object {
      $_ -match [regex]::Escape($file.Name)
    }

  $hasWindow =
    $text -match "window\."

  $hasEventProducer =
    $text -match "CustomEvent|dispatchEvent"

  $hasEventConsumer =
    $text -match "addEventListener"

  $hasRuntimeReference =
    $text -match "Umbra|Nexus|Runtime|Command|Dossier|Intelligence"

  $status = "DORMANT"

  if($loaded -and ($hasWindow -or $hasRuntimeReference)){
    $status = "ACTIVE"
  }

  elseif($loaded){
    $status = "LOADED_NOT_REFERENCED"
  }

  elseif(
    $hasWindow `
    -or $hasEventProducer `
    -or $hasEventConsumer `
    -or $hasRuntimeReference
  ){
    $status = "EXISTS_NOT_LOADED"
  }

  $Systems += [PSCustomObject]@{
    file = $rel
    status = $status
    loaded = [bool]$loaded
    hasWindow = $hasWindow
    eventProducer = $hasEventProducer
    eventConsumer = $hasEventConsumer
    runtimeReference = $hasRuntimeReference
  }
}

$Summary = [ordered]@{
  active =
    @($Systems | Where-Object {$_.status -eq "ACTIVE"}).Count

  dormant =
    @($Systems | Where-Object {$_.status -eq "DORMANT"}).Count

  loaded_not_referenced =
    @($Systems | Where-Object {$_.status -eq "LOADED_NOT_REFERENCED"}).Count

  exists_not_loaded =
    @($Systems | Where-Object {$_.status -eq "EXISTS_NOT_LOADED"}).Count
}

$Result = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString("s")
  batch = 475
  name = "NEXUS_RUNTIME_ACTIVATION_AUDIT_475"
  summary = $Summary
  systems = $Systems
}

$Result |
ConvertTo-Json -Depth 20 |
Set-Content $JsonOut -Encoding UTF8

$Lines = New-Object System.Collections.Generic.List[string]

$Lines.Add("# NEXUS RUNTIME ACTIVATION AUDIT 475")
$Lines.Add("")
$Lines.Add("Generated: " + $Result.generatedAt)
$Lines.Add("")
$Lines.Add("## Summary")
$Lines.Add("")
$Lines.Add("- ACTIVE: " + $Summary.active)
$Lines.Add("- DORMANT: " + $Summary.dormant)
$Lines.Add("- LOADED_NOT_REFERENCED: " + $Summary.loaded_not_referenced)
$Lines.Add("- EXISTS_NOT_LOADED: " + $Summary.exists_not_loaded)
$Lines.Add("")
$Lines.Add("## ACTIVE SYSTEMS")
$Lines.Add("")

foreach($item in ($Systems | Where-Object {$_.status -eq "ACTIVE"})){
  $Lines.Add("- " + $item.file)
}

$Lines.Add("")
$Lines.Add("## EXISTS_NOT_LOADED")
$Lines.Add("")

foreach($item in ($Systems | Where-Object {$_.status -eq "EXISTS_NOT_LOADED"})){
  $Lines.Add("- " + $item.file)
}

[System.IO.File]::WriteAllLines(
  $MdOut,
  $Lines,
  [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "NEXUS RUNTIME ACTIVATION AUDIT 475 COMPLETE"
Write-Host ""
Write-Host ("ACTIVE: " + $Summary.active)
Write-Host ("DORMANT: " + $Summary.dormant)
Write-Host ("LOADED_NOT_REFERENCED: " + $Summary.loaded_not_referenced)
Write-Host ("EXISTS_NOT_LOADED: " + $Summary.exists_not_loaded)
Write-Host ""
