@echo off
echo "======================================"
echo "Manual Cleanup for Remaining Projects"
echo "======================================"
echo.

echo "First, make sure ALL applications are closed:"
echo "  - Close VS Code completely"
echo "  - Close all Command Prompt/PowerShell windows"
echo "  - Close File Explorer windows"
echo "  - Close any text editors"
echo.
pause

echo.
echo "Attempting to move remaining locked directories..."

echo "Moving emailtoreport to unneeded..."
move "C:\Dev\emailtoreport" "C:\Dev\PrismIntelligence\unneeded\"
if %errorlevel% equ 0 (
    echo "✓ Successfully moved emailtoreport"
) else (
    echo "✗ Failed to move emailtoreport - still locked"
)

echo.
echo "Moving EReport to related-projects..."
move "C:\Dev\EReport" "C:\Dev\PrismIntelligence\related-projects\"
if %errorlevel% equ 0 (
    echo "✓ Successfully moved EReport"
) else (
    echo "✗ Failed to move EReport - still locked"
)

echo.
echo "Moving property-intelligence-platform to unneeded..."
move "C:\Dev\property-intelligence-platform" "C:\Dev\PrismIntelligence\unneeded\"
if %errorlevel% equ 0 (
    echo "✓ Successfully moved property-intelligence-platform"
) else (
    echo "✗ Failed to move property-intelligence-platform - still locked"
)

echo.
echo "======================================"
echo "Cleanup Status Check"
echo "======================================"

echo.
echo "Checking what's left in C:\Dev\..."
dir C:\Dev /AD /B | findstr /V "PrismIntelligence agenticSeek allopen app1 appnj ASC842 Backup clcode create-next-app DataMapping EconomicEqualizer excel excelaiaddin gemini-cli main manus_surf n8n neoj4 Neoj4Databae npx openemail OpenManus openmanus-ai openv0 opm pl Postgerss snippet-vault ss SurfSense testing themeforest vs vscode yconvert a2a a2a2"

echo.
echo "If any property-related directories are still listed above,"
echo "you'll need to restart your computer and try again."
echo.
pause
