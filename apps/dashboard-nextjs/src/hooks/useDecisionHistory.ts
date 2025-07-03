import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface Decision {
  id: string
  timestamp: Date
  type: string
  title: string
  description: string
  options: DecisionOption[]
  selectedOption: string
  reasoning?: string
  outcome?: DecisionOutcome
  context: Record<string, any>
  tags: string[]
}

interface DecisionOption {
  id: string
  label: string
  pros: string[]
  cons: string[]
  confidence: number
}

interface DecisionOutcome {
  status: 'success' | 'failure' | 'partial' | 'pending'
  impact: string
  metrics?: Record<string, number>
  notes?: string
  evaluatedAt?: Date
}

interface DecisionHistoryState {
  decisions: Decision[]
  analytics: {
    totalDecisions: number
    successRate: number
    averageConfidence: number
    topDecisionTypes: Array<{ type: string; count: number }>
    outcomeDistribution: Record<string, number>
  }
}

export function useDecisionHistory() {
  const [state, setState] = useState<DecisionHistoryState>({
    decisions: [],
    analytics: {
      totalDecisions: 0,
      successRate: 0,
      averageConfidence: 0,
      topDecisionTypes: [],
      outcomeDistribution: {}
    }
  })

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prism-decision-history')
    if (stored) {
      const parsed = JSON.parse(stored)
      setState({
        ...parsed,
        decisions: parsed.decisions.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
          outcome: d.outcome ? {
            ...d.outcome,
            evaluatedAt: d.outcome.evaluatedAt ? new Date(d.outcome.evaluatedAt) : undefined
          } : undefined
        }))
      })
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('prism-decision-history', JSON.stringify(state))
  }, [state])

  // Track a new decision
  const trackDecision = useCallback((
    type: string,
    title: string,
    description: string,
    options: DecisionOption[],
    selectedOption: string,
    reasoning?: string,
    context?: Record<string, any>,
    tags?: string[]
  ) => {
    const newDecision: Decision = {
      id: `decision-${Date.now()}`,
      timestamp: new Date(),
      type,
      title,
      description,
      options,
      selectedOption,
      reasoning,
      context: context || {},
      tags: tags || []
    }

    setState(prev => ({
      ...prev,
      decisions: [newDecision, ...prev.decisions]
    }))

    toast.success('Decision tracked', {
      description: title
    })

    return newDecision.id
  }, [])

  // Update decision outcome
  const updateOutcome = useCallback((
    decisionId: string,
    outcome: DecisionOutcome
  ) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(d =>
        d.id === decisionId
          ? { ...d, outcome: { ...outcome, evaluatedAt: new Date() } }
          : d
      )
    }))

    toast.info('Decision outcome updated')
  }, [])

  // Calculate analytics
  const calculateAnalytics = useCallback(() => {
    const { decisions } = state
    
    if (decisions.length === 0) {
      return {
        totalDecisions: 0,
        successRate: 0,
        averageConfidence: 0,
        topDecisionTypes: [],
        outcomeDistribution: {}
      }
    }

    // Total decisions
    const totalDecisions = decisions.length

    // Success rate
    const decisionsWithOutcomes = decisions.filter(d => d.outcome)
    const successfulDecisions = decisionsWithOutcomes.filter(
      d => d.outcome?.status === 'success'
    )
    const successRate = decisionsWithOutcomes.length > 0
      ? (successfulDecisions.length / decisionsWithOutcomes.length) * 100
      : 0

    // Average confidence
    const totalConfidence = decisions.reduce((sum, d) => {
      const selected = d.options.find(o => o.id === d.selectedOption)
      return sum + (selected?.confidence || 0)
    }, 0)
    const averageConfidence = totalConfidence / totalDecisions

    // Top decision types
    const typeCount: Record<string, number> = {}
    decisions.forEach(d => {
      typeCount[d.type] = (typeCount[d.type] || 0) + 1
    })
    const topDecisionTypes = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Outcome distribution
    const outcomeDistribution: Record<string, number> = {
      success: 0,
      failure: 0,
      partial: 0,
      pending: 0,
      unevaluated: 0
    }
    decisions.forEach(d => {
      if (d.outcome) {
        outcomeDistribution[d.outcome.status]++
      } else {
        outcomeDistribution.unevaluated++
      }
    })

    return {
      totalDecisions,
      successRate,
      averageConfidence,
      topDecisionTypes,
      outcomeDistribution
    }
  }, [state])

  // Update analytics when decisions change
  useEffect(() => {
    const analytics = calculateAnalytics()
    setState(prev => ({ ...prev, analytics }))
  }, [state.decisions]) // eslint-disable-line

  // Get similar past decisions
  const getSimilarDecisions = useCallback((
    type: string,
    tags: string[]
  ): Decision[] => {
    return state.decisions
      .filter(d => 
        d.type === type || 
        d.tags.some(tag => tags.includes(tag))
      )
      .slice(0, 5)
  }, [state.decisions])

  // Get decisions by time range
  const getDecisionsByTimeRange = useCallback((
    startDate: Date,
    endDate: Date
  ): Decision[] => {
    return state.decisions.filter(d => 
      d.timestamp >= startDate && d.timestamp <= endDate
    )
  }, [state.decisions])

  // Get decision success patterns
  const getSuccessPatterns = useCallback((): Array<{
    pattern: string
    successRate: number
    examples: Decision[]
  }> => {
    const patterns: Record<string, Decision[]> = {}

    // Group by type and outcome
    state.decisions.forEach(d => {
      if (d.outcome) {
        const key = `${d.type}-${d.outcome.status}`
        if (!patterns[key]) patterns[key] = []
        patterns[key].push(d)
      }
    })

    // Calculate success rates for each type
    const typeGroups: Record<string, Decision[]> = {}
    state.decisions.forEach(d => {
      if (!typeGroups[d.type]) typeGroups[d.type] = []
      typeGroups[d.type].push(d)
    })

    return Object.entries(typeGroups).map(([type, decisions]) => {
      const withOutcomes = decisions.filter(d => d.outcome)
      const successful = withOutcomes.filter(d => d.outcome?.status === 'success')
      const successRate = withOutcomes.length > 0
        ? (successful.length / withOutcomes.length) * 100
        : 0

      return {
        pattern: type,
        successRate,
        examples: successful.slice(0, 3)
      }
    }).sort((a, b) => b.successRate - a.successRate)
  }, [state.decisions])

  return {
    decisions: state.decisions,
    analytics: state.analytics,
    trackDecision,
    updateOutcome,
    getSimilarDecisions,
    getDecisionsByTimeRange,
    getSuccessPatterns,
    clearHistory: () => {
      setState({
        decisions: [],
        analytics: {
          totalDecisions: 0,
          successRate: 0,
          averageConfidence: 0,
          topDecisionTypes: [],
          outcomeDistribution: {}
        }
      })
      localStorage.removeItem('prism-decision-history')
      toast.success('Decision history cleared')
    }
  }
}