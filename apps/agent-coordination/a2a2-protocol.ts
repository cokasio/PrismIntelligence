/**
 * Enhanced Agent Coordination - A2A2 + MCP Protocol Implementation
 * Enables agents to debate, challenge, and reach consensus
 */

import { logicEngine, LogicalProposition, ValidationResult } from '../logic-layer/logic-engine';
import { ValidatedInsight } from '../logic-layer/agent-wrapper';

// Agent proposal structure
export interface AgentProposal {
  agentId: string;
  agentName: string;
  proposal: string;
  evidence: Array<{
    fact: string;
    value: any;
    confidence: number;
  }>;
  confidence: number;
  timestamp: Date;
  logicValidation?: ValidationResult;
}

// Challenge structure
export interface AgentChallenge {
  challengerId: string;
  challengerName: string;
  targetProposalId: string;
  challengeType: 'logic' | 'evidence' | 'methodology' | 'conclusion';
  challenge: string;
  alternativeProposal?: string;
  supportingEvidence?: any[];
}

// Consensus result
export interface ConsensusResult {
  taskId: string;
  achieved: boolean;
  method: 'unanimous' | 'majority' | 'weighted' | 'failed';
  finalProposal: string;
  supportingAgents: string[];
  dissentingAgents: string[];
  confidence: number;
  debateLog: DebateEntry[];
  logicTrace: ValidationResult[];
  dissentRecord?: DissentRecord[];
}

// Debate log entry
export interface DebateEntry {
  timestamp: Date;
  phase: 'proposal' | 'challenge' | 'resolution' | 'consensus';
  agentId: string;
  action: string;
  content: string;
}

// Dissent record
export interface DissentRecord {
  agentId: string;
  agentName: string;
  reason: string;
  alternativeConclusion: string;
  confidence: number;
}

// A2A2 Protocol Configuration
export interface A2A2Config {
  minAgentsForConsensus: number;
  consensusThreshold: number; // 0-1, percentage needed
  maxDebateRounds: number;
  enableLogicValidation: boolean;
  requireUnanimous: boolean;
  agentWeights?: Map<string, number>; // Agent influence weights
}

/**
 * Enhanced Agent Coordination System
 * Implements A2A2 (Agent-to-Agent) and MCP (Multi-Agent Consensus) protocols
 */
export class EnhancedAgentCoordination {
  private agents: Map<string, AgentInfo> = new Map();
  private debateHistory: Map<string, DebateEntry[]> = new Map();
  private config: A2A2Config;

  constructor(config?: Partial<A2A2Config>) {
    this.config = {
      minAgentsForConsensus: 3,
      consensusThreshold: 0.7,
      maxDebateRounds: 5,
      enableLogicValidation: true,
      requireUnanimous: false,
      ...config
    };
    
    this.initializeAgents();
  }

  /**
   * Initialize available agents
   */
  private initializeAgents() {
    const agentList = [
      { id: 'finance-bot', name: 'FinanceBot', specialty: 'financial-analysis', weight: 1.2 },
      { id: 'tenant-bot', name: 'TenantBot', specialty: 'tenant-management', weight: 1.0 },
      { id: 'maintenance-bot', name: 'MaintenanceBot', specialty: 'maintenance', weight: 1.0 },
      { id: 'legal-bot', name: 'LegalBot', specialty: 'compliance', weight: 1.3 },
      { id: 'insight-gen', name: 'InsightGeneratorAgent', specialty: 'analysis', weight: 1.1 },
      { id: 'risk-flag', name: 'RiskFlaggerAgent', specialty: 'risk-assessment', weight: 1.2 },
      { id: 'compliance', name: 'ComplianceAgent', specialty: 'regulatory', weight: 1.3 }
    ];

    agentList.forEach(agent => {
      this.agents.set(agent.id, {
        ...agent,
        status: 'active'
      });
    });

    // Set agent weights if not provided
    if (!this.config.agentWeights) {
      this.config.agentWeights = new Map();
      agentList.forEach(agent => {
        this.config.agentWeights!.set(agent.id, agent.weight);
      });
    }
  }

  /**
   * Execute task with A2A2 + MCP protocols
   */
  async executeWithConsensus(
    taskId: string,
    taskDescription: string,
    taskData: any
  ): Promise<ConsensusResult> {
    console.log('🤝 ENHANCED AGENT COORDINATION: Starting A2A2 + MCP Protocol\n');
    console.log(`Task: ${taskDescription}\n`);

    const debateLog: DebateEntry[] = [];
    let currentRound = 0;
    let consensusReached = false;
    
    // Phase 1: PROPOSAL - Each agent proposes
    console.log('📝 Phase 1: PROPOSAL\n');
    const proposals = await this.gatherProposals(taskId, taskDescription, taskData, debateLog);
    
    // Phase 2: CHALLENGE - Agents review and challenge
    console.log('\n🔍 Phase 2: CHALLENGE\n');
    const challenges = await this.conductChallenges(proposals, debateLog);
    
    // Phase 3: RESOLUTION - Resolve contradictions
    console.log('\n⚖️ Phase 3: RESOLUTION\n');
    const resolutions = await this.resolveContradictions(proposals, challenges, debateLog);
    
    // Phase 4: CONSENSUS - Reach agreement or log dissent
    console.log('\n🎯 Phase 4: CONSENSUS\n');
    const consensusResult = await this.achieveConsensus(
      taskId,
      proposals,
      resolutions,
      debateLog
    );
    
    // Store debate history
    this.debateHistory.set(taskId, debateLog);
    
    return consensusResult;
  }

  /**
   * Phase 1: Gather proposals from all agents
   */
  private async gatherProposals(
    taskId: string,
    taskDescription: string,
    taskData: any,
    debateLog: DebateEntry[]
  ): Promise<AgentProposal[]> {
    const proposals: AgentProposal[] = [];
    
    for (const [agentId, agentInfo] of this.agents) {
      // Generate proposal based on agent specialty
      const proposal = await this.generateAgentProposal(
        agentId,
        agentInfo,
        taskDescription,
        taskData
      );
      
      proposals.push(proposal);
      
      // Log the proposal
      debateLog.push({
        timestamp: new Date(),
        phase: 'proposal',
        agentId: agentId,
        action: 'proposed',
        content: proposal.proposal
      });
      
      console.log(`${agentInfo.name}: "${proposal.proposal}" (confidence: ${(proposal.confidence * 100).toFixed(0)}%)`);
    }
    
    return proposals;
  }

  /**
   * Generate proposal for specific agent
   */
  private async generateAgentProposal(
    agentId: string,
    agentInfo: AgentInfo,
    taskDescription: string,
    taskData: any
  ): Promise<AgentProposal> {
    // Simulate agent-specific analysis
    let proposal: string;
    let evidence: any[] = [];
    let confidence: number;
    
    switch (agentInfo.specialty) {
      case 'financial-analysis':
        if (taskData.expenseIncrease > 10000) {
          proposal = 'Significant expense increase detected. Recommend immediate cost reduction measures.';
          evidence = [
            { fact: 'Expense increase > $10,000', value: true, confidence: 0.95 },
            { fact: 'Revenue growth flat', value: taskData.revenueGrowth === 0, confidence: 0.90 }
          ];
          confidence = 0.92;
        } else {
          proposal = 'Financial metrics within acceptable range. Continue monitoring.';
          evidence = [{ fact: 'Expenses stable', value: true, confidence: 0.85 }];
          confidence = 0.85;
        }
        break;
        
      case 'risk-assessment':
        if (taskData.dscr < 1.2 || taskData.liquidityDays < 60) {
          proposal = 'High risk detected. Property at risk of covenant breach.';
          evidence = [
            { fact: 'DSCR below threshold', value: taskData.dscr < 1.2, confidence: 0.93 },
            { fact: 'Low liquidity', value: taskData.liquidityDays < 60, confidence: 0.91 }
          ];
          confidence = 0.94;
        } else {
          proposal = 'Risk levels acceptable. No immediate action required.';
          evidence = [{ fact: 'Risk metrics normal', value: true, confidence: 0.80 }];
          confidence = 0.80;
        }
        break;
        
      case 'compliance':
        if (taskData.dscr < 1.2) {
          proposal = 'Debt service coverage ratio below covenant requirement. Notify lender immediately.';
          evidence = [
            { fact: 'DSCR covenant breach', value: true, confidence: 0.98 },
            { fact: 'Lender notification required', value: true, confidence: 0.95 }
          ];
          confidence = 0.96;
        } else {
          proposal = 'All covenants currently in compliance.';
          evidence = [{ fact: 'Covenants satisfied', value: true, confidence: 0.90 }];
          confidence = 0.90;
        }
        break;
        
      default:
        proposal = `Analysis complete for ${taskDescription}`;
        evidence = [{ fact: 'Task analyzed', value: true, confidence: 0.75 }];
        confidence = 0.75;
    }
    
    // Validate with logic engine if enabled
    let logicValidation: ValidationResult | undefined;
    if (this.config.enableLogicValidation) {
      const propositions: LogicalProposition[] = evidence.map((e, idx) => ({
        id: `${agentId}_prop_${idx}`,
        statement: e.fact,
        value: e.value,
        source: agentInfo.name,
        confidence: e.confidence
      }));
      
      const conclusion: LogicalProposition = {
        id: `${agentId}_conclusion`,
        statement: proposal,
        value: true,
        source: agentInfo.name,
        confidence: confidence
      };
      
      logicValidation = logicEngine.validate(conclusion, propositions, agentInfo.name);
    }
    
    return {
      agentId,
      agentName: agentInfo.name,
      proposal,
      evidence,
      confidence,
      timestamp: new Date(),
      logicValidation
    };
  }

  /**
   * Phase 2: Conduct challenges between agents
   */
  private async conductChallenges(
    proposals: AgentProposal[],
    debateLog: DebateEntry[]
  ): Promise<AgentChallenge[]> {
    const challenges: AgentChallenge[] = [];
    
    // Each agent reviews other proposals
    for (const challenger of proposals) {
      for (const target of proposals) {
        if (challenger.agentId === target.agentId) continue;
        
        // Check for contradictions or disagreements
        const challenge = this.evaluateForChallenge(challenger, target);
        
        if (challenge) {
          challenges.push(challenge);
          
          debateLog.push({
            timestamp: new Date(),
            phase: 'challenge',
            agentId: challenger.agentId,
            action: 'challenged',
            content: `Challenged ${target.agentName}: ${challenge.challenge}`
          });
          
          console.log(`${challenger.agentName} → ${target.agentName}: "${challenge.challenge}"`);
        }
      }
    }
    
    return challenges;
  }

  /**
   * Evaluate if one proposal should challenge another
   */
  private evaluateForChallenge(
    challenger: AgentProposal,
    target: AgentProposal
  ): AgentChallenge | null {
    // Check for logical contradictions
    if (this.areProposalsContradictory(challenger, target)) {
      return {
        challengerId: challenger.agentId,
        challengerName: challenger.agentName,
        targetProposalId: target.agentId,
        challengeType: 'logic',
        challenge: 'Your conclusion contradicts my analysis',
        alternativeProposal: challenger.proposal,
        supportingEvidence: challenger.evidence
      };
    }
    
    // Check confidence disparity
    if (Math.abs(challenger.confidence - target.confidence) > 0.3) {
      return {
        challengerId: challenger.agentId,
        challengerName: challenger.agentName,
        targetProposalId: target.agentId,
        challengeType: 'evidence',
        challenge: 'Confidence levels suggest different conclusions',
        alternativeProposal: challenger.proposal
      };
    }
    
    // Check for methodology differences
    if (challenger.logicValidation?.valid && !target.logicValidation?.valid) {
      return {
        challengerId: challenger.agentId,
        challengerName: challenger.agentName,
        targetProposalId: target.agentId,
        challengeType: 'methodology',
        challenge: 'Your proposal fails logic validation',
        supportingEvidence: [challenger.logicValidation]
      };
    }
    
    return null;
  }

  /**
   * Check if two proposals are contradictory
   */
  private areProposalsContradictory(prop1: AgentProposal, prop2: AgentProposal): boolean {
    // Simple contradiction detection
    if (prop1.proposal.includes('immediate') && prop2.proposal.includes('no action')) {
      return true;
    }
    if (prop1.proposal.includes('high risk') && prop2.proposal.includes('acceptable')) {
      return true;
    }
    if (prop1.proposal.includes('breach') && prop2.proposal.includes('compliance')) {
      return true;
    }
    
    return false;
  }

  /**
   * Phase 3: Resolve contradictions through logic
   */
  private async resolveContradictions(
    proposals: AgentProposal[],
    challenges: AgentChallenge[],
    debateLog: DebateEntry[]
  ): Promise<Map<string, ResolutionResult>> {
    const resolutions = new Map<string, ResolutionResult>();
    
    // Group challenges by target
    const challengesByTarget = new Map<string, AgentChallenge[]>();
    challenges.forEach(challenge => {
      const existing = challengesByTarget.get(challenge.targetProposalId) || [];
      existing.push(challenge);
      challengesByTarget.set(challenge.targetProposalId, existing);
    });
    
    // Resolve each set of challenges
    for (const [targetId, targetChallenges] of challengesByTarget) {
      const targetProposal = proposals.find(p => p.agentId === targetId);
      if (!targetProposal) continue;
      
      // Apply resolution logic
      const resolution = this.applyResolutionLogic(targetProposal, targetChallenges);
      resolutions.set(targetId, resolution);
      
      debateLog.push({
        timestamp: new Date(),
        phase: 'resolution',
        agentId: targetId,
        action: 'resolved',
        content: resolution.outcome
      });
      
      console.log(`Resolution for ${targetProposal.agentName}: ${resolution.outcome}`);
    }
    
    return resolutions;
  }

  /**
   * Apply resolution logic to challenges
   */
  private applyResolutionLogic(
    proposal: AgentProposal,
    challenges: AgentChallenge[]
  ): ResolutionResult {
    // Count challenge types
    const challengeTypes = challenges.reduce((acc, c) => {
      acc[c.challengeType] = (acc[c.challengeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // If multiple logic challenges, proposal likely invalid
    if (challengeTypes['logic'] >= 2) {
      return {
        proposalId: proposal.agentId,
        valid: false,
        adjustedConfidence: proposal.confidence * 0.5,
        outcome: 'Proposal invalidated due to logical contradictions'
      };
    }
    
    // If methodology challenged and not validated
    if (challengeTypes['methodology'] && !proposal.logicValidation?.valid) {
      return {
        proposalId: proposal.agentId,
        valid: false,
        adjustedConfidence: proposal.confidence * 0.7,
        outcome: 'Proposal weakened due to methodology concerns'
      };
    }
    
    // Otherwise, proposal stands but confidence may be adjusted
    const confidenceAdjustment = 1 - (challenges.length * 0.1);
    return {
      proposalId: proposal.agentId,
      valid: true,
      adjustedConfidence: proposal.confidence * Math.max(0.5, confidenceAdjustment),
      outcome: 'Proposal stands with adjusted confidence'
    };
  }

  /**
   * Phase 4: Achieve consensus or record dissent
   */
  private async achieveConsensus(
    taskId: string,
    proposals: AgentProposal[],
    resolutions: Map<string, ResolutionResult>,
    debateLog: DebateEntry[]
  ): Promise<ConsensusResult> {
    // Apply resolutions to proposals
    const adjustedProposals = proposals.map(p => {
      const resolution = resolutions.get(p.agentId);
      if (resolution) {
        return {
          ...p,
          confidence: resolution.adjustedConfidence,
          valid: resolution.valid
        };
      }
      return { ...p, valid: true };
    });
    
    // Filter valid proposals
    const validProposals = adjustedProposals.filter(p => p.valid);
    
    if (validProposals.length === 0) {
      // No valid proposals - consensus failed
      return {
        taskId,
        achieved: false,
        method: 'failed',
        finalProposal: 'No valid proposals after debate',
        supportingAgents: [],
        dissentingAgents: proposals.map(p => p.agentId),
        confidence: 0,
        debateLog,
        logicTrace: [],
        dissentRecord: proposals.map(p => ({
          agentId: p.agentId,
          agentName: p.agentName,
          reason: 'Proposal invalidated during debate',
          alternativeConclusion: p.proposal,
          confidence: p.confidence
        }))
      };
    }
    
    // Calculate weighted votes
    const voteResults = this.calculateWeightedVotes(validProposals);
    
    // Determine winning proposal
    const winner = voteResults[0];
    const supportPercentage = winner.totalWeight / this.getTotalAgentWeight();
    
    // Check if consensus threshold met
    const consensusAchieved = supportPercentage >= this.config.consensusThreshold;
    
    // Identify supporting and dissenting agents
    const supportingAgents = validProposals
      .filter(p => this.proposalsAreSimilar(p, winner.proposal))
      .map(p => p.agentId);
    
    const dissentingAgents = validProposals
      .filter(p => !this.proposalsAreSimilar(p, winner.proposal))
      .map(p => p.agentId);
    
    // Create dissent records
    const dissentRecord = dissentingAgents.map(agentId => {
      const agent = validProposals.find(p => p.agentId === agentId)!;
      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        reason: 'Alternative conclusion reached',
        alternativeConclusion: agent.proposal,
        confidence: agent.confidence
      };
    });
    
    // Log consensus result
    debateLog.push({
      timestamp: new Date(),
      phase: 'consensus',
      agentId: 'system',
      action: consensusAchieved ? 'consensus-reached' : 'consensus-failed',
      content: `Final: "${winner.proposal.proposal}" (${(supportPercentage * 100).toFixed(0)}% support)`
    });
    
    return {
      taskId,
      achieved: consensusAchieved,
      method: this.determineConsensusMethod(supportingAgents.length, proposals.length),
      finalProposal: winner.proposal.proposal,
      supportingAgents,
      dissentingAgents,
      confidence: winner.proposal.confidence,
      debateLog,
      logicTrace: validProposals.map(p => p.logicValidation).filter(v => v) as ValidationResult[],
      dissentRecord: dissentRecord.length > 0 ? dissentRecord : undefined
    };
  }

  /**
   * Calculate weighted votes for proposals
   */
  private calculateWeightedVotes(proposals: AgentProposal[]): Array<{
    proposal: AgentProposal;
    totalWeight: number;
  }> {
    // Group similar proposals
    const groups: Array<{
      representative: AgentProposal;
      supporters: AgentProposal[];
      totalWeight: number;
    }> = [];
    
    proposals.forEach(proposal => {
      // Find existing group
      let foundGroup = false;
      for (const group of groups) {
        if (this.proposalsAreSimilar(proposal, group.representative)) {
          group.supporters.push(proposal);
          group.totalWeight += this.getAgentWeight(proposal.agentId) * proposal.confidence;
          foundGroup = true;
          break;
        }
      }
      
      // Create new group if not found
      if (!foundGroup) {
        groups.push({
          representative: proposal,
          supporters: [proposal],
          totalWeight: this.getAgentWeight(proposal.agentId) * proposal.confidence
        });
      }
    });
    
    // Sort by total weight
    groups.sort((a, b) => b.totalWeight - a.totalWeight);
    
    return groups.map(g => ({
      proposal: g.representative,
      totalWeight: g.totalWeight
    }));
  }

  /**
   * Check if two proposals are similar
   */
  private proposalsAreSimilar(p1: AgentProposal, p2: AgentProposal): boolean {
    // Simple similarity check - in real implementation would use NLP
    const keywords1 = this.extractKeywords(p1.proposal);
    const keywords2 = this.extractKeywords(p2.proposal);
    
    const overlap = keywords1.filter(k => keywords2.includes(k)).length;
    const similarity = overlap / Math.max(keywords1.length, keywords2.length);
    
    return similarity > 0.6;
  }

  /**
   * Extract keywords from proposal
   */
  private extractKeywords(text: string): string[] {
    const stopWords = ['the', 'is', 'at', 'and', 'or', 'for', 'to', 'a', 'an'];
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
  }

  /**
   * Get agent weight for voting
   */
  private getAgentWeight(agentId: string): number {
    return this.config.agentWeights?.get(agentId) || 1.0;
  }

  /**
   * Get total weight of all agents
   */
  private getTotalAgentWeight(): number {
    let total = 0;
    this.config.agentWeights?.forEach(weight => total += weight);
    return total || this.agents.size;
  }

  /**
   * Determine consensus method
   */
  private determineConsensusMethod(
    supporting: number,
    total: number
  ): 'unanimous' | 'majority' | 'weighted' | 'failed' {
    if (supporting === total) return 'unanimous';
    if (supporting > total / 2) return 'majority';
    if (supporting >= this.config.minAgentsForConsensus) return 'weighted';
    return 'failed';
  }

  /**
   * Get debate history for a task
   */
  getDebateHistory(taskId: string): DebateEntry[] | undefined {
    return this.debateHistory.get(taskId);
  }
}

// Supporting interfaces
interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  weight: number;
  status: 'active' | 'inactive';
}

interface ResolutionResult {
  proposalId: string;
  valid: boolean;
  adjustedConfidence: number;
  outcome: string;
}

// Export singleton instance
export const agentCoordinator = new EnhancedAgentCoordination();
