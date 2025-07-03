@echo off
REM Complete CloudMailin Migration - Final Steps

echo =========================================
echo  CloudMailin Migration - Final Steps
echo =========================================
echo.

echo Step 1: Installing required packages...
echo --------------------------------------
npm install nodemailer @types/nodemailer

echo.
echo Step 2: Removing SendGrid...
echo ---------------------------
npm uninstall @sendgrid/mail

echo.
echo Step 3: Checking for remaining SendGrid references...
echo ----------------------------------------------------
findstr /s /i "sendgrid" src\*.ts src\*.js > sendgrid-check.txt
type sendgrid-check.txt
del sendgrid-check.txt

echo.
echo Step 4: Building to check TypeScript...
echo --------------------------------------
call npm run build

echo.
echo =========================================
echo  Migration Complete! Next steps:
echo =========================================
echo.
echo 1. Update your .env file with CloudMailin credentials
echo 2. Configure CloudMailin webhook in dashboard
echo 3. Test with: npx ts-node tests\manual\test-cloudmailin.ts
echo.
echo See CLOUDMAILIN-MIGRATION-COMPLETE.md for details
echo.
pause
