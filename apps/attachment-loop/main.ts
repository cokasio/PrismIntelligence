#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
config({ path: path.join(__dirname, '../../.env') });

import { attachmentIntelligenceLoop } from './services/attachmentIntelligenceLoop';
import logger from './utils/logger';
import fs from 'fs/promises';
import { pathToFileURL } from 'url';

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
  
  if (missingVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missingVars.forEach(envVar => {
      logger.error(`   - ${envVar}`);
    });
    logger.error('');
    logger.error('Please add these to your .env file in the project root.');
    logger.error('You can copy .env.example to .env and fill in the values.');
    return false;
  }
  
  logger.info('✅ Environment configuration looks good!');
  return true;
}

async function checkDirectories(): Promise<boolean> {
  logger.info('📁 Checking required directories...');
  
  const requiredDirs = [
    '../../incoming',
    '../../processed',
    '../../errors',
    '../../logs'
  ];
  
  let allDirsExist = true;
  
  for (const dir of requiredDirs) {
    try {
      await fs.access(dir);
      logger.info(`   ✅ ${dir} exists`);
    } catch (error) {
      logger.info(`   📁 Creating ${dir}...`);
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`   ✅ Created ${dir}`);
      } catch (createError) {
        logger.error(`   ❌ Failed to create ${dir}:`, createError);
        allDirsExist = false;
      }
    }
  }
  
  return allDirsExist;
}

async function main(): Promise<void> {
  logger.info('');
  logger.info('🧠 Starting Prism Intelligence - Attachment Loop');
  logger.info('==========================================');
  logger.info('');
  
  try {
    // Check environment
    const envOk = await checkEnvironment();
    if (!envOk) {
      process.exit(1);
    }
    
    // Check directories
    const dirsOk = await checkDirectories();
    if (!dirsOk) {
      logger.error('❌ Directory setup failed');
      process.exit(1);
    }
    
    // Start the attachment intelligence loop
    logger.info('🚀 Starting attachment intelligence loop...');
    await attachmentIntelligenceLoop.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Received termination signal...');
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
    logger.error('💥 Failed to start attachment intelligence loop:', error);
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

// Start the application (ES module equivalent of require.main === module)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
