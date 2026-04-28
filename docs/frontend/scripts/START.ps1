# ============================================================================
# CrudeFlow Frontend - One-Click Startup Script (PowerShell)
# ============================================================================
# This script handles:
#   1. Node.js & pnpm installation check
#   2. Dependencies installation
#   3. Environment setup (.env.local)
#   4. Dev server startup
#   5. Browser auto-open (with fallback)
# ============================================================================

# Set error handling
$ErrorActionPreference = "Stop"

# Clear screen
Clear-Host

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  CRUDEFLOW - Neural Engine for Maritime Operations" -ForegroundColor Cyan
Write-Host "  One-Click Startup Script (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. Check Node.js Installation
# ============================================================================
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "OK: Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Make sure to:"
    Write-Host "  - Choose the LTS version"
    Write-Host "  - Check 'Add to PATH' during installation"
    Write-Host "  - Restart PowerShell after installation"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ============================================================================
# 2. Check pnpm Installation
# ============================================================================
Write-Host "[2/5] Checking pnpm installation..." -ForegroundColor Yellow

try {
    $pnpmVersion = pnpm --version
    Write-Host "OK: pnpm $pnpmVersion found" -ForegroundColor Green
} catch {
    Write-Host "WARNING: pnpm not found. Installing globally..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
    Write-Host "OK: pnpm $pnpmVersion installed" -ForegroundColor Green
}

# ============================================================================
# 3. Install Dependencies
# ============================================================================
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies from package.json..." -ForegroundColor White
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "Dependencies already installed. Updating..." -ForegroundColor White
    pnpm install
}

Write-Host "OK: Dependencies ready" -ForegroundColor Green

# ============================================================================
# 4. Setup Environment Variables
# ============================================================================
Write-Host "[4/5] Setting up environment variables..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor White
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "OK: .env.local created from .env.example" -ForegroundColor Green
    } else {
        # Create default env file
        $envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
"@
        Set-Content -Path ".env.local" -Value $envContent
        Write-Host "OK: Default .env.local created" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "NOTE: Please update .env.local with your backend API URLs:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_API_URL=http://localhost:8000/api" -ForegroundColor White
    Write-Host "  - NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "OK: .env.local already exists" -ForegroundColor Green
}

# ============================================================================
# 5. Start Development Server
# ============================================================================
Write-Host "[5/5] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Development server starting..." -ForegroundColor Cyan
Write-Host "  Open browser at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Try to open browser automatically
Start-Sleep -Seconds 3
$url = "http://localhost:3000"
try {
    Start-Process $url
    Write-Host "Browser opened at $url" -ForegroundColor Green
} catch {
    Write-Host "Note: Could not auto-open browser. Open $url manually in your browser." -ForegroundColor Yellow
}

# Start the dev server
Write-Host ""
pnpm dev

# If user closes the dev server
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Development server stopped" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
