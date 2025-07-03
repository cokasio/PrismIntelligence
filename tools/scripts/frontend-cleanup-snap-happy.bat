@echo off
REM Cleanup old SnapHappy files in frontend

echo Cleaning up old SnapHappy files in frontend...
echo.

cd frontend\src\components\snap-happy

REM Remove hooks directory
if exist "hooks" (
  echo Removing hooks directory...
  rmdir /s /q "hooks"
)

REM Remove old implementation files
set "files=SnapGrid.tsx SnapScroll.tsx ScreenCapture.tsx SnapAnimation.tsx SnapDashboard.tsx types.ts INSTALLATION.md"

for %%f in (%files%) do (
  if exist "%%f" (
    echo Removing %%f...
    del "%%f"
  )
)

echo.
echo Cleanup complete! SnapHappy is now integrated into your frontend.
echo.
echo The camera button should now appear in the bottom-right corner of your app.
echo.
echo To test:
echo 1. Start your frontend: cd frontend ^&^& npm run dev
echo 2. Look for the blue camera button
echo 3. Click it to capture and share screens with Claude!
echo.
pause