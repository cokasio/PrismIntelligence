import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface VoiceContext {
  transcript: string
  intent: string
  entities: Record<string, any>
  timestamp: Date
  response?: string
}

interface VoiceMemory {
  history: VoiceContext[]
  currentContext: VoiceContext | null
  followUpExpected: boolean
}

export function useVoiceContextMemory(maxHistory: number = 10) {
  const [memory, setMemory] = useState<VoiceMemory>({
    history: [],
    currentContext: null,
    followUpExpected: false
  })

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('prism-voice-memory')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMemory({
          ...parsed,
          history: parsed.history.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp)
          }))
        })
      } catch (e) {
        console.error('Failed to parse voice memory:', e)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('prism-voice-memory', JSON.stringify(memory))
  }, [memory])

  const addContext = useCallback((context: Omit<VoiceContext, 'timestamp'>) => {
    setMemory(prev => {
      const newContext: VoiceContext = {
        ...context,
        timestamp: new Date()
      }

      const newHistory = [newContext, ...prev.history.slice(0, maxHistory - 1)]

      return {
        history: newHistory,
        currentContext: newContext,
        followUpExpected: false
      }
    })
  }, [maxHistory])

  const expectFollowUp = useCallback(() => {
    setMemory(prev => ({ ...prev, followUpExpected: true }))
  }, [])

  const resolveContext = useCallback((transcript: string): string => {
    if (!memory.currentContext || !memory.followUpExpected) {
      return transcript
    }

    // Resolve pronouns and references
    const resolved = transcript
      .replace(/\b(it|that|this)\b/gi, (match) => {
        // Try to find what "it" refers to from previous context
        const lastEntity = Object.values(memory.currentContext?.entities || {})[0]
        return lastEntity || match
      })
      .replace(/\b(there|here)\b/gi, (match) => {
        const location = memory.currentContext?.entities?.location
        return location || match
      })

    return resolved
  }, [memory])

  const getRelevantContext = useCallback((query: string): VoiceContext[] => {
    // Find contexts that might be relevant to the current query
    return memory.history.filter(ctx => {
      const queryLower = query.toLowerCase()
      const transcriptLower = ctx.transcript.toLowerCase()
      
      // Check for common words or entities
      const queryWords = queryLower.split(' ')
      const contextWords = transcriptLower.split(' ')
      
      return queryWords.some(word => 
        word.length > 3 && contextWords.includes(word)
      )
    }).slice(0, 3)
  }, [memory.history])

  const clearMemory = useCallback(() => {
    setMemory({
      history: [],
      currentContext: null,
      followUpExpected: false
    })
    localStorage.removeItem('prism-voice-memory')
    toast.success('Voice memory cleared')
  }, [])

  return {
    memory,
    addContext,
    expectFollowUp,
    resolveContext,
    getRelevantContext,
    clearMemory
  }
}