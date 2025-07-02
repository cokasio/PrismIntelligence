import { useEffect, useCallback } from 'react'

interface VoiceCommand {
  pattern: RegExp
  action: (match: RegExpMatchArray) => void
}

export function useVoiceCommands(commands: Record<string, (params?: any) => void>) {
  const voiceCommands: VoiceCommand[] = [
    // Navigation commands
    {
      pattern: /show inbox/i,
      action: () => commands.showInbox?.()
    },
    {
      pattern: /what's new|what is new/i,
      action: () => commands.showNewItems?.()
    },
    
    // Property queries
    {
      pattern: /delinquent rent(?:\s+(?:for|in|at)\s+(.+))?/i,
      action: (match) => commands.showDelinquentRent?.(match[1])
    },
    {
      pattern: /maintenance status/i,
      action: () => commands.showMaintenanceQueue?.()
    },
    {
      pattern: /show (?:all\s+)?vacant units?/i,
      action: () => commands.showVacantUnits?.()
    },
    
    // Financial queries
    {
      pattern: /(?:show|review)\s+financial(?:s)?/i,
      action: () => commands.reviewFinancials?.()
    },
    {
      pattern: /budget variance/i,
      action: () => commands.showBudgetVariance?.()
    },
    
    // Tenant queries
    {
      pattern: /tenant complaints?/i,
      action: () => commands.showTenantComplaints?.()
    },
    {
      pattern: /lease(?:s)?\s+expir(?:ing|e)/i,
      action: () => commands.showExpiringLeases?.()
    },
    
    // Actions
    {
      pattern: /create task/i,
      action: () => commands.createTask?.()
    },
    {
      pattern: /schedule (?:an?\s+)?inspection/i,
      action: () => commands.scheduleInspection?.()
    },
    {
      pattern: /schedule maintenance/i,
      action: () => commands.scheduleMaintenance?.()
    }
  ]

  const processVoiceCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.trim().toLowerCase()
    
    for (const command of voiceCommands) {
      const match = normalizedTranscript.match(command.pattern)
      if (match) {
        command.action(match)
        return true
      }
    }
    
    return false
  }, [commands])

  return { processVoiceCommand }
}

// Helper hook for voice synthesis
export function useVoiceSynthesis() {
  const speak = useCallback((text: string, options?: SpeechSynthesisUtteranceInit) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      if (options) {
        Object.assign(utterance, options)
      }
      
      // Default voice settings for Prism
      utterance.rate = options?.rate ?? 1.0
      utterance.pitch = options?.pitch ?? 1.0
      utterance.volume = options?.volume ?? 1.0
      
      // Try to use a female voice if available
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria')
      )
      
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }, [])
  
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])
  
  return { speak, stop }
}
