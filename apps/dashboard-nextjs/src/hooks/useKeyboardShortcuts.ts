import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[] = []) {
  const [showHelp, setShowHelp] = useState(false)
  const router = useRouter()

  // Default global shortcuts
  const defaultShortcuts: ShortcutConfig[] = [
    {
      key: 'a',
      action: () => {
        const acceptButton = document.querySelector('[data-shortcut="accept"]') as HTMLButtonElement
        acceptButton?.click()
      },
      description: 'Accept current insight'
    },
    {
      key: 'r',
      action: () => {
        const rejectButton = document.querySelector('[data-shortcut="reject"]') as HTMLButtonElement
        rejectButton?.click()
      },
      description: 'Reject current insight'
    },
    {
      key: 'w',
      action: () => {
        const whyButton = document.querySelector('[data-shortcut="why"]') as HTMLButtonElement
        whyButton?.click()
      },
      description: 'Show why explanation'
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('[data-shortcut="search"]') as HTMLInputElement
        searchInput?.focus()
        return false // Prevent default
      },
      description: 'Focus search'
    },
    {
      key: 'Escape',
      action: () => {
        const closeButton = document.querySelector('[data-shortcut="close"]') as HTMLButtonElement
        closeButton?.click()
      },
      description: 'Close modal/panel'
    },
    {
      key: '?',
      shift: true,
      action: () => setShowHelp(!showHelp),
      description: 'Show keyboard shortcuts help'
    },
    {
      key: 'i',
      action: () => router.push('/inbox'),
      description: 'Go to inbox'
    },
    {
      key: 'd',
      action: () => router.push('/dashboard'),
      description: 'Go to dashboard'
    },
    {
      key: 'n',
      action: () => {
        const newButton = document.querySelector('[data-shortcut="new"]') as HTMLButtonElement
        newButton?.click()
      },
      description: 'Create new item'
    },
    {
      key: 'Tab',
      action: () => {
        const panels = document.querySelectorAll('[data-panel]')
        const focused = document.activeElement
        const currentIndex = Array.from(panels).findIndex(p => p.contains(focused))
        const nextIndex = (currentIndex + 1) % panels.length
        const nextPanel = panels[nextIndex] as HTMLElement
        nextPanel.focus()
      },
      description: 'Navigate between panels'
    }
  ]

  const allShortcuts = [...defaultShortcuts, ...shortcuts]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input/textarea
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow slash command even in inputs
      if (event.key !== '/') return
    }

    for (const shortcut of allShortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = !shortcut.ctrl || event.ctrlKey || event.metaKey
      const shiftMatch = !shortcut.shift || event.shiftKey
      const altMatch = !shortcut.alt || event.altKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault()
        const result = shortcut.action()
        if (result === false) {
          event.preventDefault()
        }
        break
      }
    }
  }, [allShortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts: allShortcuts,
    showHelp,
    setShowHelp
  }
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp({ shortcuts, onClose }: { shortcuts: ShortcutConfig[], onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            data-shortcut="close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                {shortcut.ctrl && 'Ctrl+'}
                {shortcut.shift && 'Shift+'}
                {shortcut.alt && 'Alt+'}
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
