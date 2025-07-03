'use client'

import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseDocumentProcessingOptions {
  onInsightsReady?: (insights: any[]) => void
  onAgentActivity?: (activity: any) => void
  onDebateUpdate?: (debate: any) => void
  onError?: (error: any) => void
}

export function useDocumentProcessing(options: UseDocumentProcessingOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>('idle')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [agentActivities, setAgentActivities] = useState<any[]>([])
  const [debateLog, setDebateLog] = useState<any[]>([])

  // Initialize WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      path: '/ws',
      transports: ['websocket']
    })

    socketInstance.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    // Event handlers
    socketInstance.on('status', (data) => {
      setProcessingStatus(data.status)
    })

    socketInstance.on('agent-activity', (activities) => {
      setAgentActivities(activities)
      options.onAgentActivity?.(activities)
    })

    socketInstance.on('debate-update', (debate) => {
      setDebateLog(prev => [...prev, debate])
      options.onDebateUpdate?.(debate)
    })

    socketInstance.on('insights-ready', (newInsights) => {
      setInsights(newInsights)
      setProcessingStatus('complete')
      options.onInsightsReady?.(newInsights)
    })

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error)
      setProcessingStatus('error')
      options.onError?.(error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Upload document function
  const uploadDocument = useCallback(async (file: File, documentType?: string) => {
    try {
      setProcessingStatus('uploading')
      setInsights([])
      setAgentActivities([])
      setDebateLog([])

      const formData = new FormData()
      formData.append('document', file)
      if (documentType) {
        formData.append('documentType', documentType)
      }

      const userId = localStorage.getItem('userId') || 'anonymous'
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'user-id': userId
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { taskId } = await response.json()
      setCurrentTaskId(taskId)
      setProcessingStatus('processing')

      // Subscribe to updates for this task
      if (socket && isConnected) {
        socket.emit('subscribe', { taskId, userId })
      }

      return taskId

    } catch (error) {
      console.error('Upload error:', error)
      setProcessingStatus('error')
      options.onError?.(error)
      throw error
    }
  }, [socket, isConnected, options])

  // Submit feedback for reinforcement learning
  const submitFeedback = useCallback(async (
    insightId: string,
    feedbackType: 'accepted' | 'rejected' | 'modified',
    agentId: string,
    editedContent?: string
  ) => {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous'
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insightId,
          feedbackType,
          userId,
          agentId,
          editedContent,
          taskType: 'property_management'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      return await response.json()

    } catch (error) {
      console.error('Feedback error:', error)
      throw error
    }
  }, [])

  // Get debate details
  const getDebateDetails = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/debate/${taskId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch debate')
      }
      return await response.json()
    } catch (error) {
      console.error('Debate fetch error:', error)
      throw error
    }
  }, [])

  return {
    // State
    isConnected,
    processingStatus,
    currentTaskId,
    insights,
    agentActivities,
    debateLog,
    
    // Actions
    uploadDocument,
    submitFeedback,
    getDebateDetails
  }
}

// Helper hook for formatted insights
export function useFormattedInsights(insights: any[]) {
  return insights.map(insight => ({
    ...insight,
    icon: getInsightIcon(insight.category),
    color: getInsightColor(insight.category),
    priorityLabel: getPriorityLabel(insight.displayPriority)
  }))
}

// Helper functions
function getInsightIcon(category: string) {
  const icons: Record<string, string> = {
    financial: '💰',
    tenant: '👥',
    maintenance: '🔧',
    legal: '⚖️',
    synthesized: '🤝'
  }
  return icons[category] || '💡'
}

function getInsightColor(category: string) {
  const colors: Record<string, string> = {
    financial: '#FFD700',
    tenant: '#4A90E2',
    maintenance: '#7ED321',
    legal: '#D0021B',
    synthesized: '#9B59B6'
  }
  return colors[category] || '#95A5A6'
}

function getPriorityLabel(priority: number) {
  if (priority >= 90) return 'Critical'
  if (priority >= 70) return 'High'
  if (priority >= 50) return 'Medium'
  return 'Low'
}
