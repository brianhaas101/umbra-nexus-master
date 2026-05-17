$ErrorActionPreference = "Stop"

$Base = "http://localhost:5173"

$Paths = @(
  "/assets/earthatnight2012.png",
  "/assets/earth_day_16k.jpg",
  "/assets/starfield_8k.png",
  "/data/clients/black_dragon/graph/indexes/graph_index.v1.json",
  "/data/clients/black_dragon/graph/indexes/propagation_chain_index.v1.json",
  "/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json",
  "/data/clients/black_dragon/national/map/runtime/national_map_nodes.v1.json"
)

$Results = foreach ($Path in $Paths) {
  try {
    $r = Invoke-WebRequest "$Base$Path" -UseBasicParsing
    [pscustomobject]@{
      Path = $Path
      Status = $r.StatusCode
      ContentType = $r.Headers["Content-Type"]
      StartsWithHtml = $r.Content.TrimStart().StartsWith("<")
      Bytes = $r.RawContentLength
    }
  } catch {
    [pscustomobject]@{
      Path = $Path
      Status = "FAIL"
      ContentType = ""
      StartsWithHtml = ""
      Bytes = 0
    }
  }
}

$Results | Format-Table -AutoSize
$Results | Export-Csv ".\logs\black_dragon\runtime_asset_route_audit.csv" -NoTypeInformation
