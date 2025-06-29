/**
 * AI Service - Claude Integration
 * This module manages all interactions with Claude for intelligent report analysis
 * Think of it as the brain of Prism Intelligence, orchestrating multi-pass analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import config from '../config';
import { aiLogger } from '../utils/logger';
import { ParsedPDFData } from '../parsers/pdf';
import { ParsedExcelData } from '../parsers/excel';
import { ParsedCSVData } from '../parsers/csv';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: config.ai.anthropicApiKey,
});

/**
 * Define the structure of AI analysis results
 * Each pass builds upon the previous one
 */
export interface AIAnalysisResult {
  reportId: string;
  pass1_extraction: {
    success: boolean;
    data: {
      propertyInfo?: {
        name?: string;
        address?: string;
        totalUnits?: number;
        propertyType?: string;
      };
      reportPeriod?: {
        startDate?: string;
        endDate?: string;
        reportType?: string;
      };
      financialMetrics?: {
        totalRevenue?: number;
        totalExpenses?: number;
        netOperatingIncome?: number;
        occupancyRate?: number;
        [key: string]: number | undefined;
      };
      operationalMetrics?: {
        maintenanceRequests?: number;
        avgDaysToLease?: number;
        tenantTurnover?: number;
        [key: string]: number | undefined;
      };
    };
    confidence: number;
    tokensUsed: number;
  };
  pass2_verification: {
    success: boolean;
    data: {
      calculationsVerified: boolean;
      anomaliesDetected: string[];
      dataQualityScore: number;
      corrections: Array<{
        field: string;
        original: any;
        corrected: any;
        reason: string;
      }>;
    };
    tokensUsed: number;
  };
  pass3_insights: {
    success: boolean;
    data: Array<{
      category: 'revenue' | 'expense' | 'occupancy' | 'maintenance' | 'risk' | 'opportunity';
      insight: string;
      supporting_data: any;
      priority: 1 | 2 | 3 | 4 | 5;  // 5 being highest
      confidence: number;
    }>;
    tokensUsed: number;
  };
  pass4_actions: {
    success: boolean;
    data: Array<{
      action: string;
      category: string;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      assignTo: string;
      dueDate: string;
      expectedImpact: string;
      estimatedValue?: number;
      relatedInsight: number;  // Index of related insight
    }>;
    tokensUsed: number;
  };
  totalTokensUsed: number;
  totalCost: number;
  processingTime: number;
}

/**
 * AI Service class that manages Claude interactions
 * Implements the multi-pass analysis strategy
 */
export class AIService {
  private model: string;
  private maxTokens: number;

  constructor() {
    this.model = config.ai.model;
    this.maxTokens = config.ai.maxTokens;
  }

  /**
   * Perform complete multi-pass analysis on a report
   * This is the main entry point for AI processing
   */
  async analyzeReport(
    reportId: string,
    parsedData: ParsedPDFData | ParsedExcelData | ParsedCSVData,
    reportType: 'pdf' | 'excel' | 'csv'
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    aiLogger.info('Starting multi-pass AI analysis', { 
      reportId, 
      reportType 
    });

    try {
      // Convert parsed data to a format suitable for Claude
      const reportText = this.formatDataForAnalysis(parsedData, reportType);
      
      // Initialize result structure
      const result: AIAnalysisResult = {
        reportId,
        pass1_extraction: { success: false, data: {} as any, confidence: 0, tokensUsed: 0 },
        pass2_verification: { success: false, data: {} as any, tokensUsed: 0 },
        pass3_insights: { success: false, data: [], tokensUsed: 0 },
        pass4_actions: { success: false, data: [], tokensUsed: 0 },
        totalTokensUsed: 0,
        totalCost: 0,
        processingTime: 0,
      };

      // Perform combined extraction and verification
      const { extraction, verification } = await this.performExtractionAndVerification(reportText);
      result.pass1_extraction = extraction;
      result.pass2_verification = verification;

      // Only continue if Pass 2 succeeded
      if (result.pass2_verification.success) {
        result.pass3_insights = await this.performPass3Insights(
          reportText,
          result.pass1_extraction.data,
          result.pass2_verification.data
        );
      }

      // Only continue if Pass 3 succeeded
      if (result.pass3_insights.success) {
        result.pass4_actions = await this.performPass4Actions(
          result.pass1_extraction.data,
          result.pass3_insights.data
        );
      }

      // Calculate totals
      result.totalTokensUsed = 
        result.pass1_extraction.tokensUsed +
        result.pass2_verification.tokensUsed +
        result.pass3_insights.tokensUsed +
        result.pass4_actions.tokensUsed;
      
      // Estimate cost (Claude pricing as of 2024)
      // Input: $0.015 per 1K tokens, Output: $0.075 per 1K tokens
      // Rough estimate: assume 80% input, 20% output
      result.totalCost = (result.totalTokensUsed / 1000) * 0.03;
      
      result.processingTime = Date.now() - startTime;

      aiLogger.info('AI analysis completed', {
        reportId,
        totalTokensUsed: result.totalTokensUsed,
        totalCost: result.totalCost.toFixed(4),
        processingTime: result.processingTime,
        allPassesSuccessful: result.pass4_actions.success,
      });

      return result;

    } catch (error) {
      aiLogger.error('AI analysis failed', { 
        error, 
        reportId 
      });
      throw error;
    }
  }

  /**
   * Pass 1: Extract structured data from the report
   * This pass focuses on finding and extracting key metrics
   */
  private async performPass1Extraction(reportText: string): Promise<AIAnalysisResult['pass1_extraction']> {
    try {
      const prompt = `You are an expert property management analyst. Extract all key data from this property report.

REPORT CONTENT:
${reportText}

Extract and structure the following information in JSON format:
1. Property Information (name, address, total units, property type)
2. Report Period (start date, end date, report type)
3. Financial Metrics (revenue, expenses, NOI, any other financial data with specific numbers)
4. Operational Metrics (occupancy rate, maintenance requests, tenant turnover, etc.)

Important:
- Only extract data that is explicitly stated in the report
- Include the exact numbers as they appear
- If a piece of information is not found, omit it from the response
- Preserve the original formatting of numbers (don't convert currencies)

Respond with a JSON object containing the extracted data.`;

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.1,  // Low temperature for factual extraction
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse the response
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        data: {
          propertyInfo: extractedData.propertyInfo || {},
          reportPeriod: extractedData.reportPeriod || {},
          financialMetrics: extractedData.financialMetrics || {},
          operationalMetrics: extractedData.operationalMetrics || {},
        },
        confidence: 0.9,  // Would be calculated based on extraction completeness
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      };

    } catch (error) {
      aiLogger.error('Pass 1 extraction failed', { error });
      return {
        success: false,
        data: {} as any,
        confidence: 0,
        tokensUsed: 0,
      };
    }
  }

  /**
   * Pass 2: Verify and validate the extracted data
   * This pass checks for consistency and accuracy
   */
  private async performPass2Verification(
    reportText: string,
    extractedData: any
  ): Promise<AIAnalysisResult['pass2_verification']> {
    try {
      const prompt = `You are an expert financial auditor. Verify the accuracy of the extracted data from this property report.

ORIGINAL REPORT:
${reportText.substring(0, 3000)}... [truncated for verification]

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

Please verify:
1. Do all calculations check out? (revenue - expenses = NOI, etc.)
2. Are there any anomalies or inconsistencies in the data?
3. Are the dates and periods consistent throughout?
4. Do percentages add up correctly?
5. Are there any obvious errors or mismatches?

Rate the overall data quality on a scale of 0-100.
List any corrections that should be made.

Respond with a JSON object containing:
- calculationsVerified: boolean
- anomaliesDetected: array of strings describing any issues
- dataQualityScore: number (0-100)
- corrections: array of {field, original, corrected, reason}`;

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const verificationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        calculationsVerified: false,
        anomaliesDetected: ['Unable to verify'],
        dataQualityScore: 0,
        corrections: [],
      };

      return {
        success: true,
        data: verificationData,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      };

    } catch (error) {
      aiLogger.error('Pass 2 verification failed', { error });
      return {
        success: false,
        data: {
          calculationsVerified: false,
          anomaliesDetected: ['Verification failed'],
          dataQualityScore: 0,
          corrections: [],
        },
        tokensUsed: 0,
      };
    }
  }

  /**
   * Pass 3: Generate strategic insights
   * This pass creates meaningful insights from the verified data
   */
  private async performPass3Insights(
    reportText: string,
    extractedData: any,
    verificationResults: any
  ): Promise<AIAnalysisResult['pass3_insights']> {
    try {
      const prompt = `You are a strategic property management consultant. Analyze this property data and provide actionable insights.

VERIFIED DATA:
${JSON.stringify({ ...extractedData, verification: verificationResults }, null, 2)}

CONTEXT FROM REPORT:
${reportText.substring(0, 2000)}... [truncated]

Generate 5-10 strategic insights that:
1. Identify trends and patterns in the data
2. Highlight risks and opportunities
3. Compare performance to industry standards (if apparent)
4. Explain WHY certain metrics are what they are
5. Focus on actionable findings, not just observations

For each insight, provide:
- category: one of [revenue, expense, occupancy, maintenance, risk, opportunity]
- insight: clear explanation in 2-3 sentences
- supporting_data: specific numbers or facts that support this insight
- priority: 1-5 (5 being most critical)
- confidence: 0-1 (how confident you are in this insight)

Respond with a JSON array of insights.`;

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3,  // Slightly higher for creative insights
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Extract array from response
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      const insights = arrayMatch ? JSON.parse(arrayMatch[0]) : [];

      return {
        success: true,
        data: insights,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      };

    } catch (error) {
      aiLogger.error('Pass 3 insights failed', { error });
      return {
        success: false,
        data: [],
        tokensUsed: 0,
      };
    }
  }

  /**
   * Pass 4: Create specific action items
   * This pass converts insights into concrete tasks
   */
  private async performPass4Actions(
    extractedData: any,
    insights: any[]
  ): Promise<AIAnalysisResult['pass4_actions']> {
    try {
      const prompt = `You are a property management operations expert. Convert these insights into specific, actionable tasks.

PROPERTY DATA:
${JSON.stringify(extractedData, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

For each significant insight, create 1-2 specific action items that:
1. Are concrete and measurable
2. Have clear ownership (who should do this)
3. Have realistic timelines
4. Include expected impact
5. Are prioritized appropriately

For each action, provide:
- action: specific task description (1-2 sentences)
- category: type of action (financial, operational, tenant_relations, maintenance, marketing, other)
- priority: urgent|high|medium|low
- assignTo: role/department responsible
- dueDate: when this should be completed (relative dates like "within 7 days")
- expectedImpact: what will improve and by how much
- estimatedValue: dollar impact if applicable
- relatedInsight: index of the insight this addresses (0-based)

Respond with a JSON array of action items.`;

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      const actions = arrayMatch ? JSON.parse(arrayMatch[0]) : [];

      return {
        success: true,
        data: actions,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      };

    } catch (error) {
      aiLogger.error('Pass 4 actions failed', { error });
      return {
        success: false,
        data: [],
        tokensUsed: 0,
      };
    }
  }

  /**
   * Format parsed data for AI analysis
   * Converts different file formats to a consistent text representation
   */
  private formatDataForAnalysis(
    parsedData: ParsedPDFData | ParsedExcelData | ParsedCSVData,
    reportType: 'pdf' | 'excel' | 'csv'
  ): string {
    switch (reportType) {
      case 'pdf':
        return this.formatPDFData(parsedData as ParsedPDFData);
      case 'excel':
        return this.formatExcelData(parsedData as ParsedExcelData);
      case 'csv':
        return this.formatCSVData(parsedData as ParsedCSVData);
      default:
        return 'Unable to format data';
    }
  }

  /**
   * Format PDF data for analysis
   */
  private formatPDFData(data: ParsedPDFData): string {
    let formatted = `PDF REPORT CONTENT\n${'='.repeat(50)}\n\n`;
    
    // Include metadata
    formatted += `Document Info:\n`;
    formatted += `- Pages: ${data.metadata.pageCount}\n`;
    formatted += `- Title: ${data.metadata.title || 'Not specified'}\n`;
    formatted += `- Date: ${data.metadata.creationDate || 'Not specified'}\n\n`;
    
    // Include sections if identified
    if (data.sections && data.sections.length > 0) {
      formatted += `Document Sections:\n${'-'.repeat(30)}\n`;
      data.sections.forEach(section => {
        formatted += `\n[${section.title}]\n${section.content}\n`;
      });
    } else {
      // Fall back to raw text
      formatted += `Full Text:\n${'-'.repeat(30)}\n`;
      formatted += data.text;
    }
    
    // Include tables if found
    if (data.tables && data.tables.length > 0) {
      formatted += `\n\nExtracted Tables:\n${'-'.repeat(30)}\n`;
      data.tables.forEach((table, idx) => {
        formatted += `\nTable ${idx + 1}:\n`;
        formatted += `Headers: ${table.headers.join(' | ')}\n`;
        table.rows.forEach(row => {
          formatted += row.join(' | ') + '\n';
        });
      });
    }
    
    return formatted;
  }

  /**
   * Format Excel data for analysis
   */
  private formatExcelData(data: ParsedExcelData): string {
    // Use the toAnalysisFormat method from excel parser
    // This would be imported and used here
    let formatted = `EXCEL REPORT CONTENT\n${'='.repeat(50)}\n\n`;
    
    formatted += `Workbook Summary:\n`;
    formatted += `- Sheets: ${data.metadata.sheetCount}\n`;
    formatted += `- Total Rows: ${data.metadata.totalRows}\n`;
    formatted += `- Has Formulas: ${data.metadata.hasFormulas}\n\n`;
    
    data.sheets.forEach(sheet => {
      formatted += `\nSheet: "${sheet.name}"\n${'-'.repeat(30)}\n`;
      
      if (sheet.headers.length > 0) {
        formatted += `Headers: ${sheet.headers.join(' | ')}\n\n`;
      }
      
      // Include sample data
      const sampleRows = sheet.data.slice(0, 20);
      sampleRows.forEach((row, idx) => {
        formatted += `Row ${idx + 1}: ${row.join(' | ')}\n`;
      });
      
      if (sheet.data.length > 20) {
        formatted += `... (${sheet.data.length - 20} more rows)\n`;
      }
    });
    
    return formatted;
  }

  /**
   * Format CSV data for analysis
   */
  private formatCSVData(data: ParsedCSVData): string {
    // Use the toAnalysisFormat method from csv parser
    let formatted = `CSV REPORT CONTENT\n${'='.repeat(50)}\n\n`;
    
    formatted += `File Summary:\n`;
    formatted += `- Rows: ${data.metadata.rowCount}\n`;
    formatted += `- Columns: ${data.metadata.columnCount}\n`;
    formatted += `- Likely Financial: ${data.analysis.likelyFinancial}\n\n`;
    
    formatted += `Headers: ${data.headers.join(' | ')}\n\n`;
    
    // Include sample data
    formatted += `Sample Data:\n${'-'.repeat(30)}\n`;
    const sampleRows = data.data.slice(0, 20);
    sampleRows.forEach((row, idx) => {
      formatted += `Row ${idx + 1}: ${row.join(' | ')}\n`;
    });
    
    return formatted;
  }

  /**
   * Test the AI service with a mock report
   * Useful for development and debugging
   */
  async testAnalysis(): Promise<void> {
    const mockReport = `
    Property Financial Report - March 2024
    Riverside Apartments
    
    Total Revenue: $125,000
    Total Expenses: $87,500
    Net Operating Income: $37,500
    
    Occupancy Rate: 92%
    Total Units: 50
    Occupied Units: 46
    
    Maintenance Requests: 23
    Average Days to Lease: 12
    `;

    try {
      const result = await this.analyzeReport(
        'test-report-123',
        { text: mockReport, pages: [mockReport], metadata: { pageCount: 1 } } as any,
        'pdf'
      );

      aiLogger.info('Test analysis completed', {
        insights: result.pass3_insights.data.length,
        actions: result.pass4_actions.data.length,
        cost: result.totalCost,
      });

    } catch (error) {
      aiLogger.error('Test analysis failed', { error });
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();

/**
 * Example usage:
 * 
 * import { aiService } from './services/ai';
 * import { pdfParser } from './parsers/pdf';
 * 
 * // Parse a report
 * const parsedData = await pdfParser.parse(reportBuffer);
 * 
 * // Analyze with AI
 * const analysis = await aiService.analyzeReport(
 *   'report-123',
 *   parsedData,
 *   'pdf'
 * );
 * 
 * // Use the insights and actions
 * console.log('Insights found:', analysis.pass3_insights.data);
 * console.log('Actions recommended:', analysis.pass4_actions.data);
 */