@echo off
REM Phase 4: Organize Documentation and Data

echo ============================================
echo     PRISM INTELLIGENCE REORGANIZATION
echo     Phase 4: Documentation ^& Data Organization
echo ============================================
echo.

echo 📚 Organizing Documentation...

REM Migrate Architecture Documentation
echo 🏗️ Organizing Architecture Documentation...
if exist "ARCHITECTURE.md" (
    move "ARCHITECTURE.md" "docs\architecture\overview.md"
    echo    ✅ Moved ARCHITECTURE.md → docs\architecture\overview.md
)
if exist "Technical-Architecture.md" (
    move "Technical-Architecture.md" "docs\architecture\detailed.md"
    echo    ✅ Moved Technical-Architecture.md → docs\architecture\detailed.md
)
if exist "DUAL_AI_SETUP.md" (
    move "DUAL_AI_SETUP.md" "docs\architecture\ai-system.md"
    echo    ✅ Moved DUAL_AI_SETUP.md → docs\architecture\ai-system.md
)

REM Migrate User Guides
echo 📖 Organizing User Guides...
if exist "ATTACHMENT_INTELLIGENCE_QUICK_START.md" (
    move "ATTACHMENT_INTELLIGENCE_QUICK_START.md" "docs\guides\quick-start.md"
    echo    ✅ Moved ATTACHMENT_INTELLIGENCE_QUICK_START.md → docs\guides\quick-start.md
)
if exist "IMPLEMENTATION-SUMMARY.md" (
    move "IMPLEMENTATION-SUMMARY.md" "docs\guides\implementation.md"
    echo    ✅ Moved IMPLEMENTATION-SUMMARY.md → docs\guides\implementation.md
)
if exist "MVP-Implementation-Guide.md" (
    move "MVP-Implementation-Guide.md" "docs\guides\mvp-implementation.md"
    echo    ✅ Moved MVP-Implementation-Guide.md → docs\guides\mvp-implementation.md
)

REM Migrate Business Documentation
echo 💼 Organizing Business Documentation...
if exist "Vision-Complete.md" (
    move "Vision-Complete.md" "docs\guides\vision.md"
    echo    ✅ Moved Vision-Complete.md → docs\guides\vision.md
)
if exist "Cost-Comparison.md" (
    move "Cost-Comparison.md" "docs\guides\cost-comparison.md"
    echo    ✅ Moved Cost-Comparison.md → docs\guides\cost-comparison.md
)
if exist "Market-Analysis.md" (
    move "Market-Analysis.md" "docs\guides\market-analysis.md"
    echo    ✅ Moved Market-Analysis.md → docs\guides\market-analysis.md
)

REM Migrate Process Documentation
echo 📋 Organizing Process Documentation...
if exist "Project-Tasks.md" (
    move "Project-Tasks.md" "docs\guides\project-tasks.md"
    echo    ✅ Moved Project-Tasks.md → docs\guides\project-tasks.md
)
if exist "Task-List.md" (
    move "Task-List.md" "docs\guides\task-list.md"
    echo    ✅ Moved Task-List.md → docs\guides\task-list.md
)
if exist "Workflow-Diagrams.md" (
    move "Workflow-Diagrams.md" "docs\architecture\workflows.md"
    echo    ✅ Moved Workflow-Diagrams.md → docs\architecture\workflows.md
)

REM Migrate Integration Documentation
if exist "docs" (
    echo 📡 Organizing Integration Documentation...
    for %%f in (docs\*.md) do (
        move "%%f" "docs\guides\"
        echo    ✅ Moved %%f → docs\guides\
    )
    rd "docs" /q 2>nul
)

echo.
echo 📊 Organizing Sample Data...

REM Migrate Sample Data
echo 📄 Organizing Sample Data...
if exist "sample-data" (
    xcopy "sample-data\*" "data\samples\" /E /Y >nul 2>&1
    rd "sample-data" /s /q 2>nul
    echo    ✅ Moved sample-data\ → data\samples\
)

REM Migrate Templates
echo 📝 Organizing Templates...
if exist "templates" (
    xcopy "templates\*" "data\templates\" /E /Y >nul 2>&1
    rd "templates" /s /q 2>nul
    echo    ✅ Moved templates\ → data\templates\
)

echo.
echo 🧪 Organizing Testing...

REM Migrate Test Files
echo 🔬 Organizing Test Files...
if exist "src\tests" (
    xcopy "src\tests\*" "tests\unit\core\" /E /Y >nul 2>&1
    rd "src\tests" /s /q 2>nul
    echo    ✅ Moved src\tests\ → tests\unit\core\
)
if exist "tests" (
    for /d %%d in (tests\*) do (
        xcopy "%%d\*" "tests\integration\%%~nd\" /E /Y >nul 2>&1
    )
    echo    ✅ Organized existing tests\ → tests\integration\
)
if exist "test" (
    xcopy "test\*" "tests\legacy\" /E /Y >nul 2>&1
    rd "test" /s /q 2>nul
    echo    ✅ Moved test\ → tests\legacy\
)

echo.
echo 🚀 Organizing Deployment...

REM Migrate Docker Configuration
echo 🐳 Organizing Docker Configuration...
if exist "Dockerfile" (
    move "Dockerfile" "deployment\docker\Dockerfile.production"
    echo    ✅ Moved Dockerfile → deployment\docker\Dockerfile.production
)
if exist "docker-compose.yml" (
    move "docker-compose.yml" "deployment\docker\docker-compose.dev.yml"
    echo    ✅ Moved docker-compose.yml → deployment\docker\docker-compose.dev.yml
)
if exist "docker-compose.prod.yml" (
    move "docker-compose.prod.yml" "deployment\docker\docker-compose.prod.yml"
    echo    ✅ Moved docker-compose.prod.yml → deployment\docker\docker-compose.prod.yml
)

REM Migrate Infrastructure
echo 🏗️ Organizing Infrastructure...
if exist "infrastructure" (
    xcopy "infrastructure\*" "deployment\terraform\" /E /Y >nul 2>&1
    rd "infrastructure" /s /q 2>nul
    echo    ✅ Moved infrastructure\ → deployment\terraform\
)
if exist "scripts" (
    xcopy "scripts\*" "deployment\scripts\" /E /Y >nul 2>&1
    rd "scripts" /s /q 2>nul
    echo    ✅ Moved scripts\ → deployment\scripts\
)

REM Migrate Supabase Configuration
echo 🗄️ Organizing Supabase Configuration...
if exist "supabase" (
    xcopy "supabase\*" "core\database\services\supabase\" /E /Y >nul 2>&1
    rd "supabase" /s /q 2>nul
    echo    ✅ Moved supabase\ → core\database\services\supabase\
)

echo.
echo 📱 Organizing Frontend Applications...

REM Consolidate Frontend Applications
echo 🎨 Organizing Frontend Applications...
if exist "frontend" (
    xcopy "frontend\*" "apps\dashboard\" /E /Y >nul 2>&1
    rd "frontend" /s /q 2>nul
    echo    ✅ Moved frontend\ → apps\dashboard\
)
if exist "property-intelligence-app" (
    xcopy "property-intelligence-app\*" "apps\dashboard-nextjs\" /E /Y >nul 2>&1
    rd "property-intelligence-app" /s /q 2>nul
    echo    ✅ Moved property-intelligence-app\ → apps\dashboard-nextjs\
)

REM Migrate Next.js Configuration
echo ⚙️ Organizing Next.js Configuration...
if exist "src\app" (
    xcopy "src\app\*" "apps\dashboard-nextjs\src\app\" /E /Y >nul 2>&1
    rd "src\app" /s /q 2>nul
    echo    ✅ Moved src\app\ → apps\dashboard-nextjs\src\app\
)
if exist "src\components" (
    xcopy "src\components\*" "packages\ui\" /E /Y >nul 2>&1
    rd "src\components" /s /q 2>nul
    echo    ✅ Moved src\components\ → packages\ui\
)

echo.
echo ✅ DOCUMENTATION AND DATA ORGANIZATION COMPLETED!
echo.
echo 📊 Organization Summary:
echo    📚 Documentation → docs\
echo    📊 Sample Data → data\samples\
echo    🧪 Tests → tests\
echo    🚀 Deployment → deployment\
echo    📱 Applications → apps\
echo    📦 UI Components → packages\ui\
echo.
echo 🚀 Ready for Phase 5: Final Cleanup and Validation
pause
