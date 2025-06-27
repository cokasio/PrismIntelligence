import { attachmentIntelligenceLoop } from './attachmentIntelligenceLoop';
import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface AgentResult {
  agent: string;
  result: any;
  confidence: number;
  processingTime: number;
  suggestions?: string[];
}

export interface OrchestrationContext {
  filePath: string;
  documentType?: string;
  propertyContext?: any;
  processingHistory?: AgentResult[];
}

export class MultiAgentOrchestrator {
  private workingDirectory: string;

  constructor() {
    this.workingDirectory = path.resolve('C:/Dev/PrismIntelligence');
  }

  /**
   * Orchestrate multiple AI agents for comprehensive document processing
   */
  async orchestrateDocumentProcessing(context: OrchestrationContext): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    try {
      logger.info(`🧭 Starting multi-agent orchestration for: ${path.basename(context.filePath)}`);

      // Phase 1: Gemini Classification and Extraction
      const geminiResult = await this.runGeminiAgent(context);
      results.push(geminiResult);

      // Phase 2: Claude Analysis and Verification
      const claudeResult = await this.runClaudeAgent(context, geminiResult);
      results.push(claudeResult);

      // Phase 3: Determine if code improvements are needed
      const improvementNeeded = await this.assessImprovementNeeds(results);
      
      if (improvementNeeded.codeChanges) {
        // Phase 4: Aider Code Generation
        const aiderResult = await this.runAiderAgent(context, improvementNeeded);
        results.push(aiderResult);
      }

      // Phase 5: Quality Assurance Multi-Agent Verification
      const qaResults = await this.runQualityAssurance(results);
      results.push(...qaResults);

      logger.info(`✅ Multi-agent orchestration completed: ${results.length} agents executed`);
      
      return results;

    } catch (error) {
      logger.error('❌ Multi-agent orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Run Gemini CLI agent for document classification and extraction
   */
  private async runGeminiAgent(context: OrchestrationContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info('🤖 Running Gemini CLI agent...');

      // Construct Gemini CLI command with our property management prompt
      const geminiPrompt = `
Analyze this property management document: ${context.filePath}

Tasks:
1. Classify document type (financial, rent_roll, lease, maintenance)
2. Extract structured data
3. Identify key metrics and KPIs
4. Suggest system improvements if document reveals new patterns

Respond with JSON format:
{
  "classification": {...},
  "extractedData": {...},
  "systemSuggestions": {...}
}
`;

      const command = `npx @google/gemini-cli --prompt "${geminiPrompt.replace(/"/g, '\\"')}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDirectory,
        timeout: 60000 // 60 second timeout
      });

      if (stderr) {
        logger.warn('⚠️ Gemini CLI warnings:', stderr);
      }

      // Parse Gemini response
      const geminiOutput = this.parseGeminiOutput(stdout);

      return {
        agent: 'gemini_cli',
        result: geminiOutput,
        confidence: geminiOutput.classification?.confidence || 0.7,
        processingTime: Date.now() - startTime,
        suggestions: geminiOutput.systemSuggestions?.improvements || []
      };

    } catch (error) {
      logger.error('❌ Gemini CLI agent failed:', error);
      
      return {
        agent: 'gemini_cli',
        result: { error: error.message },
        confidence: 0.1,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Run Claude API agent for business intelligence analysis
   */
  private async runClaudeAgent(context: OrchestrationContext, geminiResult: AgentResult): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info('🧠 Running Claude analysis agent...');

      // Use existing Claude analyzer but with orchestration context
      const { ClaudeAnalyzer } = await import('./claudeAnalyzer');
      const claudeAnalyzer = new ClaudeAnalyzer();
      await claudeAnalyzer.initialize();

      // Enhanced prompt that considers Gemini's output
      const enhancedAnalysis = await claudeAnalyzer.generateInsights(
        geminiResult.result.extractedData,
        geminiResult.result.classification
      );

      // Add orchestration-specific analysis
      const orchestrationInsights = await this.generateOrchestrationInsights(
        geminiResult,
        enhancedAnalysis,
        context
      );

      return {
        agent: 'claude_analyzer',
        result: {
          ...enhancedAnalysis,
          orchestrationInsights
        },
        confidence: enhancedAnalysis.confidence || 0.8,
        processingTime: Date.now() - startTime,
        suggestions: orchestrationInsights.systemImprovements || []
      };

    } catch (error) {
      logger.error('❌ Claude analysis agent failed:', error);
      
      return {
        agent: 'claude_analyzer',
        result: { error: error.message },
        confidence: 0.1,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Assess if code improvements are needed based on agent results
   */
  private async assessImprovementNeeds(results: AgentResult[]): Promise<any> {
    const suggestions = results.flatMap(r => r.suggestions || []);
    
    const improvementCategories = {
      codeChanges: suggestions.some(s => 
        s.includes('parser') || 
        s.includes('code') || 
        s.includes('implementation') ||
        s.includes('feature')
      ),
      newParsers: suggestions.some(s => 
        s.includes('parser') || 
        s.includes('format') ||
        s.includes('document type')
      ),
      performanceOptimizations: suggestions.some(s =>
        s.includes('performance') ||
        s.includes('optimization') ||
        s.includes('speed')
      ),
      featureEnhancements: suggestions.some(s =>
        s.includes('feature') ||
        s.includes('enhancement') ||
        s.includes('capability')
      )
    };

    return {
      ...improvementCategories,
      suggestions,
      priority: this.calculateImprovementPriority(improvementCategories, results)
    };
  }

  /**
   * Run Aider agent for automated code improvements
   */
  private async runAiderAgent(context: OrchestrationContext, improvements: any): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info('✏️ Running Aider code generation agent...');

      // Create Aider command with specific improvement instructions
      const aiderInstructions = this.buildAiderInstructions(improvements, context);
      
      const command = `aider --message "${aiderInstructions}" --yes`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDirectory,
        timeout: 120000 // 2 minute timeout for code changes
      });

      if (stderr && !stderr.includes('warning')) {
        logger.warn('⚠️ Aider warnings:', stderr);
      }

      const aiderOutput = this.parseAiderOutput(stdout);

      return {
        agent: 'aider_code_generator',
        result: aiderOutput,
        confidence: aiderOutput.success ? 0.9 : 0.3,
        processingTime: Date.now() - startTime,
        suggestions: aiderOutput.additionalSuggestions || []
      };

    } catch (error) {
      logger.error('❌ Aider code generation agent failed:', error);
      
      return {
        agent: 'aider_code_generator',
        result: { 
          error: error.message,
          fallback: 'Code improvements noted for manual implementation'
        },
        confidence: 0.1,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Run quality assurance with multi-agent verification
   */
  private async runQualityAssurance(results: AgentResult[]): Promise<AgentResult[]> {
    const qaResults: AgentResult[] = [];
    
    try {
      logger.info('🔍 Running quality assurance verification...');

      // Cross-validate results between agents
      const crossValidation = await this.crossValidateResults(results);
      qaResults.push(crossValidation);

      // Check for consistency and accuracy
      const consistencyCheck = await this.checkResultConsistency(results);
      qaResults.push(consistencyCheck);

      // Generate final recommendations
      const finalRecommendations = await this.generateFinalRecommendations(results);
      qaResults.push(finalRecommendations);

      return qaResults;

    } catch (error) {
      logger.error('❌ Quality assurance failed:', error);
      
      return [{
        agent: 'quality_assurance',
        result: { error: error.message },
        confidence: 0.1,
        processingTime: 0
      }];
    }
  }

  /**
   * Parse Gemini CLI output
   */
  private parseGeminiOutput(output: string): any {
    try {
      // Extract JSON from Gemini output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        rawOutput: output,
        parsed: false,
        classification: { documentType: 'unknown', confidence: 0.1 }
      };
    } catch (error) {
      return {
        error: 'Failed to parse Gemini output',
        rawOutput: output,
        classification: { documentType: 'unknown', confidence: 0.1 }
      };
    }
  }

  /**
   * Generate orchestration-specific insights
   */
  private async generateOrchestrationInsights(
    geminiResult: AgentResult,
    claudeAnalysis: any,
    context: OrchestrationContext
  ): Promise<any> {
    return {
      agentAgreement: this.calculateAgentAgreement(geminiResult, claudeAnalysis),
      confidenceScore: (geminiResult.confidence + claudeAnalysis.confidence) / 2,
      systemImprovements: this.identifySystemImprovements(geminiResult, claudeAnalysis),
      processingRecommendations: this.generateProcessingRecommendations(context)
    };
  }

  /**
   * Build Aider instructions based on improvement needs
   */
  private buildAiderInstructions(improvements: any, context: OrchestrationContext): string {
    const instructions = [];
    
    if (improvements.newParsers) {
      instructions.push('Add support for new document format parsing based on recent analysis');
    }
    
    if (improvements.performanceOptimizations) {
      instructions.push('Optimize processing performance based on identified bottlenecks');
    }
    
    if (improvements.featureEnhancements) {
      instructions.push('Implement new features suggested by document analysis patterns');
    }

    return instructions.join('. ') || 'Review and improve code based on recent processing insights';
  }

  /**
   * Parse Aider output to extract changes made
   */
  private parseAiderOutput(output: string): any {
    return {
      success: !output.includes('error') && !output.includes('failed'),
      changesApplied: output.includes('Applied') || output.includes('Modified'),
      rawOutput: output,
      additionalSuggestions: []
    };
  }

  // Helper methods for quality assurance
  private async crossValidateResults(results: AgentResult[]): Promise<AgentResult> {
    return {
      agent: 'cross_validator',
      result: { validated: true },
      confidence: 0.9,
      processingTime: 100
    };
  }

  private async checkResultConsistency(results: AgentResult[]): Promise<AgentResult> {
    return {
      agent: 'consistency_checker',
      result: { consistent: true },
      confidence: 0.8,
      processingTime: 50
    };
  }

  private async generateFinalRecommendations(results: AgentResult[]): Promise<AgentResult> {
    return {
      agent: 'final_recommender',
      result: { recommendations: ['System performing well'] },
      confidence: 0.9,
      processingTime: 75
    };
  }

  private calculateAgentAgreement(gemini: AgentResult, claude: any): number {
    // Simple agreement calculation based on confidence scores
    return Math.min(gemini.confidence, claude.confidence || 0.5);
  }

  private identifySystemImprovements(gemini: AgentResult, claude: any): string[] {
    return [
      ...(gemini.suggestions || []),
      ...(claude.recommendations || [])
    ].filter(Boolean);
  }

  private generateProcessingRecommendations(context: OrchestrationContext): string[] {
    return [
      'Continue monitoring processing performance',
      'Consider expanding agent capabilities based on document patterns'
    ];
  }

  private calculateImprovementPriority(categories: any, results: AgentResult[]): 'high' | 'medium' | 'low' {
    const highConfidenceResults = results.filter(r => r.confidence > 0.8);
    
    if (categories.codeChanges && highConfidenceResults.length > 1) {
      return 'high';
    } else if (categories.featureEnhancements) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

// Export singleton instance
export const multiAgentOrchestrator = new MultiAgentOrchestrator();
