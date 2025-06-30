// Example: Claude + Gemini Collaboration on Property Intelligence Tasks
// This demonstrates how both AIs work together to analyze property data

import AICollaborationBridge from './ai-collaboration-bridge';
import { CollaborationTask } from './ai-collaboration-bridge';

// Initialize the collaboration bridge
const collaborationBridge = new AICollaborationBridge(
  50,    // Daily free tier limit for Gemini
  1500   // Monthly free tier limit
);

// Example 1: Financial Report Analysis (Both AIs collaborate)
async function analyzeFinancialReport() {
  console.log('\n📊 FINANCIAL REPORT ANALYSIS - Claude + Gemini Collaboration\n');
  
  const financialTask: CollaborationTask = {
    id: 'fin-001',
    type: 'analysis',
    description: 'Analyze Q4 2024 financial report for Sunset Plaza Apartments',
    priority: 'high', // High priority = both AIs work together
    data: {
      property: 'Sunset Plaza Apartments',
      period: 'Q4 2024',
      revenue: {
        rental_income: 450000,
        other_income: 25000,
        total: 475000
      },
      expenses: {
        operating: 125000,
        maintenance: 45000,
        management: 35000,
        utilities: 28000,
        total: 233000
      },
      noi: 242000,
      occupancy_rate: 0.925,
      avg_rent: 2500
    }
  };

  const result = await collaborationBridge.collaborateOnTask(financialTask);
  
  console.log('📋 Results:');
  console.log(`- Consensus reached: ${result.consensus ? 'YES ✅' : 'NO ⚠️'}`);
  console.log(`- Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`- Execution time: ${result.executionTime}ms`);
  console.log('\n🔍 Analysis:', JSON.stringify(result.finalResult, null, 2));
}

// Example 2: Document Classification (Offload to Gemini for free tier usage)
async function classifyDocuments() {
  console.log('\n📁 DOCUMENT CLASSIFICATION - Offloading to Gemini\n');
  
  const documents = [
    {
      id: 'doc-001',
      content: 'Lease Agreement - Tenant: ABC Corp, Monthly Rent: $5,000, Term: 3 years'
    },
    {
      id: 'doc-002', 
      content: 'Maintenance Request - Unit 205: HVAC not cooling, urgent repair needed'
    },
    {
      id: 'doc-003',
      content: 'Monthly Financial Statement - Revenue: $125,000, Expenses: $75,000, NOI: $50,000'
    }
  ];

  for (const doc of documents) {
    const classificationTask: CollaborationTask = {
      id: doc.id,
      type: 'classification',
      description: `Classify document ${doc.id}`,
      priority: 'low', // Low priority = can offload to Gemini
      data: doc
    };

    const result = await collaborationBridge.collaborateOnTask(classificationTask);
    console.log(`📄 ${doc.id}: ${result.finalResult?.type || 'unknown'} (${result.assignedTo})`);
  }
}

// Example 3: Data Validation (Both AIs cross-check)
async function validatePropertyData() {
  console.log('\n✅ DATA VALIDATION - Cross-checking with both AIs\n');
  
  const validationTask: CollaborationTask = {
    id: 'val-001',
    type: 'validation',
    description: 'Validate property metrics for consistency',
    priority: 'high',
    data: {
      property_id: 'SP-001',
      name: 'Sunset Plaza',
      units: 50,
      occupied_units: 46,
      reported_occupancy: 0.92, // Should match occupied/total
      total_monthly_rent: 115000,
      avg_rent_per_unit: 2500, // Should match total/occupied
      maintenance_requests: {
        open: 5,
        completed: 45,
        completion_rate: 0.90 // Should match completed/(open+completed)
      }
    }
  };

  const result = await collaborationBridge.collaborateOnTask(validationTask);
  
  if (result.consensus) {
    console.log('✅ Both AIs agree on validation results');
  } else {
    console.log('⚠️  AIs have different validation findings - requires review');
  }
  
  console.log('\nValidation Results:', JSON.stringify(result.finalResult, null, 2));
}

// Example 4: Information Extraction (Gemini handles to save Claude tokens)
async function extractLeaseInfo() {
  console.log('\n📝 LEASE INFORMATION EXTRACTION - Using Gemini\n');
  
  const extractionTask: CollaborationTask = {
    id: 'ext-001',
    type: 'extraction',
    description: 'Extract key terms from lease document',
    priority: 'medium',
    data: {
      document: `COMMERCIAL LEASE AGREEMENT
      
      This Lease Agreement is entered into on January 15, 2024, between 
      Sunset Plaza LLC ("Landlord") and Tech Innovations Inc. ("Tenant").
      
      Property: Suite 500, 123 Main Street, San Francisco, CA 94105
      
      Term: The lease term is 5 years, commencing February 1, 2024 and 
      ending January 31, 2029.
      
      Rent: Base monthly rent of $15,000, with annual increases of 3%.
      
      Security Deposit: $45,000 (equivalent to 3 months rent)
      
      Permitted Use: General office and technology development
      
      Parking: 10 designated parking spaces included`
    }
  };

  const result = await collaborationBridge.collaborateOnTask(extractionTask);
  console.log('📊 Extracted Information:', JSON.stringify(result.finalResult, null, 2));
}

// Example 5: Generate collaboration report
async function generateCollaborationReport() {
  console.log('\n📈 COLLABORATION STATISTICS\n');
  
  const stats = collaborationBridge.getStats();
  
  console.log(`Total Tasks Processed: ${stats.totalTasks}`);
  console.log(`- Claude handled: ${stats.claudeTasks}`);
  console.log(`- Gemini handled: ${stats.geminiTasks}`);
  console.log(`- Both collaborated: ${stats.collaborativeTasks}`);
  console.log(`\nConsensus Rate: ${(stats.consensusRate * 100).toFixed(1)}%`);
  console.log(`Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  console.log(`\nGemini Usage:`);
  console.log(`- Daily: ${stats.geminiUsage.daily}/${50} (${(stats.geminiUsage.daily/50*100).toFixed(1)}%)`);
  console.log(`- Monthly: ${stats.geminiUsage.monthly}/${1500} (${(stats.geminiUsage.monthly/1500*100).toFixed(1)}%)`);
}

// Main execution
async function main() {
  console.log('🤖 CLAUDE + GEMINI COLLABORATION DEMO');
  console.log('=====================================\n');
  
  console.log('This demonstrates how I (Claude) work with Gemini to:');
  console.log('1. Share workload to optimize your free tier usage');
  console.log('2. Cross-validate important results');
  console.log('3. Leverage each AI\'s strengths');
  console.log('4. Provide higher confidence through consensus\n');

  try {
    // Run all examples
    await analyzeFinancialReport();
    await classifyDocuments();
    await validatePropertyData();
    await extractLeaseInfo();
    await generateCollaborationReport();
    
    console.log('\n✅ Collaboration demo complete!');
    console.log('\n💡 Benefits of this approach:');
    console.log('- Maximizes your free Gemini tier (50 calls/day)');
    console.log('- Higher accuracy through cross-validation');
    console.log('- Cost optimization by routing tasks intelligently');
    console.log('- Automatic fallback if one AI is unavailable');
    
  } catch (error) {
    console.error('❌ Error during collaboration:', error);
  }
}

// Export functions for use in your application
export {
  analyzeFinancialReport,
  classifyDocuments,
  validatePropertyData,
  extractLeaseInfo,
  collaborationBridge
};

// Run demo if called directly
if (require.main === module) {
  main();
}