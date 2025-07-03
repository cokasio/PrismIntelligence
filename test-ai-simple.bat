@echo off
cls
echo.
echo ========================================
echo 🔄 RESTART AND TEST AI PIPELINE
echo ========================================
echo.

REM Kill any existing Node processes
echo 🛑 Stopping any existing services...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

REM Clean incoming folder
echo 🧹 Cleaning incoming folder...
del /q "C:\Dev\PrismIntelligence\incoming\*.csv" >nul 2>&1

echo.
echo 🚀 Starting fresh AI service...
cd /d C:\Dev\PrismIntelligence
start "Prism AI" cmd /c "npm run attachment-loop:dev & pause"

echo.
echo ⏳ Waiting for service to start (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo 📎 Copying test file...
copy "C:\Dev\PrismIntelligence\data\samples\sample-financial-report.csv" "C:\Dev\PrismIntelligence\incoming\"

echo.
echo ✅ Test file copied!
echo.
echo 👀 Check the "Prism AI" window to see processing
echo.
pause
