/**
 * Demo Data Generator
 * Creates compelling demo scenarios for Prism Intelligence
 */

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  documents: DemoDocument[];
  expectedInsights: string[];
  talkingPoints: string[];
}

export interface DemoDocument {
  filename: string;
  type: 'financial' | 'lease' | 'maintenance';
  content: string;
  expectedAnalysis: string[];
}

export class DemoDataGenerator {
  /**
   * Get all demo scenarios
   */
  getAllScenarios(): DemoScenario[] {
    return [
      this.getCovenantBreachScenario(),
      this.getTenantRiskScenario(),
      this.getMaintenancePriorityScenario(),
      this.getRevenueOptimizationScenario(),
      this.getComplianceAlertScenario()
    ];
  }

  /**
   * Scenario 1: Covenant Breach Detection
   * Shows mathematical proof validation and agent debate
   */
  private getCovenantBreachScenario(): DemoScenario {
    return {
      id: 'covenant-breach',
      name: 'Covenant Breach Alert',
      description: 'Demonstrates how AI detects and proves covenant breach risk with mathematical certainty',
      documents: [{
        filename: 'Q4-2024-Financial-Report.pdf',
        type: 'financial',
        content: `
HARBOR POINT PROPERTIES
Q4 2024 FINANCIAL REPORT

INCOME STATEMENT
Revenue:
  Rental Income:        $487,500
  Other Income:         $12,300
  Total Revenue:        $499,800

Operating Expenses:
  Maintenance:          $89,450
  Utilities:           $67,200
  Management:          $49,980
  Insurance:           $41,200
  Property Tax:        $78,500
  Total OpEx:         $326,330

Net Operating Income:  $173,470

Debt Service:         $147,450
DSCR:                 1.18

BALANCE SHEET HIGHLIGHTS
Current Assets:       $892,300
Current Liabilities:  $423,100
Days Cash on Hand:    45 days

COVENANT REQUIREMENTS
Minimum DSCR:         1.20
Minimum Liquidity:    60 days
        `,
        expectedAnalysis: [
          'DSCR below covenant threshold',
          'Liquidity requirement not met',
          'Immediate action required'
        ]
      }],
      expectedInsights: [
        'CRITICAL: Debt Service Coverage Ratio at 1.18, below 1.20 covenant requirement',
        'ALERT: Liquidity at 45 days, below 60-day minimum requirement',
        'Recommend immediate rent collection acceleration to improve DSCR'
      ],
      talkingPoints: [
        'Watch the AI prove the covenant breach with formal logic',
        'See agents debate the severity and solutions',
        'Notice the complete audit trail from source to conclusion',
        'The system shows exactly which numbers lead to the alert'
      ]
    };
  }

  /**
   * Scenario 2: Tenant Risk Assessment
   * Shows pattern recognition and predictive analytics
   */
  private getTenantRiskScenario(): DemoScenario {
    return {
      id: 'tenant-risk',
      name: 'At-Risk Tenant Detection',
      description: 'AI identifies tenants likely to default or leave based on payment patterns',
      documents: [{
        filename: 'Tenant-Payment-History-2024.csv',
        type: 'financial',
        content: `
Unit,Tenant,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec
12A,Smith J,On Time,On Time,Late 5,On Time,Late 8,Late 12,On Time,Late 15,Late 18,On Time,Late 20,Late 22
15B,Johnson M,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time
23C,Williams R,On Time,Late 3,Late 5,Late 7,Late 10,Late 14,Late 16,Late 19,Not Paid,Partial,Late 25,Late 28
31A,Brown K,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time,On Time
42B,Davis L,On Time,On Time,On Time,Late 2,On Time,Late 5,On Time,Late 8,On Time,Late 11,On Time,Late 15
        `,
        expectedAnalysis: [
          'Unit 23C shows severe payment degradation',
          'Unit 12A showing concerning trend',
          'Unit 42B pattern suggests financial stress'
        ]
      }],
      expectedInsights: [
        'HIGH RISK: Unit 23C - Progressive payment delays indicate imminent default',
        'MEDIUM RISK: Unit 12A - Escalating late payments from 5 to 22 days',
        'WATCH: Unit 42B - Alternating pattern suggests paycheck-to-paycheck situation'
      ],
      talkingPoints: [
        'AI detects payment pattern degradation automatically',
        'Predictive model identifies risk before default occurs',
        'Agents debate intervention strategies',
        'System learns from historical outcomes to improve predictions'
      ]
    };
  }

  /**
   * Scenario 3: Maintenance Priority Optimization
   * Shows multi-agent collaboration on resource allocation
   */
  private getMaintenancePriorityScenario(): DemoScenario {
    return {
      id: 'maintenance-priority',
      name: 'Emergency vs Preventive Maintenance',
      description: 'Agents debate how to allocate limited maintenance budget for maximum impact',
      documents: [{
        filename: 'Maintenance-Report-Q4-2024.pdf',
        type: 'maintenance',
        content: `
QUARTERLY MAINTENANCE REPORT
Harbor Point Properties - Q4 2024

URGENT REPAIRS NEEDED:
1. Building A - HVAC System (18 years old)
   - Multiple failures last month
   - Estimated repair: $4,500
   - Full replacement: $15,000
   - Tenant complaints: 12

2. Building B - Roof Leak (Unit 45)
   - Active water damage
   - Estimated repair: $2,800
   - Affected units: 3
   - Insurance claim possible

3. Building C - Elevator Modernization
   - Code compliance required by March
   - Estimated cost: $35,000
   - Current status: Operational but outdated

PREVENTIVE MAINTENANCE SCHEDULED:
- Parking lot resealing: $8,000
- Landscape improvements: $5,500
- Pool equipment service: $1,200

BUDGET REMAINING: $25,000
        `,
        expectedAnalysis: [
          'HVAC failure risk in winter is critical',
          'Roof leak causing ongoing damage',
          'Elevator compliance is mandatory',
          'Budget insufficient for all repairs'
        ]
      }],
      expectedInsights: [
        'CRITICAL: Building A HVAC failure imminent - winter approaching',
        'URGENT: Active water damage in Building B spreading to adjacent units',
        'COMPLIANCE: Elevator must be modernized by March deadline',
        'BUDGET CRISIS: Only $25k available for $52k+ in urgent repairs'
      ],
      talkingPoints: [
        'Watch agents debate repair vs replace decision',
        'See financial impact analysis of each option',
        'Observe risk assessment for tenant retention',
        'Notice how system prioritizes safety and compliance'
      ]
    };
  }

  /**
   * Scenario 4: Revenue Optimization
   * Shows market analysis and opportunity identification
   */
  private getRevenueOptimizationScenario(): DemoScenario {
    return {
      id: 'revenue-optimization',
      name: 'Below-Market Rent Discovery',
      description: 'AI identifies units priced below market rate with renewal opportunities',
      documents: [{
        filename: 'Rent-Roll-December-2024.xlsx',
        type: 'financial',
        content: `
Unit,Tenant,Current Rent,Lease Start,Lease End,Market Rate,Variance
Penthouse A,Harrison LLC,$4,500,01/01/2023,12/31/2024,$5,200,-$700
12A,Smith J,$1,850,03/15/2022,03/14/2025,$2,100,-$250
15B,Johnson M,$2,200,06/01/2023,05/31/2025,$2,300,-$100
23C,Williams R,$1,950,09/01/2022,08/31/2024,$2,150,-$200
31A,Brown K,$2,400,12/01/2023,11/30/2025,$2,450,-$50
42B,Davis L,$2,100,07/15/2023,07/14/2025,$2,250,-$150
51C,Miller S,$3,200,02/01/2024,01/31/2026,$3,300,-$100
62A,Wilson T,$2,800,10/01/2023,09/30/2025,$3,100,-$300
        `,
        expectedAnalysis: [
          'Penthouse A significantly under market',
          'Multiple units with upcoming renewals',
          'Total revenue opportunity: $1,750/month'
        ]
      }],
      expectedInsights: [
        'OPPORTUNITY: Penthouse A is $700/month below market - renewal in 30 days',
        'REVENUE GAP: 8 units totaling $1,750/month below market rates',
        'STRATEGY: Prioritize renewals for largest variances with strong tenants',
        'ANNUAL IMPACT: Potential $21,000 additional revenue from optimizations'
      ],
      talkingPoints: [
        'AI automatically calculates market variance',
        'Agents debate retention risk vs revenue gain',
        'System considers tenant quality in recommendations',
        'See projected annual revenue impact clearly'
      ]
    };
  }

  /**
   * Scenario 5: Compliance Alert
   * Shows regulatory monitoring and proactive alerts
   */
  private getComplianceAlertScenario(): DemoScenario {
    return {
      id: 'compliance-alert',
      name: 'Multi-State Compliance Check',
      description: 'AI monitors changing regulations and identifies compliance gaps',
      documents: [{
        filename: 'Property-Compliance-Audit-2024.pdf',
        type: 'financial',
        content: `
ANNUAL COMPLIANCE AUDIT REPORT
Harbor Point Properties - December 2024

FAIR HOUSING COMPLIANCE:
- Last Training Date: January 15, 2024
- Staff Certified: 12 of 18 (67%)
- Expired Certifications: 6
- Next Required: January 15, 2025

SAFETY INSPECTIONS:
- Fire Systems: Completed 10/2024 ✓
- Elevators: Due 03/2025 ⚠️
- Pool/Spa: Completed 05/2024 ✓
- Playground: Overdue since 09/2024 ❌

FINANCIAL COMPLIANCE:
- Security Deposit Accounts: Compliant ✓
- Rent Control Filing: Due 01/31/2025 ⚠️
- Property Tax Appeal: Deadline 02/15/2025

NEW REGULATIONS 2025:
- Energy Benchmarking Required (CA properties)
- Lead Paint Disclosure Updates (Federal)
- Source of Income Protection (State law)

INSURANCE REQUIREMENTS:
- General Liability: $5M (Current: $3M) ❌
- Cyber Insurance: Now Required ❌
        `,
        expectedAnalysis: [
          'Multiple compliance deadlines approaching',
          'Insurance coverage gaps identified',
          'Training requirements not met'
        ]
      }],
      expectedInsights: [
        'URGENT: 6 staff have expired Fair Housing certifications - training needed by Jan 15',
        'CRITICAL: General Liability insurance $2M below new requirement',
        'OVERDUE: Playground safety inspection 3 months past due - liability risk',
        'NEW REQUIREMENT: Cyber insurance now mandatory - not currently carried'
      ],
      talkingPoints: [
        'AI tracks multiple compliance requirements automatically',
        'Proactive alerts before deadlines pass',
        'Risk assessment for each compliance gap',
        'Agents prioritize by legal and financial impact'
      ]
    };
  }

  /**
   * Generate sample file content for testing
   */
  generateSampleFile(scenario: DemoScenario, index: number = 0): Buffer {
    const document = scenario.documents[index];
    return Buffer.from(document.content);
  }

  /**
   * Get demo talking points for sales presentations
   */
  getDemoScript(scenarioId: string): string[] {
    const scenario = this.getAllScenarios().find(s => s.id === scenarioId);
    if (!scenario) return [];

    const script = [
      `Today I'll show you ${scenario.name}.`,
      scenario.description,
      'Watch what happens when I upload this document...',
      ...scenario.talkingPoints,
      'Notice how everything is mathematically proven, not just guessed.',
      'This entire analysis took less than 60 seconds.',
      'Every insight links back to the source data.',
      'You can see exactly how the AI reached its conclusions.'
    ];

    return script;
  }

  /**
   * Generate realistic agent debate for demo
   */
  generateDemoDebate(scenarioId: string): any[] {
    const debates: Record<string, any[]> = {
      'covenant-breach': [
        {
          agentId: 'FinanceBot',
          agentName: 'Financial Analyst',
          phase: 'proposal',
          content: 'DSCR at 1.18 violates our 1.20 covenant - we need immediate action',
          timestamp: new Date()
        },
        {
          agentId: 'RiskBot',
          agentName: 'Risk Manager',
          phase: 'proposal',
          content: 'Liquidity is also below threshold at 45 days vs 60 required',
          timestamp: new Date()
        },
        {
          agentId: 'OperationsBot',
          agentName: 'Operations Manager',
          phase: 'challenge',
          content: 'We have $47k in receivables due this week that would improve DSCR',
          timestamp: new Date()
        },
        {
          agentId: 'FinanceBot',
          agentName: 'Financial Analyst',
          phase: 'resolution',
          content: 'Even with collections, we need to cut expenses by 5% to maintain cushion',
          timestamp: new Date()
        }
      ],
      'tenant-risk': [
        {
          agentId: 'TenantBot',
          agentName: 'Tenant Relations',
          phase: 'proposal',
          content: 'Unit 23C has degraded from on-time to 28 days late over 12 months',
          timestamp: new Date()
        },
        {
          agentId: 'FinanceBot',
          agentName: 'Financial Analyst',
          phase: 'proposal',
          content: 'Statistical model shows 87% chance of default within 60 days',
          timestamp: new Date()
        },
        {
          agentId: 'LegalBot',
          agentName: 'Legal Advisor',
          phase: 'challenge',
          content: 'Early intervention could avoid costly eviction proceedings',
          timestamp: new Date()
        }
      ]
    };

    return debates[scenarioId] || [];
  }
}

// Export singleton instance
export const demoDataGenerator = new DemoDataGenerator();
