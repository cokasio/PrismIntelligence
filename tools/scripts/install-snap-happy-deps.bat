@echo off
echo Installing SnapHappy dependencies for frontend...
echo.

cd frontend

echo Installing html2canvas for screenshot functionality...
npm install html2canvas

echo.
echo Installation complete!
echo.
echo To start using SnapHappy:
echo 1. Run: npm run dev
echo 2. Look for the blue camera button in the bottom-right corner
echo 3. Click it to capture and share screenshots with Claude!
echo.
pause