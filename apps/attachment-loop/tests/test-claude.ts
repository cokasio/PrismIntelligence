import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
config({ path: path.join(__dirname, '../../../.env') });

/**
 * Test Claude AI integration with a real property file
 */
async function testClaudeIntegration() {
  console.log('\n🧪 TESTING CLAUDE AI INTEGRATION\n');
  
  try {
    // Dynamic import AFTER env is loaded
    const { claudeService } = await import('../services/ai/claude.service');
    
    // Load sample file
    const samplePath = path.join(__dirname, '../../../data/samples/sample-financial-report.csv');
    const fileContent = await fs.readFile(samplePath, 'utf-8');
    
    console.log('📄 Loaded sample file:', path.basename(samplePath));
    console.log('📏 File size:', fileContent.length, 'characters\n');
    
    // Test Claude analysis
    console.log('🧠 Sending to Claude for analysis...\n');
    const startTime = Date.now();
    
    const insights = await claudeService.analyzePropertyDocument(
      fileContent,
      'sample-financial-report.csv',
      'financial_report'
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Analysis completed in ${duration} seconds\n`);
    
    // Display results
    console.log('📊 ANALYSIS RESULTS:');
    console.log('=' .repeat(50));
    
    console.log('\n📝 SUMMARY:');
    console.log(insights.summary);
    
    if (insights.keyMetrics && Object.keys(insights.keyMetrics).length > 0) {
      console.log('\n📈 KEY METRICS:');
      Object.entries(insights.keyMetrics).forEach(([key, metric]: [string, any]) => {
        console.log(`  • ${key}: ${metric.value}`);
        console.log(`    Trend: ${metric.trend} - ${metric.analysis}`);
      });
    }
    
    if (insights.insights && insights.insights.length > 0) {
      console.log('\n💡 INSIGHTS:');
      insights.insights.forEach((insight: any, index: number) => {
        console.log(`  ${index + 1}. [${insight.priority.toUpperCase()}] ${insight.insight}`);
        console.log(`     Impact: ${insight.impact}`);
      });
    }
    
    if (insights.actions && insights.actions.length > 0) {
      console.log('\n🎯 RECOMMENDED ACTIONS:');
      insights.actions.forEach((action: any) => {
        console.log(`  ${action.priority}. ${action.action}`);
        console.log(`     Expected: ${action.expectedOutcome}`);
      });
    }
    
    if (insights.risks && insights.risks.length > 0) {
      console.log('\n⚠️  RISKS:');
      insights.risks.forEach((risk: any) => {
        console.log(`  • [${risk.severity.toUpperCase()}] ${risk.risk}`);
        console.log(`    Mitigation: ${risk.mitigation}`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Claude AI integration test successful!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
testClaudeIntegration();
