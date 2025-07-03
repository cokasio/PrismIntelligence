@echo off
echo 🧹 Cleaning up Prism Intelligence root directory...
echo.

:: Create backup directory first
if not exist "archive\cleanup-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%" (
    mkdir "archive\cleanup-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%"
    echo ✅ Created backup directory
)

:: Set backup directory
set BACKUP_DIR=archive\cleanup-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%

echo.
echo 📦 Moving unnecessary files to backup...

:: Remove old batch scripts (keep only essential ones)
if exist "*.bat" (
    for %%f in (*.bat) do (
        if not "%%f"=="start.bat" (
            if not "%%f"=="cleanup-root.bat" (
                move "%%f" "%BACKUP_DIR%\" >nul 2>&1
                echo   Moved %%f
            )
        )
    )
)

:: Remove old shell scripts
if exist "*.sh" (
    move *.sh "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved shell scripts
)

:: Remove demo and test files
if exist "demo-*.js" (
    move demo-*.js "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved demo files
)

if exist "test-*.js" (
    move test-*.js "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved test files
)

if exist "sample-*.csv" (
    move sample-*.csv "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved sample CSV files
)

:: Remove backup directories
if exist "backupcode" (
    move "backupcode" "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved backupcode directory
)

if exist "unneeded" (
    move "unneeded" "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved unneeded directory
)

if exist "related-projects" (
    move "related-projects" "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved related-projects directory
)

if exist "test-generation" (
    move "test-generation" "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved test-generation directory
)

if exist "venv" (
    move "venv" "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved Python venv directory
)

:: Remove temporary files
if exist "*.tmp" (
    del /q *.tmp >nul 2>&1
    echo   Deleted temporary files
)

if exist "*.log" (
    move *.log "%BACKUP_DIR%\" >nul 2>&1
    echo   Moved log files
)

:: Remove old migration files from root
if exist "*.sql" (
    if not exist "database" mkdir "database"
    move *.sql "database\" >nul 2>&1
    echo   Moved SQL files to database directory
)

echo.
echo ✨ Root directory cleanup complete!
pause