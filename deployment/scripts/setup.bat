@echo off
echo 🚀 Setting up Property Intelligence Platform...

echo 📦 Installing dependencies...
npm install

echo ⚙️ Creating environment file...
if not exist ".env.local" (
    copy ".env.example" ".env.local" >nul
    echo 📝 Please configure your .env.local file with your API keys
)

echo 🔍 Running type check...
npm run type-check

echo ✅ Setup completed successfully
echo.
echo 🚀 Next steps:
echo 1. Configure your .env.local file
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000

pause
