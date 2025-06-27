/**
 * API Routes
 * This module defines all the HTTP endpoints for Prism Intelligence
 * Think of these as the doors through which data enters and exits your system
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import config from '../../config';
import { apiLogger } from '../../utils/logger';
import { db } from '../../services/database';
import { queueService } from '../../services/queue';
import { emailService, InboundEmail } from '../../services/email';

const router = Router();

/**
 * Multer configuration for handling file uploads
 * This is used when files are uploaded directly via API
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxFileSizeBytes,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Excel, and CSV files are allowed.'));
    }
  },
});

/**
 * Health check endpoint
 * Used by monitoring systems to ensure the API is running
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();
    
    // Check Redis/queue connectivity
    const queueStats = await queueService.getQueueStats();
    const queueHealthy = queueStats !== null;
    
    const health = {
      status: dbHealthy && queueHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.app.env,
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        queue: queueHealthy ? 'connected' : 'disconnected',
        email: 'ready', // Email is always ready if the service starts
      },
      queue: queueHealthy ? queueStats : null,
    };
    
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
    
  } catch (error) {
    apiLogger.error('Health check failed', { error });
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * SendGrid Inbound Parse Webhook
 * This is where email reports enter the system
 */
router.post('/webhooks/sendgrid/inbound', 
  // Verify webhook signature if configured
  verifySendGridWebhook,
  async (req: Request, res: Response) => {
    try {
      apiLogger.info('Received inbound email webhook', {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
      });

      // Parse the inbound email data
      const emailData: InboundEmail = {
        to: req.body.to,
        from: req.body.from,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html,
        attachments: parseAttachments(req.body),
        envelope: req.body.envelope ? JSON.parse(req.body.envelope) : undefined,
        spam_score: parseFloat(req.body.spam_score || '0'),
        spam_report: req.body.spam_report,
      };

      // Check spam score
      if (emailData.spam_score && emailData.spam_score > 5) {
        apiLogger.warn('High spam score detected', {
          from: emailData.from,
          spamScore: emailData.spam_score,
        });
        // Still process but log for monitoring
      }

      // Validate the email has attachments
      if (!emailData.attachments || emailData.attachments.length === 0) {
        apiLogger.warn('No attachments in email', { from: emailData.from });
        
        // Send friendly error response
        await emailService.sendProcessingError(
          emailData.from,
          'no-report-id',
          'No attachment found',
          'Please attach a property report (PDF, Excel, or CSV) to your email.'
        );
        
        res.json({ 
          success: false, 
          message: 'No attachments found' 
        });
        return;
      }

      // Find the first valid report file
      const reportAttachment = emailData.attachments.find(att => 
        isValidReportFile(att.filename)
      );

      if (!reportAttachment) {
        apiLogger.warn('No valid report files in attachments', {
          from: emailData.from,
          attachments: emailData.attachments.map(a => a.filename),
        });
        
        await emailService.sendProcessingError(
          emailData.from,
          'no-report-id',
          'Invalid file type',
          'Please attach a PDF, Excel (.xlsx, .xls), or CSV file containing your property report.'
        );
        
        res.json({ 
          success: false, 
          message: 'No valid report files found' 
        });
        return;
      }

      // Determine organization from sender email
      // In production, this would do a proper lookup
      const organizationId = await getOrganizationFromEmail(emailData.from);
      
      if (!organizationId) {
        apiLogger.warn('Unknown sender email', { from: emailData.from });
        
        // For MVP, create a pending organization
        const pendingOrg = await db.createOrganization({
          name: 'Pending Organization',
          email_domain: emailData.from.split('@')[1],
          settings: { auto_created: true },
        });
        
        organizationId = pendingOrg?.id || 'pending';
      }

      // Create a report record in the database
      const report = await db.createReport({
        organization_id: organizationId,
        filename: reportAttachment.filename,
        file_type: getFileType(reportAttachment.filename),
        file_size_bytes: Buffer.from(reportAttachment.content, 'base64').length,
        file_url: 'pending-upload', // Will be updated after upload
        status: 'pending',
        sender_email: emailData.from,
        email_subject: emailData.subject,
      });

      if (!report) {
        throw new Error('Failed to create report record');
      }

      // Send immediate confirmation
      await emailService.sendReportReceivedConfirmation(
        emailData.from,
        report.id,
        reportAttachment.filename
      );

      // Queue the report for processing
      const job = await queueService.addReportForProcessing({
        reportId: report.id,
        organizationId: organizationId,
        filename: reportAttachment.filename,
        fileType: getFileType(reportAttachment.filename) as 'pdf' | 'excel' | 'csv',
        fileUrl: 'pending-upload',
        fileBuffer: Buffer.from(reportAttachment.content, 'base64'),
        senderEmail: emailData.from,
        priority: determinePriority(emailData),
      });

      apiLogger.info('Report queued for processing', {
        reportId: report.id,
        jobId: job.id,
        filename: reportAttachment.filename,
      });

      res.json({
        success: true,
        reportId: report.id,
        message: 'Report received and queued for processing',
      });

    } catch (error) {
      apiLogger.error('Failed to process inbound email', { error });
      
      // Try to send error notification
      if (req.body.from) {
        await emailService.sendProcessingError(
          req.body.from,
          'error',
          'Processing error',
          'An unexpected error occurred while processing your report. Please try again or contact support.'
        ).catch(err => {
          apiLogger.error('Failed to send error notification', { err });
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to process email',
      });
    }
  }
);

/**
 * Direct file upload endpoint
 * Alternative to email for direct API integration
 */
router.post('/reports/upload',
  upload.single('report'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      apiLogger.info('Direct file upload received', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Get organization from API key or session
      // For MVP, use a default
      const organizationId = req.body.organizationId || 'default-org';
      const userEmail = req.body.email || 'api@prism-intelligence.com';

      // Create report record
      const report = await db.createReport({
        organization_id: organizationId,
        filename: req.file.originalname,
        file_type: getFileType(req.file.originalname),
        file_size_bytes: req.file.size,
        file_url: 'memory-buffer',
        status: 'pending',
        sender_email: userEmail,
        email_subject: `API Upload: ${req.file.originalname}`,
      });

      if (!report) {
        throw new Error('Failed to create report record');
      }

      // Queue for processing
      const job = await queueService.addReportForProcessing({
        reportId: report.id,
        organizationId: organizationId,
        filename: req.file.originalname,
        fileType: getFileType(req.file.originalname) as 'pdf' | 'excel' | 'csv',
        fileUrl: 'memory-buffer',
        fileBuffer: req.file.buffer,
        senderEmail: userEmail,
        priority: parseInt(req.body.priority) || 0,
      });

      res.json({
        success: true,
        reportId: report.id,
        jobId: job.id,
        message: 'Report uploaded and queued for processing',
      });

    } catch (error) {
      apiLogger.error('File upload failed', { error });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Get report status endpoint
 * Check the processing status of a report
 */
router.get('/reports/:reportId/status', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    
    // Get report from database
    const { data: report, error } = await db.getClient('public')
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    // Get processing logs
    const { data: logs } = await db.getClient('public')
      .from('processing_logs')
      .select('stage, status, message, created_at')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get insights count if completed
    let insightCount = 0;
    let actionCount = 0;
    
    if (report.status === 'completed') {
      const { count: insights } = await db.getClient('public')
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId);
      
      const { count: actions } = await db.getClient('public')
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId);
      
      insightCount = insights || 0;
      actionCount = actions || 0;
    }

    res.json({
      success: true,
      report: {
        id: report.id,
        filename: report.filename,
        status: report.status,
        createdAt: report.created_at,
        completedAt: report.processing_completed_at,
        processingTime: report.processing_duration_ms,
        error: report.error_message,
      },
      results: report.status === 'completed' ? {
        insights: insightCount,
        actions: actionCount,
      } : null,
      logs: logs || [],
    });

  } catch (error) {
    apiLogger.error('Failed to get report status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve report status',
    });
  }
});

/**
 * Get queue statistics endpoint
 * Monitor the health of the processing queue
 */
router.get('/admin/queue/stats', async (req: Request, res: Response) => {
  try {
    const stats = await queueService.getQueueStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    apiLogger.error('Failed to get queue stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve queue statistics',
    });
  }
});

/**
 * Webhook signature verification middleware
 * Ensures webhooks are actually from SendGrid
 */
function verifySendGridWebhook(req: Request, res: Response, next: NextFunction) {
  if (!config.email.webhookSecret) {
    // No secret configured, skip verification
    next();
    return;
  }

  const signature = req.get('X-Twilio-Email-Event-Webhook-Signature');
  const timestamp = req.get('X-Twilio-Email-Event-Webhook-Timestamp');
  
  if (!signature || !timestamp) {
    apiLogger.warn('Missing webhook signature headers');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Verify signature
  const payload = timestamp + req.rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', config.email.webhookSecret)
    .update(payload)
    .digest('base64');

  if (signature !== expectedSignature) {
    apiLogger.warn('Invalid webhook signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}

/**
 * Helper: Parse attachments from SendGrid webhook data
 */
function parseAttachments(body: any): InboundEmail['attachments'] {
  const attachments: InboundEmail['attachments'] = [];
  
  // SendGrid sends attachments as numbered fields
  let i = 1;
  while (body[`attachment${i}`]) {
    try {
      const attachmentInfo = JSON.parse(body[`attachment-info${i}`] || '{}');
      attachments.push({
        filename: attachmentInfo.filename || `attachment${i}`,
        type: attachmentInfo.type || 'application/octet-stream',
        content: body[`attachment${i}`],
        disposition: attachmentInfo.disposition || 'attachment',
        contentId: attachmentInfo['content-id'],
      });
    } catch (err) {
      apiLogger.warn('Failed to parse attachment', { 
        index: i, 
        error: err 
      });
    }
    i++;
  }
  
  return attachments.length > 0 ? attachments : undefined;
}

/**
 * Helper: Check if a filename represents a valid report file
 */
function isValidReportFile(filename: string): boolean {
  const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];
  const lowerFilename = filename.toLowerCase();
  return validExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Helper: Get file type from filename
 */
function getFileType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'excel';
  if (lower.endsWith('.csv')) return 'csv';
  return 'unknown';
}

/**
 * Helper: Get organization ID from email address
 * In production, this would do a real lookup
 */
async function getOrganizationFromEmail(email: string): Promise<string | null> {
  const domain = email.split('@')[1];
  
  const { data } = await db.getClient('public')
    .from('organizations')
    .select('id')
    .eq('email_domain', domain)
    .single();
  
  return data?.id || null;
}

/**
 * Helper: Determine processing priority based on email
 */
function determinePriority(email: InboundEmail): number {
  // Higher priority for certain keywords in subject
  if (email.subject) {
    const subject = email.subject.toLowerCase();
    if (subject.includes('urgent') || subject.includes('asap')) return 10;
    if (subject.includes('important') || subject.includes('priority')) return 5;
  }
  
  // Could also prioritize based on sender, organization tier, etc.
  return 0;
}

/**
 * Helper: Check database health
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { error } = await db.getClient('public')
      .from('organizations')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

export default router;

/**
 * Example webhook payload from SendGrid:
 * {
 *   "to": "reports@prism-intelligence.com",
 *   "from": "manager@property.com",
 *   "subject": "March 2024 Financial Report",
 *   "text": "Please find attached the monthly report.",
 *   "html": "<p>Please find attached the monthly report.</p>",
 *   "attachment1": "base64-encoded-file-content",
 *   "attachment-info1": "{\"filename\":\"march-report.pdf\",\"type\":\"application/pdf\"}",
 *   "envelope": "{\"to\":[\"reports@prism-intelligence.com\"],\"from\":\"manager@property.com\"}",
 *   "spam_score": "0.123",
 *   "spam_report": "..."
 * }
 */