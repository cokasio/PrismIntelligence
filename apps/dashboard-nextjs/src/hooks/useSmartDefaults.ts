import { useState, useEffect, useCallback } from 'react'

interface UserAction {
  action: string
  context: Record<string, any>
  timestamp: Date
  outcome?: 'success' | 'cancelled'
}

interface SmartDefault {
  action: string
  defaultValue: any
  confidence: number
  basedOn: string
}

interface SmartDefaultsProfile {
  actions: UserAction[]
  patterns: Record<string, any>
  defaults: SmartDefault[]
}

export function useSmartDefaults(maxHistorySize: number = 100) {
  const [profile, setProfile] = useState<SmartDefaultsProfile>({
    actions: [],
    patterns: {},
    defaults: []
  })

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prism-smart-defaults')
    if (stored) {
      const parsed = JSON.parse(stored)
      setProfile({
        ...parsed,
        actions: parsed.actions.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }))
      })
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('prism-smart-defaults', JSON.stringify(profile))
  }, [profile])

  // Track user action
  const trackAction = useCallback((action: string, context: Record<string, any>, outcome?: 'success' | 'cancelled') => {
    setProfile(prev => {
      const newAction: UserAction = {
        action,
        context,
        timestamp: new Date(),
        outcome
      }

      const actions = [newAction, ...prev.actions].slice(0, maxHistorySize)
      
      // Update patterns
      const patterns = updatePatterns(actions)
      
      // Generate new defaults
      const defaults = generateDefaults(patterns, actions)

      return {
        actions,
        patterns,
        defaults
      }
    })
  }, [maxHistorySize])

  // Get smart default for an action
  const getDefault = useCallback((action: string, context?: Record<string, any>): any => {
    const relevant = profile.defaults
      .filter(d => d.action === action)
      .sort((a, b) => b.confidence - a.confidence)

    if (relevant.length === 0) return null

    // If we have context, try to find more specific matches
    if (context) {
      const contextMatch = relevant.find(d => {
        // Simple context matching - could be more sophisticated
        return Object.keys(context).some(key => 
          d.basedOn.includes(key)
        )
      })
      if (contextMatch) return contextMatch.defaultValue
    }

    return relevant[0].defaultValue
  }, [profile.defaults])

  // Get predictions for next actions
  const predictNextActions = useCallback((currentContext: Record<string, any>): string[] => {
    const recentActions = profile.actions.slice(0, 10)
    const actionSequences: Record<string, number> = {}

    // Look for patterns in recent actions
    for (let i = 0; i < recentActions.length - 1; i++) {
      const current = recentActions[i].action
      const next = recentActions[i + 1].action
      const key = `${current}->${next}`
      actionSequences[key] = (actionSequences[key] || 0) + 1
    }

    // Find most likely next actions
    const currentAction = recentActions[0]?.action
    const predictions: Array<{ action: string; score: number }> = []

    Object.entries(actionSequences).forEach(([sequence, count]) => {
      const [from, to] = sequence.split('->')
      if (from === currentAction) {
        predictions.push({ action: to, score: count })
      }
    })

    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => p.action)
  }, [profile.actions])

  return {
    trackAction,
    getDefault,
    predictNextActions,
    profile,
    clearHistory: () => {
      setProfile({
        actions: [],
        patterns: {},
        defaults: []
      })
      localStorage.removeItem('prism-smart-defaults')
    }
  }
}

// Helper functions
function updatePatterns(actions: UserAction[]): Record<string, any> {
  const patterns: Record<string, any> = {}

  // Time-based patterns
  const hourCounts: Record<number, number> = {}
  actions.forEach(action => {
    const hour = action.timestamp.getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  patterns.peakHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour))

  // Common action sequences
  const sequences: Record<string, number> = {}
  for (let i = 0; i < actions.length - 1; i++) {
    const seq = `${actions[i].action}->${actions[i + 1].action}`
    sequences[seq] = (sequences[seq] || 0) + 1
  }
  patterns.commonSequences = Object.entries(sequences)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([seq]) => seq)

  // Common contexts
  const contexts: Record<string, number> = {}
  actions.forEach(action => {
    Object.entries(action.context).forEach(([key, value]) => {
      const ctxKey = `${key}:${value}`
      contexts[ctxKey] = (contexts[ctxKey] || 0) + 1
    })
  })
  patterns.commonContexts = Object.entries(contexts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([ctx]) => ctx)

  return patterns
}

function generateDefaults(patterns: Record<string, any>, actions: UserAction[]): SmartDefault[] {
  const defaults: SmartDefault[] = []

  // Generate defaults based on most common values for each action
  const actionGroups: Record<string, UserAction[]> = {}
  actions.forEach(action => {
    if (!actionGroups[action.action]) {
      actionGroups[action.action] = []
    }
    actionGroups[action.action].push(action)
  })

  Object.entries(actionGroups).forEach(([actionName, actionList]) => {
    // Find most common context values
    const contextValues: Record<string, Record<string, number>> = {}
    
    actionList.forEach(action => {
      Object.entries(action.context).forEach(([key, value]) => {
        if (!contextValues[key]) contextValues[key] = {}
        const strValue = String(value)
        contextValues[key][strValue] = (contextValues[key][strValue] || 0) + 1
      })
    })

    // Create defaults for most common values
    Object.entries(contextValues).forEach(([contextKey, values]) => {
      const mostCommon = Object.entries(values)
        .sort(([,a], [,b]) => b - a)[0]
      
      if (mostCommon) {
        const [value, count] = mostCommon
        const confidence = count / actionList.length

        if (confidence > 0.5) { // Only create default if >50% confidence
          defaults.push({
            action: actionName,
            defaultValue: { [contextKey]: value },
            confidence,
            basedOn: contextKey
          })
        }
      }
    })
  })

  return defaults
}