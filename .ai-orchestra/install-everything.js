#!/usr/bin/env node

/**
 * Complete Setup Script for AI Orchestra
 * - Installs all AI tools
 * - Configures API keys from project .env
 * - Verifies everything works
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50) + '\n');
}

// Check if command exists
function commandExists(command) {
  try {
    execSync(`${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Execute command with output
function execute(command, silent = false) {
  try {
    if (!silent) log(`Executing: ${command}`, 'blue');
    execSync(command, { stdio: silent ? 'pipe' : 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

// Load .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('⚠️  No .env file found in project root', 'yellow');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// Update orchestra.js to use .env
function updateOrchestraForEnv() {
  const orchestraPath = path.join(process.cwd(), '.ai-orchestra', 'orchestra.js');
  if (!fs.existsSync(orchestraPath)) {
    log('⚠️  Orchestra.js not found', 'yellow');
    return;
  }

  let content = fs.readFileSync(orchestraPath, 'utf8');
  
  // Add dotenv loading at the top if not present
  if (!content.includes('require(\'dotenv\')')) {
    const envLoader = `
// Load environment variables from .env file
const dotenv = require('dotenv');
const envPath = require('path').join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

`;
    content = envLoader + content;
    fs.writeFileSync(orchestraPath, content);
    log('✅ Updated orchestra.js to load .env file', 'green');
  }
}

// Check Python and pip
async function checkPython() {
  header('Checking Python Installation');
  
  const pythonCommands = ['python3', 'python'];
  let pythonCmd = null;
  
  for (const cmd of pythonCommands) {
    if (commandExists(`${cmd} --version`)) {
      pythonCmd = cmd;
      const version = execSync(`${cmd} --version`, { encoding: 'utf8' }).trim();
      log(`✅ Python found: ${version}`, 'green');
      break;
    }
  }
  
  if (!pythonCmd) {
    log('❌ Python not found!', 'red');
    log('Please install Python from https://python.org', 'yellow');
    return null;
  }
  
  // Check pip
  if (!commandExists(`${pythonCmd} -m pip --version`)) {
    log('❌ pip not found!', 'red');
    log('Installing pip...', 'yellow');
    execute(`${pythonCmd} -m ensurepip --default-pip`);
  }
  
  return pythonCmd;
}

// Install tools
async function installTools(pythonCmd) {
  header('Installing AI Tools');
  
  const tools = [
    {
      name: 'Aider',
      check: 'aider --version',
      install: `${pythonCmd} -m pip install aider-chat`,
      description: 'AI pair programming tool'
    },
    {
      name: 'dotenv',
      check: () => {
        try {
          require('dotenv');
          return true;
        } catch {
          return false;
        }
      },
      install: 'npm install dotenv',
      description: 'Environment variable loader'
    }
  ];
  
  for (const tool of tools) {
    log(`\nChecking ${tool.name}...`, 'blue');
    
    const isInstalled = typeof tool.check === 'function' 
      ? tool.check() 
      : commandExists(tool.check);
    
    if (isInstalled) {
      log(`✅ ${tool.name} already installed`, 'green');
    } else {
      log(`📦 Installing ${tool.name}...`, 'yellow');
      if (execute(tool.install)) {
        log(`✅ ${tool.name} installed successfully`, 'green');
      } else {
        log(`❌ Failed to install ${tool.name}`, 'red');
        log(`   Try manually: ${tool.install}`, 'yellow');
      }
    }
  }
}

// Verify API keys
function verifyApiKeys(env) {
  header('Checking API Keys');
  
  const requiredKeys = [
    {
      key: 'ANTHROPIC_API_KEY',
      description: 'Claude API (required for Aider)',
      pattern: /^sk-ant-/
    },
    {
      key: 'GEMINI_API_KEY',
      description: 'Google Gemini API (optional)',
      pattern: /^AIza/
    }
  ];
  
  let allKeysValid = true;
  
  requiredKeys.forEach(({ key, description, pattern }) => {
    const value = env[key];
    
    if (!value || value.includes('your-') || value.includes('xxx')) {
      log(`❌ ${key} not set`, 'red');
      log(`   ${description}`, 'yellow');
      allKeysValid = false;
    } else if (pattern && !pattern.test(value)) {
      log(`⚠️  ${key} format looks incorrect`, 'yellow');
      log(`   Current value: ${value.substring(0, 10)}...`, 'yellow');
    } else {
      log(`✅ ${key} is set`, 'green');
    }
  });
  
  if (!allKeysValid) {
    log('\n📝 Add your API keys to the .env file:', 'yellow');
    log('   ANTHROPIC_API_KEY=sk-ant-api...', 'cyan');
    log('   Get from: https://console.anthropic.com/', 'cyan');
  }
  
  return allKeysValid;
}

// Test Aider
async function testAider(env) {
  if (!env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY.includes('your-')) {
    log('⚠️  Skipping Aider test - ANTHROPIC_API_KEY not set', 'yellow');
    return;
  }
  
  header('Testing Aider');
  
  // Create a test file
  const testFile = path.join(process.cwd(), '.ai-orchestra', 'test-aider.txt');
  fs.writeFileSync(testFile, 'Hello from test file');
  
  try {
    log('Testing Aider with your API key...', 'blue');
    
    // Set environment variable temporarily
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
    
    // Test aider with a simple command
    const result = execSync('aider --no-git --yes --version', { 
      encoding: 'utf8',
      env: { ...process.env, ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY }
    });
    
    log('✅ Aider is working!', 'green');
    log(`   Version: ${result.trim()}`, 'cyan');
    
    // Clean up
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    
    return true;
  } catch (error) {
    log('❌ Aider test failed', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return false;
  }
}

// Create helper scripts
function createHelperScripts() {
  header('Creating Helper Scripts');
  
  // Update orchestra.js to use .env
  updateOrchestraForEnv();
  
  // Create enhanced batch file
  const batchContent = `@echo off
REM AI Orchestra Launcher with .env support

REM Load .env file and run orchestra
node .ai-orchestra\\orchestra.js %*
`;
  
  fs.writeFileSync('ai-orchestra.bat', batchContent);
  log('✅ Updated ai-orchestra.bat', 'green');
  
  // Create test script
  const testScript = `#!/usr/bin/env node
// Quick test script for AI Orchestra

const dotenv = require('dotenv');
dotenv.config();

console.log('\\n🧪 Testing AI Orchestra Setup\\n');

// Check API keys
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

console.log('API Keys:');
console.log(\`  ANTHROPIC_API_KEY: \${anthropicKey ? '✅ Set' : '❌ Not set'}\`);
console.log(\`  GEMINI_API_KEY: \${geminiKey ? '✅ Set' : '❌ Not set'}\`);

// Test Aider if key is available
if (anthropicKey && !anthropicKey.includes('your-')) {
  console.log('\\n🔧 Testing Aider...');
  const { execSync } = require('child_process');
  try {
    execSync('aider --version', { stdio: 'inherit' });
    console.log('✅ Aider is working!');
  } catch {
    console.log('❌ Aider test failed');
  }
}

console.log('\\n✨ Setup test complete!');
`;
  
  fs.writeFileSync('.ai-orchestra/test-setup.js', testScript);
  log('✅ Created test-setup.js', 'green');
}

// Main setup flow
async function main() {
  console.clear();
  log('🎭 AI Orchestra Complete Setup', 'cyan');
  log('======================================\n', 'cyan');
  
  // Load .env
  const env = loadEnv();
  
  // Check Python
  const pythonCmd = await checkPython();
  if (!pythonCmd) {
    log('\n❌ Setup cannot continue without Python', 'red');
    process.exit(1);
  }
  
  // Install tools
  await installTools(pythonCmd);
  
  // Verify API keys
  const keysValid = verifyApiKeys(env);
  
  // Create helper scripts
  createHelperScripts();
  
  // Test Aider if possible
  if (keysValid && env.ANTHROPIC_API_KEY) {
    await testAider(env);
  }
  
  // Final summary
  header('Setup Complete!');
  
  log('📁 AI Orchestra is installed in .ai-orchestra/', 'green');
  log('🔑 API keys will be loaded from .env file', 'green');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Add your API keys to .env file');
  console.log('2. Run: node .ai-orchestra/test-setup.js');
  console.log('3. Try: ai-orchestra feature "test feature"');
  
  console.log('\n💡 Quick Commands:');
  console.log('   ai-orchestra              - Show help');
  console.log('   ai-orchestra feature      - Add new feature');
  console.log('   ai-orchestra fix          - Fix a bug');
  console.log('   ai-orchestra test         - Generate tests');
  
  if (!keysValid) {
    console.log('\n⚠️  Important: Add your API keys to .env before using AI tools');
  }
}

// Run setup
main().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
