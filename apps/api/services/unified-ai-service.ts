/**
 * Unified AI Service - Orchestrates all AI providers
 * Replaces mock-ai-service with real AI API calls
 */

import { ParsedDocument } from '../document-parser';
import { ClaudeFinanceService } from './ai-providers/claude-service';
import { GeminiTenantService } from './ai-providers/gemini-service';
import { OpenAIRiskService } from './ai-providers/openai-service';
import { DeepSeekComplianceService } from './ai-providers/deepseek-service';
import { MistralMaintenanceService } from './ai-providers/mistral-service';

export interface UnifiedAIAnalysisResult {
  agentId: string;
  agentName: string;
  analysis: string;
  insights: any[];
  recommendations: string[];
  confidence: number;
  evidence: any[];
  reasoning?: string[];
  metadata?: Record<string, any>;
}

export type AgentType = 'financial' | 'tenant' | 'risk' | 'compliance' | 'maintenance';

/**
 * Unified AI Service - Routes to appropriate AI provider
 */
export class UnifiedAIService {
  private static readonly USE_MOCK = process.env.USE_MOCK_AI === 'true';

  /**
   * Analyze document with appropriate AI agent
   */
  static async analyzeDocument(
    parsedDoc: ParsedDocument,
    agentType: AgentType
  ): Promise<UnifiedAIAnalysisResult> {
    
    // Check if we should use mock responses (for demos/testing)
    if (this.USE_MOCK) {
      const { MockAIService } = await import('../mock-ai-service');
      const mockService = new MockAIService();
      return mockService.analyzeDocument(parsedDoc, agentType);
    }

    // Route to appropriate AI service based on agent type
    switch (agentType) {
      case 'financial':
        return this.analyzeWithClaude(parsedDoc);
      
      case 'tenant':
        return this.analyzeWithGemini(parsedDoc);
      
      case 'risk':
        return this.analyzeWithOpenAI(parsedDoc);
      
      case 'compliance':
        return this.analyzeWithDeepSeek(parsedDoc);
      
      case 'maintenance':
        return this.analyzeWithMistral(parsedDoc);
      
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  /**
   * Financial analysis with Claude (FinanceBot)
   */
  private static async analyzeWithClaude(parsedDoc: ParsedDocument): Promise<UnifiedAIAnalysisResult> {
    try {
      const claudeResponse = await ClaudeFinanceService.analyzeDocument({
        documentContent: parsedDoc.extractedText,
        documentType: this.mapDocumentType(parsedDoc.type, 'financial'),
        analysisType: 'general',
        context: {
          companyId: parsedDoc.metadata?.companyId || 'default'
        }
      });

      return {
        agentId: claudeResponse.agentId,
        agentName: claudeResponse.agentName,
        analysis: claudeResponse.analysis,
        insights: claudeResponse.insights,
        recommendations: claudeResponse.recommendations,
        confidence: claudeResponse.confidence,
        evidence: claudeResponse.evidence,
        reasoning: claudeResponse.reasoning,
        metadata: {
          financialMetrics: claudeResponse.financialMetrics,
          riskFactors: claudeResponse.riskFactors
        }
      };
    } catch (error) {
      console.error('Claude analysis failed:', error);
      return this.getFallbackResponse('financial', error);
    }
  }

  /**
   * Tenant analysis with Gemini (TenantBot)
   */
  private static async analyzeWithGemini(parsedDoc: ParsedDocument): Promise<UnifiedAIAnalysisResult> {
    try {
      const geminiResponse = await GeminiTenantService.analyzeDocument({
        documentContent: parsedDoc.extractedText,
        documentType: this.mapDocumentType(parsedDoc.type, 'tenant'),
        analysisType: 'general',
        context: {
          companyId: parsedDoc.metadata?.companyId || 'default'
        }
      });

      return {
        agentId: geminiResponse.agentId,
        agentName: geminiResponse.agentName,
        analysis: geminiResponse.analysis,
        insights: geminiResponse.tenantInsights,
        recommendations: geminiResponse.recommendations,
        confidence: geminiResponse.confidence,
        evidence: geminiResponse.evidence,
        reasoning: geminiResponse.reasoning,
        metadata: {
          communicationAnalysis: geminiResponse.communicationAnalysis,
          sentimentScores: geminiResponse.sentimentScores
        }
      };
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return this.getFallbackResponse('tenant', error);
    }
  }

  /**
   * Risk analysis with OpenAI (RiskBot)
   */
  private static async analyzeWithOpenAI(parsedDoc: ParsedDocument): Promise<UnifiedAIAnalysisResult> {
    try {
      const openAIResponse = await OpenAIRiskService.analyzeDocument({
        documentContent: parsedDoc.extractedText,
        documentType: this.mapDocumentType(parsedDoc.type, 'risk'),
        analysisType: 'comprehensive',
        context: {
          companyId: parsedDoc.metadata?.companyId || 'default'
        }
      });

      return {
        agentId: openAIResponse.agentId,
        agentName: openAIResponse.agentName,
        analysis: openAIResponse.analysis,
        insights: openAIResponse.risks,
        recommendations: openAIResponse.recommendations,
        confidence: openAIResponse.confidence,
        evidence: openAIResponse.evidence,
        reasoning: openAIResponse.reasoning,
        metadata: {
          riskMatrix: openAIResponse.riskMatrix,
          mitigationStrategies: openAIResponse.mitigationStrategies
        }
      };
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      return this.getFallbackResponse('risk', error);
    }
  }

  /**
   * Compliance analysis with DeepSeek (ComplianceBot)
   */
  private static async analyzeWithDeepSeek(parsedDoc: ParsedDocument): Promise<UnifiedAIAnalysisResult> {
    try {
      const deepSeekResponse = await DeepSeekComplianceService.analyzeDocument({
        documentContent: parsedDoc.extractedText,
        documentType: this.mapDocumentType(parsedDoc.type, 'compliance'),
        analysisType: 'compliance_check',
        context: {
          companyId: parsedDoc.metadata?.companyId || 'default',
          jurisdiction: parsedDoc.metadata?.jurisdiction
        }
      });

      return {
        agentId: deepSeekResponse.agentId,
        agentName: deepSeekResponse.agentName,
        analysis: deepSeekResponse.analysis,
        insights: deepSeekResponse.complianceIssues,
        recommendations: deepSeekResponse.recommendations,
        confidence: deepSeekResponse.confidence,
        evidence: deepSeekResponse.evidence,
        reasoning: deepSeekResponse.reasoning,
        metadata: {
          regulatoryReferences: deepSeekResponse.regulatoryReferences
        }
      };
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
      return this.getFallbackResponse('compliance', error);
    }
  }

  /**
   * Maintenance analysis with Mistral (MaintenanceBot)
   */
  private static async analyzeWithMistral(parsedDoc: ParsedDocument): Promise<UnifiedAIAnalysisResult> {
    try {
      const mistralResponse = await MistralMaintenanceService.analyzeDocument({
        documentContent: parsedDoc.extractedText,
        documentType: this.mapDocumentType(parsedDoc.type, 'maintenance'),
        analysisType: 'scheduling',
        context: {
          companyId: parsedDoc.metadata?.companyId || 'default',
          budget: parsedDoc.metadata?.budget
        }
      });

      return {
        agentId: mistralResponse.agentId,
        agentName: mistralResponse.agentName,
        analysis: mistralResponse.analysis,
        insights: mistralResponse.maintenanceTasks,
        recommendations: mistralResponse.recommendations,
        confidence: mistralResponse.confidence,
        evidence: mistralResponse.evidence,
        reasoning: mistralResponse.reasoning,
        metadata: {
          schedule: mistralResponse.schedule,
          costEstimate: mistralResponse.costEstimate
        }
      };
    } catch (error) {
      console.error('Mistral analysis failed:', error);
      return this.getFallbackResponse('maintenance', error);
    }
  }

  /**
   * Map generic document type to agent-specific type
   */
  private static mapDocumentType(genericType: string, agentType: string): any {
    const typeMapping: Record<string, Record<string, string>> = {
      financial: {
        'pdf': 'financial_statement',
        'excel': 'financial_statement',
        'csv': 'expense_report',
        'default': 'other'
      },
      tenant: {
        'email': 'complaint',
        'pdf': 'application',
        'default': 'communication'
      },
      risk: {
        'pdf': 'assessment_report',
        'excel': 'risk_matrix',
        'default': 'general_document'
      },
      compliance: {
        'pdf': 'lease',
        'email': 'notice',
        'default': 'policy'
      },
      maintenance: {
        'pdf': 'work_order',
        'email': 'work_order',
        'excel': 'maintenance_schedule',
        'default': 'other'
      }
    };

    return typeMapping[agentType]?.[genericType] || typeMapping[agentType]?.['default'] || 'other';
  }

  /**
   * Get fallback response when AI service fails
   */
  private static getFallbackResponse(agentType: AgentType, error: any): UnifiedAIAnalysisResult {
    const agentNames = {
      financial: 'FinanceBot',
      tenant: 'TenantBot',
      risk: 'RiskBot',
      compliance: 'ComplianceBot',
      maintenance: 'MaintenanceBot'
    };

    return {
      agentId: `${agentType}-fallback`,
      agentName: `${agentNames[agentType]} (Fallback)`,
      analysis: `Analysis temporarily unavailable. ${error?.message || 'Please try again later.'}`,
      insights: [],
      recommendations: ['Please retry the analysis or contact support if the issue persists.'],
      confidence: 0,
      evidence: [],
      reasoning: [`Service error: ${error?.message || 'Unknown error'}`],
      metadata: {
        error: true,
        errorMessage: error?.message
      }
    };
  }

  /**
   * Batch analyze multiple documents
   */
  static async batchAnalyze(
    documents: Array<{ parsedDoc: ParsedDocument; agentType: AgentType }>
  ): Promise<UnifiedAIAnalysisResult[]> {
    const results = await Promise.allSettled(
      documents.map(({ parsedDoc, agentType }) => 
        this.analyzeDocument(parsedDoc, agentType)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return this.getFallbackResponse(
          documents[index].agentType,
          result.reason
        );
      }
    });
  }

  /**
   * Get cost estimate for analysis
   */
  static estimateCost(documentSize: number, agentType: AgentType): number {
    // Rough estimates based on typical token usage
    const costPerKToken = {
      financial: 0.015,    // Claude
      tenant: 0.001,       // Gemini
      risk: 0.03,          // GPT-4
      compliance: 0.002,   // DeepSeek
      maintenance: 0.0005  // Mistral
    };

    const estimatedTokens = (documentSize / 4) * 1.5; // Rough token estimate
    const kTokens = estimatedTokens / 1000;
    
    return kTokens * costPerKToken[agentType];
  }
}

export default UnifiedAIService;