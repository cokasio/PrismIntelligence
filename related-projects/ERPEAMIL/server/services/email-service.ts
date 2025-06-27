import { Readable } from 'stream';
import { simpleParser, ParsedMail, Attachment } from 'mailparser';
import { Resend } from 'resend';

export interface EmailDocument {
  filename: string;
  content: Buffer;
  contentType: string;
  size: number;
}

export interface ProcessedEmail {
  from: string;
  subject: string;
  receivedAt: Date;
  documents: EmailDocument[];
  bodyText?: string;
}

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }

  async sendNotificationEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not provided, skipping email notification');
        return false;
      }

      await this.resend.emails.send({
        from: 'Financial Analysis <noreply@yourdomain.com>',
        to: [to],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1B2951;">Financial Analysis Update</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              ${content}
            </div>
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
              This email was sent from your Financial Analysis Platform.
            </p>
          </div>
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }
  
  async parseEmailMessage(rawEmailData: string | Buffer): Promise<ProcessedEmail> {
    const stream = typeof rawEmailData === 'string' ? 
      Readable.from([rawEmailData]) : 
      Readable.from([rawEmailData]);
    
    const parsed: ParsedMail = await simpleParser(stream);
    
    const documents: EmailDocument[] = [];
    
    // Process attachments
    if (parsed.attachments && parsed.attachments.length > 0) {
      for (const attachment of parsed.attachments) {
        if (this.isFinancialDocument(attachment)) {
          documents.push({
            filename: attachment.filename || 'unknown.csv',
            content: attachment.content,
            contentType: attachment.contentType || 'text/csv',
            size: attachment.size || attachment.content.length
          });
        }
      }
    }

    return {
      from: parsed.from?.text || 'unknown@example.com',
      subject: parsed.subject || 'No Subject',
      receivedAt: parsed.date || new Date(),
      documents,
      bodyText: parsed.text
    };
  }

  private isFinancialDocument(attachment: Attachment): boolean {
    const filename = attachment.filename?.toLowerCase() || '';
    const supportedExtensions = ['.csv', '.xlsx', '.xls'];
    const financialKeywords = ['income', 'balance', 'cash', 'financial', 'statement', 'gl'];
    
    // Check file extension
    const hasValidExtension = supportedExtensions.some(ext => filename.endsWith(ext));
    
    // Check for financial keywords in filename
    const hasFinancialKeywords = financialKeywords.some(keyword => 
      filename.includes(keyword)
    );

    return hasValidExtension && (hasFinancialKeywords || filename.includes('pm_gl'));
  }

  async extractCSVFromAttachment(attachment: EmailDocument): Promise<string> {
    if (attachment.contentType.includes('csv')) {
      return attachment.content.toString('utf-8');
    }
    
    // For Excel files, you would need a library like 'xlsx' to convert to CSV
    // For now, we'll just throw an error for non-CSV files
    throw new Error('Only CSV files are currently supported for email processing');
  }

  // Webhook endpoint handler for email providers
  processWebhookData(webhookData: any): ProcessedEmail {
    // This would vary based on the email service provider (SendGrid, Mailgun, etc.)
    // For now, return a mock structure
    throw new Error('Webhook processing not implemented - specific to email provider');
  }
}

export const emailService = new EmailService();
