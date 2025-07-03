@echo off
REM ============================================================================
REM 🚀 Prism Intelligence Platform - Enhanced Startup Script with Port Cleanup
REM ============================================================================
REM This script ensures clean startup by killing any existing processes first
REM ============================================================================

title Prism Intelligence - Enhanced Startup Manager

REM Clear screen and show startup banner
cls
echo.
echo ================================================================
echo 🏢 PRISM INTELLIGENCE PLATFORM - ENHANCED LAUNCHER
echo ================================================================
echo 🚀 Preparing your revolutionary AI property management system...
echo.

REM ============================================================================
REM STEP 1: Kill any existing processes on our ports
REM ============================================================================
echo 🧹 Cleaning up any existing processes...
echo.

REM Check and kill processes on port 3000 (Dashboard)
echo 🔍 Checking port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 🛑 Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any existing Node.js processes that might be hanging
echo 🔍 Cleaning up Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
taskkill /F /IM npx.exe >nul 2>&1

echo ✅ Cleanup complete!
echo.

REM Short delay to ensure ports are released
echo ⏱️  Waiting for ports to be released...
ping 127.0.0.1 -n 3 > nul

REM ============================================================================
REM STEP 2: Verify project structure
REM ============================================================================
echo 🔍 Verifying project structure...

REM Check if we're in the correct directory
if not exist "apps\dashboard" (
    echo ❌ ERROR: Cannot find apps\dashboard directory
    echo 📁 Please run this script from your project root directory
    echo.
    pause
    exit /b 1
)

if not exist "apps\attachment-loop" (
    echo ❌ ERROR: Cannot find apps\attachment-loop directory  
    echo 📁 Please run this script from your project root directory
    echo.
    pause
    exit /b 1
)

echo ✅ Project structure verified!
echo.

REM ============================================================================
REM STEP 3: Launch Backend (AI Processing Engine)
REM ============================================================================
echo 🧠 Starting AI Processing Engine...
start "🧠 Prism AI Engine" cmd /k "cd /d %~dp0apps\attachment-loop && echo 🧠 PRISM INTELLIGENCE - AI PROCESSING ENGINE && echo 📁 Location: %CD% && echo 🤖 AI Models: Gemini + Claude && echo. && npm run dev"

REM Delay before starting frontend
echo ⏱️  Waiting for backend to initialize...
ping 127.0.0.1 -n 4 > nul

REM ============================================================================ 
REM STEP 4: Launch Frontend (Dashboard)
REM ============================================================================
echo 🌐 Starting Web Dashboard...
start "🌐 Prism Dashboard" cmd /k "cd /d %~dp0apps\dashboard && echo 🌐 PRISM INTELLIGENCE - WEB DASHBOARD && echo 📁 Location: %CD% && echo 🌐 URL: http://localhost:3000 && echo. && npm run dev"

REM Delay for dashboard initialization
echo ⏱️  Waiting for dashboard to initialize...
ping 127.0.0.1 -n 5 > nul

REM ============================================================================
REM STEP 5: Show Status and Instructions
REM ============================================================================
cls
echo.
echo ================================================================
echo 🎉 PRISM INTELLIGENCE PLATFORM - STARTUP COMPLETE!
echo ================================================================
echo.
echo ✅ SERVICES NOW RUNNING:
echo.
echo 🧠 AI Processing Engine
echo    🪟 Terminal: "Prism AI Engine"
echo    🔧 Status: Monitoring for files
echo    📊 Features: Gemini + Claude AI processing
echo    💡 Test: Drop CSV files in /incoming folder
echo.
echo 🌐 Web Dashboard  
echo    🪟 Terminal: "Prism Dashboard"
echo    🌐 URL: http://localhost:3000
echo    💰 ROI Tool: http://localhost:3000/pricing
echo.
echo ================================================================
echo 🧪 QUICK TESTS:
echo ================================================================
echo.
echo 1️⃣ WEB DASHBOARD: http://localhost:3000
echo 2️⃣ ROI CALCULATOR: http://localhost:3000/pricing  
echo 3️⃣ AI PROCESSING: Copy CSV to /incoming folder
echo.
echo ================================================================
echo 💡 TROUBLESHOOTING:
echo ================================================================
echo.
echo 🛑 Port Conflicts: This script auto-cleans ports before starting
echo 🔄 Hot Reload: Code changes update automatically
echo 📝 Logs: Check terminal windows for detailed output
echo 🧹 Clean Start: Script kills existing processes first
echo.

REM Auto-open browser
echo 🌐 Opening dashboard in browser...
start http://localhost:3000

echo.
echo ✨ Platform is running! Check the two terminal windows.
echo 🛑 Press any key to close this startup manager...
echo.
pause

echo 👋 Startup manager closing...
echo 💡 Your services continue running in the terminal windows.
exit /b 0
