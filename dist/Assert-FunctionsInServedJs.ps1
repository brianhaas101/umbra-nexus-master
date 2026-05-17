<#
  Assert-FunctionsInServedJs.ps1
  Downloads served JS endpoints and asserts required function signatures exist.
  Usage:
    .\server\tools\ps\Assert-FunctionsInServedJs.ps1 -BaseUrl http://127.0.0.1:3000
#>

param(
  [string]$BaseUrl = "http://127.0.0.1:3000"
)

$ErrorActionPreference = "Stop"

function FetchText([string]$url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 6
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    return $r.Content
  } catch {
    throw "[Assert-FunctionsInServedJs] Failed to fetch: $url => $($_.Exception.Message)"
  }
}

$checks = @(
  @{
    Name="globe/core.js"
    Url=($BaseUrl.TrimEnd("/") + "/globe/core.js")
    MustContain=@("ensureWorldGroup", "ensureWorldWeld", "getPickMeshes", "initCore")
  },
  @{
    Name="globe/nodes.js"
    Url=($BaseUrl.TrimEnd("/") + "/globe/nodes.js")
    MustContain=@("buildCityEntityHierarchy", "showClusters", "showCityEntities", "createNodes", "latLonToDir")
  },
  @{
    Name="scene.js"
    Url=($BaseUrl.TrimEnd("/") + "/scene.js")
    MustContain=@("function boot", "G.loadTextures", "requestAnimationFrame(animate)")
  },
  @{
    Name="globe/interaction.js"
    Url=($BaseUrl.TrimEnd("/") + "/globe/interaction.js")
    MustContain=@("initInteraction", "Raycaster", "hitTest", "pointerdown", "pointermove")
  }
)

$fails = @()

foreach ($c in $checks) {
  Write-Host "[Assert-FunctionsInServedJs] Fetching $($c.Name)..."
  $txt = FetchText $c.Url

  foreach ($needle in $c.MustContain) {
    if ($txt -notmatch [regex]::Escape($needle)) {
      $fails += ("{0} missing '{1}'" -f $c.Name, $needle)
    }
  }
}

if ($fails.Count -eq 0) {
  Write-Host "[Assert-FunctionsInServedJs] PASS"
  exit 0
}

Write-Host "[Assert-FunctionsInServedJs] FAIL"
$fails | ForEach-Object { Write-Host ("- {0}" -f $_) }
exit 1
