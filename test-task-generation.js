// Quick test script for task generation
import { claudeService } from './apps/attachment-loop/services/ai/claude.service.js';

const testContent = `
PROPERTY: Sunset Gardens Apartments
PERIOD: January 2024

INCOME STATEMENT
Total Revenue: $125,000
Total Expenses: $98,000
Net Operating Income: $27,000

KEY VARIANCES:
- Maintenance costs 35% over budget ($12,000 vs $8,900 budgeted)
- Utilities 20% over budget due to HVAC issues
- Rent collection at 92% (8% vacancy)

URGENT ITEMS:
- Unit 205 has major water damage needing immediate repair
- 3 units have overdue rent payments totaling $7,500
- Annual fire inspection due next week
`;

async function testTaskGeneration() {
  console.log('Testing task generation...\n');
  
  try {
    const result = await claudeService.analyzePropertyDocument(
      testContent,
      'test-pl-statement.pdf',
      'P&L Statement'
    );
    
    console.log('Summary:', result.summary);
    console.log('\nTasks Generated:', result.tasks?.length || 0);
    
    if (result.tasks) {
      result.tasks.forEach((task, i) => {
        console.log(`\nTask ${i + 1}:`, task.title);
        console.log('  Priority:', task.priority);
        console.log('  Assigned to:', task.assignedRole);
        console.log('  Due:', task.dueDate);
        console.log('  Potential Value: $', task.potentialValue);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTaskGeneration();
