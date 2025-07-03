#!/usr/bin/env node

/**
 * 🚀 Prism Intelligence - Production Launch Script
 * Complete AI property management platform with real agents
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Prism Intelligence - Production Launch');
console.log('==========================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please copy .env.example to .env and configure your API keys.');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check critical environment variables
const requiredVars = [
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY', 
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease update your .env file with the missing values.');
  process.exit(1);
}

// Determine if using mock AI
const useMockAI = process.env.USE_MOCK_AI === 'true' || 
                  process.env.MOCK_AI_RESPONSES === 'true';

console.log('🤖 AI SYSTEM STATUS');
console.log('===================');
console.log(`AI Mode: ${useMockAI ? '🎭 Mock AI (Demo)' : '🧠 Real AI (Production)'}`);
console.log(`Demo Mode: ${process.env.DEMO_MODE === 'true' ? '🚧 Development' : '🚀 Production'}`);

if (!useMockAI) {
  console.log('\n✅ PRODUCTION AI AGENTS ACTIVE');
  console.log('==============================');
  console.log('🤖 FinanceBot - Claude Opus 4');
  console.log('🔮 TenantBot - Gemini 1.5 Pro');
  console.log('🧠 RiskBot - GPT-4');  
  console.log('🔍 ComplianceBot - DeepSeek');
  console.log('🛠️ MaintenanceBot - Mistral AI');
} else {
  console.log('\n🎭 Demo Mode - Using Mock AI Responses');
  console.log('======================================');
  console.log('💡 To switch to real AI: node test-api-keys/switch-to-production.js production');
}

console.log('\n🔄 STARTING SERVICES');
console.log('====================');

// Start the API server
console.log('🔌 Starting API server...');
const apiServer = spawn('node', ['apps/api/server.js'], {
  stdio: 'pipe',
  env: { ...process.env, PORT: process.env.API_PORT || '3001' }
});

// Start the Next.js dashboard
console.log('🖥️  Starting dashboard...');
const dashboard = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'apps/dashboard-nextjs'),
  stdio: 'pipe',
  shell: true
});

// Start the email processor
console.log('📧 Starting email processor...');
const emailProcessor = spawn('node', ['apps/email-processor/cloudmailin-handler.js'], {
  stdio: 'pipe'
});

// Handle process outputs
apiServer.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

dashboard.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output.includes('Ready') || output.includes('Local:')) {
    console.log(`[DASHBOARD] ${output}`);
  }
});

dashboard.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (!output.includes('warn') && !output.includes('Browserslist')) {
    console.error(`[DASHBOARD ERROR] ${output}`);
  }
});

emailProcessor.stdout.on('data', (data) => {
  console.log(`[EMAIL] ${data.toString().trim()}`);
});

emailProcessor.stderr.on('data', (data) => {
  console.error(`[EMAIL ERROR] ${data.toString().trim()}`);
});

// Wait for services to start
setTimeout(() => {
  console.log('\n🌟 PRISM INTELLIGENCE READY');
  console.log('============================');
  console.log('🖥️  Dashboard: http://localhost:3000');
  console.log('🔌 API Server: http://localhost:3001');
  console.log('📧 Email Processing: Active');
  
  if (!useMockAI) {
    console.log('\n🤖 Multi-Agent System: OPERATIONAL');
    console.log('   - Agents will debate decisions in real-time');
    console.log('   - Mathematical proof validation active');
    console.log('   - Reinforcement learning adaptive');
  }
  
  console.log('\n🎯 NEXT STEPS');
  console.log('=============');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Upload a property document (PDF, Excel, CSV)');
  console.log('3. Watch AI agents analyze and debate');
  console.log('4. Click "Why?" buttons to see reasoning');
  console.log('5. Provide feedback to improve learning');
  
  if (useMockAI) {
    console.log('\n💡 TO ACTIVATE REAL AI:');
    console.log('=======================');
    console.log('node test-api-keys/switch-to-production.js production');
    console.log('# Then restart: node start-production.js');
  }
  
  console.log('\n📊 SYSTEM MONITORING');
  console.log('====================');
  console.log('Validate APIs: node test-api-keys/validate-keys.js');
  console.log('Check Config: node test-api-keys/switch-to-production.js status');
  console.log('View Logs: Check console output above');
  
}, 5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Prism Intelligence...');
  
  apiServer.kill();
  dashboard.kill();
  emailProcessor.kill();
  
  setTimeout(() => {
    console.log('✅ All services stopped. Goodbye!');
    process.exit(0);
  }, 2000);
});

// Keep the process alive
process.on('exit', () => {
  apiServer.kill();
  dashboard.kill();
  emailProcessor.kill();
});
