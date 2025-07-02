/**
 * Reinforcement Learning UI Components - Part 1: Feedback Interface
 * User feedback collection and agent learning visualization
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Clock,
  X,
  TrendingUp,
  Brain,
  Award,
  BarChart3,
  Zap
} from 'lucide-react';
import { 
  FeedbackType,
  UserFeedback,
  AgentPerformance
} from '../../../reinforcement-learning/reinforcement-engine';
import { ValidatedInsight } from '../../../logic-layer/agent-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FeedbackButtonsProps {
  insight: ValidatedInsight;
  onFeedback: (feedback: UserFeedback) => void;
  userId: string;
}

/**
 * Feedback Buttons Component
 */
export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  insight,
  onFeedback,
  userId
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackType | null>(null);

  const handleFeedback = (type: FeedbackType, edited?: string) => {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}`,
      agentId: insight.agentName,
      insightId: insight.agentName + '_' + Date.now(),
      feedbackType: type,
      timestamp: new Date(),
      editedContent: edited,
      userId: userId,
      taskType: inferTaskType(insight)
    };

    onFeedback(feedback);
    setFeedbackGiven(type);
    setShowEditDialog(false);

    // Reset after animation
    setTimeout(() => setFeedbackGiven(null), 2000);
  };

  const inferTaskType = (insight: ValidatedInsight): string => {
    const conclusion = insight.conclusion.toLowerCase();
    if (conclusion.includes('financial')) return 'financial';
    if (conclusion.includes('maintenance')) return 'maintenance';
    if (conclusion.includes('tenant')) return 'tenant';
    if (conclusion.includes('compliance')) return 'compliance';
    return 'general';
  };

  if (feedbackGiven) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="flex items-center gap-2 text-sm text-green-600"
      >
        <CheckCircle className="w-4 h-4" />
        Feedback recorded!
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback(FeedbackType.ACCEPT)}
              className="hover:bg-green-50 hover:text-green-600"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Accept recommendation</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback(FeedbackType.REJECT)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reject recommendation</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEditDialog(true)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit recommendation</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback(FeedbackType.DELAY)}
              className="hover:bg-yellow-50 hover:text-yellow-600"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remind me later</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback(FeedbackType.IGNORE)}
              className="hover:bg-gray-50 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Not relevant</TooltipContent>
        </Tooltip>

        {/* Edit Dialog */}
        <AnimatePresence>
          {showEditDialog && (
            <EditDialog
              originalContent={insight.conclusion}
              onSave={(edited) => handleFeedback(FeedbackType.EDIT, edited)}
              onClose={() => setShowEditDialog(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

/**
 * Edit Dialog Component
 */
const EditDialog: React.FC<{
  originalContent: string;
  onSave: (edited: string) => void;
  onClose: () => void;
}> = ({ originalContent, onSave, onClose }) => {
  const [editedContent, setEditedContent] = useState(originalContent);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Edit Recommendation</h3>
        
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full h-32 mb-4"
          placeholder="Edit the recommendation..."
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedContent)}>
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
/**
 * Agent Learning Badge Component
 */
export const AgentLearningBadge: React.FC<{ 
  agentId: string;
  performance?: AgentPerformance;
}> = ({ agentId, performance }) => {
  if (!performance) return null;

  const improvement = performance.adaptationHistory.length > 0
    ? performance.adaptationHistory[performance.adaptationHistory.length - 1].improvement
    : 0;

  const isImproving = improvement > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 ${isImproving ? 'border-green-500 text-green-700' : ''}`}
          >
            <TrendingUp className="w-3 h-3" />
            Learning
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium mb-1">Agent Performance</p>
            <p>Acceptance: {(performance.acceptanceRate * 100).toFixed(0)}%</p>
            <p>Adaptations: {performance.adaptationHistory.length}</p>
            {improvement > 0 && (
              <p className="text-green-600">+{(improvement * 100).toFixed(0)}% improvement</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Agent Performance Dashboard
 */
export const AgentPerformanceDashboard: React.FC<{
  performances: Map<string, AgentPerformance>;
}> = ({ performances }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" />
        Agent Learning Progress
      </h3>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from(performances.entries()).map(([agentId, performance]) => (
          <AgentPerformanceCard
            key={agentId}
            agentId={agentId}
            performance={performance}
            isSelected={selectedAgent === agentId}
            onClick={() => setSelectedAgent(agentId)}
          />
        ))}
      </div>

      {/* Detailed View */}
      {selectedAgent && performances.get(selectedAgent) && (
        <AgentDetailedPerformance
          agentId={selectedAgent}
          performance={performances.get(selectedAgent)!}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
};

/**
 * Agent Performance Card
 */
const AgentPerformanceCard: React.FC<{
  agentId: string;
  performance: AgentPerformance;
  isSelected: boolean;
  onClick: () => void;
}> = ({ agentId, performance, isSelected, onClick }) => {
  const acceptanceColor = performance.acceptanceRate > 0.7 ? 'text-green-600' : 
                          performance.acceptanceRate > 0.5 ? 'text-yellow-600' : 
                          'text-red-600';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-sm">{formatAgentName(agentId)}</h4>
          <AgentLearningBadge agentId={agentId} performance={performance} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Acceptance</span>
            <span className={`text-sm font-medium ${acceptanceColor}`}>
              {(performance.acceptanceRate * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total Insights</span>
            <span className="text-sm font-medium">{performance.totalInsights}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Financial Impact</span>
            <span className="text-sm font-medium text-green-600">
              ${performance.financialImpact.toFixed(0)}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="mt-3">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${performance.acceptanceRate * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Agent Detailed Performance View
 */
const AgentDetailedPerformance: React.FC<{
  agentId: string;
  performance: AgentPerformance;
  onClose: () => void;
}> = ({ agentId, performance, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {formatAgentName(agentId)} Performance Details
          </h4>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetricCard
            label="Acceptance Rate"
            value={`${(performance.acceptanceRate * 100).toFixed(0)}%`}
            trend={performance.acceptanceRate > 0.7 ? 'up' : 'down'}
          />
          <MetricCard
            label="Edit Rate"
            value={`${(performance.editRate * 100).toFixed(0)}%`}
            trend={performance.editRate < 0.2 ? 'up' : 'down'}
          />
          <MetricCard
            label="Avg Confidence (Accepted)"
            value={`${(performance.averageConfidenceAccepted * 100).toFixed(0)}%`}
            trend="neutral"
          />
          <MetricCard
            label="Financial Impact"
            value={`$${performance.financialImpact.toFixed(0)}`}
            trend={performance.financialImpact > 0 ? 'up' : 'down'}
          />
        </div>

        {/* Adaptation History */}
        {performance.adaptationHistory.length > 0 && (
          <div>
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Recent Adaptations
            </h5>
            <div className="space-y-2">
              {performance.adaptationHistory.slice(-3).reverse().map((adaptation, idx) => (
                <AdaptationEntry key={idx} adaptation={adaptation} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard: React.FC<{
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}> = ({ label, value, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 
                     trend === 'down' ? 'text-red-600' : 
                     'text-gray-600';

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${trendColor}`}>{value}</p>
    </div>
  );
};

/**
 * Adaptation Entry Component
 */
const AdaptationEntry: React.FC<{
  adaptation: {
    timestamp: Date;
    adaptationType: string;
    reason: string;
    improvement: number;
  };
}> = ({ adaptation }) => {
  const typeIcons = {
    timing: Clock,
    tone: MessageCircle,
    confidence: BarChart3,
    priority: TrendingUp
  };

  const Icon = typeIcons[adaptation.adaptationType as keyof typeof typeIcons] || Zap;

  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium capitalize">{adaptation.adaptationType} Adaptation</p>
        <p className="text-xs text-gray-600">{adaptation.reason}</p>
        {adaptation.improvement > 0 && (
          <p className="text-xs text-green-600 mt-1">
            +{(adaptation.improvement * 100).toFixed(0)}% improvement
          </p>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {new Date(adaptation.timestamp).toLocaleDateString()}
      </span>
    </div>
  );
};

/**
 * Helper function to format agent names
 */
function formatAgentName(agentId: string): string {
  return agentId
    .replace(/([A-Z])/g, ' $1')
    .replace(/Agent/g, '')
    .trim();
}

export { formatAgentName };