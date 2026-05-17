$Out = ".\logs\black_dragon\post_restore_deep_check_$(Get-Date -Format yyyyMMdd_HHmmss)"
New-Item -ItemType Directory -Force $Out | Out-Null

Select-String -Path .\public\scene.js -SimpleMatch `
  "afterDataReady();",
  "FINAL UMBRA_DATA",
  "waitForFinalUmbraData",
  "remote client waiting",
  "loadDataV1",
  "BOOT COMPLETE" -Context 4,4 |
Out-File "$Out\scene_boot_flow.txt"

Select-String -Path .\public\**\*.js,.\public\*.html -SimpleMatch `
  "/public/data/",
  "/data/books/" |
Out-File "$Out\bad_runtime_paths.txt"

Invoke-WebRequest "http://localhost:5173/scene.js" -UseBasicParsing |
Select-String "SyntaxError","Missing catch","FINAL UMBRA_DATA","remote client waiting" |
Out-File "$Out\served_scene_probe.txt"

Write-Host "POST-RESTORE CHECK:"
Get-ChildItem $Out
