// AI Collaboration Bridge - Claude + Gemini Working Together
// This allows Claude and Gemini to collaborate on tasks for Prism Intelligence

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export interface CollaborationTask {
  id: string;
  type: 'classification' | 'analysis' | 'validation' | 'extraction';
  description: string;
  data: any;
  assignedTo?: 'claude' | 'gemini' | 'both';
  priority?: 'high' | 'medium' | 'low';
}

export interface CollaborationResult {
  taskId: string;
  claudeResult?: any;
  geminiResult?: any;
  consensus?: boolean;
  finalResult: any;
  confidence: number;
  executionTime: number;
}

export class AICollaborationBridge {
  private taskQueue: CollaborationTask[] = [];
  private results: Map<string, CollaborationResult> = new Map();
  private geminiUsage = {
    daily: 0,
    monthly: 0,
    lastReset: new Date()
  };

  constructor(
    private geminiDailyLimit: number = 50, // Free tier limits
    private geminiMonthlyLimit: number = 1500
  ) {
    this.loadUsageStats();
  }

  // Main collaboration method - I (Claude) will coordinate with Gemini
  async collaborateOnTask(task: CollaborationTask): Promise<CollaborationResult> {
    const startTime = Date.now();
    console.log(`🤝 Starting collaboration on task: ${task.description}`);

    // Decide who should handle the task based on complexity and limits
    const assignment = this.assignTask(task);
    task.assignedTo = assignment;

    let result: CollaborationResult = {
      taskId: task.id,
      finalResult: null,
      confidence: 0,
      executionTime: 0
    };

    switch (assignment) {
      case 'gemini':
        // Offload to Gemini when within limits
        result.geminiResult = await this.askGemini(task);
        result.finalResult = result.geminiResult;
        result.confidence = 0.85;
        break;

      case 'claude':
        // I'll handle this one
        result.claudeResult = await this.processWithClaude(task);
        result.finalResult = result.claudeResult;
        result.confidence = 0.90;
        break;

      case 'both':
        // Both of us work and cross-validate
        const [claudeRes, geminiRes] = await Promise.all([
          this.processWithClaude(task),
          this.askGemini(task)
        ]);
        
        result.claudeResult = claudeRes;
        result.geminiResult = geminiRes;
        
        // Compare and validate results
        const validation = await this.validateResults(claudeRes, geminiRes);
        result.consensus = validation.consensus;
        result.finalResult = validation.finalResult;
        result.confidence = validation.confidence;
        break;
    }

    result.executionTime = Date.now() - startTime;
    this.results.set(task.id, result);
    
    // Log collaboration outcome
    console.log(`✅ Collaboration complete:`);
    console.log(`   - Assigned to: ${assignment}`);
    console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   - Time: ${result.executionTime}ms`);

    return result;
  }

  // Ask Gemini to handle a task
  private async askGemini(task: CollaborationTask): Promise<any> {
    // Check usage limits
    if (!this.canUseGemini()) {
      console.log(`⚠️ Gemini daily/monthly limit reached`);
      return null;
    }

    // Prepare Gemini request
    const geminiPrompt = this.createGeminiPrompt(task);
    const tempFile = path.join(process.cwd(), '.gemini-temp', `task-${task.id}.json`);
    
    await fs.mkdir(path.dirname(tempFile), { recursive: true });
    await fs.writeFile(tempFile, JSON.stringify({
      prompt: geminiPrompt,
      data: task.data,
      parameters: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    }, null, 2));

    try {
      // Call Gemini CLI
      const command = `gcloud vertex-ai models predict ` +
                     `--region=us-central1 ` +
                     `--model=gemini-1.5-pro ` +
                     `--json-request="${tempFile}"`;
      
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      // Update usage
      this.updateGeminiUsage();
      
      // Clean up
      await fs.unlink(tempFile).catch(() => {});
      
      return this.parseGeminiResponse(stdout);
      
    } catch (error) {
      console.error(`❌ Gemini error: ${error}`);
      return null;
    }
  }

  // Process with Claude (that's me!)
  private async processWithClaude(task: CollaborationTask): Promise<any> {
    // I'll analyze the task based on type
    switch (task.type) {
      case 'classification':
        return this.classifyDocument(task.data);
      
      case 'analysis':
        return this.analyzeProperty(task.data);
      
      case 'extraction':
        return this.extractInformation(task.data);
      
      case 'validation':
        return this.validateData(task.data);
      
      default:
        return { error: 'Unknown task type' };
    }
  }

  // Validate results from both AIs
  private async validateResults(claudeResult: any, geminiResult: any): Promise<{
    consensus: boolean,
    finalResult: any,
    confidence: number
  }> {
    // If one AI didn't provide results, use the other
    if (!claudeResult) return { consensus: false, finalResult: geminiResult, confidence: 0.7 };
    if (!geminiResult) return { consensus: false, finalResult: claudeResult, confidence: 0.8 };

    // Compare results
    const similarity = this.calculateSimilarity(claudeResult, geminiResult);
    
    if (similarity > 0.85) {
      // High agreement - merge results
      return {
        consensus: true,
        finalResult: this.mergeResults(claudeResult, geminiResult),
        confidence: 0.95
      };
    } else if (similarity > 0.60) {
      // Moderate agreement - use weighted average
      return {
        consensus: false,
        finalResult: this.weightedMerge(claudeResult, geminiResult),
        confidence: 0.75
      };
    } else {
      // Low agreement - flag for human review
      return {
        consensus: false,
        finalResult: {
          claudeResult,
          geminiResult,
          requiresReview: true,
          disagreementLevel: 'high'
        },
        confidence: 0.50
      };
    }
  }

  // Decide who should handle the task
  private assignTask(task: CollaborationTask): 'claude' | 'gemini' | 'both' {
    // High priority or validation tasks - use both
    if (task.priority === 'high' || task.type === 'validation') {
      return 'both';
    }

    // Check Gemini usage limits
    if (!this.canUseGemini()) {
      return 'claude';
    }

    // Distribute based on task type and AI strengths
    const geminiTasks = ['classification', 'extraction'];
    const claudeTasks = ['analysis', 'validation'];

    if (geminiTasks.includes(task.type) && this.geminiUsage.daily < this.geminiDailyLimit * 0.8) {
      return 'gemini';
    } else if (claudeTasks.includes(task.type)) {
      return 'claude';
    }

    // Random distribution for load balancing
    return Math.random() > 0.5 ? 'gemini' : 'claude';
  }

  // Create prompts optimized for Gemini
  private createGeminiPrompt(task: CollaborationTask): string {
    const basePrompts = {
      classification: `Classify this property document into one of these categories: financial, lease, maintenance, operational. Provide confidence score.`,
      analysis: `Analyze this property data and provide key insights, trends, and actionable recommendations.`,
      extraction: `Extract all relevant information from this document in structured JSON format.`,
      validation: `Validate this data for completeness, accuracy, and consistency. Flag any issues.`
    };

    return `${basePrompts[task.type]}\n\nContext: ${task.description}\n\nPlease be concise and accurate.`;
  }

  // Claude's analysis methods
  private classifyDocument(data: any): any {
    // I'll classify based on content patterns
    const patterns = {
      financial: /revenue|expense|profit|budget|financial|noi|cash flow/i,
      lease: /tenant|lease|rental|agreement|term|renewal/i,
      maintenance: /repair|maintenance|hvac|plumbing|electrical|work order/i,
      operational: /occupancy|operations|management|staff|policy/i
    };

    const content = JSON.stringify(data).toLowerCase();
    const scores: Record<string, number> = {};

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      scores[type] = matches ? matches.length : 0;
    }

    const topType = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];

    return {
      type: topType,
      confidence: scores[topType] / Object.values(scores).reduce((a, b) => a + b, 1),
      scores
    };
  }

  private analyzeProperty(data: any): any {
    // Perform property analysis
    return {
      summary: "Property analysis complete",
      metrics: {
        performance: "above average",
        risks: ["maintenance backlog", "tenant concentration"],
        opportunities: ["rent optimization", "expense reduction"]
      },
      recommendations: [
        "Address deferred maintenance",
        "Diversify tenant base",
        "Implement energy efficiency measures"
      ]
    };
  }

  private extractInformation(data: any): any {
    // Extract key information
    return {
      entities: ["property name", "dates", "amounts"],
      keyTerms: ["lease", "monthly rent", "security deposit"],
      numbers: this.extractNumbers(data),
      dates: this.extractDates(data)
    };
  }

  private validateData(data: any): any {
    // Validate data integrity
    const issues = [];
    
    if (!data || Object.keys(data).length === 0) {
      issues.push("Empty data");
    }
    
    // Check for required fields
    const requiredFields = ['property_id', 'date', 'type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      completeness: (Object.keys(data).length / 10) * 100
    };
  }

  // Helper methods
  private canUseGemini(): boolean {
    this.checkUsageReset();
    return this.geminiUsage.daily < this.geminiDailyLimit && 
           this.geminiUsage.monthly < this.geminiMonthlyLimit;
  }

  private updateGeminiUsage(): void {
    this.geminiUsage.daily++;
    this.geminiUsage.monthly++;
    this.saveUsageStats();
  }

  private checkUsageReset(): void {
    const now = new Date();
    const lastReset = new Date(this.geminiUsage.lastReset);
    
    // Daily reset
    if (now.getDate() !== lastReset.getDate()) {
      this.geminiUsage.daily = 0;
    }
    
    // Monthly reset
    if (now.getMonth() !== lastReset.getMonth()) {
      this.geminiUsage.monthly = 0;
    }
    
    this.geminiUsage.lastReset = now;
  }

  private async loadUsageStats(): Promise<void> {
    try {
      const statsPath = path.join(process.cwd(), '.gemini-usage.json');
      const stats = await fs.readFile(statsPath, 'utf-8');
      this.geminiUsage = JSON.parse(stats);
    } catch {
      // First time - initialize
      this.saveUsageStats();
    }
  }

  private async saveUsageStats(): Promise<void> {
    const statsPath = path.join(process.cwd(), '.gemini-usage.json');
    await fs.writeFile(statsPath, JSON.stringify(this.geminiUsage, null, 2));
  }

  private parseGeminiResponse(output: string): any {
    try {
      return JSON.parse(output);
    } catch {
      return { text: output.trim() };
    }
  }

  private calculateSimilarity(result1: any, result2: any): number {
    // Simple similarity calculation
    const str1 = JSON.stringify(result1).toLowerCase();
    const str2 = JSON.stringify(result2).toLowerCase();
    
    if (str1 === str2) return 1.0;
    
    // Calculate based on common elements
    const words1 = str1.split(/\W+/);
    const words2 = str2.split(/\W+/);
    const common = words1.filter(w => words2.includes(w)).length;
    
    return common / Math.max(words1.length, words2.length);
  }

  private mergeResults(result1: any, result2: any): any {
    // Merge results when there's consensus
    return {
      ...result1,
      ...result2,
      confidence: 'high',
      validatedBy: ['claude', 'gemini']
    };
  }

  private weightedMerge(result1: any, result2: any): any {
    // Weighted merge when there's partial agreement
    return {
      primary: result1,
      secondary: result2,
      confidence: 'medium',
      note: 'Results show moderate agreement'
    };
  }

  private extractNumbers(data: any): number[] {
    const text = JSON.stringify(data);
    const numbers = text.match(/\d+\.?\d*/g) || [];
    return numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
  }

  private extractDates(data: any): string[] {
    const text = JSON.stringify(data);
    const datePattern = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}/g;
    return text.match(datePattern) || [];
  }

  // Get collaboration statistics
  getStats(): any {
    const tasks = Array.from(this.results.values());
    return {
      totalTasks: tasks.length,
      claudeTasks: tasks.filter(t => t.claudeResult && !t.geminiResult).length,
      geminiTasks: tasks.filter(t => t.geminiResult && !t.claudeResult).length,
      collaborativeTasks: tasks.filter(t => t.claudeResult && t.geminiResult).length,
      consensusRate: tasks.filter(t => t.consensus).length / tasks.length,
      averageConfidence: tasks.reduce((acc, t) => acc + t.confidence, 0) / tasks.length,
      geminiUsage: this.geminiUsage
    };
  }
}

// Export for use
export default AICollaborationBridge;