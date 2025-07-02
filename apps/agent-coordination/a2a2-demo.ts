/**
 * A2A2 + MCP Protocol Demonstration
 * Shows enhanced agent coordination with debate and consensus
 */

import { agentCoordinator } from '../a2a2-protocol';

/**
 * Demonstrate A2A2 + MCP protocols with property management scenarios
 */
export async function demonstrateA2A2Protocol() {
  console.log('🤝 A2A2 + MCP PROTOCOL DEMONSTRATION\n');
  console.log('This demo shows:');
  console.log('- Agent-to-Agent communication and debate');
  console.log('- Multi-Agent Consensus Protocol');
  console.log('- Challenge and resolution phases');
  console.log('- Dissent recording when consensus fails\n');
  console.log('═'.repeat(60) + '\n');

  // Scenario 1: Financial Crisis Detection
  console.log('📊 Scenario 1: Financial Crisis at Sunset Towers\n');
  
  const financialCrisisData = {
    property: 'Sunset Towers',
    expenseIncrease: 25000,  // Significant increase
    revenueGrowth: -5,       // Revenue declining
    dscr: 1.05,             // Below safe threshold
    liquidityDays: 30,       // Critically low
    occupancyRate: 75,       // Below target
    maintenanceBacklog: 15   // High number of pending repairs
  };

  const result1 = await agentCoordinator.executeWithConsensus(
    'CRISIS-001',
    'Analyze financial crisis at Sunset Towers and recommend immediate actions',
    financialCrisisData
  );

  displayConsensusResult(result1);
  
  console.log('\n' + '═'.repeat(60) + '\n');

  // Scenario 2: Tenant Risk Assessment
  console.log('👥 Scenario 2: High-Risk Tenant Application\n');
  
  const tenantRiskData = {
    applicantName: 'John Doe',
    creditScore: 580,        // Below threshold
    monthlyIncome: 3500,
    requestedRent: 1800,     // Over 50% of income
    previousEvictions: 1,
    employmentLength: 3,     // Months
    references: 1,           // Limited references
    criminalRecord: false
  };

  const result2 = await agentCoordinator.executeWithConsensus(
    'TENANT-001',
    'Assess tenant application risk and provide recommendation',
    tenantRiskData
  );

  displayConsensusResult(result2);

  console.log('\n' + '═'.repeat(60) + '\n');

  // Scenario 3: Emergency Maintenance Decision
  console.log('🔧 Scenario 3: Emergency Maintenance Prioritization\n');
  
  const maintenanceData = {
    issue: 'HVAC System Failure',
    buildingAffected: 'Building A',
    unitsAffected: 24,
    estimatedCost: 45000,
    temperatureOutside: 95,  // Hot weather
    tenantComplaints: 18,
    alternativeOptions: ['Portable AC units', 'Hotel vouchers', 'Immediate repair'],
    budgetRemaining: 30000   // Less than repair cost
  };

  const result3 = await agentCoordinator.executeWithConsensus(
    'MAINT-001',
    'Decide on emergency HVAC repair strategy with budget constraints',
    maintenanceData
  );

  displayConsensusResult(result3);

  console.log('\n✅ Demonstration complete!\n');
  
  // Show debate statistics
  console.log('📊 Debate Statistics:');
  console.log(`- Total scenarios: 3`);
  console.log(`- Consensus achieved: ${[result1, result2, result3].filter(r => r.achieved).length}`);
  console.log(`- Dissent recorded: ${[result1, result2, result3].filter(r => !r.achieved).length}`);
  
  return {
    financialCrisis: result1,
    tenantRisk: result2,
    maintenance: result3
  };
}

/**
 * Display consensus result in formatted way
 */
function displayConsensusResult(result: any) {
  console.log('\n🎯 CONSENSUS RESULT:');
  console.log(`- Status: ${result.achieved ? '✅ CONSENSUS REACHED' : '⚠️ DISSENT RECORDED'}`);
  console.log(`- Method: ${result.method.toUpperCase()}`);
  console.log(`- Final Decision: "${result.finalProposal}"`);
  console.log(`- Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`- Supporting Agents: ${result.supportingAgents.length}`);
  console.log(`- Dissenting Agents: ${result.dissentingAgents.length}`);
  
  if (result.dissentRecord && result.dissentRecord.length > 0) {
    console.log('\n⚠️ DISSENTING OPINIONS:');
    result.dissentRecord.forEach((dissent: any) => {
      console.log(`- ${dissent.agentName}: "${dissent.alternativeConclusion}"`);
    });
  }
  
  // Show sample debate entries
  console.log('\n💬 KEY DEBATE MOMENTS:');
  const keyMoments = result.debateLog.filter((entry: any) => 
    entry.phase === 'challenge' || entry.action === 'consensus-reached'
  ).slice(0, 3);
  
  keyMoments.forEach((moment: any) => {
    console.log(`- [${moment.phase.toUpperCase()}] ${moment.content}`);
  });
}

/**
 * Test edge cases where consensus might fail
 */
export async function testEdgeCases() {
  console.log('🔥 TESTING EDGE CASES\n');
  
  // Edge Case 1: Highly controversial decision
  console.log('Edge Case 1: Controversial Rent Increase\n');
  
  const controversialData = {
    currentRent: 2000,
    proposedIncrease: 500,    // 25% increase
    marketRate: 2200,
    tenantPaymentHistory: 'excellent',
    tenantTenure: 5,          // Years
    propertyUpgrades: 'none',
    inflationRate: 3.5
  };

  const edgeResult1 = await agentCoordinator.executeWithConsensus(
    'EDGE-001',
    'Decide on controversial 25% rent increase for long-term tenant',
    controversialData
  );

  console.log(`Result: ${edgeResult1.achieved ? 'Consensus' : 'No Consensus'}`);
  console.log(`Dissenting agents: ${edgeResult1.dissentingAgents.length}`);
  
  // Edge Case 2: Conflicting priorities
  console.log('\nEdge Case 2: Safety vs Budget Conflict\n');
  
  const conflictData = {
    safetyIssue: 'Structural damage to balconies',
    riskLevel: 'high',
    estimatedCost: 150000,
    availableBudget: 50000,
    affectedUnits: 12,
    insuranceRequirement: true,
    alternativeSolutions: ['Temporary barriers', 'Phased repair', 'Emergency loan']
  };

  const edgeResult2 = await agentCoordinator.executeWithConsensus(
    'EDGE-002',
    'Balance critical safety repairs against severe budget constraints',
    conflictData
  );

  console.log(`Result: ${edgeResult2.achieved ? 'Consensus' : 'No Consensus'}`);
  console.log(`Final decision: "${edgeResult2.finalProposal}"`);
}

/**
 * Demonstrate configuration options
 */
export async function demonstrateConfigurations() {
  console.log('⚙️ CONFIGURATION DEMONSTRATIONS\n');
  
  // Configuration 1: Require unanimous consensus
  console.log('Config 1: Unanimous Consensus Required\n');
  
  const unanimousCoordinator = new (require('../a2a2-protocol').EnhancedAgentCoordination)({
    requireUnanimous: true,
    consensusThreshold: 1.0
  });
  
  const testData = {
    decision: 'Evict tenant for non-payment',
    monthsDelinquent: 2,
    amountOwed: 4000,
    tenantCircumstances: 'Job loss due to injury'
  };
  
  // This will likely fail to reach unanimous consensus
  console.log('Testing unanimous requirement on sensitive decision...');
  
  // Configuration 2: Weighted voting
  console.log('\nConfig 2: Weighted Agent Voting\n');
  
  const weightedCoordinator = new (require('../a2a2-protocol').EnhancedAgentCoordination)({
    agentWeights: new Map([
      ['legal-bot', 2.0],      // Legal bot has double weight
      ['finance-bot', 1.5],    // Finance bot has 1.5x weight
      ['tenant-bot', 1.0],     // Standard weight
      ['maintenance-bot', 0.8] // Reduced weight for this decision
    ])
  });
  
  console.log('Legal and Finance bots have increased influence in this configuration');
}

// Export demonstration functions
export default {
  demonstrateA2A2Protocol,
  testEdgeCases,
  demonstrateConfigurations
};
