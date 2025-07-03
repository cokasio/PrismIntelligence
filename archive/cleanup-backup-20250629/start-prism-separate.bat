@echo off
title Prism Intelligence Launcher
color 0A

echo ========================================
echo    PRISM INTELLIGENCE PLATFORM
echo    Starting Services in Separate Windows
echo ========================================
echo.

REM Ensure dependencies are installed
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

echo.
echo Starting Backend (Attachment Loop) in new window...
start "Prism Backend - Attachment Loop" cmd /k "cd apps\attachment-loop && npm run dev"

echo Starting Frontend (Dashboard) in new window...  
start "Prism Frontend - Dashboard" cmd /k "cd apps\dashboard && npm run dev"

echo.
echo ========================================
echo Services are starting in separate windows:
echo.
echo Backend:  Attachment Loop Service
echo Frontend: http://localhost:3000
echo.
echo Close this window when done.
echo ========================================
pause 