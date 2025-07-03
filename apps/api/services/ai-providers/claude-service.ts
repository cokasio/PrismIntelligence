/**
 * Claude AI Service - FinanceBot Implementation
 * Anthropic Claude integration for financial analysis and reasoning
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ClaudeAnalysisRequest {
  documentContent: string;
  documentType: 'financial_statement' | 'lease_agreement' | 'expense_report' | 'budget' | 'other';
  analysisType: 'covenant_analysis' | 'risk_assessment' | 'cash_flow' | 'variance_analysis' | 'general';
  context?: {
    propertyInfo?: any;
    previousAnalyses?: any[];
    companyId: string;
  };
}

export interface ClaudeAnalysisResponse {
  agentId: 'claude-finance';
  agentName: 'FinanceBot (Claude)';
  analysis: string;
  insights: FinancialInsight[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
  reasoning: string[];
  riskFactors: RiskFactor[];
  financialMetrics?: FinancialMetrics;
}

export interface FinancialInsight {
  id: string;
  type: 'covenant_breach' | 'cash_flow_issue' | 'expense_anomaly' | 'revenue_opportunity' | 'compliance_risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'soon' | 'planned';
  financialImpact?: {
    amount: number;
    currency: string;
    timeframe: string;
  };
  metrics?: Record<string, any>;
}

export interface Evidence {
  fact: string;
  source: string;
  confidence: number;
  calculation?: string;
}

export interface RiskFactor {
  category: string;
  description: string;
  probability: number;
  impact: number;
  mitigation?: string;
}

export interface FinancialMetrics {
  dscr?: number; // Debt Service Coverage Ratio
  ltv?: number;  // Loan to Value
  noi?: number;  // Net Operating Income
  capRate?: number; // Capitalization Rate
  cashFlow?: number;
  occupancyRate?: number;
  [key: string]: number | undefined;
}

/**
 * Claude Finance Service Class
 */
export class ClaudeFinanceService {
  
  /**
   * Analyze financial document using Claude
   */
  static async analyzeDocument(request: ClaudeAnalysisRequest): Promise<ClaudeAnalysisResponse> {
    try {
      const prompt = this.buildFinancialPrompt(request);
      
      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent financial analysis
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0];
      if (response.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseClaudeResponse(response.text, request);

    } catch (error) {
      console.error('Claude Finance Service error:', error);
      throw new Error(`Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build specialized prompt for financial analysis
   */
  private static buildFinancialPrompt(request: ClaudeAnalysisRequest): string {
    const { documentContent, documentType, analysisType, context } = request;

    const basePrompt = `You are FinanceBot, a specialized AI agent for property management financial analysis. You have deep expertise in:
- Real estate financial analysis and underwriting
- Property management accounting and reporting
- Lease covenant monitoring and compliance
- Cash flow analysis and forecasting
- Risk assessment and mitigation strategies

DOCUMENT TYPE: ${documentType}
ANALYSIS TYPE: ${analysisType}

DOCUMENT CONTENT:
${documentContent}

${context?.propertyInfo ? `PROPERTY CONTEXT: ${JSON.stringify(context.propertyInfo, null, 2)}` : ''}

Please provide a comprehensive financial analysis in the following JSON format:

{
  "analysis": "Detailed financial analysis summary",
  "insights": [
    {
      "id": "unique_id",
      "type": "covenant_breach|cash_flow_issue|expense_anomaly|revenue_opportunity|compliance_risk",
      "title": "Brief insight title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "urgency": "immediate|soon|planned",
      "financialImpact": {
        "amount": 0,
        "currency": "USD",
        "timeframe": "monthly|quarterly|annually"
      },
      "metrics": {}
    }
  ],
  "recommendations": ["Specific actionable recommendations"],
  "confidence": 85,
  "evidence": [
    {
      "fact": "Specific factual finding",
      "source": "Document section or line reference",
      "confidence": 90,
      "calculation": "Mathematical calculation if applicable"
    }
  ],
  "reasoning": ["Step-by-step logical reasoning"],
  "riskFactors": [
    {
      "category": "Risk category",
      "description": "Risk description",
      "probability": 0.7,
      "impact": 0.8,
      "mitigation": "Mitigation strategy"
    }
  ],
  "financialMetrics": {
    "dscr": 1.25,
    "ltv": 0.75,
    "noi": 150000,
    "capRate": 0.065,
    "cashFlow": 25000,
    "occupancyRate": 0.95
  }
}

CRITICAL REQUIREMENTS:
1. Focus on mathematical accuracy and precise calculations
2. Identify potential covenant breaches or compliance issues
3. Highlight cash flow impacts and timing
4. Provide specific, actionable recommendations
5. Show confidence levels based on data quality
6. Reference specific document sections for evidence
7. Calculate key financial metrics when possible
8. Assess both immediate and long-term financial impacts

Respond ONLY with valid JSON. Do not include any explanatory text outside the JSON.`;

    return basePrompt;
  }

  /**
   * Parse Claude's JSON response
   */
  private static parseClaudeResponse(responseText: string, request: ClaudeAnalysisRequest): ClaudeAnalysisResponse {
    try {
      // Extract JSON from response (Claude sometimes adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.analysis || !parsed.insights || !parsed.recommendations) {
        throw new Error('Missing required fields in Claude response');
      }

      // Ensure insights have proper IDs
      parsed.insights = parsed.insights.map((insight: any, index: number) => ({
        id: insight.id || `claude-insight-${Date.now()}-${index}`,
        ...insight
      }));

      return {
        agentId: 'claude-finance',
        agentName: 'FinanceBot (Claude)',
        analysis: parsed.analysis,
        insights: parsed.insights,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence || 75,
        evidence: parsed.evidence || [],
        reasoning: parsed.reasoning || [],
        riskFactors: parsed.riskFactors || [],
        financialMetrics: parsed.financialMetrics || {}
      };

    } catch (error) {
      console.error('Error parsing Claude response:', error);
      
      // Fallback response if parsing fails
      return {
        agentId: 'claude-finance',
        agentName: 'FinanceBot (Claude)',
        analysis: 'Financial analysis completed, but response formatting encountered an issue. Please review the document manually for detailed insights.',
        insights: [{
          id: `fallback-${Date.now()}`,
          type: 'general' as any,
          title: 'Analysis Available',
          description: 'Claude provided analysis but formatting needs adjustment. Raw analysis available in logs.',
          impact: 'medium',
          urgency: 'soon'
        }],
        recommendations: ['Review document formatting and re-analyze if needed'],
        confidence: 60,
        evidence: [],
        reasoning: ['Response parsing encountered formatting issues'],
        riskFactors: []
      };
    }
  }

  /**
   * Validate financial metrics for accuracy
   */
  static validateFinancialMetrics(metrics: FinancialMetrics): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // DSCR should be between 0 and 10 (typically 1.0-2.0 is good)
    if (metrics.dscr !== undefined && (metrics.dscr < 0 || metrics.dscr > 10)) {
      errors.push(`DSCR ${metrics.dscr} is outside reasonable range (0-10)`);
    }

    // LTV should be between 0 and 1 (as percentage)
    if (metrics.ltv !== undefined && (metrics.ltv < 0 || metrics.ltv > 1)) {
      errors.push(`LTV ${metrics.ltv} should be between 0 and 1`);
    }

    // Cap rate should be between 0 and 1 (as percentage)
    if (metrics.capRate !== undefined && (metrics.capRate < 0 || metrics.capRate > 1)) {
      errors.push(`Cap rate ${metrics.capRate} should be between 0 and 1`);
    }

    // Occupancy rate should be between 0 and 1
    if (metrics.occupancyRate !== undefined && (metrics.occupancyRate < 0 || metrics.occupancyRate > 1)) {
      errors.push(`Occupancy rate ${metrics.occupancyRate} should be between 0 and 1`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate derived financial metrics
   */
  static calculateDerivedMetrics(baseMetrics: FinancialMetrics): FinancialMetrics {
    const derived = { ...baseMetrics };

    // Calculate NOI from revenue and expenses if available
    if (derived.revenue && derived.expenses) {
      derived.noi = derived.revenue - derived.expenses;
    }

    // Calculate cap rate from NOI and property value
    if (derived.noi && derived.propertyValue) {
      derived.capRate = derived.noi / derived.propertyValue;
    }

    // Calculate cash flow after debt service
    if (derived.noi && derived.debtService) {
      derived.cashFlow = derived.noi - derived.debtService;
    }

    // Calculate DSCR from NOI and debt service
    if (derived.noi && derived.debtService && derived.debtService > 0) {
      derived.dscr = derived.noi / derived.debtService;
    }

    return derived;
  }

  /**
   * Get token usage estimation
   */
  static estimateTokenUsage(request: ClaudeAnalysisRequest): { inputTokens: number; estimatedOutputTokens: number; estimatedCost: number } {
    // Rough estimation: 1 token ≈ 0.75 words
    const inputWords = request.documentContent.length / 4; // Approximate word count
    const inputTokens = Math.ceil(inputWords / 0.75);
    
    const estimatedOutputTokens = 2000; // Conservative estimate for financial analysis
    
    // Claude Opus pricing (as of 2024): $15/1M input tokens, $75/1M output tokens
    const inputCost = (inputTokens / 1000000) * 15;
    const outputCost = (estimatedOutputTokens / 1000000) * 75;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost
    };
  }
}

export { ClaudeFinanceService as default };
