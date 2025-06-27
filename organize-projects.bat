@echo off
echo "Organizing PrismIntelligence Project..."
echo.

echo "Step 1: Close any open files/editors in these directories:"
echo "  - C:\Dev\property-intelligence-platform"
echo "  - C:\Dev\emailtoreport" 
echo "  - C:\Dev\PropInsights"
echo.

echo "Step 2: Run this script again to move the directories"
echo.

REM Check if directories are accessible
if exist "C:\Dev\property-intelligence-platform" (
    echo "Moving property-intelligence-platform to archive..."
    move "C:\Dev\property-intelligence-platform" "C:\Dev\PrismIntelligence\archive\"
    if %errorlevel% neq 0 echo "Failed to move property-intelligence-platform - check if files are open"
)

if exist "C:\Dev\emailtoreport" (
    echo "Moving emailtoreport to archive..."
    move "C:\Dev\emailtoreport" "C:\Dev\PrismIntelligence\archive\"
    if %errorlevel% neq 0 echo "Failed to move emailtoreport - check if files are open"
)

if exist "C:\Dev\PropInsights" (
    echo "Moving PropInsights to archive..."
    move "C:\Dev\PropInsights" "C:\Dev\PrismIntelligence\archive\"
    if %errorlevel% neq 0 echo "Failed to move PropInsights - check if files are open"
)

echo.
echo "Organization complete! Check C:\Dev\PrismIntelligence\archive\ for moved projects"
echo "Your main project is now consolidated in C:\Dev\PrismIntelligence\"
pause
