@echo off
echo ====================================
echo Financial Analyzer Multi-Agent System
echo ====================================
echo.
echo Starting the Financial Analyzer on port 5000...
echo.

REM Check if port 5000 is available
netstat -an | find ":5000" > nul
if %errorlevel% equ 0 (
    echo WARNING: Port 5000 appears to be in use.
    echo Attempting to kill any existing processes...
    npx kill-port 5000 2>nul
    timeout /t 2 /nobreak > nul
)

echo Setting up database...
npm run db:push

echo.
echo Starting development server...
echo.
echo Once started, open your browser to:
echo http://localhost:5000
echo.
echo Available routes:
echo - / (Dashboard)
echo - /demo (Interactive Demo)
echo - /analysis (Full Analysis Platform)
echo.

npm run dev