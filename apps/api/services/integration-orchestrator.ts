/**
 * Integration Orchestrator - Connects all Prism Intelligence modules
 * This is the central nervous system that wires everything together
 */

import { logicEngine } from '../../logic-layer/logic-engine';
import { enhancedReinforcementLearning } from '../../reinforcement-learning/enhanced-rl-engine';
import { EnhancedAgentCoordination } from '../../agent-coordination/a2a2-protocol';
import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import { ValidatedInsight } from '../../logic-layer/agent-wrapper';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Initialize agent coordinator
const agentCoordinator = new EnhancedAgentCoordination({
  minAgentsForConsensus: 3,
  consensusThreshold: 0.7,
  enableLogicValidation: true
});

export class IntegrationOrchestrator extends EventEmitter {
  private processingTasks: Map<string, any> = new Map();

  /**
   * Main entry point for document processing
   */
  async processDocument(params: {
    taskId: string;
    file: Buffer;
    filename: string;
    userId: string;
    documentType?: string;
  }) {
    const { taskId, file, filename, userId, documentType } = params;
    
    // Emit start event
    this.emit('processing-started', { taskId, filename });
    
    try {
      // Step 1: Extract data from document
      const extractedData = await this.extractDocumentData(file, filename);
      this.emit('extraction-complete', { taskId, data: extractedData });
      
      // Step 2: Initiate multi-agent analysis
      const agentProposals = await this.runAgentAnalysis(extractedData, documentType);
      this.emit('agent-proposals', { taskId, proposals: agentProposals });
      
      // Step 3: Validate with logic engine
      const validatedInsights = await this.validateInsights(agentProposals);
      this.emit('logic-validation', { taskId, validations: validatedInsights });
      
      // Step 4: Check for contradictions and run debate if needed
      const consensusResult = await this.resolveContradictions(validatedInsights, taskId);
      this.emit('consensus-reached', { taskId, consensus: consensusResult });
      
      // Step 5: Apply reinforcement learning adaptations
      const adaptedInsights = await this.applyUserAdaptations(consensusResult.insights, userId);
      this.emit('adaptations-applied', { taskId, insights: adaptedInsights });
      
      // Step 6: Store results
      await this.storeResults(taskId, adaptedInsights, userId);
      
      // Step 7: Return final insights
      this.emit('processing-complete', { taskId, insights: adaptedInsights });
      return adaptedInsights;
      
    } catch (error) {
      this.emit('processing-error', { taskId, error });
      throw error;
    }
  }

  /**
   * Extract data from document using AI
   */
  private async extractDocumentData(file: Buffer, filename: string) {
    // Use real document parser
    const { documentParser } = await import('./document-parser');
    const parsedDoc = await documentParser.parseDocument(file, filename);
    
    return {
      documentType: parsedDoc.type,
      extractedText: parsedDoc.extractedText,
      structuredData: parsedDoc.structuredData,
      metadata: {
        ...parsedDoc.metadata,
        property: this.detectProperty(parsedDoc.extractedText),
        period: this.detectPeriod(parsedDoc.extractedText)
      },
      tables: parsedDoc.tables
    };
  }

  /**
   * Run multi-agent analysis
   */
  private async runAgentAnalysis(extractedData: any, documentType?: string) {
    const agents = this.selectAgentsForDocument(documentType || extractedData.documentType);
    const UnifiedAIService = (await import('./unified-ai-service')).default;
    
    // Generate AI analysis for each agent
    const proposals = await Promise.all(
      agents.map(async agentId => {
        const agentType = this.getAgentType(agentId);
        const analysis = await UnifiedAIService.analyzeDocument(
          {
            type: extractedData.documentType,
            format: 'pdf', // Default for demo
            extractedText: extractedData.extractedText,
            structuredData: extractedData.structuredData,
            metadata: extractedData.metadata,
            tables: extractedData.tables
          },
          agentType
        );
        
        return {
          agentId: analysis.agentId,
          agentName: analysis.agentName,
          proposal: analysis.analysis,
          evidence: analysis.evidence,
          confidence: analysis.confidence,
          timestamp: new Date(),
          insights: analysis.insights
        };
      })
    );
    
    return proposals;
  }

  /**
   * Validate insights using logic engine
   */
  private async validateInsights(proposals: any[]) {
    return Promise.all(proposals.map(async proposal => {
      const validation = logicEngine.validate(
        {
          id: proposal.agentId,
          statement: proposal.proposal,
          value: true,
          source: proposal.agentName,
          confidence: proposal.confidence
        },
        proposal.evidence.map((e: any) => ({
          id: e.fact,
          statement: `${e.fact} = ${e.value}`,
          value: true,
          confidence: e.confidence
        })),
        proposal.agentName
      );
      
      return {
        ...proposal,
        validation,
        isValid: validation.valid
      };
    }));
  }

  /**
   * Resolve contradictions through agent debate
   */
  private async resolveContradictions(validatedInsights: any[], taskId: string) {
    const contradictions = this.findContradictions(validatedInsights);
    
    if (contradictions.length > 0) {
      // Initiate agent debate
      const debateResult = await agentCoordinator.initiateConsensusTask({
        taskId,
        taskType: 'resolve_contradictions',
        initialData: validatedInsights,
        requiredAgents: validatedInsights.map(i => i.agentId)
      });
      
      return {
        hadDebate: true,
        debateLog: debateResult.debateLog,
        insights: this.synthesizeInsights(debateResult.finalProposal, validatedInsights)
      };
    }
    
    return {
      hadDebate: false,
      insights: this.synthesizeInsights(null, validatedInsights)
    };
  }

  /**
   * Apply user-specific adaptations
   */
  private async applyUserAdaptations(insights: ValidatedInsight[], userId: string) {
    return insights.map(insight => {
      const adapted = enhancedReinforcementLearning.applyAdaptivePreferences(
        insight,
        userId,
        new Date()
      );
      
      // Add UI-friendly properties
      return {
        ...adapted,
        displayPriority: this.calculateDisplayPriority(adapted),
        formattedMessage: this.formatInsightMessage(adapted),
        actions: this.generateActions(adapted)
      };
    });
  }

  /**
   * Store results in database
   */
  private async storeResults(taskId: string, insights: any[], userId: string) {
    const { error } = await supabase
      .from('insights')
      .insert(
        insights.map(insight => ({
          task_id: taskId,
          user_id: userId,
          agent_id: insight.agentId,
          content: insight.content,
          confidence: insight.confidence,
          validation_result: insight.validation,
          created_at: new Date()
        }))
      );
    
    if (error) {
      console.error('Failed to store insights:', error);
    }
  }

  /**
   * Helper methods
   */
  private detectDocumentType(filename: string): string {
    if (filename.includes('financial') || filename.includes('p&l')) return 'financial';
    if (filename.includes('lease')) return 'lease';
    if (filename.includes('maintenance')) return 'maintenance';
    return 'general';
  }

  private selectAgentsForDocument(documentType: string): string[] {
    const agentMap: Record<string, string[]> = {
      financial: ['FinanceBot', 'RiskFlaggerAgent', 'ComplianceAgent'],
      lease: ['TenantBot', 'LegalAgent', 'FinanceBot'],
      maintenance: ['MaintenanceBot', 'FinanceBot', 'SafetyAgent'],
      general: ['FinanceBot', 'TenantBot', 'MaintenanceBot']
    };
    
    return agentMap[documentType] || agentMap.general;
  }

  private findContradictions(insights: any[]): any[] {
    const contradictions = [];
    
    for (let i = 0; i < insights.length; i++) {
      for (let j = i + 1; j < insights.length; j++) {
        if (insights[i].validation?.contradictions?.length > 0) {
          contradictions.push({
            agent1: insights[i].agentId,
            agent2: insights[j].agentId,
            issue: insights[i].validation.contradictions[0]
          });
        }
      }
    }
    
    return contradictions;
  }

  private synthesizeInsights(consensusProposal: any, originalInsights: any[]): ValidatedInsight[] {
    // If we have consensus, use that
    if (consensusProposal) {
      return [{
        id: `insight-${Date.now()}`,
        content: consensusProposal,
        confidence: 0.9,
        source: 'Multi-Agent Consensus',
        category: 'synthesized',
        timestamp: new Date(),
        agentId: 'SynthesisAgent',
        validation: { valid: true, confidence: 0.9, explanation: 'Consensus reached' }
      }];
    }
    
    // Otherwise, return all valid insights
    return originalInsights
      .filter(i => i.isValid)
      .map(i => ({
        id: `insight-${Date.now()}-${i.agentId}`,
        content: i.proposal,
        confidence: i.confidence,
        source: i.agentName,
        category: this.categorizeInsight(i.proposal),
        timestamp: new Date(),
        agentId: i.agentId,
        validation: i.validation
      }));
  }

  private categorizeInsight(proposal: string): string {
    if (proposal.toLowerCase().includes('revenue') || proposal.toLowerCase().includes('expense')) {
      return 'financial';
    }
    if (proposal.toLowerCase().includes('maintenance') || proposal.toLowerCase().includes('repair')) {
      return 'maintenance';
    }
    if (proposal.toLowerCase().includes('tenant') || proposal.toLowerCase().includes('lease')) {
      return 'tenant';
    }
    return 'general';
  }

  private calculateDisplayPriority(insight: any): number {
    let priority = insight.confidence * 100;
    
    // Boost priority for certain categories
    if (insight.category === 'financial') priority *= 1.2;
    if (insight.validation?.contradictions?.length > 0) priority *= 0.8;
    
    return Math.min(100, priority);
  }

  private formatInsightMessage(insight: any): string {
    const prefix = insight.agentId === 'SynthesisAgent' ? '🤝 Consensus: ' : '💡 ';
    return `${prefix}${insight.content}`;
  }

  private generateActions(insight: any): Array<{label: string, action: string}> {
    const actions = [];
    
    if (insight.category === 'financial') {
      actions.push({ label: 'View Details', action: 'view_financial_details' });
      actions.push({ label: 'Create Task', action: 'create_financial_task' });
    }
    
    if (insight.validation?.contradictions?.length > 0) {
      actions.push({ label: 'View Debate', action: 'view_agent_debate' });
    }
    
    actions.push({ label: 'Dismiss', action: 'dismiss_insight' });
    
    return actions;
  }

  // New helper methods for enhanced functionality
  private detectProperty(text: string): string {
    // Look for property names in text
    const propertyPatterns = [
      /property:\s*([^,\n]+)/i,
      /building\s+([A-Z][^,\n]+)/i,
      /for\s+([^,\n]+(?:apartments|properties|building))/i
    ];
    
    for (const pattern of propertyPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Main Property';
  }

  private detectPeriod(text: string): string {
    // Look for time periods
    const periodPatterns = [
      /(Q[1-4]\s+20\d{2})/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+20\d{2}/i,
      /(20\d{2})\s*-\s*(20\d{2})/i
    ];
    
    for (const pattern of periodPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private getAgentType(agentId: string): 'financial' | 'risk' | 'compliance' | 'tenant' | 'maintenance' {
    const agentTypeMap: Record<string, any> = {
      'FinanceBot': 'financial',
      'RiskFlaggerAgent': 'risk',
      'ComplianceAgent': 'compliance',
      'TenantBot': 'tenant',
      'MaintenanceBot': 'maintenance'
    };
    
    return agentTypeMap[agentId] || 'financial';
  }
}

// Export singleton instance
export const integrationOrchestrator = new IntegrationOrchestrator();
