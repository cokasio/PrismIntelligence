@echo off
echo ===========================================================
echo      Claude + Gemini CLI Orchestration Demo
echo ===========================================================
echo.
echo This demo shows how Claude can orchestrate Gemini CLI
echo based on your natural language requests.
echo.
echo Examples of what you can say:
echo - "Analyze the financial report for Sunset Plaza"
echo - "Compare all our properties and rank them"
echo - "Find maintenance issues that need attention"
echo - "Extract key information from lease documents"
echo - "Tell me which property is performing best"
echo.
echo ===========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to project root
cd /d "%~dp0\..\..\"

REM Load environment variables
if exist .env (
    echo Loading environment variables...
    for /f "delims=" %%x in (.env) do (
        echo %%x | findstr /c:"=" >nul && set "%%x"
    )
) else (
    echo WARNING: .env file not found
    echo Please run quick-start.bat first
    pause
    exit /b 1
)

REM Run the orchestration demo
echo Starting interactive demo...
echo.
npx ts-node tools/gemini-setup/orchestration-demo.ts

echo.
echo ===========================================================
echo Demo completed. Thank you!
echo ===========================================================
pause