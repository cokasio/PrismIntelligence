#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '.env') });

import { claudeService } from './apps/attachment-loop/services/ai/claude.service.js';

// Test document with various issues to trigger different task types
const testDocument = `
PROPERTY MANAGEMENT REPORT
Property: Sunset Gardens Apartments
Period: January 2024

EXECUTIVE SUMMARY
The property is experiencing significant operational challenges with maintenance costs 35% over budget and three critical safety issues requiring immediate attention.

FINANCIAL PERFORMANCE
- Total Revenue: $125,000 (Budget: $130,000)
- Total Expenses: $98,000 (Budget: $85,000)
- Net Operating Income: $27,000 (Budget: $45,000)

KEY VARIANCES & ISSUES:

1. URGENT - SAFETY ISSUES (HIGH PRIORITY)
   - Fire alarm system malfunction in Building B (reported 3 days ago)
   - Broken stairway railing in Building C (liability risk)
   - Standing water in parking lot creating slip hazard

2. FINANCIAL CONCERNS (HIGH PRIORITY)
   - Maintenance costs: $15,000 actual vs $11,000 budgeted (+35%)
   - Three tenants with rent over 60 days past due: Total $9,750
   - Utility costs increased 25% due to HVAC inefficiency

3. OPERATIONAL ISSUES (MEDIUM PRIORITY)
   - Vacancy rate at 12% (target is 5%)
   - 5 units need renovation before re-leasing
   - Vendor invoices processing delayed by 30+ days

4. STRATEGIC OPPORTUNITIES (LOW PRIORITY)
   - Market rents have increased 8% in neighborhood
   - Opportunity to add covered parking for premium
   - Energy efficiency upgrades could save $3,000/month

TENANT CONCERNS:
- 15 maintenance requests pending over 7 days
- Multiple complaints about noise from construction next door
- Request for security camera upgrades

UPCOMING DEADLINES:
- Property insurance renewal due in 15 days
- Annual fire inspection scheduled next week
- Q1 tax payment due in 30 days
`;

async function testEnhancedTaskGeneration() {
  console.log('🧪 Testing Enhanced Task Generation\n');
  console.log('=' .repeat(60));
  
  try {
    // Test with a complex document
    const result = await claudeService.analyzePropertyDocument(
      testDocument,
      'property-report-jan-2024.pdf',
      'Property Management Report'
    );
    
    // Display results
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log(result.summary);
    
    console.log('\n💡 INSIGHTS FOUND:', result.insights.length);
    result.insights.forEach((insight, i) => {
      console.log(`${i + 1}. [${insight.priority.toUpperCase()}] ${insight.insight}`);
    });
    
    console.log('\n📋 TASKS GENERATED:', result.tasks?.length || 0);
    console.log('=' .repeat(60));
    
    if (result.tasks && result.tasks.length > 0) {
      // Group tasks by role
      const tasksByRole = result.tasks.reduce((acc, task) => {
        if (!acc[task.assignedRole]) acc[task.assignedRole] = [];
        acc[task.assignedRole].push(task);
        return acc;
      }, {} as Record<string, typeof result.tasks>);
      
      // Display tasks by role
      Object.entries(tasksByRole).forEach(([role, tasks]) => {
        console.log(`\n👤 ${role.toUpperCase()} TASKS (${tasks.length}):`);
        console.log('-'.repeat(40));
        
        tasks.forEach((task, i) => {
          console.log(`\nTask ${i + 1}: ${task.title}`);
          console.log(`Priority: ${'⭐'.repeat(task.priority)} (${task.priority}/5)`);
          console.log(`Due: ${new Date(task.dueDate).toLocaleDateString()}`);
          console.log(`Time Required: ${task.estimatedHours} hours`);
          console.log(`Potential Value: $${task.potentialValue.toLocaleString()}`);
          console.log(`Source: "${task.sourceInsight.substring(0, 60)}..."`);
          console.log(`\nSteps:\n${task.description}`);
        });
      });
      
      // Summary statistics
      console.log('\n📊 TASK SUMMARY:');
      console.log('=' .repeat(60));
      const totalValue = result.tasks.reduce((sum, task) => sum + task.potentialValue, 0);
      const totalHours = result.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      const urgentTasks = result.tasks.filter(t => t.priority <= 2).length;
      
      console.log(`Total Tasks: ${result.tasks.length}`);
      console.log(`Urgent Tasks (Priority 1-2): ${urgentTasks}`);
      console.log(`Total Estimated Hours: ${totalHours}`);
      console.log(`Total Potential Value: $${totalValue.toLocaleString()}`);
      console.log(`Average Value per Task: $${Math.round(totalValue / result.tasks.length).toLocaleString()}`);
      
      // Verify all high-priority insights have tasks
      const highPriorityInsights = result.insights.filter(i => i.priority === 'high');
      console.log(`\n✅ High-Priority Coverage: ${highPriorityInsights.length} insights`);
      highPriorityInsights.forEach(insight => {
        const hasTasks = result.tasks.some(t => 
          t.sourceInsight.toLowerCase().includes(insight.insight.toLowerCase().substring(0, 20))
        );
        console.log(`  - "${insight.insight.substring(0, 50)}..." ${hasTasks ? '✓ Has tasks' : '❌ No tasks'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEnhancedTaskGeneration().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
