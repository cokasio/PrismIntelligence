@echo off
REM Quick CloudMailin Setup for PrismIntelligence
echo =============================================
echo    CloudMailin Setup for PrismIntelligence
echo =============================================
echo.

echo Step 1: Update your .env file
echo -------------------------------
echo Add these lines to your .env:
echo.
echo # CloudMailin Configuration
echo CLOUDMAILIN_ADDRESS=your-address@cloudmailin.net
echo CLOUDMAILIN_SECRET=your-webhook-secret
echo.
echo # SMTP for sending results (optional)
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your-email@gmail.com
echo SMTP_PASS=your-app-password
echo.

echo Step 2: Install required packages
echo ---------------------------------
npm install nodemailer @types/nodemailer axios

echo.
echo Step 3: Configure CloudMailin Dashboard
echo --------------------------------------
echo 1. Go to: https://www.cloudmailin.com/accounts/ca27ba5e421c3976
echo 2. Set your webhook URL: https://your-domain.com/api/webhooks/cloudmailin
echo 3. Choose POST format: JSON (Normalized)
echo 4. Copy the webhook secret to your .env
echo.

echo Step 4: Test locally
echo --------------------
echo Run in separate terminals:
echo   Terminal 1: npm run dev
echo   Terminal 2: npx ts-node tests/manual/test-cloudmailin.ts
echo.

echo Step 5: Remove SendGrid (optional)
echo ----------------------------------
echo If you want to fully remove SendGrid:
echo   npm uninstall @sendgrid/mail
echo.

pause
