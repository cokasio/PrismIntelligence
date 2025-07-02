/**
 * Reinforcement Learning Demonstration
 * Shows how agents learn and adapt based on user feedback
 */

import { reinforcementLearning, FeedbackType, UserFeedback } from '../reinforcement-engine';
import { ValidatedInsight } from '../../logic-layer/agent-wrapper';

/**
 * Demonstrate reinforcement learning with various scenarios
 */
export async function demonstrateReinforcementLearning() {
  console.log('🧠 REINFORCEMENT LEARNING DEMONSTRATION\n');
  console.log('This demo shows:');
  console.log('- User feedback collection');
  console.log('- Agent performance tracking');
  console.log('- Adaptive behavior based on patterns');
  console.log('- Preference learning\n');
  console.log('═'.repeat(60) + '\n');

  // Simulate user "John" who prefers morning insights and formal tone
  const userId = 'user_john_123';
  
  // Scenario 1: Learning timing preferences
  console.log('📅 Scenario 1: Learning Timing Preferences\n');
  await simulateTimingPreferences(userId);
  
  console.log('\n' + '═'.repeat(60) + '\n');
  
  // Scenario 2: Learning tone preferences through edits
  console.log('💬 Scenario 2: Learning Tone Preferences\n');
  await simulateTonePreferences(userId);
  
  console.log('\n' + '═'.repeat(60) + '\n');
  
  // Scenario 3: Learning confidence thresholds
  console.log('🎯 Scenario 3: Learning Confidence Thresholds\n');
  await simulateConfidenceThresholds(userId);
  
  console.log('\n' + '═'.repeat(60) + '\n');
  
  // Scenario 4: Learning priority preferences
  console.log('⚖️ Scenario 4: Learning Priority Preferences\n');
  await simulatePriorityPreferences(userId);
  
  console.log('\n' + '═'.repeat(60) + '\n');
  
  // Show learning summary
  console.log('📊 LEARNING SUMMARY\n');
  showLearningSummary();
}

/**
 * Simulate timing preference learning
 */
async function simulateTimingPreferences(userId: string) {
  const agent = 'NotificationAgent';
  
  // User ignores afternoon notifications but accepts morning ones
  const feedbackSequence: Array<{time: number; type: FeedbackType}> = [
    { time: 14, type: FeedbackType.IGNORE },  // 2 PM - ignored
    { time: 15, type: FeedbackType.IGNORE },  // 3 PM - ignored
    { time: 9, type: FeedbackType.ACCEPT },   // 9 AM - accepted
    { time: 10, type: FeedbackType.ACCEPT },  // 10 AM - accepted
    { time: 16, type: FeedbackType.IGNORE },  // 4 PM - ignored
    { time: 8, type: FeedbackType.ACCEPT },   // 8 AM - accepted
  ];
  
  console.log('Simulating user feedback on notification timing...');
  
  for (const feedback of feedbackSequence) {
    const mockDate = new Date();
    mockDate.setHours(feedback.time);
    
    const userFeedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random()}`,
      agentId: agent,
      insightId: `insight_${Date.now()}`,
      feedbackType: feedback.type,
      timestamp: mockDate,
      userId: userId,
      taskType: 'general'
    };
    
    await reinforcementLearning.recordFeedback(userFeedback);
    
    console.log(`${feedback.time}:00 - ${feedback.type === FeedbackType.ACCEPT ? '✅ Accepted' : '⏳ Ignored'}`);
  }
  
  // Check learned preferences
  const preferences = reinforcementLearning.getAgentAdaptations(agent, userId);
  console.log('\nLearned timing preferences:');
  console.log(`- Morning: ${(preferences.preferredTiming.morning * 100).toFixed(0)}%`);
  console.log(`- Afternoon: ${(preferences.preferredTiming.afternoon * 100).toFixed(0)}%`);
  console.log(`- Evening: ${(preferences.preferredTiming.evening * 100).toFixed(0)}%`);
  console.log('\n✨ Agent learned that user prefers morning notifications!');
}

/**
 * Simulate tone preference learning through edits
 */
async function simulateTonePreferences(userId: string) {
  const agent = 'PresenterAgent';
  
  // User edits casual messages to be more formal
  const editSequence = [
    {
      original: 'Hey! Heads up - your expenses went up.',
      edited: 'Please note that expenses have increased.',
      analysis: 'formal'
    },
    {
      original: 'FYI - tenant complained about noise.',
      edited: 'Kindly be advised of a tenant noise complaint.',
      analysis: 'formal'
    },
    {
      original: 'Quick note: maintenance needed ASAP!',
      edited: 'Urgent: Immediate maintenance required.',
      analysis: 'urgent'
    }
  ];
  
  console.log('Simulating user edits to learn tone preferences...');
  
  for (const edit of editSequence) {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random()}`,
      agentId: agent,
      insightId: `insight_${Date.now()}`,
      feedbackType: FeedbackType.EDIT,
      timestamp: new Date(),
      editedContent: edit.edited,
      userId: userId,
      taskType: 'general'
    };
    
    await reinforcementLearning.recordFeedback(feedback);
    
    console.log(`\nOriginal: "${edit.original}"`);
    console.log(`Edited to: "${edit.edited}"`);
    console.log(`Detected tone: ${edit.analysis}`);
  }
  
  // Check learned preferences
  const preferences = reinforcementLearning.getAgentAdaptations(agent, userId);
  console.log('\nLearned tone preferences:');
  console.log(`- Formal: ${(preferences.preferredTone.formal * 100).toFixed(0)}%`);
  console.log(`- Casual: ${(preferences.preferredTone.casual * 100).toFixed(0)}%`);
  console.log(`- Urgent: ${(preferences.preferredTone.urgent * 100).toFixed(0)}%`);
  console.log('\n✨ Agent learned that user prefers formal tone!');
}

/**
 * Simulate confidence threshold learning
 */
async function simulateConfidenceThresholds(userId: string) {
  const agent = 'InsightGeneratorAgent';
  
  // User rejects low-confidence insights but accepts high-confidence ones
  const insightSequence = [
    { confidence: 0.6, accepted: false },
    { confidence: 0.65, accepted: false },
    { confidence: 0.85, accepted: true },
    { confidence: 0.9, accepted: true },
    { confidence: 0.7, accepted: false },
    { confidence: 0.88, accepted: true },
    { confidence: 0.92, accepted: true },
  ];
  
  console.log('Simulating feedback on insights with varying confidence...');
  
  for (const insight of insightSequence) {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random()}`,
      agentId: agent,
      insightId: `insight_${Date.now()}`,
      feedbackType: insight.accepted ? FeedbackType.ACCEPT : FeedbackType.REJECT,
      timestamp: new Date(),
      userId: userId,
      taskType: 'financial'
    };
    
    await reinforcementLearning.recordFeedback(feedback);
    
    console.log(`Confidence: ${(insight.confidence * 100).toFixed(0)}% - ${insight.accepted ? '✅ Accepted' : '❌ Rejected'}`);
  }
  
  // Check learned threshold
  const preferences = reinforcementLearning.getAgentAdaptations(agent, userId);
  console.log(`\nLearned confidence threshold: ${(preferences.confidenceThreshold * 100).toFixed(0)}%`);
  console.log('✨ Agent learned to only show high-confidence insights!');
}

/**
 * Simulate priority preference learning
 */
async function simulatePriorityPreferences(userId: string) {
  const agent = 'TaskRecommenderAgent';
  
  // User consistently acts on financial and compliance tasks
  const taskSequence = [
    { type: 'financial', accepted: true },
    { type: 'maintenance', accepted: false },
    { type: 'compliance', accepted: true },
    { type: 'tenant', accepted: false },
    { type: 'financial', accepted: true },
    { type: 'compliance', accepted: true },
    { type: 'maintenance', accepted: false },
    { type: 'financial', accepted: true }
  ];
  
  console.log('Simulating task acceptance patterns...');
  
  for (const task of taskSequence) {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random()}`,
      agentId: agent,
      insightId: `insight_${Date.now()}`,
      feedbackType: task.accepted ? FeedbackType.ACCEPT : FeedbackType.IGNORE,
      timestamp: new Date(),
      userId: userId,
      taskType: task.type
    };
    
    await reinforcementLearning.recordFeedback(feedback);
    
    console.log(`${task.type.padEnd(12)} - ${task.accepted ? '✅ Accepted' : '⏳ Ignored'}`);
  }
  
  // Check learned priorities
  const preferences = reinforcementLearning.getAgentAdaptations(agent, userId);
  console.log('\nLearned priority weights:');
  console.log(`- Financial: ${(preferences.priorityWeights.financial * 100).toFixed(0)}%`);
  console.log(`- Compliance: ${(preferences.priorityWeights.compliance * 100).toFixed(0)}%`);
  console.log(`- Maintenance: ${(preferences.priorityWeights.maintenance * 100).toFixed(0)}%`);
  console.log(`- Tenant: ${(preferences.priorityWeights.tenant * 100).toFixed(0)}%`);
  console.log('\n✨ Agent learned that user prioritizes financial and compliance tasks!');
}

/**
 * Show overall learning summary
 */
function showLearningSummary() {
  const summary = reinforcementLearning.generateLearningSummary();
  
  console.log(`Overall Improvement: ${(summary.overallImprovement * 100).toFixed(0)}%`);
  console.log(`Top Performing Agent: ${summary.topPerformingAgent}`);
  
  if (summary.keyInsights.length > 0) {
    console.log('\nKey Insights:');
    summary.keyInsights.forEach(insight => {
      console.log(`- ${insight}`);
    });
  }
  
  if (summary.recentAdaptations.length > 0) {
    console.log('\nRecent Adaptations:');
    summary.recentAdaptations.forEach(adaptation => {
      console.log(`- ${adaptation.adaptationType}: ${adaptation.reason}`);
    });
  }
  
  // Show individual agent performances
  console.log('\n📈 Agent Performance Metrics:');
  ['InsightGeneratorAgent', 'PresenterAgent', 'TaskRecommenderAgent', 'NotificationAgent'].forEach(agentId => {
    const performance = reinforcementLearning.getAgentPerformanceReport(agentId);
    if (performance) {
      console.log(`\n${agentId}:`);
      console.log(`  Acceptance Rate: ${(performance.acceptanceRate * 100).toFixed(0)}%`);
      console.log(`  Total Insights: ${performance.totalInsights}`);
      console.log(`  Adaptations: ${performance.adaptationHistory.length}`);
    }
  });
}

/**
 * Demonstrate applying learned preferences to new insights
 */
export async function demonstratePreferenceApplication() {
  console.log('\n🎯 APPLYING LEARNED PREFERENCES\n');
  
  const userId = 'user_john_123';
  
  // Create sample insights
  const insights: ValidatedInsight[] = [
    {
      agentName: 'InsightGeneratorAgent',
      conclusion: 'Maintenance budget exceeded by 15%',
      evidence: [],
      confidence: 0.65, // Below learned threshold
      timestamp: new Date()
    },
    {
      agentName: 'InsightGeneratorAgent',
      conclusion: 'Revenue increased by 8% this quarter',
      evidence: [],
      confidence: 0.92, // Above learned threshold
      timestamp: new Date()
    }
  ];
  
  console.log('Original insights:');
  insights.forEach((insight, idx) => {
    console.log(`${idx + 1}. ${insight.conclusion} (confidence: ${(insight.confidence! * 100).toFixed(0)}%)`);
  });
  
  console.log('\nApplying learned preferences...');
  
  const adjustedInsights = insights.map(insight => 
    reinforcementLearning.applyLearnedPreferences(insight, userId)
  );
  
  console.log('\nAdjusted insights:');
  adjustedInsights.forEach((insight, idx) => {
    if (insight.suppressed) {
      console.log(`${idx + 1}. [SUPPRESSED - Below confidence threshold]`);
    } else {
      console.log(`${idx + 1}. ${insight.conclusion}`);
      console.log(`   Priority Score: ${insight.adjustedPriority?.toFixed(2)}`);
    }
  });
  
  console.log('\n✨ Low-confidence insights are now suppressed based on learned preferences!');
}

// Export demonstration functions
export default {
  demonstrateReinforcementLearning,
  demonstratePreferenceApplication
};
