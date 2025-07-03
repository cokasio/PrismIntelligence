#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '.env') });

async function testCloudMailin() {
  console.log('🧪 Testing CloudMailin SMTP Connection\n');
  console.log('=' .repeat(60));
  
  // CloudMailin configuration
  const config = {
    host: process.env.SMTP_HOST || 'smtp.cloudmta.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '7d5f948c506dea73',
      pass: process.env.SMTP_PASS || 'j7NAVZWcxHntjTqh2ngSemUN'
    }
  };
  
  console.log('📧 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.auth.user}`);
  console.log(`   Secure: ${config.secure}`);
  console.log();
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(config);
    
    // Verify connection
    console.log('🔌 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');
    console.log();
    
    // Send test email
    console.log('📨 Sending test email...');
    const testEmail = {
      from: process.env.CLOUDMAILIN_FROM_ADDRESS || 'test@prismintel.ai',
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: '🧪 CloudMailin Test - Prism Intelligence',
      html: `
        <h2>CloudMailin SMTP Test</h2>
        <p>This is a test email from Prism Intelligence notification service.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${config.host}</li>
          <li>Port: ${config.port}</li>
          <li>From: ${process.env.CLOUDMAILIN_FROM_ADDRESS || 'test@prismintel.ai'}</li>
        </ul>
        <p style="color: #ef4444; font-weight: bold;">
          ⚠️ Note: Your CloudMailin account is in TEST MODE.<br>
          This email will be received by CloudMailin but NOT delivered to the recipient.<br>
          Check your CloudMailin dashboard to see this message.
        </p>
      `,
      text: `CloudMailin SMTP Test\n\nThis is a test email from Prism Intelligence.\nTimestamp: ${new Date().toISOString()}`
    };
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log();
    
    console.log('📊 CloudMailin Test Mode Information:');
    console.log('   1. Your email has been accepted by CloudMailin');
    console.log('   2. In TEST MODE, emails are NOT delivered to recipients');
    console.log('   3. You can view this message in your CloudMailin dashboard:');
    console.log('      https://www.cloudmailin.com/accounts/cokasiotesting/messages');
    console.log();
    console.log('   To send real emails:');
    console.log('   1. Add and verify a domain in CloudMailin');
    console.log('   2. Update your from address to use the verified domain');
    console.log('   3. CloudMailin will then deliver emails to actual recipients');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error();
    console.error('Common issues:');
    console.error('1. Check your firewall allows outbound connections on port 587');
    console.error('2. Verify your CloudMailin credentials are correct');
    console.error('3. Try alternative port 2525 if 587 is blocked');
    console.error('4. Ensure SMTP_USER and SMTP_PASS are set in .env');
  }
}

// Run the test
testCloudMailin().then(() => {
  console.log('\n✅ CloudMailin connection test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});