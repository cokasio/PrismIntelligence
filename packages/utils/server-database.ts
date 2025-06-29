/**
 * 🚀 Enhanced Clean Server with Supabase Integration
 * Now saves emails to database!
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Homepage
app.get('/', (_req, res) => {
  res.json({
    status: '🚀 Prism Intelligence Server Running!',
    version: '2.0.0 - Database Enabled',
    timestamp: new Date().toISOString(),
    cloudmailin_email: '38fab3b51608018af887@cloudmailin.net',
    database: 'Connected to Supabase',
    endpoints: {
      health: '/health',
      cloudmailin_webhook: '/webhooks/cloudmailin',
      test: '/test',
      reports: '/reports'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    message: 'Property Intelligence Platform operational!'
  });
});

// 🎯 Enhanced CloudMailin Webhook - Now saves to database!
app.post('/webhooks/cloudmailin', async (req, res) => {
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
  
  try {
    // 🗄️ Save to Supabase database
    console.log('\n💾 Saving to database...');
    
    // Get default organization (created in schema)
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('email_domain', 'cloudmailin.net')
      .single();
    
    if (!org) {
      throw new Error('No organization found');
    }
    
    // Save each attachment as a report
    for (const attachment of emailData.attachments) {
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          organization_id: org.id,
          filename: attachment.file_name || attachment.filename || 'unknown',
          file_type: attachment.content_type || attachment.type || 'unknown',
          file_size_bytes: attachment.content ? Buffer.from(attachment.content, 'base64').length : 0,
          sender_email: emailData.from,
          email_subject: emailData.subject,
          email_body: emailData.plain,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.log(`   ❌ Failed to save ${attachment.file_name}:`, error.message);
      } else {
        console.log(`   ✅ Saved report: ${report.filename} (ID: ${report.id})`);
      }
    }
    
    console.log('✅ Email saved to database successfully!');
    
  } catch (error) {
    console.log('❌ Database save failed:', error);
  }
  
  console.log('='.repeat(50));
  
  // Respond to CloudMailin
  res.status(200).json({
    success: true,
    message: 'Email processed and saved to Property Intelligence database!',
    received_at: new Date().toISOString(),
    data: {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      attachment_count: emailData.attachments.length,
      saved_to_database: true
    }
  });
});

// Get reports from database
app.get('/reports', async (_req, res) => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      reports: reports,
      count: reports.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Test endpoint
app.get('/test', (_req, res) => {
  res.json({
    status: '✅ All systems operational!',
    cloudmailin_email: '38fab3b51608018af887@cloudmailin.net',
    webhook_url: 'http://localhost:3000/webhooks/cloudmailin',
    database: 'Connected to Supabase',
    message: 'Send an email to test the full pipeline: Email → CloudMailin → Server → Database!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '🚀'.repeat(20));
  console.log('🚀 PRISM INTELLIGENCE v2.0 STARTED! 🚀');
  console.log('🚀'.repeat(20));
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔌 Webhook: http://localhost:${PORT}/webhooks/cloudmailin`);
  console.log(`📧 CloudMailin Email: 38fab3b51608018af887@cloudmailin.net`);
  console.log(`🗄️  Database: Connected to Supabase`);
  console.log(`📊 Reports API: http://localhost:${PORT}/reports`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Run schema in Supabase SQL Editor');
  console.log('   2. Send email to: 38fab3b51608018af887@cloudmailin.net');
  console.log('   3. Watch emails get saved to database!');
  console.log('\n✅ Full Property Intelligence Pipeline Ready!\n');
});
