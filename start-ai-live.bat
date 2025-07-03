@echo off
cls
echo.
echo ========================================
echo 🤖 PRISM AI - LIVE PROCESSING
echo ========================================
echo.
echo Starting AI service with your Anthropic API key...
echo.

cd /d C:\Dev\PrismIntelligence
npm run attachment-loop:dev

pause
