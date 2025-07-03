import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Keyboard, Brain, Zap, History, Activity } from 'lucide-react'

// Import all our new cognitive UX hooks
import { useGlobalKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useGlobalKeyboardShortcuts'
import { DetailLevelToggle, LayeredContent, useDetailLevel } from '@/components/ui/detail-level-toggle'
import { useVoiceContextMemory } from '@/hooks/useVoiceContextMemory'
import { useCognitiveLoadMonitor, CognitiveLoadIndicator } from '@/hooks/useCognitiveLoadMonitor'
import { WhatIfScenario } from '@/components/ui/what-if-scenario'
import { useUserExpertiseLearning } from '@/hooks/useUserExpertiseLearning'
import { useSmartDefaults } from '@/hooks/useSmartDefaults'
import { useNaturalLanguageQueries } from '@/hooks/useNaturalLanguageQueries'
import { useGestureRecognition, GestureFeedback } from '@/hooks/useGestureRecognition'
import { useDecisionHistory } from '@/hooks/useDecisionHistory'

export function CognitiveUXShowcase() {
  const [selectedInsight, setSelectedInsight] = useState<any>(null)
  const [showWhyExplanation, setShowWhyExplanation] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentGesture, setCurrentGesture] = useState<any>(null)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Global Keyboard Shortcuts
  const { shortcuts } = useGlobalKeyboardShortcuts({
    onAccept: () => {
      if (selectedInsight) {
        toast.success('Insight accepted')
        expertiseLearning.trackSuccess('financial', 1000)
      }
    },
    onReject: () => {
      if (selectedInsight) {
        toast.error('Insight rejected')
        expertiseLearning.trackError('financial')
      }
    },
    onShowWhy: () => setShowWhyExplanation(!showWhyExplanation),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onToggleHelp: () => setShowKeyboardHelp(!showKeyboardHelp),
    onToggleDetails: () => toast.info('Details toggled')
  })

  // 2. Detail Level
  const detailLevel = useDetailLevel()

  // 3. Voice Context Memory
  const voiceMemory = useVoiceContextMemory()

  // 4. Cognitive Load Monitor
  const cognitiveLoad = useCognitiveLoadMonitor()

  // 5. User Expertise Learning
  const expertiseLearning = useUserExpertiseLearning()

  // 6. Smart Defaults
  const smartDefaults = useSmartDefaults()

  // 7. Natural Language Queries
  const nlQueries = useNaturalLanguageQueries()

  // 8. Gesture Recognition
  const gestures = useGestureRecognition(containerRef, {
    onSwipe: (direction, distance) => {
      setCurrentGesture({ type: 'swipe', direction, distance })
      toast.info(`Swiped ${direction}`)
    },
    onPinch: (scale) => {
      setCurrentGesture({ type: 'pinch', scale })
      toast.info(`Pinch scale: ${scale.toFixed(2)}`)
    },
    onDoubleTap: () => {
      setShowWhyExplanation(!showWhyExplanation)
      toast.info('Double tap: Toggle explanation')
    }
  })

  // 9. Decision History
  const decisionHistory = useDecisionHistory()

  // Sample insight for demonstration
  const sampleInsight = {
    id: 'demo-1',
    title: 'Covenant Breach Risk Detected',
    summary: 'DSCR dropped below 1.25x threshold',
    business: 'The Debt Service Coverage Ratio for Property A has fallen below the required 1.25x threshold specified in your loan covenant. This could trigger a technical default if not addressed within 30 days.',
    technical: 'DSCR calculation: NOI ($125,000) / Annual Debt Service ($105,000) = 1.19x. This is below the 1.25x covenant requirement. Mathematical proof: Let NOI = $125,000, DS = $105,000. DSCR = NOI/DS = 125,000/105,000 = 1.19 < 1.25 ∴ Covenant breach confirmed.',
    confidence: 95,
    agent: 'FinanceBot'
  }

  // Handle natural language search
  const handleSearch = () => {
    if (!searchQuery) return
    
    const result = nlQueries.parseQuery(searchQuery)
    if (result) {
      toast.success(`Executing: ${result.intent.action}`, {
        description: `Confidence: ${(result.intent.confidence * 100).toFixed(0)}%`
      })
      
      // Track the search action
      smartDefaults.trackAction('search', { query: searchQuery }, 'success')
      expertiseLearning.trackFeatureUsage('natural-language-search')
    }
  }

  // Example What-If scenario calculation
  const calculateWhatIf = (params: Record<string, number>) => {
    return [
      {
        metric: 'DSCR',
        baseline: 1.19,
        projected: 1.19 * (params.revenue / 100),
        change: (1.19 * (params.revenue / 100)) - 1.19,
        changePercent: ((params.revenue / 100) - 1) * 100
      },
      {
        metric: 'Cash Flow',
        baseline: 20000,
        projected: 20000 * (params.revenue / 100) * (1 - params.expenses / 100),
        change: (20000 * (params.revenue / 100) * (1 - params.expenses / 100)) - 20000,
        changePercent: ((params.revenue / 100) * (1 - params.expenses / 100) - 1) * 100
      }
    ]
  }

  return (
    <div ref={containerRef} className="space-y-6 p-6">
      {/* Header with cognitive indicators */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cognitive UX Features Demo</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            {expertiseLearning.profile.level}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3" />
            Load: {cognitiveLoad.currentLoad}%
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyboardHelp(true)}
          >
            <Keyboard className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Natural Language Search */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            ref={searchInputRef}
            placeholder="Try: 'Show me risky tenants' or 'Revenue trend last 6 months'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Examples: {nlQueries.examples.slice(0, 3).join(' • ')}
        </div>
      </Card>

      {/* Main Insight with Detail Levels */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{sampleInsight.title}</h3>
            <div className="flex items-center gap-2">
              <Badge>{sampleInsight.confidence}% confident</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWhyExplanation(!showWhyExplanation)}
              >
                Why?
              </Button>
            </div>
          </div>

          <LayeredContent
            summary={sampleInsight.summary}
            business={sampleInsight.business}
            technical={sampleInsight.technical}
            showToggle={true}
          />

          {showWhyExplanation && (
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium mb-2">Explanation</h4>
              <p className="text-sm">
                This conclusion was reached through mathematical validation of your financial data.
                The formal logic proof confirms the covenant breach with 95% confidence.
              </p>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedInsight(sampleInsight)
                cognitiveLoad.trackClick()
                expertiseLearning.trackSuccess('financial', 2000)
                
                // Track decision
                decisionHistory.trackDecision(
                  'covenant-response',
                  'Response to Covenant Breach',
                  'DSCR below threshold - action required',
                  [
                    {
                      id: 'increase-revenue',
                      label: 'Increase Revenue',
                      pros: ['Quick impact', 'Sustainable'],
                      cons: ['Market dependent'],
                      confidence: 80
                    },
                    {
                      id: 'reduce-expenses',
                      label: 'Reduce Expenses',
                      pros: ['Immediate effect'],
                      cons: ['May impact quality'],
                      confidence: 70
                    }
                  ],
                  'increase-revenue',
                  'Revenue increase through rent optimization'
                )
              }}
            >
              Accept (A)
            </Button>
            <Button variant="outline">
              Reject (R)
            </Button>
          </div>
        </div>
      </Card>

      {/* What-If Scenario Explorer */}
      <WhatIfScenario
        title="Covenant Breach Resolution Scenarios"
        parameters={[
          {
            id: 'revenue',
            name: 'Revenue Change',
            value: 100,
            min: 80,
            max: 120,
            step: 5,
            unit: '%'
          },
          {
            id: 'expenses',
            name: 'Expense Change',
            value: 100,
            min: 80,
            max: 120,
            step: 5,
            unit: '%'
          }
        ]}
        onCalculate={calculateWhatIf}
      />

      {/* Decision History Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4" />
          <h4 className="font-medium">Recent Decisions</h4>
        </div>
        <div className="text-sm text-gray-600">
          <p>Total: {decisionHistory.analytics.totalDecisions}</p>
          <p>Success Rate: {decisionHistory.analytics.successRate.toFixed(0)}%</p>
          <p>Avg Confidence: {decisionHistory.analytics.averageConfidence.toFixed(0)}%</p>
        </div>
      </Card>

      {/* Voice Context Display */}
      {voiceMemory.memory.history.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Voice Context</h4>
          <div className="text-sm space-y-1">
            {voiceMemory.memory.history.slice(0, 3).map((ctx, i) => (
              <div key={i} className="text-gray-600">
                "{ctx.transcript}" - {ctx.intent}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Floating Components */}
      <KeyboardShortcutsHelp 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />
      
      {cognitiveLoad.shouldSimplify && <CognitiveLoadIndicator />}
      
      <GestureFeedback gesture={currentGesture} />
    </div>
  )
}