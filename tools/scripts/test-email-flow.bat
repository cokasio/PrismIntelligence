@echo off
REM Test the multi-tenant email flow on Windows

echo Starting test server...
echo Make sure you have run: npm install express axios
echo.

REM Start the test server in a new window
start "Test Server" cmd /c "npx ts-node test/test-server.ts"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

REM Check if server is running
curl -s http://localhost:3000/health > nul 2>&1
if errorlevel 1 (
    echo Server failed to start
    exit /b 1
)

echo Server is running
echo.
echo Running email flow test...
npx ts-node test/test-email-flow.ts

echo.
echo Test complete!
echo Close the "Test Server" window to stop the server.
pause