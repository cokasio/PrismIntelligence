/**
 * Test the Philosophical Reasoning System
 * Run with: npm run test:philosophy
 */

import { runPhilosophicalDemo } from '../philosophical-demo';

async function testPhilosophicalReasoning() {
  console.log('🧠 PRISM INTELLIGENCE - PHILOSOPHICAL REASONING TEST\n');
  console.log('This test demonstrates the recursive reasoning loop with:');
  console.log('- Propositional calculus validation');
  console.log('- Cross-agent contradiction detection');
  console.log('- Step-by-step proof generation');
  console.log('- Human-explainable narratives\n');
  console.log('═'.repeat(60) + '\n');

  try {
    const report = await runPhilosophicalDemo();
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PHILOSOPHICAL REASONING COMPLETE\n');
    
    // Display key metrics
    console.log('🎯 Key Metrics:');
    console.log(`- Total Insights: ${report.summary.totalInsights}`);
    console.log(`- Logically Valid: ${report.summary.validInsights}`);
    console.log(`- Invalid: ${report.summary.invalidInsights}`);
    console.log(`- Contradictions: ${report.summary.contradictions}`);
    console.log(`- Overall Confidence: ${(report.summary.overallConfidence * 100).toFixed(0)}%\n`);
    
    // Display narrative
    console.log('📝 Executive Summary:');
    console.log(report.narrative + '\n');
    
    // Display recommendations
    if (report.recommendedActions.length > 0) {
      console.log('⚡ Recommended Actions:');
      report.recommendedActions.forEach((action, idx) => {
        console.log(`${idx + 1}. ${action}`);
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPhilosophicalReasoning();
