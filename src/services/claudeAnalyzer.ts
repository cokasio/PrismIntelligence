import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
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
    // Will be initialized in initialize() method
  }

  /**
   * Initialize the Claude AI service
   */
  async initialize(): Promise<void> {
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
      throw error;
    }
  }

  /**
   * Generate insights from extracted document data
   */
  async generateInsights(extractedData: any, classification: FileClassification): Promise<GeneratedInsights> {
    try {
      if (!this.anthropic) {
        await this.initialize();
      }

      const prompt = this.buildInsightPrompt(extractedData, classification);
      
      const message = await this.anthropic!.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
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
      
    } catch (error) {
      logger.error('❌ Claude insight generation failed:', error);
      
      // Return fallback insights
      return this.getFallbackInsights(extractedData, classification);
    }
  }

  /**
   * Build the insight generation prompt based on document type
   */
  private buildInsightPrompt(extractedData: any, classification: FileClassification): string {
    const baseContext = `
You are a senior property management analyst with 20+ years of experience. You understand the nuances of property operations, financial performance, and strategic decision-making in real estate.

**Document Information:**
- Type: ${classification.documentType}
- Property: ${classification.propertyName || 'Unknown'}
- Period: ${classification.reportPeriod ? `${classification.reportPeriod.start} to ${classification.reportPeriod.end}` : 'Not specified'}
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
**Financial Analysis Task:**
Analyze this property financial statement and provide actionable insights.

**Key Areas to Analyze:**
1. **Revenue Performance**
   - Total rental income vs. market rates
   - Vacancy impact and trends
   - Other income sources (parking, fees, etc.)

2. **Expense Analysis**
   - Operating expense ratios
   - Controllable vs. non-controllable expenses
   - Year-over-year variances

3. **Net Operating Income (NOI)**
   - NOI trends and margins
   - Comparison to property type benchmarks
   - Cash flow implications

4. **Key Performance Indicators**
   - Operating expense ratio
   - Revenue per square foot
   - Occupancy rates

**Response Format (JSON):**
{
  "insights": {
    "summary": "Executive summary of financial performance",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
    "trends": ["Trend analysis"],
    "risks": ["Identified risks"],
    "opportunities": ["Growth opportunities"]
  },
  "actionItems": [
    {
      "priority": "high|medium|low",
      "category": "Revenue|Expenses|Operations|Capital",
      "description": "Specific action to take",
      "deadline": "timeframe",
      "estimatedCost": "cost estimate if applicable"
    }
  ],
  "recommendations": ["Strategic recommendations"],
  "confidence": 0.95
}

Provide your analysis:
`;
  }

  /**
   * Rent roll analysis prompt
   */
  private getRentRollAnalysisPrompt(): string {
    return `
**Rent Roll Analysis Task:**
Analyze this property rent roll and identify key insights about tenant performance and leasing strategy.

**Key Areas to Analyze:**
1. **Occupancy & Vacancy**
   - Current occupancy rate
   - Vacancy trends and duration
   - Unit mix analysis

2. **Rental Rate Analysis**
   - Market rate comparisons
   - Below-market units
   - Renewal vs. new lease rates

3. **Lease Expiration Schedule**
   - Upcoming expirations
   - Renewal risk assessment
   - Revenue at risk

4. **Tenant Quality & Risk**
   - Payment history
   - Lease term patterns
   - Tenant concentration

**Response Format (JSON):**
{
  "insights": {
    "summary": "Executive summary of rent roll performance",
    "keyFindings": ["Key tenant insights"],
    "trends": ["Occupancy and rental trends"],
    "risks": ["Leasing risks identified"],
    "opportunities": ["Revenue optimization opportunities"]
  },
  "actionItems": [
    {
      "priority": "high|medium|low",
      "category": "Leasing|Marketing|Tenant Relations|Revenue",
      "description": "Specific leasing action",
      "deadline": "when to complete",
      "estimatedCost": "cost if applicable"
    }
  ],
  "recommendations": ["Leasing strategy recommendations"],
  "confidence": 0.90
}

Provide your analysis:
`;
  }

  /**
   * Lease document analysis prompt
   */
  private getLeaseAnalysisPrompt(): string {
    return `
**Lease Document Analysis Task:**
Analyze this lease document for key terms, risks, and opportunities.

**Key Areas to Analyze:**
1. **Critical Dates**
   - Lease commencement and expiration
   - Renewal options and terms
   - Important deadlines

2. **Financial Terms**
   - Base rent and escalations
   - Additional charges (CAM, utilities, etc.)
   - Security deposits and guarantees

3. **Risk Assessment**
   - Tenant obligations and responsibilities
   - Landlord obligations
   - Default and remedy provisions

4. **Strategic Considerations**
   - Renewal likelihood
   - Market positioning
   - Portfolio impact

**Response Format (JSON):**
{
  "insights": {
    "summary": "Executive summary of lease terms",
    "keyFindings": ["Key lease provisions"],
    "trends": ["Market positioning insights"],
    "risks": ["Legal and financial risks"],
    "opportunities": ["Revenue or relationship opportunities"]
  },
  "actionItems": [
    {
      "priority": "high|medium|low",
      "category": "Legal|Financial|Relationship|Operations",
      "description": "Specific action needed",
      "deadline": "deadline based on lease terms",
      "estimatedCost": "cost estimate"
    }
  ],
  "recommendations": ["Lease management recommendations"],
  "confidence": 0.85
}

Provide your analysis:
`;
  }

  /**
   * Maintenance document analysis prompt
   */
  private getMaintenanceAnalysisPrompt(): string {
    return `
**Maintenance Analysis Task:**
Analyze this maintenance document for operational insights and cost optimization opportunities.

**Key Areas to Analyze:**
1. **Cost Analysis**
   - Maintenance spend trends
   - Cost per unit/square foot
   - Vendor performance

2. **Operational Efficiency**
   - Response times
   - Recurring issues
   - Preventive vs. reactive maintenance

3. **Asset Condition**
   - System health indicators
   - Capital expenditure needs
   - Life cycle planning

4. **Budget Impact**
   - Budget variance analysis
   - Seasonal patterns
   - Forecasting implications

**Response Format (JSON):**
{
  "insights": {
    "summary": "Executive summary of maintenance performance",
    "keyFindings": ["Operational insights"],
    "trends": ["Cost and performance trends"],
    "risks": ["Asset and budget risks"],
    "opportunities": ["Efficiency improvements"]
  },
  "actionItems": [
    {
      "priority": "high|medium|low",
      "category": "Preventive|Emergency|Vendor|Budget",
      "description": "Specific maintenance action",
      "deadline": "timeframe for completion",
      "estimatedCost": "cost estimate"
    }
  ],
  "recommendations": ["Maintenance strategy recommendations"],
  "confidence": 0.80
}

Provide your analysis:
`;
  }

  /**
   * General analysis prompt for unknown document types
   */
  private getGeneralAnalysisPrompt(): string {
    return `
**General Document Analysis Task:**
Analyze this property management document and extract meaningful insights.

**Analysis Framework:**
1. Identify the document's purpose and key information
2. Extract any performance metrics or data points
3. Assess potential impacts on property operations
4. Identify any action items or follow-up needs

**Response Format (JSON):**
{
  "insights": {
    "summary": "Summary of document contents",
    "keyFindings": ["Important information found"],
    "trends": ["Any patterns or trends"],
    "risks": ["Potential concerns"],
    "opportunities": ["Potential benefits"]
  },
  "actionItems": [
    {
      "priority": "high|medium|low",
      "category": "General",
      "description": "Action needed",
      "deadline": "timeframe",
      "estimatedCost": "if applicable"
    }
  ],
  "recommendations": ["General recommendations"],
  "confidence": 0.60
}

Provide your analysis:
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
      logger.warn('⚠️ Could not parse Claude insight response:', error);
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
          deadline: 'Within 1 week'
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
    try {
      if (!this.anthropic) {
        await this.initialize();
      }

      const message = await this.anthropic!.messages.create({
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
