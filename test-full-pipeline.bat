@echo off
cls
echo.
echo ========================================
echo 🧪 FULL PIPELINE TEST
echo ========================================
echo.

REM Clean folders first
echo 🧹 Cleaning test folders...
if exist "C:\Dev\PrismIntelligence\incoming\*.csv" del /q "C:\Dev\PrismIntelligence\incoming\*.csv"
if exist "C:\Dev\PrismIntelligence\incoming\*.xlsx" del /q "C:\Dev\PrismIntelligence\incoming\*.xlsx"

echo ✅ Folders cleaned
echo.

REM Start the attachment loop
echo 🚀 Starting Attachment Intelligence Loop...
echo ========================================
start "Prism AI Pipeline" cmd /k "cd /d C:\Dev\PrismIntelligence && npm run attachment-loop:dev"

REM Wait for service to start
echo ⏳ Waiting for service to initialize...
timeout /t 8 /nobreak > nul

REM Test 1: Financial Report
echo.
echo 📊 TEST 1: Financial Report
echo ========================================
echo Copying sample-financial-report.csv...
copy "C:\Dev\PrismIntelligence\data\samples\sample-financial-report.csv" "C:\Dev\PrismIntelligence\incoming\"
timeout /t 15 /nobreak > nul

REM Test 2: Rent Roll
echo.
echo 🏢 TEST 2: Rent Roll
echo ========================================
echo Copying sample-rent-roll.csv...
copy "C:\Dev\PrismIntelligence\data\samples\sample-rent-roll.csv" "C:\Dev\PrismIntelligence\incoming\"
timeout /t 15 /nobreak > nul

REM Test 3: Multiple files at once
echo.
echo 📁 TEST 3: Multiple Files
echo ========================================
echo Copying all January reports...
copy "C:\Dev\PrismIntelligence\data\samples\january-*.csv" "C:\Dev\PrismIntelligence\incoming\"

echo.
echo ========================================
echo ✅ ALL TESTS INITIATED
echo ========================================
echo.
echo 👀 Check the "Prism AI Pipeline" window to see:
echo    - File detection for each file
echo    - Document classification 
echo    - Claude AI analysis
echo    - Insights and recommendations
echo.
echo 📁 Processed files should appear in: processed\
echo.
echo 💡 Each file should take 15-30 seconds to process
echo.
pause
