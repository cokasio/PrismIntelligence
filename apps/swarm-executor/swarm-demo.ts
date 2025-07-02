/**
 * Swarm Executor Demonstration
 * Shows how the Dynamic Recursive Swarm Executor works with Prism Intelligence
 */

import { swarmExecutor, SwarmTask } from '../swarm-executor';
import { logicEngine } from '../../logic-layer/logic-engine';

/**
 * Demonstrate the swarm executor with a complex property analysis task
 */
export async function demonstrateSwarmExecution() {
  console.log('🚀 DYNAMIC RECURSIVE SWARM EXECUTOR DEMONSTRATION\n');
  console.log('This demo shows:');
  console.log('- Recursive task decomposition');
  console.log('- Intelligent model routing based on privacy/cost/accuracy');
  console.log('- Propositional logic validation');
  console.log('- Cross-model contradiction detection\n');
  console.log('═'.repeat(60) + '\n');

  // Define a complex property analysis task
  const propertyAnalysisTask: SwarmTask = {
    id: 'TASK-001',
    description: 'Analyze Q4 financial report for Sunset Towers and recommend cost-saving measures',
    type: 'analysis',
    sensitivity: 'confidential',
    priority: 'high',
    context: {
      property: 'Sunset Towers',
      period: 'Q4 2024',
      data: {
        revenue: 850000,
        expenses: 920000,
        expenseIncrease: 15000,
        revenueGrowth: 0,
        dscr: 1.1,
        liquidityDays: 45,
        maintenanceCosts: 125000,
        utilityCosts: 85000
      }
    }
  };

  // Set privacy mode based on task sensitivity
  console.log('📊 Task Analysis:');
  console.log(`- Description: ${propertyAnalysisTask.description}`);
  console.log(`- Sensitivity: ${propertyAnalysisTask.sensitivity}`);
  console.log(`- Priority: ${propertyAnalysisTask.priority}\n`);

  // Execute with hybrid mode for confidential data
  swarmExecutor.setPrivacyMode('hybrid');
  console.log('🔒 Privacy Mode: HYBRID (balancing privacy and performance)\n');

  // Execute the task
  console.log('⚡ Starting recursive execution...\n');
  const result = await swarmExecutor.execute(propertyAnalysisTask);

  // Display execution results
  console.log('\n' + '═'.repeat(60));
  console.log('📊 EXECUTION COMPLETE\n');

  // Show thought process
  console.log('💭 Thought Process:');
  result.thoughtProcess.forEach((thought, idx) => {
    console.log(`  ${idx + 1}. ${thought}`);
  });
  console.log('');

  // Show subtask plan
  console.log('📋 Subtask Plan:');
  result.subtaskPlan.forEach((subtask, idx) => {
    console.log(`  ${idx + 1}. ${subtask.description}`);
    console.log(`     Model: ${subtask.assignedModel}`);
    console.log(`     Rationale: ${subtask.rationale}`);
  });
  console.log('');

  // Show model assignments
  console.log('🤖 Model Routing Decisions:');
  result.assignedModelLog.forEach((assignment) => {
    console.log(`  Task ${assignment.taskId}:`);
    console.log(`    Selected: ${assignment.model}`);
    console.log(`    Reason: ${assignment.reason}`);
    console.log(`    Fallbacks: ${assignment.fallbackModels.join(', ')}`);
  });
  console.log('');

  // Show logic validation
  console.log('🧠 Logic Validation Results:');
  const validCount = result.logicProofs.filter(p => p.valid).length;
  console.log(`  Valid: ${validCount}/${result.logicProofs.length} subtasks`);
  result.logicProofs.forEach((proof, idx) => {
    console.log(`  ${idx + 1}. ${proof.valid ? '✅' : '❌'} ${proof.explanation}`);
  });
  console.log('');

  // Show contradictions
  if (result.contradictionFlags.length > 0) {
    console.log('⚠️ Contradictions Detected:');
    result.contradictionFlags.forEach((flag) => {
      console.log(`  - ${flag.task1} ↔ ${flag.task2}`);
      console.log(`    Severity: ${flag.severity.toUpperCase()}`);
      console.log(`    Details: ${flag.details}`);
    });
  } else {
    console.log('✅ No contradictions detected');
  }
  console.log('');

  // Show recommendations
  console.log('💡 Recommendations:');
  result.recommendedToDos.forEach((todo, idx) => {
    console.log(`  ${idx + 1}. ${todo}`);
  });
  console.log('');

  // Show narrative
  console.log('📝 Executive Summary:');
  console.log(result.narrative);
  console.log('\n' + '═'.repeat(60));

  // Demonstrate privacy mode switching
  console.log('\n🔄 Demonstrating Privacy Mode Switching...\n');

  // Try with local-only mode for secret data
  const secretTask: SwarmTask = {
    id: 'TASK-002',
    description: 'Process highly sensitive tenant financial data',
    type: 'analysis',
    sensitivity: 'secret',
    priority: 'high'
  };

  swarmExecutor.setPrivacyMode('local');
  console.log('🔒 Privacy Mode: LOCAL (maximum privacy, using only local models)\n');
  
  const secretResult = await swarmExecutor.execute(secretTask);
  
  console.log('Model assignments for secret task:');
  secretResult.assignedModelLog.forEach((assignment) => {
    const modelLocation = assignment.model.includes('mistral') || assignment.model.includes('phi') 
      ? '🖥️ LOCAL' 
      : '☁️ CLOUD';
    console.log(`  ${assignment.model} ${modelLocation}`);
  });

  console.log('\n✅ Demonstration complete!');
  
  return {
    standardResult: result,
    secretResult: secretResult
  };
}

/**
 * Run specific scenarios
 */
export async function runScenarios() {
  console.log('🎯 SWARM EXECUTOR SCENARIOS\n');

  // Scenario 1: High-stakes financial analysis
  console.log('Scenario 1: High-Stakes Financial Analysis');
  console.log('-'.repeat(40));
  
  const financialTask: SwarmTask = {
    id: 'FIN-001',
    description: 'Detect covenant breach risk and recommend immediate actions',
    type: 'analysis',
    sensitivity: 'confidential',
    priority: 'critical',
    context: {
      dscr: 1.05,  // Below 1.2 threshold
      liquidityDays: 30,  // Below 60 days
      debtAmount: 5000000
    }
  };

  const finResult = await swarmExecutor.execute(financialTask);
  console.log(`Models used: ${[...new Set(finResult.assignedModelLog.map(a => a.model))].join(', ')}`);
  console.log(`Contradictions: ${finResult.contradictionFlags.length}`);
  console.log(`Key recommendation: ${finResult.recommendedToDos[0] || 'None'}\n`);

  // Scenario 2: Routine maintenance planning
  console.log('Scenario 2: Routine Maintenance Planning');
  console.log('-'.repeat(40));
  
  const maintenanceTask: SwarmTask = {
    id: 'MAINT-001',
    description: 'Plan quarterly maintenance schedule',
    type: 'generation',
    sensitivity: 'public',
    priority: 'medium'
  };

  const maintResult = await swarmExecutor.execute(maintenanceTask);
  console.log(`Models used: ${[...new Set(maintResult.assignedModelLog.map(a => a.model))].join(', ')}`);
  console.log(`Valid proofs: ${maintResult.logicProofs.filter(p => p.valid).length}/${maintResult.logicProofs.length}\n`);

  // Scenario 3: Multi-property synthesis
  console.log('Scenario 3: Multi-Property Portfolio Synthesis');
  console.log('-'.repeat(40));
  
  const portfolioTask: SwarmTask = {
    id: 'PORT-001',
    description: 'Synthesize performance across 10 properties and identify optimization opportunities',
    type: 'synthesis',
    sensitivity: 'confidential',
    priority: 'high'
  };

  const portResult = await swarmExecutor.execute(portfolioTask);
  console.log(`Subtasks created: ${portResult.subtaskPlan.length}`);
  console.log(`Execution time: Simulated`);
  console.log(`Overall confidence: ${(portResult.logicProofs.reduce((sum, p) => sum + (p.confidence || 0), 0) / portResult.logicProofs.length * 100).toFixed(0)}%`);
}

// Export for testing
export default {
  demonstrateSwarmExecution,
  runScenarios
};
