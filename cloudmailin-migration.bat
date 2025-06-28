@echo off
REM Aider commands to migrate from SendGrid to CloudMailin
REM Run each command one at a time

echo ============================================
echo  CloudMailin Migration with Aider
echo ============================================
echo.

echo Step 1: Update routes to use CloudMailin
echo ----------------------------------------
echo aider src/api/routes.ts src/api/cloudmailin-webhook.ts -m "Replace the SendGrid webhook route with CloudMailin. Import cloudmailin-webhook and mount it at /webhooks/cloudmailin. Remove or comment out the SendGrid webhook route."
echo.
echo Press any key after running the above command...
pause > nul
echo.

echo Step 2: Update email service
echo ----------------------------
echo aider src/services/email.ts -m "Remove SendGrid dependency and replace with nodemailer for sending emails. Keep all the existing methods (sendConfirmation, sendResults, sendError) but implement them using nodemailer SMTP instead of SendGrid. Add import nodemailer from nodemailer and create a transporter using SMTP config from environment variables."
echo.
echo Press any key after running the above command...
pause > nul
echo.

echo Step 3: Update configuration
echo ---------------------------
echo aider src/config/index.ts src/config/cloudmailin.ts -m "Remove SendGrid configuration and add CloudMailin configuration. Import the cloudmailin config from ./cloudmailin.ts. Add SMTP configuration for email sending using nodemailer."
echo.
echo Press any key after running the above command...
pause > nul
echo.

echo Step 4: Update tests
echo -------------------
echo aider tests/api/sendgrid-webhook.test.ts -m "Rename this file to cloudmailin-webhook.test.ts and update all tests to use CloudMailin webhook format instead of SendGrid. The CloudMailin format has cleaner attachment structure with base64 content directly in the content field."
echo.
echo Press any key after running the above command...
pause > nul
echo.

echo Step 5: Fix TypeScript warnings
echo -------------------------------
echo aider src/index.ts -m "Fix unused variable warnings by prefixing unused parameters with underscore: _req, _res, _next. If db import is not used, remove it."
echo.
echo Press any key after running the above command...
pause > nul
echo.

echo Step 6: Update .env.example
echo --------------------------
echo aider .env.example -m "Remove SENDGRID_API_KEY and SENDGRID_FROM_EMAIL. Add CLOUDMAILIN_ADDRESS, CLOUDMAILIN_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME"
echo.
echo.
echo ========================================
echo  Final Steps:
echo ========================================
echo 1. Update your .env file with CloudMailin credentials
echo 2. Run: npm install nodemailer @types/nodemailer
echo 3. Run: npm uninstall @sendgrid/mail
echo 4. Test: npx ts-node tests/manual/test-cloudmailin.ts
echo.
pause
