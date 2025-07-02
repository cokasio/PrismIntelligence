/**
 * Swarm Executor UI Components
 * Visual components for displaying model routing and execution status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Cloud,
  Monitor,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Activity,
  Lock,
  Globe,
  Cpu
} from 'lucide-react';
import { SwarmExecutionResult, ModelAssignment, ContradictionFlag } from '../../../swarm-executor/swarm-executor';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SwarmExecutorPanelProps {
  executionResult?: SwarmExecutionResult;
  privacyMode: 'local' | 'hybrid' | 'cloud';
  onPrivacyModeChange: (mode: 'local' | 'hybrid' | 'cloud') => void;
}

/**
 * Main Swarm Executor Panel
 */
export const SwarmExecutorPanel: React.FC<SwarmExecutorPanelProps> = ({
  executionResult,
  privacyMode,
  onPrivacyModeChange
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header with Privacy Mode Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold">Dynamic Swarm Executor</h2>
          </div>
          
          <PrivacyModeToggle 
            mode={privacyMode} 
            onChange={onPrivacyModeChange} 
          />
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
        <TabsList className="px-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Model Routing</TabsTrigger>
          <TabsTrigger value="logic">Logic Validation</TabsTrigger>
          <TabsTrigger value="timeline">Execution Timeline</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-4">
            <ExecutionOverview result={executionResult} />
          </TabsContent>

          <TabsContent value="models" className="p-4">
            <ModelRoutingView result={executionResult} />
          </TabsContent>

          <TabsContent value="logic" className="p-4">
            <LogicValidationView result={executionResult} />
          </TabsContent>

          <TabsContent value="timeline" className="p-4">
            <ExecutionTimeline result={executionResult} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
/**
 * Privacy Mode Toggle Component
 */
const PrivacyModeToggle: React.FC<{
  mode: 'local' | 'hybrid' | 'cloud';
  onChange: (mode: 'local' | 'hybrid' | 'cloud') => void;
}> = ({ mode, onChange }) => {
  const modes = [
    { value: 'local', icon: Lock, label: 'Local', color: 'text-green-600' },
    { value: 'hybrid', icon: Shield, label: 'Hybrid', color: 'text-blue-600' },
    { value: 'cloud', icon: Globe, label: 'Cloud', color: 'text-purple-600' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {modes.map((m) => (
        <motion.button
          key={m.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(m.value as any)}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${mode === m.value 
              ? 'bg-white shadow-sm ' + m.color 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >          <m.icon className="w-4 h-4" />
          {m.label}
        </motion.button>
      ))}
    </div>
  );
};

/**
 * Execution Overview Component
 */
const ExecutionOverview: React.FC<{ result?: SwarmExecutionResult }> = ({ result }) => {
  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No execution data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Thought Process */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Thought Process
        </h3>
        <div className="space-y-2">          {result.thoughtProcess.map((thought, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2"
            >
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                {idx + 1}
              </div>
              <p className="text-sm text-gray-700">{thought}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Execution Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Execution Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {result.subtaskPlan.length}
            </div>
            <div className="text-sm text-gray-600">Subtasks</div>
          </div>