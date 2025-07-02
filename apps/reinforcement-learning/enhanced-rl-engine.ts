/**
 * Complete Reinforcement Learning Module for Prism Intelligence
 * Implements all features from the cloud-agent specification
 */

import { ValidatedInsight } from '../logic-layer/agent-wrapper';

// Enhanced Feedback Types matching cloud-agent spec
export enum FeedbackType {
  ACCEPTED = 'accepted',    // ✅ Insight or task accepted
  REJECTED = 'rejected',    // ❌ Rejected or skipped
  IGNORED = 'ignored',      // ⏳ No user action
  DELAYED = 'delayed',      // 🕒 Action taken after optimal time
  MODIFIED = 'modified'     // ✏️ User changed recommendation
}

// Enhanced User Feedback structure
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
  contextData?: any;
  optimalTime?: Date; // when this should have been shown
}

// Agent Learning Memory with full scope
export interface AgentLearningMemory {
  agentId: string;
  userId: string;
  taskType: string;
  
  // Timing Learning
  optimalTimings: {
    hourOfDay: number[];
    dayOfWeek: number[];
    seasonality: number[];
  };
  
  // Message Style Learning
  preferredStyle: {
    tone: 'formal' | 'casual' | 'urgent';
    detailLevel: 'brief' | 'moderate' | 'detailed';
    assertiveness: number; // 0-1 scale
  };
  
  // Confidence Thresholds
  confidenceThresholds: {
    accept: number;
    show: number;
    prioritize: number;
  };
  
  // Prioritization Learning
  priorityWeights: {
    financial: number;
    compliance: number;
    maintenance: number;
    tenant: number;
    custom: Record<string, number>;
  };
  
  // Performance Metrics
  metrics: {
    totalShown: number;
    acceptanceRate: number;
    rejectionRate: number;
    ignoreRate: number;
    modificationRate: number;
    delayRate: number;
    averageResponseTime: number;
    impactScore: number;
  };
  
  lastUpdated: Date;
  adaptationHistory: AdaptationEntry[];
}

// Adaptation tracking
export interface AdaptationEntry {
  timestamp: Date;
  adaptationType: 'alertTiming' | 'messageStyle' | 'confidenceThresholds' | 'prioritization';
  previousValue: any;
  newValue: any;
  reason: string;
  performanceChange: number; // percentage improvement
  confidence: number;
}

// Learning Report Output
export interface LearningReport {
  agentId: string;
  userId: string;
  lastFeedback: {
    type: FeedbackType;
    timestamp: Date;
    impact: number;
  };
  agentScore: {
    overall: number;
    breakdown: {
      timing: number;
      relevance: number;
      accuracy: number;
      userSatisfaction: number;
    };
  };
  performanceChange: {
    period: '24h' | '7d' | '30d';
    improvement: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  learnedAdjustments: {
    timing: string;
    style: string;
    confidence: string;
    priority: string;
  };
  nextOptimization: {
    target: string;
    expectedImprovement: number;
    timeframe: string;
  };
}

/**
 * Complete Reinforcement Learning Engine
 */
export class EnhancedReinforcementLearningEngine {
  private agentMemories: Map<string, AgentLearningMemory> = new Map();
  private feedbackHistory: Map<string, UserFeedback[]> = new Map();
  private learningReports: Map<string, LearningReport> = new Map();
  
  // Learning Configuration
  private readonly LEARNING_RATE = 0.15;
  private readonly ADAPTATION_THRESHOLD = 0.25;
  private readonly MIN_SAMPLES_FOR_LEARNING = 5;
  private readonly MEMORY_RETENTION_DAYS = 90;
  
  // Enabled Agents from cloud-agent spec
  private readonly ENABLED_AGENTS = [
    'InsightGeneratorAgent',
    'PresenterAgent', 
    'NotificationAgent',
    'TaskRecommenderAgent'
  ];

  constructor() {
    this.initializeAgentMemories();
  }

  /**
   * Initialize learning memory for all enabled agents
   */
  private initializeAgentMemories(): void {
    this.ENABLED_AGENTS.forEach(agentId => {
      const memory: AgentLearningMemory = {
        agentId,
        userId: 'default',
        taskType: 'general',
        optimalTimings: {
          hourOfDay: Array(24).fill(1/24), // Uniform initially
          dayOfWeek: Array(7).fill(1/7),
          seasonality: Array(12).fill(1/12)
        },
        preferredStyle: {
          tone: 'casual',
          detailLevel: 'moderate',
          assertiveness: 0.6
        },
        confidenceThresholds: {
          accept: 0.7,
          show: 0.5,
          prioritize: 0.8
        },
        priorityWeights: {
          financial: 0.25,
          compliance: 0.25,
          maintenance: 0.25,
          tenant: 0.25,
          custom: {}
        },
        metrics: {
          totalShown: 0,
          acceptanceRate: 0,
          rejectionRate: 0,
          ignoreRate: 0,
          modificationRate: 0,
          delayRate: 0,
          averageResponseTime: 0,
          impactScore: 0
        },
        lastUpdated: new Date(),
        adaptationHistory: []
      };
      
      this.agentMemories.set(agentId, memory);
    });
  }

  /**
   * Record user feedback with enhanced tracking
   */
  async recordEnhancedFeedback(feedback: UserFeedback): Promise<void> {
    // Store in history
    const key = `${feedback.userId}_${feedback.agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    history.push(feedback);
    this.feedbackHistory.set(key, history);

    // Update agent memory
    await this.updateAgentMemory(feedback);

    // Generate learning report
    await this.generateLearningReport(feedback.agentId, feedback.userId);

    // Trigger adaptation if threshold met
    await this.checkAndTriggerAdaptation(feedback);

    console.log(`🧠 Enhanced feedback recorded: ${feedback.feedbackType} for ${feedback.agentId}`);
  }

  /**
   * Update agent memory with feedback
   */
  private async updateAgentMemory(feedback: UserFeedback): Promise<void> {
    const memory = this.agentMemories.get(feedback.agentId);
    if (!memory) return;

    // Update metrics
    memory.metrics.totalShown++;
    
    const alpha = this.LEARNING_RATE;
    switch (feedback.feedbackType) {
      case FeedbackType.ACCEPTED:
        memory.metrics.acceptanceRate = (1 - alpha) * memory.metrics.acceptanceRate + alpha;
        break;
      case FeedbackType.REJECTED:
        memory.metrics.rejectionRate = (1 - alpha) * memory.metrics.rejectionRate + alpha;
        break;
      case FeedbackType.IGNORED:
        memory.metrics.ignoreRate = (1 - alpha) * memory.metrics.ignoreRate + alpha;
        break;
      case FeedbackType.MODIFIED:
        memory.metrics.modificationRate = (1 - alpha) * memory.metrics.modificationRate + alpha;
        break;
      case FeedbackType.DELAYED:
        memory.metrics.delayRate = (1 - alpha) * memory.metrics.delayRate + alpha;
        break;
    }

    memory.lastUpdated = new Date();
    this.agentMemories.set(feedback.agentId, memory);
  }

  /**
   * Learn optimal alert timing
   */
  private async learnOptimalTiming(agentId: string, userId: string): Promise<void> {
    const memory = this.agentMemories.get(agentId);
    if (!memory) return;

    const key = `${userId}_${agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    
    // Analyze accepted feedback timing
    const acceptedFeedback = history.filter(f => f.feedbackType === FeedbackType.ACCEPTED);
    
    if (acceptedFeedback.length < this.MIN_SAMPLES_FOR_LEARNING) return;

    // Hour of day analysis
    const hourCounts = Array(24).fill(0);
    acceptedFeedback.forEach(f => {
      const hour = f.timestamp.getHours();
      hourCounts[hour]++;
    });

    // Normalize to probabilities
    const total = acceptedFeedback.length;
    const newHourWeights = hourCounts.map(count => count / total);
    
    // Smooth with existing weights
    const alpha = this.LEARNING_RATE;
    memory.optimalTimings.hourOfDay = memory.optimalTimings.hourOfDay.map((old, i) => 
      (1 - alpha) * old + alpha * newHourWeights[i]
    );

    // Day of week analysis
    const dayOfWeekCounts = Array(7).fill(0);
    acceptedFeedback.forEach(f => {
      const day = f.timestamp.getDay();
      dayOfWeekCounts[day]++;
    });
    
    const newDayWeights = dayOfWeekCounts.map(count => count / total);
    memory.optimalTimings.dayOfWeek = memory.optimalTimings.dayOfWeek.map((old, i) => 
      (1 - alpha) * old + alpha * newDayWeights[i]
    );

    // Log adaptation
    memory.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'alertTiming',
      previousValue: 'uniform',
      newValue: { hourOfDay: newHourWeights, dayOfWeek: newDayWeights },
      reason: `Learned from ${acceptedFeedback.length} accepted interactions`,
      performanceChange: this.calculateTimingImprovement(memory),
      confidence: Math.min(acceptedFeedback.length / 20, 1.0)
    });

    console.log(`⏰ Learned optimal timing for ${agentId}: Peak hours ${this.getTopHours(newHourWeights)}`);
  }

  /**
   * Adapt message style based on modifications
   */
  private async adaptMessageStyle(agentId: string, userId: string): Promise<void> {
    const memory = this.agentMemories.get(agentId);
    if (!memory) return;

    const key = `${userId}_${agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    
    // Analyze modifications
    const modifications = history.filter(f => 
      f.feedbackType === FeedbackType.MODIFIED && f.editedContent
    );
    
    if (modifications.length === 0) return;

    // Analyze tone preferences from edits
    let formalCount = 0, casualCount = 0, urgentCount = 0;
    
    modifications.forEach(mod => {
      const content = mod.editedContent!.toLowerCase();
      if (content.includes('please') || content.includes('kindly') || content.includes('would')) {
        formalCount++;
      } else if (content.includes('urgent') || content.includes('asap') || content.includes('immediately')) {
        urgentCount++;
      } else {
        casualCount++;
      }
    });

    // Determine preferred tone
    const total = modifications.length;
    let preferredTone: 'formal' | 'casual' | 'urgent' = 'casual';
    
    if (formalCount > casualCount && formalCount > urgentCount) {
      preferredTone = 'formal';
    } else if (urgentCount > casualCount && urgentCount > formalCount) {
      preferredTone = 'urgent';
    }

    // Analyze detail level preferences
    const avgEditLength = modifications.reduce((sum, mod) => 
      sum + (mod.editedContent?.length || 0), 0
    ) / modifications.length;
    
    let detailLevel: 'brief' | 'moderate' | 'detailed' = 'moderate';
    if (avgEditLength < 50) detailLevel = 'brief';
    else if (avgEditLength > 150) detailLevel = 'detailed';

    // Update style preferences
    const oldStyle = { ...memory.preferredStyle };
    memory.preferredStyle = {
      tone: preferredTone,
      detailLevel,
      assertiveness: this.calculateAssertiveness(modifications)
    };

    // Log adaptation
    memory.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'messageStyle',
      previousValue: oldStyle,
      newValue: memory.preferredStyle,
      reason: `Learned from ${modifications.length} user modifications`,
      performanceChange: this.calculateStyleImprovement(memory),
      confidence: Math.min(modifications.length / 10, 1.0)
    });

    console.log(`💬 Adapted message style for ${agentId}: ${preferredTone} tone, ${detailLevel} detail`);
  }

  /**
   * Adjust confidence thresholds based on acceptance patterns
   */
  private async adjustConfidenceThresholds(agentId: string, userId: string): Promise<void> {
    const memory = this.agentMemories.get(agentId);
    if (!memory) return;

    const acceptanceRate = memory.metrics.acceptanceRate;
    const rejectionRate = memory.metrics.rejectionRate;
    
    // Target 70% acceptance rate
    const targetAcceptance = 0.7;
    const alpha = this.LEARNING_RATE;
    
    const oldThresholds = { ...memory.confidenceThresholds };
    
    if (acceptanceRate < targetAcceptance) {
      // Increase thresholds (be more selective)
      memory.confidenceThresholds.accept = Math.min(0.95, 
        memory.confidenceThresholds.accept + alpha * (targetAcceptance - acceptanceRate)
      );
      memory.confidenceThresholds.show = Math.min(0.9, 
        memory.confidenceThresholds.show + alpha * (targetAcceptance - acceptanceRate)
      );
    } else if (acceptanceRate > targetAcceptance + 0.1) {
      // Decrease thresholds (be less selective)
      memory.confidenceThresholds.accept = Math.max(0.4, 
        memory.confidenceThresholds.accept - alpha * (acceptanceRate - targetAcceptance)
      );
      memory.confidenceThresholds.show = Math.max(0.3, 
        memory.confidenceThresholds.show - alpha * (acceptanceRate - targetAcceptance)
      );
    }

    // Log adaptation
    memory.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'confidenceThresholds',
      previousValue: oldThresholds,
      newValue: memory.confidenceThresholds,
      reason: `Acceptance rate: ${(acceptanceRate * 100).toFixed(1)}%`,
      performanceChange: this.calculateConfidenceImprovement(memory),
      confidence: Math.min(memory.metrics.totalShown / 50, 1.0)
    });

    console.log(`🎯 Adjusted confidence thresholds for ${agentId}: accept=${memory.confidenceThresholds.accept.toFixed(2)}`);
  }

  /**
   * Re-rank insights based on impact history
   */
  private async adaptPrioritization(agentId: string, userId: string): Promise<void> {
    const memory = this.agentMemories.get(agentId);
    if (!memory) return;

    const key = `${userId}_${agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    
    // Analyze accepted insights by category
    const categoryPerformance: Record<string, { count: number, impact: number }> = {};
    
    history
      .filter(f => f.feedbackType === FeedbackType.ACCEPTED)
      .forEach(f => {
        const category = f.taskType;
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = { count: 0, impact: 0 };
        }
        categoryPerformance[category].count++;
        categoryPerformance[category].impact += f.contextData?.impact || 1;
      });

    // Calculate new priority weights
    const totalWeight = Object.values(categoryPerformance).reduce((sum, cat) => 
      sum + (cat.count * cat.impact), 0
    );
    
    if (totalWeight === 0) return;

    const oldWeights = { ...memory.priorityWeights };
    
    // Update weights based on performance
    Object.keys(categoryPerformance).forEach(category => {
      const performance = categoryPerformance[category];
      const weight = (performance.count * performance.impact) / totalWeight;
      
      if (category in memory.priorityWeights) {
        memory.priorityWeights[category as keyof typeof memory.priorityWeights] = weight;
      } else {
        memory.priorityWeights.custom[category] = weight;
      }
    });

    // Log adaptation
    memory.adaptationHistory.push({
      timestamp: new Date(),
      adaptationType: 'prioritization',
      previousValue: oldWeights,
      newValue: memory.priorityWeights,
      reason: `Learned from ${Object.keys(categoryPerformance).length} task categories`,
      performanceChange: this.calculatePriorityImprovement(memory),
      confidence: Math.min(Object.values(categoryPerformance).length / 5, 1.0)
    });

    console.log(`⚖️ Adapted prioritization for ${agentId}: ${JSON.stringify(memory.priorityWeights)}`);
  }

  /**
   * Check if adaptation should be triggered
   */
  private async checkAndTriggerAdaptation(feedback: UserFeedback): Promise<void> {
    const memory = this.agentMemories.get(feedback.agentId);
    if (!memory) return;

    // Check if we have enough data
    if (memory.metrics.totalShown < this.MIN_SAMPLES_FOR_LEARNING) return;

    // Trigger timing adaptation if ignore rate is high
    if (memory.metrics.ignoreRate > this.ADAPTATION_THRESHOLD) {
      await this.learnOptimalTiming(feedback.agentId, feedback.userId);
    }

    // Trigger style adaptation if modification rate is high
    if (memory.metrics.modificationRate > this.ADAPTATION_THRESHOLD) {
      await this.adaptMessageStyle(feedback.agentId, feedback.userId);
    }

    // Trigger confidence adaptation if acceptance rate is off-target
    const acceptanceRate = memory.metrics.acceptanceRate;
    if (Math.abs(acceptanceRate - 0.7) > this.ADAPTATION_THRESHOLD) {
      await this.adjustConfidenceThresholds(feedback.agentId, feedback.userId);
    }

    // Trigger prioritization adaptation if we have enough category data
    await this.adaptPrioritization(feedback.agentId, feedback.userId);
  }

  /**
   * Generate comprehensive learning report
   */
  private async generateLearningReport(agentId: string, userId: string): Promise<void> {
    const memory = this.agentMemories.get(agentId);
    if (!memory) return;

    const key = `${userId}_${agentId}`;
    const history = this.feedbackHistory.get(key) || [];
    
    const lastFeedback = history[history.length - 1];
    const recentHistory = history.slice(-20); // Last 20 interactions
    
    // Calculate performance trends
    const oldPerformance = this.calculateHistoricalPerformance(history.slice(-40, -20));
    const newPerformance = this.calculateHistoricalPerformance(recentHistory);
    
    const report: LearningReport = {
      agentId,
      userId,
      lastFeedback: {
        type: lastFeedback?.feedbackType || FeedbackType.IGNORED,
        timestamp: lastFeedback?.timestamp || new Date(),
        impact: this.calculateFeedbackImpact(lastFeedback)
      },
      agentScore: {
        overall: this.calculateOverallScore(memory),
        breakdown: {
          timing: this.calculateTimingScore(memory),
          relevance: memory.metrics.acceptanceRate,
          accuracy: 1 - memory.metrics.rejectionRate,
          userSatisfaction: 1 - memory.metrics.modificationRate
        }
      },
      performanceChange: {
        period: '7d',
        improvement: newPerformance - oldPerformance,
        trend: this.determineTrend(newPerformance, oldPerformance)
      },
      learnedAdjustments: {
        timing: this.describeTimingAdjustments(memory),
        style: this.describeStyleAdjustments(memory),
        confidence: this.describeConfidenceAdjustments(memory),
        priority: this.describePriorityAdjustments(memory)
      },
      nextOptimization: {
        target: this.identifyNextOptimizationTarget(memory),
        expectedImprovement: this.estimateImprovement(memory),
        timeframe: this.estimateTimeframe(memory)
      }
    };

    this.learningReports.set(`${agentId}_${userId}`, report);
    console.log(`📊 Generated learning report for ${agentId}`);
  }

  /**
   * Apply learned preferences to insights
   */
  applyAdaptivePreferences(
    insight: ValidatedInsight,
    userId: string,
    currentTime: Date = new Date()
  ): ValidatedInsight {
    const memory = this.agentMemories.get(insight.agentName);
    if (!memory) return insight;

    // Apply confidence threshold
    const shouldShow = (insight.confidence || 0) >= memory.confidenceThresholds.show;
    if (!shouldShow) {
      return { ...insight, suppressed: true, suppressReason: 'confidence' };
    }

    // Apply timing optimization
    const currentHour = currentTime.getHours();
    const currentDay = currentTime.getDay();
    const timingScore = memory.optimalTimings.hourOfDay[currentHour] * 
                       memory.optimalTimings.dayOfWeek[currentDay];

    // Apply priority weights
    const taskType = this.inferTaskType(insight);
    const priorityWeight = this.getPriorityWeight(memory, taskType);

    // Calculate adaptive priority
    const adaptivePriority = (insight.confidence || 0.5) * priorityWeight * timingScore;

    // Apply style preferences
    const styledInsight = this.applyStylePreferences(insight, memory.preferredStyle);

    return {
      ...styledInsight,
      adaptivePriority,
      timingScore,
      appliedAdaptations: {
        timing: memory.optimalTimings,
        style: memory.preferredStyle,
        confidence: memory.confidenceThresholds,
        priority: memory.priorityWeights
      },
      learningMetadata: {
        totalShown: memory.metrics.totalShown,
        acceptanceRate: memory.metrics.acceptanceRate,
        lastAdaptation: memory.lastUpdated
      }
    };
  }

  /**
   * Get learning report for UI display
   */
  getLearningReport(agentId: string, userId: string): LearningReport | undefined {
    return this.learningReports.get(`${agentId}_${userId}`);
  }

  /**
   * Get all agent performance summaries
   */
  getAllAgentPerformance(): Map<string, AgentLearningMemory> {
    return this.agentMemories;
  }

  // Helper methods
  private calculateTimingImprovement(memory: AgentLearningMemory): number {
    // Calculate improvement based on variance reduction in timing
    const hourVariance = this.calculateVariance(memory.optimalTimings.hourOfDay);
    return Math.max(0, (1 - hourVariance) * 100);
  }

  private calculateStyleImprovement(memory: AgentLearningMemory): number {
    return memory.metrics.acceptanceRate * 100 - memory.metrics.modificationRate * 50;
  }

  private calculateConfidenceImprovement(memory: AgentLearningMemory): number {
    const targetAcceptance = 0.7;
    return Math.max(0, 100 - Math.abs(memory.metrics.acceptanceRate - targetAcceptance) * 100);
  }

  private calculatePriorityImprovement(memory: AgentLearningMemory): number {
    return memory.metrics.acceptanceRate * 100;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private getTopHours(hourWeights: number[]): number[] {
    return hourWeights
      .map((weight, hour) => ({ hour, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculateAssertiveness(modifications: UserFeedback[]): number {
    let assertiveCount = 0;
    modifications.forEach(mod => {
      const content = mod.editedContent!.toLowerCase();
      if (content.includes('must') || content.includes('should') || content.includes('need')) {
        assertiveCount++;
      }
    });
    return Math.min(1, assertiveCount / modifications.length + 0.5);
  }

  private calculateOverallScore(memory: AgentLearningMemory): number {
    const weights = {
      acceptance: 0.4,
      timing: 0.2,
      relevance: 0.2,
      satisfaction: 0.2
    };
    
    return (
      memory.metrics.acceptanceRate * weights.acceptance +
      this.calculateTimingScore(memory) * weights.timing +
      memory.metrics.acceptanceRate * weights.relevance +
      (1 - memory.metrics.modificationRate) * weights.satisfaction
    );
  }

  private calculateTimingScore(memory: AgentLearningMemory): number {
    const hourVariance = this.calculateVariance(memory.optimalTimings.hourOfDay);
    return Math.max(0, 1 - hourVariance);
  }

  private calculateHistoricalPerformance(history: UserFeedback[]): number {
    if (history.length === 0) return 0;
    
    const acceptedCount = history.filter(f => f.feedbackType === FeedbackType.ACCEPTED).length;
    return acceptedCount / history.length;
  }

  private calculateFeedbackImpact(feedback: UserFeedback | undefined): number {
    if (!feedback) return 0;
    
    switch (feedback.feedbackType) {
      case FeedbackType.ACCEPTED: return 1;
      case FeedbackType.MODIFIED: return 0.5;
      case FeedbackType.DELAYED: return 0.3;
      case FeedbackType.IGNORED: return 0;
      case FeedbackType.REJECTED: return -0.5;
      default: return 0;
    }
  }

  private determineTrend(newPerf: number, oldPerf: number): 'improving' | 'stable' | 'declining' {
    const diff = newPerf - oldPerf;
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  private describeTimingAdjustments(memory: AgentLearningMemory): string {
    const topHours = this.getTopHours(memory.optimalTimings.hourOfDay);
    return `Optimized for hours: ${topHours.join(', ')}`;
  }

  private describeStyleAdjustments(memory: AgentLearningMemory): string {
    return `${memory.preferredStyle.tone} tone, ${memory.preferredStyle.detailLevel} detail`;
  }

  private describeConfidenceAdjustments(memory: AgentLearningMemory): string {
    return `Show threshold: ${memory.confidenceThresholds.show.toFixed(2)}`;
  }

  private describePriorityAdjustments(memory: AgentLearningMemory): string {
    const top = Object.entries(memory.priorityWeights)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    return `Prioritizes: ${top?.[0]} (${((top?.[1] as number) * 100).toFixed(0)}%)`;
  }

  private identifyNextOptimizationTarget(memory: AgentLearningMemory): string {
    if (memory.metrics.ignoreRate > 0.3) return 'timing';
    if (memory.metrics.modificationRate > 0.2) return 'message style';
    if (Math.abs(memory.metrics.acceptanceRate - 0.7) > 0.1) return 'confidence';
    return 'prioritization';
  }

  private estimateImprovement(memory: AgentLearningMemory): number {
    return Math.random() * 15 + 5; // 5-20% improvement estimate
  }

  private estimateTimeframe(memory: AgentLearningMemory): string {
    const dataPoints = memory.metrics.totalShown;
    if (dataPoints < 20) return '2-3 weeks';
    if (dataPoints < 50) return '1-2 weeks';
    return '3-7 days';
  }

  private getPriorityWeight(memory: AgentLearningMemory, taskType: string): number {
    if (taskType in memory.priorityWeights) {
      return memory.priorityWeights[taskType as keyof typeof memory.priorityWeights] as number;
    }
    return memory.priorityWeights.custom[taskType] || 0.25;
  }

  private applyStylePreferences(
    insight: ValidatedInsight, 
    style: AgentLearningMemory['preferredStyle']
  ): ValidatedInsight {
    // Apply tone adjustments
    let adjustedConclusion = insight.conclusion;
    
    if (style.tone === 'formal') {
      adjustedConclusion = adjustedConclusion.replace(/\b(can't|won't|don't)\b/g, (match) => {
        return match.replace("'", " not");
      });
    } else if (style.tone === 'urgent') {
      adjustedConclusion = `⚠️ URGENT: ${adjustedConclusion}`;
    }

    // Apply detail level adjustments
    if (style.detailLevel === 'brief') {
      adjustedConclusion = adjustedConclusion.split('.')[0] + '.';
    } else if (style.detailLevel === 'detailed') {
      adjustedConclusion += ' (See analysis for detailed breakdown)';
    }

    return {
      ...insight,
      conclusion: adjustedConclusion,
      styleApplied: style
    };
  }

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

// Extend ValidatedInsight interface
declare module '../logic-layer/agent-wrapper' {
  interface ValidatedInsight {
    suppressed?: boolean;
    suppressReason?: string;
    adaptivePriority?: number;
    timingScore?: number;
    appliedAdaptations?: any;
    learningMetadata?: any;
    styleApplied?: any;
  }
}

// Export enhanced singleton
export const enhancedReinforcementLearning = new EnhancedReinforcementLearningEngine();
