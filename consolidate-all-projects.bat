@echo off
echo "==================================================="
echo "PrismIntelligence Project Consolidation Script"
echo "==================================================="
echo.

echo "This script consolidates all Property Intelligence related projects"
echo "into your main PrismIntelligence directory and cleans up C:\Dev\"
echo.

echo "IMPORTANT: Close all editors, terminals, and files before running!"
echo.
pause

REM Create additional organization folders
echo "Creating organization structure..."
if not exist "C:\Dev\PrismIntelligence\unneeded" mkdir "C:\Dev\PrismIntelligence\unneeded"
if not exist "C:\Dev\PrismIntelligence\related-projects" mkdir "C:\Dev\PrismIntelligence\related-projects"
if not exist "C:\Dev\PrismIntelligence\utilities" mkdir "C:\Dev\PrismIntelligence\utilities"

echo.
echo "Moving Property Intelligence Projects..."

REM Move older versions to unneeded
echo "Moving older versions to unneeded folder..."
if exist "C:\Dev\emailtoreport" (
    move "C:\Dev\emailtoreport" "C:\Dev\PrismIntelligence\unneeded\"
    echo "✓ Moved emailtoreport"
)

if exist "C:\Dev\property-intelligence-platform" (
    move "C:\Dev\property-intelligence-platform" "C:\Dev\PrismIntelligence\unneeded\"
    echo "✓ Moved property-intelligence-platform"
)

if exist "C:\Dev\PropInsights" (
    move "C:\Dev\PropInsights" "C:\Dev\PrismIntelligence\unneeded\"
    echo "✓ Moved PropInsights"
)

if exist "C:\Dev\LiveReports1" (
    move "C:\Dev\LiveReports1" "C:\Dev\PrismIntelligence\unneeded\"
    echo "✓ Moved LiveReports1"
)

echo.
echo "Moving related financial/reporting projects..."

REM Move related projects that might be useful
if exist "C:\Dev\EReport" (
    move "C:\Dev\EReport" "C:\Dev\PrismIntelligence\related-projects\"
    echo "✓ Moved EReport (Financial Analyzer)"
)

if exist "C:\Dev\ERPEAMIL" (
    move "C:\Dev\ERPEAMIL" "C:\Dev\PrismIntelligence\related-projects\"
    echo "✓ Moved ERPEAMIL (ERP Email Platform)"
)

echo.
echo "Moving utility files..."

REM Move utility files and configs
if exist "C:\Dev\.env.template.txt" (
    move "C:\Dev\.env.template.txt" "C:\Dev\PrismIntelligence\utilities\"
    echo "✓ Moved .env.template.txt"
)

if exist "C:\Dev\.envwithAPIKeys.txt" (
    move "C:\Dev\.envwithAPIKeys.txt" "C:\Dev\PrismIntelligence\utilities\"
    echo "✓ Moved .envwithAPIKeys.txt"
)

if exist "C:\Dev\yardi_ai_research_system.zip" (
    move "C:\Dev\yardi_ai_research_system.zip" "C:\Dev\PrismIntelligence\utilities\"
    echo "✓ Moved yardi_ai_research_system.zip"
)

if exist "C:\Dev\CDevDefPath To YML MD FILES Scripts.txt" (
    move "C:\Dev\CDevDefPath To YML MD FILES Scripts.txt" "C:\Dev\PrismIntelligence\utilities\"
    echo "✓ Moved development scripts"
)

echo.
echo "==================================================="
echo "ORGANIZATION COMPLETE!"
echo "==================================================="
echo.
echo "Your PrismIntelligence directory now contains:"
echo "  📊 Main Platform (production-ready)"
echo "  🎯 customer-acquisition/ (4,149+ leads)"
echo "  🗂️  related-projects/ (EReport, ERPEAMIL)"
echo "  🗃️  unneeded/ (older versions)"
echo "  🛠️  utilities/ (config files, backups)"
echo "  📁 archive/ (moved projects)"
echo.
echo "Your C:\Dev\ directory is now clean with only unrelated projects!"
echo.
echo "Next Steps:"
echo "1. Review related-projects/ for useful components"
echo "2. Set up your production environment"
echo "3. Launch your customer acquisition campaign!"
echo.
pause
