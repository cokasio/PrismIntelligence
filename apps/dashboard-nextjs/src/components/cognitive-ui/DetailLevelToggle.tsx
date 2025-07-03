import React from 'react'
import { motion } from 'framer-motion'
import { ToggleLeft, ToggleRight, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { useDetailLevel, DetailLevel } from '@/contexts/DetailLevelContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DetailLevelToggleProps {
  className?: string
  showLabel?: boolean
}

export function DetailLevelToggle({ className = '', showLabel = true }: DetailLevelToggleProps) {
  const { detailLevel, setDetailLevel } = useDetailLevel()

  const levels: { value: DetailLevel; label: string; description: string }[] = [
    { value: 'summary', label: 'Summary', description: 'Quick overview' },
    { value: 'business', label: 'Business', description: 'Business context' },
    { value: 'technical', label: 'Technical', description: 'Full technical details' }
  ]

  const currentLevel = levels.find(l => l.value === detailLevel)!

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">Detail:</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Info className="h-3 w-3" />
            {currentLevel.label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {levels.map((level) => (
            <DropdownMenuItem
              key={level.value}
              onClick={() => setDetailLevel(level.value)}
              className={detailLevel === level.value ? 'bg-accent' : ''}
            >
              <div>
                <div className="font-medium">{level.label}</div>
                <div className="text-xs text-gray-500">{level.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Inline toggle for Less/More
interface LessMoreToggleProps {
  expanded: boolean
  onToggle: () => void
  className?: string
}

export function LessMoreToggle({ expanded, onToggle, className = '' }: LessMoreToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${className}`}
    >
      {expanded ? (
        <>
          <ChevronUp className="h-3 w-3" />
          Less
        </>
      ) : (
        <>
          <ChevronDown className="h-3 w-3" />
          More
        </>
      )}
    </button>
  )
}

// Adaptive content component
interface AdaptiveContentProps {
  summary: string | React.ReactNode
  business: string | React.ReactNode
  technical: string | React.ReactNode
  className?: string
}

export function AdaptiveContent({ summary, business, technical, className = '' }: AdaptiveContentProps) {
  const { detailLevel } = useDetailLevel()
  
  const content = {
    summary,
    business,
    technical
  }

  return (
    <motion.div
      key={detailLevel}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {content[detailLevel]}
    </motion.div>
  )
}
