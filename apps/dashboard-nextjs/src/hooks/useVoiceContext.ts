import { useState, useCallback, useRef } from 'react'

export interface VoiceContext {
  transcript: string
  timestamp: Date
  command?: string
  response?: string
  entities?: Record<string, any>
}

export interface ConversationState {
  history: VoiceContext[]
  currentContext: Record<string, any>
  lastCommand: string | null
  lastEntity: Record<string, any> | null
}

export function useVoiceContext(maxHistory: number = 10) {
  const [conversationState, setConversationState] = useState<ConversationState>({
    history: [],
    currentContext: {},
    lastCommand: null,
    lastEntity: null
  })
  
  const contextRef = useRef<Record<string, any>>({})

  // Add new voice interaction to history
  const addToHistory = useCallback((context: VoiceContext) => {
    setConversationState(prev => ({
      ...prev,
      history: [...prev.history.slice(-(maxHistory - 1)), context],
      lastCommand: context.command || prev.lastCommand,
      lastEntity: context.entities || prev.lastEntity
    }))
  }, [maxHistory])

  // Update current context
  const updateContext = useCallback((key: string, value: any) => {
    contextRef.current[key] = value
    setConversationState(prev => ({
      ...prev,
      currentContext: { ...contextRef.current }
    }))
  }, [])

  // Clear context
  const clearContext = useCallback(() => {
    contextRef.current = {}
    setConversationState(prev => ({
      ...prev,
      currentContext: {},
      lastCommand: null,
      lastEntity: null
    }))
  }, [])

  // Get context value
  const getContext = useCallback((key: string) => {
    return contextRef.current[key]
  }, [])

  // Process contextual voice command
  const processContextualCommand = useCallback((transcript: string): { command: string; entities: Record<string, any> } => {
    const lower = transcript.toLowerCase()
    const { lastCommand, lastEntity, currentContext } = conversationState

    // Contextual pronouns resolution
    let resolvedTranscript = transcript
    let entities: Record<string, any> = {}

    // Replace pronouns with context
    if (lower.includes('it') || lower.includes('that') || lower.includes('this')) {
      if (lastEntity?.property) {
        resolvedTranscript = resolvedTranscript.replace(/\b(it|that|this)\b/gi, lastEntity.property)
        entities.property = lastEntity.property
      } else if (lastEntity?.tenant) {
        resolvedTranscript = resolvedTranscript.replace(/\b(it|that|this)\b/gi, lastEntity.tenant)
        entities.tenant = lastEntity.tenant
      } else if (currentContext.selectedItem) {
        resolvedTranscript = resolvedTranscript.replace(/\b(it|that|this)\b/gi, currentContext.selectedItem)
        entities.item = currentContext.selectedItem
      }
    }

    // Handle follow-up patterns
    if (lower.startsWith('and ') || lower.startsWith('also ')) {
      // This is a follow-up to the last command
      if (lastCommand) {
        const followUp = transcript.replace(/^(and|also)\s+/i, '')
        resolvedTranscript = `${lastCommand} ${followUp}`
      }
    }

    // Extract entities from resolved transcript
    const propertyMatch = resolvedTranscript.match(/(?:for|at|in)\s+(.+?)(?:\s|$)/i)
    if (propertyMatch) {
      entities.property = propertyMatch[1]
    }

    const tenantMatch = resolvedTranscript.match(/(?:tenant|resident)\s+(.+?)(?:\s|$)/i)
    if (tenantMatch) {
      entities.tenant = tenantMatch[1]
    }

    return {
      command: resolvedTranscript,
      entities
    }
  }, [conversationState])

  // Check if command needs clarification
  const needsClarification = useCallback((transcript: string): string | null => {
    const lower = transcript.toLowerCase()
    
    // Check for ambiguous references without context
    if ((lower.includes('it') || lower.includes('that')) && !conversationState.lastEntity) {
      return "What are you referring to? Please specify the property or tenant."
    }

    if (lower.includes('there') && !conversationState.currentContext.selectedProperty) {
      return "Which property are you referring to?"
    }

    if (lower.includes('them') && !conversationState.lastEntity?.tenants) {
      return "Which tenants are you referring to?"
    }

    return null
  }, [conversationState])

  return {
    conversationState,
    addToHistory,
    updateContext,
    clearContext,
    getContext,
    processContextualCommand,
    needsClarification
  }
}
