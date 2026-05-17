$ErrorActionPreference = "Stop"

$BadSceneTerms = @(
  "generated-client-canvas",
  "remoteClientTex",
  "makeClientCanvasTexture",
  "client mode continuing",
  "datasetHash missing after load; client mode continuing",
  "HIERARCHY READY {cities: 0"
)

$Scene = ".\public\scene.js"

$Hits = Select-String -Path $Scene -SimpleMatch $BadSceneTerms -ErrorAction SilentlyContinue

if ($Hits) {
  Write-Host "RUNTIME GUARD FAIL: forbidden scene.js terms found" -ForegroundColor Red
  $Hits
  exit 1
}

$RequiredTerms = @(
  "/assets/umbra_earth_16k.jpg",
  "/assets/earthatnight2012.png",
  "/assets/starfield_8k.png",
  "waitForPopulatedUmbraData",
  "populated UMBRA_DATA ready; continuing"
)

foreach ($term in $RequiredTerms) {
  if (!(Select-String -Path $Scene -SimpleMatch $term -Quiet)) {
    Write-Host "RUNTIME GUARD FAIL: missing required term: $term" -ForegroundColor Red
    exit 1
  }
}

Write-Host "RUNTIME GUARD PASS: scene boot and texture lock intact" -ForegroundColor Green

