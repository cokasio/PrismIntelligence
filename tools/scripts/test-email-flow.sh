#!/bin/bash
# Test the multi-tenant email flow

echo "🚀 Starting test server..."
echo "Make sure you have run: npm install express axios"
echo ""

# Start the test server in background
npx ts-node test/test-server.ts &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

# Check if server is running
curl -s http://localhost:3000/health > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ Server is running"
echo ""
echo "🧪 Running email flow test..."
npx ts-node test/test-email-flow.ts

# Kill the server
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Test complete!"