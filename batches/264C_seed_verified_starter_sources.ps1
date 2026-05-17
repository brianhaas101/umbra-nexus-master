$ErrorActionPreference = "Stop"

$OutDir = ".\data\clients\black_dragon\reviewed_intake"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$Rows = @(
  [pscustomobject]@{
    city="New Orleans"; source_name="Calls for Service 2025 - Data.NOLA.gov"; source_type="public_safety_calls_for_service";
    source_url="https://data.nola.gov/Public-Safety-and-Preparedness/Calls-for-Service-2025/4xwx-sfte";
    city_locality_check="pass"; manual_review_status="pending"; provenance_status="verified"; eligible_for_import="false";
    notes="Official Data.NOLA source; NOPD calls for service dataset."
  },
  [pscustomobject]@{
    city="Nashville"; source_name="Metro Nashville Police Department Active Dispatch"; source_type="public_safety_active_dispatch";
    source_url="https://data.nashville.gov/datasets/metro-nashville-police-department-active-dispatch";
    city_locality_check="pass"; manual_review_status="pending"; provenance_status="verified"; eligible_for_import="false";
    notes="Official Nashville open data source."
  },
  [pscustomobject]@{
    city="New York City"; source_name="NYPD Complaint Data Historic"; source_type="public_safety_complaints";
    source_url="https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Historic/qgea-i56i";
    city_locality_check="pass"; manual_review_status="pending"; provenance_status="verified"; eligible_for_import="false";
    notes="Official NYC Open Data source."
  },
  [pscustomobject]@{
    city="Seattle"; source_name="Call Data"; source_type="public_safety_calls_for_service";
    source_url="https://data.seattle.gov/Public-Safety/Call-Data/33kz-ixgy";
    city_locality_check="pass"; manual_review_status="pending"; provenance_status="verified"; eligible_for_import="false";
    notes="Official City of Seattle Open Data source; police response activity."
  },
  [pscustomobject]@{
    city="San Antonio"; source_name="SAPD Calls for Service"; source_type="public_safety_calls_for_service";
    source_url="https://data.sanantonio.gov/dataset/sapd-calls-for-service/resource/9cb17985-ac16-49a6-ad69-6fe5ad8f2bf5";
    city_locality_check="pass"; manual_review_status="pending"; provenance_status="verified"; eligible_for_import="false";
    notes="Official Open Data SA source; SAPD calls for service."
  }
)

$Path = Join-Path $OutDir "batch_264C_verified_starter_sources.csv"
$Rows | Export-Csv -NoTypeInformation -Encoding UTF8 $Path

Write-Host "Created starter source CSV:"
Write-Host $Path
