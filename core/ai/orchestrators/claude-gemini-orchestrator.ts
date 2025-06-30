// AI Orchestration: Claude + Gemini CLI Integration
// This demonstrates how Claude can orchestrate Gemini CLI based on natural language instructions

import { exec } from 'child_process';
import { promisify } from 'util';
import GeminiCLIWrapper from './gemini-cli-wrapper';

const execAsync = promisify(exec);

export class AIOrchestrator {
  private geminiCLI: GeminiCLIWrapper;

  constructor() {
    this.geminiCLI = new GeminiCLIWrapper();
  }

  // Claude interprets user intent and executes appropriate Gemini commands
  async executeUserIntent(userRequest: string, context?: any): Promise<any> {
    console.log(`🤖 Claude processing request: "${userRequest}"`);
    
    // Claude analyzes the intent and creates appropriate Gemini commands
    const intent = this.analyzeIntent(userRequest);
    
    switch (intent.action) {
      case 'analyze_financial':
        return this.executeFinancialAnalysis(intent.params, context);
      
      case 'compare_properties':
        return this.executePropertyComparison(intent.params, context);
      
      case 'extract_lease_terms':
        return this.executeLeaseExtraction(intent.params, context);
      
      case 'classify_documents':
        return this.executeDocumentClassification(intent.params, context);
      
      case 'market_analysis':
        return this.executeMarketAnalysis(intent.params, context);
      
      case 'custom_analysis':
        return this.executeCustomAnalysis(intent.params, context);
      
      default:
        return this.executeGeneralQuery(userRequest, context);
    }
  }

  private analyzeIntent(request: string): { action: string; params: any } {
    // Claude's interpretation of user intent
    const lowerRequest = request.toLowerCase();
    
    if (lowerRequest.includes('financial') || lowerRequest.includes('revenue') || lowerRequest.includes('noi')) {
      return {
        action: 'analyze_financial',
        params: { 
          metrics: this.extractMetrics(request),
          period: this.extractPeriod(request)
        }
      };
    }
    
    if (lowerRequest.includes('compare') && lowerRequest.includes('propert')) {
      return {
        action: 'compare_properties',
        params: { 
          properties: this.extractPropertyNames(request)
        }
      };
    }
    
    if (lowerRequest.includes('lease') || lowerRequest.includes('tenant')) {
      return {
        action: 'extract_lease_terms',
        params: { 
          focus: this.extractLeaseFocus(request)
        }
      };
    }
    
    if (lowerRequest.includes('classify') || lowerRequest.includes('sort') || lowerRequest.includes('organize')) {
      return {
        action: 'classify_documents',
        params: { 
          categories: this.extractCategories(request)
        }
      };
    }
    
    if (lowerRequest.includes('market') || lowerRequest.includes('competitive')) {
      return {
        action: 'market_analysis',
        params: { 
          scope: this.extractMarketScope(request)
        }
      };
    }
    
    return {
      action: 'custom_analysis',
      params: { originalRequest: request }
    };
  }

  // Specific execution methods for each intent
  private async executeFinancialAnalysis(params: any, context: any): Promise<any> {
    const prompt = `Analyze the financial data focusing on: ${params.metrics.join(', ')}. 
                    Period: ${params.period}. 
                    Provide insights, trends, and actionable recommendations.`;
    
    console.log(`🧮 Executing Gemini financial analysis...`);
    
    // Execute via CLI
    const command = `gemini analyze --file="${context.filePath}" --prompt="${prompt}" --format=json`;
    const result = await execAsync(command);
    
    return {
      action: 'financial_analysis',
      geminiCommand: command,
      result: JSON.parse(result.stdout),
      interpretation: this.interpretFinancialResults(result.stdout)
    };
  }

  private async executePropertyComparison(params: any, context: any): Promise<any> {
    console.log(`🏢 Comparing properties: ${params.properties.join(', ')}`);
    
    const result = await this.geminiCLI.compareProperties(
      params.properties.map(name => ({
        name,
        metrics: context.propertyData?.[name] || {}
      }))
    );
    
    return {
      action: 'property_comparison',
      result: result.data,
      recommendations: this.generateComparativeInsights(result.data)
    };
  }

  private async executeLeaseExtraction(params: any, context: any): Promise<any> {
    const template = {
      tenant_info: ['name', 'contact', 'emergency_contact'],
      lease_terms: ['start_date', 'end_date', 'monthly_rent', 'security_deposit'],
      special_clauses: ['pets', 'parking', 'utilities', 'renewal_options'],
      compliance: ['insurance_required', 'background_check', 'references']
    };
    
    console.log(`📄 Extracting lease information...`);
    
    const command = `gemini extract --file="${context.filePath}" --template='${JSON.stringify(template)}' --output-format=structured`;
    const result = await execAsync(command);
    
    return {
      action: 'lease_extraction',
      geminiCommand: command,
      extractedData: JSON.parse(result.stdout),
      summary: this.summarizeLeaseTerms(JSON.parse(result.stdout))
    };
  }

  private async executeDocumentClassification(params: any, context: any): Promise<any> {
    const categories = params.categories || ['financial', 'lease', 'maintenance', 'operational', 'legal'];
    
    console.log(`📁 Classifying documents into: ${categories.join(', ')}`);
    
    if (context.documents && context.documents.length > 1) {
      // Batch classification
      const result = await this.geminiCLI.classifyBatch(context.documents);
      return {
        action: 'batch_classification',
        result: result.data,
        summary: this.summarizeClassification(result.data)
      };
    } else {
      // Single document
      const command = `gemini classify --file="${context.filePath}" --categories="${categories.join(',')}" --confidence=true`;
      const result = await execAsync(command);
      
      return {
        action: 'document_classification',
        geminiCommand: command,
        classification: result.stdout.trim(),
        confidence: this.extractConfidence(result.stdout)
      };
    }
  }

  private async executeMarketAnalysis(params: any, context: any): Promise<any> {
    const analysisPrompt = `Perform a comprehensive market analysis:
    1. Compare property performance to regional benchmarks
    2. Identify market trends and opportunities
    3. Suggest competitive positioning strategies
    4. Recommend pricing optimizations
    Focus on: ${params.scope}`;
    
    console.log(`📊 Conducting market analysis...`);
    
    const result = await this.geminiCLI.performMarketAnalysis(
      context.propertyData,
      context.marketData
    );
    
    return {
      action: 'market_analysis',
      result: result.data,
      keyInsights: this.extractKeyMarketInsights(result.data),
      actionPlan: this.generateMarketActionPlan(result.data)
    };
  }

  private async executeCustomAnalysis(params: any, context: any): Promise<any> {
    console.log(`🔍 Executing custom Gemini analysis...`);
    
    // Direct pass-through to Gemini with Claude's interpretation
    const enhancedPrompt = this.enhancePromptWithContext(params.originalRequest, context);
    
    const command = `gemini analyze --prompt="${enhancedPrompt}" --model=gemini-1.5-pro --temperature=0.7`;
    const result = await execAsync(command);
    
    return {
      action: 'custom_analysis',
      originalRequest: params.originalRequest,
      enhancedPrompt: enhancedPrompt,
      geminiCommand: command,
      result: result.stdout
    };
  }

  // Helper methods for intent extraction
  private extractMetrics(request: string): string[] {
    const metrics = [];
    if (request.match(/noi|net operating/i)) metrics.push('noi');
    if (request.match(/revenue|income/i)) metrics.push('revenue');
    if (request.match(/expense|cost/i)) metrics.push('expenses');
    if (request.match(/occupancy|vacancy/i)) metrics.push('occupancy');
    if (request.match(/cash flow/i)) metrics.push('cash_flow');
    return metrics.length > 0 ? metrics : ['all_metrics'];
  }

  private extractPeriod(request: string): string {
    const monthMatch = request.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
    const yearMatch = request.match(/20\d{2}/);
    const quarterMatch = request.match(/q[1-4]|quarter/i);
    
    if (monthMatch && yearMatch) return `${monthMatch[0]} ${yearMatch[0]}`;
    if (quarterMatch && yearMatch) return `${quarterMatch[0]} ${yearMatch[0]}`;
    if (yearMatch) return yearMatch[0];
    return 'current_period';
  }

  private extractPropertyNames(request: string): string[] {
    // Extract property names from context or request
    const matches = request.match(/["']([^"']+)["']/g);
    if (matches) {
      return matches.map(m => m.replace(/["']/g, ''));
    }
    return ['all_properties'];
  }

  // ... Additional helper methods ...

  // Result interpretation methods
  private interpretFinancialResults(geminiOutput: string): any {
    return {
      summary: "Financial analysis complete",
      highlights: this.extractHighlights(geminiOutput),
      concerns: this.extractConcerns(geminiOutput),
      opportunities: this.extractOpportunities(geminiOutput)
    };
  }

  private generateComparativeInsights(comparisonData: any): any {
    return {
      topPerformer: this.identifyTopPerformer(comparisonData),
      improvementAreas: this.identifyImprovementAreas(comparisonData),
      bestPractices: this.extractBestPractices(comparisonData)
    };
  }

  // ... Additional interpretation methods ...
}

// Export for use
export default AIOrchestrator;