@echo off
echo ============================================
echo  Property Intelligence Platform Setup
echo  Landing Page Installation
echo ============================================
echo.

echo Step 1: Installing Magic UI dependencies...
call install-magicui.bat

echo.
echo Step 2: Installing landing page dependencies...
call install-landing-deps.bat

echo.
echo Step 3: Starting development server...
cd frontend
npm run dev

echo.
echo ============================================
echo  Setup Complete!
echo  Your landing page is running at:
echo  http://localhost:3000
echo ============================================
pause