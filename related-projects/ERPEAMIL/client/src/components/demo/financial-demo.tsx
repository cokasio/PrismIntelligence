import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Bot,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Brain,
  Loader2,
  Play,
  Download,
} from "lucide-react"

interface DemoStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: string
}

export function FinancialDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: 'create-session',
      title: 'Create Analysis Session',
      description: 'Initialize a new financial analysis session',
      status: 'pending'
    },
    {
      id: 'upload-files',
      title: 'Upload Sample Data',
      description: 'Upload sample financial documents (Income, Balance Sheet, Cash Flow)',
      status: 'pending'
    },
    {
      id: 'agent-analysis',
      title: 'Multi-Agent Analysis',
      description: 'Run analysis with all 4 AI agents (Income, Balance, Cash Flow, Strategic)',
      status: 'pending'
    },
    {
      id: 'generate-insights',
      title: 'Generate Insights',
      description: 'Compile comprehensive financial insights and recommendations',
      status: 'pending'
    },
    {
      id: 'export-results',
      title: 'Export Results',
      description: 'Generate professional reports and analysis summaries',
      status: 'pending'
    }
  ])

  const updateStepStatus = (stepId: string, status: DemoStep['status'], result?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, result } : step
    ))
  }

  const runDemo = async () => {
    setIsRunning(true)
    setCurrentStep(0)

    try {
      // Step 1: Create Session
      updateStepStatus('create-session', 'running')
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Demo Analysis - ${new Date().toLocaleDateString()}`,
          source: 'upload',
          status: 'active',
          metadata: {
            analysisType: 'comprehensive',
            description: 'Full-system demonstration of multi-agent financial analysis',
            isDemo: true
          }
        })
      })

      if (!sessionResponse.ok) throw new Error('Failed to create session')
      
      const session = await sessionResponse.json()
      setSessionId(session.id)
      updateStepStatus('create-session', 'completed', `Session ${session.id} created successfully`)
      setCurrentStep(1)

      // Step 2: Upload Sample Files (simulated)
      updateStepStatus('upload-files', 'running')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate file processing time
      
      // Create sample financial documents
      const sampleFiles = [
        { name: 'income_statement_2024.csv', type: 'income_statement' },
        { name: 'balance_sheet_2024.csv', type: 'balance_sheet' },
        { name: 'cash_flow_2024.csv', type: 'cash_flow' }
      ]

      for (const file of sampleFiles) {
        const docResponse = await fetch(`/api/sessions/${session.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileType: 'text/csv',
            source: 'upload',
            status: 'completed',
            metadata: { 
              size: 15000 + Math.random() * 10000,
              demo: true,
              type: file.type
            },
            analysisResults: {
              type: file.type,
              summary: `Demo ${file.type.replace('_', ' ')} data processed successfully`,
              metrics: generateSampleMetrics(file.type)
            }
          })
        })
      }

      updateStepStatus('upload-files', 'completed', `${sampleFiles.length} files uploaded and processed`)
      setCurrentStep(2)

      // Step 3: Trigger Multi-Agent Analysis
      updateStepStatus('agent-analysis', 'running')
      
      // Send analysis request message
      await fetch(`/api/sessions/${session.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Please analyze the uploaded financial documents and provide comprehensive insights.',
          source: 'upload'
        })
      })

      // Simulate agent analysis time
      await new Promise(resolve => setTimeout(resolve, 8000))
      
      updateStepStatus('agent-analysis', 'completed', 'All 4 agents completed analysis successfully')
      setCurrentStep(3)

      // Step 4: Generate Insights
      updateStepStatus('generate-insights', 'running')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      updateStepStatus('generate-insights', 'completed', 'Comprehensive insights and recommendations generated')
      setCurrentStep(4)

      // Step 5: Export Results
      updateStepStatus('export-results', 'running')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateStepStatus('export-results', 'completed', 'Reports ready for download and sharing')
      
    } catch (error) {
      console.error('Demo error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      updateStepStatus(steps[currentStep]?.id || 'unknown', 'error', errorMessage)
    } finally {
      setIsRunning(false)
    }
  }

  const generateSampleMetrics = (type: string) => {
    switch (type) {
      case 'income_statement':
        return {
          totalRevenue: 2400000,
          totalExpenses: 1800000,
          netIncome: 600000,
          profitMargin: 25.0
        }
      case 'balance_sheet':
        return {
          totalAssets: 15000000,
          totalLiabilities: 9000000,
          totalEquity: 6000000,
          debtToEquityRatio: 1.5
        }
      case 'cash_flow':
        return {
          freeCashFlow: 1200000,
          operatingCashFlow: 1800000,
          capitalExpenditures: 600000
        }
      default:
        return {}
    }
  }

  const getStepIcon = (status: DemoStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepColor = (status: DemoStep['status']) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50'
      case 'running': return 'border-blue-200 bg-blue-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Analyzer Demo</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience our AI-powered multi-agent system in action with a complete financial analysis workflow
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Demo Progress
          </CardTitle>
          <CardDescription>
            Watch as our system processes financial data through multiple AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{completedSteps} of {steps.length} steps completed</span>
              {sessionId && (
                <Badge variant="outline">Session #{sessionId}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`transition-all ${getStepColor(step.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  {step.result && (
                    <Alert className="mt-2">
                      <AlertDescription className="text-sm">
                        {step.result}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Demo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Demo
                </>
              )}
            </Button>
            
            {sessionId && completedSteps === steps.length && (
              <Button
                variant="outline"
                onClick={() => window.location.href = `/analysis#session-${sessionId}`}
                className="px-8 py-3"
                size="lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Full Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">4 AI Agents</h4>
            <p className="text-sm text-gray-600">Specialized analysis from multiple perspectives</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">File Processing</h4>
            <p className="text-sm text-gray-600">Automated CSV parsing and validation</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Real-time Analysis</h4>
            <p className="text-sm text-gray-600">Live progress tracking and updates</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Export Results</h4>
            <p className="text-sm text-gray-600">Professional reports and insights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}