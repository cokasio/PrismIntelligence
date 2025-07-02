import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Paperclip, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  className?: string
}

export function VoiceInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask me anything or say 'Hey Prism'...",
  className
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSupported(true)
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
        
        onChange(transcript)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [onChange])

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="flex-1 relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pr-24 bg-gray-50 border-gray-200"
        />
        
        {/* Voice Visualizer */}
        {isListening && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 voice-visualizer">
            <div className="voice-bar" style={{ height: '4px' }} />
            <div className="voice-bar" style={{ height: '8px' }} />
            <div className="voice-bar" style={{ height: '12px' }} />
            <div className="voice-bar" style={{ height: '8px' }} />
            <div className="voice-bar" style={{ height: '4px' }} />
          </div>
        )}
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={toggleListening}
            disabled={!isSupported}
            title={isSupported ? "Voice input" : "Voice input not supported"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
            ) : (
              <Mic className={cn("w-4 h-4", isSupported ? "text-gray-600 hover:text-blue-600" : "text-gray-300")} />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="w-4 h-4 text-gray-600 hover:text-blue-600" />
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={onSubmit}
        disabled={!value.trim()}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}

// Voice command hints component
export function VoiceCommandHints() {
  const commands = [
    "Show delinquent rent",
    "What's new today?",
    "Schedule maintenance",
    "Review financials",
    "Tenant complaints"
  ]
  
  return (
    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
      <span>Try:</span>
      {commands.slice(0, 3).map((command, index) => (
        <button 
          key={index}
          className="hover:text-blue-600 transition-colors"
          onClick={() => console.log(`Command: ${command}`)}
        >
          "{command}"
        </button>
      ))}
    </div>
  )
}
