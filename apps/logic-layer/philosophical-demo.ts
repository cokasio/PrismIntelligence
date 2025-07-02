/**
 * Philosophical Reasoning Demonstration
 * Shows recursive logical validation in action
 */

import { logicEngine, LogicalProposition } from '../logic-layer/logic-engine';
import { LogicalAgentFactory } from '../logic-layer/agent-wrapper';

export class PhilosophicalReasoningDemo {
  /**
   * Demonstrates the recursive reasoning loop
   */
  async executeRecursiveReasoning(propertyData: any) {
    console.log('=== PHILOSOPHICAL REASONING DEMONSTRATION ===\n');
    
    // 1️⃣ THINK: Understand the context
    const context = {
      property: 'Sunset Towers, Unit 12B',
      data: propertyData,
      timestamp: new Date().toISOString()
    };
    
    console.log('1️⃣ THINK Phase:');
    console.log('Context:', JSON.stringify(context, null, 2));
    console.log('\n');

    // 2️⃣ PLAN: Define sub-steps
    const plan = [
      { step: 1, agent: 'InsightGeneratorAgent', task: 'Analyze financial metrics' },
      { step: 2, agent: 'ComplianceAgent', task: 'Check covenant compliance' },
      { step: 3, agent: 'RiskFlaggerAgent', task: 'Assess tenant risk' },
      { step: 4, agent: 'SynthesisAgent', task: 'Cross-validate all insights' }
    ];
    
    console.log('2️⃣ PLAN Phase:');
    console.log('Execution plan:', JSON.stringify(plan, null, 2));
    console.log('\n');

    // 3️⃣ EXECUTE: Run each agent with validation
    console.log('3️⃣ EXECUTE Phase:');
    const insights = [];
    
    for (const step of plan) {
      console.log(`\n--- Step ${step.step}: ${step.agent} ---`);
      
      const agent = LogicalAgentFactory.createAgent(step.agent);
      let insight;
      
      // Execute based on agent type
      switch (step.agent) {
        case 'InsightGeneratorAgent':
          insight = await (agent as any).generateInsight(propertyData);
          break;
        case 'ComplianceAgent':
          insight = await (agent as any).checkCompliance(propertyData);
          break;
        case 'RiskFlaggerAgent':
          insight = await (agent as any).assessRisk(propertyData);
          break;
        case 'SynthesisAgent':
          insight = await (agent as any).synthesize(insights);
          break;
      }
      
      insights.push(insight);
      
      // Display validation result
      console.log('Conclusion:', insight.conclusion);
      console.log('Valid:', insight.validation.valid);
      console.log('Confidence:', insight.validation.confidence);
      if (insight.validation.proofChain) {
        console.log('Proof Steps:');
        insight.validation.proofChain.steps.forEach(s => {
          console.log(`  ${s.step}. ${s.justification}`);
        });
      }
    }

    // 4️⃣ VERIFY: Check for contradictions
    console.log('\n4️⃣ VERIFY Phase:');
    const contradictions = this.detectContradictions(insights);
    
    if (contradictions.length > 0) {
      console.log('⚠️ CONTRADICTIONS DETECTED:');
      contradictions.forEach(c => {
        console.log(`- ${c.agent1} vs ${c.agent2}: ${c.details}`);
        console.log(`  Severity: ${c.severity}`);
      });
    } else {
      console.log('✅ No contradictions detected - all insights are logically consistent');
    }

    // 5️⃣ REPORT: Generate final output
    console.log('\n5️⃣ REPORT Phase:');
    const report = this.generateReport(insights, contradictions);
    
    return report;
  }

  /**
   * Detect contradictions between insights
   */
  private detectContradictions(insights: any[]) {
    const contradictions = [];
    
    // Check each pair of insights
    for (let i = 0; i < insights.length; i++) {
      for (let j = i + 1; j < insights.length; j++) {
        const insight1 = insights[i];
        const insight2 = insights[j];
        
        // Check if conclusions contradict
        if (this.areContradictory(insight1, insight2)) {
          contradictions.push({
            agent1: insight1.agentName,
            agent2: insight2.agentName,
            details: `"${insight1.conclusion}" conflicts with "${insight2.conclusion}"`,
            severity: this.assessSeverity(insight1, insight2)
          });
        }
      }
    }
    
    return contradictions;
  }

  /**
   * Check if two insights are contradictory
   */
  private areContradictory(insight1: any, insight2: any): boolean {
    // Example contradiction detection logic
    if (insight1.conclusion.includes('low risk') && 
        insight2.conclusion.includes('high risk')) {
      return true;
    }
    
    if (insight1.conclusion.includes('compliant') && 
        insight2.conclusion.includes('breach')) {
      return true;
    }
    
    return false;
  }

  /**
   * Assess contradiction severity
   */
  private assessSeverity(insight1: any, insight2: any): string {
    if (insight1.agentName.includes('Compliance') || 
        insight2.agentName.includes('Compliance')) {
      return 'CRITICAL';
    }
    
    if (insight1.validation.confidence > 0.9 && 
        insight2.validation.confidence > 0.9) {
      return 'HIGH';
    }
    
    return 'MEDIUM';
  }

  /**
   * Generate comprehensive report
   */
  private generateReport(insights: any[], contradictions: any[]) {
    const validInsights = insights.filter(i => i.validation.valid);
    const invalidInsights = insights.filter(i => !i.validation.valid);
    
    const report = {
      summary: {
        totalInsights: insights.length,
        validInsights: validInsights.length,
        invalidInsights: invalidInsights.length,
        contradictions: contradictions.length,
        overallConfidence: this.calculateOverallConfidence(insights)
      },
      logicProof: {
        validProofs: validInsights.map(i => ({
          agent: i.agentName,
          conclusion: i.conclusion,
          proof: i.validation.explanation,
          confidence: i.validation.confidence
        }))
      },
      contradictionAnalysis: {
        detected: contradictions.length > 0,
        conflicts: contradictions,
        resolution: contradictions.length > 0 
          ? 'Manual review required for conflicting insights'
          : 'All insights are logically consistent'
      },
      agentTrace: insights.map(i => ({
        agent: i.agentName,
        timestamp: i.timestamp,
        valid: i.validation.valid,
        confidence: i.validation.confidence
      })),
      recommendedActions: this.generateRecommendations(insights, contradictions),
      narrative: this.generateNarrative(insights, contradictions)
    };
    
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(insights: any[]): number {
    const validInsights = insights.filter(i => i.validation.valid);
    if (validInsights.length === 0) return 0;
    
    const totalConfidence = validInsights.reduce((sum, i) => 
      sum + i.validation.confidence, 0
    );
    
    return totalConfidence / validInsights.length;
  }

  /**
   * Generate action recommendations
   */
  private generateRecommendations(insights: any[], contradictions: any[]): string[] {
    const recommendations = [];
    
    // Add recommendations based on valid insights
    insights.forEach(insight => {
      if (insight.validation.valid) {
        if (insight.conclusion.includes('high risk')) {
          recommendations.push('Immediate action required: Address high-risk items');
        }
        if (insight.conclusion.includes('covenant breach')) {
          recommendations.push('Critical: Contact lender regarding covenant breach');
        }
        if (insight.conclusion.includes('margin erosion')) {
          recommendations.push('Review expense categories for cost reduction');
        }
      }
    });
    
    // Add recommendations for contradictions
    if (contradictions.length > 0) {
      recommendations.push('Review and resolve contradicting insights manually');
    }
    
    return recommendations;
  }

  /**
   * Generate human-readable narrative
   */
  private generateNarrative(insights: any[], contradictions: any[]): string {
    let narrative = 'The philosophical reasoning system has completed its analysis. ';
    
    const validCount = insights.filter(i => i.validation.valid).length;
    narrative += `Out of ${insights.length} insights generated, ${validCount} were logically proven. `;
    
    if (contradictions.length > 0) {
      narrative += `However, ${contradictions.length} contradictions were detected, requiring manual review. `;
    } else {
      narrative += 'All insights are logically consistent with no contradictions. ';
    }
    
    const confidence = this.calculateOverallConfidence(insights);
    narrative += `The overall confidence in the analysis is ${(confidence * 100).toFixed(0)}%. `;
    
    if (confidence > 0.8) {
      narrative += 'The system recommends proceeding with the suggested actions.';
    } else {
      narrative += 'Additional review is recommended before taking action.';
    }
    
    return narrative;
  }
}

// Example execution
export async function runPhilosophicalDemo() {
  const demo = new PhilosophicalReasoningDemo();
  
  // Sample property data that will trigger various logic rules
  const propertyData = {
    propertyId: 'sunset-towers-12b',
    expenseIncrease: 15000,  // Will trigger margin erosion rule
    revenueGrowth: 0,        // Flat revenue
    dscr: 1.1,              // Below 1.2 threshold
    liquidityDays: 45,       // Below 60 days
    latePayments: 3,         // Above 2 threshold
    complaints: 4            // Above 3 threshold
  };
  
  console.log('Starting Philosophical Reasoning Demonstration...\n');
  const report = await demo.executeRecursiveReasoning(propertyData);
  
  return report;
}
