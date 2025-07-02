        {/* Confidence Learning */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h5 className="font-medium text-purple-800">Confidence</h5>
          </div>
          <div className="text-sm text-purple-700">
            <div className="mb-1">Show: {memory.confidenceThresholds.show.toFixed(2)}</div>
            <div>Accept: {memory.confidenceThresholds.accept.toFixed(2)}</div>
          </div>
        </div>

        {/* Priority Learning */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h5 className="font-medium text-orange-800">Priority</h5>
          </div>
          <div className="text-sm text-orange-700">
            <div className="mb-1">Financial: {(memory.priorityWeights.financial * 100).toFixed(0)}%</div>
            <div>Tenant: {(memory.priorityWeights.tenant * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Adaptation History */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Adaptations
        </h5>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {memory.adaptationHistory.slice(-10).map((adaptation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {adaptation.adaptationType}
                </div>
                <div className="text-xs text-gray-600">
                  {adaptation.reason}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  +{adaptation.performanceChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {adaptation.timestamp.toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {learningReport && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-3">Performance Breakdown</h5>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(learningReport.agentScore.breakdown.timing * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Timing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(learningReport.agentScore.breakdown.relevance * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Relevance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(learningReport.agentScore.breakdown.accuracy * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(learningReport.agentScore.breakdown.userSatisfaction * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export all components
export {
  LearningBadge,
  LearningDashboard,
  AgentDetailView
};