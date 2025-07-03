@echo off
REM ============================================================================
REM 🚀 Prism Intelligence - Prismatic UI Launch
REM ============================================================================

title Prism Intelligence - Prismatic UI

cls
echo.
echo ================================================================
echo 🎨 PRISM INTELLIGENCE - PRISMATIC CLARITY UI
echo ================================================================
echo 🚀 Launching your new Cognitive Inbox interface...
echo.

REM Navigate to dashboard directory
cd /d "C:\Dev\PrismIntelligence\apps\dashboard-nextjs"

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Kill any process using port 3001
echo 🔧 Cleaning up port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✨ Starting Prismatic Clarity Dashboard...
echo.
echo ================================================================
echo 📍 Dashboard URL: http://localhost:3001
echo ================================================================
echo.
echo 🎯 Features Ready:
echo    ✅ Cognitive Inbox with auto-classification
echo    ✅ Voice-first input interface
echo    ✅ Real-time agent activity monitoring
echo    ✅ Prismatic color system (Gold/Blue/Green/Red)
echo    ✅ Success animations and celebrations
echo.
echo 💡 Quick Tips:
echo    • Click inbox items to see AI analysis
echo    • Try the "Create Tasks" button for animations
echo    • Watch agents pulse when active
echo    • Use voice commands like "Show delinquent rent"
echo.
echo ================================================================
echo.

REM Start the development server
npm run dev

pause
