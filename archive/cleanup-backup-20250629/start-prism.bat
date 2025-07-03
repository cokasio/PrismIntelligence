@echo off
echo ========================================
echo Starting Prism Intelligence Platform
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if frontend dependencies are installed
if not exist "apps\dashboard\node_modules" (
    echo Installing frontend dependencies...
    cd apps\dashboard
    call npm install
    cd ..\..
)

REM Check if backend dependencies are installed
if not exist "apps\attachment-loop\node_modules" (
    echo Installing backend dependencies...
    cd apps\attachment-loop
    call npm install
    cd ..\..
)

echo.
echo Starting services...
echo.

REM Option 1: Using the existing dev script with concurrently (recommended)
echo Starting backend and frontend with concurrently...
call npm run dev

REM If you prefer separate windows, comment out the line above and uncomment the lines below:
REM REM Option 2: Start in separate command windows
REM echo Starting Backend in new window...
REM start "Prism Backend" cmd /k "cd apps\attachment-loop && npm run dev"
REM 
REM echo Starting Frontend in new window...
REM start "Prism Frontend" cmd /k "cd apps\dashboard && npm run dev"
REM 
REM echo.
REM echo ========================================
REM echo Both services are starting in separate windows
REM echo Backend: http://localhost:3000 (or your backend port)
REM echo Frontend: http://localhost:3001 (or your frontend port)
REM echo ========================================
REM pause
