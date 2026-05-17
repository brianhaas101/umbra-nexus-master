$ErrorActionPreference = "Continue"

$OutDir = ".\logs\black_dragon\compare_audit"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Targets = @(
  @{ Name="local_root"; Url="http://localhost:5173/" },
  @{ Name="local_setup"; Url="http://localhost:5173/client_setup_black_dragon.html" },
  @{ Name="remote_root"; Url="https://tension-dash-learn-metric.trycloudflare.com/" },
  @{ Name="remote_setup"; Url="https://tension-dash-learn-metric.trycloudflare.com/client_setup_black_dragon.html" }
)

$Paths = @(
  "/",
  "/scene.js",
  "/globe/textures.js",
  "/globe/layers.js",
  "/globe/umbra_data.v1.js",
  "/assets/earth_day_16k.jpg",
  "/assets/earth_client_base.png",
  "/data/clients/black_dragon/black_dragon_pass4_outreach_enabled.json"
)

foreach ($t in $Targets) {
  $rows = foreach ($p in $Paths) {
    $base = ([uri]$t.Url).GetLeftPart("Authority")
    try {
      $r = Invoke-WebRequest "$base$p" -UseBasicParsing -TimeoutSec 90
      [pscustomobject]@{
        Target=$t.Name
        Path=$p
        Status=$r.StatusCode
        Type=($r.Headers["Content-Type"] -join ";")
        Bytes=$r.RawContentLength
        Html=$r.Content.TrimStart().StartsWith("<")
      }
    } catch {
      [pscustomobject]@{
        Target=$t.Name
        Path=$p
        Status="FAIL"
        Type=""
        Bytes=0
        Html=""
      }
    }
  }
  $rows | Export-Csv "$OutDir\$($t.Name).routes.csv" -NoTypeInformation
  $rows | Format-Table -AutoSize
}

Get-FileHash .\public\scene.js, .\public\globe\textures.js, .\public\globe\layers.js |
  Export-Csv "$OutDir\runtime_file_hashes.csv" -NoTypeInformation

Select-String -Path .\public\scene.js -SimpleMatch `
  "isLocalRuntime",
  "makeClientCanvasTexture",
  "G.loadTextures",
  "datasetHash missing",
  "buildLayers",
  "loadDataV1",
  "BOOT COMPLETE" |
  Out-File "$OutDir\scene.audit.txt"

Select-String -Path .\public\globe\textures.js -SimpleMatch `
  "TIMEOUT_MS",
  "setTimeout",
  "finishOne",
  "onDone",
  "TextureLoader" |
  Out-File "$OutDir\textures.audit.txt"

Select-String -Path .\public\globe\layers.js -SimpleMatch `
  "const baseTex",
  "map: baseTex",
  "emissive",
  "globeMesh",
  "BUILD COMPLETE" |
  Out-File "$OutDir\layers.audit.txt"

Get-ChildItem $OutDir
