/**
 * Queue Service - Background Job Processing
 * This module manages asynchronous report processing using Bull queue
 * Think of it as an intelligent conveyor belt that ensures every report gets processed
 */

import Bull from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import config from '../config';
import { queueLogger } from '../utils/logger';
import { db } from './database';
import { emailService } from './email';
import { aiService } from './ai';
import { pdfParser } from '../parsers/pdf';
import { excelParser } from '../parsers/excel';
import { csvParser } from '../parsers/csv';
import { createAnalysisReport } from '../utils/reportGenerator';

/**
 * Define job data structures
 * Each job type has specific data requirements
 */
export interface ReportProcessingJob {
  reportId: string;
  organizationId: string;
  filename: string;
  fileType: 'pdf' | 'excel' | 'csv';
  fileUrl: string;
  fileBuffer?: Buffer;  // Optional, for when file is already in memory
  senderEmail: string;
  priority?: number;    // Higher number = higher priority
}

export interface EmailDeliveryJob {
  reportId: string;
  recipientEmail: string;
  analysisData: any;
  reportType: string;
}

/**
 * Create the main processing queue
 * This handles all report analysis jobs
 */
const reportQueue = new Bull<ReportProcessingJob>('report-processing', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  },
  defaultJobOptions: {
    removeOnComplete: 100,  // Keep last 100 completed jobs
    removeOnFail: 50,       // Keep last 50 failed jobs
    attempts: config.processing.retryAttempts,
    backoff: {
      type: 'exponential',
      delay: config.processing.retryDelayMs,
    },
  },
});

/**
 * Create the email delivery queue
 * Separate queue to avoid blocking report processing
 */
const emailQueue = new Bull<EmailDeliveryJob>('email-delivery', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
    attempts: 5,  // Email delivery is critical
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Process report analysis jobs
 * This is where the magic happens - parsing, AI analysis, and insight generation
 */
reportQueue.process('analyze-report', async (job) => {
  const { reportId, filename, fileType, fileUrl, senderEmail } = job.data;
  
  queueLogger.info('Starting report processing', {
    reportId,
    filename,
    fileType,
    jobId: job.id,
  });

  try {
    // Update report status to processing
    await db.updateReportStatus(reportId, 'processing');
    
    // Track processing stages in database
    await db.getClient('admin')
      .from('processing_logs')
      .insert({
        report_id: reportId,
        stage: 'processing_started',
        status: 'started',
        message: `Processing ${fileType} file: ${filename}`,
      });

    // Step 1: Download the file if not already in memory
    let fileBuffer = job.data.fileBuffer;
    if (!fileBuffer) {
      queueLogger.debug('Downloading file from storage', { fileUrl });
      // In production, this would download from Supabase Storage
      // For now, we'll simulate this
      fileBuffer = Buffer.from('simulated file content');
    }

    // Update progress
    await job.progress(20);

    // Step 2: Parse the file based on type
    queueLogger.info('Parsing file', { fileType });
    let parsedData: any;
    
    switch (fileType) {
      case 'pdf':
        parsedData = await pdfParser.parse(fileBuffer);
        break;
      case 'excel':
        parsedData = await excelParser.parse(fileBuffer, filename);
        break;
      case 'csv':
        parsedData = await csvParser.parse(fileBuffer, filename);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    await db.getClient('admin')
      .from('processing_logs')
      .insert({
        report_id: reportId,
        stage: 'parsing_completed',
        status: 'completed',
        message: `Successfully parsed ${fileType} file`,
      });

    // Update progress
    await job.progress(40);

    // Step 3: Perform AI analysis
    queueLogger.info('Starting AI analysis', { reportId });
    const analysisResult = await aiService.analyzeReport(
      reportId,
      parsedData,
      fileType
    );

    await db.getClient('admin')
      .from('processing_logs')
      .insert({
        report_id: reportId,
        stage: 'ai_analysis_completed',
        status: 'completed',
        message: `AI analysis completed with ${analysisResult.pass3_insights.data.length} insights`,
        tokens_used: analysisResult.totalTokensUsed,
      });

    // Update progress
    await job.progress(70);

    // Step 4: Store insights and actions in database
    queueLogger.info('Storing insights and actions', {
      insightCount: analysisResult.pass3_insights.data.length,
      actionCount: analysisResult.pass4_actions.data.length,
    });

    // Store insights
    if (analysisResult.pass3_insights.success && analysisResult.pass3_insights.data.length > 0) {
      const insights = analysisResult.pass3_insights.data.map(insight => ({
        report_id: reportId,
        organization_id: job.data.organizationId,
        property_id: null, // Would be extracted from report
        insight_text: insight.insight,
        insight_summary: insight.insight.substring(0, 500),
        category: insight.category,
        priority: insight.priority,
        confidence_score: insight.confidence,
        supporting_data: insight.supporting_data,
      }));

      await db.createInsights(insights);
    }

    // Store actions
    if (analysisResult.pass4_actions.success && analysisResult.pass4_actions.data.length > 0) {
      const actions = analysisResult.pass4_actions.data.map(action => ({
        report_id: reportId,
        organization_id: job.data.organizationId,
        property_id: null,
        action_text: action.action,
        action_type: action.category,
        priority: action.priority,
        status: 'pending',
        assigned_to: action.assignTo,
        due_date: calculateDueDate(action.dueDate),
        expected_impact: action.expectedImpact,
        estimated_value: action.estimatedValue,
      }));

      const { data: createdActions } = await db.getClient('admin')
        .from('actions')
        .insert(actions)
        .select();
      
      queueLogger.debug('Actions created', {
        count: createdActions?.length || 0,
      });
    }

    // Update progress
    await job.progress(90);

    // Step 5: Queue email delivery
    queueLogger.info('Queueing email delivery', { reportId });
    
    await emailQueue.add('deliver-analysis', {
      reportId,
      recipientEmail: senderEmail,
      analysisData: analysisResult,
      reportType: fileType,
    }, {
      priority: job.opts.priority,
    });

    // Update report status to completed
    await db.updateReportStatus(reportId, 'completed', {
      processing_completed_at: new Date().toISOString(),
      processing_duration_ms: Date.now() - job.timestamp,
    });

    await db.getClient('admin')
      .from('processing_logs')
      .insert({
        report_id: reportId,
        stage: 'processing_completed',
        status: 'completed',
        message: 'Report processing completed successfully',
        duration_ms: Date.now() - job.timestamp,
      });

    // Update progress
    await job.progress(100);

    queueLogger.info('Report processing completed', {
      reportId,
      duration: Date.now() - job.timestamp,
      insightCount: analysisResult.pass3_insights.data.length,
      actionCount: analysisResult.pass4_actions.data.length,
      totalCost: analysisResult.totalCost,
    });

    return {
      success: true,
      reportId,
      insights: analysisResult.pass3_insights.data.length,
      actions: analysisResult.pass4_actions.data.length,
      processingTime: Date.now() - job.timestamp,
    };

  } catch (error) {
    queueLogger.error('Report processing failed', {
      error,
      reportId,
      jobId: job.id,
      attempt: job.attemptsMade,
    });

    // Log the error
    await db.getClient('admin')
      .from('processing_logs')
      .insert({
        report_id: reportId,
        stage: 'processing_failed',
        status: 'failed',
        message: error.message,
        error_details: { 
          stack: error.stack,
          attempt: job.attemptsMade,
        },
      });

    // Update report status if this was the last attempt
    if (job.attemptsMade >= config.processing.retryAttempts - 1) {
      await db.updateReportStatus(reportId, 'failed', {
        error_message: error.message,
      });

      // Send error notification
      await emailService.sendProcessingError(
        senderEmail,
        reportId,
        filename,
        error.message
      );
    }

    throw error;  // Re-throw to trigger retry
  }
});

/**
 * Process email delivery jobs
 * Generates beautiful HTML reports and sends them
 */
emailQueue.process('deliver-analysis', async (job) => {
  const { reportId, recipientEmail, analysisData } = job.data;
  
  emailLogger.info('Processing email delivery', {
    reportId,
    recipient: recipientEmail,
    jobId: job.id,
  });

  try {
    // Generate the HTML report
    const reportHtml = await createAnalysisReport(analysisData);
    
    // Create email subject
    const insightCount = analysisData.pass3_insights.data.length;
    const urgentActions = analysisData.pass4_actions.data.filter(
      a => a.priority === 'urgent'
    ).length;
    
    let subject = `Your Property Analysis is Ready`;
    if (urgentActions > 0) {
      subject += ` - ${urgentActions} Urgent Action${urgentActions > 1 ? 's' : ''} Required`;
    } else {
      subject += ` - ${insightCount} Key Insight${insightCount > 1 ? 's' : ''} Found`;
    }

    // Send the email
    const sent = await emailService.sendAnalysisReport(
      recipientEmail,
      reportId,
      reportHtml,
      subject
    );

    if (sent) {
      emailLogger.info('Analysis report sent successfully', {
        reportId,
        recipient: recipientEmail,
      });
      
      return { success: true, reportId };
    } else {
      throw new Error('Email sending failed');
    }

  } catch (error) {
    emailLogger.error('Email delivery failed', {
      error,
      reportId,
      jobId: job.id,
      attempt: job.attemptsMade,
    });

    throw error;
  }
});

/**
 * Queue event handlers for monitoring and debugging
 */
reportQueue.on('completed', (job, result) => {
  queueLogger.debug('Job completed', {
    jobId: job.id,
    reportId: job.data.reportId,
    result,
  });
});

reportQueue.on('failed', (job, err) => {
  queueLogger.error('Job failed', {
    jobId: job.id,
    reportId: job.data.reportId,
    error: err.message,
    failedReason: job.failedReason,
  });
});

reportQueue.on('stalled', (job) => {
  queueLogger.warn('Job stalled', {
    jobId: job.id,
    reportId: job.data.reportId,
  });
});

// Similar handlers for email queue
emailQueue.on('completed', (job) => {
  emailLogger.debug('Email delivery completed', {
    jobId: job.id,
    reportId: job.data.reportId,
  });
});

emailQueue.on('failed', (job, err) => {
  emailLogger.error('Email delivery failed', {
    jobId: job.id,
    reportId: job.data.reportId,
    error: err.message,
  });
});

/**
 * Helper function to calculate due dates from relative strings
 * Converts "within 7 days" to an actual date
 */
function calculateDueDate(relativeDueDate: string): string {
  const today = new Date();
  
  // Parse common patterns
  const daysMatch = relativeDueDate.match(/(\d+)\s*days?/i);
  const weeksMatch = relativeDueDate.match(/(\d+)\s*weeks?/i);
  const monthsMatch = relativeDueDate.match(/(\d+)\s*months?/i);
  
  if (daysMatch) {
    today.setDate(today.getDate() + parseInt(daysMatch[1]));
  } else if (weeksMatch) {
    today.setDate(today.getDate() + parseInt(weeksMatch[1]) * 7);
  } else if (monthsMatch) {
    today.setMonth(today.getMonth() + parseInt(monthsMatch[1]));
  } else if (relativeDueDate.toLowerCase().includes('immediate') || 
             relativeDueDate.toLowerCase().includes('urgent')) {
    today.setDate(today.getDate() + 1);  // Tomorrow
  } else {
    today.setDate(today.getDate() + 7);  // Default to 1 week
  }
  
  return today.toISOString().split('T')[0];  // Return YYYY-MM-DD
}

/**
 * Queue management functions
 */
export const queueService = {
  /**
   * Add a report to the processing queue
   */
  async addReportForProcessing(jobData: ReportProcessingJob): Promise<Bull.Job<ReportProcessingJob>> {
    const job = await reportQueue.add('analyze-report', jobData, {
      priority: jobData.priority || 0,
      attempts: config.processing.retryAttempts,
    });
    
    queueLogger.info('Report queued for processing', {
      reportId: jobData.reportId,
      jobId: job.id,
      position: await job.getPosition(),
    });
    
    return job;
  },

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [
      reportWaiting,
      reportActive,
      reportCompleted,
      reportFailed,
      emailWaiting,
      emailActive,
    ] = await Promise.all([
      reportQueue.getWaitingCount(),
      reportQueue.getActiveCount(),
      reportQueue.getCompletedCount(),
      reportQueue.getFailedCount(),
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
    ]);

    return {
      reports: {
        waiting: reportWaiting,
        active: reportActive,
        completed: reportCompleted,
        failed: reportFailed,
      },
      emails: {
        waiting: emailWaiting,
        active: emailActive,
      },
    };
  },

  /**
   * Clean old jobs from queues
   */
  async cleanQueues() {
    const cleanedReports = await reportQueue.clean(
      24 * 60 * 60 * 1000,  // 24 hours
      'completed'
    );
    
    const cleanedEmails = await emailQueue.clean(
      24 * 60 * 60 * 1000,
      'completed'
    );
    
    queueLogger.info('Queues cleaned', {
      reportsCleaned: cleanedReports.length,
      emailsCleaned: cleanedEmails.length,
    });
  },

  /**
   * Pause/resume queue processing
   */
  async pauseProcessing() {
    await reportQueue.pause();
    await emailQueue.pause();
    queueLogger.warn('Queue processing paused');
  },

  async resumeProcessing() {
    await reportQueue.resume();
    await emailQueue.resume();
    queueLogger.info('Queue processing resumed');
  },

  /**
   * Get Bull Board router for queue monitoring UI
   */
  getBullBoardRouter() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(reportQueue),
        new BullAdapter(emailQueue),
      ],
      serverAdapter,
    });

    return serverAdapter.getRouter();
  },
};

// Export queues for direct access if needed
export { reportQueue, emailQueue };

/**
 * Example usage:
 * 
 * import { queueService } from './services/queue';
 * 
 * // Add a report for processing
 * await queueService.addReportForProcessing({
 *   reportId: 'report-123',
 *   organizationId: 'org-456',
 *   filename: 'monthly-report.pdf',
 *   fileType: 'pdf',
 *   fileUrl: 'https://storage.../report.pdf',
 *   senderEmail: 'manager@property.com',
 *   priority: 1,  // Higher priority
 * });
 * 
 * // Check queue status
 * const stats = await queueService.getQueueStats();
 * console.log('Reports waiting:', stats.reports.waiting);
 */