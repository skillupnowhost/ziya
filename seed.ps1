# Quick seed script — run AFTER the dev server is already running
# Usage: .\seed.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n  Seeding Ziya database..." -ForegroundColor Cyan

try {
  $resp = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/seed" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"secret":"ziya-seed-2024"}' `
    -TimeoutSec 30

  $data = $resp.Content | ConvertFrom-Json
  Write-Host "  OK: $($data.message)" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Admin login:  admin@ziya.in   /  admin123" -ForegroundColor Yellow
  Write-Host "  User login:   priya@example.com  /  user123" -ForegroundColor Yellow
  Write-Host ""
} catch {
  Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  Make sure the dev server is running: npm run dev" -ForegroundColor Gray
}
