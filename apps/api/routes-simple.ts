/**
 * Simplified API Routes for Development
 * This gets your server running quickly for CloudMailin testing
 */

import { Router, Request, Response } from 'express';
import { apiLogger } from '../utils/logger';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * CloudMailin Inbound Email Webhook - Simplified for testing
 */
router.post('/webhooks/cloudmailin', async (req: Request, res: Response) => {
  try {
    console.log('📧 CloudMailin webhook received!');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Extract basic email data
    const {
      to,
      from,
      subject,
      attachments = []
    } = req.body;

    apiLogger.info('CloudMailin webhook received', {
      to,
      from,
      subject,
      attachmentCount: attachments.length
    });

    // Log attachment info
    if (attachments.length > 0) {
      console.log('📎 Attachments received:');
      attachments.forEach((att: any, index: number) => {
        console.log(`  ${index + 1}. ${att.file_name || att.filename} (${att.content_type || att.type})`);
      });
    }

    // For now, just respond with success
    // Later you can add queue processing here
    res.status(200).json({
      success: true,
      message: 'Email received successfully',
      data: {
        to,
        from,
        subject,
        attachmentCount: attachments.length
      }
    });

  } catch (error) {
    console.error('❌ CloudMailin webhook error:', error);
    apiLogger.error('CloudMailin webhook failed', { error });
    
    // CloudMailin will retry on 5xx errors
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Test endpoint to verify server is working
 */
router.get('/test', (_req: Request, res: Response) => {
  res.json({
    message: 'Prism Intelligence API is working!',
    timestamp: new Date().toISOString(),
    cloudmailin_webhook_url: '/api/webhooks/cloudmailin'
  });
});

export default router;
