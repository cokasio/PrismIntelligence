@echo off
echo ===========================================================
echo      🚀 Launching Prism Intelligence UI
echo ===========================================================
echo.

cd /d "C:\Dev\PrismIntelligence\apps\dashboard"

echo 📦 Installing dependencies (if needed)...
call npm install

echo.
echo 🎨 Starting the development server...
echo.
echo Once started, your UI will be available at:
echo.
echo    🌐 http://localhost:3000
echo.
echo Features you'll see:
echo    ✨ Beautiful landing page with animations
echo    📧 Email processing dashboard
echo    📊 Property analytics
echo    🤖 AI-powered insights
echo.
echo Press Ctrl+C to stop the server when done.
echo ===========================================================
echo.

call npm run dev