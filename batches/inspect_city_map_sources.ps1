$ErrorActionPreference = "Stop"

$CandidateFiles = @(
  ".\public\data\cities.json",
  ".\public\data\city_map.json",
  ".\public\data\clients\black_dragon\cities.json",
  ".\public\data\clients\black_dragon\city_map.json",
  ".\data\cities.json",
  ".\data\city_map.json",
  ".\config\cities.json",
  ".\manifest.json"
) | Where-Object { Test-Path $_ }

if ($CandidateFiles.Count -eq 0) {
  throw "No candidate map files found."
}

foreach ($File in $CandidateFiles) {

  Write-Host ""
  Write-Host "==============================="
  Write-Host "FILE:" $File
  Write-Host "==============================="

  try {
    $Raw = Get-Content $File -Raw
    $Json = $Raw | ConvertFrom-Json

    Write-Host "TYPE:" $Json.GetType().FullName

    if ($Json -is [System.Collections.IEnumerable]) {
      $First = $Json | Select-Object -First 3
      $First | ConvertTo-Json -Depth 10
    }
    else {
      $Json | ConvertTo-Json -Depth 5
    }

  } catch {
    Write-Host "FAILED JSON PARSE"
    Write-Host $_
  }
}
