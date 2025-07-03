@echo off
REM Phase 1: Create the new directory structure for Prism Intelligence

echo ============================================
echo     PRISM INTELLIGENCE REORGANIZATION
echo     Phase 1: Creating Directory Structure
echo ============================================
echo.

REM Get timestamp for archiving
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"
echo 📅 Timestamp: %timestamp%
echo.

REM Create core AI engine directories
echo 🧠 Creating Core AI Engine directories...
mkdir core\ai\classifiers 2>nul
mkdir core\ai\analyzers 2>nul
mkdir core\ai\orchestrators 2>nul
mkdir core\processors\parsers 2>nul
mkdir core\processors\extractors 2>nul
mkdir core\processors\validators 2>nul
mkdir core\database\models 2>nul
mkdir core\database\migrations 2>nul
mkdir core\database\services 2>nul
mkdir core\workflows 2>nul
echo    ✅ Core AI structure created

REM Create application directories
echo 📱 Creating Application directories...
mkdir apps\attachment-loop 2>nul
mkdir apps\dashboard 2>nul
mkdir apps\email-processor 2>nul
mkdir apps\api 2>nul
echo    ✅ Application structure created

REM Create shared packages
echo 📦 Creating Package directories...
mkdir packages\utils 2>nul
mkdir packages\ui 2>nul
mkdir packages\types 2>nul
mkdir packages\config 2>nul
echo    ✅ Package structure created

REM Create testing structure
echo 🧪 Creating Testing directories...
mkdir tests\unit 2>nul
mkdir tests\integration 2>nul
mkdir tests\e2e 2>nul
mkdir tests\fixtures 2>nul
echo    ✅ Testing structure created

REM Create documentation structure
echo 📚 Creating Documentation directories...
mkdir docs\api 2>nul
mkdir docs\guides 2>nul
mkdir docs\architecture 2>nul
mkdir docs\examples 2>nul
echo    ✅ Documentation structure created

REM Create deployment infrastructure
echo 🚀 Creating Deployment directories...
mkdir deployment\docker 2>nul
mkdir deployment\kubernetes 2>nul
mkdir deployment\terraform 2>nul
mkdir deployment\scripts 2>nul
echo    ✅ Deployment structure created

REM Create data management
echo 📊 Creating Data directories...
mkdir data\samples 2>nul
mkdir data\templates 2>nul
mkdir data\schemas 2>nul
echo    ✅ Data structure created

REM Create development tools
echo 🔧 Creating Tools directories...
mkdir tools\scripts 2>nul
mkdir tools\generators 2>nul
mkdir tools\validators 2>nul
echo    ✅ Tools structure created

REM Create archive for legacy code
echo 📦 Creating Archive directories...
mkdir archive\legacy-%timestamp% 2>nul
echo    ✅ Archive structure created

echo.
echo ✅ NEW DIRECTORY STRUCTURE CREATED SUCCESSFULLY!
echo.
echo 📂 New Structure Overview:
echo    🧠 core\          - AI Engine ^& Core Logic
echo    📱 apps\          - Applications (Loop, Dashboard, API)
echo    📦 packages\      - Shared Components
echo    🧪 tests\         - All Testing
echo    📚 docs\          - Documentation
echo    🚀 deployment\    - Infrastructure
echo    📊 data\          - Sample Data ^& Schemas
echo    🔧 tools\         - Development Tools
echo    📦 archive\       - Legacy Code Archive
echo.
echo 🚀 Ready for Phase 2: Legacy Code Cleanup
pause
