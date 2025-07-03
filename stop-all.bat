@echo off
REM ============================================================================
REM 🛑 Prism Intelligence Platform - Stop All Services
REM ============================================================================
REM This script cleanly stops all running Prism Intelligence services
REM ============================================================================

title Prism Intelligence - Stop All Services

cls
echo.
echo ================================================================
echo 🛑 STOPPING PRISM INTELLIGENCE PLATFORM
echo ================================================================
echo.

echo 🧹 Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo ✅ Node.js processes stopped
) else (
    echo 💡 No Node.js processes were running
)

echo.
echo 🧹 Stopping npm processes...
taskkill /F /IM npm.exe 2>nul
taskkill /F /IM npx.exe 2>nul

echo.
echo 🧹 Cleaning up port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 🛑 Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ================================================================
echo ✅ ALL SERVICES STOPPED
echo ================================================================
echo.
echo 💡 You can now:
echo    - Run start.bat for a fresh start
echo    - Run start-enhanced.bat for auto-cleanup start
echo    - Make code changes without conflicts
echo.
echo Press any key to exit...
pause >nul
