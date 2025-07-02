import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger';
import { documentParser } from './document-parser.service';
import { geminiService } from './ai/gemini.service';
import { claudeService } from './ai/claude.service';
import { taskDatabase } from './database/task-database.service';
import { notificationService } from './notification.service';

export class AttachmentIntelligenceLoop {
  private watcher: FSWatcher | null = null;
  private processingFiles = new Set<string>();

  /**
   * Start the Attachment Intelligence Loop
   */
  async start(): Promise<void> {
    try {
      logger.info('🚀 Starting Attachment Intelligence Loop...');
      
      // Verify AI services are configured
      await this.verifyAIServices();
      
      // Start file watcher
      await this.startFileWatcher();
      
      logger.info('✅ Attachment Intelligence Loop is running!');
      
    } catch (error) {
      logger.error('❌ Failed to start Attachment Intelligence Loop:', error);
      throw error;
    }
  }

  /**
   * Verify AI services are properly configured
   */
  private async verifyAIServices(): Promise<void> {
    if (!process.env.ANTHROPIC_API_KEY) {
      logger.warn('⚠️  ANTHROPIC_API_KEY not set - using mock AI mode');
    }
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('⚠️  GEMINI_API_KEY not set - using mock AI mode');
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
    const incomingPath = 'C:\\Dev\\PrismIntelligence\\incoming';
    
    logger.info(`🔍 Watching path: ${incomingPath}`);

    this.watcher = chokidar.watch(incomingPath, {
      ignored: [
        /[\/\\]\./,        // Ignore dotfiles
        /\.tmp$/,          // Ignore temp files
        /\.processing$/,   // Ignore files being processed
      ],
      persistent: true,
      usePolling: true,
      interval: 500,
      depth: 2,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    // File added
    this.watcher.on('add', async (filePath: string) => {
      logger.info(`📎 NEW FILE DETECTED: ${path.basename(filePath)}`);
      await this.processFile(filePath);
    });

    // Ready event
    this.watcher.on('ready', () => {
      logger.info('👀 File watcher is ready and scanning for files...');
    });

    // Error handling
    this.watcher.on('error', (error: unknown) => {
      logger.error('🚨 File watcher error:', error);
    });
  }
  /**
   * Process a detected file with real AI
   */
  private async processFile(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    
    // Prevent double processing
    if (this.processingFiles.has(filePath)) {
      logger.info(`⏳ Already processing ${fileName}`);
      return;
    }
    
    this.processingFiles.add(filePath);
    const startTime = Date.now();
    
    try {
      logger.info(`🧠 Starting AI processing for: ${fileName}`);
      
      // Step 1: Parse document
      const parsed = await documentParser.parseDocument(filePath);
      logger.info(`📄 Document parsed: ${parsed.content.length} characters`);
      
      // Step 2: Classify with Gemini (if API key available)
      let classification;
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key') {
        classification = await geminiService.classifyDocument(parsed.content, fileName);
        logger.info(`🔍 [Gemini] Document type: ${classification.documentType} (${(classification.confidence * 100).toFixed(0)}% confidence)`);
      } else {
        // Use smart classification based on filename and content
        classification = this.smartClassifyDocument(fileName, parsed.content);
        logger.info(`🔍 [Smart Classifier] Document type: ${classification.documentType}`);
      }
      
      // Step 3: Analyze with Claude (if API key available)
      let insights;
      if (process.env.ANTHROPIC_API_KEY) {
        insights = await claudeService.analyzePropertyDocument(
          parsed.content,
          fileName,
          classification.documentType
        );
      } else {
        insights = this.generateMockInsights(fileName, classification.documentType);
      }
      
      // Step 4: Log results
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      logger.info(`⏱️  Processing completed in ${processingTime}s`);
      
      logger.info('📊 ANALYSIS RESULTS:');
      logger.info(`📝 Summary: ${insights.summary}`);
      
      if (insights.keyMetrics && Object.keys(insights.keyMetrics).length > 0) {
        logger.info('📈 Key Metrics:');
        Object.entries(insights.keyMetrics).forEach(([key, metric]: [string, any]) => {
          logger.info(`   - ${key}: ${metric.value} (${metric.trend} - ${metric.analysis})`);
        });
      }
      
      if (insights.insights && insights.insights.length > 0) {
        logger.info('💡 Insights:');
        insights.insights.forEach((insight: any) => {
          logger.info(`   [${insight.priority.toUpperCase()}] ${insight.insight}`);
        });
      }
      
      if (insights.actions && insights.actions.length > 0) {
        logger.info('🎯 Recommended Actions:');
        insights.actions.forEach((action: any) => {
          logger.info(`   ${action.priority}. ${action.action} → ${action.expectedOutcome}`);
        });
      }
      
      if (insights.tasks && insights.tasks.length > 0) {
        logger.info('📋 Generated Tasks:');
        insights.tasks.forEach((task: any, index: number) => {
          logger.info(`   Task ${index + 1}: ${task.title}`);
          logger.info(`     - Assigned to: ${task.assignedRole}`);
          logger.info(`     - Priority: ${task.priority}/5`);
          logger.info(`     - Due: ${new Date(task.dueDate).toLocaleDateString()}`);
          logger.info(`     - Est. Hours: ${task.estimatedHours}`);
          logger.info(`     - Potential Value: $${task.potentialValue.toLocaleString()}`);
        });
        
        // Calculate total potential value
        const totalValue = insights.tasks.reduce((sum: number, task: any) => sum + task.potentialValue, 0);
        logger.info(`   💰 Total Potential Value: $${totalValue.toLocaleString()}`);
      }
      
      // Step 5: Store results in database
      const processingEndTime = new Date();
      await this.storeAnalysisResults(
        fileName,
        classification.documentType,
        insights,
        startTime,
        processingEndTime,
        ['claude', classification.confidence > 0 ? 'gemini' : 'smart_classifier']
      );
      
      // Step 6: Move to processed folder
      await this.moveToProcessed(filePath);
      
      logger.info('✅ File processing complete!');
      
    } catch (error) {
      logger.error(`❌ Error processing ${fileName}:`, error);
      await this.moveToError(filePath);
    } finally {
      this.processingFiles.delete(filePath);
    }
  }

  /**
   * Smart document classification based on filename and content
   */
  private smartClassifyDocument(fileName: string, content: string): any {
    const lowerName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase().substring(0, 1000);
    
    // Check filename patterns
    if (lowerName.includes('rent') && lowerName.includes('roll')) {
      return { documentType: 'rent_roll', confidence: 0.95 };
    }
    if (lowerName.includes('financial') || lowerName.includes('p&l') || lowerName.includes('pnl')) {
      return { documentType: 'financial_report', confidence: 0.9 };
    }
    if (lowerName.includes('maintenance') || lowerName.includes('work order')) {
      return { documentType: 'maintenance_report', confidence: 0.9 };
    }
    
    // Check content patterns
    if (lowerContent.includes('net operating income') || lowerContent.includes('noi')) {
      return { documentType: 'financial_report', confidence: 0.85 };
    }
    if (lowerContent.includes('unit') && lowerContent.includes('tenant') && lowerContent.includes('rent')) {
      return { documentType: 'rent_roll', confidence: 0.85 };
    }
    if (lowerContent.includes('repair') || lowerContent.includes('maintenance')) {
      return { documentType: 'maintenance_report', confidence: 0.8 };
    }
    
    // Default
    return { documentType: 'financial_report', confidence: 0.7 };
  }

  /**
   * Generate mock insights when AI is not configured
   */
  private generateMockInsights(fileName: string, docType: string): any {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const mockInsights: Record<string, any> = {
      financial_report: {
        summary: "Financial performance shows positive trends with opportunities for optimization.",
        keyMetrics: {
          "NOI": { value: 125000, trend: "up", analysis: "5.2% increase from last period" },
          "Occupancy": { value: 94.5, trend: "stable", analysis: "Above market average of 92%" }
        },
        insights: [
          { priority: "high", insight: "Utility costs increased 15% - investigate usage patterns", impact: "Could save $2,500/month" },
          { priority: "medium", insight: "Rent collection improved to 98.5%", impact: "Positive cash flow impact" }
        ],
        actions: [
          { priority: 1, action: "Audit HVAC systems for efficiency", expectedOutcome: "15% reduction in utility costs" },
          { priority: 2, action: "Review market rents for upcoming renewals", expectedOutcome: "3-5% rent increase opportunity" }
        ],
        risks: [],
        tasks: [
          {
            title: "Schedule HVAC Efficiency Audit",
            description: "1. Contact preferred HVAC vendor\n2. Schedule comprehensive system audit\n3. Request efficiency report with cost-saving recommendations\n4. Review findings with property team",
            priority: 1,
            assignedRole: "Maintenance",
            dueDate: tomorrow.toISOString(),
            estimatedHours: 2,
            potentialValue: 30000,
            sourceInsight: "Utility costs increased 15%"
          },
          {
            title: "Analyze Market Rent Comparables",
            description: "1. Pull rent comps for similar properties within 2 miles\n2. Create comparison matrix\n3. Identify units below market rate\n4. Prepare renewal strategy",
            priority: 2,
            assignedRole: "PropertyManager",
            dueDate: nextWeek.toISOString(),
            estimatedHours: 4,
            potentialValue: 11250,
            sourceInsight: "Average rent $75 below market"
          }
        ]
      },
      rent_roll: {
        summary: "Occupancy remains strong with upcoming lease expirations requiring attention.",
        keyMetrics: {
          "Total Units": { value: 150, trend: "stable", analysis: "Full property roster" },
          "Occupied Units": { value: 142, trend: "up", analysis: "94.7% occupancy rate" }
        },
        insights: [
          { priority: "high", insight: "15 leases expiring in next 60 days", impact: "Potential 10% vacancy if not renewed" },
          { priority: "medium", insight: "Average rent $1,850, market rate $1,925", impact: "$75/unit opportunity" }
        ],
        actions: [
          { priority: 1, action: "Start renewal negotiations for expiring leases", expectedOutcome: "Maintain 95%+ occupancy" },
          { priority: 2, action: "Implement market rate adjustments", expectedOutcome: "$11,250 monthly revenue increase" }
        ],
        risks: [
          { severity: "medium", risk: "Concentration of lease expirations", mitigation: "Stagger future lease terms" }
        ],
        tasks: [
          {
            title: "Contact Tenants with Expiring Leases",
            description: "1. Generate list of 15 expiring leases\n2. Send renewal offers with market adjustments\n3. Schedule meetings for top 5 units\n4. Track responses in CRM",
            priority: 1,
            assignedRole: "Leasing",
            dueDate: tomorrow.toISOString(),
            estimatedHours: 6,
            potentialValue: 27750,
            sourceInsight: "15 leases expiring in next 60 days"
          }
        ]
      }
    };
    
    return mockInsights[docType] || mockInsights.financial_report;
  }

  /**
   * Move processed file to processed folder
   */
  private async moveToProcessed(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const processedPath = path.join('C:\\Dev\\PrismIntelligence\\processed', `${timestamp}_${fileName}`);
      
      await fs.rename(filePath, processedPath);
      logger.info(`📁 Moved to processed: ${fileName}`);
    } catch (error) {
      logger.error('Failed to move file to processed:', error);
    }
  }

  /**
   * Move error file to errors folder
   */
  private async moveToError(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const errorPath = path.join('C:\\Dev\\PrismIntelligence\\errors', `${timestamp}_${fileName}`);
      
      await fs.rename(filePath, errorPath);
      logger.info(`📁 Moved to errors: ${fileName}`);
    } catch (error) {
      logger.error('Failed to move file to errors:', error);
    }
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(
    fileName: string,
    documentType: string,
    insights: any,
    processingStartTime: number,
    processingEndTime: Date,
    modelsUsed: string[]
  ): Promise<void> {
    try {
      // For now, use default IDs - in production, these would come from context
      const companyId = process.env.DEFAULT_COMPANY_ID || 'default-company-id';
      const propertyId = process.env.DEFAULT_PROPERTY_ID || undefined;
      const reportId = `report-${Date.now()}`; // Generate temporary report ID
      
      // Count insights by priority
      const highPriorityInsights = insights.insights?.filter((i: any) => i.priority === 'high').length || 0;
      const totalPotentialValue = insights.tasks?.reduce((sum: number, task: any) => sum + task.potentialValue, 0) || 0;
      
      // Store tasks if any were generated
      if (insights.tasks && insights.tasks.length > 0) {
        await taskDatabase.storeTasks(insights.tasks, reportId, companyId, propertyId);
        
        // Send email notifications for new tasks
        try {
          await notificationService.sendTaskNotifications(
            insights.tasks,
            fileName,
            reportId,
            propertyId || 'Property',
            companyId
          );
          logger.info('📧 Task notifications sent successfully');
        } catch (error) {
          logger.error('Failed to send task notifications:', error);
          // Don't throw - notifications are not critical
        }
      }
      
      // Create analysis summary
      await taskDatabase.createAnalysisSummary(reportId, companyId, propertyId, {
        documentName: fileName,
        documentType: documentType,
        processingStartTime: new Date(processingStartTime),
        processingEndTime: processingEndTime,
        insightsCount: insights.insights?.length || 0,
        highPriorityInsightsCount: highPriorityInsights,
        tasksGeneratedCount: insights.tasks?.length || 0,
        totalPotentialValue: totalPotentialValue,
        modelsUsed: modelsUsed
      });
      
      // Update ROI metrics
      await taskDatabase.updateROIMetrics(companyId, propertyId, {
        documentsProcessed: 1,
        analysesCompleted: 1,
        tasksGenerated: insights.tasks?.length || 0,
        totalPotentialValue: totalPotentialValue,
        timeSavedHours: 2.0, // Will be calculated in the service
        insightsGenerated: insights.insights?.length || 0,
        highPriorityInsights: highPriorityInsights
      });
      
      // Log ROI dashboard
      const roiData = await taskDatabase.getROIDashboard(companyId, propertyId);
      if (roiData) {
        logger.info('📊 ROI Dashboard Update:');
        logger.info(`   - Total Time Saved: ${roiData.total_time_saved?.toFixed(1) || 0} hours`);
        logger.info(`   - Total Tasks Generated: ${roiData.total_tasks_generated || 0}`);
        logger.info(`   - Potential Value: $${(roiData.total_value_realized || 0).toLocaleString()}`);
      }
      
    } catch (error) {
      logger.error('Failed to store analysis results:', error);
      // Don't throw - we don't want database errors to stop file processing
    }
  }
}

// Export singleton instance
export const attachmentIntelligenceLoop = new AttachmentIntelligenceLoop();
