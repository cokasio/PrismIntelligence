@echo off
title Prism Intelligence - Unified
color 0E

echo ========================================
echo    PRISM INTELLIGENCE PLATFORM
echo    Unified Backend + Frontend
echo ========================================
echo.

REM Quick dependency check
if not exist "node_modules" call npm install

echo Starting both services with concurrently...
echo.
echo Backend:  Attachment Loop Service
echo Frontend: Dashboard (http://localhost:3000)
echo.
echo Press Ctrl+C to stop both services
echo ========================================
echo.

npm run dev 