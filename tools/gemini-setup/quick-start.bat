@echo off
echo ===========================================================
echo Prism Intelligence - Gemini CLI Quick Start
echo ===========================================================
echo.

echo [1/4] Installing Google Cloud SDK and Gemini CLI...
PowerShell -ExecutionPolicy Bypass -File ".\install-gemini-cli.ps1"
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Running integration tests...
call npx ts-node test-gemini-integration.ts
if errorlevel 1 (
    echo WARNING: Some tests failed. Check the output above.
)

echo.
echo [3/4] Creating example property analysis...
echo Creating sample analysis request...
(
echo {
echo   "property": "Sunset Plaza Apartments",
echo   "request": "Analyze occupancy trends and suggest improvements",
echo   "data": {
echo     "occupancy_rate": 0.925,
echo     "avg_rent": 2500,
echo     "maintenance_backlog": 12
echo   }
echo }
) > sample-property-request.json

echo.
echo [4/4] Quick Reference Commands:
echo.
echo Test Gemini CLI:
echo   gcloud --version
echo   gcloud auth list
echo.
echo Property Analysis Example:
echo   gemini analyze --file="report.csv" --prompt="Extract key metrics"
echo.
echo Batch Processing:
echo   gemini batch --input-dir="./reports/" --template="analysis.json"
echo.
echo ===========================================================
echo Setup Complete! Check GEMINI_CLI_GUIDE.md for full documentation
echo ===========================================================
echo.
echo IMPORTANT: Don't forget to:
echo 1. Update .env with your Google Cloud project ID
echo 2. Add your Gemini API key to .env
echo 3. Enable Vertex AI API in Google Cloud Console
echo.
pause