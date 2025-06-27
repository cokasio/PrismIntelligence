import { useState, useEffect } from "react"
import { SessionManager } from "@/components/sessions/session-manager"
import { MultiAgentChat } from "@/components/chat/multi-agent-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  BarChart3,
  Bot,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Settings,
  Maximize2,
} from "lucide-react"

interface ChatSession {
  id: number
  title: string
  source: string
  status: string
  createdAt: string
  updatedAt: string
  metadata?: any
  projectId?: number
}

interface AnalysisMetrics {
  totalSessions: number
  activeSessions: number
  completedAnalyses: number
  avgAnalysisTime: string
  successRate: number
}

export function AnalysisPage() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [metrics, setMetrics] = useState<AnalysisMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    completedAnalyses: 0,
    avgAnalysisTime: "0m",
    successRate: 0
  })

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const sessions = await response.json()
        const completed = sessions.filter((s: ChatSession) => s.status === 'completed')
        const active = sessions.filter((s: ChatSession) => s.status === 'processing' || s.status === 'active')
        
        setMetrics({
          totalSessions: sessions.length,
          activeSessions: active.length,
          completedAnalyses: completed.length,
          avgAnalysisTime: "12m", // This would be calculated from actual data
          successRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0
        })
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }

  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSession(session)
  }

  const handleSessionUpdate = (session: ChatSession) => {
    // Update the session and reload metrics
    loadMetrics()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'active': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (isFullscreen && selectedSession) {
    return (
      <div className="h-screen bg-gray-50">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedSession.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(selectedSession.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedSession.status)}
                        <span className="capitalize">{selectedSession.status}</span>
                      </div>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created {new Date(selectedSession.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            </div>
          </div>
          
          {/* Fullscreen Chat */}
          <div className="flex-1">
            <MultiAgentChat 
              sessionId={selectedSession.id} 
              onSessionUpdate={handleSessionUpdate}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Analysis Platform</h1>
              <p className="text-gray-600">AI-powered multi-agent insights for property management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            {selectedSession && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalSessions}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.activeSessions}</p>
                </div>
                <Play className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-900">{metrics.completedAnalyses}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Time</p>
                  <p className="text-2xl font-bold text-orange-900">{metrics.avgAnalysisTime}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">Success Rate</p>
                  <p className="text-2xl font-bold text-pink-900">{metrics.successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Session Manager Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <div className="h-full bg-white border-r border-gray-200">
              <SessionManager 
                onSessionSelect={handleSessionSelect}
                selectedSessionId={selectedSession?.id}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Chat Interface Panel */}
          <ResizablePanel defaultSize={70} minSize={60}>
            <div className="h-full bg-white">
              {selectedSession ? (
                <div className="h-full flex flex-col">
                  {/* Session Header */}
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{selectedSession.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className={getStatusColor(selectedSession.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(selectedSession.status)}
                              <span className="capitalize">{selectedSession.status}</span>
                            </div>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {selectedSession.metadata?.analysisType && (
                              <span className="capitalize">{selectedSession.metadata.analysisType.replace('-', ' ')} Analysis • </span>
                            )}
                            Created {new Date(selectedSession.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Interface */}
                  <div className="flex-1">
                    <MultiAgentChat 
                      sessionId={selectedSession.id} 
                      onSessionUpdate={handleSessionUpdate}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Analysis Session</h3>
                    <p className="text-gray-600 mb-6">
                      Choose an existing session from the left panel or create a new one to start your financial analysis.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Multi-agent AI analysis</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Real-time progress tracking</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Interactive Q&A with agents</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Professional report generation</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}