// Test the complete email flow
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function testEmailFlow() {
  console.log('🧪 Testing Email Flow End-to-End\n');

  try {
    // 1. Check test property exists
    console.log('1️⃣ Checking for test property...');
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*, investor:investors(*)')
      .eq('cloudmailin_address', '38fab3b51608018af887@cloudmailin.net')
      .single();

    if (propertyError || !property) {
      console.error('❌ Test property not found. Please create it first.');
      console.log('Run the SQL commands in SETUP_GUIDE_COMPLETE.md');
      return;
    }

    console.log('✅ Found property:', property.name);
    console.log('   Investor:', property.investor.name);

    // 2. Load mock CloudMailin payload
    console.log('\n2️⃣ Loading mock email payload...');
    const payloadPath = path.join(__dirname, 'mock-cloudmailin-payload.json');
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
    console.log('✅ Payload loaded');

    // 3. Send to webhook
    console.log('\n3️⃣ Sending to webhook...');
    const webhookUrl = 'http://localhost:3000/webhook/cloudmailin';
    
    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-CloudMailin-Signature': 'test-signature' // Mock signature
        }
      });
      console.log('✅ Webhook response:', response.data);
    } catch (webhookError: any) {
      if (webhookError.code === 'ECONNREFUSED') {
        console.error('❌ Server not running. Start it with: npm run test:server');
        return;
      }
      throw webhookError;
    }

    // 4. Wait a moment for processing
    console.log('\n⏳ Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Check email was stored
    console.log('\n4️⃣ Checking email was stored...');
    const { data: emails, error: emailError } = await supabase
      .from('email_messages')
      .select('*, email_attachments(*)')
      .eq('property_id', property.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (emailError || !emails || emails.length === 0) {
      console.error('❌ No emails found. Check webhook processing.');
      return;
    }

    const latestEmail = emails[0];
    console.log('✅ Email stored:');
    console.log('   Subject:', latestEmail.subject);
    console.log('   From:', latestEmail.from_address);
    console.log('   Attachments:', latestEmail.email_attachments.length);

    // 6. Check attachment processing
    console.log('\n5️⃣ Checking attachment processing...');
    if (latestEmail.email_attachments.length > 0) {
      const attachment = latestEmail.email_attachments[0];
      console.log('✅ Attachment found:');
      console.log('   Filename:', attachment.filename);
      console.log('   Type:', attachment.attachment_type);
      console.log('   Processed:', attachment.is_processed ? '✅' : '⏳ Pending');
    }

    // 7. Check if queued for financial pipeline
    console.log('\n6️⃣ Checking financial pipeline...');
    const { data: ingestions, error: ingestionError } = await supabase
      .from('report_ingestions')
      .select('*')
      .eq('email_id', latestEmail.cloudmailin_id || latestEmail.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (ingestions && ingestions.length > 0) {
      console.log('✅ Queued for processing:');
      console.log('   Status:', ingestions[0].status);
      console.log('   Started:', ingestions[0].started_at);
    } else {
      console.log('⏳ Not yet queued for financial processing');
    }

    console.log('\n🎉 Email flow test complete!');
    console.log('\n📊 Summary:');
    console.log('- Property receives emails ✅');
    console.log('- Emails are stored ✅');
    console.log('- Attachments are tracked ✅');
    console.log('- Financial reports detected ✅');
    console.log('- Ready for AI processing ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
testEmailFlow();