#!/bin/bash
# Aider commands to migrate from SendGrid to CloudMailin

echo "🚀 Starting CloudMailin Migration with Aider..."
echo "=============================================="
echo ""
echo "Run these commands one by one:"
echo ""

echo "1. Update the main routes to use CloudMailin:"
echo "---------------------------------------------"
echo 'aider src/api/routes.ts src/api/cloudmailin-webhook.ts -m "Replace the SendGrid webhook route with CloudMailin. Import cloudmailin-webhook and mount it at /webhooks/cloudmailin. Remove or comment out the SendGrid webhook route."'
echo ""

echo "2. Update the email service to remove SendGrid:"
echo "-----------------------------------------------"
echo 'aider src/services/email.ts -m "Remove SendGrid dependency and replace with nodemailer for sending emails. Keep all the existing methods (sendConfirmation, sendResults, sendError) but implement them using nodemailer SMTP instead of SendGrid. Add import nodemailer from nodemailer and create a transporter using SMTP config from environment variables."'
echo ""

echo "3. Update the configuration:"
echo "---------------------------"
echo 'aider src/config/index.ts src/config/cloudmailin.ts -m "Remove SendGrid configuration and add CloudMailin configuration. Import the cloudmailin config from ./cloudmailin.ts. Add SMTP configuration for email sending using nodemailer."'
echo ""

echo "4. Fix the test file:"
echo "--------------------"
echo 'aider tests/api/sendgrid-webhook.test.ts -m "Rename this file to cloudmailin-webhook.test.ts and update all tests to use CloudMailin webhook format instead of SendGrid. The CloudMailin format has cleaner attachment structure with base64 content directly in the content field."'
echo ""

echo "5. Update the index.ts to fix TypeScript warnings:"
echo "-------------------------------------------------"
echo 'aider src/index.ts -m "Fix unused variable warnings by prefixing unused parameters with underscore: _req, _res, _next. If db import is not used, remove it."'
echo ""

echo "6. Update environment example:"
echo "-----------------------------"
echo 'aider .env.example -m "Remove SENDGRID_API_KEY and SENDGRID_FROM_EMAIL. Add CLOUDMAILIN_ADDRESS, CLOUDMAILIN_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME"'
echo ""

echo "After running all commands:"
echo "1. Update your .env file with CloudMailin credentials"
echo "2. npm install nodemailer @types/nodemailer"
echo "3. npm uninstall @sendgrid/mail"
echo "4. Test with: npx ts-node tests/manual/test-cloudmailin.ts"
