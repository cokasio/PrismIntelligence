/**
 * CloudMailin Webhook Route
 * Replace SendGrid with CloudMailin for receiving property reports
 * 
 * CloudMailin webhook format is cleaner and more reliable
 */

import { Router, Request, Response } from 'express';
import { queueService } from '../../services/queue';
import { emailService } from '../../services/email';
import { apiLogger } from '../../utils/logger';
import { db } from '../../services/database';

const router = Router();

/**
 * CloudMailin Inbound Email Webhook
 * Receives property reports via email
 */
router.post('/webhooks/cloudmailin', async (req: Request, res: Response) => {
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

    // CloudMailin provides content as base64
    const fileBuffer = Buffer.from(reportAttachment.content, 'base64');
    
    // Create report record
    const reportId = await db.createReport({
      tenantId,
      filename: reportAttachment.file_name,
      senderEmail: from,
      subject,
      fileSize: reportAttachment.size,
      status: 'pending'
    });

    // Queue for processing
    await queueService.addReportForProcessing({
      reportId,
      tenantId,
      from,
      filename: reportAttachment.file_name,
      fileBuffer,
      receivedAt: new Date()
    });

    // Send confirmation
    await emailService.sendConfirmation(from, reportId);

    // Success response to CloudMailin
    res.status(200).json({ 
      success: true,
      message: 'Report received and queued for processing',
      reportId 
    });

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
 * Extract tenant ID from email address
 * Supports multiple formats:
 * - tenant123@reports.yourdomain.com
 * - reports+tenant123@yourdomain.com  
 * - reports-tenant123@yourdomain.com
 */
function extractTenantId(emailAddress: string): string | null {
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
 * Validate if file is an acceptable report format
 */
function isValidReportFile(filename: string): boolean {
  const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return validExtensions.includes(ext);
}

export default router;
