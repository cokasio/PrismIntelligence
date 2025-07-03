@echo off
REM Cleanup script for old SnapHappy files (Windows)

echo Cleaning up old SnapHappy files...
echo.

REM Remove hooks directory
if exist "src\components\snap-happy\hooks" (
  echo Removing hooks directory...
  rmdir /s /q "src\components\snap-happy\hooks"
)

REM Remove individual files
set "files=SnapGrid.tsx SnapScroll.tsx ScreenCapture.tsx SnapAnimation.tsx SnapDashboard.tsx types.ts INSTALLATION.md"

for %%f in (%files%) do (
  if exist "src\components\snap-happy\%%f" (
    echo Removing %%f...
    del "src\components\snap-happy\%%f"
  )
)

echo.
echo Cleanup complete!
echo.
echo Remaining files (the correct SnapHappy implementation):
echo   - SnapHappy.tsx (main widget)
echo   - SnapHappyButton.tsx (capture button)
echo   - SnapHappyWidget.tsx (easy integration)
echo   - SnapHappyProvider.tsx (context provider)
echo   - index.ts (exports)
echo   - README.md (documentation)
echo   - snap-happy.css (styles)
echo.
echo SnapHappy is ready to use for screen sharing with Claude!
pause