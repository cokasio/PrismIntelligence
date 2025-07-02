/**
 * Logic Proof UI Components - Display formal logic validation in Prism Intelligence
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  GitBranch,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react';
import { ValidatedInsight } from '../../../logic-layer/agent-wrapper';

interface ProofBadgeProps {
  validation: ValidatedInsight['validation'];
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Proof Badge - Shows validation status with tooltip
 */
export const ProofBadge: React.FC<ProofBadgeProps> = ({ validation, size = 'sm' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',    lg: 'w-10 h-10 text-base'
  };

  const getStatusColor = () => {
    if (!validation) return 'bg-gray-200';
    if (validation.valid) return 'bg-green-500';
    if (validation.contradictions && validation.contradictions.length > 0) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusIcon = () => {
    if (!validation) return <AlertCircle className="w-4 h-4" />;
    if (validation.valid) return <CheckCircle2 className="w-4 h-4" />;
    if (validation.contradictions && validation.contradictions.length > 0) {
      return <XCircle className="w-4 h-4" />;
    }
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="relative inline-block">
      <motion.div
        className={`${sizeClasses[size]} ${getStatusColor()} rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg`}
        whileHover={{ scale: 1.1 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getStatusIcon()}
      </motion.div>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            <div className="text-sm">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Logic Validation
              </div>
              <div className="text-gray-600">
                {validation.valid ? (
                  <span className="text-green-600">✓ Logically proven</span>
                ) : (
                  <span className="text-red-600">✗ Cannot prove logically</span>
                )}
              </div>
              {validation.confidence && (
                <div className="mt-1">
                  Confidence: {(validation.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>    </div>
  );
};

interface ProofChainViewerProps {
  insight: ValidatedInsight;
  expanded?: boolean;
}

/**
 * Proof Chain Viewer - Shows step-by-step logical proof
 */
export const ProofChainViewer: React.FC<ProofChainViewerProps> = ({ insight, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!insight.validation.proofChain) return null;

  return (
    <motion.div
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2"
      initial={{ height: isExpanded ? 'auto' : '40px' }}
      animate={{ height: isExpanded ? 'auto' : '40px' }}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Logical Proof</span>
          <ProofBadge validation={insight.validation} size="sm" />        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-blue-600"
        >
          ▼
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="text-sm space-y-2">
              <div className="font-mono text-xs text-gray-600 mb-2">
                Rule: {insight.validation.proofChain.rule.form}
              </div>
              
              {insight.validation.proofChain.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2"
                >                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{step.operation}</div>
                    <div className="text-gray-600">{step.justification}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Conclusion:</strong> {insight.conclusion}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ContradictionAlertProps {
  contradictions: ValidatedInsight['contradictions'];
}

/**
 * Contradiction Alert - Displays detected contradictions
 */export const ContradictionAlert: React.FC<ContradictionAlertProps> = ({ contradictions }) => {
  if (!contradictions || contradictions.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <div className="font-semibold text-red-700 flex items-center gap-2 mb-2">
        <XCircle className="w-5 h-5" />
        Logical Contradictions Detected
      </div>
      
      <div className="space-y-2">
        {contradictions.map((contradiction, idx) => (
          <motion.div
            key={idx}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}            className={`p-3 rounded-lg border ${getSeverityColor(contradiction.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium">
                  Conflict with {contradiction.with}
                </div>
                <div className="text-sm mt-1">
                  {contradiction.details}
                </div>
              </div>
              <div className="text-xs font-medium uppercase ml-2">
                {contradiction.severity}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

interface LogicPanelProps {
  insights: ValidatedInsight[];
}

/**
 * Logic Panel - Shows all logical validations in the agent activity feed
 */
export const LogicPanel: React.FC<LogicPanelProps> = ({ insights }) => {
  const validCount = insights.filter(i => i.validation.valid).length;  const contradictionCount = insights.reduce((sum, i) => 
    sum + (i.contradictions?.length || 0), 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Critical Thinking Layer
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-600">
            ✓ {validCount} proven
          </span>
          {contradictionCount > 0 && (
            <span className="text-red-600">
              ⚠ {contradictionCount} conflicts
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}            className="border border-gray-100 rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800 flex items-center gap-2">
                  {insight.agentName}
                  <ProofBadge validation={insight.validation} size="sm" />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {insight.conclusion}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(insight.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {insight.contradictions && insight.contradictions.length > 0 && (
              <ContradictionAlert contradictions={insight.contradictions} />
            )}

            {insight.validation.valid && insight.logicalProof && (
              <ProofChainViewer insight={insight} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LogicPanel;