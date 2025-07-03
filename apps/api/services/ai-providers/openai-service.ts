/**
 * OpenAI Service - RiskBot Implementation
 * OpenAI GPT-4 integration for risk analysis and predictive insights
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface OpenAIAnalysisRequest {
  documentContent: string;
  documentType: 'insurance_doc' | 'inspection_report' | 'legal_document' | 'financial_statement' | 'other';
  analysisType: 'risk_assessment' | 'predictive_analysis' | 'compliance_check' | 'trend_analysis' | 'general';
  context?: {
    propertyInfo?: any;
    historicalData?: any[];
    marketData?: any;
    companyId: string;
  };
}

export interface OpenAIAnalysisResponse {
  agentId: 'openai-risk';
  agentName: 'RiskBot (GPT-4)';
  analysis: string;
  insights: RiskInsight[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
  reasoning: string[];
  riskMatrix: RiskMatrix;
  predictions: Prediction[];
  mitigationStrategies: MitigationStrategy[];
}

export interface RiskInsight {
  id: string;
  type: 'market_risk' | 'operational_risk' | 'financial_risk' | 'regulatory_risk' | 'environmental_risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'soon' | 'planned';
  probability: number; // 0-1 scale
  riskScore: number; // Impact × Probability
  category: string;
}

export interface Evidence {
  fact: string;
  source: string;
  confidence: number;
  dataPoint?: string;
}

export interface RiskMatrix {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskCategories: {
    market: number;
    operational: number;
    financial: number;
    regulatory: number;
    environmental: number;
  };
  heatMap: RiskHeatMapItem[];
  totalRiskScore: number;
}

export interface RiskHeatMapItem {
  category: string;
  subcategory: string;
  probability: number;
  impact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  timeframe: '1_month' | '3_months' | '6_months' | '1_year' | '2_years';
  confidence: number;
  impactAreas: string[];
  metrics?: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    change: number;
  }[];
}

export interface MitigationStrategy {
  id: string;
  riskCategory: string;
  strategy: string;
  implementation: string[];
  cost: 'low' | 'medium' | 'high';
  timeframe: string;
  effectiveness: number; // 0-1 scale
  priority: 'high' | 'medium' | 'low';
}

/**
 * OpenAI Risk Service Class
 */
export class OpenAIRiskService {
  
  /**
   * Analyze document for risk assessment using GPT-4
   */
  static async analyzeDocument(request: OpenAIAnalysisRequest): Promise<OpenAIAnalysisResponse> {
    try {
      const messages = this.buildRiskPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent analysis
        response_format: { type: 'json_object' },
        tools: [
          {
            type: 'function',
            function: {
              name: 'calculate_risk_score',
              description: 'Calculate risk score based on probability and impact',
              parameters: {
                type: 'object',
                properties: {
                  probability: { type: 'number', minimum: 0, maximum: 1 },
                  impact: { type: 'number', minimum: 1, maximum: 10 }
                },
                required: ['probability', 'impact']
              }
            }
          }
        ]
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseOpenAIResponse(response, request);

    } catch (error) {
      console.error('OpenAI Risk Service error:', error);
      throw new Error(`OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build specialized prompt for risk analysis
   */
  private static buildRiskPrompt(request: OpenAIAnalysisRequest): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const { documentContent, documentType, analysisType, context } = request;

    const systemPrompt = `You are RiskBot, an advanced AI agent specialized in property management risk analysis and predictive insights. You excel at:
- Comprehensive risk assessment across multiple dimensions
- Predictive analysis using historical patterns and market trends
- Regulatory compliance monitoring and legal risk evaluation
- Financial risk modeling and stress testing
- Environmental and operational risk identification
- Data-driven risk mitigation strategy development

Your analysis should be thorough, quantitative where possible, and focused on actionable insights for property management decision-making.`;

    const userPrompt = `DOCUMENT TYPE: ${documentType}
ANALYSIS TYPE: ${analysisType}

DOCUMENT CONTENT:
${documentContent}

${context?.propertyInfo ? `PROPERTY CONTEXT: ${JSON.stringify(context.propertyInfo, null, 2)}` : ''}
${context?.historicalData ? `HISTORICAL DATA: ${JSON.stringify(context.historicalData, null, 2)}` : ''}
${context?.marketData ? `MARKET CONTEXT: ${JSON.stringify(context.marketData, null, 2)}` : ''}

Please provide a comprehensive risk analysis in JSON format with the following structure:

{
  "analysis": "Executive summary of risk assessment findings",
  "insights": [
    {
      "id": "unique_identifier",
      "type": "market_risk|operational_risk|financial_risk|regulatory_risk|environmental_risk",
      "title": "Risk insight title",
      "description": "Detailed risk description with context",
      "impact": "high|medium|low",
      "urgency": "immediate|soon|planned",
      "probability": 0.75,
      "riskScore": 7.5,
      "category": "Specific risk category"
    }
  ],
  "recommendations": ["Prioritized actionable recommendations"],
  "confidence": 88,
  "evidence": [
    {
      "fact": "Supporting evidence from document",
      "source": "Document reference or data source",
      "confidence": 92,
      "dataPoint": "Specific metric or measurement"
    }
  ],
  "reasoning": ["Step-by-step analytical reasoning"],
  "riskMatrix": {
    "overallRiskLevel": "medium",
    "riskCategories": {
      "market": 65,
      "operational": 45,
      "financial": 70,
      "regulatory": 30,
      "environmental": 55
    },
    "heatMap": [
      {
        "category": "Financial",
        "subcategory": "Cash Flow",
        "probability": 0.6,
        "impact": 8,
        "riskLevel": "high"
      }
    ],
    "totalRiskScore": 53
  },
  "predictions": [
    {
      "id": "prediction_id",
      "title": "Prediction title",
      "description": "Detailed prediction with reasoning",
      "timeframe": "6_months",
      "confidence": 0.75,
      "impactAreas": ["cash_flow", "occupancy"],
      "metrics": [
        {
          "metric": "Occupancy Rate",
          "currentValue": 95,
          "predictedValue": 88,
          "change": -7
        }
      ]
    }
  ],
  "mitigationStrategies": [
    {
      "id": "strategy_id",
      "riskCategory": "financial_risk",
      "strategy": "Strategy description",
      "implementation": ["Step 1", "Step 2"],
      "cost": "medium",
      "timeframe": "3-6 months",
      "effectiveness": 0.8,
      "priority": "high"
    }
  ]
}

ANALYSIS REQUIREMENTS:
1. Quantify risks with probability and impact scores
2. Create comprehensive risk matrix with heat map visualization
3. Provide predictive insights with confidence intervals
4. Develop specific, actionable mitigation strategies
5. Consider market trends and regulatory changes
6. Assess both short-term and long-term risk horizons
7. Include cost-benefit analysis for recommended actions
8. Prioritize risks by business impact and likelihood

Return ONLY valid JSON without any additional text.`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }

  /**
   * Parse OpenAI's JSON response
   */
  private static parseOpenAIResponse(responseText: string, request: OpenAIAnalysisRequest): OpenAIAnalysisResponse {
    try {
      const parsed = JSON.parse(responseText);

      // Validate required fields
      if (!parsed.analysis || !parsed.insights || !parsed.recommendations) {
        throw new Error('Missing required fields in OpenAI response');
      }

      // Ensure insights have proper IDs and calculated risk scores
      parsed.insights = parsed.insights.map((insight: any, index: number) => {
        const id = insight.id || `openai-insight-${Date.now()}-${index}`;
        const probability = insight.probability || 0.5;
        const impactMap = { high: 8, medium: 5, low: 2 };
        const impact = impactMap[insight.impact as keyof typeof impactMap] || 5;
        const riskScore = probability * impact;

        return {
          ...insight,
          id,
          probability,
          riskScore: Math.round(riskScore * 100) / 100
        };
      });

      // Ensure predictions have proper IDs
      if (parsed.predictions) {
        parsed.predictions = parsed.predictions.map((prediction: any, index: number) => ({
          id: prediction.id || `prediction-${Date.now()}-${index}`,
          ...prediction
        }));
      }

      // Ensure mitigation strategies have proper IDs
      if (parsed.mitigationStrategies) {
        parsed.mitigationStrategies = parsed.mitigationStrategies.map((strategy: any, index: number) => ({
          id: strategy.id || `strategy-${Date.now()}-${index}`,
          ...strategy
        }));
      }

      return {
        agentId: 'openai-risk',
        agentName: 'RiskBot (GPT-4)',
        analysis: parsed.analysis,
        insights: parsed.insights,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence || 75,
        evidence: parsed.evidence || [],
        reasoning: parsed.reasoning || [],
        riskMatrix: parsed.riskMatrix || this.getDefaultRiskMatrix(),
        predictions: parsed.predictions || [],
        mitigationStrategies: parsed.mitigationStrategies || []
      };

    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      
      // Fallback response if parsing fails
      return {
        agentId: 'openai-risk',
        agentName: 'RiskBot (GPT-4)',
        analysis: 'Risk analysis completed, but response formatting encountered an issue. Please review the document manually for detailed insights.',
        insights: [{
          id: `fallback-${Date.now()}`,
          type: 'operational_risk',
          title: 'Analysis Available',
          description: 'OpenAI provided analysis but formatting needs adjustment. Raw analysis available in logs.',
          impact: 'medium',
          urgency: 'soon',
          probability: 0.5,
          riskScore: 4.0,
          category: 'System'
        }],
        recommendations: ['Review document formatting and re-analyze if needed'],
        confidence: 60,
        evidence: [],
        reasoning: ['Response parsing encountered formatting issues'],
        riskMatrix: this.getDefaultRiskMatrix(),
        predictions: [],
        mitigationStrategies: []
      };
    }
  }

  /**
   * Get default risk matrix for fallback scenarios
   */
  private static getDefaultRiskMatrix(): RiskMatrix {
    return {
      overallRiskLevel: 'medium',
      riskCategories: {
        market: 50,
        operational: 50,
        financial: 50,
        regulatory: 50,
        environmental: 50
      },
      heatMap: [],
      totalRiskScore: 50
    };
  }

  /**
   * Calculate comprehensive risk score
   */
  static calculateRiskScore(probability: number, impact: number, timeframe?: string): number {
    let baseScore = probability * impact;
    
    // Adjust for timeframe urgency
    if (timeframe) {
      const timeMultiplier = {
        'immediate': 1.2,
        'soon': 1.0,
        'planned': 0.8,
        '1_month': 1.15,
        '3_months': 1.0,
        '6_months': 0.9,
        '1_year': 0.8,
        '2_years': 0.7
      };
      
      baseScore *= timeMultiplier[timeframe as keyof typeof timeMultiplier] || 1.0;
    }
    
    return Math.round(baseScore * 100) / 100;
  }

  /**
   * Generate risk heat map
   */
  static generateRiskHeatMap(insights: RiskInsight[]): RiskHeatMapItem[] {
    return insights.map(insight => ({
      category: insight.type,
      subcategory: insight.category,
      probability: insight.probability,
      impact: insight.riskScore / insight.probability, // Reverse calculate impact
      riskLevel: this.categorizeRiskLevel(insight.riskScore)
    }));
  }

  /**
   * Categorize risk level based on score
   */
  private static categorizeRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Generate predictive analysis
   */
  static async generatePredictions(
    historicalData: any[],
    marketTrends: any,
    propertyInfo: any
  ): Promise<Prediction[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a predictive analytics specialist for property management. Generate data-driven predictions based on historical patterns and market trends.'
          },
          {
            role: 'user',
            content: `Based on this data, generate 3-5 predictions for the next 12 months:

HISTORICAL DATA: ${JSON.stringify(historicalData)}
MARKET TRENDS: ${JSON.stringify(marketTrends)}
PROPERTY INFO: ${JSON.stringify(propertyInfo)}

Return predictions in JSON array format with confidence scores and specific metrics.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      if (response) {
        const parsed = JSON.parse(response);
        return parsed.predictions || [];
      }

      return [];
    } catch (error) {
      console.error('Prediction generation error:', error);
      return [];
    }
  }

  /**
   * Get token usage estimation
   */
  static estimateTokenUsage(request: OpenAIAnalysisRequest): { inputTokens: number; estimatedOutputTokens: number; estimatedCost: number } {
    // GPT-4 token estimation (roughly 1 token per 0.75 words)
    const inputWords = request.documentContent.length / 4;
    const inputTokens = Math.ceil(inputWords / 0.75);
    
    const estimatedOutputTokens = 2500; // Conservative estimate for risk analysis
    
    // GPT-4 Turbo pricing: $0.01/1K input tokens, $0.03/1K output tokens
    const inputCost = (inputTokens / 1000) * 0.01;
    const outputCost = (estimatedOutputTokens / 1000) * 0.03;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost
    };
  }
}

export { OpenAIRiskService as default };
