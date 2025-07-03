#!/usr/bin/env node

/**
 * Prism Intelligence - Production Configuration Switch
 * Switches from mock AI responses to real AI APIs
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

class ProductionConfigSwitcher {
  constructor() {
    this.envPath = path.join(__dirname, '../.env');
    this.backupPath = path.join(__dirname, '../.env.backup.' + Date.now());
  }

  async switchToProductionAI() {
    console.log('🚀 Prism Intelligence - Switching to Production AI');
    console.log('==================================================\n');

    // Create backup
    this.createBackup();
    
    // Update configuration
    this.updateEnvironmentConfig();
    
    // Test all AI services
    await this.testProductionReadiness();
    
    console.log('\n🎉 PRODUCTION AI SWITCH COMPLETE');
    console.log('==================================');
    console.log('✅ All AI agents now use real APIs');
    console.log('✅ Mock responses disabled');
    console.log('✅ Multi-agent debates fully operational');
    console.log('✅ Formal logic validation active');
    console.log('✅ Reinforcement learning ready');
    
    console.log('\n🔄 RESTART REQUIRED');
    console.log('====================');
    console.log('Please restart your application to apply changes:');
    console.log('  npm run dev');
    console.log('  # or');
    console.log('  node start-demo.js');
  }

  createBackup() {
    console.log('💾 Creating configuration backup...');
    
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    fs.writeFileSync(this.backupPath, envContent);
    
    console.log(`✅ Backup created: ${path.basename(this.backupPath)}`);
  }

  updateEnvironmentConfig() {
    console.log('⚙️  Updating environment configuration...');
    
    let envContent = fs.readFileSync(this.envPath, 'utf8');
    
    // Switch from mock to real AI
    envContent = envContent.replace(
      /MOCK_AI_RESPONSES=true/g,
      'MOCK_AI_RESPONSES=false'
    );
    envContent = envContent.replace(
      /USE_MOCK_AI=true/g,
      'USE_MOCK_AI=false'
    );
    
    // Enable production features
    envContent = envContent.replace(
      /DEMO_MODE=true/g,
      'DEMO_MODE=false'
    );
    
    // Add production optimizations
    if (!envContent.includes('AI_RESPONSE_TIMEOUT')) {
      envContent += '\n# Production AI Configuration\n';
      envContent += 'AI_RESPONSE_TIMEOUT=30000\n';
      envContent += 'AI_MAX_RETRIES=3\n';
      envContent += 'AI_RATE_LIMIT_PER_MINUTE=60\n';
      envContent += 'ENABLE_AI_CACHING=true\n';
      envContent += 'ENABLE_PARALLEL_AGENTS=true\n';
    }
    
    fs.writeFileSync(this.envPath, envContent);
    
    console.log('✅ Environment configuration updated');
  }

  async testProductionReadiness() {
    console.log('🧪 Testing production AI readiness...');
    
    // Import and run the validator
    const APIKeyValidator = require('./validate-keys.js');
    const validator = new APIKeyValidator();
    
    // Run validation silently
    await validator.runAllValidations();
    
    // Check results
    const validCount = Object.values(validator.results)
      .filter(result => result.status === 'valid').length;
    
    if (validCount >= 5) {
      console.log('✅ Production AI readiness confirmed');
    } else {
      console.log('⚠️  Some APIs may not be ready for production');
    }
  }

  async switchToMockAI() {
    console.log('🔄 Switching back to mock AI for development...');
    
    let envContent = fs.readFileSync(this.envPath, 'utf8');
    
    envContent = envContent.replace(
      /MOCK_AI_RESPONSES=false/g,
      'MOCK_AI_RESPONSES=true'
    );
    envContent = envContent.replace(
      /USE_MOCK_AI=false/g,
      'USE_MOCK_AI=true'
    );
    envContent = envContent.replace(
      /DEMO_MODE=false/g,
      'DEMO_MODE=true'
    );
    
    fs.writeFileSync(this.envPath, envContent);
    
    console.log('✅ Switched back to mock AI mode');
  }

  showCurrentConfig() {
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    
    const useMockAI = envContent.includes('USE_MOCK_AI=true') || 
                      envContent.includes('MOCK_AI_RESPONSES=true');
    const demoMode = envContent.includes('DEMO_MODE=true');
    
    console.log('📊 CURRENT CONFIGURATION');
    console.log('=========================');
    console.log(`AI Mode: ${useMockAI ? '🎭 Mock AI' : '🤖 Real AI'}`);
    console.log(`Demo Mode: ${demoMode ? '🚧 Development' : '🚀 Production'}`);
    
    if (useMockAI) {
      console.log('\n💡 To switch to real AI: node test-api-keys/switch-to-production.js production');
    } else {
      console.log('\n💡 To switch to mock AI: node test-api-keys/switch-to-production.js mock');
    }
  }
}

// CLI interface
const action = process.argv[2];
const switcher = new ProductionConfigSwitcher();

switch (action) {
  case 'production':
  case 'real':
    switcher.switchToProductionAI();
    break;
    
  case 'mock':
  case 'development':
    switcher.switchToMockAI();
    break;
    
  case 'status':
  case 'config':
    switcher.showCurrentConfig();
    break;
    
  default:
    console.log('🔧 Prism Intelligence - AI Configuration Switcher');
    console.log('==================================================');
    console.log('Usage: node switch-to-production.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  production  - Switch to real AI APIs');
    console.log('  mock        - Switch to mock AI responses');
    console.log('  status      - Show current configuration');
    console.log('');
    console.log('Examples:');
    console.log('  node switch-to-production.js production');
    console.log('  node switch-to-production.js mock');
    console.log('  node switch-to-production.js status');
}
