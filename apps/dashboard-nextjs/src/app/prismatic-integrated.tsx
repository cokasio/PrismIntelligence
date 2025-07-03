

// Import the document processing hook
import { useDocumentProcessing, useFormattedInsights } from '@/hooks/useDocumentProcessing'

export default function EnhancedPrismaticDashboard() {
  // ... existing state ...
  
  // Initialize document processing
  const {
    isConnected,
    processingStatus,
    insights,
    agentActivities: liveAgentActivities,
    debateLog,
    uploadDocument,
    submitFeedback
  } = useDocumentProcessing({
    onInsightsReady: (newInsights) => {
      console.log('Insights received:', newInsights)
      setValidatedInsights(newInsights)
    },
    onAgentActivity: (activities) => {
      console.log('Agent activities:', activities)
    },
    onDebateUpdate: (debate) => {
      console.log('Debate update:', debate)
    }
  })

  const formattedInsights = useFormattedInsights(insights)

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const taskId = await uploadDocument(file)
      console.log('Upload started, task ID:', taskId)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  // Handle feedback submission
  const handleInsightFeedback = async (
    insightId: string,
    feedbackType: 'accepted' | 'rejected' | 'modified',
    agentId: string
  ) => {
    try {
      await submitFeedback(insightId, feedbackType, agentId)
      console.log('Feedback submitted')
    } catch (error) {
      console.error('Feedback submission failed:', error)
    }
  }

  // Update the file upload button to use real handler
  const FileUploadSection = () => (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.xlsx,.xls,.csv"
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center cursor-pointer"
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-600">Upload a document</span>
        <span className="text-xs text-gray-400 mt-1">PDF, Excel, CSV</span>
      </label>
      
      {processingStatus !== 'idle' && (
        <div className="mt-4 text-center">
          <div className="text-sm font-medium">
            Status: {processingStatus}
          </div>
          {processingStatus === 'processing' && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Update insights display to show real insights
  const InsightsPanel = () => (
    <div className="space-y-4">
      {formattedInsights.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Upload a document to see AI-generated insights</p>
        </div>
      ) : (
        formattedInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{insight.icon}</span>
                  <Badge style={{ backgroundColor: insight.color + '20', color: insight.color }}>
                    {insight.category}
                  </Badge>
                  <Badge variant="outline">{insight.priorityLabel}</Badge>
                  {insight.validation?.valid && <ProofBadge validation={insight.validation} />}
                </div>
                <p className="text-sm text-gray-800">{insight.formattedMessage}</p>
                {insight.agentId && (
                  <p className="text-xs text-gray-500 mt-1">Source: {insight.agentId}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInsightFeedback(insight.id, 'accepted', insight.agentId)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInsightFeedback(insight.id, 'rejected', insight.agentId)}
              >
                Reject
              </Button>
              {insight.validation?.contradictions?.length > 0 && (
                <Button size="sm" variant="outline">
                  View Debate
                </Button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  )

  // Update agent activities to show live data
  const AgentActivityPanel = () => (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 mb-3">Agent Activity</h3>
      
      {/* Connection status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {/* Live agent activities */}
      {liveAgentActivities.length > 0 ? (
        liveAgentActivities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
          >
            <div className="relative">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              {activity.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{activity.agentName}</div>
              <div className="text-xs text-gray-500">{activity.proposal || activity.status}</div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">Waiting for agent activity...</p>
        </div>
      )}
      
      {/* Debate log preview */}
      {debateLog.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Debate</h4>
          <div className="space-y-2">
            {debateLog.slice(-3).map((entry, index) => (
              <div key={index} className="text-xs bg-gray-50 rounded p-2">
                <span className="font-medium">{entry.agentId}:</span> {entry.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Update the return statement to use real components
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Cognitive Inbox */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Existing inbox code... */}
      </div>

      {/* Center Panel - Conversational Control */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <FileUploadSection />
          <div className="mt-6">
            <InsightsPanel />
          </div>
        </div>
        {/* Existing input section... */}
      </div>

      {/* Right Panel - Agent Activity */}
      <div className="w-96 bg-white border-l border-gray-200 p-6">
        <AgentActivityPanel />
      </div>
    </div>
  )
}
