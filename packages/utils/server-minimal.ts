/**
 * Minimal Server for CloudMailin Testing
 * Gets you up and running in 30 seconds!
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = 3000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'Prism Intelligence Server Running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      cloudmailin: '/api/webhooks/cloudmailin'
    }
  });
});

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// CloudMailin webhook endpoint
app.post('/api/webhooks/cloudmailin', (req, res) => {
  console.log('\n🎉 CloudMailin webhook received!');
  console.log('📧 Email Data:');
  console.log('  From:', req.body.from);
  console.log('  To:', req.body.to);
  console.log('  Subject:', req.body.subject);
  console.log('  Attachments:', req.body.attachments?.length || 0);
  
  if (req.body.attachments?.length > 0) {
    console.log('📎 Attachment Details:');
    req.body.attachments.forEach((att: any, i: number) => {
      console.log(`    ${i+1}. ${att.file_name || att.filename} (${att.content_type || att.type})`);
    });
  }
  
  console.log('📋 Full body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).json({
    success: true,
    message: 'Email received and logged successfully!',
    received_at: new Date().toISOString(),
    data: {
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      attachment_count: req.body.attachments?.length || 0
    }
  });
});

// Test endpoint
app.get('/api/test', (_req, res) => {
  res.json({
    message: '✅ CloudMailin endpoint ready!',
    webhook_url: 'http://localhost:3000/api/webhooks/cloudmailin',
    instructions: 'Use this URL in CloudMailin configuration'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Prism Intelligence Development Server Started!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔌 CloudMailin Webhook: http://localhost:${PORT}/api/webhooks/cloudmailin`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Set up ngrok: ngrok http 3000');
  console.log('   2. Copy the ngrok URL to CloudMailin');
  console.log('   3. Test by sending an email!\n');
});

export default app;
