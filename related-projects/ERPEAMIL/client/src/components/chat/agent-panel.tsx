import { useQuery } from '@tanstack/react-query';
import { Bot, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AgentActivity } from '@shared/schema';

interface AgentPanelProps {
  sessionId?: number;
}

const AGENT_INFO = {
  income_analyst: {
    name: 'Income Analyst',
    description: 'Analyzing revenue patterns and profitability trends',
    color: '#FF1B6B',
  },
  balance_analyst: {
    name: 'Balance Analyst',
    description: 'Evaluating asset structure and capital allocation',
    color: '#FF8A00',
  },
  cashflow_analyst: {
    name: 'Cash Flow Analyst',
    description: 'Analyzing cash generation and investment patterns',
    color: '#17A2B8',
  },
  strategic_advisor: {
    name: 'Strategic Advisor',
    description: 'Synthesizing insights and recommendations',
    color: '#8B5CF6',
  },
};

export function AgentPanel({ sessionId }: AgentPanelProps) {
  const { data: activities = [] } = useQuery<AgentActivity[]>({
    queryKey: ['/api/sessions', sessionId, 'activities'],
    enabled: !!sessionId,
    refetchInterval: 1000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Agent Status</h3>
            <p className="text-xs text-gray-500">Multi-agent financial analysis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!sessionId ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Select a session to view agent activity</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Waiting for analysis to begin</p>
            <p className="text-xs text-gray-400 mt-1">Upload documents to start</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(AGENT_INFO).map(([agentKey, agent]) => {
              const agentActivities = activities.filter(a => a.agentName === agentKey);
              const latestActivity = agentActivities[agentActivities.length - 1];

              return (
                <div key={agentKey} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                    </div>
                    {latestActivity && getStatusIcon(latestActivity.status)}
                  </div>

                  {latestActivity && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{latestActivity.activity}</span>
                      </div>
                      {latestActivity.status === 'processing' && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: '60%',
                                background: `linear-gradient(90deg, ${agent.color} 0%, ${agent.color}dd 100%)`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}