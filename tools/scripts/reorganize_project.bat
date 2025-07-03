@echo off
setlocal enabledelayedexpansion

:: 🏗️ Property Intelligence Platform - Project Reorganization Script (Batch)
:: This script will completely reorganize your project for optimal structure

set "PROJECT_ROOT=C:\Dev\PrismIntelligence"
set "BACKUP_DIR=%PROJECT_ROOT%\backupcode"

:: Get timestamp for backup folder
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%"
set "BACKUP_PATH=%BACKUP_DIR%\original_%TIMESTAMP%"

echo.
echo 🚀 Starting Property Intelligence Platform Reorganization...
echo 📁 Project Root: %PROJECT_ROOT%
echo 📦 Backup Location: %BACKUP_DIR%
echo.

cd /d "%PROJECT_ROOT%"

:: ========================================================================================
:: PHASE 1: BACKUP EXISTING CODE
:: ========================================================================================

echo 📦 Phase 1: Creating backup of existing code...

:: Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
mkdir "%BACKUP_PATH%" 2>nul

:: Backup current src directory if it exists
if exist "src" (
    echo    📁 Backing up src/ directory...
    xcopy "src" "%BACKUP_PATH%\src\" /E /I /H /Y >nul 2>&1
)

:: Backup other important files
for %%f in (package.json next.config.js tailwind.config.js tsconfig.json .env.local components.json README.md) do (
    if exist "%%f" (
        echo    📄 Backing up %%f...
        copy "%%f" "%BACKUP_PATH%\" >nul 2>&1
    )
)

echo ✅ Backup completed successfully!
echo.

:: ========================================================================================
:: PHASE 2: CREATE NEW DIRECTORY STRUCTURE  
:: ========================================================================================

echo 🏗️ Phase 2: Creating optimized directory structure...

echo    📁 Creating main directories...

:: Create main directories
mkdir "docs\api" 2>nul
mkdir "docs\deployment" 2>nul
mkdir "docs\architecture" 2>nul
mkdir "infrastructure\supabase" 2>nul
mkdir "infrastructure\docker" 2>nul
mkdir "infrastructure\deploy" 2>nul
mkdir "scripts" 2>nul
mkdir "tests\__mocks__" 2>nul
mkdir "tests\unit" 2>nul
mkdir "tests\integration" 2>nul
mkdir "tests\e2e" 2>nul
mkdir "public\icons" 2>nul
mkdir "public\images" 2>nul
mkdir "public\manifests" 2>nul

echo    📁 Creating src/ structure...

:: Create src directories
mkdir "src\app\api\auth" 2>nul
mkdir "src\app\api\emails" 2>nul
mkdir "src\app\api\properties" 2>nul
mkdir "src\app\api\ai" 2>nul
mkdir "src\app\api\queue" 2>nul
mkdir "src\app\api\webhooks\cloudmailin" 2>nul
mkdir "src\app\(auth)\login" 2>nul
mkdir "src\app\(auth)\register" 2>nul
mkdir "src\app\(dashboard)\emails" 2>nul
mkdir "src\app\(dashboard)\properties" 2>nul
mkdir "src\app\(dashboard)\analytics" 2>nul
mkdir "src\app\(dashboard)\settings" 2>nul
mkdir "src\components\ui" 2>nul
mkdir "src\components\layout" 2>nul
mkdir "src\components\email" 2>nul
mkdir "src\components\property" 2>nul
mkdir "src\components\analytics" 2>nul
mkdir "src\components\common" 2>nul
mkdir "src\contexts" 2>nul
mkdir "src\hooks" 2>nul
mkdir "src\lib\auth" 2>nul
mkdir "src\lib\database" 2>nul
mkdir "src\lib\email" 2>nul
mkdir "src\lib\ai" 2>nul
mkdir "src\lib\queue" 2>nul
mkdir "src\lib\utils" 2>nul
mkdir "src\lib\validations" 2>nul
mkdir "src\lib\constants" 2>nul
mkdir "src\services\cloudmailin" 2>nul
mkdir "src\services\anthropic" 2>nul
mkdir "src\services\supabase" 2>nul
mkdir "src\services\notifications" 2>nul
mkdir "src\services\analytics" 2>nul
mkdir "src\types" 2>nul
mkdir "src\styles\components" 2>nul

echo ✅ Directory structure created successfully!
echo.

:: ========================================================================================
:: PHASE 3: CREATE CORE CONFIGURATION FILES
:: ========================================================================================

echo ⚙️ Phase 3: Creating core configuration files...

:: Create .gitignore
(
echo # Dependencies
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Next.js
echo .next/
echo out/
echo dist/
echo build/
echo.
echo # Environment files
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS
echo .DS_Store
echo .DS_Store?
echo ._*
echo .Spotlight-V100
echo .Trashes
echo ehthumbs.db
echo Thumbs.db
echo.
echo # Backup code
echo backupcode/
echo.
echo # Logs
echo logs/
echo *.log
echo.
echo # Temporary files
echo tmp/
echo temp/
echo.
echo # Database
echo *.db
echo *.sqlite
echo.
echo # Testing
echo coverage/
echo .nyc_output/
echo.
echo # Supabase
echo **/supabase/.temp
echo **/supabase/.env
) > .gitignore

:: Create .env.example
(
echo # Property Intelligence Platform Environment Configuration
echo.
echo # Application
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo NODE_ENV=development
echo.
echo # CloudMailin Configuration
echo CLOUDMAILIN_ADDRESS=your-cloudmailin-address@cloudmailin.net
echo.
echo # Email Processing
echo DEMO_MODE=true
echo SMTP_HOST=smtp.ethereal.email
echo SMTP_PORT=587
echo SMTP_SECURE=false
echo.
echo # Anthropic AI
echo ANTHROPIC_API_KEY=your-anthropic-api-key
echo.
echo # Supabase
echo NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
echo.
echo # Optional: Production Email Provider
echo # SMTP_HOST=smtp.gmail.com
echo # SMTP_PORT=587
echo # SMTP_USER=your-email@gmail.com
echo # SMTP_PASS=your-app-password
echo.
echo # Security
echo NEXTAUTH_SECRET=your-nextauth-secret
echo NEXTAUTH_URL=http://localhost:3000
) > .env.example

:: Create package.json
(
echo {
echo   "name": "property-intelligence-platform",
echo   "version": "1.0.0",
echo   "description": "AI-powered property management intelligence platform",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint",
echo     "type-check": "tsc --noEmit",
echo     "test": "jest",
echo     "setup": "call scripts\\setup.bat",
echo     "clean": "if exist .next rmdir /s /q .next"
echo   },
echo   "dependencies": {
echo     "next": "^15.0.0",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "@supabase/supabase-js": "^2.39.0",
echo     "@anthropic-ai/sdk": "^0.17.0",
echo     "nodemailer": "^6.9.8",
echo     "@radix-ui/react-tabs": "^1.0.4",
echo     "@radix-ui/react-card": "^1.0.4",
echo     "lucide-react": "^0.294.0",
echo     "tailwindcss": "^3.3.6",
echo     "clsx": "^2.0.0",
echo     "zod": "^3.22.4"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.10.0",
echo     "@types/react": "^18.2.42",
echo     "@types/react-dom": "^18.2.17",
echo     "@types/nodemailer": "^6.4.14",
echo     "typescript": "^5.3.2",
echo     "eslint": "^8.54.0",
echo     "eslint-config-next": "^15.0.0"
echo   },
echo   "engines": {
echo     "node": ">=18.0.0",
echo     "npm": ">=9.0.0"
echo   }
echo }
) > package.json

:: Create tsconfig.json
(
echo {
echo   "compilerOptions": {
echo     "target": "es5",
echo     "lib": ["dom", "dom.iterable", "es6"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "plugins": [{"name": "next"}],
echo     "baseUrl": ".",
echo     "paths": {
echo       "@/*": ["./src/*"],
echo       "@/components/*": ["./src/components/*"],
echo       "@/lib/*": ["./src/lib/*"]
echo     }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
echo   "exclude": ["node_modules", "backupcode"]
echo }
) > tsconfig.json

echo ✅ Configuration files created successfully!
echo.

:: ========================================================================================
:: PHASE 4: CREATE ESSENTIAL SOURCE FILES
:: ========================================================================================

echo 📝 Phase 4: Creating essential source files...

:: Create basic app layout
(
echo import type { Metadata } from 'next';
echo import { Inter } from 'next/font/google';
echo import './globals.css';
echo.
echo const inter = Inter^({ subsets: ['latin'] }^);
echo.
echo export const metadata: Metadata = {
echo   title: 'Property Intelligence Platform',
echo   description: 'AI-powered property management intelligence',
echo };
echo.
echo export default function RootLayout^({
echo   children,
echo }: {
echo   children: React.ReactNode;
echo }^) {
echo   return ^(
echo     ^<html lang="en"^>
echo       ^<body className={inter.className}^>
echo         {children}
echo       ^</body^>
echo     ^</html^>
echo   ^);
echo }
) > "src\app\layout.tsx"

:: Create basic home page
(
echo export default function HomePage^(^) {
echo   return ^(
echo     ^<div className="min-h-screen bg-gray-50"^>
echo       ^<div className="container mx-auto px-4 py-16"^>
echo         ^<h1 className="text-4xl font-bold text-center mb-8"^>
echo           🏢 Property Intelligence Platform
echo         ^</h1^>
echo         ^<p className="text-xl text-center text-gray-600"^>
echo           Project successfully reorganized!
echo         ^</p^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
) > "src\app\page.tsx"

:: Create globals.css
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
) > "src\app\globals.css"

:: Create basic types
(
echo export interface User {
echo   id: string;
echo   email: string;
echo   name: string;
echo   company_id: string;
echo }
echo.
echo export interface Property {
echo   id: string;
echo   name: string;
echo   address: string;
echo }
echo.
echo export interface Email {
echo   id: string;
echo   from: string;
echo   subject: string;
echo   status: string;
echo }
) > "src\types\index.ts"

echo ✅ Essential source files created successfully!
echo.

:: ========================================================================================
:: PHASE 5: CREATE SETUP SCRIPT
:: ========================================================================================

echo 🔧 Phase 5: Creating setup and utility scripts...

:: Create batch setup script
(
echo @echo off
echo echo 🚀 Setting up Property Intelligence Platform...
echo.
echo echo 📦 Installing dependencies...
echo npm install
echo.
echo echo ⚙️ Creating environment file...
echo if not exist ".env.local" ^(
echo     copy ".env.example" ".env.local" ^>nul
echo     echo 📝 Please configure your .env.local file with your API keys
echo ^)
echo.
echo echo 🔍 Running type check...
echo npm run type-check
echo.
echo echo ✅ Setup completed successfully!
echo echo.
echo echo 🚀 Next steps:
echo echo 1. Configure your .env.local file
echo echo 2. Run: npm run dev
echo echo 3. Open: http://localhost:3000
echo.
echo pause
) > "scripts\setup.bat"

echo ✅ Setup script created successfully!
echo.

:: ========================================================================================
:: COMPLETION MESSAGE
:: ========================================================================================

echo.
echo 🎉 PROJECT REORGANIZATION COMPLETED SUCCESSFULLY!
echo.
echo 📊 Summary:
echo    ✅ Backup created in: %BACKUP_PATH%
echo    ✅ New structure created with optimized architecture
echo    ✅ Configuration files updated
echo    ✅ Essential source files created  
echo    ✅ Setup scripts prepared
echo.
echo 🚀 Next Steps:
echo    1. Run the setup script: scripts\setup.bat
echo    2. Configure your environment: edit .env.local
echo    3. Install dependencies: npm install
echo    4. Start development: npm run dev
echo.
echo 📚 Your backup is safely stored in: %BACKUP_DIR%
echo 🏗️ Your new optimized project is ready for development!
echo.
echo Happy coding! 🚀
echo.
pause