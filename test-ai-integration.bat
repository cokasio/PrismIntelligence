@echo off
echo.
echo ========================================
echo 🧪 TESTING AI INTEGRATION
echo ========================================
echo.

REM Check if sample files exist
if not exist "C:\Dev\PrismIntelligence\data\samples\sample-financial-report.csv" (
    echo ❌ Sample files not found!
    echo Please ensure data\samples folder contains test files
    pause
    exit /b 1
)

echo ✅ Sample files found
echo.

REM Clean up incoming folder
echo 🧹 Cleaning incoming folder...
if exist "C:\Dev\PrismIntelligence\incoming\*.csv" del /q "C:\Dev\PrismIntelligence\incoming\*.csv"

echo.
echo 📋 Starting AI service in 5 seconds...
echo 📁 Then copying test file to trigger AI analysis
echo.
echo Press Ctrl+C to cancel...
timeout /t 5 /nobreak > nul

REM Start the AI service
echo.
echo 🚀 Starting Attachment Intelligence Loop...
echo ========================================
start "AI Testing" cmd /k "cd /d C:\Dev\PrismIntelligence && npm run attachment-loop:dev"

REM Wait for service to start
echo.
echo ⏳ Waiting for service to initialize...
timeout /t 8 /nobreak > nul

REM Copy test file
echo.
echo 📎 Copying test file to incoming folder...
copy "C:\Dev\PrismIntelligence\data\samples\sample-financial-report.csv" "C:\Dev\PrismIntelligence\incoming\"

echo.
echo ========================================
echo ✅ TEST INITIATED!
echo ========================================
echo.
echo 👀 Check the "AI Testing" window to see:
echo    - File detection
echo    - Gemini classification
echo    - Claude analysis
echo    - Extracted insights
echo.
echo 📁 Processed files will appear in: processed\
echo.
pause
