/**
 * Gemini AI Service - TenantBot Implementation
 * Google Gemini integration for tenant communications and relationship management
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface GeminiAnalysisRequest {
  documentContent: string;
  documentType: 'lease_agreement' | 'tenant_communication' | 'rental_application' | 'maintenance_request' | 'other';
  analysisType: 'tenant_risk' | 'communication_analysis' | 'lease_compliance' | 'relationship_health' | 'general';
  context?: {
    tenantHistory?: any;
    propertyInfo?: any;
    communicationHistory?: any[];
    companyId: string;
  };
}

export interface GeminiAnalysisResponse {
  agentId: 'gemini-tenant';
  agentName: 'TenantBot (Gemini)';
  analysis: string;
  insights: TenantInsight[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
  reasoning: string[];
  communicationTone: 'positive' | 'neutral' | 'negative' | 'concerning';
  riskAssessment: TenantRiskAssessment;
  actionItems: ActionItem[];
}

export interface TenantInsight {
  id: string;
  type: 'payment_risk' | 'lease_violation' | 'communication_issue' | 'maintenance_concern' | 'relationship_opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'soon' | 'planned';
  sentiment?: 'positive' | 'negative' | 'neutral';
  tenantSatisfaction?: number; // 1-10 scale
}

export interface Evidence {
  fact: string;
  source: string;
  confidence: number;
  sentiment?: string;
}

export interface TenantRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: {
    paymentHistory: number; // 0-1 scale
    communicationQuality: number;
    leaseCompliance: number;
    maintenanceIssues: number;
  };
  riskScore: number; // 0-100
  recommendations: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  assignee?: string;
  type: 'follow_up' | 'maintenance' | 'legal' | 'communication' | 'documentation';
}

/**
 * Gemini Tenant Service Class
 */
export class GeminiTenantService {
  
  /**
   * Analyze tenant-related document using Gemini
   */
  static async analyzeDocument(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent analysis
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      const prompt = this.buildTenantPrompt(request);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseGeminiResponse(text, request);

    } catch (error) {
      console.error('Gemini Tenant Service error:', error);
      throw new Error(`Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build specialized prompt for tenant analysis
   */
  private static buildTenantPrompt(request: GeminiAnalysisRequest): string {
    const { documentContent, documentType, analysisType, context } = request;

    const basePrompt = `You are TenantBot, a specialized AI agent for tenant relationship management and communication analysis. You have expertise in:
- Tenant risk assessment and screening
- Lease agreement analysis and compliance monitoring
- Communication sentiment analysis and relationship health
- Tenant satisfaction and retention strategies
- Maintenance request processing and prioritization
- Conflict resolution and tenant relations

DOCUMENT TYPE: ${documentType}
ANALYSIS TYPE: ${analysisType}

DOCUMENT CONTENT:
${documentContent}

${context?.tenantHistory ? `TENANT HISTORY: ${JSON.stringify(context.tenantHistory, null, 2)}` : ''}
${context?.communicationHistory ? `COMMUNICATION HISTORY: ${JSON.stringify(context.communicationHistory, null, 2)}` : ''}

Please provide a comprehensive tenant analysis in the following JSON format:

{
  "analysis": "Detailed tenant relationship analysis summary",
  "insights": [
    {
      "id": "unique_id",
      "type": "payment_risk|lease_violation|communication_issue|maintenance_concern|relationship_opportunity",
      "title": "Brief insight title",
      "description": "Detailed description with context",
      "impact": "high|medium|low",
      "urgency": "immediate|soon|planned",
      "sentiment": "positive|negative|neutral",
      "tenantSatisfaction": 7
    }
  ],
  "recommendations": ["Specific actionable recommendations for tenant management"],
  "confidence": 85,
  "evidence": [
    {
      "fact": "Specific finding from the document",
      "source": "Document section or communication reference",
      "confidence": 90,
      "sentiment": "Communication tone or feeling"
    }
  ],
  "reasoning": ["Step-by-step logical reasoning for tenant assessment"],
  "communicationTone": "positive|neutral|negative|concerning",
  "riskAssessment": {
    "overallRisk": "low|medium|high",
    "riskFactors": {
      "paymentHistory": 0.9,
      "communicationQuality": 0.8,
      "leaseCompliance": 0.95,
      "maintenanceIssues": 0.7
    },
    "riskScore": 25,
    "recommendations": ["Risk mitigation strategies"]
  },
  "actionItems": [
    {
      "id": "action_id",
      "title": "Action item title",
      "description": "Detailed action description",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD",
      "type": "follow_up|maintenance|legal|communication|documentation"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Analyze communication tone and sentiment accurately
2. Assess tenant satisfaction and relationship health
3. Identify potential lease violations or compliance issues
4. Evaluate payment risk and financial stability indicators
5. Provide specific, actionable tenant management recommendations
6. Generate appropriate follow-up actions with priorities
7. Consider cultural sensitivity and fair housing compliance
8. Focus on tenant retention and satisfaction improvement

Respond ONLY with valid JSON. Do not include any explanatory text outside the JSON.`;

    return basePrompt;
  }

  /**
   * Parse Gemini's JSON response
   */
  private static parseGeminiResponse(responseText: string, request: GeminiAnalysisRequest): GeminiAnalysisResponse {
    try {
      // Extract JSON from response (Gemini sometimes adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.analysis || !parsed.insights || !parsed.recommendations) {
        throw new Error('Missing required fields in Gemini response');
      }

      // Ensure insights have proper IDs
      parsed.insights = parsed.insights.map((insight: any, index: number) => ({
        id: insight.id || `gemini-insight-${Date.now()}-${index}`,
        ...insight
      }));

      // Ensure action items have proper IDs
      if (parsed.actionItems) {
        parsed.actionItems = parsed.actionItems.map((action: any, index: number) => ({
          id: action.id || `action-${Date.now()}-${index}`,
          ...action
        }));
      }

      return {
        agentId: 'gemini-tenant',
        agentName: 'TenantBot (Gemini)',
        analysis: parsed.analysis,
        insights: parsed.insights,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence || 75,
        evidence: parsed.evidence || [],
        reasoning: parsed.reasoning || [],
        communicationTone: parsed.communicationTone || 'neutral',
        riskAssessment: parsed.riskAssessment || {
          overallRisk: 'medium',
          riskFactors: {
            paymentHistory: 0.7,
            communicationQuality: 0.7,
            leaseCompliance: 0.7,
            maintenanceIssues: 0.7
          },
          riskScore: 50,
          recommendations: []
        },
        actionItems: parsed.actionItems || []
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      
      // Fallback response if parsing fails
      return {
        agentId: 'gemini-tenant',
        agentName: 'TenantBot (Gemini)',
        analysis: 'Tenant analysis completed, but response formatting encountered an issue. Please review the document manually for detailed insights.',
        insights: [{
          id: `fallback-${Date.now()}`,
          type: 'communication_issue',
          title: 'Analysis Available',
          description: 'Gemini provided analysis but formatting needs adjustment. Raw analysis available in logs.',
          impact: 'medium',
          urgency: 'soon'
        }],
        recommendations: ['Review document formatting and re-analyze if needed'],
        confidence: 60,
        evidence: [],
        reasoning: ['Response parsing encountered formatting issues'],
        communicationTone: 'neutral',
        riskAssessment: {
          overallRisk: 'medium',
          riskFactors: {
            paymentHistory: 0.5,
            communicationQuality: 0.5,
            leaseCompliance: 0.5,
            maintenanceIssues: 0.5
          },
          riskScore: 50,
          recommendations: ['Re-analyze with improved formatting']
        },
        actionItems: []
      };
    }
  }

  /**
   * Analyze communication sentiment in detail
   */
  static async analyzeCommunicationSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotionalTone: string[];
    concerns: string[];
    satisfaction: number;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Analyze the sentiment and emotional tone of this tenant communication:

"${text}"

Provide analysis in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "emotionalTone": ["frustrated", "concerned", "appreciative"],
  "concerns": ["maintenance delays", "noise issues"],
  "satisfaction": 6
}

Focus on tenant satisfaction indicators, concerns, and overall relationship health.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON in sentiment analysis response');
      
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotionalTone: ['uncertain'],
        concerns: ['analysis_error'],
        satisfaction: 5
      };
    }
  }

  /**
   * Generate tenant communication response suggestions
   */
  static async generateResponseSuggestions(
    originalMessage: string,
    context: { tenantHistory?: any; issueType?: string }
  ): Promise<{
    suggestions: {
      tone: 'professional' | 'empathetic' | 'firm';
      message: string;
      followUpActions: string[];
    }[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Generate professional response suggestions for this tenant communication:

ORIGINAL MESSAGE: "${originalMessage}"
CONTEXT: ${JSON.stringify(context)}

Provide 2-3 response options with different tones in JSON format:
{
  "suggestions": [
    {
      "tone": "professional",
      "message": "Professional response text",
      "followUpActions": ["Schedule inspection", "Update maintenance logs"]
    },
    {
      "tone": "empathetic",
      "message": "Empathetic response text",
      "followUpActions": ["Follow up in 48 hours"]
    }
  ]
}

Ensure responses are:
- Fair housing compliant
- Professional and respectful
- Action-oriented
- Appropriate for the tenant's concern`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No valid JSON in response suggestions');
      
    } catch (error) {
      console.error('Response generation error:', error);
      return {
        suggestions: [{
          tone: 'professional',
          message: 'Thank you for reaching out. We have received your message and will respond within 24 hours.',
          followUpActions: ['Review tenant request', 'Assign to appropriate team member']
        }]
      };
    }
  }

  /**
   * Calculate tenant risk score
   */
  static calculateTenantRiskScore(factors: {
    paymentHistory: number;
    communicationQuality: number;
    leaseCompliance: number;
    maintenanceIssues: number;
    creditScore?: number;
    lengthOfTenancy?: number;
  }): number {
    const weights = {
      paymentHistory: 0.4,
      communicationQuality: 0.2,
      leaseCompliance: 0.25,
      maintenanceIssues: 0.15
    };

    let riskScore = 0;
    riskScore += (1 - factors.paymentHistory) * weights.paymentHistory * 100;
    riskScore += (1 - factors.communicationQuality) * weights.communicationQuality * 100;
    riskScore += (1 - factors.leaseCompliance) * weights.leaseCompliance * 100;
    riskScore += (1 - factors.maintenanceIssues) * weights.maintenanceIssues * 100;

    // Adjust for additional factors
    if (factors.creditScore) {
      const creditRisk = Math.max(0, (700 - factors.creditScore) / 300); // Normalize around 700 score
      riskScore = riskScore * 0.9 + creditRisk * 10;
    }

    if (factors.lengthOfTenancy) {
      const tenancyBonus = Math.min(0.1, factors.lengthOfTenancy * 0.01); // 1% reduction per month, max 10%
      riskScore = riskScore * (1 - tenancyBonus);
    }

    return Math.round(Math.max(0, Math.min(100, riskScore)));
  }

  /**
   * Get token usage estimation for Gemini
   */
  static estimateTokenUsage(request: GeminiAnalysisRequest): { inputTokens: number; estimatedOutputTokens: number; estimatedCost: number } {
    // Gemini token estimation (characters / 4 for rough token count)
    const inputTokens = Math.ceil(request.documentContent.length / 4);
    const estimatedOutputTokens = 2000;
    
    // Gemini Pro pricing: $0.00025/1K input tokens, $0.0005/1K output tokens
    const inputCost = (inputTokens / 1000) * 0.00025;
    const outputCost = (estimatedOutputTokens / 1000) * 0.0005;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost
    };
  }
}

export { GeminiTenantService as default };
