"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Search, 
  Settings, 
  Terminal as TerminalIcon 
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export function TopNavigation() {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'emails', label: 'Email Processing', icon: Mail, active: true },
    { id: 'analytics', label: 'Analytics', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="h-12 border-b bg-card flex items-center justify-between px-4">
      {/* Left - Tab Navigation */}
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={tab.active ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Icon className="h-3 w-3 mr-2" />
                {tab.label}
                {tab.id === 'emails' && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Center - Current Context */}
      <div className="flex items-center space-x-2">
        <div className="text-sm text-muted-foreground">
          Property Intelligence Platform
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <TerminalIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
