#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '.env') });

import { notificationService } from './apps/attachment-loop/services/notification.service.js';

// Test data
const testTasks = [
  {
    id: 'task-1',
    title: 'Review HVAC Maintenance Contract',
    description: `1. Contact current HVAC vendor for contract details
2. Request quotes from 2 alternative vendors
3. Compare pricing and service levels
4. Present recommendations to management
5. Execute new contract if approved`,
    priority: 2,
    assignedRole: 'PropertyManager',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4,
    potentialValue: 12000,
    sourceInsight: 'HVAC costs increased 35% YoY, significantly above market rates'
  },
  {
    id: 'task-2',
    title: 'Collect Overdue Rent - Units 205, 312, 418',
    description: `1. Send final payment reminder to tenants
2. Schedule in-person meetings if no response within 48h
3. Document all communication attempts
4. Initiate collection process if necessary
5. Report status to management`,
    priority: 1,
    assignedRole: 'Accounting',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 3,
    potentialValue: 7500,
    sourceInsight: 'Three units with rent payments over 30 days past due'
  },
  {
    id: 'task-3',
    title: 'Schedule Fire Safety Inspection',
    description: `1. Contact certified fire safety inspector
2. Schedule inspection for next week
3. Notify all tenants 48h in advance
4. Ensure access to all common areas
5. Document any issues found`,
    priority: 1,
    assignedRole: 'PropertyManager',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 2,
    potentialValue: 0,
    sourceInsight: 'Annual fire inspection due within 7 days - compliance requirement'
  }
];

async function testNotificationService() {
  console.log('🧪 Testing Notification Service\n');
  console.log('=' .repeat(60));
  
  const companyId = process.env.DEFAULT_COMPANY_ID || 'default-company-id';
  const propertyId = process.env.DEFAULT_PROPERTY_ID || 'default-property-id';
  
  try {
    // Test 1: Send Task Notifications
    console.log('\n📧 Test 1: Sending Task Notifications');
    console.log(`Sending ${testTasks.length} tasks to assigned roles...`);
    
    await notificationService.sendTaskNotifications(
      testTasks,
      'January 2024 P&L Statement.pdf',
      'analysis-123',
      'Sunset Gardens Apartments',
      companyId
    );
    
    console.log('✅ Task notifications sent successfully');
    
    // Test 2: Send Daily Digest
    console.log('\n📊 Test 2: Sending Daily Digest');
    console.log('Generating and sending daily digest email...');
    
    await notificationService.sendDailyDigest(companyId, propertyId);
    
    console.log('✅ Daily digest sent successfully');
    
    console.log('\n✅ All notification tests completed!');
    console.log('\nCheck your email for:');
    console.log('1. Task notification emails (grouped by role)');
    console.log('2. Daily digest summary email');
    
  } catch (error) {
    console.error('\n❌ Notification test failed:', error);
    console.error('\nMake sure:');
    console.error('1. SMTP credentials are configured in .env');
    console.error('2. Email addresses are set for each role');
    console.error('3. Network connection is available');
  }
}

// Run the test
testNotificationService().then(() => {
  console.log('\n🎉 Notification service test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});