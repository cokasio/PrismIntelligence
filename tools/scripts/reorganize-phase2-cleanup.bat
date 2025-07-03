@echo off
REM Phase 2: Archive legacy code and cleanup

echo ============================================
echo     PRISM INTELLIGENCE REORGANIZATION
echo     Phase 2: Legacy Code Cleanup
echo ============================================
echo.

REM Get timestamp for archiving
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%-%HH%%Min%%Sec%"
set "ARCHIVE_DIR=archive\legacy-%timestamp%"

echo 📦 Archive Directory: %ARCHIVE_DIR%
echo.

REM Create archive subdirectories
echo 🗂️ Creating archive subdirectories...
mkdir "%ARCHIVE_DIR%\directories" 2>nul
mkdir "%ARCHIVE_DIR%\scripts" 2>nul
mkdir "%ARCHIVE_DIR%\docs" 2>nul
mkdir "%ARCHIVE_DIR%\config" 2>nul
echo    ✅ Archive subdirectories created

REM Archive legacy directories
echo 📁 Archiving legacy directories...
if exist "backupcode" (
    move "backupcode" "%ARCHIVE_DIR%\directories\backupcode"
    echo    ✅ Archived backupcode\
)
if exist "unneeded" (
    move "unneeded" "%ARCHIVE_DIR%\directories\unneeded"
    echo    ✅ Archived unneeded\
)
if exist "related-projects" (
    move "related-projects" "%ARCHIVE_DIR%\directories\related-projects"
    echo    ✅ Archived related-projects\
)
if exist "test-generation" (
    move "test-generation" "%ARCHIVE_DIR%\directories\test-generation"
    echo    ✅ Archived test-generation\
)
if exist "venv" (
    move "venv" "%ARCHIVE_DIR%\directories\venv"
    echo    ✅ Archived venv\
)

REM Archive script files to tools
echo 📜 Moving scripts to tools\scripts\...
if not exist "tools\scripts" mkdir "tools\scripts"
move *.bat "tools\scripts\" 2>nul
move *.sh "tools\scripts\" 2>nul
echo    ✅ Scripts moved to tools\scripts\

REM Archive temporary test files
echo 🧪 Archiving temporary test files...
if exist "demo-attachment-loop.js" (
    move "demo-attachment-loop.js" "%ARCHIVE_DIR%\scripts\"
    echo    ✅ Archived demo-attachment-loop.js
)
if exist "test-attachment-loop.js" (
    move "test-attachment-loop.js" "%ARCHIVE_DIR%\scripts\"
    echo    ✅ Archived test-attachment-loop.js
)
if exist "test-connection.js" (
    move "test-connection.js" "%ARCHIVE_DIR%\scripts\"
    echo    ✅ Archived test-connection.js
)
if exist "test-existing-db.js" (
    move "test-existing-db.js" "%ARCHIVE_DIR%\scripts\"
    echo    ✅ Archived test-existing-db.js
)

REM Archive temporary documentation
echo 📄 Archiving temporary documentation...
for %%f in (ADD_TO_PACKAGE_JSON.txt IMMEDIATE_ACTION_PLAN.md LANDING_PAGE_*.md METRONIC_*.md SNAP_HAPPY_*.md QUICK_REFERENCE.md) do (
    if exist "%%f" (
        move "%%f" "%ARCHIVE_DIR%\docs\"
        echo    ✅ Archived %%f
    )
)

REM Archive individual migration files
echo 🔄 Archiving individual migration files...
for %%f in (migrate-*.ts setup-database.ts test-supabase-connection.ts) do (
    if exist "%%f" (
        move "%%f" "%ARCHIVE_DIR%\scripts\"
        echo    ✅ Archived %%f
    )
)

REM Archive config files
echo ⚙️ Archiving scattered config files...
if exist "supabase-config-example.txt" (
    move "supabase-config-example.txt" "%ARCHIVE_DIR%\config\"
    echo    ✅ Archived supabase-config-example.txt
)

REM Clean up empty directories
echo 🧹 Cleaning up empty directories...
for /d %%d in (test openmanus .ai-orchestra .qodo customer-acquisition) do (
    if exist "%%d" (
        rd "%%d" /s /q 2>nul
        echo    ✅ Removed empty directory: %%d
    )
)

echo.
echo ✅ LEGACY CLEANUP COMPLETED SUCCESSFULLY!
echo.
echo 📊 Cleanup Summary:
echo    📦 Legacy code archived to: %ARCHIVE_DIR%
echo    🔧 Scripts moved to: tools\scripts\
echo    🧹 Empty directories removed
echo    📁 Project structure cleaned
echo.
echo 🚀 Ready for Phase 3: Core System Migration
pause
