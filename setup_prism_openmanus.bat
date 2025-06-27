@echo off
echo ============================================================
echo    PrismIntelligence + OpenManus Multi-Agent Setup
echo    Property Intelligence Platform Installation
echo ============================================================
echo.

REM Check if we're in the correct directory
if not exist "openmanus" (
    echo ❌ OpenManus directory not found!
    echo Please run this script from C:\Dev\PrismIntelligence\
    pause
    exit /b 1
)

echo 🔍 Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    echo Visit: https://python.org/downloads
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
)

echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📋 Installing Python dependencies...

REM Install OpenManus dependencies
echo Installing OpenManus requirements...
cd openmanus
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install OpenManus dependencies
    pause
    exit /b 1
)
cd ..

REM Install additional dependencies for PrismIntelligence
echo Installing PrismIntelligence additional dependencies...
pip install toml supabase anthropic google-generativeai watchdog
if %errorlevel% neq 0 (
    echo ❌ Failed to install additional dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Copy configuration file
echo 📝 Setting up configuration...
if not exist "openmanus\config\prism_intelligence.toml" (
    echo Creating default configuration file...
    copy "openmanus\config\config.example.toml" "openmanus\config\config.toml"
    echo ⚠️ Please edit openmanus\config\config.toml with your API keys
) else (
    echo ✅ Configuration file already exists
)

REM Create necessary directories
echo 📁 Creating directory structure...
if not exist "logs" mkdir logs
if not exist "processed" mkdir processed
if not exist "errors" mkdir errors
echo ✅ Directory structure created

REM Set up sample data
echo 📄 Setting up sample data...
if not exist "incoming\sample-financial-report.csv" (
    copy "sample-data\sample-financial-report.csv" "incoming\financial\"
    copy "sample-data\sample-rent-roll.csv" "incoming\reports\"
    echo ✅ Sample data copied to incoming folders
)

echo.
echo ============================================================
echo    🎉 INSTALLATION COMPLETE!
echo ============================================================
echo.
echo 📋 Next Steps:
echo.
echo 1. 🔑 CONFIGURE API KEYS (Required):
echo    Edit: openmanus\config\config.toml
echo    Add your API keys:
echo    - ANTHROPIC_API_KEY (for Claude)
echo    - GEMINI_API_KEY (for Gemini)  
echo    - SUPABASE_URL and keys (for database)
echo.
echo 2. 🧪 TEST THE SYSTEM:
echo    python prism_openmanus_integration.py --file "incoming\financial\sample-financial-report.csv"
echo.
echo 3. 🎮 INTERACTIVE MODE:
echo    python prism_openmanus_integration.py --interactive
echo.
echo 4. 👀 WATCH MODE (Auto-process new files):
echo    python prism_openmanus_integration.py --watch "incoming"
echo.
echo 📚 Documentation: PRISM_OPENMANUS_INTEGRATION_GUIDE.md
echo.
echo ⚠️  IMPORTANT: Configure your API keys before using the system!
echo.
pause
