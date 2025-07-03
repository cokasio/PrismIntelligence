<HTMLElement>,
  handlers: GestureHandlers
) {
  const [isGestureActive, setIsGestureActive] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pinchStartDistanceRef = useRef<number | null>(null)

  // Calculate distance between two touch points
  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsGestureActive(true)
    
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    // Handle pinch start
    if (e.touches.length === 2) {
      pinchStartDistanceRef.current = getDistance(e.touches)
    }

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current && handlers.onLongPress) {
        handlers.onLongPress({
          x: touchStartRef.current.x,
          y: touchStartRef.current.y
        })
      }
    }, 500)
  }, [handlers, getDistance])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle pinch
    if (e.touches.length === 2 && pinchStartDistanceRef.current) {
      const currentDistance = getDistance(e.touches)
      const scale = currentDistance / pinchStartDistanceRef.current
      
      if (handlers.onPinch) {
        handlers.onPinch(scale)
      }
      return
    }

    // Handle pan
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      if (handlers.onPan) {
        handlers.onPan({ x: deltaX, y: deltaY })
      }
    }
  }, [handlers, getDistance])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const touch = e.changedTouches[0]
    const endTime = Date.now()
    
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: endTime
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = endTime - touchStartRef.current.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Detect swipe (fast movement over distance)
    if (distance > 50 && deltaTime < 300) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      
      let direction: 'up' | 'down' | 'left' | 'right'
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      if (handlers.onSwipe) {
        handlers.onSwipe(direction, distance)
      }
    }
    // Detect tap/double tap (minimal movement, quick)
    else if (distance < 10 && deltaTime < 200) {
      const position = { x: touch.clientX, y: touch.clientY }
      
      // Check for double tap
      if (endTime - lastTapRef.current < 300) {
        if (handlers.onDoubleTap) {
          handlers.onDoubleTap(position)
        }
        lastTapRef.current = 0
      } else {
        if (handlers.onTap) {
          handlers.onTap(position)
        }
        lastTapRef.current = endTime
      }
    }

    // Reset
    touchStartRef.current = null
    pinchStartDistanceRef.current = null
    setIsGestureActive(false)
  }, [handlers])

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isGestureActive,
    supportedGestures: [
      'swipe (up/down/left/right)',
      'pinch (zoom)',
      'tap',
      'double tap',
      'long press',
      'pan (drag)'
    ]
  }
}

// Gesture feedback component
export function GestureFeedback({ gesture }: { gesture: GestureEvent | null }) {
  if (!gesture) return null

  const getGestureIcon = () => {
    switch (gesture.type) {
      case 'swipe':
        return gesture.direction === 'left' || gesture.direction === 'right' ? '↔️' : '↕️'
      case 'pinch':
        return gesture.scale && gesture.scale > 1 ? '🔍+' : '🔍-'
      case 'tap':
        return '👆'
      case 'doubleTap':
        return '👆👆'
      case 'longPress':
        return '⏰'
      case 'pan':
        return '✋'
      default:
        return '👆'
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg animate-fade-in-out">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getGestureIcon()}</span>
        <span className="capitalize">{gesture.type}</span>
        {gesture.direction && <span>({gesture.direction})</span>}
      </div>
    </div>
  )
}