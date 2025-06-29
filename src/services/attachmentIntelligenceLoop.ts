import { watchFile, FSWatcher } from 'fs';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger';
import { GeminiClassifier } from './geminiClassifier';
import { ClaudeAnalyzer } from './claudeAnalyzer';
import { DatabaseService } from '../database/supabase';
import { FileProcessor } from './fileProcessor';

export interface FileClassification {
  documentType: 'financial' | 'rent_roll' | 'lease' | 'maintenance' | 'unknown';
  confidence: number;
  propertyId?: string;
  propertyName?: string;
  reportPeriod?: {
    start: string;
    end: string;
  };
  suggestedParser: string;
  metadata: any;
}

export interface ProcessedDocument {
  id: string;
  filename: string;
  filepath: string;
  classification: FileClassification;
  extractedData: any;
  insights: any;
  actionItems: any[];
  processingTime: number;
  createdAt: Date;
}

export class AttachmentIntelligenceLoop {
  private watcher: chokidar.FSWatcher | null = null;
  private geminiClassifier: GeminiClassifier;
  private claudeAnalyzer: ClaudeAnalyzer;
  private dbService: DatabaseService;
  private fileProcessor: FileProcessor;
  private processingQueue: string[] = [];
  private isCurrentlyProcessing = false;

  constructor() {
    this.geminiClassifier = new GeminiClassifier();
    this.claudeAnalyzer = new ClaudeAnalyzer();
    this.dbService = new DatabaseService();
    this.fileProcessor = new FileProcessor();
  }

  /**
   * Start the Attachment Intelligence Loop
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Attachment Intelligence Loop...');
      
      // Initialize services
      await this.initializeServices();
      
      // Start file watcher
      await this.startFileWatcher();
      
      logger.info('✅ Attachment Intelligence Loop is running!');
      logger.info('📂 Watching directories:');
      logger.info('   - C:/Dev/PrismIntelligence/incoming/');
      logger.info('   - C:/Dev/PrismIntelligence/incoming/reports/');
      logger.info('   - C:/Dev/PrismIntelligence/incoming/financial/');
      logger.info('   - C:/Dev/PrismIntelligence/incoming/leases/');
      logger.info('   - C:/Dev/PrismIntelligence/incoming/maintenance/');
      
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
   * Initialize all required services
   */
  private async initializeServices(): Promise<void> {
    logger.info('🔧 Initializing services...');
    
    // Test database connection
    await this.dbService.testConnection();
    logger.info('✅ Database connection verified');
    
    // Initialize AI services
    await this.geminiClassifier.initialize();
    logger.info('✅ Gemini classifier initialized');
    
    await this.claudeAnalyzer.initialize();
    logger.info('✅ Claude analyzer initialized');
    
    // Ensure required tables exist
    await this.ensureDatabaseSchema();
    logger.info('✅ Database schema verified');
  }

  /**
   * Start the file watcher using chokidar
   */
  private async startFileWatcher(): Promise<void> {
    const watchPaths = [
      'C:/Dev/PrismIntelligence/incoming/**/*'
    ];

    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /[\/\\]\./,        // Ignore dotfiles
        /\.tmp$/,          // Ignore temp files
        /\.processing$/,   // Ignore files being processed
        '**/processed/**'  // Ignore processed folder
      ],
      persistent: true,
      usePolling: false,
      interval: 1000,
      depth: 3
    });

    // File added
    this.watcher.on('add', async (filePath: string) => {
      await this.handleFileEvent('add', filePath);
    });

    // File changed
    this.watcher.on('change', async (filePath: string) => {
      await this.handleFileEvent('change', filePath);
    });

    // Error handling
    this.watcher.on('error', (error: Error) => {
      logger.error('🚨 File watcher error:', error);
    });

    logger.info('👀 File watcher started successfully');
  }

  /**
   * Handle file system events
   */
  private async handleFileEvent(event: string, filePath: string): Promise<void> {
    const normalizedPath = path.normalize(filePath);
    const filename = path.basename(normalizedPath);
    
    logger.info(`📁 File ${event}: ${filename}`);

    // Skip if already in the queue
    if (this.processingQueue.includes(normalizedPath)) {
      logger.debug(`⏳ Already in queue: ${filename}`);
      return;
    }

    // Skip directories
    try {
      const stat = await fs.stat(normalizedPath);
      if (stat.isDirectory()) {
        return;
      }
    } catch (error) {
      logger.warn(`⚠️ Could not stat file: ${filename}`, error);
      return;
    }

    // Add to the queue
    this.processingQueue.push(normalizedPath);
    this.startProcessing();
  }

  /**
   * Start processing files from the queue
   */
  private async startProcessing(): Promise<void> {
    if (this.isCurrentlyProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isCurrentlyProcessing = true;
    const filePath = this.processingQueue.shift();

    if (filePath) {
      await this.processFile(filePath);
    }

    this.isCurrentlyProcessing = false;
    this.startProcessing();
  }

  /**
   * Process a single file through the intelligence loop
   */
  private async processFile(filePath: string): Promise<void> {
    const filename = path.basename(filePath);
    const startTime = Date.now();
    
    try {
      logger.info(`🔄 Processing: ${filename}`);

      // Step 1: Wait for file to be fully written (avoid partial reads)
      await this.waitForFileStability(filePath);

      // Step 2: Classify the document using Gemini
      logger.info(`🧠 Classifying: ${filename}`);
      const classification = await this.geminiClassifier.classifyDocument(filePath);
      logger.info(`📋 Classification: ${classification.documentType} (${Math.round(classification.confidence * 100)}% confidence)`);

      // Step 3: Extract data using appropriate parser
      logger.info(`⚙️ Extracting data: ${filename}`);
      const extractedData = await this.fileProcessor.extractData(filePath, classification);

      // Step 4: Generate insights using Claude
      logger.info(`💡 Generating insights: ${filename}`);
      const insights = await this.claudeAnalyzer.generateInsights(extractedData, classification);

      // Step 5: Store in database
      const processedDocument: ProcessedDocument = {
        id: crypto.randomUUID(),
        filename,
        filepath: filePath,
        classification,
        extractedData,
        insights: insights.insights,
        actionItems: insights.actionItems,
        processingTime: Date.now() - startTime,
        createdAt: new Date()
      };

      await this.dbService.storeProcessedDocument(processedDocument);
      logger.info(`💾 Stored in database: ${filename}`);

      // Step 6: Move to processed folder
      await this.archiveProcessedFile(filePath, processedDocument);

      // Step 7: Generate summary report
      const summary = this.generateProcessingSummary(processedDocument);
      logger.info(`📊 Processing Summary for ${filename}:`);
      logger.info(summary);

      logger.info(`✅ Successfully processed: ${filename} (${processedDocument.processingTime}ms)`);

    } catch (error) {
      logger.error(`❌ Failed to process ${filename}:`, error);
      
      // Store error information
      await this.handleProcessingError(filePath, error as Error);
      
    }
  }

  /**
   * Wait for file to be fully written (avoid reading partial files)
   */
  private async waitForFileStability(filePath: string, maxWaitTime = 10000): Promise<void> {
    const startTime = Date.now();
    let lastSize = 0;
    let stableCount = 0;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const stat = await fs.stat(filePath);
        const currentSize = stat.size;

        if (currentSize === lastSize) {
          stableCount++;
          if (stableCount >= 3) { // File size stable for 3 checks
            return;
          }
        } else {
          stableCount = 0;
          lastSize = currentSize;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // File might be locked, wait a bit more
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logger.warn(`⚠️ File may not be fully written: ${path.basename(filePath)}`);
  }

  /**
   * Move processed file to archive folder
   */
  private async archiveProcessedFile(originalPath: string, document: ProcessedDocument): Promise<void> {
    const filename = path.basename(originalPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveFilename = `${timestamp}_${filename}`;
    const archivePath = path.join('C:/Dev/PrismIntelligence/processed', archiveFilename);

    try {
      await fs.rename(originalPath, archivePath);
      logger.info(`📦 Archived: ${filename} → ${archiveFilename}`);
    } catch (error) {
      logger.warn(`⚠️ Could not archive file ${filename}:`, error);
    }
  }

  /**
   * Generate a human-readable processing summary
   */
  private generateProcessingSummary(document: ProcessedDocument): string {
    const { classification, insights, actionItems, processingTime } = document;
    
    let summary = `
📄 Document: ${document.filename}
📋 Type: ${classification.documentType.toUpperCase()}
🎯 Confidence: ${Math.round(classification.confidence * 100)}%
⏱️  Processing Time: ${processingTime}ms

💡 Key Insights:
${insights.summary || 'No summary available'}

🎯 Action Items:
${actionItems.map((item, idx) => `${idx + 1}. ${item.description}`).join('\n') || 'No action items generated'}

📊 Data Extracted:
- Records: ${extractedData?.records?.length || 0}
- Categories: ${Object.keys(extractedData?.categories || {}).length}
`;

    if (classification.propertyName) {
      summary += `🏢 Property: ${classification.propertyName}\n`;
    }

    if (classification.reportPeriod) {
      summary += `📅 Period: ${classification.reportPeriod.start} to ${classification.reportPeriod.end}\n`;
    }

    return summary;
  }

  /**
   * Handle processing errors
   */
  private async handleProcessingError(filePath: string, error: Error): Promise<void> {
    const filename = path.basename(filePath);
    
    try {
      // Store error in database
      await this.dbService.storeProcessingError({
        filename,
        filepath: filePath,
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
      });

      // Move to error folder for manual review
      const errorPath = path.join('C:/Dev/PrismIntelligence/errors', filename);
      await fs.mkdir(path.dirname(errorPath), { recursive: true });
      await fs.rename(filePath, errorPath);
      
      logger.info(`🚨 Moved failed file to errors folder: ${filename}`);
      
    } catch (archiveError) {
      logger.error(`❌ Could not handle processing error for ${filename}:`, archiveError);
    }
  }

  /**
   * Ensure database schema exists
   */
  private async ensureDatabaseSchema(): Promise<void> {
    // This will be implemented by the DatabaseService
    await this.dbService.ensureSchema();
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<any> {
    return await this.dbService.getProcessingStats();
  }

  /**
   * Get recently processed documents
   */
  async getRecentDocuments(limit = 10): Promise<ProcessedDocument[]> {
    return await this.dbService.getRecentDocuments(limit);
  }
}

// Export singleton instance
export const attachmentIntelligenceLoop = new AttachmentIntelligenceLoop();
