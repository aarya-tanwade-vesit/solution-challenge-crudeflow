@echo off
REM ========================================================================
REM CrudeFlow Frontend - One-Click Startup Script for Windows
REM ========================================================================
REM This script handles:
REM   1. Node.js & pnpm installation check
REM   2. Dependencies installation
REM   3. Environment setup (.env.local)
REM   4. Dev server startup
REM   5. Browser auto-open
REM ========================================================================

setlocal enabledelayedexpansion
cls

echo.
echo ========================================================================
echo   CRUDEFLOW - Neural Engine for Maritime Operations
echo   One-Click Startup Script
echo ========================================================================
echo.

REM Color codes for output
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

REM ========================================================================
REM 1. Check Node.js Installation
REM ========================================================================
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo Make sure to:
    echo   - Choose the LTS version
    echo   - Check "Add to PATH" during installation
    echo   - Restart your terminal after installation
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK: Node.js !NODE_VERSION! found

REM ========================================================================
REM 2. Check pnpm Installation
REM ========================================================================
echo [2/5] Checking pnpm installation...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: pnpm not found. Installing globally...
    call npm install -g pnpm
    if errorlevel 1 (
        echo ERROR: Failed to install pnpm
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo OK: pnpm !PNPM_VERSION! found

REM ========================================================================
REM 3. Install Dependencies
REM ========================================================================
echo [3/5] Installing dependencies...
if not exist "node_modules" (
    echo Installing dependencies from package.json...
    call pnpm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed. Updating...
    call pnpm install
)
echo OK: Dependencies ready

REM ========================================================================
REM 4. Setup Environment Variables
REM ========================================================================
echo [4/5] Setting up environment variables...
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo OK: .env.local created from template
        echo.
        echo NOTE: Please update .env.local with your backend API URLs:
        echo   - NEXT_PUBLIC_API_URL=http://localhost:8000/api
        echo   - NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
        echo.
    ) else (
        echo Creating default .env.local...
        (
            echo NEXT_PUBLIC_API_URL=http://localhost:8000/api
            echo NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
        ) > .env.local
        echo OK: Default .env.local created
    )
) else (
    echo OK: .env.local already exists
)

REM ========================================================================
REM 5. Start Development Server
REM ========================================================================
echo [5/5] Starting development server...
echo.
echo ========================================================================
echo   Development server starting...
echo   Open browser at: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================================================
echo.

REM Give user a moment to read the message
timeout /t 2 /nobreak

REM Start the dev server
call pnpm dev

REM If user closes the dev server
echo.
echo ========================================================================
echo   Development server stopped
echo ========================================================================
pause
exit /b 0
