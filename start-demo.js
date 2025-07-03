#!/usr/bin/env node

/**
 * Prism Intelligence - Demo Startup Script
 * One command to rule them all
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

console.log(chalk.blue.bold(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        PRISM INTELLIGENCE DEMO SYSTEM             ║
║        The World's First Transparent AI           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`));

// Check for required environment variables
function checkEnvironment() {
  console.log(chalk.yellow('🔍 Checking environment...'));
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log(chalk.red('❌ .env file not found!'));
    console.log(chalk.yellow('Creating .env from template...'));
    
    const envContent = `
# Prism Intelligence Environment Configuration
# Copy this file to .env and fill in your values

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# AI Services (Optional for demo - uses mock data)
ANTHROPIC_API_KEY=your-claude-api-key
GOOGLE_AI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
MISTRAL_API_KEY=your-mistral-api-key

# CloudMailin Configuration
CLOUDMAILIN_USERNAME=cokasiotesting
CLOUDMAILIN_ID_1=7d5f948c506dea73
CLOUDMAILIN_ID_2=4236dea731b2f948
CLOUDMAILIN_SMTP_HOST=smtp.cloudmla.net

# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Demo Mode
USE_MOCK_AI=true
DEMO_MODE=true
`;
    
    fs.writeFileSync(envPath, envContent.trim());
    console.log(chalk.green('✅ Created .env file with demo defaults'));
  }
  
  // Load environment variables
  require('dotenv').config({ path: envPath });
  
  // Check critical variables
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && process.env.DEMO_MODE !== 'true') {
    console.log(chalk.red(`❌ Missing required environment variables: ${missing.join(', ')}`));
    console.log(chalk.yellow('💡 Set DEMO_MODE=true to run without external services'));
    return false;
  }
  
  console.log(chalk.green('✅ Environment configured'));
  return true;
}

// Install dependencies if needed
function checkDependencies() {
  console.log(chalk.yellow('📦 Checking dependencies...'));
  
  const packagesNeedingInstall = [];
  
  // Check API dependencies
  const apiPackageJson = path.join(__dirname, 'apps/api/package.json');
  const apiNodeModules = path.join(__dirname, 'apps/api/node_modules');
  if (fs.existsSync(apiPackageJson) && !fs.existsSync(apiNodeModules)) {
    packagesNeedingInstall.push('apps/api');
  }
  
  // Check dashboard dependencies
  const dashboardPackageJson = path.join(__dirname, 'apps/dashboard-nextjs/package.json');
  const dashboardNodeModules = path.join(__dirname, 'apps/dashboard-nextjs/node_modules');
  if (fs.existsSync(dashboardPackageJson) && !fs.existsSync(dashboardNodeModules)) {
    packagesNeedingInstall.push('apps/dashboard-nextjs');
  }
  
  if (packagesNeedingInstall.length > 0) {
    console.log(chalk.yellow(`📦 Installing dependencies for: ${packagesNeedingInstall.join(', ')}`));
    
    packagesNeedingInstall.forEach(pkg => {
      console.log(chalk.blue(`Installing ${pkg}...`));
      const install = spawn('npm', ['install'], {
        cwd: path.join(__dirname, pkg),
        stdio: 'inherit',
        shell: true
      });
      
      install.on('close', (code) => {
        if (code !== 0) {
          console.log(chalk.red(`❌ Failed to install dependencies for ${pkg}`));
          process.exit(1);
        }
      });
    });
  } else {
    console.log(chalk.green('✅ All dependencies installed'));
  }
  
  return true;
}

// Start the API server
function startAPIServer() {
  console.log(chalk.yellow('🚀 Starting API server...'));
  
  const api = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'apps/api'),
    stdio: 'pipe',
    shell: true
  });
  
  api.stdout.on('data', (data) => {
    console.log(chalk.cyan('[API] ') + data.toString().trim());
  });
  
  api.stderr.on('data', (data) => {
    console.error(chalk.red('[API ERROR] ') + data.toString().trim());
  });
  
  api.on('error', (error) => {
    console.error(chalk.red('❌ Failed to start API server:'), error);
    process.exit(1);
  });
  
  return api;
}

// Start the Next.js dashboard
function startDashboard() {
  console.log(chalk.yellow('🎨 Starting dashboard...'));
  
  const dashboard = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'apps/dashboard-nextjs'),
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, PORT: '3001' }
  });
  
  dashboard.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(chalk.magenta('[DASHBOARD] ') + output);
    
    // Detect when Next.js is ready
    if (output.includes('Ready') || output.includes('started server on')) {
      setTimeout(() => {
        console.log(chalk.green.bold(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║    🎉 PRISM INTELLIGENCE IS READY! 🎉            ║
║                                                   ║
║    Dashboard: http://localhost:3001               ║
║    Demo: http://localhost:3001/demo               ║
║    API: http://localhost:3000                     ║
║                                                   ║
║    Press Ctrl+C to stop all services              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
        `));
        
        // Open browser automatically
        const platform = process.platform;
        const openCommand = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
        spawn(openCommand, ['http://localhost:3001/demo'], { shell: true });
      }, 2000);
    }
  });
  
  dashboard.stderr.on('data', (data) => {
    console.error(chalk.red('[DASHBOARD ERROR] ') + data.toString().trim());
  });
  
  dashboard.on('error', (error) => {
    console.error(chalk.red('❌ Failed to start dashboard:'), error);
    process.exit(1);
  });
  
  return dashboard;
}

// Main startup sequence
async function main() {
  // Step 1: Check environment
  if (!checkEnvironment()) {
    console.log(chalk.red('❌ Environment check failed. Please configure .env file.'));
    process.exit(1);
  }
  
  // Step 2: Check dependencies
  checkDependencies();
  
  // Wait a moment for any installations
  setTimeout(() => {
    // Step 3: Start services
    const apiProcess = startAPIServer();
    
    // Wait for API to be ready before starting dashboard
    setTimeout(() => {
      const dashboardProcess = startDashboard();
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down services...'));
        apiProcess.kill();
        dashboardProcess.kill();
        process.exit(0);
      });
    }, 3000);
  }, 2000);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error(chalk.red('❌ Startup failed:'), error);
  process.exit(1);
});
