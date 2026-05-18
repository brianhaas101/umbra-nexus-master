param(
  [Parameter(Mandatory = $true)]
  [string]$CityId,

  [Parameter(Mandatory = $true)]
  [string]$CanonicalName,

  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [Parameter(Mandatory = $false)]
  [string]$WaveId = "wave_001"
)

$ErrorActionPreference = "Stop"

$BaseDir = "ops\geo_provenance\$WaveId\$Slug"

New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null

$Session = @{
  session_id = "geo_${WaveId}_${Slug}_session_001"
  city_id = $CityId
  canonical_name = $CanonicalName
  branch = "geo-wave-001-ingestion"
  wave_id = $WaveId
  mutation_allowed = $false
  session_state = "PRE_DOWNLOAD"
  created_at = (Get-Date).ToUniversalTime().ToString("o")
  operator_mode = "founder_controlled"
  source_family_locked = $false
  download_completed = $false
  raw_artifact_registered = $false
  geometry_extracted = $false
  provenance_generated = $false
  schema_validated = $false
  replay_audited = $false
  registry_mutation_attempted = $false
  rollback_required = $false
}

$Gate = @{
  city_id = $CityId
  canonical_name = $CanonicalName
  wave_id = $WaveId
  mutation_allowed = $false
  gate_status = "PRE_DOWNLOAD_LOCK"
  download_authorized = $false
  canonical_registry_mutation_authorized = $false
  boundary_validation_authorized = $false
  required_conditions_before_download = @(
    "exact_dataset_identified",
    "exact_dataset_url_frozen",
    "license_verified",
    "expected_crs_verified",
    "expected_geometry_format_verified"
  )
  required_conditions_before_registry_mutation = @(
    "raw_artifact_sha256_generated",
    "geometry_sha256_generated",
    "bbox_generated",
    "schema_validation_pass",
    "replay_audit_pass",
    "founder_review_complete"
  )
}

$Discovery = @{
  city_id = $CityId
  canonical_name = $CanonicalName
  wave_id = $WaveId
  mutation_allowed = $false
  discovery_status = "IN_PROGRESS"
  selected_source_family = $null
  candidate_datasets = @()
  selection_complete = $false
  artifact_downloaded = $false
  notes = @(
    "Dataset discovery must complete before any municipal artifact is downloaded"
  )
}

$Session |
  ConvertTo-Json -Depth 8 |
  Out-File -Encoding utf8 "$BaseDir\ingestion_session_001.json"

$Gate |
  ConvertTo-Json -Depth 8 |
  Out-File -Encoding utf8 "$BaseDir\ingestion_gate.json"

$Discovery |
  ConvertTo-Json -Depth 8 |
  Out-File -Encoding utf8 "$BaseDir\dataset_discovery_log.json"

Write-Host ""
Write-Host "Bootstrapped city ingestion workspace:"
Write-Host $BaseDir
Write-Host ""