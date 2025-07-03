/**
 * Prism Intelligence - Quick Integration Test
 * Verifies all components are wired correctly
 */

import { integrationOrchestrator } from './apps/api/services/integration-orchestrator';
import { documentParser } from './apps/api/services/document-parser';
import { mockAIService } from './apps/api/services/mock-ai-service';
import { logicEngine } from './apps/logic-layer/logic-engine';
import { enhancedReinforcementLearning } from './apps/reinforcement-learning/enhanced-rl-engine';
import { demoDataGenerator } from './apps/dashboard-nextjs/src/lib/demo-data-generator';
import chalk from 'chalk';

console.log(chalk.blue.bold(`
═══════════════════════════════════════════════════
    PRISM INTELLIGENCE INTEGRATION TEST
═══════════════════════════════════════════════════
`));

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper
async function runTest(name: string, testFn: () => Promise<boolean>) {
  try {
    console.log(chalk.yellow(`\n🧪 Testing: ${name}`));
    const result = await testFn();
    
    if (result) {
      console.log(chalk.green(`✅ ${name} - PASSED`));
      testResults.passed++;
      testResults.tests.push({ name, status: 'passed' });
    } else {
      console.log(chalk.red(`❌ ${name} - FAILED`));
      testResults.failed++;
      testResults.tests.push({ name, status: 'failed' });
    }
    
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ ${name} - ERROR: ${error.message}`));
    testResults.failed++;
    testResults.tests.push({ name, status: 'error', error: error.message });
    return false;
  }
}

// Test 1: Document Parser
async function testDocumentParser() {
  const testContent = `
    Property Financial Report
    Revenue: $150,000
    Expenses: $120,000
    Net Income: $30,000
  `;
  
  const buffer = Buffer.from(testContent);
  const result = await documentParser.parseDocument(buffer, 'test-financial.pdf');
  
  return (
    result.type === 'financial' &&
    result.structuredData.metrics?.revenue === 150000 &&
    result.metadata.confidence > 0
  );
}

// Test 2: Mock AI Service
async function testMockAI() {
  const parsedDoc = {
    type: 'financial' as const,
    format: 'pdf' as const,
    extractedText: 'Test document',
    structuredData: { metrics: { revenue: 150000 } },
    metadata: { 
      filename: 'test.pdf',
      fileSize: 1000,
      extractedDate: new Date(),
      confidence: 0.9
    }
  };
  
  const analysis = await mockAIService.analyzeDocument(parsedDoc, 'financial');
  
  return (
    analysis.agentId === 'FinanceBot' &&
    analysis.insights.length > 0 &&
    analysis.confidence > 0
  );
}

// Test 3: Logic Engine Validation
async function testLogicEngine() {
  const proposition = {
    id: 'test-prop',
    statement: 'DSCR < 1.2',
    value: true,
    confidence: 0.9
  };
  
  const evidence = [{
    id: 'dscr-value',
    statement: 'DSCR = 1.15',
    value: true,
    confidence: 0.95
  }];
  
  const validation = logicEngine.validate(proposition, evidence, 'TestAgent');
  
  return validation.valid === true && validation.confidence > 0;
}

// Test 4: Reinforcement Learning
async function testReinforcementLearning() {
  const testInsight = {
    id: 'test-insight',
    content: 'Test insight content',
    confidence: 0.85,
    source: 'TestAgent',
    category: 'financial',
    timestamp: new Date(),
    agentId: 'TestAgent'
  };
  
  const adapted = enhancedReinforcementLearning.applyAdaptivePreferences(
    testInsight,
    'test-user',
    new Date()
  );
  
  return adapted.priority !== undefined && adapted.displayPriority !== undefined;
}

// Test 5: Demo Data Generator
async function testDemoData() {
  const scenarios = demoDataGenerator.getAllScenarios();
  const covenantScenario = scenarios.find(s => s.id === 'covenant-breach');
  
  if (!covenantScenario) return false;
  
  const sampleFile = demoDataGenerator.generateSampleFile(covenantScenario);
  const debate = demoDataGenerator.generateDemoDebate('covenant-breach');
  
  return (
    scenarios.length === 5 &&
    sampleFile.length > 0 &&
    debate.length > 0
  );
}

// Test 6: Full Integration Flow
async function testFullIntegration() {
  // Get a demo scenario
  const scenario = demoDataGenerator.getAllScenarios()[0];
  const fileBuffer = demoDataGenerator.generateSampleFile(scenario);
  
  // Set up event tracking
  let processingStarted = false;
  let insightsGenerated = false;
  
  integrationOrchestrator.once('processing-started', () => {
    processingStarted = true;
  });
  
  integrationOrchestrator.once('processing-complete', (data) => {
    insightsGenerated = data.insights && data.insights.length > 0;
  });
  
  // Process the document
  await integrationOrchestrator.processDocument({
    taskId: 'test-integration',
    file: fileBuffer,
    filename: scenario.documents[0].filename,
    userId: 'test-user',
    documentType: scenario.documents[0].type
  });
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return processingStarted && insightsGenerated;
}

// Test 7: Component Connections
async function testComponentConnections() {
  // Verify imports work
  const componentsExist = (
    typeof documentParser !== 'undefined' &&
    typeof mockAIService !== 'undefined' &&
    typeof logicEngine !== 'undefined' &&
    typeof enhancedReinforcementLearning !== 'undefined' &&
    typeof integrationOrchestrator !== 'undefined'
  );
  
  // Verify methods exist
  const methodsExist = (
    typeof documentParser.parseDocument === 'function' &&
    typeof mockAIService.analyzeDocument === 'function' &&
    typeof logicEngine.validate === 'function' &&
    typeof enhancedReinforcementLearning.applyAdaptivePreferences === 'function'
  );
  
  return componentsExist && methodsExist;
}

// Run all tests
async function runAllTests() {
  console.log(chalk.cyan('Starting integration tests...\n'));
  
  await runTest('Document Parser', testDocumentParser);
  await runTest('Mock AI Service', testMockAI);
  await runTest('Logic Engine Validation', testLogicEngine);
  await runTest('Reinforcement Learning', testReinforcementLearning);
  await runTest('Demo Data Generator', testDemoData);
  await runTest('Component Connections', testComponentConnections);
  await runTest('Full Integration Flow', testFullIntegration);
  
  // Summary
  console.log(chalk.blue.bold(`
═══════════════════════════════════════════════════
                  TEST SUMMARY
═══════════════════════════════════════════════════
`));
  
  console.log(chalk.green(`✅ Passed: ${testResults.passed}`));
  console.log(chalk.red(`❌ Failed: ${testResults.failed}`));
  console.log(chalk.blue(`📊 Total: ${testResults.tests.length}`));
  
  const successRate = (testResults.passed / testResults.tests.length * 100).toFixed(1);
  console.log(chalk.yellow(`\n🎯 Success Rate: ${successRate}%`));
  
  if (testResults.failed === 0) {
    console.log(chalk.green.bold(`
🎉 ALL TESTS PASSED! 🎉
The system is fully integrated and ready for demo!
`));
  } else {
    console.log(chalk.red.bold(`
⚠️  Some tests failed. Please check the errors above.
`));
    
    // Show failed tests
    console.log(chalk.yellow('\nFailed tests:'));
    testResults.tests
      .filter(t => t.status !== 'passed')
      .forEach(t => {
        console.log(chalk.red(`  - ${t.name}`));
        if (t.error) console.log(chalk.gray(`    Error: ${t.error}`));
      });
  }
  
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Test suite failed:'), error);
  process.exit(1);
});
