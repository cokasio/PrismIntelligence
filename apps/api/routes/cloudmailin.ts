/**
 * CloudMailin Integration for Prism Intelligence
 * Handles incoming emails with attachments for processing
 */

import express from 'express';
import multer from 'multer';
import { integrationOrchestrator } from '../services/integration-orchestrator';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

/**
 * CloudMailin webhook endpoint
 * Receives emails and processes attachments
 */
router.post('/cloudmailin/webhook', upload.any(), async (req, res) => {
  try {
    console.log('📧 Received email from CloudMailin');
    
    // Parse CloudMailin payload
    const email = {
      from: req.body.envelope?.from || req.body.from,
      to: req.body.envelope?.to || req.body.to,
      subject: req.body.headers?.subject || req.body.subject || 'No Subject',
      text: req.body.plain || req.body.text || '',
      html: req.body.html || '',
      received: new Date().toISOString(),
      attachments: []
    };

    // Process attachments
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        email.attachments.push({
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          buffer: file.buffer
        });
      }
    }

    // Save email metadata
    const emailId = uuidv4();
    const emailDir = path.join(__dirname, '../../../incoming/emails');
    await fs.mkdir(emailDir, { recursive: true });
    
    const emailMetadata = {
      id: emailId,
      from: email.from,
      to: email.to,
      subject: email.subject,
      body: email.text,
      received: email.received,
      attachmentCount: email.attachments.length,
      attachments: email.attachments.map(a => ({
        filename: a.filename,
        size: a.size,
        mimetype: a.mimetype
      }))
    };
    
    await fs.writeFile(
      path.join(emailDir, `${emailId}.json`),
      JSON.stringify(emailMetadata, null, 2)
    );

    // Process each attachment
    const processingTasks = [];
    
    for (const attachment of email.attachments) {
      // Determine document type
      const documentType = determineDocumentType(attachment.filename, email.subject);
      
      // Create processing task
      const taskId = uuidv4();
      const task = integrationOrchestrator.processDocument({
        taskId,
        file: attachment.buffer,
        filename: attachment.filename,
        userId: 'email-user', // You might extract this from email
        documentType,
        metadata: {
          source: 'email',
          emailId,
          from: email.from,
          subject: email.subject
        }
      });
      
      processingTasks.push(task);
      
      console.log(`📎 Processing attachment: ${attachment.filename} (${documentType})`);
    }

    // Wait for all attachments to start processing
    Promise.all(processingTasks).catch(error => {
      console.error('Error processing email attachments:', error);
    });

    // Respond to CloudMailin immediately
    res.status(200).json({ 
      status: 'accepted',
      emailId,
      attachmentsQueued: email.attachments.length,
      message: 'Email received and queued for processing'
    });

  } catch (error) {
    console.error('CloudMailin webhook error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process email' 
    });
  }
});

/**
 * Determine document type from filename and subject
 */
function determineDocumentType(filename: string, subject: string): string {
  const lower = filename.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Financial documents
  if (lower.includes('ledger') || lower.includes('gl') || 
      lower.includes('p&l') || lower.includes('pnl') ||
      lower.includes('financial') || lower.includes('budget') ||
      subjectLower.includes('financial') || subjectLower.includes('budget')) {
    return 'financial';
  }
  
  // Lease documents
  if (lower.includes('lease') || lower.includes('rental') ||
      lower.includes('tenant') || subjectLower.includes('lease')) {
    return 'lease';
  }
  
  // Maintenance documents
  if (lower.includes('maintenance') || lower.includes('repair') ||
      lower.includes('work order') || subjectLower.includes('maintenance')) {
    return 'maintenance';
  }
  
  return 'general';
}

/**
 * Test endpoint for CloudMailin configuration
 */
router.get('/cloudmailin/test', (req, res) => {
  res.json({
    status: 'ready',
    webhook: `${process.env.API_URL || 'http://localhost:3000'}/cloudmailin/webhook`,
    instructions: {
      1: 'Configure CloudMailin to POST to the webhook URL above',
      2: 'Set format to: Multipart (normalized)',
      3: 'Enable attachment delivery',
      4: 'Test by sending an email with attachments to your CloudMailin address'
    }
  });
});

export default router;
