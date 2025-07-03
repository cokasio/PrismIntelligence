@echo off
REM create-migration.bat - Helper to create new migration files on Windows

REM Get description from command line
set DESCRIPTION=%1

if "%DESCRIPTION%"=="" (
    echo Usage: create-migration.bat ^<description^>
    echo Example: create-migration.bat add_property_tags
    exit /b 1
)

REM Get current timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,14%

REM Create migration filename
set FILENAME=%TIMESTAMP%_%DESCRIPTION%.sql
set FILEPATH=supabase\migrations\%FILENAME%

REM Create migration file with template
(
echo -- Migration: %DESCRIPTION%
echo -- Generated: %date%
echo -- Description: TODO: Add description here
echo.
echo -- Add your migration SQL here
echo -- Example:
echo -- ALTER TABLE properties ADD COLUMN tags TEXT[] DEFAULT '{}';
echo.
echo -- Remember to test this migration before applying to production!
) > "%FILEPATH%"

echo Created migration: %FILEPATH%
echo.
echo Next steps:
echo 1. Edit the migration file with your SQL
echo 2. Test on a development database
echo 3. Apply via Supabase Dashboard SQL Editor
echo 4. Record migration: INSERT INTO schema_migrations (version) VALUES ('%FILENAME%');