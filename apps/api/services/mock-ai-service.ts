/**
 * Mock AI Service
 * Provides realistic AI responses for demo purposes
 * Replace with real AI APIs when ready
 */

import { ParsedDocument } from './document-parser';

export interface AIAnalysisResult {
  agentId: string;
  agentName: string;
  analysis: string;
  insights: AIInsight[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
}

export interface AIInsight {
  id: string;
  type: 'variance' | 'risk' | 'opportunity' | 'compliance' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'soon' | 'planned';
  metrics?: Record<string, any>;
}

export interface Evidence {
  fact: string;
  value: any;
  source: string;
  confidence: number;
  location?: string;
}

export class MockAIService {
  /**
   * Simulate AI analysis with realistic responses
   */
  async analyzeDocument(
    parsedDoc: ParsedDocument,
    agentType: 'financial' | 'risk' | 'compliance' | 'tenant' | 'maintenance'
  ): Promise<AIAnalysisResult> {
    // Simulate processing delay
    await this.delay(1000 + Math.random() * 2000);
    
    switch (agentType) {
      case 'financial':
        return this.generateFinancialAnalysis(parsedDoc);
      case 'risk':
        return this.generateRiskAnalysis(parsedDoc);
      case 'compliance':
        return this.generateComplianceAnalysis(parsedDoc);
      case 'tenant':
        return this.generateTenantAnalysis(parsedDoc);
      case 'maintenance':
        return this.generateMaintenanceAnalysis(parsedDoc);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  /**
   * Generate compelling agent debates
   */
  async generateDebate(
    topic: string,
    agents: string[]
  ): Promise<DebateEntry[]> {
    const debates = {
      lease_renewal: [
        {
          agentId: 'FinanceBot',
          phase: 'proposal',
          content: 'Recommend 3% rent increase based on market analysis',
          timestamp: new Date()
        },
        {
          agentId: 'TenantBot',
          phase: 'challenge',
          content: 'This tenant has perfect payment history for 5 years - we risk losing them',
          timestamp: new Date()
        },
        {
          agentId: 'MarketAnalysisBot',
          phase: 'proposal',
          content: 'Comparable units in area increased 4.5% this year',
          timestamp: new Date()
        },
        {
          agentId: 'RiskBot',
          phase: 'challenge',
          content: 'Vacancy cost would be $4,500 - exceeds potential gain from increase',
          timestamp: new Date()
        },
        {
          agentId: 'FinanceBot',
          phase: 'resolution',
          content: 'Propose compromise: 2% increase with 18-month lease lock',
          timestamp: new Date()
        },
        {
          agentId: 'ConsensusBot',
          phase: 'consensus',
          content: 'Agreement reached: 2% increase with extended lease provides stability',
          timestamp: new Date()
        }
      ],
      maintenance_priority: [
        {
          agentId: 'MaintenanceBot',
          phase: 'proposal',
          content: 'HVAC replacement needed in Building A - quoted at $15,000',
          timestamp: new Date()
        },
        {
          agentId: 'FinanceBot',
          phase: 'challenge',
          content: 'Budget only has $8,000 allocated for Q1 maintenance',
          timestamp: new Date()
        },
        {
          agentId: 'RiskBot',
          phase: 'proposal',
          content: 'System failure in winter would cause tenant exodus - critical risk',
          timestamp: new Date()
        },
        {
          agentId: 'FinanceBot',
          phase: 'resolution',
          content: 'Can reallocate from landscaping budget - tenant retention priority',
          timestamp: new Date()
        }
      ]
    };
    
    // Return appropriate debate or generate generic one
    const debateKey = topic.toLowerCase().replace(/\s+/g, '_');
    return debates[debateKey as keyof typeof debates] || this.generateGenericDebate(agents);
  }

  /**
   * Financial analysis generator
   */
  private generateFinancialAnalysis(doc: ParsedDocument): AIAnalysisResult {
    const hasRevenue = doc.structuredData.metrics?.revenue;
    const hasExpenses = doc.structuredData.metrics?.expenses;
    
    const insights: AIInsight[] = [];
    
    // Generate realistic financial insights
    if (hasRevenue && hasExpenses) {
      const margin = ((hasRevenue - hasExpenses) / hasRevenue) * 100;
      
      insights.push({
        id: 'fin-001',
        type: 'variance',
        title: 'Operating Margin Analysis',
        description: `Current operating margin is ${margin.toFixed(1)}%, which is ${margin > 20 ? 'above' : 'below'} industry standard`,
        impact: margin > 20 ? 'low' : 'high',
        urgency: margin < 15 ? 'immediate' : 'planned',
        metrics: { margin, revenue: hasRevenue, expenses: hasExpenses }
      });
    }
    
    // Always add some insights for demo
    insights.push({
      id: 'fin-002',
      type: 'opportunity',
      title: 'Revenue Optimization Opportunity',
      description: 'Analysis shows 3 units below market rate by average of $150/month',
      impact: 'medium',
      urgency: 'soon',
      metrics: { potentialIncrease: 450, unitsAffected: 3 }
    });
    
    insights.push({
      id: 'fin-003',
      type: 'anomaly',
      title: 'Unusual Utility Expense Spike',
      description: 'Water costs increased 35% month-over-month without occupancy change',
      impact: 'medium',
      urgency: 'immediate',
      metrics: { percentIncrease: 35, dollarIncrease: 1200 }
    });
    
    return {
      agentId: 'FinanceBot',
      agentName: 'Financial Analysis Agent',
      analysis: 'Comprehensive financial review completed with focus on revenue optimization and cost control',
      insights,
      recommendations: [
        'Investigate water usage spike - possible leak in Building B',
        'Schedule rent review for units 12A, 15C, and 23B',
        'Consider energy audit to reduce utility costs by projected 15%'
      ],
      confidence: 0.89,
      evidence: [
        {
          fact: 'Operating Margin',
          value: `${(hasRevenue && hasExpenses) ? ((hasRevenue - hasExpenses) / hasRevenue * 100).toFixed(1) : '18.5'}%`,
          source: 'P&L Statement Page 1',
          confidence: 0.95
        },
        {
          fact: 'YoY Revenue Growth',
          value: '12.3%',
          source: 'Comparative Analysis Page 3',
          confidence: 0.87
        }
      ]
    };
  }

  /**
   * Risk analysis generator
   */
  private generateRiskAnalysis(doc: ParsedDocument): AIAnalysisResult {
    return {
      agentId: 'RiskBot',
      agentName: 'Risk Assessment Agent',
      analysis: 'Risk evaluation completed with focus on financial covenants and operational risks',
      insights: [
        {
          id: 'risk-001',
          type: 'risk',
          title: 'Debt Service Coverage Approaching Threshold',
          description: 'DSCR at 1.18x, dangerously close to 1.15x covenant requirement',
          impact: 'high',
          urgency: 'immediate',
          metrics: { currentDSCR: 1.18, threshold: 1.15, buffer: 0.03 }
        },
        {
          id: 'risk-002',
          type: 'compliance',
          title: 'Insurance Review Required',
          description: 'Property insurance renewal due in 45 days, market rates increased 22%',
          impact: 'medium',
          urgency: 'soon',
          metrics: { daysUntilRenewal: 45, expectedIncrease: 22 }
        }
      ],
      recommendations: [
        'Accelerate rent collection to improve DSCR before month-end',
        'Obtain 3 insurance quotes immediately to negotiate better rates',
        'Consider refinancing options if DSCR continues to decline'
      ],
      confidence: 0.92,
      evidence: [
        {
          fact: 'Debt Service Coverage Ratio',
          value: 1.18,
          source: 'Financial Covenants Report',
          confidence: 0.98
        },
        {
          fact: 'Days Cash on Hand',
          value: 47,
          source: 'Cash Flow Analysis',
          confidence: 0.91
        }
      ]
    };
  }

  /**
   * Compliance analysis generator
   */
  private generateComplianceAnalysis(doc: ParsedDocument): AIAnalysisResult {
    return {
      agentId: 'ComplianceBot',
      agentName: 'Compliance Monitoring Agent',
      analysis: 'Regulatory compliance check completed across federal, state, and local requirements',
      insights: [
        {
          id: 'comp-001',
          type: 'compliance',
          title: 'Fair Housing Training Overdue',
          description: '6 staff members have expired fair housing certifications',
          impact: 'high',
          urgency: 'immediate',
          metrics: { staffAffected: 6, daysOverdue: 30 }
        },
        {
          id: 'comp-002',
          type: 'compliance',
          title: 'ADA Inspection Scheduled',
          description: 'Annual ADA compliance inspection due within 60 days',
          impact: 'medium',
          urgency: 'soon',
          metrics: { daysUntilDue: 60, lastInspectionScore: 94 }
        }
      ],
      recommendations: [
        'Schedule immediate fair housing training session',
        'Conduct pre-inspection ADA walkthrough',
        'Update compliance calendar with all 2024 deadlines'
      ],
      confidence: 0.94,
      evidence: [
        {
          fact: 'Compliance Score',
          value: '94/100',
          source: 'Q3 Compliance Audit',
          confidence: 0.96
        }
      ]
    };
  }

  /**
   * Tenant analysis generator
   */
  private generateTenantAnalysis(doc: ParsedDocument): AIAnalysisResult {
    return {
      agentId: 'TenantBot',
      agentName: 'Tenant Relations Agent',
      analysis: 'Tenant satisfaction and retention analysis completed',
      insights: [
        {
          id: 'tenant-001',
          type: 'opportunity',
          title: 'High-Value Tenant Renewal Opportunity',
          description: 'Premium tenant in Penthouse A - lease expires in 90 days',
          impact: 'high',
          urgency: 'soon',
          metrics: { monthlyRent: 4500, tenancyLength: 5, satisfactionScore: 9.2 }
        },
        {
          id: 'tenant-002',
          type: 'risk',
          title: 'Multiple Noise Complaints - Unit 23B',
          description: '4 complaints in 30 days from neighboring units',
          impact: 'medium',
          urgency: 'immediate',
          metrics: { complaints: 4, timeframe: 30, affectedUnits: 3 }
        }
      ],
      recommendations: [
        'Proactive renewal offer for Penthouse A with minimal increase',
        'Schedule meeting with Unit 23B tenant regarding noise policy',
        'Consider tenant appreciation event to boost retention'
      ],
      confidence: 0.87,
      evidence: [
        {
          fact: 'Tenant Retention Rate',
          value: '87%',
          source: 'Annual Tenant Report',
          confidence: 0.93
        }
      ]
    };
  }

  /**
   * Maintenance analysis generator
   */
  private generateMaintenanceAnalysis(doc: ParsedDocument): AIAnalysisResult {
    return {
      agentId: 'MaintenanceBot',
      agentName: 'Maintenance Planning Agent',
      analysis: 'Preventive maintenance and repair analysis completed',
      insights: [
        {
          id: 'maint-001',
          type: 'risk',
          title: 'HVAC System End-of-Life Alert',
          description: 'Building A primary HVAC unit is 18 years old, 3 years past expected lifespan',
          impact: 'high',
          urgency: 'soon',
          metrics: { age: 18, expectedLife: 15, repairCosts2023: 4500 }
        },
        {
          id: 'maint-002',
          type: 'opportunity',
          title: 'Energy Efficiency Upgrade Opportunity',
          description: 'LED conversion could reduce energy costs by $800/month',
          impact: 'medium',
          urgency: 'planned',
          metrics: { monthlySavings: 800, paybackMonths: 18, totalCost: 14400 }
        }
      ],
      recommendations: [
        'Budget for HVAC replacement in Q2 2024',
        'Obtain LED conversion quotes from 3 vendors',
        'Implement predictive maintenance program to reduce emergency repairs'
      ],
      confidence: 0.91,
      evidence: [
        {
          fact: 'Emergency Repair Rate',
          value: '3.2 per month',
          source: 'Maintenance Log Analysis',
          confidence: 0.95
        }
      ]
    };
  }

  /**
   * Generate generic debate for any topic
   */
  private generateGenericDebate(agents: string[]): DebateEntry[] {
    return [
      {
        agentId: agents[0],
        phase: 'proposal',
        content: 'Initial analysis suggests immediate action required',
        timestamp: new Date()
      },
      {
        agentId: agents[1],
        phase: 'challenge',
        content: 'Cost-benefit analysis shows potential risks',
        timestamp: new Date()
      },
      {
        agentId: agents[0],
        phase: 'resolution',
        content: 'Phased approach could mitigate risks while achieving goals',
        timestamp: new Date()
      },
      {
        agentId: 'ConsensusBot',
        phase: 'consensus',
        content: 'Agreed: Implement phased approach with monthly reviews',
        timestamp: new Date()
      }
    ];
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface DebateEntry {
  agentId: string;
  phase: 'proposal' | 'challenge' | 'resolution' | 'consensus';
  content: string;
  timestamp: Date;
}

// Export singleton instance
export const mockAIService = new MockAIService();
