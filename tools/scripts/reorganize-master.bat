@echo off
REM Master Reorganization Script for Prism Intelligence

echo ================================================
echo     PRISM INTELLIGENCE COMPLETE REORGANIZATION
echo     Revolutionary AI Platform Structure Upgrade
echo ================================================
echo.

echo 🎯 TRANSFORMATION OVERVIEW:
echo    From: Organic growth with scattered files
echo    To:   Enterprise-grade, scalable architecture
echo.
echo 🧠 DUAL AI ARCHITECTURE:
echo    • Gemini AI for document classification
echo    • Claude AI for business intelligence  
echo    • Sophisticated multi-agent orchestration
echo.
echo 📊 REORGANIZATION BENEFITS:
echo    ✅ Professional team collaboration structure
echo    ✅ Modular components for rapid development
echo    ✅ Enterprise-ready deployment architecture
echo    ✅ Investor-presentation quality organization
echo    ✅ Scalable foundation for market growth
echo.

set /p confirm="🚀 Ready to transform your revolutionary AI platform? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Operation cancelled.
    exit /b 0
)

echo.
echo 🔄 REORGANIZATION PHASES:
echo    Phase 1: Create New Directory Structure
echo    Phase 2: Archive Legacy Code ^& Cleanup  
echo    Phase 3: Migrate Core AI System
echo    Phase 4: Organize Documentation ^& Data
echo    Phase 5: Final Cleanup ^& Validation
echo.

REM Create backup before starting
echo 📦 Creating backup before reorganization...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

mkdir "backup-before-reorganization-%timestamp%" 2>nul
xcopy "*.md" "backup-before-reorganization-%timestamp%\" /Y >nul 2>&1
xcopy "*.json" "backup-before-reorganization-%timestamp%\" /Y >nul 2>&1
xcopy "*.ts" "backup-before-reorganization-%timestamp%\" /Y >nul 2>&1
echo    ✅ Backup created: backup-before-reorganization-%timestamp%
echo.

REM Phase 1: Create Structure
echo ================================
echo PHASE 1: CREATING STRUCTURE
echo ================================
call reorganize-phase1-structure.bat
if errorlevel 1 (
    echo ❌ Phase 1 failed! Stopping reorganization.
    pause
    exit /b 1
)

echo.
echo ================================  
echo PHASE 2: LEGACY CLEANUP
echo ================================
call reorganize-phase2-cleanup.bat
if errorlevel 1 (
    echo ❌ Phase 2 failed! Stopping reorganization.
    pause
    exit /b 1
)

echo.
echo ================================
echo PHASE 3: CORE MIGRATION  
echo ================================
call reorganize-phase3-core.bat
if errorlevel 1 (
    echo ❌ Phase 3 failed! Stopping reorganization.
    pause
    exit /b 1
)

echo.
echo ================================
echo PHASE 4: DOCS ^& DATA
echo ================================
call reorganize-phase4-docs.bat
if errorlevel 1 (
    echo ❌ Phase 4 failed! Stopping reorganization.
    pause
    exit /b 1
)

echo.
echo ================================
echo PHASE 5: FINAL VALIDATION
echo ================================
call reorganize-phase5-final.bat
if errorlevel 1 (
    echo ❌ Phase 5 failed! Manual review required.
    pause
    exit /b 1
)

echo.
echo ================================================
echo     🎉 REORGANIZATION COMPLETED SUCCESSFULLY!
echo ================================================
echo.

echo 📊 TRANSFORMATION SUMMARY:
echo.
echo 🧠 CORE AI ENGINE:
echo    core\ai\classifiers\     - Gemini document classification
echo    core\ai\analyzers\       - Claude business intelligence  
echo    core\ai\orchestrators\   - Multi-agent coordination
echo    core\processors\         - Document processing pipeline
echo    core\database\           - Data models ^& migrations
echo    core\workflows\          - Queue management ^& workflows
echo.
echo 📱 APPLICATIONS:
echo    apps\attachment-loop\    - File watching AI system
echo    apps\dashboard\          - Web-based management interface
echo    apps\api\                - REST API endpoints
echo    apps\email-processor\    - Email handling system
echo.
echo 📦 SHARED PACKAGES:
echo    packages\utils\          - Common utilities
echo    packages\ui\             - User interface components
echo    packages\types\          - TypeScript definitions
echo    packages\config\         - Configuration management
echo.
echo 🧪 TESTING ^& QUALITY:
echo    tests\unit\              - Unit tests
echo    tests\integration\       - Integration tests  
echo    tests\e2e\               - End-to-end tests
echo    tests\fixtures\          - Test data
echo.
echo 📚 DOCUMENTATION:
echo    docs\architecture\       - Technical documentation
echo    docs\guides\             - User guides
echo    docs\api\                - API documentation
echo    docs\examples\           - Code examples
echo.
echo 🚀 DEPLOYMENT:
echo    deployment\docker\       - Container configurations
echo    deployment\scripts\      - Deployment automation
echo    deployment\terraform\    - Infrastructure as code
echo.
echo 📊 DATA MANAGEMENT:
echo    data\samples\            - Sample documents
echo    data\templates\          - Document templates
echo    data\schemas\            - Data schemas
echo.
echo 🔧 DEVELOPMENT TOOLS:
echo    tools\scripts\           - Build ^& development scripts
echo    tools\generators\        - Code generators
echo    tools\validators\        - Code validation tools
echo.

echo 🎯 IMMEDIATE NEXT STEPS:
echo    1. 🔄 Update import paths in TypeScript files
echo    2. 📦 Update package.json dependencies 
echo    3. 🧪 Test each application independently
echo    4. 📚 Update documentation with new structure
echo    5. 🚀 Commit organized structure to Git
echo    6. 👥 Share new structure with team members
echo    7. 💼 Update investor presentation materials
echo.

echo 💡 DEVELOPMENT BENEFITS:
echo    ✅ Team members can work on different apps simultaneously
echo    ✅ Clear separation of concerns improves code quality
echo    ✅ Modular architecture enables rapid feature development
echo    ✅ Professional structure impresses investors ^& partners
echo    ✅ Scalable foundation supports explosive growth
echo    ✅ Enterprise-ready for large customer deployments
echo.

echo 🏆 CONGRATULATIONS!
echo Your revolutionary Prism Intelligence platform now has
echo world-class organization that matches its cutting-edge AI capabilities.
echo.
echo Ready to transform the property management industry! 🌟
echo.
pause
