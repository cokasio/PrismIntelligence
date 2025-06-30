import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import logger from '../utils/logger';

export class AttachmentIntelligenceLoop {
  private watcher: FSWatcher | null = null;

  /**
   * Start the Attachment Intelligence Loop
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Attachment Intelligence Loop...');
      
      // Start file watcher
      await this.startFileWatcher();
      
      logger.info('✅ Attachment Intelligence Loop is running!');
      
    } catch (error) {
      logger.error('❌ Failed to start Attachment Intelligence Loop:', error);
      throw error;
    }
  }

  /**
   * Stop the file watcher
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      logger.info('🛑 Attachment Intelligence Loop stopped');
    }
  }

  /**
   * Start the file watcher using chokidar
   */
  private async startFileWatcher(): Promise<void> {
    // Use absolute path to ensure we're watching the right directory
    const incomingPath = 'C:\\Dev\\PrismIntelligence\\incoming';
    
    logger.info(`🔍 Current working directory: ${process.cwd()}`);
    logger.info(`🔍 Watching path: ${incomingPath}`);

    this.watcher = chokidar.watch(incomingPath, {
      ignored: [
        /[\/\\]\./,        // Ignore dotfiles
        /\.tmp$/,          // Ignore temp files
        /\.processing$/,   // Ignore files being processed
      ],
      persistent: true,
      usePolling: true,     // Force polling for Windows compatibility
      interval: 500,        // Check every 500ms
      depth: 2
    });

    // File added
    this.watcher.on('add', async (filePath: string) => {
      logger.info(`🎉 NEW FILE DETECTED: ${path.basename(filePath)}`);
      logger.info(`📍 Full path: ${filePath}`);
      await this.processFile(filePath);
    });

    // File changed
    this.watcher.on('change', async (filePath: string) => {
      logger.info(`📝 FILE CHANGED: ${path.basename(filePath)}`);
      logger.info(`📍 Full path: ${filePath}`);
      await this.processFile(filePath);
    });

    // Ready event
    this.watcher.on('ready', () => {
      logger.info('👀 File watcher is ready and scanning for files...');
      logger.info('📁 Try copying a file to the incoming directory to test!');
    });

    // Error handling
    this.watcher.on('error', (error: unknown) => {
      logger.error('🚨 File watcher error:', error);
    });

    logger.info('👀 File watcher started successfully');
  }

  /**
   * Process a detected file
   */
  private async processFile(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      logger.info(`🧠 Starting AI processing for: ${fileName}`);
      
      // Simulate AI processing with realistic timing
      logger.info('🔍 [Gemini] Analyzing document structure...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('🧠 [Claude] Processing business intelligence...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate results based on file type
      if (fileName.includes('financial')) {
        logger.info('💰 [INSIGHTS] Financial Report Analysis:');
        logger.info('   📊 NOI trend: +5.2% vs last month');
        logger.info('   ⚠️  Utility costs up 15% - investigate');
        logger.info('   💡 Rent optimization opportunity: $2.4M potential');
      } else if (fileName.includes('maintenance')) {
        logger.info('🔧 [INSIGHTS] Maintenance Report Analysis:');
        logger.info('   🏢 HVAC needs attention at 3 properties');
        logger.info('   💰 Preventive maintenance could save $15K');
        logger.info('   📈 Response times improved 20%');
      } else {
        logger.info('📋 [INSIGHTS] General Report Analysis:');
        logger.info('   📊 Data processed successfully');
        logger.info('   💡 Trends identified and flagged');
      }
      
      logger.info('✅ AI processing complete in 3.2 seconds!');
      logger.info('📧 Insights would be emailed to property manager');
      
    } catch (error) {
      logger.error('❌ Error processing file:', error);
    }
  }
}

// Export singleton instance
export const attachmentIntelligenceLoop = new AttachmentIntelligenceLoop();
