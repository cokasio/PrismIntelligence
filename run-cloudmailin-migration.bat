@echo off
REM Quick CloudMailin Migration - All commands in one script

echo ====================================================
echo  CloudMailin Migration - Running All Commands
echo ====================================================
echo.
echo Make sure you have:
echo 1. Set ANTHROPIC_API_KEY environment variable
echo 2. Committed any uncommitted changes (git status)
echo.
pause

echo.
echo Step 1: Updating routes...
echo --------------------------
aider src/api/routes.ts src/api/cloudmailin-webhook.ts -m "Replace the SendGrid webhook route with CloudMailin. Import cloudmailin-webhook and mount it at /webhooks/cloudmailin. Remove or comment out the SendGrid webhook route." --yes

echo.
echo Step 2: Updating email service...
echo ---------------------------------
aider src/services/email.ts -m "Remove SendGrid dependency and replace with nodemailer for sending emails. Keep all the existing methods (sendConfirmation, sendResults, sendError) but implement them using nodemailer SMTP instead of SendGrid. Add import nodemailer from nodemailer and create a transporter using SMTP config from environment variables." --yes

echo.
echo Step 3: Updating configuration...
echo ---------------------------------
aider src/config/index.ts src/config/cloudmailin.ts -m "Remove SendGrid configuration and add CloudMailin configuration. Import the cloudmailin config from ./cloudmailin.ts. Add SMTP configuration for email sending using nodemailer." --yes

echo.
echo Step 4: Updating tests...
echo -------------------------
aider tests/api/sendgrid-webhook.test.ts -m "Rename this file to cloudmailin-webhook.test.ts and update all tests to use CloudMailin webhook format instead of SendGrid. The CloudMailin format has cleaner attachment structure with base64 content directly in the content field." --yes

echo.
echo Step 5: Fixing TypeScript warnings...
echo -------------------------------------
aider src/index.ts -m "Fix unused variable warnings by prefixing unused parameters with underscore: _req, _res, _next. If db import is not used, remove it." --yes

echo.
echo Step 6: Updating .env.example...
echo --------------------------------
aider .env.example -m "Remove SENDGRID_API_KEY and SENDGRID_FROM_EMAIL. Add CLOUDMAILIN_ADDRESS, CLOUDMAILIN_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME" --yes

echo.
echo ====================================================
echo  Migration Complete! Final steps:
echo ====================================================
echo.
echo 1. Update your .env file with CloudMailin credentials:
echo    CLOUDMAILIN_ADDRESS=your-address@cloudmailin.net
echo    CLOUDMAILIN_SECRET=your-webhook-secret
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=587
echo    SMTP_USER=your-email@gmail.com
echo    SMTP_PASS=your-app-password
echo.
echo 2. Install new dependencies:
echo    npm install nodemailer @types/nodemailer
echo.
echo 3. Remove SendGrid:
echo    npm uninstall @sendgrid/mail
echo.
echo 4. Test your webhook:
echo    npm run dev
echo    npx ts-node tests/manual/test-cloudmailin.ts
echo.
pause
