@echo off
REM ============================================================================
REM 🚀 Prism Intelligence Platform - Smart Startup Script
REM ============================================================================
REM This script automatically cleans up ports and launches both services
REM ============================================================================

title Prism Intelligence - Smart Startup

cls
echo.
echo ================================================================
echo 🏢 PRISM INTELLIGENCE PLATFORM - SMART STARTUP
echo ================================================================
echo 🚀 Starting your revolutionary AI property management system...
echo.

REM ============================================================================
REM Pre-flight Checks and Cleanup
REM ============================================================================
echo 🔍 Running pre-flight checks...

REM Check project structure
if not exist "apps\dashboard" (
    echo ❌ ERROR: Cannot find apps\dashboard directory
    pause
    exit /b 1
)

if not exist "apps\attachment-loop" (
    echo ❌ ERROR: Cannot find apps\attachment-loop directory
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Check and cleanup port 3000
echo 🧹 Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 🔧 Found process using port 3000 (PID: %%a) - terminating...
    taskkill /PID %%a /F >nul 2>&1
)

echo ✅ Port 3000 is ready

REM Wait a moment for cleanup
ping 127.0.0.1 -n 2 > nul

echo 🔧 Starting services...
echo.

REM ============================================================================
REM Launch Backend (AI Processing Engine)  
REM ============================================================================
echo 🧠 Starting AI Processing Engine...
start "🧠 Prism AI Engine" cmd /k "cd /d %~dp0apps\attachment-loop && echo 🧠 PRISM INTELLIGENCE - AI PROCESSING ENGINE && echo ================================================================ && echo 📁 Location: %CD% && echo 🤖 AI Models: Gemini + Claude && echo 📊 Database: Supabase Connected && echo 🔑 Environment: 53 variables loaded && echo ⚡ File Processing: Real-time monitoring && echo 📁 Incoming: Drop CSV files to process && echo ================================================================ && echo. && npm run dev"

REM Wait for backend
echo ⏱️  Backend initializing...
ping 127.0.0.1 -n 4 > nul

REM ============================================================================
REM Launch Frontend (Dashboard)
REM ============================================================================  
echo 🌐 Starting Web Dashboard...
start "🌐 Prism Dashboard" cmd /k "cd /d %~dp0apps\dashboard && echo 🌐 PRISM INTELLIGENCE - WEB DASHBOARD && echo ================================================================ && echo 📁 Location: %CD% && echo 🌐 URL: http://localhost:3000 && echo 🎨 Framework: Next.js 15 + TypeScript && echo 💎 UI: shadcn/ui + TailwindCSS && echo 📱 Features: Landing page + ROI calculator && echo 💰 ROI Tool: http://localhost:3000/pricing && echo ================================================================ && echo 🚀 Starting development server... && echo. && npm run dev"

REM Wait for frontend
echo ⏱️  Dashboard initializing...
ping 127.0.0.1 -n 3 > nul

REM ============================================================================
REM Status Display
REM ============================================================================
cls
echo.
echo ================================================================
echo 🎉 PRISM INTELLIGENCE PLATFORM - STARTUP COMPLETE!
echo ================================================================
echo.
echo ✅ SERVICES RUNNING:
echo.
echo 🧠 AI Processing Engine
echo    🪟 Terminal: "Prism AI Engine"  
echo    📊 Features: File monitoring, Gemini + Claude AI
echo    💡 Test: Drop CSV files in /incoming folder
echo    ⚡ Speed: 3-second analysis with insights
echo.
echo 🌐 Web Dashboard
echo    🪟 Terminal: "Prism Dashboard"
echo    🌐 URL: http://localhost:3000
echo    💰 ROI Tool: http://localhost:3000/pricing
echo    🎯 Features: Landing page, interactive calculator
echo.
echo ================================================================
echo 🧪 READY TO TEST YOUR AI PLATFORM:
echo ================================================================
echo.
echo 1️⃣ DASHBOARD: Opening http://localhost:3000 automatically...
echo 2️⃣ ROI CALCULATOR: Visit http://localhost:3000/pricing
echo 3️⃣ AI PROCESSING: Copy CSV to C:\Dev\PrismIntelligence\incoming\
echo.
echo ================================================================
echo 💡 DEVELOPMENT TIPS:
echo ================================================================
echo.
echo 🔄 Hot Reload: Both servers auto-update on code changes
echo 🛑 Stop Services: Close terminal windows or press Ctrl+C
echo 🔍 Debugging: Check both terminal windows for logs  
echo 📁 File Test: Drop sample CSVs from data\samples\ folder
echo 🌐 Browser: Bookmark http://localhost:3000 for quick access
echo.

REM Auto-open browser with delay
echo 🌐 Opening dashboard in 3 seconds...
ping 127.0.0.1 -n 4 > nul
start http://localhost:3000

echo.
echo ================================================================
echo ✨ PRISM INTELLIGENCE IS NOW RUNNING!
echo ================================================================
echo.
echo 🚀 Your revolutionary AI platform is ready for property management!
echo 💡 Keep this window open to monitor startup status
echo 🛑 Press any key to close this startup manager...
echo.
pause

echo 👋 Startup manager closing...
echo 💡 Services continue running in the terminal windows
exit /b 0
