import { create } from 'zustand'
import { ProcessedEmail, TabItem, WorkspaceView } from '@/types'

interface WorkspaceStore {
  // Current view state
  currentView: WorkspaceView
  setCurrentView: (view: WorkspaceView) => void
  
  // Tab management
  tabs: TabItem[]
  activeTabId: string | null
  addTab: (tab: Omit<TabItem, 'id' | 'isActive'>) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<TabItem>) => void
  
  // Panel states
  leftPanelWidth: number
  rightPanelWidth: number
  terminalHeight: number
  isTerminalOpen: boolean
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  setTerminalHeight: (height: number) => void
  toggleTerminal: () => void
  
  // Email state
  emails: ProcessedEmail[]
  selectedEmail: ProcessedEmail | null
  setEmails: (emails: ProcessedEmail[]) => void
  addEmail: (email: ProcessedEmail) => void
  setSelectedEmail: (email: ProcessedEmail | null) => void
  updateEmail: (id: string, updates: Partial<ProcessedEmail>) => void
  
  // Mode state
  isDemoMode: boolean
  setDemoMode: (demo: boolean) => void
  
  // UI state
  commandBarOpen: boolean
  setCommandBarOpen: (open: boolean) => void
}

export const useWorkspace = create<WorkspaceStore>((set, get) => ({
  // Initial state
  currentView: { type: 'files' },
  tabs: [],
  activeTabId: null,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  terminalHeight: 200,
  isTerminalOpen: false,
  emails: [],
  selectedEmail: null,
  isDemoMode: true,
  commandBarOpen: false,
  
  // View actions
  setCurrentView: (view) => set({ currentView: view }),
  
  // Tab actions
  addTab: (tabData) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newTab: TabItem = {
      ...tabData,
      id,
      isActive: true,
    }
    
    set((state) => ({
      tabs: state.tabs.map(tab => ({ ...tab, isActive: false })).concat(newTab),
      activeTabId: id,
    }))
  },
  
  removeTab: (tabId) => {
    set((state) => {
      const newTabs = state.tabs.filter(tab => tab.id !== tabId)
      const wasActive = state.activeTabId === tabId
      
      if (wasActive && newTabs.length > 0) {
        const newActiveTab = newTabs[newTabs.length - 1]
        newActiveTab.isActive = true
        return {
          tabs: newTabs,
          activeTabId: newActiveTab.id,
        }
      }
      
      return {
        tabs: newTabs,
        activeTabId: newTabs.length > 0 ? state.activeTabId : null,
      }
    })
  },
  
  setActiveTab: (tabId) => {
    set((state) => ({
      tabs: state.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      })),
      activeTabId: tabId,
    }))
  },
  
  updateTab: (tabId, updates) => {
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      ),
    }))
  },
  
  // Panel actions
  setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
  setTerminalHeight: (height) => set({ terminalHeight: height }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  
  // Email actions
  setEmails: (emails) => set({ emails }),
  
  addEmail: (email) => {
    set((state) => ({
      emails: [email, ...state.emails],
    }))
  },
  
  setSelectedEmail: (email) => {
    set({ selectedEmail: email })
    
    // Auto-create tab for email if not exists
    if (email) {
      const { tabs, addTab } = get()
      const existingTab = tabs.find(tab => 
        tab.type === 'email' && tab.content?.id === email.id
      )
      
      if (!existingTab) {
        addTab({
          title: email.customerInfo.company,
          type: 'email',
          content: email,
        })
      }
    }
  },
  
  updateEmail: (id, updates) => {
    set((state) => ({
      emails: state.emails.map(email =>
        email.id === id ? { ...email, ...updates } : email
      ),
    }))
  },
  
  // Mode actions
  setDemoMode: (demo) => set({ isDemoMode: demo }),
  
  // UI actions
  setCommandBarOpen: (open) => set({ commandBarOpen: open }),
}))