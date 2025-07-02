"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Search, 
  Settings, 
  Terminal as TerminalIcon,
  Upload,
  BarChart3,
  List
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: List, path: '/tasks' },
    { id: 'upload', label: 'Upload', icon: Upload, path: '/upload' },
    { id: 'roi', label: 'ROI Dashboard', icon: BarChart3, path: '/roi' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'emails', label: 'Emails', icon: Mail, path: '/emails' },
    { id: 'properties', label: 'Properties', icon: FileText, path: '/properties' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const isTabActive = (tabPath: string) => {
    return pathname.startsWith(tabPath)
  }

  return (
    <div className="h-12 border-b bg-card flex items-center justify-between px-4">
      {/* Left - Tab Navigation */}
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = isTabActive(tab.path)
          
          return (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => router.push(tab.path)}
              >
                <Icon className="h-3 w-3 mr-2" />
                {tab.label}
                {isActive && (
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
          Prism Intelligence Platform
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
