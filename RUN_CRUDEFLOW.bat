@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ==================================================
rem NEMO CrudeFlow - Flexible One-Click Launcher
rem ==================================================
rem Optional overrides before launching:
rem   set FRONTEND_PORT=3001
rem   set BACKEND_PORT=8001
rem   set CLEAN_PORTS=0
rem   set AUTO_INSTALL_FRONTEND=0
rem   set KEEP_WINDOWS_OPEN=1
rem   set BACKEND_ORIGIN=http://127.0.0.1:8000

cd /d "%~dp0"
title NEMO CrudeFlow Launcher

if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=3000
if "%BACKEND_PORT%"=="" set BACKEND_PORT=8000
if "%CLEAN_PORTS%"=="" set CLEAN_PORTS=1
if "%AUTO_INSTALL_FRONTEND%"=="" set AUTO_INSTALL_FRONTEND=1
if "%KEEP_WINDOWS_OPEN%"=="" set KEEP_WINDOWS_OPEN=1
if "%BACKEND_ORIGIN%"=="" set BACKEND_ORIGIN=http://127.0.0.1:%BACKEND_PORT%

if "%KEEP_WINDOWS_OPEN%"=="1" (
  set CHILD_CMD_SWITCH=/k
) else (
  set CHILD_CMD_SWITCH=/c
)

echo.
echo ==================================================
echo NEMO CRUDEFLOW - STARTUP
echo ==================================================
echo Root            : %CD%
echo Frontend port   : %FRONTEND_PORT%
echo Backend port    : %BACKEND_PORT%
echo Backend origin  : %BACKEND_ORIGIN%
echo Clean ports     : %CLEAN_PORTS%
echo Auto npm install: %AUTO_INSTALL_FRONTEND%
echo ==================================================
echo.

echo [1/5] Verifying project structure...
if not exist "backend" (
  echo [ERROR] Missing folder: backend
  pause
  exit /b 1
)
if not exist "frontend" (
  echo [ERROR] Missing folder: frontend
  pause
  exit /b 1
)
echo [OK] Structure looks good.
echo.

echo [2/5] Checking required tools...
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found in PATH. Install Node.js LTS.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo [ERROR] Missing backend virtualenv at backend\.venv
  echo Run:
  echo   cd backend
  echo   python -m venv .venv
  echo   .venv\Scripts\pip install -r requirements.txt
  pause
  exit /b 1
)
echo [OK] Tooling available.
echo.

echo [3/5] Checking frontend dependencies...
if not exist "frontend\node_modules" (
  if "%AUTO_INSTALL_FRONTEND%"=="1" (
    echo [INFO] node_modules missing; running npm install...
    pushd frontend
    call npm install
    if errorlevel 1 (
      popd
      echo [ERROR] npm install failed.
      pause
      exit /b 1
    )
    popd
  ) else (
    echo [WARN] node_modules missing and AUTO_INSTALL_FRONTEND=0
  )
)
echo [OK] Frontend dependency check complete.
echo.

echo [4/5] Cleaning stale listeners (optional)...
if "%CLEAN_PORTS%"=="1" (
  for %%L in (%FRONTEND_PORT% %BACKEND_PORT%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%%L .*LISTENING"') do (
      if not "%%P"=="" (
        echo [INFO] Port %%L occupied by PID %%P - stopping...
        taskkill /PID %%P /F >nul 2>&1
      )
    )
  )
  timeout /t 1 /nobreak >nul
) else (
  echo [INFO] CLEAN_PORTS=0, skipping port cleanup.
)
echo [OK] Cleanup stage complete.
echo.

echo [5/5] Launching services...
echo [INFO] Starting backend window...
start "NEMO-Backend" /D "backend" cmd %CHILD_CMD_SWITCH% "set PYTHONPATH=.&& set PORT=%BACKEND_PORT%&& .venv\Scripts\python.exe scripts\dev_server.py"

echo [INFO] Starting frontend window...
start "NEMO-Frontend" /D "frontend" cmd %CHILD_CMD_SWITCH% "set PORT=%FRONTEND_PORT%&& set CRUDEFLOW_BACKEND_ORIGIN=%BACKEND_ORIGIN%&& npm run dev"

echo.
echo ==================================================
echo NEMO CrudeFlow launch initiated.
echo Dashboard : http://localhost:%FRONTEND_PORT%/dashboard
echo API Docs  : http://127.0.0.1:%BACKEND_PORT%/docs
echo ==================================================
echo.
echo Tip: set CLEAN_PORTS=0 if you do not want auto taskkill.
echo.
pause
