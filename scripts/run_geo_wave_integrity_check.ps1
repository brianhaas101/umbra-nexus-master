$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "UMBRA NEXUS - GEO WAVE INTEGRITY CHECK"
Write-Host ""

powershell -ExecutionPolicy Bypass -File scripts\validate_geo_wave_workspace.ps1

powershell -ExecutionPolicy Bypass -File scripts\validate_geo_provenance_record.ps1 `
  -RecordPath "ops\geo_provenance\wave_001\replay\city_3d50f2fd.provenance.json"

powershell -ExecutionPolicy Bypass -File scripts\generate_geo_replay_audit.ps1

Write-Host ""
Write-Host "GEO WAVE INTEGRITY CHECK COMPLETE"
Write-Host ""