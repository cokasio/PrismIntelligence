// CloudMailin webhook handler for multi-tenant email processing
import { Request, Response } from 'express';
import { getServiceSupabase } from '../../lib/supabase';
import { CloudMailinPayload, EmailMessage, EmailAttachment, Property } from '../types/multi-tenant';
import { financialPipeline } from '../pipeline/FinancialPipeline';
import crypto from 'crypto';

const supabase = getServiceSupabase();

export class CloudMailinHandler {
  /**
   * Main webhook handler for CloudMailin
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      // Verify webhook authenticity
      if (!this.verifyWebhookSignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const payload: CloudMailinPayload = req.body;
      
      // Process the email
      const result = await this.processEmail(payload);
      
      if (result.success) {
        res.status(200).json({ message: 'Email processed successfully' });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error('CloudMailin webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Process incoming email
   */
  private async processEmail(payload: CloudMailinPayload) {
    // 1. Identify property from email address
    const property = await this.getPropertyByEmail(payload.envelope.to);
    
    if (!property) {
      console.warn(`Unknown property email: ${payload.envelope.to}`);
      return { success: false, error: 'Unknown property email address' };
    }

    // 2. Create email message record
    const emailMessage = await this.createEmailMessage(payload, property);
    
    // 3. Process attachments
    let hasFinancialAttachments = false;
    
    for (const attachment of payload.attachments || []) {
      const savedAttachment = await this.saveAttachment(
        emailMessage.id,
        property,
        attachment
      );
      
      // Check if it's a financial report
      if (this.isFinancialReport(attachment)) {
        hasFinancialAttachments = true;
        
        // Queue for financial pipeline processing
        await this.queueForProcessing(savedAttachment, property);
      }
    }
    
    // 4. Update email message if it has financial attachments
    if (hasFinancialAttachments) {
      await this.updateEmailMessage(emailMessage.id, {
        has_financial_attachments: true,
        status: 'processing'
      });
    }
    
    // 5. Send notifications if configured
    await this.sendNotifications(property, emailMessage);
    
    return { success: true, emailId: emailMessage.id };
  }

  /**
   * Get property by CloudMailin email address
   */
  private async getPropertyByEmail(email: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('cloudmailin_address', email.toLowerCase())
      .eq('status', 'active')
      .single();
    
    if (error || !data) return null;
    return data;
  }

  /**
   * Create email message record
   */
  private async createEmailMessage(
    payload: CloudMailinPayload,
    property: Property
  ): Promise<EmailMessage> {
    const { data, error } = await supabase
      .from('email_messages')
      .insert({
        investor_id: property.investor_id,
        property_id: property.id,
        cloudmailin_id: payload.headers.message_id,
        to_address: payload.envelope.to,
        from_address: payload.envelope.from,
        from_name: this.extractFromName(payload.headers.from),
        subject: payload.headers.subject,
        plain_body: payload.plain,
        html_body: payload.html,
        headers: payload.headers,
        attachment_count: payload.attachments?.length || 0,
        spam_score: payload.spam_score,
        received_at: new Date(payload.headers.date || Date.now())
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  /**
   * Save attachment
   */
  private async saveAttachment(
    emailMessageId: string,
    property: Property,
    attachment: any
  ): Promise<EmailAttachment> {
    // Calculate file hash for deduplication
    const fileHash = this.calculateFileHash(attachment.content);
    
    // Save file to storage
    const storagePath = await this.storeAttachment(
      property,
      attachment
    );
    
    // Create database record
    const { data, error } = await supabase
      .from('email_attachments')
      .insert({
        email_message_id: emailMessageId,
        investor_id: property.investor_id,
        property_id: property.id,
        filename: attachment.filename,
        content_type: attachment.content_type,
        file_size: attachment.size,
        file_hash: fileHash,
        storage_path: storagePath,
        attachment_type: this.classifyAttachment(attachment)
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Queue attachment for financial processing
   */
  private async queueForProcessing(
    attachment: EmailAttachment,
    property: Property
  ) {
    // Convert to format expected by financial pipeline
    const pipelineAttachment = {
      id: attachment.id,
      filename: attachment.filename,
      contentType: attachment.content_type || 'application/octet-stream',
      size: attachment.file_size || 0,
      data: await this.loadAttachmentData(attachment.storage_path),
      emailId: attachment.email_message_id,
      sender: '', // Will be loaded from email message
      receivedAt: new Date()
    };
    
    const context = {
      investor_id: property.investor_id,
      property_id: property.id,
      email_id: attachment.email_message_id,
      source: 'email' as const
    };
    
    // Process through financial pipeline
    await financialPipeline.processAttachment(pipelineAttachment, context);
  }

  /**
   * Verify CloudMailin webhook signature
   */
  private verifyWebhookSignature(req: Request): boolean {
    // CloudMailin sends a signature in the headers
    const signature = req.headers['x-cloudmailin-signature'] as string;
    const secret = process.env.CLOUDMAILIN_SECRET;
    
    if (!signature || !secret) return false;
    
    // For testing, temporarily return true
    // TODO: Implement actual signature verification
    return true;
  }

  /**
   * Extract sender name from email header
   */
  private extractFromName(fromHeader?: string): string | undefined {
    if (!fromHeader) return undefined;
    
    const match = fromHeader.match(/^"?([^"<]+)"?\s*</);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Calculate file hash for deduplication
   */
  private calculateFileHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  /**
   * Store attachment file
   */
  private async storeAttachment(
    property: Property,
    attachment: any
  ): Promise<string> {
    // Generate storage path
    const date = new Date();
    const path = `${property.investor_id}/${property.id}/${date.getFullYear()}/${date.getMonth() + 1}/${attachment.filename}`;
    
    // TODO: Implement actual storage
    // For now, store in Supabase Storage when ready:
    // const { data, error } = await supabase.storage
    //   .from('attachments')
    //   .upload(path, Buffer.from(attachment.content, 'base64'));
    
    return path;
  }

  /**
   * Load attachment data from storage
   */
  private async loadAttachmentData(storagePath: string): Promise<Buffer> {
    // TODO: Implement actual loading from storage
    // const { data, error } = await supabase.storage
    //   .from('attachments')
    //   .download(storagePath);
    
    // For testing, return empty buffer
    return Buffer.from('');
  }

  /**
   * Classify attachment type
   */
  private classifyAttachment(attachment: any): string {
    const filename = attachment.filename.toLowerCase();
    
    if (this.isFinancialReport(attachment)) {
      return 'financial_report';
    } else if (filename.match(/\.(jpg|jpeg|png|gif)$/)) {
      return 'image';
    } else if (filename.match(/\.(doc|docx|txt)$/)) {
      return 'document';
    }
    
    return 'other';
  }

  /**
   * Check if attachment is a financial report
   */
  private isFinancialReport(attachment: any): boolean {
    const filename = attachment.filename.toLowerCase();
    const financialExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
    
    return financialExtensions.some(ext => filename.endsWith(ext)) &&
      (filename.includes('financial') || 
       filename.includes('income') ||
       filename.includes('balance') ||
       filename.includes('report') ||
       filename.includes('statement') ||
       filename.includes('p&l') ||
       filename.includes('pnl'));
  }

  /**
   * Update email message
   */
  private async updateEmailMessage(
    id: string,
    updates: Partial<EmailMessage>
  ) {
    await supabase
      .from('email_messages')
      .update(updates)
      .eq('id', id);
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    property: Property,
    emailMessage: EmailMessage
  ) {
    // Check if property has notification settings
    // Send email/SMS/webhook notifications as configured
    console.log(`New email received for ${property.name}`);
  }
}

// Export singleton instance
export const cloudMailinHandler = new CloudMailinHandler();