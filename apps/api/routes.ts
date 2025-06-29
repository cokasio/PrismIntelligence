/**
 * API Routes
 * This module defines all the HTTP endpoints for Prism Intelligence
 * Think of these as the doors through which data enters and exits your system
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import config from '../config';
import { apiLogger } from '../utils/logger';
import { db } from '../services/database';
import { queueService } from '../services/queue';
import { emailService } from '../services/email';

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
 * CloudMailin Inbound Email Webhook
 * This is where email reports enter the system
 */
router.post('/webhooks/cloudmailin', 
  // Verify webhook signature if configured
  verifyCloudMailinWebhook,
  async (req: Request, res: Response) => {
    try {
      // CloudMailin sends data in a cleaner format
      const {
        to,           // The email address it was sent to
        from,         // Sender's email
        subject,      // Email subject
        plain,        // Plain text body
        html,         // HTML body (if any)
        attachments,  // Array of attachments
        headers,      // Email headers
      } = req.body;

      apiLogger.info('Received CloudMailin webhook', {
        to,
        from, 
        subject,
        attachmentCount: attachments?.length || 0
      });

      // Extract tenant ID from email address
      // Format: reports+tenant123@yourdomain.com or tenant123@reports.yourdomain.com
      const tenantId = extractTenantId(to);

      // Validate that we have attachments
      if (!attachments || attachments.length === 0) {
        apiLogger.warn('No attachments in email', { from, to });
        
        // Send friendly error response
        await emailService.sendProcessingError(
          from,
          'no-report-id',
          'No attachment found',
          'Please attach a property report (PDF, Excel, or CSV) to your email.'
        );
        
        // CloudMailin expects 200 OK even for business logic errors
        res.status(200).json({ 
          success: false, 
          message: 'No attachments found' 
        });
        return;
      }

      // Find the first valid report file
      const reportAttachment = attachments.find(att => 
        isValidReportFile(att.file_name)
      );

      if (!reportAttachment) {
        apiLogger.warn('No valid report files in attachments', {
          from,
          attachments: attachments.map(a => a.file_name),
        });
        
        await emailService.sendProcessingError(
          from,
          'no-report-id',
          'Invalid file type',
          'Please attach a PDF, Excel (.xlsx), or CSV file containing your property report.'
        );
        
        res.status(200).json({ 
          success: false, 
          message: 'No valid report files found' 
        });
        return;
      }

      // Check file size
      if (reportAttachment.size > config.storage.maxFileSizeBytes) {
        apiLogger.warn('Attachment too large', {
          from,
          filename: reportAttachment.file_name,
          size: reportAttachment.size,
          maxSize: config.storage.maxFileSizeBytes,
        });
        
        await emailService.sendProcessingError(
          from,
          'no-report-id',
          'File too large',
          `Please ensure your file is under ${config.storage.maxFileSizeMB}MB.`
        );
        
        res.status(200).json({ 
          success: false, 
          message: 'File too large' 
        });
        return;
      }

      // CloudMailin provides content as base64
      const fileBuffer = Buffer.from(reportAttachment.content, 'base64');
      
      // Create report record
      const reportId = generateReportId();
      
      try {
        // Store report metadata in database
        await db.createReport({
          id: reportId,
          tenantId,
          filename: reportAttachment.file_name,
          senderEmail: from,
          subject,
          fileSize: reportAttachment.size,
          fileType: getFileType(reportAttachment.file_name),
          status: 'pending',
          receivedAt: new Date(),
        });

        // Store file in Supabase storage
        const storagePath = `${tenantId}/${reportId}/${reportAttachment.file_name}`;
        await db.uploadFile(config.storage.bucketRaw, storagePath, fileBuffer);

        // Queue for processing
        await queueService.addReportForProcessing({
          reportId,
          tenantId,
          filename: reportAttachment.file_name,
          storagePath,
          senderEmail: from,
          fileType: getFileType(reportAttachment.file_name),
        });

        // Send confirmation email
        await emailService.sendConfirmation(from, reportId, reportAttachment.file_name);

        apiLogger.info('Report queued for processing', {
          reportId,
          tenantId,
          filename: reportAttachment.file_name,
        });

        // Success response to CloudMailin
        res.status(200).json({ 
          success: true,
          message: 'Report received and queued for processing',
          reportId 
        });

      } catch (error) {
        apiLogger.error('Failed to process report', {
          error,
          reportId,
          from,
        });
        
        // Try to send error notification
        await emailService.sendProcessingError(
          from,
          reportId,
          'Processing error',
          'We encountered an error processing your report. Please try again.'
        );
        
        res.status(500).json({
          success: false,
          error: 'Failed to process report',
        });
      }

    } catch (error) {
      apiLogger.error('Failed to process CloudMailin webhook', { error });
      
      // CloudMailin will retry on 5xx errors
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process email' 
      });
    }
});

/**
 * Direct file upload endpoint
 * Alternative to email - users can upload reports directly
 */
router.post('/reports/upload',
  authenticateRequest,
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

      const tenantId = req.user?.tenantId || 'default';
      const reportId = generateReportId();
      
      apiLogger.info('Direct file upload', {
        filename: req.file.originalname,
        size: req.file.size,
        tenantId,
      });

      // Store report metadata
      await db.createReport({
        id: reportId,
        tenantId,
        filename: req.file.originalname,
        senderEmail: req.user?.email || 'direct-upload',
        subject: `Direct upload: ${req.file.originalname}`,
        fileSize: req.file.size,
        fileType: getFileType(req.file.originalname),
        status: 'pending',
        receivedAt: new Date(),
      });

      // Store file
      const storagePath = `${tenantId}/${reportId}/${req.file.originalname}`;
      await db.uploadFile(config.storage.bucketRaw, storagePath, req.file.buffer);

      // Queue for processing
      await queueService.addReportForProcessing({
        reportId,
        tenantId,
        filename: req.file.originalname,
        storagePath,
        senderEmail: req.user?.email || 'direct-upload',
        fileType: getFileType(req.file.originalname),
      });

      res.json({
        success: true,
        message: 'Report uploaded successfully',
        reportId,
        status: 'processing',
      });

    } catch (error) {
      apiLogger.error('Failed to process uploaded file', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to process uploaded file',
      });
    }
});

/**
 * Get report status
 */
router.get('/reports/:reportId/status',
  authenticateRequest,
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      const report = await db.getReport(reportId);
      
      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      // Check tenant access
      if (report.tenantId !== req.user?.tenantId && req.user?.tenantId !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      res.json({
        success: true,
        report: {
          id: report.id,
          filename: report.filename,
          status: report.status,
          receivedAt: report.receivedAt,
          processedAt: report.processedAt,
          insights: report.insights,
          actions: report.actions,
          error: report.error,
        },
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
 * Get all reports for a tenant
 */
router.get('/reports',
  authenticateRequest,
  async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { limit = 50, offset = 0, status } = req.query;
      
      const reports = await db.getReports(tenantId, {
        limit: Number(limit),
        offset: Number(offset),
        status: status as string,
      });

      res.json({
        success: true,
        reports,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: reports.length, // TODO: Get total count from DB
        },
      });

    } catch (error) {
      apiLogger.error('Failed to get reports', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve reports',
      });
    }
});

/**
 * Admin endpoint: Get queue statistics
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
 * Webhook signature verification middleware for CloudMailin
 */
function verifyCloudMailinWebhook(req: Request, res: Response, next: NextFunction) {
  if (!config.email.cloudmailin.secret) {
    // No secret configured, skip verification
    next();
    return;
  }

  // CloudMailin sends signature in Authorization header
  const authHeader = req.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    apiLogger.warn('Missing CloudMailin authorization header');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const providedToken = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (providedToken !== config.email.cloudmailin.secret) {
    apiLogger.warn('Invalid CloudMailin webhook secret');
    res.status(401).json({ error: 'Invalid authorization' });
    return;
  }

  next();
}

/**
 * Extract tenant ID from email address
 * Supports multiple formats:
 * - tenant123@reports.yourdomain.com
 * - reports+tenant123@yourdomain.com  
 * - reports-tenant123@yourdomain.com
 */
function extractTenantId(emailAddress: string): string {
  // Pattern 1: subdomain approach (tenant123@reports.yourdomain.com)
  const subdomainMatch = emailAddress.match(/^([^@]+)@reports\./);
  if (subdomainMatch) {
    return subdomainMatch[1];
  }

  // Pattern 2: plus addressing (reports+tenant123@yourdomain.com)
  const plusMatch = emailAddress.match(/\+([^@]+)@/);
  if (plusMatch) {
    return plusMatch[1];
  }

  // Pattern 3: dash separator (reports-tenant123@yourdomain.com)
  const dashMatch = emailAddress.match(/reports-([^@]+)@/);
  if (dashMatch) {
    return dashMatch[1];
  }

  // Default tenant for single-tenant deployments
  return 'default';
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
 * Helper: Generate unique report ID
 */
function generateReportId(): string {
  return `report-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Helper: Check database health
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to verify connection
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Simple authentication middleware (implement based on your needs)
 */
function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  // TODO: Implement actual authentication
  // For now, just set a default user
  req.user = {
    id: 'user-123',
    tenantId: 'default',
    email: 'user@example.com',
  };
  next();
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        email: string;
      };
      rawBody?: string;
    }
  }
}

export default router;

/**
 * API Endpoints Summary:
 * 
 * POST   /webhooks/cloudmailin     - CloudMailin webhook for email reports
 * POST   /reports/upload           - Direct file upload
 * GET    /reports/:id/status       - Get report processing status
 * GET    /reports                  - List reports for tenant
 * GET    /admin/queue/stats        - Queue statistics (admin)
 * GET    /health                   - Health check
 */