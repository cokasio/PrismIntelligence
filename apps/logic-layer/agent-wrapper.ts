/**
 * Agent Logic Wrapper - Adds formal logic validation to Prism Intelligence agents
 */

import { logicEngine, LogicalProposition, ValidationResult } from './logic-engine';

export interface AgentInsight {
  agentName: string;
  conclusion: string;
  evidence: Array<{
    fact: string;
    value: any;
    source?: string;
  }>;
  confidence?: number;
  timestamp: Date;
}

export interface ValidatedInsight extends AgentInsight {
  validation: ValidationResult;
  logicalProof?: string;
  contradictions?: Array<{
    with: string;
    severity: string;
    details: string;
  }>;
}

/**
 * Wrapper class that adds logical validation to any agent
 */
export class LogicalAgentWrapper {
  private agentName: string;
  private enforceLogic: boolean;

  constructor(agentName: string, enforceLogic: boolean = true) {
    this.agentName = agentName;
    this.enforceLogic = enforceLogic;
  }

  /**
   * Validate an agent's insight using formal logic
   */
  async validateInsight(insight: AgentInsight): Promise<ValidatedInsight> {
    // Convert evidence to logical propositions
    const propositions: LogicalProposition[] = insight.evidence.map((e, idx) => ({
      id: `${this.agentName}_E${idx}`,
      statement: e.fact,
      value: this.evaluateValue(e.value),
      source: this.agentName,
      confidence: insight.confidence || 0.8
    }));

    // Create conclusion proposition
    const conclusion: LogicalProposition = {
      id: `${this.agentName}_C`,
      statement: insight.conclusion,
      value: true,
      source: this.agentName,
      confidence: insight.confidence || 0.8
    };

    // Validate using logic engine
    const validation = logicEngine.validate(conclusion, propositions, this.agentName);

    // Format contradictions for UI
    const contradictions = validation.contradictions?.map(c => ({
      with: c.agents.filter(a => a !== this.agentName)[0] || 'system',
      severity: c.severity,
      details: `${c.proposition1.statement} conflicts with ${c.proposition2.statement}`
    }));

    return {
      ...insight,
      validation,
      logicalProof: validation.proofChain ? 
        this.formatProofChain(validation.proofChain) : undefined,
      contradictions
    };
  }

  /**
   * Format proof chain for UI display
   */
  private formatProofChain(proofChain: any): string {
    const steps = proofChain.steps.map((step: any) => 
      `${step.step}. ${step.justification}`
    ).join('\n');
    
    return `Logical Proof (${proofChain.rule.form}):\n${steps}`;
  }

  /**
   * Convert various value types to boolean for logic evaluation
   */
  private evaluateValue(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === 'yes' || lower === 'high';
    }
    return false;
  }
}

/**
 * Specific agent wrappers with domain logic
 */
export class InsightGeneratorAgentWrapper extends LogicalAgentWrapper {
  constructor() {
    super('InsightGeneratorAgent');
  }

  async generateInsight(data: any): Promise<ValidatedInsight> {
    // Agent-specific logic to generate insight
    const insight: AgentInsight = {
      agentName: this.agentName,
      conclusion: 'Property shows margin erosion risk',
      evidence: [
        { fact: 'GL5100 increase > $10,000', value: data.expenseIncrease > 10000 },
        { fact: 'RevenueGrowth = 0%', value: data.revenueGrowth === 0 }
      ],
      confidence: 0.85,
      timestamp: new Date()
    };

    return this.validateInsight(insight);
  }
}

export class ComplianceAgentWrapper extends LogicalAgentWrapper {
  constructor() {
    super('ComplianceAgent');
  }

  async checkCompliance(data: any): Promise<ValidatedInsight> {
    const insight: AgentInsight = {
      agentName: this.agentName,
      conclusion: 'Property at risk of debt covenant breach',
      evidence: [
        { fact: 'DSCR < 1.2', value: data.dscr < 1.2 },
        { fact: 'LiquidityCoverage < 60', value: data.liquidityDays < 60 }
      ],
      confidence: 0.92,
      timestamp: new Date()
    };

    return this.validateInsight(insight);
  }
}

export class RiskFlaggerAgentWrapper extends LogicalAgentWrapper {
  constructor() {
    super('RiskFlaggerAgent');
  }

  async assessRisk(data: any): Promise<ValidatedInsight> {
    const insight: AgentInsight = {
      agentName: this.agentName,
      conclusion: 'Tenant presents high risk profile',
      evidence: [
        { fact: 'LatePayments > 2', value: data.latePayments > 2 },
        { fact: 'ComplaintCount > 3', value: data.complaints > 3 }
      ],
      confidence: 0.78,
      timestamp: new Date()
    };

    return this.validateInsight(insight);
  }
}

export class SynthesisAgentWrapper extends LogicalAgentWrapper {
  constructor() {
    super('SynthesisAgent');
  }

  async synthesize(insights: ValidatedInsight[]): Promise<ValidatedInsight> {
    // Cross-validate all insights
    const agentStatements = new Map<string, LogicalProposition[]>();
    
    insights.forEach(insight => {
      const props = insight.evidence.map((e, idx) => ({
        id: `${insight.agentName}_E${idx}`,
        statement: e.fact,
        value: this.evaluateValue(e.value),
        source: insight.agentName,
        confidence: insight.confidence || 0.8
      }));
      
      agentStatements.set(insight.agentName, props);
    });

    const crossValidation = logicEngine.crossValidateAgents(agentStatements);

    return {
      agentName: this.agentName,
      conclusion: 'Multi-agent synthesis complete',
      evidence: insights.map(i => ({
        fact: `${i.agentName}: ${i.conclusion}`,
        value: i.validation.valid,
        source: i.agentName
      })),
      confidence: crossValidation.confidence,
      timestamp: new Date(),
      validation: crossValidation,
      contradictions: crossValidation.contradictions?.map(c => ({
        with: c.agents.join(' vs '),
        severity: c.severity,
        details: `${c.proposition1.statement} conflicts with ${c.proposition2.statement}`
      }))
    };
  }

  private evaluateValue(value: any): boolean {
    if (typeof value === 'boolean') return value;
    return true;
  }
}

/**
 * Factory to create wrapped agents
 */
export class LogicalAgentFactory {
  static createAgent(agentType: string): LogicalAgentWrapper {
    switch (agentType) {
      case 'InsightGeneratorAgent':
        return new InsightGeneratorAgentWrapper();
      case 'ComplianceAgent':
        return new ComplianceAgentWrapper();
      case 'RiskFlaggerAgent':
        return new RiskFlaggerAgentWrapper();
      case 'SynthesisAgent':
        return new SynthesisAgentWrapper();
      default:
        return new LogicalAgentWrapper(agentType);
    }
  }
}
