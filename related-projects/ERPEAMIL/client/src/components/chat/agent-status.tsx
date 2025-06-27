import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Mail, Activity, Clock, CheckCircle, AlertCircle, Zap, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagicCard, AnimatedNumber } from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import { AgentActivity } from '@shared/schema';

interface AgentStatusProps {
  sessionId?: number;
  onClose?: () => void;
}

interface AgentInfo {
  name: string;
  displayName: string;
  description: string;
  model: string;
  provider: string;
  color: string;
  initials: string;
}

const AGENTS: AgentInfo[] = [
  {
    name: 'income_analyst',
    displayName: 'Income Analyst',
    description: 'Analyzing revenue patterns and profitability trends',
    model: 'GPT-4',
    provider: 'OpenAI',
    color: 'feature-icon-blue',
    initials: 'IA'
  },
  {
    name: 'balance_analyst',
    displayName: 'Balance Analyst',
    description: 'Evaluating asset structure and capital allocation',
    model: 'Claude',
    provider: 'Anthropic',
    color: 'feature-icon-pink',
    initials: 'BA'
  },
  {
    name: 'cashflow_analyst',
    displayName: 'Cash Flow Analyst',
    description: 'Analyzing cash generation and investment patterns',
    model: 'Gemini',
    provider: 'Google',
    color: 'feature-icon-orange',
    initials: 'CA'
  },
  {
    name: 'strategic_advisor',
    displayName: 'Strategic Advisor',
    description: 'Ready to synthesize insights and recommendations',
    model: 'DeepSeek',
    provider: 'DeepSeek',
    color: 'feature-icon-blue',
    initials: 'SA'
  }
];

export function AgentStatus({ sessionId, onClose }: AgentStatusProps) {
  const [agentStates, setAgentStates] = useState<Record<string, string>>({});

  const { data: activities = [] } = useQuery<AgentActivity[]>({
    queryKey: ['/api/sessions', sessionId, 'agents'],
    enabled: !!sessionId,
    refetchInterval: sessionId ? 5000 : false,
    staleTime: 2000,
  });

  // Update agent states based on activities
  useEffect(() => {
    if (!activities || activities.length === 0) {
      setAgentStates({});
      return;
    }
    
    const newStates: Record<string, string> = {};
    
    activities.forEach(activity => {
      newStates[activity.agentName] = activity.status;
    });

    // Only update if there are actual changes
    setAgentStates(prevStates => {
      const hasChanges = JSON.stringify(prevStates) !== JSON.stringify(newStates);
      return hasChanges ? newStates : prevStates;
    });
  }, [activities]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'processing':
        return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Waiting';
    }
  };

  // Calculate overall progress
  const completedAgents = Object.values(agentStates).filter(status => status === 'completed').length;
  const totalAgents = AGENTS.length;
  const overallProgress = totalAgents > 0 ? (completedAgents / totalAgents) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="feature-icon-pink w-12 h-12 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Agent Status</h2>
            <p className="text-sm text-muted-foreground">Multi-agent financial analysis system</p>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              <AnimatedNumber value={completedAgents} className="font-semibold" />/{totalAgents}
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Agents */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {AGENTS.map((agent, index) => {
            const status = agentStates[agent.name] || 'waiting';
            return (
              <MagicCard key={agent.name} className="p-4" hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agent.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {agent.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{agent.displayName}</h3>
                      <p className="text-xs text-muted-foreground">{agent.model} • {agent.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className={`text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {status === 'completed' ? 'Analysis Complete' : 'Ready'}
                  </Badge>
                  {status === 'processing' && (
                    <div className="flex items-center space-x-1">
                      <Activity className="h-3 w-3 text-primary animate-pulse" />
                      <span className="text-xs text-primary">Processing...</span>
                    </div>
                  )}
                </div>
              </MagicCard>
            );
          })}
        </div>

        {/* Email Integration Status */}
        <MagicCard className="mt-6 gradient-background p-6" hover={false}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Email Integration</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Connected</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm text-white/80">
            <p>Monitoring: finance@yourcompany.com</p>
            <p>Last check: 2 minutes ago</p>
          </div>
        </MagicCard>

        {/* Session Stats */}
        {sessionId && (
          <MagicCard className="mt-4 p-6" hover={false}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="feature-icon-orange w-10 h-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">Session Metrics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <AnimatedNumber value={3} />
                </div>
                <div className="text-xs text-muted-foreground">Files Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <AnimatedNumber value={12} />
                </div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div className="text-center col-span-2">
                <div className="text-lg font-semibold text-foreground">8m 42s</div>
                <div className="text-xs text-muted-foreground">Processing Time</div>
              </div>
            </div>
          </MagicCard>
        )}
      </ScrollArea>
    </div>
  );
}
