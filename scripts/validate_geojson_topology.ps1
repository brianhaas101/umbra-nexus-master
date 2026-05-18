param(
    [Parameter(Mandatory = $true)]
    [string]$GeoJsonPath
)

if (!(Test-Path $GeoJsonPath)) {
    throw "GeoJSON file not found: $GeoJsonPath"
}

$GeoJson = Get-Content $GeoJsonPath -Raw | ConvertFrom-Json

if ($GeoJson.type -ne "FeatureCollection") {
    throw "Root object must be FeatureCollection"
}

if ($GeoJson.features.Count -lt 1) {
    throw "FeatureCollection contains no features"
}

$GeometryTypes = @()

foreach ($Feature in $GeoJson.features) {

    if ($null -eq $Feature.geometry) {
        throw "Feature missing geometry"
    }

    $Geometry = $Feature.geometry

    if ($null -eq $Geometry.type) {
        throw "Geometry missing type"
    }

    $GeometryTypes += $Geometry.type

    if (
        $Geometry.type -ne "Polygon" -and
        $Geometry.type -ne "MultiPolygon"
    ) {
        throw "Unsupported geometry type: $($Geometry.type)"
    }

    if ($null -eq $Geometry.coordinates) {
        throw "Geometry missing coordinates"
    }

    $CoordinateStrings = $Geometry.coordinates | ConvertTo-Json -Depth 100

    if ([string]::IsNullOrWhiteSpace($CoordinateStrings)) {
        throw "Geometry coordinates empty"
    }

    if ($CoordinateStrings.Contains("Infinity")) {
        throw "Invalid coordinate value detected"
    }

    if ($CoordinateStrings.Contains("NaN")) {
        throw "Invalid coordinate value detected"
    }
}

$Result = [ordered]@{
    validation_status = "PASS"
    validated_file = $GeoJsonPath
    feature_count = $GeoJson.features.Count
    geometry_types = $GeometryTypes | Sort-Object -Unique
    topology_contract = "UMBRA_TOPOLOGY_VALIDATION_V1"
}

$Result | ConvertTo-Json -Depth 8