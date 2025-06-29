#!/usr/bin/env node

import { attachmentIntelligenceLoop } from './services/attachmentIntelligenceLoop';
import logger from './utils/logger';
import path from 'path';
import fs from 'fs/promises';

/**
 * Attachment Intelligence Loop Starter
 * 
 * This script starts the file watcher that monitors the incoming folder
 * and processes property management documents using AI.
 */

async function checkEnvironment(): Promise<boolean> {
  logger.info('🔍 Checking environment configuration...');
  
  const requiredEnvVars = [
    'ANTHROPIC_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
  ];
  
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  // Optional but recommended
  const recommendedVars = ['GEMINI_API_KEY'];
  const missingRecommended: string[] = [];
  
  for (const envVar of recommendedVars) {
    if (!process.env[envVar]) {
      missingRecommended.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      logger.error(`   - ${varName}`);
    });
    logger.error('');
    logger.error('Please set these in your .env file or environment.');
    return false;
  }
  
  if (missingRecommended.length > 0) {
    logger.warn('⚠️ Missing recommended environment variables:');
    missingRecommended.forEach(varName => {
      logger.warn(`   - ${varName}`);
    });
    logger.warn('The system will work but with limited functionality.');
    logger.warn('');
  }
  
  logger.info('✅ Environment configuration looks good!');
  return true;
}

async function checkDirectories(): Promise<void> {
  logger.info('📁 Checking directory structure...');
  
  const requiredDirs = [
    'C:/Dev/PrismIntelligence/incoming',
    'C:/Dev/PrismIntelligence/incoming/reports',
    'C:/Dev/PrismIntelligence/incoming/financial',
    'C:/Dev/PrismIntelligence/incoming/leases',
    'C:/Dev/PrismIntelligence/incoming/maintenance',
    'C:/Dev/PrismIntelligence/processed'
  ];
  
  for (const dir of requiredDirs) {
    try {
      await fs.access(dir);
      logger.info(`✅ ${dir}`);
    } catch {
      logger.info(`📁 Creating ${dir}...`);
      await fs.mkdir(dir, { recursive: true });
      logger.info(`✅ Created ${dir}`);
    }
  }
  
  // Create error directory if it doesn't exist
  try {
    await fs.mkdir('C:/Dev/PrismIntelligence/errors', { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function displayWelcomeMessage(): Promise<void> {
  const welcomeMessage = `
🎉 ============================================
    PRISM INTELLIGENCE 
    Attachment Intelligence Loop
============================================

🧠 AI-Powered Property Document Processing
   - Gemini AI for document classification
   - Claude AI for business intelligence
   - Automated insights and recommendations

📂 Watching Directories:
   📊 C:/Dev/PrismIntelligence/incoming/
   💰 C:/Dev/PrismIntelligence/incoming/financial/
   📋 C:/Dev/PrismIntelligence/incoming/reports/
   📄 C:/Dev/PrismIntelligence/incoming/leases/
   🔧 C:/Dev/PrismIntelligence/incoming/maintenance/

🚀 How to Use:
   1. Drop property management files in the incoming folders
   2. AI automatically classifies and processes documents
   3. Structured data and insights are stored in database
   4. Review processed documents and action items

⚡ Ready to transform property management with AI!
============================================
`;
  
  console.log(welcomeMessage);
}

async function displayInstructions(): Promise<void> {
  logger.info('');
  logger.info('📋 Quick Start Instructions:');
  logger.info('');
  logger.info('1. 📁 Drop Files: Place property management documents in:');
  logger.info('   • C:/Dev/PrismIntelligence/incoming/financial/     (P&L, Balance Sheets)');
  logger.info('   • C:/Dev/PrismIntelligence/incoming/reports/       (Rent Rolls, Summaries)');
  logger.info('   • C:/Dev/PrismIntelligence/incoming/leases/        (Lease Agreements)');
  logger.info('   • C:/Dev/PrismIntelligence/incoming/maintenance/   (Work Orders, Invoices)');
  logger.info('');
  logger.info('2. 🤖 AI Processing: Watch the logs as AI:');
  logger.info('   • Classifies document types automatically');
  logger.info('   • Extracts structured data from files');
  logger.info('   • Generates business insights and trends');
  logger.info('   • Creates actionable recommendations');
  logger.info('');
  logger.info('3. 📊 Review Results: Processed documents include:');
  logger.info('   • Executive summaries of performance');
  logger.info('   • Key findings and trend analysis');
  logger.info('   • Risk identification and opportunities');
  logger.info('   • Prioritized action items with deadlines');
  logger.info('');
  logger.info('4. 💾 Data Storage: All results stored in Supabase with:');
  logger.info('   • Full audit trail and processing logs');
  logger.info('   • Search and filtering capabilities');
  logger.info('   • Performance analytics and reporting');
  logger.info('');
  logger.info('🎯 Pro Tip: Start with a sample financial report or rent roll!');
  logger.info('');
}

async function main(): Promise<void> {
  try {
    // Display welcome message
    await displayWelcomeMessage();
    
    // Check environment
    const envOk = await checkEnvironment();
    if (!envOk) {
      process.exit(1);
    }
    
    // Check and create directories
    await checkDirectories();
    
    // Display instructions
    await displayInstructions();
    
    // Start the attachment intelligence loop
    logger.info('🚀 Starting Attachment Intelligence Loop...');
    await attachmentIntelligenceLoop.start();
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('');
      logger.info('🛑 Received shutdown signal...');
      await attachmentIntelligenceLoop.stop();
      logger.info('👋 Attachment Intelligence Loop stopped gracefully');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Received termination signal...');
      await attachmentIntelligenceLoop.stop();
      logger.info('👋 Attachment Intelligence Loop stopped gracefully');
      process.exit(0);
    });
    
    // Keep the process running
    logger.info('');
    logger.info('✅ Attachment Intelligence Loop is running!');
    logger.info('📁 Drop files in the incoming folders to see AI processing in action');
    logger.info('🛑 Press Ctrl+C to stop');
    logger.info('');
    
    // Keep alive
    setInterval(() => {
      // This just keeps the process running
      // Real work is done by the file watcher
    }, 60000);
    
  } catch (error) {
    logger.error('❌ Failed to start Attachment Intelligence Loop:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main().catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
