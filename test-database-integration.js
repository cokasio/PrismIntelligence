#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '.env') });

import { taskDatabase } from './apps/attachment-loop/services/database/task-database.service.js';

// Test data
const testTasks = [
  {
    title: "Schedule HVAC Maintenance",
    description: "Contact vendor and schedule comprehensive HVAC system check",
    priority: 2,
    assignedRole: "Maintenance",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    estimatedHours: 2,
    potentialValue: 5000,
    sourceInsight: "HVAC efficiency degraded by 25%"
  },
  {
    title: "Collect Overdue Rent",
    description: "Contact tenants in units 205, 312, 418 for payment",
    priority: 1,
    assignedRole: "Accounting",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    estimatedHours: 3,
    potentialValue: 7500,
    sourceInsight: "Three units with payments over 30 days late"
  }
];

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration\n');
  console.log('=' .repeat(60));
  
  const companyId = process.env.DEFAULT_COMPANY_ID || 'default-company-id';
  const propertyId = process.env.DEFAULT_PROPERTY_ID || 'default-property-id';
  const reportId = `test-report-${Date.now()}`;
  
  try {
    // Test 1: Store Tasks
    console.log('\n📋 Test 1: Storing Tasks');
    const storedTasks = await taskDatabase.storeTasks(testTasks, reportId, companyId, propertyId);
    console.log(`✅ Stored ${storedTasks?.length || 0} tasks successfully`);
    
    // Test 2: Create Analysis Summary
    console.log('\n📊 Test 2: Creating Analysis Summary');
    const analysisSummary = await taskDatabase.createAnalysisSummary(
      reportId,
      companyId,
      propertyId,
      {
        documentName: 'test-document.pdf',
        documentType: 'financial_report',
        processingStartTime: new Date(Date.now() - 30000), // 30 seconds ago
        processingEndTime: new Date(),
        insightsCount: 5,
        highPriorityInsightsCount: 2,
        tasksGeneratedCount: testTasks.length,
        totalPotentialValue: 12500,
        modelsUsed: ['claude', 'gemini']
      }
    );
    
    if (analysisSummary) {
      console.log(`✅ Analysis summary created`);
      console.log(`   - Time saved: ${analysisSummary.time_saved_hours?.toFixed(1)} hours`);
      console.log(`   - Processing time: ${analysisSummary.processing_duration_seconds} seconds`);
    }
    
    // Test 3: Update ROI Metrics
    console.log('\n💰 Test 3: Updating ROI Metrics');
    const roiMetrics = await taskDatabase.updateROIMetrics(
      companyId,
      propertyId,
      {
        documentsProcessed: 1,
        analysesCompleted: 1,
        tasksGenerated: testTasks.length,
        totalPotentialValue: 12500,
        timeSavedHours: 2.5,
        insightsGenerated: 5,
        highPriorityInsights: 2
      }
    );
    console.log(`✅ ROI metrics updated`);
    
    // Test 4: Get Active Tasks
    console.log('\n🔍 Test 4: Retrieving Active Tasks');
    const activeTasks = await taskDatabase.getActiveTasks(companyId, propertyId);
    console.log(`✅ Found ${activeTasks.length} active tasks`);
    activeTasks.slice(0, 3).forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.title} (Due: ${new Date(task.due_date).toLocaleDateString()})`);
    });
    
    // Test 5: Get ROI Dashboard
    console.log('\n📈 Test 5: ROI Dashboard');
    const roiDashboard = await taskDatabase.getROIDashboard(companyId, propertyId);
    if (roiDashboard) {
      console.log(`✅ ROI Dashboard Data:`);
      console.log(`   - Total time saved: ${roiDashboard.total_time_saved || 0} hours`);
      console.log(`   - Tasks generated: ${roiDashboard.total_tasks_generated || 0}`);
      console.log(`   - Tasks completed: ${roiDashboard.total_tasks_completed || 0}`);
      console.log(`   - Potential value: $${(roiDashboard.total_value_realized || 0).toLocaleString()}`);
    }
    
    console.log('\n✅ All database integration tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.error('\nMake sure:');
    console.error('1. Supabase credentials are set in .env');
    console.error('2. Database migration has been run');
    console.error('3. Default company and property exist');
  }
}

// Run the test
testDatabaseIntegration().then(() => {
  console.log('\n🎉 Database integration test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});