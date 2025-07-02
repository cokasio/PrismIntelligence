#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import logger from './apps/attachment-loop/utils/logger.js';
import { notificationService } from './apps/attachment-loop/services/notification.service.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '.env') });

/**
 * Daily Digest Cron Job
 * Runs every day at 8:00 AM to send digest emails
 */

// Configure cron time (default: 8:00 AM daily)
const CRON_SCHEDULE = process.env.DAILY_DIGEST_SCHEDULE || '0 8 * * *';
const COMPANY_IDS = (process.env.ACTIVE_COMPANY_IDS || 'default-company-id').split(',');

logger.info('🕐 Starting Daily Digest Cron Service');
logger.info(`   Schedule: ${CRON_SCHEDULE}`);
logger.info(`   Companies: ${COMPANY_IDS.join(', ')}`);

// Schedule the daily digest
const task = cron.schedule(CRON_SCHEDULE, async () => {
  logger.info('📧 Running daily digest job...');
  
  try {
    for (const companyId of COMPANY_IDS) {
      logger.info(`   Processing company: ${companyId}`);
      await notificationService.sendDailyDigest(companyId.trim());
    }
    logger.info('✅ Daily digest completed successfully');
  } catch (error) {
    logger.error('❌ Daily digest failed:', error);
  }
}, {
  scheduled: true,
  timezone: process.env.TZ || 'America/New_York'
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, stopping cron job...');
  task.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, stopping cron job...');
  task.stop();
  process.exit(0);
});

// Run immediately if --now flag is passed
if (process.argv.includes('--now')) {
  logger.info('🏃 Running daily digest immediately...');
  (async () => {
    try {
      for (const companyId of COMPANY_IDS) {
        await notificationService.sendDailyDigest(companyId.trim());
      }
      logger.info('✅ Immediate digest completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Immediate digest failed:', error);
      process.exit(1);
    }
  })();
} else {
  logger.info('✅ Daily digest cron job started');
  logger.info('   Next run will be at 8:00 AM');
  logger.info('   Use --now flag to run immediately');
}
