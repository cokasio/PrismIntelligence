import { useState, useEffect, useRef } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Send,
  Bot,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  MessageSquare,
} from "lucide-react"

interface ChatMessage {
  id: number
  sessionId: number
  sender: string
  content: string
  messageType: string
  timestamp: string
  metadata?: any
}

interface AgentStatus {
  name: string
  displayName: string
  status: 'waiting' | 'processing' | 'completed' | 'error'
  progress: number
  model: string
  avatar: string
  color: string
}

interface MultiAgentChatProps {
  sessionId: number
  onSessionUpdate?: (session: any) => void
}

const agentConfig: Record<string, AgentStatus> = {
  income_analyst: {
    name: 'income_analyst',
    displayName: 'Income Analyst',
    status: 'waiting',
    progress: 0,
    model: 'GPT-4o • OpenAI',
    avatar: 'IA',
    color: 'bg-blue-500'
  },
  balance_analyst: {
    name: 'balance_analyst', 
    displayName: 'Balance Analyst',
    status: 'waiting',
    progress: 0,
    model: 'Claude • Anthropic',
    avatar: 'BA',
    color: 'bg-pink-500'
  },
  cashflow_analyst: {
    name: 'cashflow_analyst',
    displayName: 'Cash Flow Analyst', 
    status: 'waiting',
    progress: 0,
    model: 'Gemini • Google',
    avatar: 'CA',
    color: 'bg-orange-500'
  },
  strategic_advisor: {
    name: 'strategic_advisor',
    displayName: 'Strategic Advisor',
    status: 'waiting', 
    progress: 0,
    model: 'DeepSeek • DeepSeek',
    avatar: 'SA',
    color: 'bg-blue-600'
  }
}

export function MultiAgentChat({ sessionId, onSessionUpdate }: MultiAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [agents, setAgents] = useState<Record<string, AgentStatus>>(agentConfig)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // WebSocket connection
  const { isConnected, sendMessage, joinSession } = useWebSocket({
    onMessage: (data: any) => {
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message])
      } else if (data.type === 'agent_status_update') {
        setAgents(prev => ({
          ...prev,
          [data.agent]: {
            ...prev[data.agent],
            status: data.status,
            progress: data.status === 'completed' ? 100 : data.status === 'processing' ? 75 : 0
          }
        }))
      }
    }
  })

  // Load existing messages
  useEffect(() => {
    loadMessages()
  }, [sessionId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Join session on WebSocket connection
  useEffect(() => {
    if (isConnected && sessionId) {
      joinSession(sessionId)
    }
  }, [isConnected, sessionId, joinSession])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected) return

    const messageData = {
      content: inputMessage,
      source: 'upload'
    }

    sendMessage({
      type: 'chat_message',
      sessionId: sessionId,
      data: messageData
    })

    setInputMessage("")
    
    // Check if this triggers analysis
    if (inputMessage.toLowerCase().includes('analyze') || inputMessage.toLowerCase().includes('financial')) {
      setIsAnalyzing(true)
      // Reset agent statuses
      setAgents(agentConfig)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`/api/sessions/${sessionId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUploadedFiles(prev => [...prev, ...result.results.map((r: any) => r.document.filename)])
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const getMessageIcon = (sender: string, messageType: string) => {
    if (sender === 'user') return <User className="w-4 h-4" />
    if (sender === 'system') {
      if (messageType === 'file') return <FileText className="w-4 h-4" />
      return <AlertCircle className="w-4 h-4" />
    }
    return <Bot className="w-4 h-4" />
  }

  const getAgentColor = (sender: string) => {
    return agentConfig[sender]?.color || 'bg-gray-500'
  }

  const getAgentDisplayName = (sender: string) => {
    return agentConfig[sender]?.displayName || sender.replace('_', ' ')
  }

  const overallProgress = Object.values(agents).reduce((sum, agent) => sum + agent.progress, 0) / Object.keys(agents).length

  return (
    <div className="flex flex-col h-full">
      {/* Agent Status Bar */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Multi-Agent Analysis</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Overall Progress:</span>
            <span className="text-sm font-bold">{Math.round(overallProgress)}%</span>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2 mb-3" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.values(agents).map((agent) => (
            <div key={agent.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center text-white font-semibold text-xs`}>
                {agent.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{agent.displayName}</p>
                <div className="flex items-center gap-1">
                  {agent.status === 'waiting' && <Clock className="w-3 h-3 text-gray-400" />}
                  {agent.status === 'processing' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  {agent.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {agent.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                  <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Financial Analysis</h3>
              <p className="text-gray-600 mb-4">Upload your financial documents and start a conversation with our AI agents.</p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Financial Documents
              </Button>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-blue-500' : 
                  message.sender === 'system' ? 'bg-gray-500' :
                  getAgentColor(message.sender)
                }`}>
                  <div className="text-white">
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.sender === 'system' ? (
                      getMessageIcon(message.sender, message.messageType)
                    ) : (
                      <span className="text-xs font-semibold">
                        {agentConfig[message.sender]?.avatar || 'AI'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {message.sender === 'user' ? 'You' : 
                       message.sender === 'system' ? 'System' :
                       getAgentDisplayName(message.sender)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.messageType === 'analysis' && (
                      <Badge variant="secondary" className="text-xs">
                        Analysis
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.metadata?.model && (
                    <div className="text-xs text-gray-500 mt-1">
                      Model: {message.metadata.model}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {uploadedFiles.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Uploaded Files:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((filename, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {filename}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="px-3"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your financial data or request analysis..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-600 mt-2">Connecting to server...</p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".csv,.xlsx,.xls"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}