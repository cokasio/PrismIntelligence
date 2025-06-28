@echo off
REM AI Test Generation Workflow for PrismIntelligence (Windows)
REM This script demonstrates how to use AI tools to generate comprehensive tests

echo 🤖 PrismIntelligence AI Test Generation Workflow
echo ================================================

REM Step 1: Check Python and Node
echo.
echo 📦 Step 1: Checking Prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python first.
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    exit /b 1
)

REM Step 2: Install Aider
echo.
echo 📦 Step 2: Installing Aider AI Assistant...
pip show aider-chat >nul 2>&1
if errorlevel 1 (
    echo Installing Aider...
    pip install aider-chat
) else (
    echo ✅ Aider already installed
)

REM Step 3: Create test directories
echo.
echo 📁 Step 3: Creating Test Structure...
if not exist "tests\unit" mkdir tests\unit
if not exist "tests\integration" mkdir tests\integration
if not exist "tests\e2e" mkdir tests\e2e
if not exist "tests\fixtures" mkdir tests\fixtures
if not exist "tests\performance" mkdir tests\performance

REM Step 4: Display AI Commands
echo.
echo 🧪 Step 4: AI Test Generation Commands
echo =====================================
echo.
echo Use these commands to generate tests:
echo.
echo 1. Generate Email Service Tests:
echo    aider src\services\email.ts -m "Create unit tests with SendGrid mocks"
echo.
echo 2. Generate AI Analysis Tests:
echo    aider src\services\claudeAnalyzer.ts -m "Create tests for multi-pass analysis"
echo.
echo 3. Generate Parser Tests:
echo    aider src\parsers -m "Create tests for PDF, Excel, CSV parsers with property reports"
echo.
echo 4. Generate Integration Tests:
echo    aider src\api\routes.ts tests\integration -m "Create webhook integration tests"
echo.
echo 5. Fix Coverage Gaps:
echo    npm test -- --coverage
echo    aider coverage\lcov.info -m "Add tests to reach 80%% coverage"

REM Step 5: Create helper batch files
echo.
echo 📝 Step 5: Creating Helper Scripts...

REM Create test runner
echo @echo off > run-all-tests.bat
echo echo Running all tests with coverage... >> run-all-tests.bat
echo npm test -- --coverage >> run-all-tests.bat
echo echo. >> run-all-tests.bat
echo echo Coverage report: coverage\lcov-report\index.html >> run-all-tests.bat
echo pause >> run-all-tests.bat

REM Create quick test generator
echo @echo off > quick-test-gen.bat
echo REM Quick Test Generator >> quick-test-gen.bat
echo set FILE=%%1 >> quick-test-gen.bat
echo if "%%FILE%%"=="" ( >> quick-test-gen.bat
echo     echo Usage: quick-test-gen.bat path\to\file.ts >> quick-test-gen.bat
echo     exit /b 1 >> quick-test-gen.bat
echo ) >> quick-test-gen.bat
echo echo Generating tests for %%FILE%%... >> quick-test-gen.bat
echo aider %%FILE%% -m "Create comprehensive unit tests with edge cases" >> quick-test-gen.bat

REM Step 6: Create example commands file
echo.
echo 📋 Step 6: Creating Command Reference...

(
echo # AI Test Commands for PrismIntelligence
echo.
echo ## Quick Start
echo ```cmd
echo # Install Aider
echo pip install aider-chat
echo.
echo # Set API Key
echo set ANTHROPIC_API_KEY=your-key-here
echo ```
echo.
echo ## Generate Tests by Component
echo.
echo ### Email Processing Tests
echo ```cmd
echo aider src\services\email.ts src\api\routes.ts -m "Create tests for email ingestion including: webhook validation, attachment processing, error cases, multi-tenant support"
echo ```
echo.
echo ### AI Analysis Tests  
echo ```cmd
echo aider src\services\claudeAnalyzer.ts src\services\geminiClassifier.ts -m "Create tests for: classification accuracy, multi-pass analysis, performance benchmarks, error handling"
echo ```
echo.
echo ### Parser Tests
echo ```cmd
echo aider src\parsers\*.ts -m "Create tests with realistic property management reports: P&L statements, rent rolls, variance reports, occupancy reports"
echo ```
echo.
echo ## Fix Failing Tests
echo ```cmd
echo npm test
echo aider --message "Fix all failing tests shown above"
echo ```
echo.
echo ## Improve Coverage
echo ```cmd
echo npm test -- --coverage
echo aider coverage\lcov.info -m "Add tests for uncovered lines, focus on error paths"
echo ```
) > AI-TEST-COMMANDS.md

REM Step 7: Success message
echo.
echo ✅ AI Test Generation Setup Complete!
echo.
echo 🚀 Next Steps:
echo    1. Set your API key: set ANTHROPIC_API_KEY=your-key
echo    2. Run an AI command from AI-TEST-COMMANDS.md
echo    3. Use run-all-tests.bat to execute tests
echo    4. Use quick-test-gen.bat [file] for rapid test creation
echo.
echo 💡 Pro Tip: Start with one service and expand:
echo    aider src\services\email.ts -m "Create complete test suite"
echo.
pause
