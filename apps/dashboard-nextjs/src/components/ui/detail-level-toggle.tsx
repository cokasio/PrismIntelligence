import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, FileText, Briefcase, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DetailLevel = 'summary' | 'business' | 'technical'

interface DetailLevelToggleProps {
  className?: string
  onLevelChange?: (level: DetailLevel) => void
  defaultLevel?: DetailLevel
  storePreference?: boolean
}

export function DetailLevelToggle({ 
  className, 
  onLevelChange,
  defaultLevel = 'summary',
  storePreference = true
}: DetailLevelToggleProps) {
  const [level, setLevel] = useState<DetailLevel>(defaultLevel)

  useEffect(() => {
    if (storePreference) {
      const stored = localStorage.getItem('prism-detail-level') as DetailLevel
      if (stored) {
        setLevel(stored)
        onLevelChange?.(stored)
      }
    }
  }, [])

  const handleLevelChange = (newLevel: DetailLevel) => {
    setLevel(newLevel)
    onLevelChange?.(newLevel)
    if (storePreference) {
      localStorage.setItem('prism-detail-level', newLevel)
    }
  }

  const levelConfig = {
    summary: { icon: FileText, label: 'Summary', color: 'text-blue-600' },
    business: { icon: Briefcase, label: 'Business', color: 'text-green-600' },
    technical: { icon: Code, label: 'Technical', color: 'text-purple-600' }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-500">Detail Level:</span>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {Object.entries(levelConfig).map(([key, config]) => {
          const Icon = config.icon
          const isActive = level === key
          return (
            <Button
              key={key}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLevelChange(key as DetailLevel)}
              className={cn(
                "h-7 px-2 gap-1",
                isActive && config.color
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs">{config.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface LayeredContentProps {
  summary: string | React.ReactNode
  business: string | React.ReactNode
  technical: string | React.ReactNode
  className?: string
  showToggle?: boolean
}

export function LayeredContent({ 
  summary, 
  business, 
  technical, 
  className,
  showToggle = true 
}: LayeredContentProps) {
  const [level, setLevel] = useState<DetailLevel>('summary')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('prism-detail-level') as DetailLevel
    if (stored) setLevel(stored)
  }, [])

  const content = {
    summary,
    business,
    technical
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showToggle && (
        <div className="flex items-center justify-between">
          <DetailLevelToggle onLevelChange={setLevel} defaultLevel={level} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>Less <ChevronUp className="w-3 h-3 ml-1" /></>
            ) : (
              <>More <ChevronDown className="w-3 h-3 ml-1" /></>
            )}
          </Button>
        </div>
      )}
      
      <div className={cn(
        "prose prose-sm max-w-none transition-all",
        !isExpanded && "line-clamp-3"
      )}>
        {content[level]}
      </div>
    </div>
  )
}

// Hook for using detail level throughout the app
export function useDetailLevel() {
  const [level, setLevel] = useState<DetailLevel>('summary')

  useEffect(() => {
    const stored = localStorage.getItem('prism-detail-level') as DetailLevel
    if (stored) setLevel(stored)

    const handleStorageChange = () => {
      const newLevel = localStorage.getItem('prism-detail-level') as DetailLevel
      if (newLevel) setLevel(newLevel)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return level
}
