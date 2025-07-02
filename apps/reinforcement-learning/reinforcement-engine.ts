/**
 * Reinforcement Learning Layer for Prism Intelligence
 * Enables agents to learn and adapt based on user feedback and outcomes
 */

import { ValidatedInsight } from '../logic-layer/agent-wrapper';

// Feedback types
export enum FeedbackType {
  ACCEPT = 'accept',
  REJECT = 'reject',
  IGNORE = 'ignore',
  DELAY = 'delay',
  EDIT = 'edit'
}

// User feedback structure
export interface UserFeedback {
  id: string;
  agentId: string;
  insightId: string;
  feedbackType: FeedbackType;
  timestamp: Date;
  editedContent?: string;
  delayDuration?: number; // minutes until acted upon
  userId: string;
  taskType: string;
}

// Outcome tracking
export interface OutcomeData {
  insightId: string;
  financialDelta?: number;
  resolutionQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  taskCompleted: boolean;
  completionTime?: number; // hours
  actualImpact?: string;
}

// Agent performance metrics
export interface AgentPerformance {
  agentId: string;
  totalInsights: number;
  acceptanceRate: number;
  rejectionRate: number;
  ignoreRate: number;
  editRate: number;
  averageConfidenceAccepted: number;
  averageConfidenceRejected: number;
  financialImpact: number;
  adaptationHistory: AdaptationEntry[];
}

// Adaptation entry
export interface AdaptationEntry {
  timestamp: Date;
  adaptationType: 'timing' | 'tone' | 'confidence' | 'priority';
  previousValue: any;
  newValue: any;
  reason: string;
  improvement: number; // percentage
}

// Learning memory
export interface LearningMemory {
  userId: string;
  agentId: string;
  taskType: string;
  patterns: PatternMemory[];
  preferences: UserPreferences;
  lastUpdated: Date;
}

// Pattern memory
export interface PatternMemory {
  pattern: string;
  occurrences: number;
  avgOutcome: number; // -1 to 1 scale
  lastSeen: Date;
}

// User preferences learned
export interface UserPreferences {
  preferredTiming: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  preferredTone: {
    formal: number;
    casual: number;
    urgent: number;
  };
  confidenceThreshold: number;
  priorityWeights: {
    financial: number;
    compliance: number;
    maintenance: number;
    tenant: number;
  };
}

/**
 * Main Reinforcement Learning Engine
 */
export class ReinforcementLearningEngine {
  private feedbackHistory: Map<string, UserFeedback[]> = new Map();
  private outcomeHistory: Map<string, OutcomeData> = new Map();
  private agentPerformance: Map<string, AgentPerformance> = new Map();
  private learningMemory: Map<string, LearningMemory> = new Map();
  
  // Learning parameters
  private readonly LEARNING_RATE = 0.1;
  private readonly ADAPTATION_THRESHOLD = 0.3;
  private readonly MEMORY_WINDOW = 30; // days
  
  constructor() {
    this.initializeAgentPerformance();
  }

  /**
   * Initialize performance tracking for all agents
   */
  private initializeAgentPerformance() {
    const agents = [
      'InsightGeneratorAgent',
      'PresenterAgent',
      'TaskRecommenderAgent',
      'NotificationAgent'
    ];

    agents.forEach(agentId => {
      this.agentPerformance.set(agentId, {
        agentId,
        totalInsights: 0,
        acceptanceRate: 0,
        rejectionRate: 0,
        ignoreRate: 0,
        editRate: 0,
        averageConfidenceAccepted: 0,
        averageConfidenceRejected: 0,
        financialImpact: 0,
        adaptationHistory: []
      });
    });
  }

  /**
   * Record user feedback on an insight
   */
  async recordFeedback(feedback: UserFeedback): Promise<void> {
    // Store feedback
    const key = `${feedback.userId}_${feedback.agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    history.push(feedback);
    this.feedbackHistory.set(key, history);

    // Update agent performance
    await this.updateAgentPerformance(feedback);

    // Trigger adaptation if needed
    await this.checkAndAdapt(feedback.agentId, feedback.userId);

    console.log(`📊 Feedback recorded: ${feedback.feedbackType} for ${feedback.agentId}`);
  }

  /**
   * Record outcome data for an insight
   */
  async recordOutcome(outcome: OutcomeData): Promise<void> {
    this.outcomeHistory.set(outcome.insightId, outcome);
    
    // Update financial impact if available
    if (outcome.financialDelta) {
      await this.updateFinancialImpact(outcome);
    }
  }

  /**
   * Update agent performance metrics
   */
  private async updateAgentPerformance(feedback: UserFeedback): Promise<void> {
    const performance = this.agentPerformance.get(feedback.agentId);
    if (!performance) return;

    performance.totalInsights++;

    // Update rates using exponential moving average
    const alpha = 0.1; // smoothing factor
    const isAccept = feedback.feedbackType === FeedbackType.ACCEPT ? 1 : 0;
    const isReject = feedback.feedbackType === FeedbackType.REJECT ? 1 : 0;
    const isIgnore = feedback.feedbackType === FeedbackType.IGNORE ? 1 : 0;
    const isEdit = feedback.feedbackType === FeedbackType.EDIT ? 1 : 0;

    performance.acceptanceRate = (1 - alpha) * performance.acceptanceRate + alpha * isAccept;
    performance.rejectionRate = (1 - alpha) * performance.rejectionRate + alpha * isReject;
    performance.ignoreRate = (1 - alpha) * performance.ignoreRate + alpha * isIgnore;
    performance.editRate = (1 - alpha) * performance.editRate + alpha * isEdit;

    this.agentPerformance.set(feedback.agentId, performance);
  }

  /**
   * Check if agent needs adaptation based on performance
   */
  private async checkAndAdapt(agentId: string, userId: string): Promise<void> {
    const performance = this.agentPerformance.get(agentId);
    if (!performance) return;

    // Adaptation triggers
    const needsTimingAdaptation = performance.ignoreRate > this.ADAPTATION_THRESHOLD;
    const needsToneAdaptation = performance.editRate > this.ADAPTATION_THRESHOLD;
    const needsConfidenceAdaptation = performance.rejectionRate > this.ADAPTATION_THRESHOLD;
    const needsPriorityAdaptation = performance.acceptanceRate < (1 - this.ADAPTATION_THRESHOLD);

    if (needsTimingAdaptation) {
      await this.adaptTiming(agentId, userId);
    }
    
    if (needsToneAdaptation) {
      await this.adaptTone(agentId, userId);
    }
    
    if (needsConfidenceAdaptation) {
      await this.adaptConfidence(agentId, userId);
    }
    
    if (needsPriorityAdaptation) {
      await this.adaptPriority(agentId, userId);
    }
  }

  /**
   * Adapt timing based on when users actually act on insights
   */
  private async adaptTiming(agentId: string, userId: string): Promise<void> {
    const key = `${userId}_${agentId}`;
    const feedbackHistory = this.feedbackHistory.get(key) || [];
    
    // Analyze when accepted insights were acted upon
    const acceptedWithTiming = feedbackHistory
      .filter(f => f.feedbackType === FeedbackType.ACCEPT)
      .map(f => new Date(f.timestamp).getHours());
    
    if (acceptedWithTiming.length === 0) return;

    // Calculate preferred times
    const timePreferences = {
      morning: 0,
      afternoon: 0,
      evening: 0
    };

    acceptedWithTiming.forEach(hour => {
      if (hour >= 6 && hour < 12) timePreferences.morning++;
      else if (hour >= 12 && hour < 18) timePreferences.afternoon++;
      else timePreferences.evening++;
    });

    // Normalize
    const total = acceptedWithTiming.length;
    Object.keys(timePreferences).forEach(key => {
      timePreferences[key as keyof typeof timePreferences] /= total;
    });

    // Update memory
    const memory = this.getOrCreateMemory(userId, agentId, 'general');
    memory.preferences.preferredTiming = timePreferences;
    
    // Log adaptation
    const performance = this.agentPerformance.get(agentId)!;
    performance.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'timing',
      previousValue: 'uniform',
      newValue: timePreferences,
      reason: 'High ignore rate detected',
      improvement: 0 // Will be calculated after next cycle
    });

    console.log(`⏰ Adapted timing for ${agentId}: Preferred ${JSON.stringify(timePreferences)}`);
  }

  /**
   * Adapt tone based on user edits
   */
  private async adaptTone(agentId: string, userId: string): Promise<void> {
    const key = `${userId}_${agentId}`;
    const feedbackHistory = this.feedbackHistory.get(key) || [];
    
    // Analyze edits to understand tone preferences
    const edits = feedbackHistory
      .filter(f => f.feedbackType === FeedbackType.EDIT && f.editedContent);
    
    if (edits.length === 0) return;

    // Simple tone analysis (in production, use NLP)
    const tonePreferences = {
      formal: 0,
      casual: 0,
      urgent: 0
    };

    edits.forEach(edit => {
      const content = edit.editedContent!.toLowerCase();
      if (content.includes('please') || content.includes('kindly')) {
        tonePreferences.formal++;
      } else if (content.includes('asap') || content.includes('urgent')) {
        tonePreferences.urgent++;
      } else {
        tonePreferences.casual++;
      }
    });

    // Normalize
    const total = edits.length;
    Object.keys(tonePreferences).forEach(key => {
      tonePreferences[key as keyof typeof tonePreferences] /= total;
    });

    // Update memory
    const memory = this.getOrCreateMemory(userId, agentId, 'general');
    memory.preferences.preferredTone = tonePreferences;

    console.log(`💬 Adapted tone for ${agentId}: ${JSON.stringify(tonePreferences)}`);
  }

  /**
   * Adapt confidence thresholds based on acceptance patterns
   */
  private async adaptConfidence(agentId: string, userId: string): Promise<void> {
    const performance = this.agentPerformance.get(agentId);
    if (!performance) return;

    // Calculate optimal confidence threshold
    const currentThreshold = 0.7; // default
    const acceptanceTarget = 0.7; // target 70% acceptance
    
    // Adjust threshold based on current performance
    let newThreshold = currentThreshold;
    if (performance.acceptanceRate < acceptanceTarget) {
      // Increase threshold (be more selective)
      newThreshold = Math.min(0.95, currentThreshold + this.LEARNING_RATE);
    } else if (performance.acceptanceRate > acceptanceTarget + 0.1) {
      // Decrease threshold (be less selective)
      newThreshold = Math.max(0.5, currentThreshold - this.LEARNING_RATE);
    }

    // Update memory
    const memory = this.getOrCreateMemory(userId, agentId, 'general');
    memory.preferences.confidenceThreshold = newThreshold;

    // Log adaptation
    performance.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'confidence',
      previousValue: currentThreshold,
      newValue: newThreshold,
      reason: `Acceptance rate: ${(performance.acceptanceRate * 100).toFixed(0)}%`,
      improvement: 0
    });

    console.log(`🎯 Adapted confidence for ${agentId}: ${currentThreshold} → ${newThreshold}`);
  }

  /**
   * Adapt priority weights based on what users act on
   */
  private async adaptPriority(agentId: string, userId: string): Promise<void> {
    const key = `${userId}_${agentId}`;
    const feedbackHistory = this.feedbackHistory.get(key) || [];
    
    // Analyze accepted insights by task type
    const acceptedByType: Record<string, number> = {};
    
    feedbackHistory
      .filter(f => f.feedbackType === FeedbackType.ACCEPT)
      .forEach(f => {
        acceptedByType[f.taskType] = (acceptedByType[f.taskType] || 0) + 1;
      });
    
    // Calculate weights
    const total = Object.values(acceptedByType).reduce((sum, count) => sum + count, 0);
    if (total === 0) return;

    const weights = {
      financial: (acceptedByType['financial'] || 0) / total,
      compliance: (acceptedByType['compliance'] || 0) / total,
      maintenance: (acceptedByType['maintenance'] || 0) / total,
      tenant: (acceptedByType['tenant'] || 0) / total
    };

    // Update memory
    const memory = this.getOrCreateMemory(userId, agentId, 'general');
    memory.preferences.priorityWeights = weights;

    console.log(`⚖️ Adapted priority for ${agentId}: ${JSON.stringify(weights)}`);
  }

  /**
   * Update financial impact tracking
   */
  private async updateFinancialImpact(outcome: OutcomeData): Promise<void> {
    if (!outcome.financialDelta) return;

    // Find which agent generated this insight
    // (In production, this would be tracked properly)
    this.agentPerformance.forEach((performance, agentId) => {
      performance.financialImpact += outcome.financialDelta!;
    });
  }

  /**
   * Get or create learning memory for user-agent-task combination
   */
  private getOrCreateMemory(userId: string, agentId: string, taskType: string): LearningMemory {
    const key = `${userId}_${agentId}_${taskType}`;
    let memory = this.learningMemory.get(key);
    
    if (!memory) {
      memory = {
        userId,
        agentId,
        taskType,
        patterns: [],
        preferences: {
          preferredTiming: { morning: 0.33, afternoon: 0.33, evening: 0.34 },
          preferredTone: { formal: 0.5, casual: 0.3, urgent: 0.2 },
          confidenceThreshold: 0.7,
          priorityWeights: { financial: 0.25, compliance: 0.25, maintenance: 0.25, tenant: 0.25 }
        },
        lastUpdated: new Date()
      };
      this.learningMemory.set(key, memory);
    }
    
    return memory;
  }

  /**
   * Get agent's current adapted parameters
   */
  getAgentAdaptations(agentId: string, userId: string, taskType: string = 'general'): UserPreferences {
    const memory = this.getOrCreateMemory(userId, agentId, taskType);
    return memory.preferences;
  }

  /**
   * Get agent performance report
   */
  getAgentPerformanceReport(agentId: string): AgentPerformance | undefined {
    return this.agentPerformance.get(agentId);
  }

  /**
   * Generate learning summary for UI
   */
  generateLearningSummary(): {
    overallImprovement: number;
    topPerformingAgent: string;
    recentAdaptations: AdaptationEntry[];
    keyInsights: string[];
  } {
    let totalImprovement = 0;
    let topAgent = '';
    let topAcceptance = 0;
    const allAdaptations: AdaptationEntry[] = [];

    this.agentPerformance.forEach((performance, agentId) => {
      if (performance.acceptanceRate > topAcceptance) {
        topAcceptance = performance.acceptanceRate;
        topAgent = agentId;
      }
      
      // Calculate improvement from adaptations
      performance.adaptationHistory.forEach(adaptation => {
        totalImprovement += adaptation.improvement;
        allAdaptations.push(adaptation);
      });
    });

    // Sort adaptations by recency
    allAdaptations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Generate insights
    const insights: string[] = [];
    
    if (topAcceptance > 0.8) {
      insights.push(`${topAgent} has achieved ${(topAcceptance * 100).toFixed(0)}% acceptance rate`);
    }
    
    const avgFinancialImpact = Array.from(this.agentPerformance.values())
      .reduce((sum, p) => sum + p.financialImpact, 0) / this.agentPerformance.size;
    
    if (avgFinancialImpact > 0) {
      insights.push(`Average financial impact: $${avgFinancialImpact.toFixed(2)}`);
    }

    return {
      overallImprovement: totalImprovement / Math.max(1, allAdaptations.length),
      topPerformingAgent: topAgent,
      recentAdaptations: allAdaptations.slice(0, 5),
      keyInsights: insights
    };
  }

  /**
   * Apply learned preferences to new insight generation
   */
  applyLearnedPreferences(
    insight: ValidatedInsight,
    userId: string
  ): ValidatedInsight {
    const preferences = this.getAgentAdaptations(insight.agentName, userId);
    
    // Apply confidence filter
    if (insight.confidence && insight.confidence < preferences.confidenceThreshold) {
      // Don't show low-confidence insights
      return { ...insight, suppressed: true };
    }

    // Apply timing preferences
    const currentHour = new Date().getHours();
    let timingScore = 0;
    if (currentHour >= 6 && currentHour < 12) {
      timingScore = preferences.preferredTiming.morning;
    } else if (currentHour >= 12 && currentHour < 18) {
      timingScore = preferences.preferredTiming.afternoon;
    } else {
      timingScore = preferences.preferredTiming.evening;
    }

    // Adjust priority based on learned preferences and timing
    const taskType = this.inferTaskType(insight);
    const priorityWeight = preferences.priorityWeights[taskType as keyof typeof preferences.priorityWeights] || 0.25;
    
    return {
      ...insight,
      adjustedPriority: (insight.confidence || 0.5) * priorityWeight * timingScore,
      appliedPreferences: preferences
    };
  }

  /**
   * Infer task type from insight
   */
  private inferTaskType(insight: ValidatedInsight): string {
    const conclusion = insight.conclusion.toLowerCase();
    
    if (conclusion.includes('financial') || conclusion.includes('cost') || conclusion.includes('revenue')) {
      return 'financial';
    } else if (conclusion.includes('compliance') || conclusion.includes('legal') || conclusion.includes('covenant')) {
      return 'compliance';
    } else if (conclusion.includes('maintenance') || conclusion.includes('repair')) {
      return 'maintenance';
    } else if (conclusion.includes('tenant')) {
      return 'tenant';
    }
    
    return 'general';
  }
}

// Extend ValidatedInsight type
declare module '../logic-layer/agent-wrapper' {
  interface ValidatedInsight {
    suppressed?: boolean;
    adjustedPriority?: number;
    appliedPreferences?: UserPreferences;
  }
}

// Export singleton instance
export const reinforcementLearning = new ReinforcementLearningEngine();
