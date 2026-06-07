# ============================================================
#  ZIYA — the Fashion Closet  |  Windows Setup Script
#  Run from the project root: .\setup.ps1
# ============================================================

param(
  [switch]$SkipSeed,
  [switch]$SkipInstall,
  [switch]$StartOnly
)

$ErrorActionPreference = "Stop"

function Write-Step { param($msg) Write-Host "`n  >> $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "     OK: $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "     WARN: $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "     FAIL: $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║   Ziya — the Fashion Closet  |  Setup   ║" -ForegroundColor Magenta
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ── 1. Check prerequisites ────────────────────────────────────
Write-Step "Checking prerequisites..."

# Node.js
try {
  $nodeVersion = node --version 2>$null
  if ($nodeVersion -match "v(\d+)") {
    $major = [int]$Matches[1]
    if ($major -lt 18) {
      Write-Fail "Node.js $nodeVersion found, but v18+ is required."
      Write-Host "     Download: https://nodejs.org" -ForegroundColor Gray
      exit 1
    }
    Write-OK "Node.js $nodeVersion"
  }
} catch {
  Write-Fail "Node.js not found. Install from https://nodejs.org"
  exit 1
}

# npm
try {
  $npmVersion = npm --version 2>$null
  Write-OK "npm v$npmVersion"
} catch {
  Write-Fail "npm not found."
  exit 1
}

# MongoDB (optional — skip if using Atlas)
$mongoRunning = $false
try {
  $mongoStatus = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
  if ($mongoStatus -and $mongoStatus.Status -eq "Running") {
    Write-OK "MongoDB service is running"
    $mongoRunning = $true
  } elseif ($mongoStatus) {
    Write-Step "Starting MongoDB service..."
    Start-Service -Name "MongoDB"
    Start-Sleep -Seconds 3
    Write-OK "MongoDB service started"
    $mongoRunning = $true
  } else {
    Write-Warn "MongoDB service not found (OK if using Atlas)"
  }
} catch {
  Write-Warn "Could not check MongoDB service (OK if using Atlas)"
}

# ── 2. Check .env.local ───────────────────────────────────────
Write-Step "Checking environment variables..."

$envPath = Join-Path $PSScriptRoot ".env.local"
if (-not (Test-Path $envPath)) {
  Write-Warn ".env.local not found — creating from template..."
  $template = @"
# ── MongoDB ───────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/ziya-ecommerce

# ── Auth ──────────────────────────────────────────────────────
JWT_SECRET=ziya_super_secret_jwt_key_change_this_in_production_2024
NEXTAUTH_SECRET=ziya_nextauth_secret_change_this_in_production_2024
NEXTAUTH_URL=http://localhost:3000

# ── Cloudinary (Image Storage) ────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Razorpay (Payments) ───────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@
  $template | Out-File -FilePath $envPath -Encoding utf8
  Write-OK ".env.local created from template"
  Write-Warn "Edit .env.local and set your real API keys before seeding payments/images"
} else {
  Write-OK ".env.local exists"
}

# Quick sanity check on MONGODB_URI
$envContent = Get-Content $envPath -Raw
if ($envContent -match "MONGODB_URI=(.+)") {
  $uri = $Matches[1].Trim()
  Write-OK "MONGODB_URI = $uri"
} else {
  Write-Warn "MONGODB_URI not set in .env.local"
}

if ($StartOnly) {
  Write-Step "StartOnly flag set — skipping install and seed."
} else {

  # ── 3. Install dependencies ─────────────────────────────────
  if (-not $SkipInstall) {
    Write-Step "Installing npm dependencies..."
    npm install --prefer-offline 2>&1 | Where-Object { $_ -notmatch "^npm warn" } | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) { Write-Fail "npm install failed"; exit 1 }
    Write-OK "Dependencies installed"
  } else {
    Write-Warn "Skipping npm install (-SkipInstall flag set)"
  }

  # ── 4. Verify logo asset ────────────────────────────────────
  Write-Step "Checking logo asset..."
  $logoPublic = Join-Path $PSScriptRoot "public\ziya-logo.png"
  $logoSrc    = Join-Path $PSScriptRoot "src\Logo\Ziya Logo.png"
  if (-not (Test-Path $logoPublic)) {
    if (Test-Path $logoSrc) {
      Copy-Item $logoSrc $logoPublic
      Write-OK "Logo copied to public/ziya-logo.png"
    } else {
      Write-Warn "Logo not found at src/Logo/Ziya Logo.png — placeholder will show"
    }
  } else {
    Write-OK "public/ziya-logo.png exists"
  }

  # ── 5. Seed the database ────────────────────────────────────
  if (-not $SkipSeed) {
    Write-Step "Seeding database (starting dev server briefly)..."
    Write-Host "     This starts Next.js, seeds data, then continues running." -ForegroundColor Gray

    # Start dev server in background
    $devJob = Start-Job -ScriptBlock {
      Set-Location $using:PSScriptRoot
      npm run dev 2>&1
    }

    # Wait for server to be ready (up to 60s)
    $ready = $false
    $attempts = 0
    Write-Host "     Waiting for server..." -ForegroundColor Gray
    while (-not $ready -and $attempts -lt 30) {
      Start-Sleep -Seconds 2
      $attempts++
      try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) { $ready = $true }
      } catch { }
      Write-Host "     ." -NoNewline -ForegroundColor Gray
    }
    Write-Host ""

    if ($ready) {
      Write-OK "Server is up"
      # Seed
      try {
        $seedBody = '{"secret":"ziya-seed-2024"}'
        $seedResp = Invoke-WebRequest -Uri "http://localhost:3000/api/seed" -Method POST `
          -ContentType "application/json" -Body $seedBody -TimeoutSec 30 -ErrorAction Stop
        $seedJson = $seedResp.Content | ConvertFrom-Json
        Write-OK "Database seeded: $($seedJson.message)"
        Write-Host ""
        Write-Host "     Admin:  admin@ziya.in  /  admin123" -ForegroundColor Yellow
        Write-Host "     User:   priya@example.com  /  user123" -ForegroundColor Yellow
      } catch {
        Write-Warn "Seed request failed: $($_.Exception.Message)"
        Write-Warn "You can seed manually: POST http://localhost:3000/api/seed  body: {`"secret`":`"ziya-seed-2024`"}"
      }
      Stop-Job $devJob -ErrorAction SilentlyContinue
      Remove-Job $devJob -ErrorAction SilentlyContinue
    } else {
      Write-Warn "Server did not start in time. Seed manually after starting:"
      Write-Warn "  POST http://localhost:3000/api/seed  body: {`"secret`":`"ziya-seed-2024`"}"
      Stop-Job $devJob -ErrorAction SilentlyContinue
      Remove-Job $devJob -ErrorAction SilentlyContinue
    }
  } else {
    Write-Warn "Skipping seed (-SkipSeed flag set)"
  }

} # end -not StartOnly

# ── 6. Start dev server ───────────────────────────────────────
Write-Host ""
Write-Host "  ════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   Setup complete! Starting development server" -ForegroundColor Magenta
Write-Host "  ════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "   App:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Admin:  http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "   Health: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

Set-Location $PSScriptRoot
npm run dev
