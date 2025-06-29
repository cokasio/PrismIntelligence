/**
 * 🚀 Prism Intelligence - Clean Development Server
 * Ready for CloudMailin integration!
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Homepage
app.get('/', (_req, res) => {
  res.json({
    status: '🚀 Prism Intelligence Server Running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    cloudmailin_email: '38fab3b51608018af887@cloudmailin.net',
    endpoints: {
      health: '/health',
      cloudmailin_webhook: '/webhooks/cloudmailin',
      test: '/test'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Server is running perfectly!'
  });
});

// 🎯 CloudMailin Webhook - This is where the magic happens!
app.post('/webhooks/cloudmailin', (req, res) => {
  console.log('\n🎉 EMAIL RECEIVED!');
  console.log('='.repeat(50));
  
  const emailData = {
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    plain: req.body.plain,
    html: req.body.html,
    attachments: req.body.attachments || []
  };
  
  console.log('📧 Email Details:');
  console.log(`   From: ${emailData.from}`);
  console.log(`   To: ${emailData.to}`);
  console.log(`   Subject: ${emailData.subject}`);
  console.log(`   Attachments: ${emailData.attachments.length}`);
  
  if (emailData.attachments.length > 0) {
    console.log('\n📎 Attachments Found:');
    emailData.attachments.forEach((att: any, index: number) => {
      console.log(`   ${index + 1}. ${att.file_name || att.filename}`);
      console.log(`      Type: ${att.content_type || att.type}`);
      console.log(`      Size: ${att.content ? 'Data present' : 'No data'}`);
    });
  }
  
  console.log('\n📋 Full Request Body (first 500 chars):');
  console.log(JSON.stringify(req.body, null, 2).substring(0, 500) + '...');
  console.log('='.repeat(50));
  
  // Respond to CloudMailin
  res.status(200).json({
    success: true,
    message: 'Email processed successfully by Prism Intelligence!',
    received_at: new Date().toISOString(),
    data: {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      attachment_count: emailData.attachments.length
    }
  });
});

// Test endpoint
app.get('/test', (_req, res) => {
  res.json({
    status: '✅ All systems operational!',
    cloudmailin_email: '38fab3b51608018af887@cloudmailin.net',
    webhook_url: 'http://localhost:3000/webhooks/cloudmailin',
    message: 'Send an email to test the integration!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '🚀'.repeat(20));
  console.log('🚀 PRISM INTELLIGENCE SERVER STARTED! 🚀');
  console.log('🚀'.repeat(20));
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔌 Webhook: http://localhost:${PORT}/webhooks/cloudmailin`);
  console.log(`📧 CloudMailin Email: 38fab3b51608018af887@cloudmailin.net`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Send email to: 38fab3b51608018af887@cloudmailin.net');
  console.log('   2. Watch this console for incoming emails!');
  console.log('   3. Set up ngrok for CloudMailin connection');
  console.log('\n✅ Ready for property management reports!\n');
});
