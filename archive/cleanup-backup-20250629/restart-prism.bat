@echo off
title Restart Prism Intelligence
color 0B

echo ========================================
echo    RESTARTING PRISM INTELLIGENCE
echo ========================================
echo.

echo Stopping existing services...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting services...
call start-prism-unified.bat 