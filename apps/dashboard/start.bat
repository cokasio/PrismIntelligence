@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
color 0A

:: Property Intelligence Platform Frontend Startup Script
:: Version 1.0.0 - December 28, 2024

echo.
echo ████████████████████████████████████████████████████████████████
echo ███                                                          ███
echo ███           🏢 Property Intelligence Platform               ███
echo ███              AI-Powered Email Processing                 ███
echo ███                   FRONTEND DEMO                          ███
echo ███                                                          ███
echo ████████████████████████████████████████████████████████████████
echo.

:: Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found in frontend directory!
    echo    Make sure you're running this from the frontend folder
    echo    Current directory: %CD%
    echo.
    pause
    exit /b 1
)

:: Check if Next.js is installed
findstr /C:"next" package.json > nul
if errorlevel 1 (
    echo ❌ Error: This doesn't appear to be a Next.js project
    echo    Make sure you're in the frontend directory
    echo.
    pause
    exit /b 1
)

echo 🔍 Checking dependencies...

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies are installed
)

:: Check if .env.local exists in frontend
if not exist ".env.local" (
    echo.
    echo 📝 Creating .env.local file for frontend...
    (
        echo # Property Intelligence Platform - Frontend Environment Variables
        echo # Generated on %date% at %time%
        echo.
        echo # CloudMailin Configuration
        echo CLOUDMAILIN_ADDRESS=38fab3b51608018af887@cloudmailin.net
        echo.
        echo # Email Processing Mode
        echo DEMO_MODE=true
        echo.
        echo # Development Settings
        echo NODE_ENV=development
    ) > .env.local
    echo ✅ Created .env.local for frontend
) else (
    echo ✅ Environment file exists
)

echo.
echo 🚀 Starting Property Intelligence Platform Frontend...
echo.

:: Kill any existing processes on port 3000
echo 🛑 Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo    Stopping process on port 3000...
    taskkill /f /pid %%a > nul 2>&1
)

echo.
echo 📊 SYSTEM INFORMATION
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📧 CloudMailin Email Address:
echo    ➤ 38fab3b51608018af887@cloudmailin.net
echo.
echo 📨 Customer Email Format:
echo    ➤ 38fab3b51608018af887+[company-slug]@cloudmailin.net
echo.
echo 🌐 Frontend URL:
echo    ➤ http://localhost:3000
echo.
echo 🔄 API Endpoints:
echo    ➤ http://localhost:3000/api/cloudmailin/webhook
echo    ➤ http://localhost:3000/api/emails/send-test
echo    ➤ http://localhost:3000/api/emails/toggle-mode
echo.
echo 🎭 Default Mode: DEMO (safe testing)
echo.

:: Start the Next.js development server
echo ═══════════════════════════════════════════════════════════════
echo 🚀 Starting Next.js Frontend Server...
echo ═══════════════════════════════════════════════════════════════
echo.

:: Start in a new window so user can see the output
start "Property Intelligence Platform - Frontend" /MIN cmd /c "npm run dev & pause"

:: Wait for the server to start
timeout /t 3 /nobreak > nul

echo ⏳ Waiting for frontend server to start...
timeout /t 3 /nobreak > nul

:: Try to detect when server is ready
:CHECK_SERVER
echo 🔍 Checking if frontend server is ready...
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak > nul
    goto CHECK_SERVER
)

echo.
echo ✅ FRONTEND SERVER IS READY!
echo.

echo ████████████████████████████████████████████████████████████████
echo ███                                                          ███
echo ███                     🎉 SUCCESS! 🎉                       ███
echo ███                                                          ███
echo ████████████████████████████████████████████████████████████████
echo.
echo 🌐 ACCESS YOUR PROPERTY INTELLIGENCE PLATFORM:
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📱 Main Application (Frontend):
echo    ➤ http://localhost:3000
echo.
echo 📧 Email Processing Features:
echo    ➤ Left Panel: Email list and demo testing
echo    ➤ Right Panel: Click email to view analysis
echo    ➤ Demo/Live Mode toggle available
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🧪 QUICK TESTING GUIDE:
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1️⃣  Open http://localhost:3000 in your browser
echo 2️⃣  Look for the "Email Processing" section on the left
echo 3️⃣  Click "🧪 Test Demo Processing" button
echo 4️⃣  See the processed email appear in the list
echo 5️⃣  Click on the email to view detailed AI analysis
echo 6️⃣  See financial metrics, insights, and actions
echo 7️⃣  Toggle between Demo/Live modes
echo.
echo ═══════════════════════════════════════════════════════════════
echo 📧 CLOUDMAILIN INTEGRATION:
echo ═══════════════════════════════════════════════════════════════
echo.
echo Your CloudMailin Address: 38fab3b51608018af887@cloudmailin.net
echo.
echo For Local Testing:
echo ➤ Webhook URL: http://localhost:3000/api/cloudmailin/webhook
echo.
echo For Production:
echo ➤ Webhook URL: https://your-domain.com/api/cloudmailin/webhook
echo.
echo Customer Email Examples:
echo ➤ 38fab3b51608018af887+sunset-plaza@cloudmailin.net
echo ➤ 38fab3b51608018af887+downtown-towers@cloudmailin.net
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🎯 WHAT YOU'LL SEE:
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ Email processing interface on the left
echo ✅ Demo/Live mode toggle
echo ✅ CloudMailin address display
echo ✅ Test processing button
echo ✅ Detailed email analysis viewer
echo ✅ Financial metrics with color-coded cards
echo ✅ AI-generated insights and action items
echo ✅ Priority badges and processing status
echo.
echo ═══════════════════════════════════════════════════════════════
echo 💡 API TESTING COMMANDS:
echo ═══════════════════════════════════════════════════════════════
echo.
echo Test Demo Processing:
echo ➤ curl -X POST http://localhost:3000/api/cloudmailin/webhook -H "Content-Type: application/json" -d "{}"
echo.
echo Send Test Email:
echo ➤ curl -X POST http://localhost:3000/api/emails/send-test -H "Content-Type: application/json" -d "{\"customerSlug\":\"test-property\"}"
echo.
echo Check Current Mode:
echo ➤ curl http://localhost:3000/api/emails/mode
echo.

:: Try to open the browser automatically
echo 🌐 Opening browser to your Property Intelligence Platform...
timeout /t 2 /nobreak > nul
start http://localhost:3000

echo.
echo ████████████████████████████████████████████████████████████████
echo.
echo 🎉 Property Intelligence Platform Frontend is now running!
echo.
echo 📱 Application: http://localhost:3000
echo 📧 CloudMailin: 38fab3b51608018af887@cloudmailin.net
echo 🎭 Mode: Demo (safe for testing)
echo 🎨 UI: Complete email processing interface
echo.
echo 💡 Press Ctrl+C in the server window to stop
echo 📖 The UI is integrated and ready to use!
echo.
echo Press any key to minimize this window and start using the platform...
pause > nul

:: Minimize this window so user can focus on the app
powershell -command "Add-Type -TypeDefinition 'using System; using System.Diagnostics; using System.Runtime.InteropServices; public class Win { [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow); }'; $p = Get-Process -Id $PID; [Win]::ShowWindow($p.MainWindowHandle, 6)" > nul 2>&1

echo.
echo 🏢 Property Intelligence Platform Frontend is running!
echo 📱 Visit: http://localhost:3000
echo 📧 CloudMailin: 38fab3b51608018af887@cloudmailin.net
echo 🎨 Full UI integrated and working!
echo.
echo Press any key to exit this script (server will keep running)...
pause > nul