/**
 * Agent Coordination UI Components - Part 1: Main Panel
 * Visualizes A2A2 + MCP debate and consensus process
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  GitMerge,
  MessageCircle,
  Brain,
  Gavel,
  TrendingUp
} from 'lucide-react';
import { 
  ConsensusResult, 
  DebateEntry, 
  AgentProposal,
  DissentRecord 
} from '../../../agent-coordination/a2a2-protocol';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface AgentCoordinationPanelProps {
  consensusResult?: ConsensusResult;
  onNewTask?: (task: any) => void;
}

/**
 * Main Agent Coordination Panel
 */
export const AgentCoordinationPanel: React.FC<AgentCoordinationPanelProps> = ({
  consensusResult,
  onNewTask
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Agent Coordination</h2>
              <p className="text-sm text-gray-500">A2A2 + MCP Protocols</p>
            </div>
          </div>
          
          {consensusResult && (
            <ConsensusBadge result={consensusResult} />
          )}
        </div>
      </div>

      {/* Content */}
      {consensusResult ? (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList className="px-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="debate">Debate Log</TabsTrigger>
            <TabsTrigger value="proposals">Agent Proposals</TabsTrigger>
            <TabsTrigger value="consensus">Consensus Details</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="p-4">
              <ConsensusOverview result={consensusResult} />
            </TabsContent>

            <TabsContent value="debate" className="p-4">
              <DebateTimeline entries={consensusResult.debateLog} />
            </TabsContent>

            <TabsContent value="proposals" className="p-4">
              <ProposalsView result={consensusResult} />
            </TabsContent>

            <TabsContent value="consensus" className="p-4">
              <ConsensusDetails result={consensusResult} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      ) : (
        <EmptyState onNewTask={onNewTask} />
      )}
    </div>
  );
};

/**
 * Consensus Badge Component
 */
const ConsensusBadge: React.FC<{ result: ConsensusResult }> = ({ result }) => {
  if (result.achieved) {
    return (
      <Badge className="bg-green-100 text-green-800 gap-1">
        <CheckCircle2 className="w-4 h-4" />
        Consensus Reached
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 gap-1">
        <AlertCircle className="w-4 h-4" />
        Dissent Logged
      </Badge>
    );
  }
};

/**
 * Consensus Overview
 */
const ConsensusOverview: React.FC<{ result: ConsensusResult }> = ({ result }) => {
  const supportPercentage = (result.supportingAgents.length / 
    (result.supportingAgents.length + result.dissentingAgents.length)) * 100;

  return (
    <div className="space-y-4">
      {/* Final Decision */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Gavel className="w-5 h-5 text-purple-600" />
          Final Decision
        </h3>
        <p className="text-gray-800 leading-relaxed">{result.finalProposal}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              Support: {supportPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Consensus Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Participating Agents"
          value={result.supportingAgents.length + result.dissentingAgents.length}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Supporting Agents"
          value={result.supportingAgents.length}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Dissenting Agents"
          value={result.dissentingAgents.length}
          color="yellow"
        />
      </div>

      {/* Consensus Method */}
      <Card className="p-4">
        <h4 className="font-medium mb-2">Consensus Method</h4>
        <div className="flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-purple-600" />
          <span className="capitalize">{result.method} Consensus</span>
        </div>
      </Card>

      {/* Dissent Summary if applicable */}
      {result.dissentRecord && result.dissentRecord.length > 0 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Dissenting Opinions
          </h4>
          <div className="space-y-2">
            {result.dissentRecord.slice(0, 2).map((dissent, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{dissent.agentName}:</span>
                <span className="text-gray-700 ml-2">{dissent.reason}</span>
              </div>
            ))}
            {result.dissentRecord.length > 2 && (
              <p className="text-sm text-gray-500">
                +{result.dissentRecord.length - 2} more dissenting opinions
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  icon: React.FC<any>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow';
}> = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <Card className="p-4 text-center">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </Card>
  );
};

/**
 * Empty State
 */
const EmptyState: React.FC<{ onNewTask?: (task: any) => void }> = ({ onNewTask }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Active Debate</h3>
        <p className="text-gray-500 mb-4">
          Start a new task to see agents debate and reach consensus
        </p>
        {onNewTask && (
          <button
            onClick={() => onNewTask({})}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start New Task
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentCoordinationPanel;