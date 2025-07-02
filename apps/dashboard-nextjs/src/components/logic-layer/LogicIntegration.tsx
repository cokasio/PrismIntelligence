/**
 * Logic Layer Integration - How to use Critical Thinking in Prism Intelligence
 */

import React, { useEffect, useState } from 'react';
import { LogicalAgentFactory, ValidatedInsight } from '../../logic-layer/agent-wrapper';
import { LogicPanel, ProofBadge } from '../components/logic-layer/LogicComponents';

/**
 * Example: Integrating Logic Layer into the existing Agent Activity Panel
 */
export const EnhancedAgentActivityPanel: React.FC = () => {
  const [validatedInsights, setValidatedInsights] = useState<ValidatedInsight[]>([]);

  useEffect(() => {
    // Simulate agent activity with logical validation
    const runAgentSimulation = async () => {
      // 1. Create logically-wrapped agents
      const insightAgent = LogicalAgentFactory.createAgent('InsightGeneratorAgent');
      const complianceAgent = LogicalAgentFactory.createAgent('ComplianceAgent');
      const riskAgent = LogicalAgentFactory.createAgent('RiskFlaggerAgent');
      const synthesisAgent = LogicalAgentFactory.createAgent('SynthesisAgent');

      // 2. Generate insights with validation
      const insights: ValidatedInsight[] = [];

      // Example data from document processing
      const propertyData = {
        expenseIncrease: 15000,
        revenueGrowth: 0,
        dscr: 1.1,
        liquidityDays: 45,
        latePayments: 3,
        complaints: 4
      };

      // Generate and validate insights
      const marginInsight = await (insightAgent as any).generateInsight(propertyData);
      insights.push(marginInsight);

      const complianceInsight = await (complianceAgent as any).checkCompliance(propertyData);
      insights.push(complianceInsight);

      const riskInsight = await (riskAgent as any).assessRisk(propertyData);
      insights.push(riskInsight);

      // Synthesize all insights with cross-validation
      const synthesis = await (synthesisAgent as any).synthesize(insights);
      insights.push(synthesis);

      setValidatedInsights(insights);
    };

    // Run simulation on mount
    runAgentSimulation();

    // Set up interval for continuous updates
    const interval = setInterval(runAgentSimulation, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Logic validation summary */}
      <LogicPanel insights={validatedInsights} />

      {/* Existing agent activity with proof badges */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Agent Activity</h3>
        
        <div className="space-y-3">
          {validatedInsights.map((insight, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">{insight.agentName}</span>
                <ProofBadge validation={insight.validation} size="sm" />
              </div>
              <span className="text-sm text-gray-600">
                {insight.validation.valid ? 'Proven' : 'Unproven'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Adding Logic Validation to Inbox Items
 */
export const LogicalInboxItem: React.FC<{
  item: any;
  onClick: () => void;
}> = ({ item, onClick }) => {
  const [validation, setValidation] = useState<ValidatedInsight | null>(null);

  useEffect(() => {
    const validateItem = async () => {
      // Create appropriate agent based on category
      const agentType = item.category === 'financial' ? 'ComplianceAgent' : 
                       item.category === 'tenant' ? 'RiskFlaggerAgent' : 
                       'InsightGeneratorAgent';
      
      const agent = LogicalAgentFactory.createAgent(agentType);
      
      // Validate the item's insights
      const validated = await agent.validateInsight({
        agentName: agentType,
        conclusion: item.insight,
        evidence: item.evidence || [],
        timestamp: new Date()
      });

      setValidation(validated);
    };

    validateItem();
  }, [item]);

  return (
    <div 
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{item.subject}</h4>
            {validation && <ProofBadge validation={validation.validation} size="sm" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.preview}</p>
        </div>
        
        {validation?.contradictions && validation.contradictions.length > 0 && (
          <div className="ml-2 text-red-600">
            <span className="text-xs">⚠ {validation.contradictions.length} conflicts</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Example: Logic-Enhanced Task Creation
 */
export const LogicalTaskCreation: React.FC<{
  insights: ValidatedInsight[];
  onCreateTask: (task: any) => void;
}> = ({ insights, onCreateTask }) => {
  const handleCreateTasks = () => {
    // Only create tasks for logically proven insights
    const provenInsights = insights.filter(i => i.validation.valid);
    
    provenInsights.forEach(insight => {
      const task = {
        title: `Action Required: ${insight.conclusion}`,
        description: `This task is backed by logical proof: ${insight.validation.explanation}`,
        priority: insight.validation.confidence > 0.9 ? 'high' : 'medium',
        proof: insight.logicalProof,
        agentSource: insight.agentName,
        createdAt: new Date()
      };
      
      onCreateTask(task);
    });
  };

  const provenCount = insights.filter(i => i.validation.valid).length;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-800 mb-2">Logical Task Generation</h3>
      <p className="text-sm text-blue-600 mb-3">
        {provenCount} insights have been logically proven and can generate tasks.
      </p>
      
      <button
        onClick={handleCreateTasks}
        disabled={provenCount === 0}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          provenCount > 0 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Create {provenCount} Proven Tasks
      </button>
    </div>
  );
};

export default EnhancedAgentActivityPanel;
