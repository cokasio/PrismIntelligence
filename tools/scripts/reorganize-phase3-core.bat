@echo off
REM Phase 3: Migrate Core AI System Components

echo ============================================
echo     PRISM INTELLIGENCE REORGANIZATION
echo     Phase 3: Core AI System Migration
echo ============================================
echo.

echo 🧠 Migrating Core AI Services...

REM Migrate AI Classifiers
echo 📋 Migrating AI Classifiers...
if exist "src\services\geminiClassifier.ts" (
    move "src\services\geminiClassifier.ts" "core\ai\classifiers\gemini.ts"
    echo    ✅ Moved geminiClassifier.ts → core\ai\classifiers\gemini.ts
)

REM Migrate AI Analyzers  
echo 🔍 Migrating AI Analyzers...
if exist "src\services\claudeAnalyzer.ts" (
    move "src\services\claudeAnalyzer.ts" "core\ai\analyzers\claude.ts"
    echo    ✅ Moved claudeAnalyzer.ts → core\ai\analyzers\claude.ts
)

REM Migrate AI Orchestrators
echo 🎭 Migrating AI Orchestrators...
if exist "src\services\attachmentIntelligenceLoop.ts" (
    move "src\services\attachmentIntelligenceLoop.ts" "core\ai\orchestrators\attachment-loop.ts"
    echo    ✅ Moved attachmentIntelligenceLoop.ts → core\ai\orchestrators\attachment-loop.ts
)
if exist "src\services\multiAgentOrchestrator.ts" (
    move "src\services\multiAgentOrchestrator.ts" "core\ai\orchestrators\multi-agent.ts"
    echo    ✅ Moved multiAgentOrchestrator.ts → core\ai\orchestrators\multi-agent.ts
)

REM Migrate Core AI Service
echo 🤖 Migrating Core AI Service...
if exist "src\services\ai.ts" (
    move "src\services\ai.ts" "core\ai\ai-coordinator.ts"
    echo    ✅ Moved ai.ts → core\ai\ai-coordinator.ts
)

echo.
echo 💾 Migrating Database Components...

REM Migrate Database Models
echo 📊 Migrating Database Models...
if exist "src\database" (
    xcopy "src\database\*" "core\database\models\" /E /Y >nul 2>&1
    rd "src\database" /s /q 2>nul
    echo    ✅ Moved src\database\ → core\database\models\
)

REM Migrate Database Services
echo 🗄️ Migrating Database Services...
if exist "src\services\database.ts" (
    move "src\services\database.ts" "core\database\services\database.ts"
    echo    ✅ Moved database.ts → core\database\services\database.ts
)
if exist "src\services\databaseService.ts" (
    move "src\services\databaseService.ts" "core\database\services\supabase.ts"
    echo    ✅ Moved databaseService.ts → core\database\services\supabase.ts
)

REM Migrate Schema Files
echo 📋 Migrating Database Schemas...
if exist "supabase-schema.sql" (
    move "supabase-schema.sql" "core\database\migrations\001-initial-schema.sql"
    echo    ✅ Moved supabase-schema.sql → core\database\migrations\001-initial-schema.sql
)
if exist "supabase-migration.sql" (
    move "supabase-migration.sql" "core\database\migrations\002-migration.sql"
    echo    ✅ Moved supabase-migration.sql → core\database\migrations\002-migration.sql
)

echo.
echo ⚙️ Migrating Processors and Workflows...

REM Migrate Processors
echo 🔄 Migrating File Processors...
if exist "src\parsers" (
    xcopy "src\parsers\*" "core\processors\parsers\" /E /Y >nul 2>&1
    rd "src\parsers" /s /q 2>nul
    echo    ✅ Moved src\parsers\ → core\processors\parsers\
)
if exist "src\handlers" (
    xcopy "src\handlers\*" "core\processors\extractors\" /E /Y >nul 2>&1
    rd "src\handlers" /s /q 2>nul
    echo    ✅ Moved src\handlers\ → core\processors\extractors\
)

REM Migrate Workflows
echo 🔄 Migrating Workflows...
if exist "src\pipeline" (
    xcopy "src\pipeline\*" "core\workflows\" /E /Y >nul 2>&1
    rd "src\pipeline" /s /q 2>nul
    echo    ✅ Moved src\pipeline\ → core\workflows\
)
if exist "src\services\queue.ts" (
    move "src\services\queue.ts" "core\workflows\queue-manager.ts"
    echo    ✅ Moved queue.ts → core\workflows\queue-manager.ts
)

echo.
echo 📱 Setting up Applications...

REM Setup Attachment Loop App
echo 🔄 Setting up Attachment Loop App...
if exist "src\startAttachmentLoop.ts" (
    move "src\startAttachmentLoop.ts" "apps\attachment-loop\main.ts"
    echo    ✅ Moved startAttachmentLoop.ts → apps\attachment-loop\main.ts
)

REM Setup API App
echo 🌐 Setting up API App...
if exist "src\api" (
    xcopy "src\api\*" "apps\api\" /E /Y >nul 2>&1
    rd "src\api" /s /q 2>nul
    echo    ✅ Moved src\api\ → apps\api\
)
if exist "src\routes" (
    xcopy "src\routes\*" "apps\api\routes\" /E /Y >nul 2>&1
    rd "src\routes" /s /q 2>nul
    echo    ✅ Moved src\routes\ → apps\api\routes\
)

echo.
echo 📦 Setting up Shared Packages...

REM Setup Utils Package
echo 🛠️ Setting up Utils Package...
if exist "src\utils" (
    xcopy "src\utils\*" "packages\utils\" /E /Y >nul 2>&1
    rd "src\utils" /s /q 2>nul
    echo    ✅ Moved src\utils\ → packages\utils\
)
if exist "lib" (
    xcopy "lib\*" "packages\utils\lib\" /E /Y >nul 2>&1
    rd "lib" /s /q 2>nul
    echo    ✅ Moved lib\ → packages\utils\lib\
)

REM Setup Config Package
echo ⚙️ Setting up Config Package...
if exist "src\config" (
    xcopy "src\config\*" "packages\config\" /E /Y >nul 2>&1
    rd "src\config" /s /q 2>nul
    echo    ✅ Moved src\config\ → packages\config\
)
if exist "config" (
    xcopy "config\*" "packages\config\legacy\" /E /Y >nul 2>&1
    rd "config" /s /q 2>nul
    echo    ✅ Moved config\ → packages\config\legacy\
)

REM Setup Types Package
echo 📝 Setting up Types Package...
if exist "src\types" (
    xcopy "src\types\*" "packages\types\" /E /Y >nul 2>&1
    rd "src\types" /s /q 2>nul
    echo    ✅ Moved src\types\ → packages\types\
)

echo.
echo ✅ CORE SYSTEM MIGRATION COMPLETED SUCCESSFULLY!
echo.
echo 📊 Migration Summary:
echo    🧠 AI Services → core\ai\
echo    💾 Database → core\database\
echo    ⚙️ Processors → core\processors\
echo    🔄 Workflows → core\workflows\
echo    📱 Applications → apps\
echo    📦 Packages → packages\
echo.
echo 🚀 Ready for Phase 4: Documentation Organization
pause
