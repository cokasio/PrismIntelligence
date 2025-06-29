import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger';
import { FileClassification } from './attachmentIntelligenceLoop';

export interface GeneratedInsights {
  insights: {
    summary: string;
    keyFindings: string[];
    trends: string[];
    risks: string[];
    opportunities: string[];
  };
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    deadline?: string;
    estimatedCost?: string;
  }>;
  recommendations: string[];
  confidence: number;
}

export class ClaudeAnalyzer {
  private anthropic: Anthropic | null = null;

  constructor() {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required');
      }

      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
      
      logger.info('✅ Claude AI initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Claude AI:', error);
      this.anthropic = null;
    }
  }

  /**
   * Generate insights from extracted document data
   */
  async generateInsights(extractedData: any, classification: FileClassification): Promise<GeneratedInsights> {
    if (!this.anthropic) {
      logger.error('❌ Claude AI is not initialized. Cannot generate insights.');
      return this.getFallbackInsights(extractedData, classification);
    }

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any;

    while (attempt < maxRetries) {
      try {
        const prompt = this.buildInsightPrompt(extractedData, classification);
        
        const message = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048, // Reduced max_tokens for efficiency
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

        const insights = this.parseInsightResponse(response.text);
        
        logger.info(`💡 Generated insights for ${classification.documentType} document`);
        
        return insights;
        
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.warn(`Rate limit hit. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error('❌ Claude insight generation failed:', error);
          return this.getFallbackInsights(extractedData, classification);
        }
      }
    }

    logger.error('❌ Claude insight generation failed after multiple retries:', lastError);
    return this.getFallbackInsights(extractedData, classification);
  }

  /**
   * Build the insight generation prompt based on document type
   */
  private buildInsightPrompt(extractedData: any, classification: FileClassification): string {
    const reportPeriodString = classification.reportPeriod
      ? `${classification.reportPeriod.start || 'Not specified'} to ${classification.reportPeriod.end || 'Not specified'}`
      : 'Not specified';

    const baseContext = `
You are a senior property management analyst with 20+ years of experience. You understand the nuances of property operations, financial performance, and strategic decision-making in real estate.

**Document Information:**
- Type: ${classification.documentType}
- Property: ${classification.propertyName || 'Unknown'}
- Period: ${reportPeriodString}
- Confidence: ${Math.round(classification.confidence * 100)}%

**Extracted Data:**
${JSON.stringify(extractedData, null, 2)}
`;

    switch (classification.documentType) {
      case 'financial':
        return baseContext + this.getFinancialAnalysisPrompt();
      case 'rent_roll':
        return baseContext + this.getRentRollAnalysisPrompt();
      case 'lease':
        return baseContext + this.getLeaseAnalysisPrompt();
      case 'maintenance':
        return baseContext + this.getMaintenanceAnalysisPrompt();
      default:
        return baseContext + this.getGeneralAnalysisPrompt();
    }
  }

  /**
   * Financial document analysis prompt
   */
  private getFinancialAnalysisPrompt(): string {
    return `
Analyze the following property financial data. Provide actionable insights in JSON format.

**Analyze:**
- Revenue vs. market rates, vacancy trends, other income.
- Expense ratios, controllable vs. non-controllable, variances.
- NOI trends, margins, cash flow.
- KPIs: OER, Rev/SF, occupancy.

**JSON Response:**
{
  "insights": { "summary": "", "keyFindings": [], "trends": [], "risks": [], "opportunities": [] },
  "actionItems": [{ "priority": "", "category": "", "description": "", "deadline": "", "estimatedCost": "" }],
  "recommendations": [],
  "confidence": 0.95
}
`;
  }

  /**
   * Rent roll analysis prompt
   */
  private getRentRollAnalysisPrompt(): string {
    return `
Analyze this rent roll for tenant performance and leasing strategy. Provide insights in JSON format.

**Analyze:**
- Occupancy/vacancy rates and trends.
- Rental rates vs. market, new vs. renewal.
- Lease expiration schedule and revenue at risk.
- Tenant quality, payment history, concentration risk.

**JSON Response:**
{
  "insights": { "summary": "", "keyFindings": [], "trends": [], "risks": [], "opportunities": [] },
  "actionItems": [{ "priority": "", "category": "", "description": "", "deadline": "", "estimatedCost": "" }],
  "recommendations": [],
  "confidence": 0.90
}
`;
  }

  /**
   * Lease document analysis prompt
   */
  private getLeaseAnalysisPrompt(): string {
    return `
Analyze this lease for key terms, risks, and opportunities. Provide insights in JSON format.

**Analyze:**
- Critical dates: commencement, expiration, renewals.
- Financial terms: base rent, escalations, additional charges.
- Risk assessment: tenant/landlord obligations, default clauses.
- Strategic considerations: renewal likelihood, market position.

**JSON Response:**
{
  "insights": { "summary": "", "keyFindings": [], "trends": [], "risks": [], "opportunities": [] },
  "actionItems": [{ "priority": "", "category": "", "description": "", "deadline": "", "estimatedCost": "" }],
  "recommendations": [],
  "confidence": 0.85
}
`;
  }

  /**
   * Maintenance document analysis prompt
   */
  private getMaintenanceAnalysisPrompt(): string {
    return `
Analyze this maintenance document for operational insights and cost savings. Provide insights in JSON format.

**Analyze:**
- Cost trends, cost per unit/SF, vendor performance.
- Operational efficiency: response times, recurring issues, preventive vs. reactive.
- Asset condition, CapEx needs, life cycle planning.
- Budget impact, variance, forecasting.

**JSON Response:**
{
  "insights": { "summary": "", "keyFindings": [], "trends": [], "risks": [], "opportunities": [] },
  "actionItems": [{ "priority": "", "category": "", "description": "", "deadline": "", "estimatedCost": "" }],
  "recommendations": [],
  "confidence": 0.80
}
`;
  }

  /**
   * General analysis prompt for unknown document types
   */
  private getGeneralAnalysisPrompt(): string {
    return `
Analyze this document and extract meaningful property management insights. Provide insights in JSON format.

**Analyze:**
- Document purpose and key information.
- Performance metrics and data points.
- Impact on property operations.
- Action items or follow-up needs.

**JSON Response:**
{
  "insights": { "summary": "", "keyFindings": [], "trends": [], "risks": [], "opportunities": [] },
  "actionItems": [{ "priority": "", "category": "", "description": "", "deadline": "", "estimatedCost": "" }],
  "recommendations": [],
  "confidence": 0.60
}
`;
  }

  /**
   * Parse Claude's insight response
   */
  private parseInsightResponse(responseText: string): GeneratedInsights {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and structure the response
      return {
        insights: {
          summary: parsed.insights?.summary || 'No summary provided',
          keyFindings: Array.isArray(parsed.insights?.keyFindings) ? parsed.insights.keyFindings : [],
          trends: Array.isArray(parsed.insights?.trends) ? parsed.insights.trends : [],
          risks: Array.isArray(parsed.insights?.risks) ? parsed.insights.risks : [],
          opportunities: Array.isArray(parsed.insights?.opportunities) ? parsed.insights.opportunities : []
        },
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.map(this.validateActionItem) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7))
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.warn(`⚠️ Could not parse Claude insight response: ${errorMessage}`);
      logger.debug('Raw response:', responseText);
      
      // Return fallback with raw response
      return {
        insights: {
          summary: 'Failed to parse insights',
          keyFindings: [],
          trends: [],
          risks: ['Unable to generate insights'],
          opportunities: []
        },
        actionItems: [],
        recommendations: ['Review document manually'],
        confidence: 0.1
      };
    }
  }

  /**
   * Validate and normalize action items
   */
  private validateActionItem(item: any): any {
    return {
      priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
      category: item.category || 'General',
      description: item.description || 'Action item needs description',
      deadline: item.deadline || undefined,
      estimatedCost: item.estimatedCost || undefined
    };
  }

  /**
   * Get fallback insights when Claude fails
   */
  private getFallbackInsights(extractedData: any, classification: FileClassification): GeneratedInsights {
    return {
      insights: {
        summary: `Document processed as ${classification.documentType} type but detailed analysis failed`,
        keyFindings: ['Document was successfully classified and parsed'],
        trends: [],
        risks: ['Manual review recommended due to analysis failure'],
        opportunities: ['Consider improving document format for better AI analysis']
      },
      actionItems: [
        {
          priority: 'medium' as const,
          category: 'Review',
          description: 'Manually review this document for important insights',
          deadline: 'Within 1 week',
          estimatedCost: undefined,
        }
      ],
      recommendations: ['Ensure document quality for better automated analysis'],
      confidence: 0.3
    };
  }

  /**
   * Test the Claude connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.anthropic) {
      logger.error('❌ Claude AI is not initialized. Cannot test connection.');
      return false;
    }
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Respond with "OK" if you can understand this message.'
          }
        ]
      });

      const response = message.content[0];
      return response.type === 'text' && response.text.includes('OK');
      
    } catch (error) {
      logger.error('❌ Claude connection test failed:', error);
      return false;
    }
  }
}
