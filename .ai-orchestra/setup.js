#!/usr/bin/env node

/**
 * Setup script for AI Orchestra
 * Checks for required tools and provides installation instructions
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎭 AI Orchestra Setup Check\n');

const tools = [
  {
    name: 'Node.js',
    check: 'node --version',
    install: 'Download from https://nodejs.org/',
    required: true
  },
  {
    name: 'Aider',
    check: 'aider --version',
    install: 'pip install aider-chat',
    required: false
  },
  {
    name: 'Claude Code',
    check: 'claude-code --version',
    install: 'See Anthropic documentation',
    required: false
  },
  {
    name: 'Gemini CLI',
    check: 'gemini --version',
    install: 'npm install -g @google/gemini-cli',
    required: false
  }
];

const checkTool = (tool) => {
  try {
    execSync(tool.check, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Check environment variables
const envVars = [
  { name: 'ANTHROPIC_API_KEY', required: false },
  { name: 'GEMINI_API_KEY', required: false }
];

console.log('Checking tools...\n');

let allGood = true;

tools.forEach(tool => {
  const installed = checkTool(tool);
  const status = installed ? '✅' : (tool.required ? '❌' : '⚠️ ');
  console.log(`${status} ${tool.name.padEnd(15)} ${installed ? 'Installed' : `Not found - ${tool.install}`}`);
  
  if (tool.required && !installed) {
    allGood = false;
  }
});

console.log('\nChecking API keys...\n');

envVars.forEach(env => {
  const isSet = !!process.env[env.name];
  const status = isSet ? '✅' : '⚠️ ';
  console.log(`${status} ${env.name.padEnd(20)} ${isSet ? 'Set' : 'Not set'}`);
});

console.log('\nProject Structure...\n');

const dirs = [
  'src/services',
  'src/api',
  'tests',
  '.ai-orchestra'
];

dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}`);
});

if (allGood) {
  console.log('\n✅ AI Orchestra is ready to use!');
  console.log('\nTry: node .ai-orchestra/orchestra.js');
} else {
  console.log('\n⚠️  Some required tools are missing. Please install them first.');
}

console.log('\n💡 Tip: AI Orchestra works best with all tools installed,');
console.log('but can adapt to use only the tools you have available.');
