@echo off
REM Prism Intelligence Development Setup Script for Windows
REM This script mirrors the functionality of setup-dev.sh for Windows users
REM PowerShell would be more powerful, but batch files work on any Windows system

echo 🚀 Setting up Prism Intelligence development environment...
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    echo    Visit: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running

REM Install dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env (
    echo 🔧 Creating environment configuration...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your API keys
    echo    Key variables to set:
    echo    - ANTHROPIC_API_KEY
    echo    - SENDGRID_API_KEY  
    echo    - DATABASE_URL
) else (
    echo ✅ Environment file already exists
)

REM Build the project
echo 🔨 Building the project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM Start development services
echo 🐳 Starting development services...
docker-compose up -d

REM Wait for services
echo ⏱️  Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Setup database
echo 🗃️  Setting up database...
call npm run db:setup

REM Run tests
echo 🧪 Running tests...
call npm test

echo.
echo 🎉 Development environment setup complete!
echo ==================================================
echo.
echo 🌟 What's running:
echo    • Main application: http://localhost:3000
echo    • Redis: localhost:6379
echo    • PostgreSQL: localhost:5432
echo.
echo 🚀 Next steps:
echo    1. Edit .env file with your API keys
echo    2. Run 'npm run dev' to start development
echo    3. Visit http://localhost:3000/health to verify
echo.
echo 📚 Useful commands:
echo    • npm run dev      - Start development server
echo    • npm run test     - Run tests  
echo    • npm run lint     - Check code quality
echo.
echo Happy coding! 🎯
pause
