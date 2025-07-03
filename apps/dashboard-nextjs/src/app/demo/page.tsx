'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Upload, Paperclip, Mic, Plus, Building, DollarSign, 
  Users, Wrench, Scale, Inbox, Sparkles, Brain, CheckCircle, 
  AlertCircle, Clock, Zap, Shield, TrendingUp, AlertTriangle,
  FileText, BarChart, PieChart, Activity
} from 'lucide-react'

// Import demo data generator
import { demoDataGenerator, DemoScenario } from '@/lib/demo-data-generator'

// Import the document processing hook
import { useDocumentProcessing, useFormattedInsights } from '@/hooks/useDocumentProcessing'

// Prismatic Clarity Color System
const prismColors = {
  financial: '#FFD700',     // Gold
  tenant: '#4A90E2',        // Blue  
  maintenance: '#7ED321',   // Green
  legal: '#D0021B',         // Red
  base: '#FAFAFA',          // White/neutral
  neutral: '#F5F5F5'        // Calm gray
}

export default function CompletePrismaticDemo() {
  // State management
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null)
  const [showDemo, setShowDemo] = useState(true)
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showDebate, setShowDebate] = useState(false)
  const [demoDebate, setDemoDebate] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Get all demo scenarios
  const scenarios = demoDataGenerator.getAllScenarios()

  // Initialize document processing
  const {
    isConnected,
    processingStatus,
    insights,
    agentActivities,
    debateLog,
    uploadDocument,
    submitFeedback
  } = useDocumentProcessing({
    onInsightsReady: (newInsights) => {
      console.log('Demo insights ready:', newInsights)
    },
    onAgentActivity: (activities) => {
      console.log('Agent activities:', activities)
    }
  })

  const formattedInsights = useFormattedInsights(insights)

  // Simulate demo document upload
  const runDemoScenario = async (scenario: DemoScenario) => {
    setSelectedScenario(scenario)
    setShowDemo(false)
    
    // Create a file from the scenario
    const fileContent = demoDataGenerator.generateSampleFile(scenario)
    const file = new File([fileContent], scenario.documents[0].filename, {
      type: 'application/pdf'
    })
    
    // Upload through the real system
    try {
      await uploadDocument(file, scenario.documents[0].type)
      
      // Load demo debate after a delay
      setTimeout(() => {
        const debate = demoDataGenerator.generateDemoDebate(scenario.id)
        setDemoDebate(debate)
        if (debate.length > 0) {
          setShowDebate(true)
        }
      }, 3000)
    } catch (error) {
      console.error('Demo upload failed:', error)
    }
  }

  // Voice command handler (simulated)
  const handleVoiceCommand = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      setMessage("Show me properties with covenant risks")
      // Trigger relevant scenario
      const covenantScenario = scenarios.find(s => s.id === 'covenant-breach')
      if (covenantScenario) {
        runDemoScenario(covenantScenario)
      }
    }, 2000)
  }

  // Demo selector component
  const DemoSelector = () => (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prism Intelligence Demo
          </h1>
          <p className="text-xl text-gray-600">
            Select a scenario to see AI-powered property intelligence in action
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => runDemoScenario(scenario)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  {scenario.id === 'covenant-breach' && <AlertTriangle className="h-6 w-6 text-red-600" />}
                  {scenario.id === 'tenant-risk' && <Users className="h-6 w-6 text-blue-600" />}
                  {scenario.id === 'maintenance-priority' && <Wrench className="h-6 w-6 text-green-600" />}
                  {scenario.id === 'revenue-optimization' && <TrendingUp className="h-6 w-6 text-yellow-600" />}
                  {scenario.id === 'compliance-alert' && <Shield className="h-6 w-6 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.expectedInsights.slice(0, 2).map((insight, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {insight.split(':')[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Or try voice command:</p>
          <Button
            size="lg"
            onClick={handleVoiceCommand}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mic className="h-5 w-5 mr-2" />
            "Hey Prism, show me covenant risks"
          </Button>
        </div>
      </div>
    </div>
  )

  // Main dashboard view
  const Dashboard = () => (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Cognitive Inbox */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Cognitive Inbox</h2>
          <p className="text-sm text-gray-500 mt-1">AI-categorized insights</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {selectedScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-sm">{selectedScenario.documents[0].filename}</span>
                </div>
                <p className="text-xs text-gray-600">Processing with AI agents...</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedScenario.documents[0].type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {processingStatus}
                  </Badge>
                </div>
              </motion.div>
            )}
            
            {/* Sample inbox items */}
            <div className="space-y-2">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Financial Alert</span>
                </div>
                <p className="text-xs text-gray-600">DSCR approaching covenant threshold</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Maintenance</span>
                </div>
                <p className="text-xs text-gray-600">HVAC system end-of-life alert</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel - Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Intelligence</h1>
              {selectedScenario && (
                <p className="text-sm text-gray-600 mt-1">Analyzing: {selectedScenario.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {/* Insights Display */}
          {insights.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">AI-Generated Insights</h3>
              
              {formattedInsights.map((insight, index) => (
                <motion.div
                  key={insight.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{insight.icon}</span>
                        <Badge 
                          style={{ 
                            backgroundColor: insight.color + '20', 
                            color: insight.color 
                          }}
                        >
                          {insight.category}
                        </Badge>
                        <Badge variant="outline">{insight.priorityLabel}</Badge>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">
                        {insight.formattedMessage || insight.content}
                      </p>
                      {insight.agentId && (
                        <p className="text-xs text-gray-500 mt-2">
                          Source: {insight.agentId}
                        </p>
                      )}
                    </div>
                    
                    {/* Why button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDebate(true)}
                      className="ml-4"
                    >
                      Why?
                    </Button>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => submitFeedback(insight.id, 'accepted', insight.agentId)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => submitFeedback(insight.id, 'rejected', insight.agentId)}
                    >
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      Create Task
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : selectedScenario && processingStatus === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">AI agents are analyzing your document...</p>
              <p className="text-sm text-gray-500 mt-2">This typically takes 10-30 seconds</p>
            </div>
          ) : !selectedScenario ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600">Select a demo scenario to begin</p>
            </div>
          ) : null}
          
          {/* Demo expected insights */}
          {selectedScenario && insights.length === 0 && processingStatus !== 'processing' && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-3">Expected Insights (Demo)</h3>
              <div className="space-y-3">
                {selectedScenario.expectedInsights.map((expectedInsight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{expectedInsight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Voice Input */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Try: "What properties have covenant risks?" or "Show maintenance priorities"'
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleVoiceCommand()}
            />
            <Button 
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={handleVoiceCommand}
              className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Voice commands: "Show covenant risks" • "What needs maintenance?" • "Find at-risk tenants"
          </p>
        </div>
      </div>

      {/* Right Panel - Agent Activity */}
      <div className="w-96 bg-white border-l border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Agent Activity</h3>
        
        {/* Live agent activities */}
        {processingStatus === 'processing' && (
          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-blue-600" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium">FinanceBot</p>
                <p className="text-xs text-gray-600">Analyzing financial metrics...</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-yellow-600" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium">RiskBot</p>
                <p className="text-xs text-gray-600">Evaluating covenant compliance...</p>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Agent Debate */}
        {showDebate && demoDebate.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Agent Debate</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {demoDebate.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gray-50 rounded p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium">{entry.agentName}</span>
                    <Badge variant="outline" className="text-xs">{entry.phase}</Badge>
                  </div>
                  <p className="text-xs text-gray-700">{entry.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <BarChart className="h-3 w-3 mr-1" />
              Reports
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-3 w-3 mr-1" />
              Tenants
            </Button>
            <Button variant="outline" size="sm">
              <Building className="h-3 w-3 mr-1" />
              Properties
            </Button>
          </div>
        </div>
        
        {/* Success Animation */}
        <AnimatePresence>
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Analysis Complete!</p>
              <p className="text-xs text-gray-500 mt-1">
                {insights.length} insights generated in {Math.floor(Math.random() * 20) + 10} seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return showDemo ? <DemoSelector /> : <Dashboard />
}
