/**
 * Email Service
 * This module handles all email operations - sending insights and notifications
 * Uses nodemailer for SMTP-based email sending
 */

import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import config from '../config';
import { emailLogger } from '../utils/logger';
import { db } from './database';

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransporter({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.pass,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    emailLogger.error('SMTP configuration error:', { error: error.message });
  } else {
    emailLogger.info('SMTP server is ready to send emails');
  }
});

/**
 * Define the structure of incoming webhook data from CloudMailin
 * When someone emails a report, CloudMailin converts it to this format
 */
export interface InboundEmail {
  to: string;
  from: string;
  subject: string;
  plain?: string;
  html?: string;
  attachments?: Array<{
    file_name: string;
    content_type: string;
    content: string; // Base64 encoded
    size: number;
    disposition: string;
  }>;
  headers?: Record<string, string>;
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
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Report Received Successfully</h2>
        <p>Hello,</p>
        <p>We've received your property report <strong>${filename}</strong> and it's now being analyzed by our AI system.</p>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
          <strong>Report ID:</strong> ${reportId}<br>
          <strong>Status:</strong> Processing<br>
          <strong>Estimated Time:</strong> 2-5 minutes
        </p>
        <p>You'll receive another email shortly with your insights and action items.</p>
        <p>Best regards,<br>The Property Intelligence Team</p>
      </div>
    `,
    text: `Report Received Successfully\n\nWe've received your property report ${filename} and it's now being analyzed.\n\nReport ID: ${reportId}\nStatus: Processing\nEstimated Time: 2-5 minutes\n\nYou'll receive another email shortly with your insights.`,
  }),

  /**
   * Sent when analysis is complete with insights and action items
   * This is the main value delivery - actionable intelligence
   */
  analysisComplete: (reportId: string, insights: any[], actions: any[]) => ({
    subject: `Property Intelligence Report Ready - ${insights.length} Insights Found`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Property Intelligence Report</h2>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">Executive Summary</h3>
          <p>We've analyzed your property report and identified <strong>${insights.length} key insights</strong> and <strong>${actions.length} recommended actions</strong>.</p>
        </div>

        <h3 style="color: #2c3e50; margin-top: 30px;">🔍 Key Insights</h3>
        <ol style="line-height: 1.8;">
          ${insights.map(insight => `
            <li style="margin-bottom: 15px;">
              <strong>${insight.title}</strong><br>
              <span style="color: #666;">${insight.description}</span>
              ${insight.impact ? `<br><em style="color: #d32f2f;">Impact: ${insight.impact}</em>` : ''}
            </li>
          `).join('')}
        </ol>

        <h3 style="color: #2c3e50; margin-top: 30px;">📋 Recommended Actions</h3>
        <ul style="line-height: 1.8;">
          ${actions.map(action => `
            <li style="margin-bottom: 15px;">
              <strong>${action.title}</strong><br>
              <span style="color: #666;">${action.description}</span>
              ${action.priority ? `<br><span style="color: #f57c00;">Priority: ${action.priority}</span>` : ''}
              ${action.deadline ? `<br><span style="color: #388e3c;">Deadline: ${action.deadline}</span>` : ''}
            </li>
          `).join('')}
        </ul>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 30px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Report ID:</strong> ${reportId}<br>
            <strong>Analyzed:</strong> ${new Date().toLocaleString()}<br>
            <strong>Next Steps:</strong> Review the insights and take action on high-priority items.
          </p>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Questions? Reply to this email and we'll help you understand your report better.
        </p>
      </div>
    `,
    text: `Your Property Intelligence Report\n\n${insights.map((insight, i) => `${i + 1}. ${insight.title}: ${insight.description}`).join('\n\n')}\n\nRecommended Actions:\n${actions.map((action, i) => `${i + 1}. ${action.title}: ${action.description}`).join('\n\n')}`,
  }),

  /**
   * Sent when there's an error processing a report
   * Provides clear guidance on what went wrong and how to fix it
   */
  processingError: (reportId: string, errorType: string, errorMessage: string) => ({
    subject: `Issue Processing Your Property Report`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Issue Processing Your Report</h2>
        <p>We encountered an issue while processing your property report.</p>
        
        <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
          <strong>Error Type:</strong> ${errorType}<br>
          <strong>Details:</strong> ${errorMessage}<br>
          <strong>Report ID:</strong> ${reportId}
        </div>

        <h3>What You Can Do:</h3>
        <ul>
          <li>Ensure your file is in PDF, Excel (.xlsx), or CSV format</li>
          <li>Check that the file size is under 25MB</li>
          <li>Verify the file isn't password protected</li>
          <li>Make sure the file contains property-related data</li>
        </ul>

        <p>If you continue to experience issues, please reply to this email with your report attached, and we'll investigate.</p>
      </div>
    `,
    text: `Issue Processing Your Report\n\nError Type: ${errorType}\nDetails: ${errorMessage}\nReport ID: ${reportId}\n\nPlease ensure your file is in the correct format and try again.`,
  }),
};

/**
 * Email Service class that handles all email operations
 */
export class EmailService {
  /**
   * Send confirmation email when a report is received
   */
  async sendConfirmation(to: string, reportId: string, filename: string): Promise<void> {
    try {
      const template = emailTemplates.reportReceived(reportId, filename);
      
      const mailOptions: Mail.Options = {
        from: {
          name: config.email.fromName,
          address: config.email.fromEmail,
        },
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const info = await transporter.sendMail(mailOptions);
      
      emailLogger.info('Confirmation email sent', {
        to,
        reportId,
        messageId: info.messageId,
      });

      // Update database
      await db.updateEmailStatus(reportId, 'confirmation_sent');
      
    } catch (error) {
      emailLogger.error('Failed to send confirmation email', {
        error: error.message,
        to,
        reportId,
      });
      throw error;
    }
  }

  /**
   * Send analysis results with insights and action items
   */
  async sendResults(
    to: string, 
    reportId: string, 
    insights: any[], 
    actions: any[]
  ): Promise<void> {
    try {
      const template = emailTemplates.analysisComplete(reportId, insights, actions);
      
      const mailOptions: Mail.Options = {
        from: {
          name: config.email.fromName,
          address: config.email.fromEmail,
        },
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const info = await transporter.sendMail(mailOptions);
      
      emailLogger.info('Results email sent', {
        to,
        reportId,
        messageId: info.messageId,
        insightCount: insights.length,
        actionCount: actions.length,
      });

      // Update database
      await db.updateEmailStatus(reportId, 'results_sent');
      
    } catch (error) {
      emailLogger.error('Failed to send results email', {
        error: error.message,
        to,
        reportId,
      });
      throw error;
    }
  }

  /**
   * Send error notification when processing fails
   */
  async sendProcessingError(
    to: string,
    reportId: string,
    errorType: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const template = emailTemplates.processingError(reportId, errorType, errorMessage);
      
      const mailOptions: Mail.Options = {
        from: {
          name: config.email.fromName,
          address: config.email.fromEmail,
        },
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const info = await transporter.sendMail(mailOptions);
      
      emailLogger.info('Error notification sent', {
        to,
        reportId,
        messageId: info.messageId,
        errorType,
      });

      // Update database
      await db.updateEmailStatus(reportId, 'error_sent');
      
    } catch (error) {
      emailLogger.error('Failed to send error email', {
        error: error.message,
        to,
        reportId,
      });
      // Don't throw here - we don't want email failures to break the error handling flow
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      await transporter.verify();
      emailLogger.info('Email configuration verified successfully');
      return true;
    } catch (error) {
      emailLogger.error('Email configuration test failed', {
        error: error.message,
      });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Also export the interface for use in other modules
export { InboundEmail };

/**
 * Usage Examples:
 * 
 * // Send confirmation when report received
 * await emailService.sendConfirmation(
 *   'property.manager@example.com',
 *   'report-123',
 *   'October-2024-P&L.pdf'
 * );
 * 
 * // Send results after analysis
 * await emailService.sendResults(
 *   'property.manager@example.com',
 *   'report-123',
 *   insights,
 *   actions
 * );
 * 
 * // Send error notification
 * await emailService.sendProcessingError(
 *   'property.manager@example.com',
 *   'report-123',
 *   'Invalid Format',
 *   'The uploaded file appears to be corrupted'
 * );
 */