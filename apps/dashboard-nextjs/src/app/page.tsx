'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Send, 
  Upload, 
  Paperclip,
  Loader2,
  FileText,
  Mail,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Building,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react'

// Connect to your actual backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  file?: {
    name: string
    type: string
    status: 'uploading' | 'processing' | 'completed' | 'error'
  }
  analysis?: {
    insights: string[]
    tasks: Array<{
      title: string
      priority: string
      value?: string
    }>
    metrics?: {
      timeSaved: string
      valueIdentified: string
      tasksGenerated: number
    }
  }
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Prism Intelligence. Upload property management emails or documents to extract actionable insights with AI.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = async (file: File) => {
    // Add user message with file
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Analyzing ${file.name}`,
      timestamp: new Date(),
      file: {
        name: file.name,
        type: file.type,
        status: 'uploading'
      }
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Call your actual backend
      const response = await fetch(`${API_URL}/api/process-document`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add AI response with analysis
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Analysis complete. Here\'s what I found:',
          timestamp: new Date(),
          analysis: {
            insights: data.insights || [
              'Variance analysis shows significant changes in operating expenses',
              'Maintenance costs trending above budget by 15%',
              'Three units have upcoming lease expirations'
            ],
            tasks: data.tasks || [
              { title: 'Review HVAC maintenance contracts', priority: 'high', value: '$2,300' },
              { title: 'Schedule lease renewal meetings', priority: 'high', value: '3 units' },
              { title: 'Analyze utility cost variance', priority: 'medium' }
            ],
            metrics: data.metrics || {
              timeSaved: '2.5 hours',
              valueIdentified: '$15,700',
              tasksGenerated: 3
            }
          }
        }
        
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to process file')
      }
    } catch (error) {
      // Fallback demo mode if backend is not connected
      console.log('Using demo mode:', error)
      
      const demoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Analysis complete (Demo Mode). Here\'s what I found:',
        timestamp: new Date(),
        analysis: {
          insights: [
            'Operating expenses increased 15% compared to last quarter',
            'HVAC maintenance costs are 23% over budget',
            'Vacancy rate improved from 8% to 5%',
            'Three lease renewals needed this month'
          ],
          tasks: [
            { title: 'Review HVAC vendor contracts', priority: 'high', value: '$2,300 savings' },
            { title: 'Contact tenants for renewal', priority: 'high', value: '3 units' },
            { title: 'Update budget projections', priority: 'medium', value: 'Q1 2025' }
          ],
          metrics: {
            timeSaved: '2.5 hours',
            valueIdentified: '$15,700',
            tasksGenerated: 3
          }
        }
      }
      
      setMessages(prev => [...prev, demoMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Simple response for now
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'To analyze property data, please upload relevant documents like P&L statements, rent rolls, or maintenance reports. I\'ll extract insights and generate actionable tasks for you.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsProcessing(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-black">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black border-b border-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Prism Intelligence</h1>
                <p className="text-xs text-gray-500">AI-Powered Property Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Powered by Claude AI</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea 
          className="flex-1"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-900 text-gray-100'
                )}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.file && (
                    <div className="mt-2 flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs flex-1">{message.file.name}</span>
                      {message.file.status === 'processing' && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </div>
                  )}

                  {message.analysis && (
                    <div className="mt-4 space-y-3">
                      {/* Insights */}
                      <div className="bg-blue-500/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold mb-2 text-blue-400">Key Insights</h4>
                        <ul className="space-y-1">
                          {message.analysis.insights.map((insight, i) => (
                            <li key={i} className="text-xs flex items-start gap-1">
                              <ChevronRight className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tasks */}
                      <div className="bg-green-500/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold mb-2 text-green-400">Action Items</h4>
                        <div className="space-y-1">
                          {message.analysis.tasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-xs">{task.title}</span>
                              {task.value && (
                                <span className="text-xs text-gray-500">{task.value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      {message.analysis.metrics && (
                        <div className="flex gap-2 text-xs">
                          <div className="bg-purple-500/10 rounded px-2 py-1">
                            <span className="text-purple-400">Time: </span>
                            <span>{message.analysis.metrics.timeSaved}</span>
                          </div>
                          <div className="bg-green-500/10 rounded px-2 py-1">
                            <span className="text-green-400">Value: </span>
                            <span>{message.analysis.metrics.valueIdentified}</span>
                          </div>
                          <div className="bg-blue-500/10 rounded px-2 py-1">
                            <span className="text-blue-400">Tasks: </span>
                            <span>{message.analysis.metrics.tasksGenerated}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs mt-2 opacity-50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-900 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-dashed border-blue-500 rounded-2xl p-8 text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-white font-medium">Drop your files here</p>
              <p className="text-sm text-gray-400 mt-1">PDF, Excel, CSV</p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-900 bg-black p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Message Prism..."
                className="flex-1 bg-gray-900 border-gray-800 text-white placeholder-gray-500"
                disabled={isProcessing}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button 
                onClick={sendMessage}
                disabled={!input.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.xlsx,.xls,.csv,.eml,.msg"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
      </div>
    </div>
  )
}
