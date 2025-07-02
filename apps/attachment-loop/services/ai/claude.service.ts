import Anthropic from '@anthropic-ai/sdk';
import logger from '../../utils/logger';

export class ClaudeService {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-anthropic-api-key') {
      logger.warn('⚠️  ANTHROPIC_API_KEY not configured - Claude service disabled');
      return;
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    logger.info('✅ Claude service initialized');
  }

  /**
   * Analyze property management document with Claude
   */
  async analyzePropertyDocument(
    fileContent: string, 
    fileName: string,
    documentType: string
  ): Promise<PropertyInsights> {
    if (!this.anthropic) {
      logger.warn('Claude service not initialized - returning mock insights');
      return this.getMockInsights(documentType);
    }
    
    try {
      logger.info(`🧠 [Claude] Analyzing ${fileName}...`);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: this.buildAnalysisPrompt(fileContent, fileName, documentType)
        }]
      });

      const response = message.content[0].text;
      const insights = this.parseInsights(response);
      
      // Enrich tasks with additional context
      insights.tasks = this.enrichTasks(insights);
      
      // Log task generation
      if (insights.tasks && insights.tasks.length > 0) {
        logger.info(`📋 [Claude] Generated ${insights.tasks.length} actionable tasks`);
        insights.tasks.forEach((task, index) => {
          logger.info(`  Task ${index + 1}: ${task.title} (Priority: ${task.priority}, Due: ${task.dueDate})`);
        });
        
        // Calculate and log total potential value
        const totalValue = insights.tasks.reduce((sum, task) => sum + task.potentialValue, 0);
        logger.info(`💰 Total Potential Value: $${totalValue.toLocaleString()}`);
      }
      
      logger.info(`✅ [Claude] Analysis complete for ${fileName}`);
      return insights;
      
    } catch (error) {
      logger.error(`❌ [Claude] Analysis failed:`, error);
      throw error;
    }
  }

  private buildAnalysisPrompt(content: string, fileName: string, docType: string): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `You are an expert property management analyst. Analyze this ${docType} and provide actionable insights with specific tasks.

FILE: ${fileName}
CONTENT:
${content}

Provide analysis in this exact JSON format:
{
  "summary": "Brief 2-3 sentence executive summary",
  "keyMetrics": {
    "metricName": { "value": number, "trend": "up|down|stable", "analysis": "brief insight" }
  },
  "insights": [
    { "priority": "high|medium|low", "insight": "specific observation", "impact": "business impact" }
  ],
  "actions": [
    { "priority": 1-5, "action": "specific recommendation", "expectedOutcome": "result" }
  ],
  "risks": [
    { "severity": "high|medium|low", "risk": "identified risk", "mitigation": "recommendation" }
  ],
  "tasks": [
    {
      "title": "Specific action that needs to be taken (clear and concise)",
      "description": "Detailed step-by-step instructions for completing this task",
      "priority": 1-5 (1=urgent, 5=low priority),
      "assignedRole": "CFO|PropertyManager|Maintenance|Accounting|Leasing",
      "dueDate": "ISO date string (calculate based on urgency, today is ${currentDate})",
      "estimatedHours": number (realistic estimate to complete),
      "potentialValue": number (estimated dollar value or cost savings),
      "sourceInsight": "Which specific insight or metric triggered this task"
    }
  ]
}

IMPORTANT TASK GENERATION RULES:
1. Convert EVERY high-priority insight into at least one specific, actionable task
2. Due date assignment based on urgency:
   - URGENT (safety, legal, overdue payments): 1-2 days from today
   - HIGH PRIORITY (significant financial impact): 3-5 days from today
   - MEDIUM PRIORITY (optimization opportunities): 1-2 weeks from today
   - LOW PRIORITY (strategic improvements): 2-4 weeks from today
3. Role assignment guide:
   - CFO: Budget variances >$10k, strategic decisions, financial approvals
   - PropertyManager: Vendor issues, tenant complaints, operational decisions
   - Maintenance: All repair work, inspections, preventive maintenance
   - Accounting: Collections, payment processing, financial reporting
   - Leasing: Vacancies, renewals, marketing, tenant screening
4. Task titles must be action-oriented (start with a verb)
5. Descriptions must include numbered steps (at least 3-5 steps)
6. Hours estimation:
   - Simple tasks (phone calls, emails): 0.5-1 hours
   - Moderate tasks (analysis, meetings): 2-4 hours  
   - Complex tasks (projects, implementations): 8-40 hours
7. Potential value calculation:
   - Cost savings: Use actual amounts from the document
   - Revenue opportunities: Calculate based on metrics (e.g., vacancy × rent)
   - Risk mitigation: Estimate cost of inaction
8. CRITICAL: Create tasks for ALL high-priority items, not just some`;
  }

  private parseInsights(response: string): PropertyInsights {
    try {
      // Extract JSON from response (Claude might add text around it)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Ensure tasks array exists
      if (!parsed.tasks) {
        parsed.tasks = [];
      }
      
      return parsed;
    } catch (error) {
      logger.error('Failed to parse Claude response:', error);
      // Return a default structure if parsing fails
      return {
        summary: response.substring(0, 200),
        keyMetrics: {},
        insights: [{ priority: 'medium', insight: response, impact: 'Analysis completed' }],
        actions: [{ priority: 1, action: 'Review full analysis', expectedOutcome: 'Better understanding' }],
        risks: [],
        tasks: []
      };
    }
  }

  private getMockInsights(documentType: string): PropertyInsights {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      summary: `Mock analysis for ${documentType} - Claude API not configured`,
      keyMetrics: {
        "Status": { value: 0, trend: "stable", analysis: "Using mock data" }
      },
      insights: [
        { priority: 'high', insight: 'Configure ANTHROPIC_API_KEY for real analysis', impact: 'Required for production' }
      ],
      actions: [
        { priority: 1, action: 'Add API key to .env file', expectedOutcome: 'Enable AI analysis' }
      ],
      risks: [],
      tasks: [
        {
          title: "Configure Claude API Key",
          description: "1. Get API key from Anthropic Console\n2. Add to .env file\n3. Restart the service",
          priority: 1,
          assignedRole: "PropertyManager",
          dueDate: tomorrow.toISOString(),
          estimatedHours: 0.5,
          potentialValue: 0,
          sourceInsight: "API configuration required for AI analysis"
        }
      ]
    };
  }

  /**
   * Enrich tasks with additional validation and ensure high-priority insights have tasks
   */
  private enrichTasks(insights: PropertyInsights): TaskItem[] {
    const tasks = insights.tasks || [];
    
    // Ensure every high-priority insight has at least one task
    insights.insights
      .filter(insight => insight.priority === 'high')
      .forEach(insight => {
        const hasTask = tasks.some(task => task.sourceInsight.includes(insight.insight));
        
        if (!hasTask) {
          // Generate a task for this high-priority insight
          tasks.push(this.generateTaskFromInsight(insight));
        }
      });
    
    // Validate and enrich all tasks
    return tasks.map(task => ({
      ...task,
      // Ensure valid date
      dueDate: this.validateDueDate(task.dueDate, task.priority),
      // Ensure reasonable hours
      estimatedHours: Math.max(0.5, Math.min(task.estimatedHours, 40)),
      // Ensure non-negative value
      potentialValue: Math.max(0, task.potentialValue)
    }));
  }
  
  /**
   * Generate a task from a high-priority insight that doesn't have one
   */
  private generateTaskFromInsight(insight: InsightItem): TaskItem {
    const urgency = this.determineUrgency(insight.insight);
    const role = this.determineRole(insight.insight);
    
    return {
      title: `Address: ${insight.insight.substring(0, 50)}...`,
      description: `Investigation and action required for: ${insight.insight}\n\nExpected Impact: ${insight.impact}`,
      priority: urgency.priority,
      assignedRole: role,
      dueDate: urgency.dueDate,
      estimatedHours: 2,
      potentialValue: this.estimateValue(insight.impact),
      sourceInsight: insight.insight
    };
  }
  
  /**
   * Validate and correct due dates based on priority
   */
  private validateDueDate(dueDate: string, priority: number): string {
    const date = new Date(dueDate);
    const today = new Date();
    const maxDays = priority <= 2 ? 3 : priority <= 3 ? 14 : 30;
    
    // Ensure date is valid and not in the past
    if (isNaN(date.getTime()) || date < today) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + Math.min(priority, maxDays));
      return newDate.toISOString();
    }
    
    // Ensure date is not too far in the future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    if (date > maxDate) {
      return maxDate.toISOString();
    }
    
    return dueDate;
  }
  
  /**
   * Determine urgency based on keywords in insight
   */
  private determineUrgency(insight: string): { priority: number; dueDate: string } {
    const lowerInsight = insight.toLowerCase();
    const today = new Date();
    
    if (lowerInsight.includes('urgent') || lowerInsight.includes('immediate') || 
        lowerInsight.includes('critical') || lowerInsight.includes('overdue')) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 1);
      return { priority: 1, dueDate: dueDate.toISOString() };
    }
    
    if (lowerInsight.includes('high') || lowerInsight.includes('significant') || 
        lowerInsight.includes('important')) {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 3);
      return { priority: 2, dueDate: dueDate.toISOString() };
    }
    
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 7);
    return { priority: 3, dueDate: dueDate.toISOString() };
  }
  
  /**
   * Determine appropriate role based on task content
   */
  private determineRole(insight: string): 'CFO' | 'PropertyManager' | 'Maintenance' | 'Accounting' | 'Leasing' {
    const lowerInsight = insight.toLowerCase();
    
    if (lowerInsight.includes('budget') || lowerInsight.includes('financial') || 
        lowerInsight.includes('investment') || lowerInsight.includes('strategic')) {
      return 'CFO';
    }
    
    if (lowerInsight.includes('repair') || lowerInsight.includes('maintenance') || 
        lowerInsight.includes('hvac') || lowerInsight.includes('plumbing')) {
      return 'Maintenance';
    }
    
    if (lowerInsight.includes('payment') || lowerInsight.includes('invoice') || 
        lowerInsight.includes('collection') || lowerInsight.includes('accounting')) {
      return 'Accounting';
    }
    
    if (lowerInsight.includes('lease') || lowerInsight.includes('tenant') || 
        lowerInsight.includes('vacancy') || lowerInsight.includes('renewal')) {
      return 'Leasing';
    }
    
    return 'PropertyManager'; // Default role
  }
  
  /**
   * Estimate potential value from impact description
   */
  private estimateValue(impact: string): number {
    const lowerImpact = impact.toLowerCase();
    
    // Look for specific dollar amounts
    const dollarMatch = lowerImpact.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (dollarMatch) {
      return parseFloat(dollarMatch[1].replace(/,/g, ''));
    }
    
    // Look for percentage savings
    const percentMatch = lowerImpact.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      // Assume a base monthly revenue of $100k for percentage calculations
      return Math.round((100000 * percent) / 100);
    }
    
    // Default estimates based on keywords
    if (lowerImpact.includes('significant') || lowerImpact.includes('major')) {
      return 10000;
    }
    if (lowerImpact.includes('moderate') || lowerImpact.includes('medium')) {
      return 5000;
    }
    if (lowerImpact.includes('minor') || lowerImpact.includes('small')) {
      return 1000;
    }
    
    return 2500; // Default value
  }
}

// Types
export interface PropertyInsights {
  summary: string;
  keyMetrics: Record<string, MetricData>;
  insights: InsightItem[];
  actions: ActionItem[];
  risks: RiskItem[];
  tasks: TaskItem[];
}

interface MetricData {
  value: number;
  trend: 'up' | 'down' | 'stable';
  analysis: string;
}

interface InsightItem {
  priority: 'high' | 'medium' | 'low';
  insight: string;
  impact: string;
}

interface ActionItem {
  priority: number;
  action: string;
  expectedOutcome: string;
}

interface RiskItem {
  severity: 'high' | 'medium' | 'low';
  risk: string;
  mitigation: string;
}

interface TaskItem {
  title: string;
  description: string;
  priority: number;
  assignedRole: 'CFO' | 'PropertyManager' | 'Maintenance' | 'Accounting' | 'Leasing';
  dueDate: string;
  estimatedHours: number;
  potentialValue: number;
  sourceInsight: string;
}

// Export singleton
export const claudeService = new ClaudeService();
