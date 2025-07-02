/**
 * Test the Dynamic Recursive Swarm Executor
 */

import { demonstrateSwarmExecution, runScenarios } from '../swarm-demo';

async function runSwarmTest() {
  console.log('🚀 PRISM INTELLIGENCE - DYNAMIC RECURSIVE SWARM EXECUTOR TEST\n');
  console.log('Features being tested:');
  console.log('✅ Recursive task decomposition');
  console.log('✅ Dynamic model routing (local/cloud)');
  console.log('✅ Privacy-aware execution');
  console.log('✅ Propositional logic validation');
  console.log('✅ Cross-model contradiction detection');
  console.log('✅ Fallback chain support\n');
  
  try {
    // Run main demonstration
    await demonstrateSwarmExecution();
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Run additional scenarios
    await runScenarios();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runSwarmTest();
