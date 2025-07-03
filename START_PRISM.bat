@echo off
REM ============================================================================
REM 🚀 Prism Intelligence - Complete System Startup
REM ============================================================================

title Prism Intelligence - Starting All Services

cls
echo.
echo ================================================================
echo 🏢 PRISM INTELLIGENCE - COMPLETE SYSTEM STARTUP
echo ================================================================
echo Starting all services for AI-powered property management...
echo.

REM ============================================================================
REM Step 1: Start the Backend Services
REM ============================================================================
echo [1/4] Starting Attachment Intelligence Loop...
echo ----------------------------------------------------------------
cd /d "C:\Dev\PrismIntelligence"
start cmd /k "title Attachment Loop && npm run attachment-loop:dev"

timeout /t 3 /nobreak > nul

REM ============================================================================
REM Step 2: Start the API Server
REM ============================================================================
echo [2/4] Starting API Server...
echo ----------------------------------------------------------------
cd /d "C:\Dev\PrismIntelligence\apps\api"
start cmd /k "title API Server && npm start"

timeout /t 3 /nobreak > nul

REM ============================================================================
REM Step 3: Start the Dashboard UI
REM ============================================================================
echo [3/4] Starting Dashboard UI...
echo ----------------------------------------------------------------
cd /d "C:\Dev\PrismIntelligence\apps\dashboard-nextjs"

REM Kill any existing process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    taskkill /F /PID %%a >nul 2>&1
)

start cmd /k "title Prism Dashboard && npm run dev"

timeout /t 5 /nobreak > nul

REM ============================================================================
REM Step 4: Open Browser
REM ============================================================================
echo [4/4] Opening Prism Intelligence in browser...
echo ----------------------------------------------------------------
timeout /t 2 /nobreak > nul
start http://localhost:3001

echo.
echo ================================================================
echo ✅ ALL SERVICES STARTED SUCCESSFULLY!
echo ================================================================
echo.
echo 📍 Services Running:
echo    • Attachment Loop: Processing documents from incoming/ folder
echo    • API Server: http://localhost:3001/api
echo    • Dashboard UI: http://localhost:3001
echo.
echo 📁 Drop files in: C:\Dev\PrismIntelligence\incoming\
echo.
echo 💡 Quick Tips:
echo    • Drag & drop files onto the chat interface
echo    • Supported: PDF, Excel, CSV files
echo    • AI will process and extract insights automatically
echo.
echo ⚠️  To stop all services: Press Ctrl+C in each window
echo ================================================================
echo.

pause
