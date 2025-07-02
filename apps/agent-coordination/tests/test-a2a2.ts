/**
 * Test the A2A2 + MCP Protocol Implementation
 */

import { demonstrateA2A2Protocol, testEdgeCases } from '../a2a2-demo';

async function runA2A2Tests() {
  console.log('🧪 PRISM INTELLIGENCE - A2A2 + MCP PROTOCOL TEST SUITE\n');
  console.log('Testing Enhanced Agent Coordination with:');
  console.log('✅ Agent-to-Agent debate protocols');
  console.log('✅ Multi-agent consensus mechanisms');
  console.log('✅ Challenge and resolution phases');
  console.log('✅ Dissent recording');
  console.log('✅ Logic validation integration\n');
  
  try {
    // Run main demonstration
    console.log('Running main protocol demonstration...\n');
    const mainResults = await demonstrateA2A2Protocol();
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Run edge case tests
    console.log('Running edge case scenarios...\n');
    await testEdgeCases();
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY\n');
    
    const scenarios = [
      mainResults.financialCrisis,
      mainResults.tenantRisk,
      mainResults.maintenance
    ];
    
    const consensusCount = scenarios.filter(s => s.achieved).length;
    const totalDebateEntries = scenarios.reduce((sum, s) => sum + s.debateLog.length, 0);
    const totalDissents = scenarios.reduce((sum, s) => sum + (s.dissentRecord?.length || 0), 0);
    
    console.log(`Total Scenarios: ${scenarios.length}`);
    console.log(`Consensus Achieved: ${consensusCount}/${scenarios.length}`);
    console.log(`Total Debate Entries: ${totalDebateEntries}`);
    console.log(`Total Dissenting Opinions: ${totalDissents}`);
    console.log(`Average Confidence: ${(scenarios.reduce((sum, s) => sum + s.confidence, 0) / scenarios.length * 100).toFixed(0)}%`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runA2A2Tests();
