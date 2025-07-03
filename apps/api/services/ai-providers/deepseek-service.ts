/**
 * DeepSeek AI Service - ComplianceBot Implementation
 * Specialized for regulatory compliance and legal analysis
 */

import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface DeepSeekAnalysisRequest {
  documentContent: string;
  documentType: 'lease' | 'contract' | 'regulation' | 'policy' | 'notice' | 'other';
  analysisType: 'compliance_check' | 'risk_assessment' | 'clause_review' | 'regulatory_update';
  context?: {
    jurisdiction?: string;
    propertyType?: string;
    previousViolations?: any[];
    companyId: string;
  };
}

export interface DeepSeekAnalysisResponse {
  agentId: 'deepseek-compliance';
  agentName: 'ComplianceBot (DeepSeek)';
  analysis: string;
  complianceIssues: ComplianceIssue[];
  recommendations: string[];
  confidence: number;
  evidence: Evidence[];
  reasoning: string[];
  regulatoryReferences: RegulatoryReference[];
}

export interface ComplianceIssue {
  id: string;
  type: 'violation' | 'warning' | 'recommendation' | 'requirement';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  deadline?: Date;
  regulation?: string;
  remediation?: string;
}

export interface Evidence {
  fact: string;
  source: string;
  confidence: number;
  legalReference?: string;
}

export interface RegulatoryReference {
  regulation: string;
  section: string;
  requirement: string;
  applicability: string;
}

/**
 * DeepSeek Compliance Service Class
 */
export class DeepSeekComplianceService {
  
  /**
   * Analyze document for compliance using DeepSeek
   */
  static async analyzeDocument(request: DeepSeekAnalysisRequest): Promise<DeepSeekAnalysisResponse> {
    try {
      const prompt = this.buildCompliancePrompt(request);
      
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are ComplianceBot, an expert in property management regulations and legal compliance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseDeepSeekResponse(content, request);

    } catch (error) {
      console.error('DeepSeek Compliance Service error:', error);
      throw new Error(`DeepSeek analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build specialized prompt for compliance analysis
   */
  private static buildCompliancePrompt(request: DeepSeekAnalysisRequest): string {
    const { documentContent, documentType, analysisType, context } = request;

    const basePrompt = `You are ComplianceBot, specialized in property management compliance and regulations. Your expertise includes:
- Federal, state, and local housing regulations
- Fair Housing Act compliance
- Lease agreement legal requirements
- Safety and habitability standards
- Tenant rights and landlord obligations
- Environmental regulations
- ADA compliance
- Building codes and zoning laws

DOCUMENT TYPE: ${documentType}
ANALYSIS TYPE: ${analysisType}
${context?.jurisdiction ? `JURISDICTION: ${context.jurisdiction}` : ''}

DOCUMENT CONTENT:
${documentContent}

Please provide a comprehensive compliance analysis in the following JSON format:

{
  "analysis": "Detailed compliance analysis summary",
  "complianceIssues": [
    {
      "id": "unique_id",
      "type": "violation|warning|recommendation|requirement",
      "title": "Brief issue title",
      "description": "Detailed description",
      "severity": "critical|high|medium|low",
      "deadline": "ISO date if applicable",
      "regulation": "Specific regulation reference",
      "remediation": "How to fix the issue"
    }
  ],
  "recommendations": ["Specific actionable recommendations"],
  "confidence": 85,
  "evidence": [
    {
      "fact": "Specific factual finding",
      "source": "Document section reference",
      "confidence": 90,
      "legalReference": "Legal code or regulation reference"
    }
  ],
  "reasoning": ["Step-by-step legal reasoning"],
  "regulatoryReferences": [
    {
      "regulation": "Regulation name",
      "section": "Section number",
      "requirement": "What it requires",
      "applicability": "How it applies to this case"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Identify all compliance violations and risks
2. Reference specific regulations and legal codes
3. Provide clear remediation steps
4. Assess severity based on legal consequences
5. Consider jurisdiction-specific requirements
6. Flag any ambiguous language that could cause issues
7. Check for missing required clauses or notices
8. Verify compliance with recent regulatory updates

Respond ONLY with valid JSON. Do not include any explanatory text outside the JSON.`;

    return basePrompt;
  }

  /**
   * Parse DeepSeek's JSON response
   */
  private static parseDeepSeekResponse(responseText: string, request: DeepSeekAnalysisRequest): DeepSeekAnalysisResponse {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in DeepSeek response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.analysis || !parsed.complianceIssues || !parsed.recommendations) {
        throw new Error('Missing required fields in DeepSeek response');
      }

      // Ensure compliance issues have proper IDs and dates
      parsed.complianceIssues = parsed.complianceIssues.map((issue: any, index: number) => ({
        id: issue.id || `deepseek-issue-${Date.now()}-${index}`,
        ...issue,
        deadline: issue.deadline ? new Date(issue.deadline) : undefined
      }));

      return {
        agentId: 'deepseek-compliance',
        agentName: 'ComplianceBot (DeepSeek)',
        analysis: parsed.analysis,
        complianceIssues: parsed.complianceIssues,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence || 75,
        evidence: parsed.evidence || [],
        reasoning: parsed.reasoning || [],
        regulatoryReferences: parsed.regulatoryReferences || []
      };

    } catch (error) {
      console.error('Error parsing DeepSeek response:', error);
      
      // Fallback response
      return {
        agentId: 'deepseek-compliance',
        agentName: 'ComplianceBot (DeepSeek)',
        analysis: 'Compliance analysis completed with parsing issues. Manual review recommended.',
        complianceIssues: [{
          id: `fallback-${Date.now()}`,
          type: 'recommendation',
          title: 'Manual Review Required',
          description: 'The AI analysis completed but response formatting needs adjustment.',
          severity: 'medium',
          remediation: 'Review document manually for compliance issues'
        }],
        recommendations: ['Perform manual compliance review'],
        confidence: 60,
        evidence: [],
        reasoning: ['Response parsing encountered formatting issues'],
        regulatoryReferences: []
      };
    }
  }

  /**
   * Check if specific regulation applies
   */
  static checkRegulationApplicability(
    regulation: string,
    propertyType: string,
    jurisdiction: string
  ): boolean {
    // Simplified regulation applicability logic
    const federalRegs = ['Fair Housing Act', 'ADA', 'Section 8'];
    const stateSpecific = ['Rent Control', 'Security Deposit Laws', 'Eviction Procedures'];
    
    if (federalRegs.includes(regulation)) {
      return true; // Federal regulations apply everywhere
    }
    
    if (stateSpecific.includes(regulation)) {
      // Would check specific state laws here
      return true;
    }
    
    return false;
  }

  /**
   * Get compliance deadline based on issue type
   */
  static getComplianceDeadline(issueType: string, severity: string): Date | undefined {
    const now = new Date();
    
    switch (severity) {
      case 'critical':
        // Critical issues need immediate attention
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'high':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case 'medium':
        return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
      case 'low':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
      default:
        return undefined;
    }
  }

  /**
   * Get token usage estimation
   */
  static estimateTokenUsage(request: DeepSeekAnalysisRequest): { 
    inputTokens: number; 
    estimatedOutputTokens: number; 
    estimatedCost: number 
  } {
    // Rough estimation
    const inputWords = request.documentContent.length / 4;
    const inputTokens = Math.ceil(inputWords / 0.75);
    
    const estimatedOutputTokens = 2500; // Compliance analysis tends to be detailed
    
    // DeepSeek pricing estimate
    const inputCost = (inputTokens / 1000000) * 1;
    const outputCost = (estimatedOutputTokens / 1000000) * 2;
    const estimatedCost = inputCost + outputCost;

    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost
    };
  }
}

export { DeepSeekComplianceService as default };