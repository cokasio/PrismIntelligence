import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles,
  Brain,
  DollarSign,
  Users,
  Wrench,
  Scale,
  Pause,
  Play,
  RotateCcw,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Building
} from 'lucide-react'

export interface Agent {
  id: string
  name: string
  type: 'financial' | 'tenant' | 'maintenance' | 'legal'
  status: 'idle' | 'active' | 'completed' | 'error'
  currentAction?: string
  confidence?: number
  timestamp?: Date
}

interface AgentActivityProps {
  agents: Agent[]
  recentTasks: any[]
  onAgentControl: (agentId: string, action: 'pause' | 'resume' | 'retry' | 'reassign') => void
}

const agentIcons = {
  financial: DollarSign,
  tenant: Users,
  maintenance: Wrench,
  legal: Scale
}

const agentColors = {
  financial: 'from-yellow-400 to-orange-500',
  tenant: 'from-blue-400 to-blue-600',
  maintenance: 'from-green-400 to-emerald-500',
  legal: 'from-red-400 to-red-600'
}

export function AgentActivity({ agents, recentTasks, onAgentControl }: AgentActivityProps) {
  return (
    <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Agent Activity
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Agents */}
          <Card className="p-4 border-0 shadow-sm bg-white">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Active Agents
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {agents.filter(a => a.status === 'active').map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onControl={onAgentControl} />
                ))}
              </AnimatePresence>
            </div>
          </Card>

          {/* Recent Tasks */}
          <Card className="p-4 border-0 shadow-sm bg-white">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Recent Tasks
            </h3>
            <div className="space-y-2">
              {recentTasks.map((task, index) => (
                <TaskItem key={index} task={task} />
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 border-0 shadow-sm bg-white">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload Doc
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                View Alerts
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Building className="w-4 h-4 mr-2" />
                Properties
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}

function AgentCard({ agent, onControl }: { agent: Agent; onControl: Function }) {
  const Icon = agentIcons[agent.type]
  const gradient = agentColors[agent.type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3"
    >
      <div className="relative">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {agent.status === 'active' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          />
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{agent.name}</p>
        <p className="text-xs text-gray-500">{agent.currentAction}</p>
        {agent.confidence && (
          <div className="mt-1">
            <Progress value={agent.confidence * 100} className="h-1" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">
          {agent.confidence ? `${Math.round(agent.confidence * 100)}%` : 'Active'}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onControl(agent.id, 'pause')}
        >
          <Pause className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  )
}

function TaskItem({ task }: { task: any }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
        <CheckCircle className="w-3 h-3 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{task.title}</p>
        <p className="text-xs text-gray-500">{task.timestamp} • {task.value}</p>
      </div>
    </div>
  )
}

// Human Override Controls Component
export function HumanOverridePanel({ agent, onAction }: { agent: Agent; onAction: Function }) {
  return (
    <Card className="p-4 border-yellow-200 bg-yellow-50">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        Human Override Options
      </h4>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onAction('pause')}
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause Agent
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onAction('retry')}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry Task
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => onAction('reassign')}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Reassign to Human
        </Button>
      </div>
    </Card>
  )
}
