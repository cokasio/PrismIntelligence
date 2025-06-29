/**
 * Test CloudMailin Webhook Locally
 * Run this to simulate CloudMailin sending a report to your webhook
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/cloudmailin';
const TEST_REPORT_PATH = path.join(__dirname, '../../sample-data/sample-property-report.pdf');

// CloudMailin webhook payload format
const mockCloudMailinPayload = {
  to: 'tenant123@reports.yourdomain.com',
  from: 'property.manager@clientcompany.com',
  subject: 'October 2024 Property Report',
  plain: 'Please find attached the monthly property report.',
  html: '<p>Please find attached the monthly property report.</p>',
  headers: {
    'Message-ID': '<test123@cloudmailin.net>',
    'Date': new Date().toISOString(),
  },
  attachments: [
    {
      file_name: 'October-2024-Property-Report.pdf',
      content_type: 'application/pdf',
      size: 0, // Will be calculated
      disposition: 'attachment',
      content: '' // Will be filled with base64
    }
  ]
};

async function testCloudMailinWebhook() {
  try {
    console.log('🧪 Testing CloudMailin Webhook...\n');
    
    // Read test report file
    if (fs.existsSync(TEST_REPORT_PATH)) {
      const fileBuffer = fs.readFileSync(TEST_REPORT_PATH);
      mockCloudMailinPayload.attachments[0].content = fileBuffer.toString('base64');
      mockCloudMailinPayload.attachments[0].size = fileBuffer.length;
      console.log('✅ Loaded test report:', TEST_REPORT_PATH);
      console.log(`📄 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB\n`);
    } else {
      console.log('⚠️  No test file found, sending without attachment');
      mockCloudMailinPayload.attachments = [];
    }
    
    // Send to webhook
    console.log('📧 Sending to webhook:', WEBHOOK_URL);
    console.log('From:', mockCloudMailinPayload.from);
    console.log('To:', mockCloudMailinPayload.to);
    console.log('Tenant ID extracted: tenant123\n');
    
    const response = await axios.post(WEBHOOK_URL, mockCloudMailinPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CloudMailin/Test'
      }
    });
    
    console.log('✅ Webhook Response:', response.status, response.statusText);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.reportId) {
      console.log(`\n🎉 Success! Report ID: ${response.data.reportId}`);
      console.log('Check your processing queue and database for this report.');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\nMake sure your server is running: npm run dev');
  }
}

// Test different scenarios
async function runAllTests() {
  console.log('=== CloudMailin Webhook Test Suite ===\n');
  
  // Test 1: Valid report
  await testCloudMailinWebhook();
  
  console.log('\n--- Test 2: No attachments ---');
  const originalAttachments = mockCloudMailinPayload.attachments;
  mockCloudMailinPayload.attachments = [];
  await testCloudMailinWebhook();
  mockCloudMailinPayload.attachments = originalAttachments;
  
  console.log('\n--- Test 3: Multiple tenants ---');
  const tenants = ['tenant1', 'tenant2', 'demo'];
  for (const tenant of tenants) {
    mockCloudMailinPayload.to = `${tenant}@reports.yourdomain.com`;
    console.log(`\nTesting tenant: ${tenant}`);
    await testCloudMailinWebhook();
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\n✅ All tests completed!');
  }).catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { testCloudMailinWebhook };
