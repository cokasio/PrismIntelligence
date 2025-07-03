#!/bin/bash
# Install script for notification dependencies

echo "📦 Installing notification service dependencies..."

# Install node-cron for scheduled daily digests
npm install --save node-cron
npm install --save-dev @types/node-cron

echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.notifications.example to .env and fill in your values"
echo "2. Test notifications: node test-notifications.js"
echo "3. Start daily digest cron: node daily-digest-cron.js"
echo "4. Or run digest immediately: node daily-digest-cron.js --now"