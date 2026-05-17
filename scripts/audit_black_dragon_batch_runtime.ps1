$ErrorActionPreference = "Continue"

$Out = ".\logs\black_dragon\batch_runtime_audit_$(Get-Date -Format yyyyMMdd_HHmmss)"
New-Item -ItemType Directory -Force $Out | Out-Null

Select-String -Path .\public\scene.js `
  -SimpleMatch "afterDataReady();" `
  -Context 5,5 |
Out-File "$Out\scene_afterDataReady.txt"

Select-String -Path .\public\scene.js `
  -SimpleMatch `
  "waitForFinalUmbraData",
  "waitForUmbraData",
  "FINAL UMBRA_DATA",
  "datasetHash missing",
  "loadDataV1",
  "BOOT COMPLETE" `
  -Context 3,3 |
Out-File "$Out\scene_gates.txt"

Select-String `
  -Path .\public\**\*.js,.\public\*.html `
  -SimpleMatch `
  "/public/data/",
  "/data/books/",
  "FOUNDERV1_UI_ARCH_LOCK_DATA_V1" |
Out-File "$Out\bad_paths.txt"

Select-String `
  -Path .\public\client_setup_black_dragon.html `
  -SimpleMatch `
  "location",
  "href",
  "assign",
  "black_dragon",
  "client_setup" `
  -Context 3,3 |
Out-File "$Out\setup_redirects.txt"

Get-ChildItem .\public -Recurse -File -Include *.js,*.html |
Select-String `
  -SimpleMatch `
  "black_dragon",
  "BlackDragon",
  "book_map_nodes",
  "client_operator_dashboard",
  "outreach_ready_queue",
  "classified_responses" |
Out-File "$Out\blackdragon_scripts.txt"

$routes = @(
  "/",
  "/client_setup_black_dragon.html",
  "/scene.js",
  "/globe/umbra_data.v1.js",
  "/data/clients/black_dragon/black_dragon_pass4_outreach_enabled.json",
  "/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json",
  "/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",
  "/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  "/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
)

$Results = foreach ($r in $routes) {
  try {
    $x = Invoke-WebRequest "http://localhost:5173$r" -UseBasicParsing -TimeoutSec 30

    [pscustomobject]@{
      Path   = $r
      Status = $x.StatusCode
      Type   = ($x.Headers["Content-Type"] -join ";")
      Bytes  = $x.RawContentLength
      Html   = $x.Content.TrimStart().StartsWith("<")
    }
  }
  catch {
    [pscustomobject]@{
      Path   = $r
      Status = "FAIL"
      Type   = ""
      Bytes  = 0
      Html   = ""
    }
  }
}

$Results |
Format-Table -AutoSize |
Out-File "$Out\routes.txt"

Write-Host ""
Write-Host "AUDIT OUTPUT:"
Get-ChildItem $Out
