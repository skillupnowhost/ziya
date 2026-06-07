# ─────────────────────────────────────────────────────────────
#  Ziya E-Commerce — MongoDB Setup Script
#  Run as Administrator:  Right-click PowerShell → Run as Admin
#  Then run:              .\install-mongodb.ps1
# ─────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  Ziya E-Commerce — MongoDB Setup" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ── 1. Check if already installed ─────────────────────────────
$mongodPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
$alreadyInstalled = Test-Path $mongodPath

if (-not $alreadyInstalled) {
  Write-Host "  [1/4] Downloading MongoDB 7.0 Community..." -ForegroundColor Yellow

  $installerUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi"
  $installerPath = "$env:TEMP\mongodb-installer.msi"

  try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "  [2/4] Installing MongoDB (this takes ~1 min)..." -ForegroundColor Yellow
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /qn ADDLOCAL=`"ServerService,Client,MonitoringTool`" SHOULD_INSTALL_COMPASS=0" -Wait
    Write-Host "  MongoDB installed successfully." -ForegroundColor Green
  } catch {
    Write-Host ""
    Write-Host "  Auto-install failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Please install MongoDB manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "  2. Download MongoDB 7.0 for Windows (MSI)" -ForegroundColor White
    Write-Host "  3. Run the installer (choose 'Complete' setup)" -ForegroundColor White
    Write-Host "  4. Re-run this script after installation" -ForegroundColor White
    Write-Host ""
    exit 1
  }
} else {
  Write-Host "  MongoDB is already installed." -ForegroundColor Green
}

# ── 2. Ensure data directory exists ───────────────────────────
$dataDir = "C:\data\db"
if (-not (Test-Path $dataDir)) {
  Write-Host "  [3/4] Creating data directory C:\data\db..." -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

# ── 3. Start MongoDB service ───────────────────────────────────
Write-Host "  [3/4] Starting MongoDB service..." -ForegroundColor Yellow
try {
  $svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
  if ($svc) {
    if ($svc.Status -ne 'Running') {
      Start-Service MongoDB
      Start-Sleep -Seconds 3
    }
    Write-Host "  MongoDB service is running." -ForegroundColor Green
  } else {
    # Try starting mongod directly if service not registered
    $mongodPath64 = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
    if (Test-Path $mongodPath64) {
      $portInUse = netstat -an 2>$null | Select-String "27017" | Select-String "LISTENING"
      if (-not $portInUse) {
        Write-Host "  Starting mongod process..." -ForegroundColor Yellow
        Start-Process -FilePath $mongodPath64 -ArgumentList "--dbpath `"$dataDir`"" -WindowStyle Hidden
        Start-Sleep -Seconds 4
        Write-Host "  mongod started." -ForegroundColor Green
      } else {
        Write-Host "  MongoDB is already running on port 27017." -ForegroundColor Green
      }
    }
  }
} catch {
  Write-Host "  Could not start MongoDB: $($_.Exception.Message)" -ForegroundColor Red
}

# ── 4. Seed the database ───────────────────────────────────────
Write-Host "  [4/4] Seeding database (make sure dev server is running)..." -ForegroundColor Yellow
Write-Host "  Waiting 3 seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds 3

try {
  $resp = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/seed" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"secret":"ziya-seed-2024"}' `
    -TimeoutSec 30

  $data = $resp.Content | ConvertFrom-Json
  Write-Host ""
  Write-Host "  ✓ $($data.message)" -ForegroundColor Green
  Write-Host ""
  Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
  Write-Host "  Admin login:  admin@ziya.in  /  admin123" -ForegroundColor Cyan
  Write-Host "  User login:   priya@example.com  /  user123" -ForegroundColor Cyan
  Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
  Write-Host ""
} catch {
  Write-Host ""
  Write-Host "  Seed failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  Make sure 'npm run dev' is running in another terminal, then run .\seed.ps1" -ForegroundColor Gray
  Write-Host ""
}
