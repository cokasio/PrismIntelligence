/**
 * Critical Thinking Logic Layer - Propositional Calculus Engine
 * Implements formal logic validation for all Prism Intelligence agents
 */

export interface LogicalProposition {
  id: string;
  statement: string;
  value: boolean;
  source?: string;
  confidence?: number;
}

export interface LogicalRule {
  id: string;
  description: string;
  form: string; // e.g., "If A ∧ B → C"
  premises: LogicalProposition[];
  conclusion: LogicalProposition;
  weight?: number;
}

export interface ProofChain {
  rule: LogicalRule;
  steps: ProofStep[];
  valid: boolean;
  contradictions?: Contradiction[];
}

export interface ProofStep {
  step: number;
  operation: string;
  from: string[];
  to: string;
  justification: string;
}

export interface Contradiction {
  proposition1: LogicalProposition;
  proposition2: LogicalProposition;
  agents: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationResult {
  valid: boolean;
  proofChain?: ProofChain;
  contradictions?: Contradiction[];
  confidence: number;
  explanation: string;
}

export class PropositionalLogicEngine {
  private rules: Map<string, LogicalRule> = new Map();
  private knowledgeBase: Map<string, LogicalProposition> = new Map();
  private contradictionLog: Contradiction[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize domain-specific logical rules for property management
   */
  private initializeDefaultRules() {
    // Rule L001: Margin erosion detection
    this.addRule({
      id: 'L001',
      description: 'If expenses rise but revenue is flat, deduct margin erosion',
      form: 'If A ∧ B → C',
      premises: [
        { id: 'A', statement: 'GL5100 increase > $10,000', value: false },
        { id: 'B', statement: 'RevenueGrowth = 0%', value: false }
      ],
      conclusion: { id: 'C', statement: 'MarginRisk = High', value: false },
      weight: 0.9
    });

    // Rule L002: Debt covenant breach detection
    this.addRule({
      id: 'L002',
      description: 'If DSCR is low and liquidity < 60 days, flag covenant breach',
      form: 'If A ∧ B → D',
      premises: [
        { id: 'A', statement: 'DSCR < 1.2', value: false },
        { id: 'B', statement: 'LiquidityCoverage < 60', value: false }
      ],
      conclusion: { id: 'D', statement: 'DebtCovenantBreach = True', value: false },
      weight: 0.95
    });

    // Rule L003: Maintenance priority logic
    this.addRule({
      id: 'L003',
      description: 'If safety issue and high cost, prioritize immediately',
      form: 'If A ∧ B → C',
      premises: [
        { id: 'A', statement: 'SafetyIssue = True', value: false },
        { id: 'B', statement: 'EstimatedCost > $5000', value: false }
      ],
      conclusion: { id: 'C', statement: 'Priority = Immediate', value: false },
      weight: 1.0
    });

    // Rule L004: Tenant risk assessment
    this.addRule({
      id: 'L004',
      description: 'If late payments > 2 and complaints > 3, flag high risk',
      form: 'If A ∧ B → C',
      premises: [
        { id: 'A', statement: 'LatePayments > 2', value: false },
        { id: 'B', statement: 'ComplaintCount > 3', value: false }
      ],
      conclusion: { id: 'C', statement: 'TenantRisk = High', value: false },
      weight: 0.85
    });
  }

  /**
   * Add a new logical rule to the engine
   */
  addRule(rule: LogicalRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Update knowledge base with new propositions
   */
  updateKnowledge(propositions: LogicalProposition[]): void {
    propositions.forEach(prop => {
      // Check for contradictions with existing knowledge
      const existing = this.knowledgeBase.get(prop.id);
      if (existing && existing.value !== prop.value) {
        this.contradictionLog.push({
          proposition1: existing,
          proposition2: prop,
          agents: [existing.source || 'unknown', prop.source || 'unknown'],
          severity: this.assessContradictionSeverity(existing, prop)
        });
      }
      this.knowledgeBase.set(prop.id, prop);
    });
  }

  /**
   * Validate a conclusion using formal logic
   */
  validate(
    conclusion: LogicalProposition,
    evidence: LogicalProposition[],
    agentName: string
  ): ValidationResult {
    // Update knowledge base with evidence
    this.updateKnowledge(evidence);

    // Find applicable rules for this conclusion
    const applicableRules = this.findApplicableRules(conclusion);
    
    if (applicableRules.length === 0) {
      return {
        valid: false,
        confidence: 0,
        explanation: `No logical rules found to validate conclusion: ${conclusion.statement}`
      };
    }

    // Try to prove using each applicable rule
    for (const rule of applicableRules) {
      const proofChain = this.generateProofChain(rule, evidence, conclusion);
      
      if (proofChain.valid) {
        return {
          valid: true,
          proofChain,
          confidence: this.calculateConfidence(proofChain, evidence),
          explanation: this.generateExplanation(proofChain)
        };
      }
    }

    // Check for contradictions
    const contradictions = this.detectContradictions(conclusion, agentName);
    
    return {
      valid: false,
      contradictions,
      confidence: 0,
      explanation: 'Unable to prove conclusion using available evidence and rules'
    };
  }

  /**
   * Generate a proof chain using propositional calculus
   */
  private generateProofChain(
    rule: LogicalRule,
    evidence: LogicalProposition[],
    conclusion: LogicalProposition
  ): ProofChain {
    const steps: ProofStep[] = [];
    let stepCount = 1;

    // Step 1: List premises
    rule.premises.forEach(premise => {
      const evidenceMatch = evidence.find(e => 
        this.matchesProposition(e, premise)
      );
      
      if (evidenceMatch) {
        steps.push({
          step: stepCount++,
          operation: 'PREMISE',
          from: [],
          to: premise.id,
          justification: `Given: ${premise.statement} = ${evidenceMatch.value}`
        });
      }
    });

    // Step 2: Apply logical operators
    if (rule.form.includes('∧')) {
      // Conjunction (AND)
      const allPremisesTrue = rule.premises.every(p => {
        const match = evidence.find(e => this.matchesProposition(e, p));
        return match && match.value === true;
      });

      steps.push({
        step: stepCount++,
        operation: 'CONJUNCTION',
        from: rule.premises.map(p => p.id),
        to: 'intermediate',
        justification: `All premises are ${allPremisesTrue ? 'true' : 'not all true'}`
      });

      // Step 3: Modus Ponens
      if (allPremisesTrue) {
        steps.push({
          step: stepCount++,
          operation: 'MODUS_PONENS',
          from: ['intermediate'],
          to: conclusion.id,
          justification: `If premises are true, then ${conclusion.statement}`
        });
      }
    }

    const valid = steps.length > 0 && 
                  steps[steps.length - 1].to === conclusion.id;

    return {
      rule,
      steps,
      valid,
      contradictions: this.contradictionLog
    };
  }

  /**
   * Detect contradictions in the knowledge base
   */
  private detectContradictions(
    proposition: LogicalProposition,
    agentName: string
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];
    
    this.knowledgeBase.forEach((existing, key) => {
      if (this.isContradiction(proposition, existing)) {
        contradictions.push({
          proposition1: proposition,
          proposition2: existing,
          agents: [agentName, existing.source || 'unknown'],
          severity: this.assessContradictionSeverity(proposition, existing)
        });
      }
    });

    return contradictions;
  }

  /**
   * Cross-validate statements from multiple agents
   */
  crossValidateAgents(
    agentStatements: Map<string, LogicalProposition[]>
  ): ValidationResult {
    const allContradictions: Contradiction[] = [];
    let overallValid = true;

    // Compare each agent's statements with others
    const agents = Array.from(agentStatements.keys());
    
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const agent1Statements = agentStatements.get(agents[i]) || [];
        const agent2Statements = agentStatements.get(agents[j]) || [];

        // Check for contradictions between agents
        agent1Statements.forEach(stmt1 => {
          agent2Statements.forEach(stmt2 => {
            if (this.isContradiction(stmt1, stmt2)) {
              allContradictions.push({
                proposition1: stmt1,
                proposition2: stmt2,
                agents: [agents[i], agents[j]],
                severity: this.assessContradictionSeverity(stmt1, stmt2)
              });
              overallValid = false;
            }
          });
        });
      }
    }

    return {
      valid: overallValid,
      contradictions: allContradictions,
      confidence: overallValid ? 0.9 : 0.3,
      explanation: overallValid 
        ? 'All agent statements are logically consistent'
        : `Found ${allContradictions.length} contradictions between agents`
    };
  }

  /**
   * Helper methods
   */
  private findApplicableRules(conclusion: LogicalProposition): LogicalRule[] {
    return Array.from(this.rules.values()).filter(rule =>
      this.matchesProposition(rule.conclusion, conclusion)
    );
  }

  private matchesProposition(prop1: LogicalProposition, prop2: LogicalProposition): boolean {
    // Simple matching - can be enhanced with semantic similarity
    return prop1.statement.toLowerCase().includes(prop2.statement.toLowerCase()) ||
           prop2.statement.toLowerCase().includes(prop1.statement.toLowerCase());
  }

  private isContradiction(prop1: LogicalProposition, prop2: LogicalProposition): boolean {
    return this.matchesProposition(prop1, prop2) && prop1.value !== prop2.value;
  }

  private assessContradictionSeverity(
    prop1: LogicalProposition,
    prop2: LogicalProposition
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Financial contradictions are critical
    if (prop1.statement.includes('Covenant') || prop1.statement.includes('DSCR')) {
      return 'critical';
    }
    // Safety issues are high
    if (prop1.statement.includes('Safety')) {
      return 'high';
    }
    // Default to medium
    return 'medium';
  }

  private calculateConfidence(proofChain: ProofChain, evidence: LogicalProposition[]): number {
    const ruleWeight = proofChain.rule.weight || 0.8;
    const evidenceConfidence = evidence.reduce((sum, e) => sum + (e.confidence || 1), 0) / evidence.length;
    return ruleWeight * evidenceConfidence;
  }

  private generateExplanation(proofChain: ProofChain): string {
    const steps = proofChain.steps.map(s => s.justification).join(' → ');
    return `Logical proof: ${steps}`;
  }
}

// Singleton instance
export const logicEngine = new PropositionalLogicEngine();
