"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Mail, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { EmailsTab } from './EmailsTab'
import { FilesTab } from './FilesTab'
import { ChatTab } from './ChatTab'
import type { ViewType, EmailData } from './WorkspaceLayout'

interface LeftSidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onEmailSelect: (email: EmailData) => void
  selectedEmailId?: string
}

export function LeftSidebar({ 
  currentView, 
  onViewChange, 
  onEmailSelect, 
  selectedEmailId 
}: LeftSidebarProps) {
  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FileText },
    { id: 'emails' as const, label: 'Emails', icon: Mail },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  ]

  const renderTabContent = () => {
    switch (currentView) {
      case 'files':
        return <FilesTab />
      case 'emails':
        return (
          <EmailsTab 
            onSelectEmail={onEmailSelect}
            selectedEmailId={selectedEmailId}
          />
        )
      case 'chat':
        return <ChatTab />
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Tab Headers */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentView === tab.id
          
          return (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="w-full h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                onClick={() => onViewChange(tab.id)}
                data-state={isActive ? 'active' : 'inactive'}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}
