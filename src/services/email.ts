/**
 * Email Service
 * This module handles all email operations - both receiving reports and sending insights
 * Think of it as your application's postal service, handling all mail in and out
 */

import sgMail from '@sendgrid/mail';
import config from '../config';
import { emailLogger } from '../utils/logger';
import { db } from './database';

// Initialize SendGrid with your API key
sgMail.setApiKey(config.email.sendgridApiKey);

/**
 * Define the structure of incoming webhook data from SendGrid
 * When someone emails a report, SendGrid converts it to this format
 */
export interface InboundEmail {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    type: string;
    content: string; // Base64 encoded
    disposition: string;
    contentId?: string;
  }>;
  envelope?: {
    to: string[];
    from: string;
  };
  spam_score?: number;
  spam_report?: string;
  charsets?: Record<string, string>;
}

/**
 * Email templates for different types of communications
 * These provide consistent, professional messaging
 */
const emailTemplates = {
  /**
   * Sent immediately when a report is received
   * This reassures users that their report is being processed
   */
  reportReceived: (reportId: string, filename: string) => ({
    subject: `Report Received: ${filename}`,
    text: `Hello,

We've successfully received your report "${filename}" and it's now being processed by our AI analysis system.

Your tracking ID is: ${reportId}

You'll receive a detailed analysis via email within the next few minutes. This analysis will include:
- Key insights and trends from your data
- Specific recommendations for improvement
- Action items with priority levels

If you have any questions, simply reply to this email.

Best regards,
The Prism Intelligence Team`,
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .tracking-id { background-color: #e3f2fd; padding: 10px; border-radius: 3px; font-family: monospace; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Report Received</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      
      <p>We've successfully received your report "<strong>${filename}</strong>" and it's now being processed by our AI analysis system.</p>
      
      <p>Your tracking ID is: <span class="tracking-id">${reportId}</span></p>
      
      <p>You'll receive a detailed analysis via email within the next few minutes. This analysis will include:</p>
      <ul>
        <li>Key insights and trends from your data</li>
        <li>Specific recommendations for improvement</li>
        <li>Action items with priority levels</li>
      </ul>
      
      <p>If you have any questions, simply reply to this email.</p>
      
      <p>Best regards,<br>The Prism Intelligence Team</p>
    </div>
    <div class="footer">
      <p>Powered by Prism Intelligence - Transforming Property Data into Actionable Insights</p>
    </div>
  </div>
</body>
</html>`
  }),

  /**
   * Sent when report processing fails
   * Provides helpful guidance on common issues
   */
  processingError: (reportId: string, filename: string, errorMessage: string) => ({
    subject: `Processing Issue: ${filename}`,
    text: `Hello,

We encountered an issue while processing your report "${filename}" (ID: ${reportId}).

Error details: ${errorMessage}

Common solutions:
- Ensure the file is not password protected
- Check that the file is a supported format (PDF, Excel, or CSV)
- Verify the file is not corrupted and can be opened normally
- Ensure the file size is under ${config.storage.maxFileSizeMB}MB

Please try uploading the report again. If the issue persists, reply to this email with the file attached and we'll investigate further.

Best regards,
The Prism Intelligence Team`,
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #F44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .error-box { background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0; }
    .solutions { background-color: #e8f5e9; padding: 15px; border-radius: 3px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Processing Issue</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      
      <p>We encountered an issue while processing your report "<strong>${filename}</strong>"</p>
      <p>Tracking ID: <code>${reportId}</code></p>
      
      <div class="error-box">
        <strong>Error details:</strong><br>
        ${errorMessage}
      </div>
      
      <div class="solutions">
        <strong>Common solutions:</strong>
        <ul>
          <li>Ensure the file is not password protected</li>
          <li>Check that the file is a supported format (PDF, Excel, or CSV)</li>
          <li>Verify the file is not corrupted and can be opened normally</li>
          <li>Ensure the file size is under ${config.storage.maxFileSizeMB}MB</li>
        </ul>
      </div>
      
      <p>Please try uploading the report again. If the issue persists, reply to this email with the file attached and we'll investigate further.</p>
      
      <p>Best regards,<br>The Prism Intelligence Team</p>
    </div>
    <div class="footer">
      <p>Powered by Prism Intelligence - Transforming Property Data into Actionable Insights</p>
    </div>
  </div>
</body>
</html>`
  }),
};

/**
 * Email Service class that handles all email operations
 * This provides a clean interface for sending various types of emails
 */
class EmailService {
  /**
   * Send a confirmation email when a report is received
   * This is the first touchpoint after a user submits a report
   */
  async sendReportReceivedConfirmation(
    to: string,
    reportId: string,
    filename: string
  ): Promise<boolean> {
    try {
      const template = emailTemplates.reportReceived(reportId, filename);
      
      const msg = {
        to,
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName,
        },
        subject: template.subject,
        text: template.text,
        html: template.html,
        // Track opens and clicks for analytics
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      await sgMail.send(msg);
      
      emailLogger.info('Sent report received confirmation', {
        to,
        reportId,
        filename,
      });

      // Record the email in our database
      await db.getClient('admin')
        .from('email_communications')
        .insert({
          report_id: reportId,
          organization_id: await this.getOrgIdFromEmail(to),
          recipient_email: to,
          email_type: 'confirmation',
          subject: template.subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      emailLogger.error('Failed to send report received confirmation', {
        error,
        to,
        reportId,
      });
      return false;
    }
  }

  /**
   * Send an error notification if processing fails
   * Helps users understand what went wrong and how to fix it
   */
  async sendProcessingError(
    to: string,
    reportId: string,
    filename: string,
    errorMessage: string
  ): Promise<boolean> {
    try {
      const template = emailTemplates.processingError(reportId, filename, errorMessage);
      
      const msg = {
        to,
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName,
        },
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      
      emailLogger.info('Sent processing error notification', {
        to,
        reportId,
        filename,
      });

      return true;
    } catch (error) {
      emailLogger.error('Failed to send processing error notification', {
        error,
        to,
        reportId,
      });
      return false;
    }
  }

  /**
   * Send the main analysis report with insights and actions
   * This is the core value delivery of your service
   */
  async sendAnalysisReport(
    to: string,
    reportId: string,
    analysisHtml: string,
    subject: string
  ): Promise<boolean> {
    try {
      const msg = {
        to,
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName,
        },
        subject,
        html: analysisHtml,
        // Also include a text version for better deliverability
        text: this.htmlToText(analysisHtml),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      await sgMail.send(msg);
      
      emailLogger.info('Sent analysis report', {
        to,
        reportId,
        subject,
      });

      // Update report status
      await db.updateReportStatus(reportId, 'completed', {
        confirmation_sent: true,
      });

      return true;
    } catch (error) {
      emailLogger.error('Failed to send analysis report', {
        error,
        to,
        reportId,
      });
      return false;
    }
  }

  /**
   * Parse and validate incoming email from SendGrid webhook
   * This is where reports enter your system
   */
  async processInboundEmail(emailData: InboundEmail): Promise<{
    success: boolean;
    reportId?: string;
    error?: string;
  }> {
    try {
      emailLogger.info('Processing inbound email', {
        from: emailData.from,
        subject: emailData.subject,
        attachmentCount: emailData.attachments?.length || 0,
      });

      // Validate the email has attachments
      if (!emailData.attachments || emailData.attachments.length === 0) {
        await this.sendProcessingError(
          emailData.from,
          'no-id',
          'No attachment',
          'Please attach a report file (PDF, Excel, or CSV) to your email.'
        );
        return { success: false, error: 'No attachments found' };
      }

      // Find the first valid report attachment
      const validAttachment = emailData.attachments.find(att => 
        this.isValidReportFile(att.filename)
      );

      if (!validAttachment) {
        await this.sendProcessingError(
          emailData.from,
          'no-id',
          'Invalid file type',
          'Please attach a PDF, Excel (.xlsx, .xls), or CSV file.'
        );
        return { success: false, error: 'No valid report file found' };
      }

      // Additional processing would happen here...
      // For now, we'll return success
      return { success: true };

    } catch (error) {
      emailLogger.error('Failed to process inbound email', { error });
      return { success: false, error: 'Processing failed' };
    }
  }

  /**
   * Helper: Check if a filename represents a valid report file
   */
  private isValidReportFile(filename: string): boolean {
    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];
    const lowerFilename = filename.toLowerCase();
    return validExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  /**
   * Helper: Convert HTML to plain text (basic implementation)
   * This ensures emails are readable even without HTML support
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML spaces
      .replace(/&amp;/g, '&') // Replace HTML ampersands
      .replace(/&lt;/g, '<') // Replace HTML less than
      .replace(/&gt;/g, '>') // Replace HTML greater than
      .replace(/&#39;/g, "'") // Replace HTML apostrophes
      .replace(/&quot;/g, '"') // Replace HTML quotes
      .trim();
  }

  /**
   * Helper: Get organization ID from email address
   * In production, this would do a proper lookup
   */
  private async getOrgIdFromEmail(email: string): Promise<string> {
    // For MVP, return a placeholder
    // In production, look up the user and their organization
    return 'pending-org-lookup';
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();

/**
 * Example usage:
 * 
 * import { emailService } from './services/email';
 * 
 * // When a report is received
 * await emailService.sendReportReceivedConfirmation(
 *   'manager@property.com',
 *   'report-123',
 *   'monthly-financials.pdf'
 * );
 * 
 * // When processing completes
 * await emailService.sendAnalysisReport(
 *   'manager@property.com',
 *   'report-123',
 *   analysisHtml,
 *   'Your Property Analysis is Ready: 3 Critical Actions Needed'
 * );
 */