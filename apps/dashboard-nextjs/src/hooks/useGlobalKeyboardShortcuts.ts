import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ShortcutHandlers {
  onAccept?: () => void
  onReject?: () => void
  onShowWhy?: () => void
  onFocusSearch?: () => void
  onToggleHelp?: () => void
  onNavigateInbox?: () => void
  onToggleDetails?: () => void
  onCreateTask?: () => void
  onEscape?: () => void
}

export function useGlobalKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const router = useRouter()

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      // Only handle Escape in inputs
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur()
        handlers.onEscape?.()
      }
      return
    }

    // Command/Ctrl shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          handlers.onFocusSearch?.()
          break
        case 'd':
          event.preventDefault()
          handlers.onToggleDetails?.()
          break
        case 'n':
          event.preventDefault()
          handlers.onCreateTask?.()
          break
      }
      return
    }

    // Single key shortcuts
    switch (event.key.toLowerCase()) {
      case 'a':
        event.preventDefault()
        handlers.onAccept?.()
        toast.success('Insight accepted', { duration: 2000 })
        break
      case 'r':
        event.preventDefault()
        handlers.onReject?.()
        toast.error('Insight rejected', { duration: 2000 })
        break
      case 'w':
        event.preventDefault()
        handlers.onShowWhy?.()
        break
      case '/':
        event.preventDefault()
        handlers.onFocusSearch?.()
        break
      case '?':
        event.preventDefault()
        handlers.onToggleHelp?.()
        break
      case 'i':
        event.preventDefault()
        handlers.onNavigateInbox?.()
        router.push('/inbox')
        break
      case 'escape':
        handlers.onEscape?.()
        break
    }
  }, [handlers, router])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return {
    shortcuts: [
      { key: 'A', description: 'Accept current insight' },
      { key: 'R', description: 'Reject current insight' },
      { key: 'W', description: 'Show why (explanation)' },
      { key: '/', description: 'Focus search' },
      { key: '?', description: 'Show keyboard shortcuts' },
      { key: 'I', description: 'Go to inbox' },
      { key: 'Ctrl+K', description: 'Command palette' },
      { key: 'Ctrl+D', description: 'Toggle details' },
      { key: 'Ctrl+N', description: 'Create new task' },
      { key: 'Esc', description: 'Close/Cancel' }
    ]
  }
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { shortcuts } = useGlobalKeyboardShortcuts()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-600">{description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
