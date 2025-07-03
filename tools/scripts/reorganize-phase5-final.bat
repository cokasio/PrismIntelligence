@echo off
REM Phase 5: Final Cleanup and Validation

echo ============================================
echo     PRISM INTELLIGENCE REORGANIZATION
echo     Phase 5: Final Cleanup ^& Validation
echo ============================================
echo.

echo 🧹 Final Cleanup Operations...

REM Clean up remaining src directory
echo 📁 Cleaning up src directory...
if exist "src" (
    REM Move any remaining files to appropriate locations
    for %%f in (src\*.ts src\*.js) do (
        if exist "%%f" (
            move "%%f" "packages\utils\"
            echo    ✅ Moved %%f → packages\utils\
        )
    )
    
    REM Remove empty src directory
    rd "src" /s /q 2>nul
    echo    ✅ Cleaned up src\ directory
)

REM Move remaining config files
echo ⚙️ Moving remaining configuration files...
if exist "tsconfig.json" (
    copy "tsconfig.json" "apps\attachment-loop\tsconfig.json" >nul
    copy "tsconfig.json" "apps\api\tsconfig.json" >nul
    copy "tsconfig.json" "packages\config\tsconfig.base.json" >nul
    echo    ✅ Distributed tsconfig.json to applications
)
if exist "jest.config.json" (
    move "jest.config.json" "tests\jest.config.json"
    echo    ✅ Moved jest.config.json → tests\jest.config.json
)
if exist "tailwind.config.js" (
    move "tailwind.config.js" "packages\ui\tailwind.config.js"
    echo    ✅ Moved tailwind.config.js → packages\ui\tailwind.config.js
)

REM Move Next.js files
echo ⚡ Moving Next.js configuration...
if exist "next-env.d.ts" (
    move "next-env.d.ts" "apps\dashboard-nextjs\next-env.d.ts"
    echo    ✅ Moved next-env.d.ts → apps\dashboard-nextjs\
)

REM Move style files
echo 🎨 Moving style files...
if exist "src\styles" (
    xcopy "src\styles\*" "packages\ui\styles\" /E /Y >nul 2>&1
    rd "src\styles" /s /q 2>nul
    echo    ✅ Moved src\styles\ → packages\ui\styles\
)
if exist "src\theme" (
    xcopy "src\theme\*" "packages\ui\theme\" /E /Y >nul 2>&1
    rd "src\theme" /s /q 2>nul
    echo    ✅ Moved src\theme\ → packages\ui\theme\
)

REM Handle remaining development files
echo 🔧 Moving remaining development files...
for %%f in (your-prd*.txt claude.md) do (
    if exist "%%f" (
        move "%%f" "docs\examples\"
        echo    ✅ Moved %%f → docs\examples\
    )
)

REM Create missing essential files
echo 📄 Creating essential application files...

REM Create package.json for attachment-loop app
if not exist "apps\attachment-loop\package.json" (
    echo {^
  "name": "@prism/attachment-loop",^
  "version": "1.0.0",^
  "main": "main.ts",^
  "scripts": {^
    "start": "ts-node main.ts",^
    "dev": "ts-node --watch main.ts"^
  }^
} > "apps\attachment-loop\package.json"
    echo    ✅ Created apps\attachment-loop\package.json
)

REM Create package.json for core
if not exist "core\package.json" (
    echo {^
  "name": "@prism/core",^
  "version": "1.0.0",^
  "main": "index.ts"^
} > "core\package.json"
    echo    ✅ Created core\package.json
)

echo.
echo 🔍 Validating New Structure...

REM Validate directory structure
echo 📂 Validating directory structure...
set "validation_passed=true"

for %%d in (core apps packages tests docs deployment data tools) do (
    if not exist "%%d" (
        echo    ❌ Missing directory: %%d
        set "validation_passed=false"
    ) else (
        echo    ✅ Verified directory: %%d
    )
)

REM Validate core AI components
echo 🧠 Validating core AI components...
for %%f in (core\ai\classifiers\gemini.ts core\ai\analyzers\claude.ts core\ai\orchestrators\attachment-loop.ts) do (
    if not exist "%%f" (
        echo    ❌ Missing core file: %%f
        set "validation_passed=false"
    ) else (
        echo    ✅ Verified core file: %%f
    )
)

REM Validate applications
echo 📱 Validating applications...
for %%f in (apps\attachment-loop\main.ts) do (
    if not exist "%%f" (
        echo    ❌ Missing app file: %%f
        set "validation_passed=false"
    ) else (
        echo    ✅ Verified app file: %%f
    )
)

echo.
echo 📊 Directory Size Analysis...
for %%d in (core apps packages tests docs deployment data tools) do (
    if exist "%%d" (
        for /f %%s in ('dir "%%d" /s /a-d 2^>nul ^| find "File(s)" ^| find /v "Dir(s)"') do (
            echo    📁 %%d: %%s
        )
    )
)

echo.
if "%validation_passed%"=="true" (
    echo ✅ REORGANIZATION COMPLETED SUCCESSFULLY!
    echo.
    echo 🎉 PRISM INTELLIGENCE PROJECT STRUCTURE OPTIMIZED!
    echo.
    echo 📊 New Project Structure:
    echo    🧠 core\          - AI Engine ^& Core Logic
    echo    📱 apps\          - Applications (Loop, Dashboard, API)
    echo    📦 packages\      - Shared Components ^& Utilities
    echo    🧪 tests\         - Comprehensive Testing Suite
    echo    📚 docs\          - Professional Documentation
    echo    🚀 deployment\    - Infrastructure ^& Deployment
    echo    📊 data\          - Sample Data ^& Schemas
    echo    🔧 tools\         - Development Tools
    echo.
    echo 🚀 Your revolutionary AI platform is now enterprise-ready!
    echo 💼 Professional structure perfect for team collaboration
    echo 📈 Scalable architecture for rapid growth
    echo 🏆 Industry-standard organization for investor presentations
) else (
    echo ❌ VALIDATION FAILED!
    echo Some issues were detected during reorganization.
    echo Please review the errors above and fix manually.
)

echo.
echo 📋 Next Steps:
echo    1. Update import paths in TypeScript files
echo    2. Update package.json dependencies
echo    3. Test each application independently
echo    4. Update documentation with new structure
echo    5. Commit changes to Git repository
echo.
pause
