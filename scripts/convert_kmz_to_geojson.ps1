param(
  [Parameter(Mandatory = $true)]
  [string]$InputKmz,

  [Parameter(Mandatory = $true)]
  [string]$OutputGeoJson
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $InputKmz)) {
  throw "KMZ file not found: $InputKmz"
}

$OutputDir = Split-Path $OutputGeoJson -Parent
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$TempDir = Join-Path $env:TEMP ("umbra_kmz_" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

try {
  $ZipPath = Join-Path $TempDir "source.zip"
  Copy-Item -Force $InputKmz $ZipPath

  Expand-Archive -Force -Path $ZipPath -DestinationPath $TempDir

  $Kml = Get-ChildItem $TempDir -Recurse -Filter "*.kml" |
    Select-Object -First 1

  if ($null -eq $Kml) {
    throw "No KML found inside KMZ"
  }

  $KmlXml = [xml](Get-Content $Kml.FullName -Raw)

  $NamespaceManager = New-Object System.Xml.XmlNamespaceManager($KmlXml.NameTable)
  $NamespaceManager.AddNamespace("kml", "http://www.opengis.net/kml/2.2")

  $Placemarks = $KmlXml.SelectNodes("//kml:Placemark", $NamespaceManager)

  if ($Placemarks.Count -lt 1) {
    throw "No placemarks found in KML"
  }

  $Features = @()

  foreach ($Placemark in $Placemarks) {
    $Polygons = $Placemark.SelectNodes(".//kml:Polygon", $NamespaceManager)

    foreach ($Polygon in $Polygons) {
      $Outer = $Polygon.SelectSingleNode(
        ".//kml:outerBoundaryIs/kml:LinearRing/kml:coordinates",
        $NamespaceManager
      )

      if ($null -eq $Outer) {
        continue
      }

      $Ring = New-Object System.Collections.ArrayList

      $Pairs = $Outer.InnerText.Trim() -split "\s+"

      foreach ($Pair in $Pairs) {
        $Parts = $Pair -split ","

        if ($Parts.Count -lt 2) {
          continue
        }

        $Lon = [double]$Parts[0]
        $Lat = [double]$Parts[1]

        [void]$Ring.Add(@($Lon, $Lat))
      }

      if ($Ring.Count -lt 4) {
        continue
      }

      $First = $Ring[0]
      $Last = $Ring[$Ring.Count - 1]

      if (($First[0] -ne $Last[0]) -or ($First[1] -ne $Last[1])) {
        [void]$Ring.Add(@($First[0], $First[1]))
      }

      $Coordinates = New-Object System.Collections.ArrayList
      [void]$Coordinates.Add($Ring.ToArray())

      $Features += [ordered]@{
        type = "Feature"
        properties = [ordered]@{}
        geometry = [ordered]@{
          type = "Polygon"
          coordinates = $Coordinates.ToArray()
        }
      }
    }
  }

  if ($Features.Count -lt 1) {
    throw "No polygon features extracted from KMZ"
  }

  $GeoJson = [ordered]@{
    type = "FeatureCollection"
    features = $Features
  }

  $GeoJson |
    ConvertTo-Json -Depth 100 |
    Out-File -Encoding utf8 $OutputGeoJson

  Write-Host ""
  Write-Host "KMZ conversion complete:"
  Write-Host $OutputGeoJson
  Write-Host ""
  Write-Host "Converted SHA256:"
  (Get-FileHash $OutputGeoJson -Algorithm SHA256).Hash
  Write-Host ""
}
finally {
  if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
  }
}