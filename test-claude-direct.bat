@echo off
cls
echo.
echo ========================================
echo 🧠 TESTING CLAUDE AI DIRECTLY
echo ========================================
echo.
echo This will test your Claude API integration...
echo.

cd /d C:\Dev\PrismIntelligence\apps\attachment-loop
node --import=tsx tests/test-claude.ts

echo.
pause
