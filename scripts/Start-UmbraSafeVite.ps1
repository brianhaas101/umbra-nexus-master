$ErrorActionPreference = "Stop"

cd C:\Dev\Nexus_MASTER

pwsh -File .\scripts\Assert-UmbraRuntimeSafe.ps1

Write-Host "Starting Vite after runtime guard pass..." -ForegroundColor Green
npm run dev
