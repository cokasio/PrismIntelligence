import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface CognitiveLoadMetrics {
  taskSwitches: number
  errorCount: number
  timeOnTask: number
  clicksPerMinute: number
  scrollSpeed: number
  pauseDuration: number
  backtrackCount: number
}

interface CognitiveLoadState {
  currentLoad: number // 0-100
  metrics: CognitiveLoadMetrics
  loadLevel: 'low' | 'medium' | 'high' | 'overload'
  recommendations: string[]
  shouldSimplify: boolean
}

export function useCognitiveLoadMonitor() {
  const [state, setState] = useState<CognitiveLoadState>({
    currentLoad: 0,
    metrics: {
      taskSwitches: 0,
      errorCount: 0,
      timeOnTask: 0,
      clicksPerMinute: 0,
      scrollSpeed: 0,
      pauseDuration: 0,
      backtrackCount: 0
    },
    loadLevel: 'low',
    recommendations: [],
    shouldSimplify: false
  })

  const clickTimestamps = useRef<number[]>([])
  const lastActionTime = useRef<number>(Date.now())
  const taskStartTime = useRef<number>(Date.now())
  const lastScrollY = useRef<number>(0)
  const lastScrollTime = useRef<number>(Date.now())

  // Calculate cognitive load from metrics
  const calculateLoad = useCallback((metrics: CognitiveLoadMetrics): number => {
    let load = 0

    // High click rate indicates confusion or frustration
    if (metrics.clicksPerMinute > 30) load += 20
    else if (metrics.clicksPerMinute > 20) load += 10

    // Many task switches indicate difficulty focusing
    load += Math.min(metrics.taskSwitches * 5, 25)

    // Errors directly increase cognitive load
    load += Math.min(metrics.errorCount * 10, 30)

    // Long pauses might indicate confusion
    if (metrics.pauseDuration > 5000) load += 15
    else if (metrics.pauseDuration > 3000) load += 10

    // Fast scrolling indicates scanning/searching
    if (metrics.scrollSpeed > 500) load += 10

    // Backtracking indicates confusion
    load += Math.min(metrics.backtrackCount * 8, 20)

    return Math.min(load, 100)
  }, [])

  // Get recommendations based on load
  const getRecommendations = useCallback((load: number, metrics: CognitiveLoadMetrics): string[] => {
    const recs: string[] = []

    if (load > 70) {
      recs.push('Consider taking a short break')
      recs.push('Focus on one task at a time')
    }

    if (metrics.clicksPerMinute > 25) {
      recs.push('Slow down and read the options carefully')
    }

    if (metrics.errorCount > 2) {
      recs.push('Check the help documentation or tooltips')
    }

    if (metrics.taskSwitches > 5) {
      recs.push('Try to complete one task before starting another')
    }

    return recs
  }, [])

  // Track clicks
  const trackClick = useCallback(() => {
    const now = Date.now()
    clickTimestamps.current.push(now)
    
    // Keep only clicks from last minute
    clickTimestamps.current = clickTimestamps.current.filter(
      time => now - time < 60000
    )

    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        clicksPerMinute: clickTimestamps.current.length
      }
    }))
  }, [])

  // Track errors
  const trackError = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        errorCount: prev.metrics.errorCount + 1
      }
    }))
  }, [])

  // Track task switches
  const trackTaskSwitch = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        taskSwitches: prev.metrics.taskSwitches + 1
      }
    }))
  }, [])

  // Track backtracking
  const trackBacktrack = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        backtrackCount: prev.metrics.backtrackCount + 1
      }
    }))
  }, [])

  // Monitor pauses
  useEffect(() => {
    const checkPause = () => {
      const now = Date.now()
      const pauseDuration = now - lastActionTime.current

      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          pauseDuration
        }
      }))
    }

    const interval = setInterval(checkPause, 1000)
    return () => clearInterval(interval)
  }, [])  // Track scroll speed
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const scrollY = window.scrollY
      const timeDiff = now - lastScrollTime.current
      const scrollDiff = Math.abs(scrollY - lastScrollY.current)
      
      const scrollSpeed = timeDiff > 0 ? scrollDiff / timeDiff * 1000 : 0

      lastScrollY.current = scrollY
      lastScrollTime.current = now
      lastActionTime.current = now

      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          scrollSpeed
        }
      }))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Update load calculations
  useEffect(() => {
    const load = calculateLoad(state.metrics)
    const loadLevel = 
      load > 75 ? 'overload' :
      load > 50 ? 'high' :
      load > 25 ? 'medium' : 'low'

    const recommendations = getRecommendations(load, state.metrics)
    const shouldSimplify = load > 60

    setState(prev => ({
      ...prev,
      currentLoad: load,
      loadLevel,
      recommendations,
      shouldSimplify
    }))

    // Alert user if overloaded
    if (loadLevel === 'overload' && state.loadLevel !== 'overload') {
      toast.warning('High cognitive load detected. UI simplified.', {
        duration: 5000
      })
    }
  }, [state.metrics, calculateLoad, getRecommendations, state.loadLevel])

  // Global event tracking
  useEffect(() => {
    const updateActionTime = () => {
      lastActionTime.current = Date.now()
    }

    document.addEventListener('click', trackClick)
    document.addEventListener('click', updateActionTime)
    document.addEventListener('keypress', updateActionTime)

    return () => {
      document.removeEventListener('click', trackClick)
      document.removeEventListener('click', updateActionTime)
      document.removeEventListener('keypress', updateActionTime)
    }
  }, [trackClick])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setState({
      currentLoad: 0,
      metrics: {
        taskSwitches: 0,
        errorCount: 0,
        timeOnTask: 0,
        clicksPerMinute: 0,
        scrollSpeed: 0,
        pauseDuration: 0,
        backtrackCount: 0
      },
      loadLevel: 'low',
      recommendations: [],
      shouldSimplify: false
    })
    clickTimestamps.current = []
    taskStartTime.current = Date.now()
  }, [])

  return {
    ...state,
    trackError,
    trackTaskSwitch,
    trackBacktrack,
    resetMetrics
  }
}

// Cognitive Load Indicator Component
export function CognitiveLoadIndicator() {
  const { currentLoad, loadLevel, recommendations } = useCognitiveLoadMonitor()

  const colors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    overload: 'bg-red-500'
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg max-w-xs">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">Cognitive Load</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${colors[loadLevel]}`}
              style={{ width: `${currentLoad}%` }}
            />
          </div>
        </div>
        <div className="text-2xl font-bold">{currentLoad}%</div>
      </div>
      
      {recommendations.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="font-medium mb-1">Tips:</div>
          <ul className="list-disc list-inside">
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}