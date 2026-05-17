$ErrorActionPreference = "Continue"

$OutDir = ".\logs\black_dragon\runtime_audit"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$BaseLocal = "http://localhost:5173"
$BaseRemote = "https://tension-dash-learn-metric.trycloudflare.com"

$Paths = @(
  "/",
  "/scene.js",
  "/globe/core.js",
  "/globe/textures.js",
  "/globe/layers.js",
  "/globe/umbra_data.v1.js",
  "/assets/earth_day_16k.jpg",
  "/assets/earthatnight2012.png",
  "/assets/starfield_8k.png",
  "/assets/earth_client_base.png",
  "/data/clients/black_dragon/black_dragon_pass4_outreach_enabled.json",
  "/data/clients/black_dragon/national/map/runtime/national_map_nodes.v1.json"
)

function Test-RouteSet($Base, $Name) {
  $Rows = foreach ($Path in $Paths) {
    try {
      $r = Invoke-WebRequest "$Base$Path" -UseBasicParsing -TimeoutSec 20
      [pscustomobject]@{
        Runtime = $Name
        Path = $Path
        Status = $r.StatusCode
        ContentType = ($r.Headers["Content-Type"] -join ";")
        Bytes = $r.RawContentLength
        StartsHtml = $r.Content.TrimStart().StartsWith("<")
      }
    } catch {
      [pscustomobject]@{
        Runtime = $Name
        Path = $Path
        Status = "FAIL"
        ContentType = ""
        Bytes = 0
        StartsHtml = ""
      }
    }
  }

  $Rows | Export-Csv "$OutDir\$Name.routes.csv" -NoTypeInformation
  $Rows | Format-Table -AutoSize
}

Test-RouteSet $BaseLocal "local"
Test-RouteSet $BaseRemote "remote"

Select-String -Path .\public\scene.js -SimpleMatch `
  "G.loadTextures",
  "isLocalRuntime",
  "makeClientCanvasTexture",
  "datasetHash missing",
  "afterDataReady",
  "startRAF",
  "BOOT COMPLETE" |
  Out-File "$OutDir\scene.keylines.txt"

Select-String -Path .\public\globe\layers.js -SimpleMatch `
  "const baseTex",
  "map: baseTex",
  "emissive",
  "globeMesh",
  "BUILD COMPLETE" |
  Out-File "$OutDir\layers.keylines.txt"

Select-String -Path .\public\globe\textures.js -SimpleMatch `
  "TIMEOUT_MS",
  "finishOne",
  "onDone",
  "TextureLoader" |
  Out-File "$OutDir\textures.keylines.txt"

Get-ChildItem $OutDir
