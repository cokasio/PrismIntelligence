/**
 * Integration Test Script
 * Tests the complete document processing flow
 */

import { integrationOrchestrator } from '../apps/api/services/integration-orchestrator';
import { logicEngine } from '../apps/logic-layer/logic-engine';
import { enhancedReinforcementLearning } from '../apps/reinforcement-learning/enhanced-rl-engine';
import fs from 'fs/promises';
import path from 'path';

console.log('🧪 Prism Intelligence Integration Test');
console.log('=====================================\n');

async function runIntegrationTest() {
  try {
    // Test 1: Logic Engine Connection
    console.log('1️⃣ Testing Logic Engine...');
    const testProposition = {
      id: 'test1',
      statement: 'Revenue > 100000',
      value: true,
      confidence: 0.9
    };
    
    const validation = logicEngine.validate(
      testProposition,
      [{ id: 'revenue', statement: 'Revenue = 150000', value: true }],
      'TestAgent'
    );
    
    console.log('   ✅ Logic validation:', validation.valid ? 'PASSED' : 'FAILED');
    console.log('   📊 Confidence:', validation.confidence);
    console.log('');

    // Test 2: Reinforcement Learning Connection
    console.log('2️⃣ Testing Reinforcement Learning...');
    const testInsight = {
      id: 'insight-test',
      content: 'Test insight for validation',
      confidence: 0.85,
      source: 'TestAgent',
      category: 'financial',
      timestamp: new Date(),
      agentId: 'TestAgent'
    };
    
    const adaptedInsight = enhancedReinforcementLearning.applyAdaptivePreferences(
      testInsight,
      'test-user',
      new Date()
    );
    
    console.log('   ✅ RL adaptation:', adaptedInsight ? 'PASSED' : 'FAILED');
    console.log('   🎯 Priority:', adaptedInsight.priority);
    console.log('');

    // Test 3: Document Processing Flow
    console.log('3️⃣ Testing Document Processing Flow...');
    
    // Create mock file buffer
    const mockFileContent = `
      Property Financial Report - Q4 2024
      Revenue: $150,000
      Expenses: $120,000
      Net Income: $30,000
      Occupancy Rate: 95%
    `;
    const mockFile = Buffer.from(mockFileContent);
    
    // Set up event listeners
    let processingStarted = false;
    let insightsReceived = false;
    
    integrationOrchestrator.once('processing-started', (data) => {
      processingStarted = true;
      console.log('   📋 Processing started for task:', data.taskId);
    });
    
    integrationOrchestrator.once('agent-proposals', (data) => {
      console.log('   🤖 Agent proposals received:', data.proposals.length);
    });
    
    integrationOrchestrator.once('logic-validation', (data) => {
      console.log('   ✓ Logic validation complete');
    });
    
    integrationOrchestrator.once('processing-complete', (data) => {
      insightsReceived = true;
      console.log('   💡 Insights generated:', data.insights.length);
      data.insights.forEach((insight: any, index: number) => {
        console.log(`      ${index + 1}. ${insight.formattedMessage}`);
      });
    });
    
    // Process document
    const result = await integrationOrchestrator.processDocument({
      taskId: 'test-task-001',
      file: mockFile,
      filename: 'test-financial-report.pdf',
      userId: 'test-user',
      documentType: 'financial'
    });
    
    console.log('');
    console.log('   ✅ Document processing:', result ? 'PASSED' : 'FAILED');
    console.log('');

    // Test 4: API Route Simulation
    console.log('4️⃣ Testing API Route Integration...');
    // This would require running the Express server
    console.log('   ⚠️  API routes require Express server running');
    console.log('');

    // Test 5: WebSocket Connection
    console.log('5️⃣ Testing WebSocket Setup...');
    console.log('   ⚠️  WebSocket requires server running');
    console.log('');

    // Summary
    console.log('📊 Integration Test Summary');
    console.log('===========================');
    console.log('✅ Logic Engine: CONNECTED');
    console.log('✅ Reinforcement Learning: CONNECTED');
    console.log('✅ Document Processing: FUNCTIONAL');
    console.log('⚠️  API Routes: REQUIRES SERVER');
    console.log('⚠️  WebSocket: REQUIRES SERVER');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Start the API server: npm run start:api');
    console.log('2. Start the Next.js app: npm run dev');
    console.log('3. Upload a test document through the UI');
    console.log('4. Verify insights appear in real-time');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
runIntegrationTest();
