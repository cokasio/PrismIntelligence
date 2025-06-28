@echo off
REM Quick launcher for AI Orchestra

echo.
echo 🎭 AI Orchestra for PrismIntelligence
echo ====================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM If no arguments, show help
if "%~1"=="" (
    node .ai-orchestra\orchestra.js
    goto :end
)

REM Run the orchestrator with all arguments
node .ai-orchestra\orchestra.js %*

:end
