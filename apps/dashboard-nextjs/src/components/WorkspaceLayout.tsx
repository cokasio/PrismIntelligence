"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from 'react-resizable-panels'
import { LeftSidebar } from './LeftSidebar'
import { MainPanel } from './MainPanel'
import { RightPanel } from './RightPanel'
import { TopNavigation } from './TopNavigation'
import { CommandBar } from './CommandBar'
import { Terminal } from './Terminal'

export type ViewType = 'files' | 'emails' | 'chat'
export type EmailData = {
  id: string
  customerInfo: {
    company: string
    slug: string
    email: string
  }
  emailData: {
    headers: {
      subject: string
      from: string
      date: string
    }
    plain: string
    attachments?: any[]
  }
  analysis: {
    summary: string
    keyMetrics: any
    insights: string[]
    actions: string[]
    priority: number
    confidence: number
  }
  processedAt: string
  mode: 'demo' | 'live'
}

export function WorkspaceLayout() {
  const [currentView, setCurrentView] = useState<ViewType>('emails')
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null)
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  const handleEmailSelect = (email: EmailData) => {
    setSelectedEmail(email)
    setCurrentView('emails')
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Workspace */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <LeftSidebar 
              currentView={currentView}
              onViewChange={setCurrentView}
              onEmailSelect={handleEmailSelect}
              selectedEmailId={selectedEmail?.id}
            />
          </ResizablePanel>
          
          <ResizableHandle className="w-px bg-border" />
          
          {/* Main Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <MainPanel 
                currentView={currentView}
                selectedEmail={selectedEmail}
              />
              
              {/* Terminal */}
              {isTerminalOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 200 }}
                  exit={{ height: 0 }}
                  className="border-t bg-muted/50"
                >
                  <Terminal onClose={() => setIsTerminalOpen(false)} />
                </motion.div>
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-px bg-border" />
          
          {/* Right Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <RightPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Command Bar */}
      <CommandBar 
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
      />
    </div>
  )
}
