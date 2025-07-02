/**
 * Agent Coordination UI Components - Part 2: Debate Timeline
 * Visualizes the debate process between agents
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Users,
  Zap,
  Shield,
  Gavel
} from 'lucide-react';
import { DebateEntry, ConsensusResult, DissentRecord } from '../../../agent-coordination/a2a2-protocol';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Debate Timeline Component
 */
export const DebateTimeline: React.FC<{ entries: DebateEntry[] }> = ({ entries }) => {
  const phaseIcons = {
    proposal: MessageCircle,
    challenge: AlertCircle,
    resolution: Shield,
    consensus: Gavel
  };

  const phaseColors = {
    proposal: 'bg-blue-100 text-blue-600',
    challenge: 'bg-orange-100 text-orange-600',
    resolution: 'bg-purple-100 text-purple-600',
    consensus: 'bg-green-100 text-green-600'
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline entries */}
      <div className="space-y-6">
        {entries.map((entry, idx) => {
          const Icon = phaseIcons[entry.phase];
          const colorClass = phaseColors[entry.phase];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-start gap-4"
            >
              {/* Phase icon */}
              <div className={`relative z-10 w-16 h-16 rounded-full ${colorClass} flex items-center justify-center`}>
                <Icon className="w-8 h-8" />
              </div>

              {/* Entry content */}
              <Card className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {entry.phase}
                    </Badge>
                    <span className="ml-2 text-sm font-medium">
                      {getAgentDisplayName(entry.agentId)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700">{entry.content}</p>
                
                {/* Action indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Action:</span>
                  <Badge variant="secondary" className="text-xs">
                    {entry.action}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Agent Proposals View
 */
export const ProposalsView: React.FC<{ result: ConsensusResult }> = ({ result }) => {
  // Extract proposals from debate log
  const proposals = result.debateLog
    .filter(entry => entry.phase === 'proposal')
    .map(entry => ({
      agentId: entry.agentId,
      agentName: getAgentDisplayName(entry.agentId),
      proposal: entry.content,
      timestamp: entry.timestamp
    }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        Agent Proposals
      </h3>

      {proposals.map((proposal, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {proposal.agentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{proposal.agentName}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(proposal.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Show if this agent supported the final decision */}
              {result.supportingAgents.includes(proposal.agentId) ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Supported
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Dissented
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-700">{proposal.proposal}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Consensus Details View
 */
export const ConsensusDetails: React.FC<{ result: ConsensusResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Consensus Process */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          Consensus Process
        </h3>
        
        <div className="space-y-4">
          {/* Method */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Method</h4>
            <p className="capitalize">{result.method} Consensus</p>
          </div>
          
          {/* Confidence */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Overall Confidence</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Supporting Agents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Supporting Agents ({result.supportingAgents.length})
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {result.supportingAgents.map((agentId, idx) => (
            <Badge key={idx} className="bg-green-100 text-green-700">
              {getAgentDisplayName(agentId)}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Dissenting Agents */}
      {result.dissentingAgents.length > 0 && (
        <Card className="p-6 border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Dissenting Agents ({result.dissentingAgents.length})
          </h3>
          
          {result.dissentRecord && (
            <div className="space-y-3">
              {result.dissentRecord.map((dissent, idx) => (
                <DissentCard key={idx} dissent={dissent} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Logic Validation */}
      {result.logicTrace.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Logic Validation
          </h3>
          
          <div className="space-y-2">
            {result.logicTrace.map((trace, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {trace.valid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm">{trace.explanation}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Dissent Card Component
 */
const DissentCard: React.FC<{ dissent: DissentRecord }> = ({ dissent }) => {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{dissent.agentName}</h4>
        <Badge variant="outline" className="text-xs">
          Confidence: {(dissent.confidence * 100).toFixed(0)}%
        </Badge>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">Reason:</span> {dissent.reason}
      </p>
      
      <p className="text-sm text-gray-600">
        <span className="font-medium">Alternative:</span> {dissent.alternativeConclusion}
      </p>
    </div>
  );
};

/**
 * Helper function to get display name for agent
 */
function getAgentDisplayName(agentId: string): string {
  const agentNames: Record<string, string> = {
    'finance-bot': 'FinanceBot',
    'tenant-bot': 'TenantBot',
    'maintenance-bot': 'MaintenanceBot',
    'legal-bot': 'LegalBot',
    'insight-gen': 'InsightGenerator',
    'risk-flag': 'RiskFlagger',
    'compliance': 'ComplianceAgent',
    'system': 'System'
  };
  
  return agentNames[agentId] || agentId;
}

export { getAgentDisplayName };