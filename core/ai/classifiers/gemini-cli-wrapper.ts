// Gemini CLI Wrapper for Prism Intelligence
// This provides a clean TypeScript interface to the Gemini CLI

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export interface GeminiCLIConfig {
  projectId?: string;
  region?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface GeminiAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export interface PropertyDocument {
  id: string;
  type: 'financial' | 'lease' | 'maintenance' | 'operational';
  content: string;
  metadata?: Record<string, any>;
}

export class GeminiCLIWrapper {
  private config: Required<GeminiCLIConfig>;
  private tempDir: string;

  constructor(config?: GeminiCLIConfig) {
    this.config = {
      projectId: config?.projectId || process.env.GOOGLE_CLOUD_PROJECT || '',
      region: config?.region || process.env.GOOGLE_CLOUD_REGION || 'us-central1',
      model: config?.model || process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      maxTokens: config?.maxTokens || parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
      temperature: config?.temperature || parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      timeout: config?.timeout || parseInt(process.env.GEMINI_CLI_TIMEOUT || '30000')
    };

    this.tempDir = path.join(process.cwd(), '.gemini-temp');
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  // Analyze a property document using Gemini CLI
  async analyzeDocument(document: PropertyDocument, customPrompt?: string): Promise<GeminiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Default prompts based on document type
      const defaultPrompts = {
        financial: "Analyze this financial report. Extract key metrics, identify trends, and suggest actions.",
        lease: "Extract lease terms, important dates, tenant information, and special clauses.",
        maintenance: "Categorize maintenance issues by priority, estimate costs, and suggest preventive measures.",
        operational: "Summarize operational data, identify inefficiencies, and recommend improvements."
      };

      const prompt = customPrompt || defaultPrompts[document.type];
      
      // Create temporary file
      const tempFile = path.join(this.tempDir, `doc-${uuidv4()}.json`);
      await fs.writeFile(tempFile, JSON.stringify({
        document,
        prompt,
        parameters: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      }, null, 2));

      // Execute Gemini CLI command
      const command = this.buildCommand('analyze', tempFile);
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.config.timeout 
      });

      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});

      // Parse result
      const result = this.parseOutput(stdout);
      
      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  // Classify multiple documents in batch
  async classifyBatch(documents: PropertyDocument[]): Promise<GeminiAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Create batch file
      const batchFile = path.join(this.tempDir, `batch-${uuidv4()}.jsonl`);
      const batchContent = documents.map(doc => 
        JSON.stringify({
          id: doc.id,
          content: doc.content,
          prompt: "Classify this property document into one of: financial, lease, maintenance, operational"
        })
      ).join('\n');
      
      await fs.writeFile(batchFile, batchContent);

      // Execute batch command
      const command = `gcloud vertex-ai models batch-predict ` +
        `--region=${this.config.region} ` +
        `--model=${this.config.model} ` +
        `--input-data-format=jsonl ` +
        `--input-path=${batchFile} ` +
        `--output-path=${this.tempDir}`;

      const { stdout } = await execAsync(command, {
        timeout: this.config.timeout * documents.length
      });

      // Clean up
      await fs.unlink(batchFile).catch(() => {});

      return {
        success: true,
        data: { batchId: this.extractBatchId(stdout) },
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  // Extract insights from property reports
  async extractInsights(reportPath: string, insightTypes: string[]): Promise<GeminiAnalysisResult> {
    const prompt = `Extract the following insights from this property report: ${insightTypes.join(', ')}. 
                    Format the response as JSON with keys matching the insight types.`;
    
    const document: PropertyDocument = {
      id: uuidv4(),
      type: 'financial',
      content: await fs.readFile(reportPath, 'utf-8'),
      metadata: { filePath: reportPath }
    };

    return this.analyzeDocument(document, prompt);
  }

  // Compare properties using Gemini
  async compareProperties(properties: Array<{name: string, metrics: any}>): Promise<GeminiAnalysisResult> {
    const prompt = `Compare these properties and provide:
    1. Performance ranking
    2. Key differentiators
    3. Best practices from top performers
    4. Improvement recommendations for underperformers`;

    const document: PropertyDocument = {
      id: uuidv4(),
      type: 'operational',
      content: JSON.stringify(properties, null, 2)
    };

    return this.analyzeDocument(document, prompt);
  }

  // Market analysis helper
  async performMarketAnalysis(propertyData: any, marketData: any): Promise<GeminiAnalysisResult> {
    const prompt = `Perform a market analysis comparing the property performance to market benchmarks.
    Include: competitive position, pricing recommendations, occupancy optimization, and growth opportunities.`;

    const document: PropertyDocument = {
      id: uuidv4(),
      type: 'financial',
      content: JSON.stringify({ property: propertyData, market: marketData }, null, 2)
    };

    return this.analyzeDocument(document, prompt);
  }

  // Helper methods
  private buildCommand(operation: string, inputPath: string): string {
    switch (operation) {
      case 'analyze':
        return `gcloud vertex-ai models predict ` +
               `--region=${this.config.region} ` +
               `--model=${this.config.model} ` +
               `--json-request="${inputPath}"`;
      default:
        return `gemini ${operation} --input="${inputPath}"`;
    }
  }

  private parseOutput(output: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(output);
    } catch {
      // If not JSON, return as structured text
      return {
        text: output.trim(),
        lines: output.trim().split('\n')
      };
    }
  }

  private extractBatchId(output: string): string {
    const match = output.match(/batch-prediction-job-(\d+)/);
    return match ? match[1] : 'unknown';
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Export for use in existing codebase
export default GeminiCLIWrapper;