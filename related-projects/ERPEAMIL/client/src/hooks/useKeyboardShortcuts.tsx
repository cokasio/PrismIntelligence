import { useEffect, useState, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  handler: KeyHandler;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const [activeShortcuts, setActiveShortcuts] = useState<Shortcut[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === '?' && event.shiftKey) {
        setIsHelpVisible(prev => !prev);
        event.preventDefault();
        return;
      }
      
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        
        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          return;
        }
      }
    },
    [shortcuts]
  );
  
  useEffect(() => {
    setActiveShortcuts(shortcuts);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, handleKeyDown]);
  
  const KeyboardShortcutsHelp = () => {
    if (!isHelpVisible) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1B2951] rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-[#1B2951] p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#1B2951] dark:text-white">Keyboard Shortcuts</h2>
            <button 
              onClick={() => setIsHelpVisible(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-2 text-sm text-gray-700 dark:text-gray-300">
                Press <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">?</kbd> anytime to show/hide this help
              </div>
            </div>
            
            <div className="space-y-1">
              {activeShortcuts.map((shortcut, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.ctrlKey && (
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Ctrl</kbd>
                    )}
                    {shortcut.altKey && (
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Alt</kbd>
                    )}
                    {shortcut.shiftKey && (
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Shift</kbd>
                    )}
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">{shortcut.key.toUpperCase()}</kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return {
    KeyboardShortcutsHelp,
    showShortcutsHelp: () => setIsHelpVisible(true),
    hideShortcutsHelp: () => setIsHelpVisible(false),
    toggleShortcutsHelp: () => setIsHelpVisible(prev => !prev),
  };
};

export default useKeyboardShortcuts;