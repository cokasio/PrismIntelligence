@echo off
title Stop Prism Intelligence Services
color 0C

echo ========================================
echo    STOPPING PRISM INTELLIGENCE
echo ========================================
echo.

echo Stopping all Node.js processes...
echo.

REM Kill all node processes (this will stop both frontend and backend)
taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully stopped all Prism services
) else (
    echo ⚠️  No Prism services were running
)

echo.
echo ========================================
echo All services have been stopped
echo ========================================
pause 